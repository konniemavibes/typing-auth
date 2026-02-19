import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Build providers array - only add OAuth if credentials are configured
const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
      async authorize(credentials) {
        try {
          console.log('🔐 [AUTH] Starting credentials provider');
          
          if (!credentials?.email || !credentials?.password) {
            console.error('❌ [AUTH] Missing email or password');
            return null;
          }

          // Normalize email: trim and lowercase
          let email = credentials.email;
          if (typeof email === 'string') {
            email = email.trim().toLowerCase();
          } else {
            console.error('❌ [AUTH] Email is not a string:', typeof email);
            return null;
          }
          
          console.log('🔍 [AUTH] Attempting login for:', email);

          // Try to find user
          let user;
          try {
            user = await prisma.user.findUnique({
              where: { email },
              select: {
                id: true,
                email: true,
                username: true,
                password: true,
                gender: true,
                role: true,
              },
            });
          } catch (dbError) {
            console.error('❌ [AUTH] Database query failed:', dbError.message);
            return null; // Return null instead of throwing
          }

          if (!user) {
            console.warn('⚠️ [AUTH] User not found for email:', email);
            return null;
          }

          console.log('✅ [AUTH] User found:', { id: user.id, email: user.email });

          if (!user.password) {
            console.error('❌ [AUTH] User has no password set:', email);
            return null;
          }

          // Compare passwords
          let isPasswordValid = false;
          try {
            isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            );
          } catch (bcryptError) {
            console.error('❌ [AUTH] Bcrypt comparison failed:', bcryptError.message);
            return null; // Return null instead of throwing
          }

          if (!isPasswordValid) {
            console.warn('⚠️ [AUTH] Invalid password for user:', email);
            return null;
          }

          console.log('✅ [AUTH] Login successful for:', email);

          // Ensure we're returning the proper object
          const result = {
            id: user.id,
            email: user.email,
            name: user.username || user.email,
            username: user.username,
            gender: user.gender,
            role: user.role || 'student',
          };
          
          console.log('✅ [AUTH] Returning user object:', { id: result.id, email: result.email });
          return result;
        } catch (error) {
          console.error('🚨 [AUTH] Unexpected error in authorize:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
          // Always return null, never throw from authorize
          return null;
        }
      },
    }),
];

// Add Google provider only if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ [AUTH] Google OAuth provider enabled');
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
} else {
  console.warn('⚠️ [AUTH] Google OAuth provider disabled - missing credentials');
}

// Add GitHub provider only if credentials are available
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log('✅ [AUTH] GitHub OAuth provider enabled');
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
} else {
  console.warn('⚠️ [AUTH] GitHub OAuth provider disabled - missing credentials');
}

export const authOptions = {
  providers,
  callbacks: {
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.sub;
        if (token.username) session.user.username = token.username;
        if (token.role) session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role || 'student';
      }
      return token;
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log('🔑 [SIGNIN_CALLBACK] Sign in attempt -', {
        provider: account?.provider,
        hasUser: !!user,
        userEmail: user?.email,
      });
      
      // Allow sign in if user is present (credentials provider) or OAuth account exists
      if (user || account) {
        console.log('✅ [SIGNIN_CALLBACK] Allowing sign in');
        return true;
      }
      
      console.error('🔑 [SIGNIN_CALLBACK] Denying sign in - no user or account');
      return false;
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirect URL is safe
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    signOut: "/",
    error: "/auth/error",
  },
};

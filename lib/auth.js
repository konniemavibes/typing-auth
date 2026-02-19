import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

console.log('🔧 [AUTH] Initializing auth config');

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log('🔐 [AUTH] authorize called for:', credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.error('❌ [AUTH] Missing credentials');
            return null;
          }

          const email = credentials.email.trim().toLowerCase();
          
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
            console.error('❌ [AUTH] Database error:', dbError.message);
            return null;
          }

          if (!user) {
            console.log('❌ [AUTH] User not found');
            return null;
          }

          if (!user.password) {
            console.error('❌ [AUTH] No password set');
            return null;
          }

          let isPasswordValid = false;
          try {
            isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            );
          } catch (bcryptError) {
            console.error('❌ [AUTH] Bcrypt error:', bcryptError.message);
            return null;
          }

          if (!isPasswordValid) {
            console.log('❌ [AUTH] Invalid password');
            return null;
          }

          console.log('✅ [AUTH] Authorization successful');
          return {
            id: user.id,
            email: user.email,
            name: user.username || user.email,
            username: user.username,
            gender: user.gender,
            role: user.role || 'student',
          };
        } catch (error) {
          console.error('🚨 [AUTH] Authorize error:', error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      console.log('📊 [AUTH] session callback');
      if (token && session?.user) {
        session.user.id = token.sub;
        if (token.username) session.user.username = token.username;
        if (token.role) session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      console.log('🔑 [AUTH] jwt callback, user:', !!user);
      if (user) {
        token.sub = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role || 'student';
      }
      return token;
    },
    async signIn({ user, account }) {
      console.log('🔑 [AUTH] signIn callback');
      if (user || account) {
        return true;
      }
      return false;
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

console.log('✅ [AUTH] Config initialized');

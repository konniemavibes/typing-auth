import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('❌ Missing email or password');
            return null;
          }

          // Normalize email: trim and lowercase
          const email = credentials.email.trim().toLowerCase();
          console.log('🔍 Attempting login for:', email);

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              username: true,
              password: true,
              gender: true,
            },
          });

          if (!user) {
            console.error('❌ User not found:', email);
            return null;
          }

          if (!user.password) {
            console.error('❌ User has no password set:', email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error('❌ Invalid password for:', email);
            return null;
          }

          console.log('✅ Login successful for:', email);
          return {
            id: user.id,
            email: user.email,
            name: user.username || user.email,
            username: user.username,
            gender: user.gender,
          };
        } catch (error) {
          console.error('🚨 Auth error:', error.message);
          console.error('Full error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.sub;
        if (token.username) session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    signOut: "/",
  },
};

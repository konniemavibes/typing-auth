import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log('🚀 NextAuth route initialized');
console.log('📝 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('🔑 NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing');
console.log('🗄️  DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
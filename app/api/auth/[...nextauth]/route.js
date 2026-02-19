import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log('🚀 [NEXTAUTH_ROUTE] Initializing NextAuth route');
console.log('📝 [NEXTAUTH_ROUTE] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('🔑 [NEXTAUTH_ROUTE] NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing');
console.log('🗄️  [NEXTAUTH_ROUTE] DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
console.log('📦 [NEXTAUTH_ROUTE] Providers count:', authOptions.providers?.length || 0);

// Create the NextAuth handler
const handler = NextAuth(authOptions);

console.log('✅ [NEXTAUTH_ROUTE] NextAuth handler created');

// Export for App Router
export { handler as GET, handler as POST };
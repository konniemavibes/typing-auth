import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log('🚀 NextAuth route initialized');
console.log('📝 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('🔑 NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ Set' : '✗ Missing');
console.log('🗄️  DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');

const handler = NextAuth(authOptions);

// Export handlers for all HTTP methods
export { handler as GET, handler as POST, handler as DELETE, handler as PUT, handler as PATCH };

// Export for OPTIONS (CORS preflight)
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
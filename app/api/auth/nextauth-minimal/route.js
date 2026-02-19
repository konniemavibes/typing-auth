import NextAuth from "next-auth";
import { authOptionsMinimal } from "@/lib/auth-minimal";

console.log('🚀 [NEXTAUTH_MINIMAL_ROUTE] Creating handler with minimal auth config');

const handler = NextAuth(authOptionsMinimal);

console.log('✅ [NEXTAUTH_MINIMAL_ROUTE] Handler created');

export { handler as GET, handler as POST };

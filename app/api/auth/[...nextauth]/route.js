import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log('🚀 [ROUTE] NextAuth route module loading');

let handler;
try {
  handler = NextAuth(authOptions);
  console.log('✅ [ROUTE] NextAuth handler created successfully');
} catch (error) {
  console.error('🚨 [ROUTE] Failed to create NextAuth handler:', error);
  throw error;
}

async function GET(request) {
  try {
    console.log('📨 [ROUTE] GET request to NextAuth');
    return handler(request);
  } catch (error) {
    console.error('🚨 [ROUTE] GET error:', error.message, error.stack);
    throw error;
  }
}

async function POST(request) {
  try {
    console.log('📨 [ROUTE] POST request to NextAuth');
    return handler(request);
  } catch (error) {
    console.error('🚨 [ROUTE] POST error:', error.message, error.stack);
    throw error;
  }
}

export { GET, POST };
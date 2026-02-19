import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Create or reuse Prisma client instance
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Store in global for reuse (development only - production is stateless)
if (process.env.NODE_ENV === 'development' && !globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
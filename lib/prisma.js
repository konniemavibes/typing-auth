import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Create Prisma client with optimizations
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Reuse client in development to avoid connection exhaustion
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection pooling for production
if (process.env.NODE_ENV === 'production') {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma;
  }
}

export default prisma;
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

// Create Prisma client with error handling
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // In production, still cache but don't re-create per request
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma;
  }
}

// Test connection on startup
if (process.env.NODE_ENV === 'production') {
  prisma.$connect()
    .then(() => console.log('✅ Prisma connected to MongoDB'))
    .catch((err) => console.error('❌ Prisma connection error:', err.message));
}

export default prisma;
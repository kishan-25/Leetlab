import { PrismaClient } from '../generated/prisma/index.js';

const globalForPrisma = globalThis;

// Use `globalThis.prisma`, not `globalThis`
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const db = prisma;

import { PrismaClient } from '../generated/prisma'

// Prisma Client instance with global singleton pattern
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to ensure Prisma Client is properly initialized
export const ensurePrisma = () => {
    if (!prisma) {
        throw new Error('Prisma client is not initialized')
    }
    return prisma
}

// Type definitions for Prisma Client
export type PrismaClientType = typeof prisma

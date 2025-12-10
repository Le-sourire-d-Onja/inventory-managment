import { PrismaClient } from '@/lib/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({});

export const prisma = new PrismaClient({ adapter });


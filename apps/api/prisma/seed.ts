import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const SYSTEM_CATEGORIES: { name: string; icon: string; color: string }[] = [
  { name: 'Alimentation', icon: '🛒', color: '#F59E0B' },
  { name: 'Restaurants', icon: '🍽️', color: '#F97316' },
  { name: 'Transport', icon: '🚗', color: '#3B82F6' },
  { name: 'Logement', icon: '🏠', color: '#8B5CF6' },
  { name: 'Loisirs', icon: '🎉', color: '#EC4899' },
  { name: 'Santé', icon: '⚕️', color: '#10B981' },
  { name: 'Assurances', icon: '🛡️', color: '#6B7280' },
  { name: 'Abonnements', icon: '📱', color: '#2563EB' },
  { name: 'Shopping', icon: '🛍️', color: '#D946EF' },
  { name: 'Autre', icon: '⚪', color: '#9CA3AF' },
];

async function main() {
  for (const category of SYSTEM_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name, isSystem: true },
    });

    if (existing) {
      console.log(`Déjà présente : ${category.name}`);
      continue;
    }

    await prisma.category.create({
      data: { ...category, isSystem: true, userId: null },
    });
    console.log(`Créée : ${category.name}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

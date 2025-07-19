// scripts/test-prisma.ts

import { PrismaClient } from '@/lib/generated/prisma'; // update this path if needed

const prisma = new PrismaClient();

async function main() {
  // Example query: fetch all products
  const products = await prisma.products.findMany();
  console.log('Fetched products:', products);
}

main()
  .catch((e) => {
    console.error('Error querying database:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

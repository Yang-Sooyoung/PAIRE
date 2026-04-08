import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const drinks = await prisma.drink.findMany({
    where: {
      name: {
        in: ['Aperol Spritz', 'Daiquiri', 'Mojito', 'Grapefruit Green Tea', 'Berry Hibiscus Iced Tea'],
      },
    },
    select: { id: true, name: true, type: true, image: true },
  });
  console.log(JSON.stringify(drinks, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);

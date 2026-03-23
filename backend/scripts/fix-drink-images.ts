import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 음료별 이미지 매핑 (images.unsplash.com CDN URL)
const DRINK_IMAGE_MAP: Record<string, string> = {
  'Aperol Spritz': 'https://images.unsplash.com/photo-1570598912132-0ba1dc952b7d?w=400&h=600&fit=crop',
  'Daiquiri':      'https://images.unsplash.com/photo-1618924385085-aa725b876250?w=400&h=600&fit=crop',
  'Mojito':        'https://images.unsplash.com/photo-1653542772393-71ffa417b1c4?w=400&h=600&fit=crop',
};

async function main() {
  console.log('Starting drink image update...');

  for (const [name, image] of Object.entries(DRINK_IMAGE_MAP)) {
    const result = await prisma.drink.updateMany({
      where: { name },
      data: { image },
    });
    console.log(`Updated "${name}": ${result.count} row(s) -> ${image}`);
  }

  const drinks = await prisma.drink.findMany({
    where: { name: { in: Object.keys(DRINK_IMAGE_MAP) } },
    select: { name: true, image: true, type: true },
  });
  console.log('\nCurrent DB state:');
  drinks.forEach(d => console.log(`  ${d.name} (${d.type}): ${d.image}`));

  await prisma.$disconnect();
}

main().catch(console.error);

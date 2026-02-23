import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('?Œ± Seeding drinks data...');

  // ê¸°ì¡´ ?°ì´???? œ
  await prisma.drink.deleteMany();

  // ?Œë£Œ ?°ì´??ì¶”ê?
  const drinks = [
    // ?€??- ?¤íŒŒ?´ë§
    {
      name: 'Champagne',
      type: 'sparkling',
      description: '?°ì•„??ê¸°í¬ê°ê³¼ ? ì„ ??ë§?,
      tastingNotes: ['fruity', 'elegant', 'light'],
      image: null,
      price: '??0,000',
      foodPairings: ['seafood', 'pasta', 'cheese', 'dessert'],
      occasions: ['date', 'gathering'],
      tastes: ['sweet', 'light'],
    },
    // ?€??- ?ˆë“œ
    {
      name: 'Pinot Noir',
      type: 'red wine',
      description: 'ë¶€?œëŸ¬???„ë‹Œê³??°ì•„???°ë?',
      tastingNotes: ['fruity', 'elegant', 'medium'],
      image: null,
      price: '??5,000',
      foodPairings: ['meat', 'fish', 'mushroom', 'cheese'],
      occasions: ['date', 'gathering', 'solo-drinking'],
      tastes: ['bitter', 'medium'],
    },
    {
      name: 'Merlot',
      type: 'red wine',
      description: 'ë¶€?œëŸ½ê³??ë???ë§?,
      tastingNotes: ['fruity', 'smooth', 'medium'],
      image: null,
      price: '??0,000',
      foodPairings: ['meat', 'pasta', 'cheese'],
      occasions: ['date', 'gathering', 'solo-drinking'],
      tastes: ['sweet', 'medium'],
    },
    {
      name: 'Cabernet Sauvignon',
      type: 'red wine',
      description: 'ì§„í•˜ê³?ë³µì¡??ë§?,
      tastingNotes: ['bold', 'complex', 'heavy'],
      image: null,
      price: '??5,000',
      foodPairings: ['meat', 'steak', 'cheese'],
      occasions: ['date', 'gathering', 'solo-drinking'],
      tastes: ['bitter', 'heavy'],
    },
    // ?€??- ?”ì´??
    {
      name: 'Sauvignon Blanc',
      type: 'white wine',
      description: '?í¼???°ë??€ ? ì„ ???ë?',
      tastingNotes: ['crisp', 'light', 'fresh'],
      image: null,
      price: '??5,000',
      foodPairings: ['seafood', 'salad', 'vegetable', 'cheese'],
      occasions: ['date', 'gathering', 'camping'],
      tastes: ['sour', 'light'],
    },
    {
      name: 'Riesling',
      type: 'white wine',
      description: '?¬ì½¤??ë§›ê³¼ ? ì„ ???°ë?',
      tastingNotes: ['sweet', 'fruity', 'light'],
      image: null,
      price: '??8,000',
      foodPairings: ['seafood', 'spicy', 'dessert', 'cheese'],
      occasions: ['date', 'gathering'],
      tastes: ['sweet', 'light'],
    },
    {
      name: 'Chardonnay',
      type: 'white wine',
      description: '?ë???ë§›ê³¼ ë¶€?œëŸ¬???°ë?',
      tastingNotes: ['rich', 'smooth', 'medium'],
      image: null,
      price: '??2,000',
      foodPairings: ['seafood', 'pasta', 'cheese', 'chicken'],
      occasions: ['date', 'gathering'],
      tastes: ['sweet', 'medium'],
    },
    // ì°?
    {
      name: 'Oolong Tea',
      type: 'tea',
      description: 'ê¹Šì? ë§›ê³¼ ?°ì•„????,
      tastingNotes: ['floral', 'smooth', 'elegant'],
      image: null,
      price: '??,000',
      foodPairings: ['meat', 'fish', 'cheese', 'dessert'],
      occasions: ['date', 'gathering', 'solo-meal'],
      tastes: ['bitter', 'medium'],
    },
    {
      name: 'Green Tea',
      type: 'tea',
      description: '? ì„ ???ë??€ ê°€ë²¼ìš´ ë§?,
      tastingNotes: ['fresh', 'light', 'grassy'],
      image: null,
      price: '??,000',
      foodPairings: ['seafood', 'vegetable', 'light dishes'],
      occasions: ['solo-meal', 'gathering'],
      tastes: ['light', 'sour'],
    },
    {
      name: 'Black Tea',
      type: 'tea',
      description: 'ì§„í•˜ê³??ë???ë§?,
      tastingNotes: ['bold', 'rich', 'smooth'],
      image: null,
      price: '??,000',
      foodPairings: ['meat', 'cheese', 'dessert'],
      occasions: ['solo-meal', 'gathering'],
      tastes: ['bitter', 'medium'],
    },
    // ë¹„ì•Œì½?
    {
      name: 'Sparkling Water',
      type: 'non-alcoholic',
      description: '?í¼??ê¸°í¬ê°ê³¼ ê¹”ë”??ë§?,
      tastingNotes: ['light', 'fresh', 'clean'],
      image: null,
      price: '??,000',
      foodPairings: ['all'],
      occasions: ['all'],
      tastes: ['light'],
    },
    {
      name: 'Ginger Ale',
      type: 'non-alcoholic',
      description: '?ê°•???¥ê³¼ ?í¼??ë§?,
      tastingNotes: ['spicy', 'fresh', 'light'],
      image: null,
      price: '??,000',
      foodPairings: ['spicy', 'meat', 'seafood'],
      occasions: ['gathering', 'solo-meal'],
      tastes: ['sour', 'light'],
    },
    {
      name: 'Kombucha',
      type: 'non-alcoholic',
      description: 'ë°œíš¨??ë§›ê³¼ ê±´ê°•???´ë?ì§€',
      tastingNotes: ['tangy', 'light', 'fresh'],
      image: null,
      price: '??,000',
      foodPairings: ['light dishes', 'vegetable', 'seafood'],
      occasions: ['solo-meal', 'gathering'],
      tastes: ['sour', 'light'],
    },
    {
      name: 'Fresh Juice',
      type: 'non-alcoholic',
      description: '? ì„ ??ê³¼ì¼??ë§?,
      tastingNotes: ['fruity', 'sweet', 'light'],
      image: null,
      price: '??,000',
      foodPairings: ['dessert', 'light dishes'],
      occasions: ['solo-meal', 'gathering'],
      tastes: ['sweet', 'light'],
    },
    // ?„ìŠ¤??
    {
      name: 'Single Malt Whisky',
      type: 'whisky',
      description: 'ë³µì¡?˜ê³  ?°ì•„??ë§?,
      tastingNotes: ['complex', 'smooth', 'elegant'],
      image: null,
      price: '??0,000',
      foodPairings: ['meat', 'cheese', 'chocolate'],
      occasions: ['solo-drinking', 'gathering'],
      tastes: ['bitter', 'heavy'],
    },
    {
      name: 'Bourbon',
      type: 'whisky',
      description: '?¬ì½¤?˜ê³  ?ë???ë§?,
      tastingNotes: ['sweet', 'rich', 'smooth'],
      image: null,
      price: '??5,000',
      foodPairings: ['meat', 'cheese', 'dessert'],
      occasions: ['solo-drinking', 'gathering'],
      tastes: ['sweet', 'medium'],
    },
    // ì¹µí…Œ??
    {
      name: 'Mojito',
      type: 'cocktail',
      description: '?í¼??ë¯¼íŠ¸?€ ?¼ì„??ì¡°í™”',
      tastingNotes: ['fresh', 'light', 'fruity'],
      image: null,
      price: '??5,000',
      foodPairings: ['seafood', 'light dishes', 'spicy'],
      occasions: ['date', 'gathering', 'camping'],
      tastes: ['sweet', 'light'],
    },
    {
      name: 'Margarita',
      type: 'cocktail',
      description: '?í¼???¼ì„ê³??Œí‚¬?¼ì˜ ì¡°í™”',
      tastingNotes: ['crisp', 'fruity', 'light'],
      image: null,
      price: '??4,000',
      foodPairings: ['spicy', 'seafood', 'cheese'],
      occasions: ['date', 'gathering'],
      tastes: ['sour', 'light'],
    },
    {
      name: 'Old Fashioned',
      type: 'cocktail',
      description: '?´ë˜?í•˜ê³??°ì•„??ë§?,
      tastingNotes: ['bold', 'smooth', 'elegant'],
      image: null,
      price: '??6,000',
      foodPairings: ['meat', 'cheese', 'chocolate'],
      occasions: ['solo-drinking', 'gathering'],
      tastes: ['bitter', 'medium'],
    },
  ];

  for (const drink of drinks) {
    await prisma.drink.create({
      data: drink,
    });
  }

  console.log(`??Created ${drinks.length} drinks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


// ì¶”ê? ?Œë£Œ ?°ì´???ì„± (ì´?200ê°??´ìƒ)
const additionalDrinks = [];

// ?ˆë“œ ?€??ì¶”ê? (50ê°?
const redWineNames = ['Pinot Noir', 'Merlot', 'Cabernet Sauvignon', 'Syrah', 'Malbec'];
for (let i = 0; i < 50; i++) {
  additionalDrinks.push({
    name: `${redWineNames[i % 5]} ${2015 + Math.floor(i / 10)}`,
    type: 'red wine',
    description: '?ë????„ë‹Œê³?ë³µí•©?ì¸ ë§?,
    tastingNotes: ['fruity', 'bold', i % 3 === 0 ? 'heavy' : 'medium'],
    image: null,
    price: `??{40000 + (i * 2000)}`,
    foodPairings: ['meat', 'steak', 'cheese'],
    occasions: ['date', 'gathering', 'solo-drinking'],
    tastes: [i % 2 === 0 ? 'bitter' : 'sweet', i % 3 === 0 ? 'heavy' : 'medium'],
  });
}

// ?”ì´???€??ì¶”ê? (50ê°?
const whiteWineNames = ['Sauvignon Blanc', 'Chardonnay', 'Riesling', 'Pinot Grigio', 'Moscato'];
for (let i = 0; i < 50; i++) {
  additionalDrinks.push({
    name: `${whiteWineNames[i % 5]} ${2016 + Math.floor(i / 10)}`,
    type: 'white wine',
    description: '?í¼???°ë??€ ? ì„ ???ë?',
    tastingNotes: ['crisp', 'light', 'fresh'],
    image: null,
    price: `??{35000 + (i * 1500)}`,
    foodPairings: ['seafood', 'salad', 'cheese', 'light dishes'],
    occasions: ['date', 'gathering', 'camping'],
    tastes: [i % 2 === 0 ? 'sweet' : 'sour', 'light'],
  });
}

// ?„ìŠ¤??ì¶”ê? (30ê°?
const whiskeyNames = ['Single Malt', 'Bourbon', 'Rye', 'Irish Whiskey', 'Japanese Whisky'];
for (let i = 0; i < 30; i++) {
  additionalDrinks.push({
    name: `${whiskeyNames[i % 5]} ${10 + i} Years`,
    type: 'whisky',
    description: 'ë³µì¡?˜ê³  ?°ì•„??ë§?,
    tastingNotes: ['complex', 'smooth', 'elegant'],
    image: null,
    price: `??{50000 + (i * 5000)}`,
    foodPairings: ['meat', 'cheese', 'chocolate', 'dessert'],
    occasions: ['solo-drinking', 'gathering'],
    tastes: [i % 2 === 0 ? 'sweet' : 'bitter', i % 3 === 0 ? 'heavy' : 'medium'],
  });
}

// ì¹µí…Œ??ì¶”ê? (30ê°?
const cocktailNames = ['Mojito', 'Margarita', 'Old Fashioned', 'Negroni', 'Manhattan', 'Martini', 'Daiquiri', 'Whiskey Sour', 'Cosmopolitan', 'Aperol Spritz'];
for (let i = 0; i < 30; i++) {
  additionalDrinks.push({
    name: `${cocktailNames[i % 10]} ${i > 9 ? 'Premium' : 'Classic'}`,
    type: 'cocktail',
    description: '?í¼?˜ê³  ê· í˜•?¡íŒ ë§?,
    tastingNotes: ['fresh', 'balanced', 'fruity'],
    image: null,
    price: `??{12000 + (i * 1000)}`,
    foodPairings: i % 2 === 0 ? ['seafood', 'light dishes'] : ['spicy', 'meat'],
    occasions: ['date', 'gathering', 'camping'],
    tastes: [i % 2 === 0 ? 'sweet' : 'sour', 'light'],
  });
}

// ì°?ì¶”ê? (20ê°?
const teaNames = ['Green Tea', 'Black Tea', 'Oolong Tea', 'White Tea', 'Pu-erh Tea'];
for (let i = 0; i < 20; i++) {
  additionalDrinks.push({
    name: `${teaNames[i % 5]} Premium ${i + 1}`,
    type: 'tea',
    description: 'ê¹Šì? ë§›ê³¼ ?°ì•„????,
    tastingNotes: ['floral', 'smooth', 'elegant'],
    image: null,
    price: `??{6000 + (i * 500)}`,
    foodPairings: ['light dishes', 'dessert', 'cheese'],
    occasions: ['solo-meal', 'gathering'],
    tastes: [i % 2 === 0 ? 'bitter' : 'sweet', i % 3 === 0 ? 'medium' : 'light'],
  });
}

// ë¹„ì•Œì½??Œë£Œ ì¶”ê? (20ê°?
const nonAlcNames = ['Sparkling Water', 'Kombucha', 'Fresh Juice', 'Mocktail', 'Iced Tea'];
for (let i = 0; i < 20; i++) {
  additionalDrinks.push({
    name: `${nonAlcNames[i % 5]} ${i + 1}`,
    type: 'non-alcoholic',
    description: '?í¼?˜ê³  ê±´ê°•??ë§?,
    tastingNotes: ['fresh', 'light', 'clean'],
    image: null,
    price: `??{5000 + (i * 500)}`,
    foodPairings: ['all'],
    occasions: ['all'],
    tastes: ['light'],
  });
}

// ëª¨ë“  ?Œë£Œ ?ì„±
for (const drink of [...drinks, ...additionalDrinks]) {
  await prisma.drink.create({
    data: drink,
  });
}

const totalCount = drinks.length + additionalDrinks.length;
console.log(`??Created ${totalCount} drinks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

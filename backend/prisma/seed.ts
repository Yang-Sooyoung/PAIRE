import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding drinks data...');

  // 기존 데이터 삭제
  await prisma.drink.deleteMany();

  // 음료 데이터 추가
  const drinks = [
    // 와인 - 스파클링
    {
      name: 'Champagne',
      type: 'sparkling',
      description: '우아한 기포감과 신선한 맛',
      tastingNotes: ['fruity', 'elegant', 'light'],
      image: 'https://via.placeholder.com/300x400?text=Champagne',
      price: '₩50,000',
      foodPairings: ['seafood', 'pasta', 'cheese', 'dessert'],
      occasions: ['date', 'gathering'],
      tastes: ['sweet', 'light'],
    },
    // 와인 - 레드
    {
      name: 'Pinot Noir',
      type: 'red wine',
      description: '부드러운 탄닌과 우아한 산미',
      tastingNotes: ['fruity', 'elegant', 'medium'],
      image: 'https://via.placeholder.com/300x400?text=Pinot+Noir',
      price: '₩45,000',
      foodPairings: ['meat', 'fish', 'mushroom', 'cheese'],
      occasions: ['date', 'gathering', 'solo-drinking'],
      tastes: ['bitter', 'medium'],
    },
    {
      name: 'Merlot',
      type: 'red wine',
      description: '부드럽고 풍부한 맛',
      tastingNotes: ['fruity', 'smooth', 'medium'],
      image: 'https://via.placeholder.com/300x400?text=Merlot',
      price: '₩40,000',
      foodPairings: ['meat', 'pasta', 'cheese'],
      occasions: ['date', 'gathering', 'solo-drinking'],
      tastes: ['sweet', 'medium'],
    },
    {
      name: 'Cabernet Sauvignon',
      type: 'red wine',
      description: '진하고 복잡한 맛',
      tastingNotes: ['bold', 'complex', 'heavy'],
      image: 'https://via.placeholder.com/300x400?text=Cabernet+Sauvignon',
      price: '₩55,000',
      foodPairings: ['meat', 'steak', 'cheese'],
      occasions: ['date', 'gathering', 'solo-drinking'],
      tastes: ['bitter', 'heavy'],
    },
    // 와인 - 화이트
    {
      name: 'Sauvignon Blanc',
      type: 'white wine',
      description: '상큼한 산미와 신선한 풍미',
      tastingNotes: ['crisp', 'light', 'fresh'],
      image: 'https://via.placeholder.com/300x400?text=Sauvignon+Blanc',
      price: '₩35,000',
      foodPairings: ['seafood', 'salad', 'vegetable', 'cheese'],
      occasions: ['date', 'gathering', 'camping'],
      tastes: ['sour', 'light'],
    },
    {
      name: 'Riesling',
      type: 'white wine',
      description: '달콤한 맛과 신선한 산미',
      tastingNotes: ['sweet', 'fruity', 'light'],
      image: 'https://via.placeholder.com/300x400?text=Riesling',
      price: '₩38,000',
      foodPairings: ['seafood', 'spicy', 'dessert', 'cheese'],
      occasions: ['date', 'gathering'],
      tastes: ['sweet', 'light'],
    },
    {
      name: 'Chardonnay',
      type: 'white wine',
      description: '풍부한 맛과 부드러운 산미',
      tastingNotes: ['rich', 'smooth', 'medium'],
      image: 'https://via.placeholder.com/300x400?text=Chardonnay',
      price: '₩42,000',
      foodPairings: ['seafood', 'pasta', 'cheese', 'chicken'],
      occasions: ['date', 'gathering'],
      tastes: ['sweet', 'medium'],
    },
    // 차
    {
      name: 'Oolong Tea',
      type: 'tea',
      description: '깊은 맛과 우아한 향',
      tastingNotes: ['floral', 'smooth', 'elegant'],
      image: 'https://via.placeholder.com/300x400?text=Oolong+Tea',
      price: '₩8,000',
      foodPairings: ['meat', 'fish', 'cheese', 'dessert'],
      occasions: ['date', 'gathering', 'solo-meal'],
      tastes: ['bitter', 'medium'],
    },
    {
      name: 'Green Tea',
      type: 'tea',
      description: '신선한 풍미와 가벼운 맛',
      tastingNotes: ['fresh', 'light', 'grassy'],
      image: 'https://via.placeholder.com/300x400?text=Green+Tea',
      price: '₩6,000',
      foodPairings: ['seafood', 'vegetable', 'light dishes'],
      occasions: ['solo-meal', 'gathering'],
      tastes: ['light', 'sour'],
    },
    {
      name: 'Black Tea',
      type: 'tea',
      description: '진하고 풍부한 맛',
      tastingNotes: ['bold', 'rich', 'smooth'],
      image: 'https://via.placeholder.com/300x400?text=Black+Tea',
      price: '₩7,000',
      foodPairings: ['meat', 'cheese', 'dessert'],
      occasions: ['solo-meal', 'gathering'],
      tastes: ['bitter', 'medium'],
    },
    // 비알콜
    {
      name: 'Sparkling Water',
      type: 'non-alcoholic',
      description: '상큼한 기포감과 깔끔한 맛',
      tastingNotes: ['light', 'fresh', 'clean'],
      image: 'https://via.placeholder.com/300x400?text=Sparkling+Water',
      price: '₩5,000',
      foodPairings: ['all'],
      occasions: ['all'],
      tastes: ['light'],
    },
    {
      name: 'Ginger Ale',
      type: 'non-alcoholic',
      description: '생강의 향과 상큼한 맛',
      tastingNotes: ['spicy', 'fresh', 'light'],
      image: 'https://via.placeholder.com/300x400?text=Ginger+Ale',
      price: '₩6,000',
      foodPairings: ['spicy', 'meat', 'seafood'],
      occasions: ['gathering', 'solo-meal'],
      tastes: ['sour', 'light'],
    },
    {
      name: 'Kombucha',
      type: 'non-alcoholic',
      description: '발효된 맛과 건강한 이미지',
      tastingNotes: ['tangy', 'light', 'fresh'],
      image: 'https://via.placeholder.com/300x400?text=Kombucha',
      price: '₩8,000',
      foodPairings: ['light dishes', 'vegetable', 'seafood'],
      occasions: ['solo-meal', 'gathering'],
      tastes: ['sour', 'light'],
    },
    {
      name: 'Fresh Juice',
      type: 'non-alcoholic',
      description: '신선한 과일의 맛',
      tastingNotes: ['fruity', 'sweet', 'light'],
      image: 'https://via.placeholder.com/300x400?text=Fresh+Juice',
      price: '₩9,000',
      foodPairings: ['dessert', 'light dishes'],
      occasions: ['solo-meal', 'gathering'],
      tastes: ['sweet', 'light'],
    },
    // 위스키
    {
      name: 'Single Malt Whisky',
      type: 'whisky',
      description: '복잡하고 우아한 맛',
      tastingNotes: ['complex', 'smooth', 'elegant'],
      image: 'https://via.placeholder.com/300x400?text=Single+Malt+Whisky',
      price: '₩60,000',
      foodPairings: ['meat', 'cheese', 'chocolate'],
      occasions: ['solo-drinking', 'gathering'],
      tastes: ['bitter', 'heavy'],
    },
    {
      name: 'Bourbon',
      type: 'whisky',
      description: '달콤하고 풍부한 맛',
      tastingNotes: ['sweet', 'rich', 'smooth'],
      image: 'https://via.placeholder.com/300x400?text=Bourbon',
      price: '₩45,000',
      foodPairings: ['meat', 'cheese', 'dessert'],
      occasions: ['solo-drinking', 'gathering'],
      tastes: ['sweet', 'medium'],
    },
    // 칵테일
    {
      name: 'Mojito',
      type: 'cocktail',
      description: '상큼한 민트와 라임의 조화',
      tastingNotes: ['fresh', 'light', 'fruity'],
      image: 'https://via.placeholder.com/300x400?text=Mojito',
      price: '₩15,000',
      foodPairings: ['seafood', 'light dishes', 'spicy'],
      occasions: ['date', 'gathering', 'camping'],
      tastes: ['sweet', 'light'],
    },
    {
      name: 'Margarita',
      type: 'cocktail',
      description: '상큼한 라임과 테킬라의 조화',
      tastingNotes: ['crisp', 'fruity', 'light'],
      image: 'https://via.placeholder.com/300x400?text=Margarita',
      price: '₩14,000',
      foodPairings: ['spicy', 'seafood', 'cheese'],
      occasions: ['date', 'gathering'],
      tastes: ['sour', 'light'],
    },
    {
      name: 'Old Fashioned',
      type: 'cocktail',
      description: '클래식하고 우아한 맛',
      tastingNotes: ['bold', 'smooth', 'elegant'],
      image: 'https://via.placeholder.com/300x400?text=Old+Fashioned',
      price: '₩16,000',
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

  console.log(`✅ Created ${drinks.length} drinks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  // 추가 음료 데이터 생성 (총 200개 이상)
  const additionalDrinks = [];

  // 레드 와인 추가 (50개)
  const redWineNames = ['Pinot Noir', 'Merlot', 'Cabernet Sauvignon', 'Syrah', 'Malbec'];
  for (let i = 0; i < 50; i++) {
    additionalDrinks.push({
      name: `${redWineNames[i % 5]} ${2015 + Math.floor(i / 10)}`,
      type: 'red wine',
      description: '풍부한 탄닌과 복합적인 맛',
      tastingNotes: ['fruity', 'bold', i % 3 === 0 ? 'heavy' : 'medium'],
      image: null,
      price: `₩${40000 + (i * 2000)}`,
      foodPairings: ['meat', 'steak', 'cheese'],
      occasions: ['date', 'gathering', 'solo-drinking'],
      tastes: [i % 2 === 0 ? 'bitter' : 'sweet', i % 3 === 0 ? 'heavy' : 'medium'],
    });
  }

  // 화이트 와인 추가 (50개)
  const whiteWineNames = ['Sauvignon Blanc', 'Chardonnay', 'Riesling', 'Pinot Grigio', 'Moscato'];
  for (let i = 0; i < 50; i++) {
    additionalDrinks.push({
      name: `${whiteWineNames[i % 5]} ${2016 + Math.floor(i / 10)}`,
      type: 'white wine',
      description: '상큼한 산미와 신선한 풍미',
      tastingNotes: ['crisp', 'light', 'fresh'],
      image: null,
      price: `₩${35000 + (i * 1500)}`,
      foodPairings: ['seafood', 'salad', 'cheese', 'light dishes'],
      occasions: ['date', 'gathering', 'camping'],
      tastes: [i % 2 === 0 ? 'sweet' : 'sour', 'light'],
    });
  }

  // 위스키 추가 (30개)
  const whiskeyNames = ['Single Malt', 'Bourbon', 'Rye', 'Irish Whiskey', 'Japanese Whisky'];
  for (let i = 0; i < 30; i++) {
    additionalDrinks.push({
      name: `${whiskeyNames[i % 5]} ${10 + i} Years`,
      type: 'whisky',
      description: '복잡하고 우아한 맛',
      tastingNotes: ['complex', 'smooth', 'elegant'],
      image: null,
      price: `₩${50000 + (i * 5000)}`,
      foodPairings: ['meat', 'cheese', 'chocolate', 'dessert'],
      occasions: ['solo-drinking', 'gathering'],
      tastes: [i % 2 === 0 ? 'sweet' : 'bitter', i % 3 === 0 ? 'heavy' : 'medium'],
    });
  }

  // 칵테일 추가 (30개)
  const cocktailNames = ['Mojito', 'Margarita', 'Old Fashioned', 'Negroni', 'Manhattan', 'Martini', 'Daiquiri', 'Whiskey Sour', 'Cosmopolitan', 'Aperol Spritz'];
  for (let i = 0; i < 30; i++) {
    additionalDrinks.push({
      name: `${cocktailNames[i % 10]} ${i > 9 ? 'Premium' : 'Classic'}`,
      type: 'cocktail',
      description: '상큼하고 균형잡힌 맛',
      tastingNotes: ['fresh', 'balanced', 'fruity'],
      image: null,
      price: `₩${12000 + (i * 1000)}`,
      foodPairings: i % 2 === 0 ? ['seafood', 'light dishes'] : ['spicy', 'meat'],
      occasions: ['date', 'gathering', 'camping'],
      tastes: [i % 2 === 0 ? 'sweet' : 'sour', 'light'],
    });
  }

  // 차 추가 (20개)
  const teaNames = ['Green Tea', 'Black Tea', 'Oolong Tea', 'White Tea', 'Pu-erh Tea'];
  for (let i = 0; i < 20; i++) {
    additionalDrinks.push({
      name: `${teaNames[i % 5]} Premium ${i + 1}`,
      type: 'tea',
      description: '깊은 맛과 우아한 향',
      tastingNotes: ['floral', 'smooth', 'elegant'],
      image: null,
      price: `₩${6000 + (i * 500)}`,
      foodPairings: ['light dishes', 'dessert', 'cheese'],
      occasions: ['solo-meal', 'gathering'],
      tastes: [i % 2 === 0 ? 'bitter' : 'sweet', i % 3 === 0 ? 'medium' : 'light'],
    });
  }

  // 비알콜 음료 추가 (20개)
  const nonAlcNames = ['Sparkling Water', 'Kombucha', 'Fresh Juice', 'Mocktail', 'Iced Tea'];
  for (let i = 0; i < 20; i++) {
    additionalDrinks.push({
      name: `${nonAlcNames[i % 5]} ${i + 1}`,
      type: 'non-alcoholic',
      description: '상큼하고 건강한 맛',
      tastingNotes: ['fresh', 'light', 'clean'],
      image: null,
      price: `₩${5000 + (i * 500)}`,
      foodPairings: ['all'],
      occasions: ['all'],
      tastes: ['light'],
    });
  }

  // 모든 음료 생성
  for (const drink of [...drinks, ...additionalDrinks]) {
    await prisma.drink.create({
      data: drink,
    });
  }

  const totalCount = drinks.length + additionalDrinks.length;
  console.log(`✅ Created ${totalCount} drinks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

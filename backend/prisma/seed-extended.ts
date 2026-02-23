import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 음료 템플릿 생성 함수
function generateDrinks() {
  const drinks = [];

  // 스파클링 와인 (20개)
  const sparklingNames = ['Champagne Brut', 'Prosecco', 'Cava', 'Crémant', 'Franciacorta', 'Sekt', 'Champagne Rosé', 'Asti Spumante', 'Lambrusco', 'Champagne Blanc de Blancs'];
  sparklingNames.forEach((name, i) => {
    drinks.push({
      name: `${name} ${i > 9 ? 'Reserve' : ''}`,
      type: 'sparkling',
      description: '우아한 기포감과 신선한 맛',
      tastingNotes: ['fruity', 'elegant', 'light'],
      image: null,
      price: `₩${35000 + i * 5000}`,
      foodPairings: ['seafood', 'pasta', 'cheese', 'dessert'],
      occasions: ['date', 'gathering'],
      tastes: ['sweet', 'light'],
    });
  });

  // 레드 와인 (50개)
  const redWines = ['Pinot Noir', 'Merlot', 'Cabernet Sauvignon', 'Syrah', 'Malbec', 'Zinfandel', 'Sangiovese', 'Tempranillo', 'Grenache', 'Nebbiolo'];
  for (let i = 0; i < 50; i++) {
    const wine = redWines[i % redWines.length];
    drinks.push({
      name: `${wine} ${Math.floor(i / 10) + 2015}`,
      type: 'red wine',
      description: '풍부한 탄닌과 복합적인 맛',
      tastingNotes: ['fruity', 'bold', i % 3 === 0 ? 'heavy' : 'medium'],
      image: null,
      price: `₩${40000 + (i * 3000)}`,
      foodPairings: ['meat', 'steak', 'cheese', 'pasta'],
      occasions: ['date', 'gathering', 'solo-drinking'],
      tastes: [i % 2 === 0 ? 'bitter' : 'sweet', i % 3 === 0 ? 'heavy' : 'medium'],
    });
  }

  // 화이트 와인 (50개)
  const whiteWines = ['Sauvignon Blanc', 'Chardonnay', 'Riesling', 'Pinot Grigio', 'Gewürztraminer', 'Viognier', 'Albariño', 'Grüner Veltliner'];

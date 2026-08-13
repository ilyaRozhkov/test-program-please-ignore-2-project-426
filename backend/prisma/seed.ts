import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Видеокарты', slug: 'graphics-card' },
    { name: 'Процессоры', slug: 'processors' },
    { name: 'Материнские платы', slug: 'motherboards' },
    { name: 'Оперативная память', slug: 'ram' },
    { name: 'Накопители', slug: 'storage-drives' },
    { name: 'Блоки питания', slug: 'power' },
    { name: 'Корпуса', slug: 'case' },
    { name: 'Охлаждение', slug: 'cooling' },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  const catMap = Object.fromEntries((await prisma.category.findMany()).map(c => [c.slug, c.id]));

  const products = [
    { name: 'RTX 4080 Super', slug: 'rtx-4080-super', description: 'Флагман', price: 120000, available: true, categorySlug: 'graphics-card', imageUrl: 'https://www.regard.ru/api/photo/goods/6477347' },
    { name: 'RX 7900 XTX', slug: 'rx-7900-xtx', description: 'Мощная карта', price: 110000, available: false, categorySlug: 'graphics-card', imageUrl: 'https://www.regard.ru/api/photo/goods/1048379' },

    { name: 'Intel Core i9-14900K', slug: 'i9-14900k', description: 'Топ Intel', price: 65000, available: true, categorySlug: 'processors', imageUrl: 'https://www.regard.ru/api/photo/goods/6003305' },
    { name: 'AMD Ryzen 9 7950X', slug: 'ryzen-7950x', description: 'Флагман AMD', price: 70000, available: false, categorySlug: 'processors', imageUrl: 'https://www.regard.ru/api/site/cacheimg/goods/5968190/358' },

    { name: 'ASUS ROG Maximus Z790', slug: 'asus-z790', description: 'Плата Intel', price: 35000, available: true, categorySlug: 'motherboards', imageUrl: 'https://www.regard.ru/api/photo/goods/6136188' },
    { name: 'MSI MAG B650', slug: 'msi-b650', description: 'Плата AMD', price: 22000, available: true, categorySlug: 'motherboards', imageUrl: 'https://www.regard.ru/api/photo/goods/1026687' },

    { name: 'Kingston Fury 32GB DDR5', slug: 'kingston-ddr5', description: '2x16GB', price: 18000, available: true, categorySlug: 'ram', imageUrl: 'https://www.regard.ru/api/photo/goods/6128819' },
    { name: 'Corsair Vengeance 16GB DDR4', slug: 'corsair-ddr4', description: '2x8GB', price: 9000, available: true, categorySlug: 'ram', imageUrl: 'https://www.regard.ru/api/photo/goods/6222436' },

    { name: 'Samsung 990 Pro 1TB NVMe', slug: 'samsung-990', description: 'SSD', price: 12000, available: true, categorySlug: 'storage-drives', imageUrl: 'https://www.regard.ru/api/photo/goods/1014155' },
    { name: 'WD Blue 2TB SATA SSD', slug: 'wd-blue-sata', description: 'SATA SSD', price: 15000, available: true, categorySlug: 'storage-drives', imageUrl: 'https://www.regard.ru/api/photo/goods/5940047' },

    { name: 'Corsair RM850x', slug: 'corsair-rm850x', description: '850W золото', price: 16000, available: true, categorySlug: 'power', imageUrl: 'https://www.regard.ru/api/photo/goods/240877' },
    { name: 'Seasonic Focus GX-750', slug: 'seasonic-gx750', description: '750W золото', price: 14000, available: true, categorySlug: 'power', imageUrl: 'https://www.regard.ru/api/photo/goods/6203989' },

    { name: 'NZXT H7 Flow', slug: 'nzxt-h7', description: 'Стекло', price: 11000, available: true, categorySlug: 'case', imageUrl: 'https://www.regard.ru/api/photo/goods/6321298' },
    { name: 'Fractal Define 7', slug: 'fractal-define7', description: 'Бесшумный', price: 13000, available: true, categorySlug: 'case', imageUrl: 'https://www.regard.ru/api/photo/goods/182697' },

    { name: 'Noctua NH-D15', slug: 'noctua-nh-d15', description: 'Воздушное', price: 10000, available: true, categorySlug: 'cooling', imageUrl: 'https://www.regard.ru/api/photo/goods/6408352' },
    { name: 'Arctic Liquid Freezer III Pro 360 Black', slug: 'arctic-liquid-freezer-III-pro-360-black', description: 'Жидкостное', price: 22000, available: true, categorySlug: 'cooling', imageUrl: 'https://www.regard.ru/api/photo/goods/6345134' },
  ];

  for (const p of products) {
    const categoryId = catMap[p.categorySlug];
    if (!categoryId) continue;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { name: p.name, description: p.description, price: p.price, available: p.available, imageUrl: p.imageUrl, categoryId },
      create: { name: p.name, slug: p.slug, description: p.description, price: p.price, available: p.available, imageUrl: p.imageUrl, categoryId },
    });
  }

  const available = await prisma.product.findMany({ where: { available: true }, take: 2 });
  if (available.length === 2) {
    await prisma.promoBlock.upsert({
      where: { productId: available[0].id },
      update: { title: 'Супер-акция на RTX 4080', text: 'Только сейчас самая низкая цена!' },
      create: { title: 'Супер-акция на RTX 4080', text: 'Только сейчас самая низкая цена!', productId: available[0].id },
    });
    await prisma.promoBlock.upsert({
      where: { productId: available[1].id },
      update: { title: 'Лучший процессор для игр', text: 'Intel Core i9-14900K – мощь без компромиссов' },
      create: { title: 'Лучший процессор для игр', text: 'Intel Core i9-14900K – мощь без компромиссов', productId: available[1].id },
    });
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
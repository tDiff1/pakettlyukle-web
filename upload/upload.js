import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addContent() {
  const newContent = await prisma.content.create({
    data: {
      page: "Home",           // Sayfa adı
      id: "home_title",   // Benzersiz ID
      content: "Paket TL Yükle ile Kolayca Online Paket & Kontör Yükle"  // İçerik
    }
  });

  console.log("Yeni içerik eklendi:", newContent);
}

addContent()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

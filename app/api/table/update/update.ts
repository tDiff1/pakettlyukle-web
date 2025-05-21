import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Yalnızca PUT istekleri desteklenir.' });
  }

  const { id, key, content, tableName } = req.body;

  if (!id || !key || !content || typeof tableName !== 'string') {
    return res.status(400).json({ message: 'Eksik veya hatalı veri.' });
  }

  try {
    let updated;

    switch (tableName) {
      case 'header':
        updated = await prisma.header.update({
          where: { id },
          data: { key, content },
        });
        break;
      case 'footer':
        updated = await prisma.footer.update({
          where: { id },
          data: { key, content },
        });
        break;
      case 'home':
        updated = await prisma.home.update({
          where: { id },
          data: { key, content },
        });
        break;
      case 'siteinfo':
        updated = await prisma.siteInfo.update({
          where: { id },
          data: { key, content },
        });
        break;
      case 'yasal':
        updated = await prisma.yasal.update({
          where: { id },
          data: { key, content },
        });
        break;
      default:
        return res.status(400).json({ message: 'Geçersiz tablo adı.' });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Güncelleme sırasında hata oluştu.' });
  }
}

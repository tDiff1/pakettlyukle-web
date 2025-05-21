import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const siteInfoData = await prisma.adminInfo.findMany();
    
    return Response.json(siteInfoData, { status: 200 }); 
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
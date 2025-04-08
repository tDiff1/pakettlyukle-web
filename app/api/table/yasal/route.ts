import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const yasalData = await prisma.yasal.findMany();
    
    return Response.json(yasalData, { status: 200 }); 
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
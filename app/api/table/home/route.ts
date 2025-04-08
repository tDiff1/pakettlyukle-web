import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const contents = await prisma.home.findMany();
    
    return Response.json(contents, { status: 200 }); 
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
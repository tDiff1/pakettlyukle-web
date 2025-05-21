import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const operators = await prisma.operators.findMany();
    
    return Response.json(operators, { status: 200 }); 
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
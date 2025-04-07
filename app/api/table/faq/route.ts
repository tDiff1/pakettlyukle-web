import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany();
    
    return Response.json(faqs, { status: 200 }); 
  } catch (error) {
    return Response.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
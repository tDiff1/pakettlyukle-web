import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const packets = await prisma.packets.findMany();
    
    return Response.json(packets, { status: 200 }); 
  } catch (error) {
    return Response.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
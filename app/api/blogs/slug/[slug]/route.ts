  import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
const prisma = new PrismaClient();

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  const params = await context.params;
  const { slug } = params;

  try {
    // Tüm blogları al
    const blogs = await prisma.blog.findMany();
    
    // Slug ile eşleşen ilk blogu bul
    const blog = blogs.find((b) => {
      const slugifiedTitle = slugify(b.blog_title, { lower: true, strict: true });
      return slugifiedTitle === slug;
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog bulunamadı" }, { status: 404 });
    }

    // ID ile blogu çek
    const blogById = await prisma.blog.findUnique({
      where: { id: blog.id },
    });

    if (!blogById) {
      return NextResponse.json({ error: "Blog bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(blogById);
  } catch (error) {
    console.error("Blog getirilirken hata:", error);
    return NextResponse.json(
      { error: "Blog getirilirken hata oluştu" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
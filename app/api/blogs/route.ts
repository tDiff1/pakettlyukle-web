import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("blog_title") as string;
    const description = formData.get("blog_description") as string;
    const image = formData.get("blog_imageUrl") as File | null;
    const frame_title = formData.get("frame_title") as string;
    const frame_url = formData.get("frame_url") as string;

    if (
      !title ||
      !description ||
      typeof title !== "string" ||
      typeof description !== "string"
    ) {
      return NextResponse.json(
        { error: "Başlık ve açıklama zorunludur ve geçerli bir metin olmalı" },
        { status: 400 }
      );
    }

    if (!title.trim() || !description.trim()) {
      return NextResponse.json(
        { error: "Başlık ve açıklama boş olamaz" },
        { status: 400 }
      );
    }

    const existingBlog = await prisma.blog.findFirst({
      where: {
        blog_title: {
          equals: title.toLowerCase(),
        },
      },
    });

    if (existingBlog) {
      return NextResponse.json(
        { error: "Böyle bir başlığa sahip blog zaten var" },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined;
    if (image && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Sadece resim dosyaları yüklenebilir" },
          { status: 400 }
        );
      }
      if (image.size > 4 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Resim boyutu 4MB'ı aşamaz" },
          { status: 400 }
        );
      }

      const filename = `pakettlyukle/blog/${Date.now()}-${image.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const { url } = await put(filename, image, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      imageUrl = url;
    }

    const newBlog = await prisma.blog.create({
      data: {
        blog_title: title,
        blog_description: description,
        blog_imageUrl: imageUrl,
        createdAt: new Date(),
        frame_title: frame_title,
        frame_url: frame_url,
      },
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error("Blog ekleme hatası:", error);
    return NextResponse.json(
      { error: "Blog eklenirken hata oluştu" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    console.error("Blogları getirme hatası:", error);
    return NextResponse.json(
      { error: "Bloglar getirilirken hata oluştu" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { put, del } from "@vercel/blob";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = parseInt(params.id);
  try {
    const formData = await req.formData();
    const title = formData.get("blog_title") as string;
    const description = formData.get("blog_description") as string;
    const imageFile = formData.get("blog_imageUrl") as File | null;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Başlık ve açıklama zorunludur" },
        { status: 400 }
      );
    }

    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return NextResponse.json({ error: "Blog bulunamadı" }, { status: 404 });
    }

    let imageUrl = blog.blog_imageUrl;

    if (imageFile && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Sadece resim dosyaları yüklenebilir" },
          { status: 400 }
        );
      }

      if (imageFile.size > 4 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Resim boyutu 4MB'ı aşamaz" },
          { status: 400 }
        );
      }

      if (blog.blog_imageUrl) {
        try {
          await del(blog.blog_imageUrl);
        } catch (error) {
          console.warn("Eski resim silinirken hata oluştu:", error);
        }
      }

      const filename = `pakettlyukle/blog/${Date.now()}-${imageFile.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const { url } = await put(filename, imageFile, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      imageUrl = url;
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        blog_title: title,
        blog_description: description,
        blog_imageUrl: imageUrl,
      },
    });

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error("Blog güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Blog güncellenirken hata oluştu" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = parseInt(params.id);
  try {
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return NextResponse.json({ error: "Blog bulunamadı" }, { status: 404 });
    }

    if (blog.blog_imageUrl) {
      try {
        await del(blog.blog_imageUrl);
      } catch (error) {
        console.warn("Resim silinirken hata oluştu:", error);
      }
    }

    await prisma.blog.delete({ where: { id } });
    return NextResponse.json({ message: "Blog silindi" });
  } catch (error) {
    console.error("Blog silinirken hata:", error);
    return NextResponse.json(
      { error: "Blog silinirken hata oluştu" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
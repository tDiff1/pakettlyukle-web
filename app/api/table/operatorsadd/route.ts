import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

const prisma = new PrismaClient();

// Utility function to sanitize filenames while preserving Turkish characters (for imageID and key)
const sanitizeFilename = (text: string) =>
  text.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ.-]/g, "_").toLowerCase();

// Utility function to sanitize filenames and convert Turkish characters to English (for idName)
const sanitizeFilenameForId = (text: string) => {
  const turkishToEnglish: { [key: string]: string } = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "C",
    Ğ: "G",
    İ: "I",
    Ö: "O",
    Ş: "S",
    Ü: "U",
  };
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => turkishToEnglish[char] || char)
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .toLowerCase();
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const companyCode = formData.get("companyCode") as string;
    const image = formData.get("image") as File;

    // Validate required fields
    if (!name || !companyCode || !image) {
      return NextResponse.json(
        { message: "Tüm alanlar zorunludur" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { message: "Yalnızca PNG, JPEG, JPG ve GIF formatları desteklenir" },
        { status: 400 }
      );
    }

    // Validate image size (5MB limit)
    if (image.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Resim boyutu 4MB'ı aşamaz" },
        { status: 400 }
      );
    }

    // Convert companyCode to integer
    const companyCodeInt = parseInt(companyCode, 10);
    if (isNaN(companyCodeInt)) {
      return NextResponse.json(
        { message: "Şirket Kodu geçerli bir sayı olmalıdır" },
        { status: 400 }
      );
    }

    // Generate slug for idName (Turkish to English)
    const idSlug = sanitizeFilenameForId(name);
    // Generate slug for imageID and key (keep Turkish characters)
    const slug = sanitizeFilename(name);
    const key = `${slug}_properties`;

    // Check if key already exists
    const existingOperator = await prisma.operators.findUnique({
      where: { key },
    });
    if (existingOperator) {
      return NextResponse.json(
        { message: "Bu operatör adına sahip bir kayıt zaten mevcut" },
        { status: 400 }
      );
    }

    // Define image filename for Vercel Blob
    const imageName = `pakettlyukle/operatorler/${slug}_logo.png`;
    const { url } = await put(imageName, image, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false, // No random suffix
      allowOverwrite: true, // Overwrite if exists
    });

    // Decode the filename to preserve Turkish characters
    const filename = decodeURIComponent(
      url.split("/").pop() || `${slug}_logo.png`
    );

    // Create the operator in the database
    const operator = await prisma.operators.create({
      data: {
        key,
        name,
        idName: idSlug, // Store English-converted slug (e.g., kibriscell)
        imageID: filename, // Store filename with Turkish characters
        CompanyCode: companyCodeInt,
        aktiflik: 1,
      },
    });

    return NextResponse.json(operator, { status: 201 });
  } catch (error) {
    console.error("Operatör ekleme hatası:", error);
    return NextResponse.json(
      { message: "Operatör eklenemedi" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const operators = await prisma.operators.findMany();
    return NextResponse.json(operators);
  } catch (error) {
    console.error("Operatörleri alma hatası:", error);
    return NextResponse.json(
      { message: "Operatörler alınamadı" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

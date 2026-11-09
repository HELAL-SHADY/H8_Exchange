import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using environment variables with safe fallback
cloudinary.config({
  cloud_name:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    "dk2laxr0h",
  api_key: process.env.CLOUDINARY_API_KEY || "152822788443423",
  api_secret: process.env.CLOUDINARY_API_SECRET || "PSmCuEn_TWtMfj3ZebrTy3YqHzQ",
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار أي ملف" }, { status: 400 });
    }

    // Max 10MB file limit
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "حجم الملف كبير جداً، الحد الأقصى المسموح به هو 10 ميجابايت" },
        { status: 400 }
      );
    }

    // Validate MIME types
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "image/gif",
      "application/pdf",
    ];

    if (file.type && !validMimes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. الصيغ المدعومة: JPG, PNG, WEBP, PDF" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUri = `data:${mimeType};base64,${base64}`;

    const isPdf = mimeType.includes("pdf");
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "h8_exchange_receipts",
      resource_type: isPdf ? "raw" : "image",
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error("Error uploading file to Cloudinary:", error);
    return NextResponse.json(
      { error: error.message || "فشل تحميل المستند أو الإيصال. يرجى المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}

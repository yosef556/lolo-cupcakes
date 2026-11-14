import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "لم يتم اختيار أي ملف" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create unique timestamp
    const ext = path.extname(file.name) || ".png";
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueName = `img_${Date.now()}_${baseName}${ext}`;

    let publicUrl = `/uploads/${uniqueName}`;
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filePath = path.join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);
    } catch {
      // In serverless environments like Vercel with read-only root, serve as base64 data URI
      const mime = file.type || "image/png";
      publicUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      url: publicUrl,
      fileName: uniqueName
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء حفظ الملف على السيرفر" },
      { status: 500 }
    );
  }
}

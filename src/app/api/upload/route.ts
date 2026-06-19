import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const files: Record<string, string> = {};
    const uploadDir = join(process.cwd(), "public", "uploads");

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    for (const [key, value] of Array.from(data.entries())) {
      if (value instanceof File) {
        const bytes = await value.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const cleanName = value.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const filename = `${Date.now()}-${cleanName}`;
        const path = join(uploadDir, filename);

        await writeFile(path, buffer);

        // Store the public URL path that the client can use
        files[key] = `/uploads/${filename}`;
      }
    }

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

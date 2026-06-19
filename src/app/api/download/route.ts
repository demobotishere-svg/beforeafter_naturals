import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const file = searchParams.get("file");
  
  if (!file) {
    return new NextResponse("File parameter is required", { status: 400 });
  }
  
  try {
    const filePath = join(process.cwd(), "public", "outputs", file);
    
    if (!existsSync(filePath)) {
      return new NextResponse("Video is still rendering or not found", { status: 404 });
    }

    const buffer = await readFile(filePath);
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="Salon-Cinematic-Edit.mp4"`,
      },
    });
  } catch (err) {
    console.error("Download error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

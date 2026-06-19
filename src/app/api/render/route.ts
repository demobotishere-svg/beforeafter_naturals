import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";
import { join } from "path";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { videoUrls, templateId = "cinematic" } = await request.json();

    if (!videoUrls || videoUrls.length !== 4) {
      return NextResponse.json({ success: false, error: "Must provide exactly 4 video URLs" }, { status: 400 });
    }

    const timestamp = Date.now();
    const propsFilename = `props-${timestamp}.json`;
    const outputFilename = `out-${timestamp}.mp4`;

    const propsPath = join(process.cwd(), "public", "outputs", propsFilename);
    const outputPath = join(process.cwd(), "public", "outputs", outputFilename);

    // Use the absolute HTTP URLs (http://localhost:3000) passed from the frontend.
    // Do NOT convert to file:/// because Chrome/Puppeteer blocks local file access by default.
    const localVideoUrls = videoUrls;

    // Also pass the logo as a base64 string to absolutely guarantee it loads without 404s or file:/// security errors
    const logoPath = join(process.cwd(), "public", "logo.png");
    let logoUrl = "/logo.png"; // Fallback
    try {
      const fs = require("fs");
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const base64 = logoBuffer.toString("base64");
        logoUrl = `data:image/png;base64,${base64}`;
      }
    } catch (e) {
      console.warn("Could not convert logo to base64:", e);
    }

    await writeFile(propsPath, JSON.stringify({ videoUrls: localVideoUrls, logoUrl, templateId }));

    // Run remotion render
    const command = `npx remotion render src/remotion/index.ts SalonEdit public/outputs/${outputFilename} --props=public/outputs/${propsFilename}`;
    
    console.log(`Executing: ${command}`);
    const { stdout, stderr } = await execAsync(command, { cwd: process.cwd() });
    
    console.log("Remotion stdout:", stdout);
    if (stderr) {
      console.error("Remotion stderr:", stderr);
    }

    return NextResponse.json({ success: true, url: `/outputs/${outputFilename}` });

  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

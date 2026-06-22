import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";

const execAsync = promisify(exec);

export async function POST() {
  try {
    const scriptPath = join(process.cwd(), "scripts", "get_trending_audio.py");
    
    console.log("Executing get_trending_audio.py...");
    const { stdout } = await execAsync(`python "${scriptPath}"`);
    
    // yt-dlp sometimes leaks progress output to stdout despite quiet mode.
    // We scan the output lines to find the actual JSON payload.
    const lines = stdout.split('\n');
    let jsonResult = null;
    
    // Some lines might be combined or not split by \n if progress is printed with \r
    // Let's just find the first occurrence of `{"success":` and parse from there
    const jsonStartIndex = stdout.indexOf('{"success"');
    if (jsonStartIndex !== -1) {
       try {
           const jsonString = stdout.slice(jsonStartIndex);
           jsonResult = JSON.parse(jsonString);
       } catch (e) {
           console.error("Failed to parse extracted JSON string", e);
       }
    }
    
    if (jsonResult) {
      return NextResponse.json(jsonResult);
    }
    
    console.error("Python output:", stdout);
    return NextResponse.json({ success: false, error: "Failed to parse Python script output" }, { status: 500 });
  } catch (error) {
    console.error("Trending audio error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

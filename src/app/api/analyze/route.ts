import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { videoUrls, musicMetadata } = await request.json();

    if (!videoUrls || videoUrls.length !== 4) {
      return NextResponse.json({ success: false, error: "Must provide exactly 4 video URLs" }, { status: 400 });
    }

    // Convert public URLs (e.g. /uploads/123.mp4) to absolute local file paths for Python
    const localPaths = videoUrls.map((url: string) => join(process.cwd(), "public", url));
    const scriptPath = join(process.cwd(), "scripts", "analyze_video.py");
    
    // 1. Run OpenCV Analysis
    const pythonCmd = `python "${scriptPath}" "${localPaths.join('" "')}"`;
    console.log("Running OpenCV analysis:", pythonCmd);
    
    const { stdout, stderr } = await execAsync(pythonCmd);
    
    console.log("--- RAW PYTHON STDOUT ---");
    console.log(stdout);
    
    if (stderr) {
      console.warn("--- RAW PYTHON STDERR ---");
      console.warn(stderr);
    }
    
    let analysisData;
    try {
      analysisData = JSON.parse(stdout);
      console.log("\n==============================================");
      console.log("🐍 OPENCV ANALYSIS RESULT:");
      console.log(JSON.stringify(analysisData, null, 2));
      console.log("==============================================\n");
    } catch (err) {
      console.error("Failed to parse Python output:", stdout);
      throw new Error("Invalid output from OpenCV analysis");
    }
    
    console.log("OpenCV Analysis complete. Consulting Gemini...");
    
    // 2. Consult Gemini
    if (!process.env.GEMINI_API_KEY) {
       console.warn("No GEMINI_API_KEY found in .env.local. Returning mock configuration.");
       return NextResponse.json({
         success: true,
         config: {
            entering: { trimStart: 0, trimEnd: 2, playbackRate: 1 },
            choosing: { trimStart: 0, trimEnd: 2, playbackRate: 1 },
            haircut: { trimStart: 0, trimEnd: 4, playbackRate: 1 },
            reveal: { trimStart: 0, trimEnd: 3, playbackRate: 1 },
            templateId: "cinematic"
         },
         analysis: analysisData
       });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    let musicPromptContext = "";
    if (musicMetadata) {
       musicPromptContext = `\n🔥 DYNAMIC TRENDING AUDIO DETECTED 🔥\nThe background music for this reel is the currently trending track: "${musicMetadata.title}" by "${musicMetadata.artist}". \nTailor your pacing, cut lengths, and slow-motion decisions to perfectly match the stylistic vibe of this track (e.g., faster, snappier cuts for high-energy songs, or longer smoother clips for slow R&B).\n`;
    }

    const prompt = `You are a professional before and after haircut transformation editor.
You have received structural metadata for 4 clips for a salon 'Before & After' reel.
The clips are: entering, choosing, haircut, reveal.${musicPromptContext}
Here is the OpenCV metadata (duration, scene cuts, blurriness, face presence):
${JSON.stringify(analysisData, null, 2)}

Your task is to define the exact \`trimStart\` and \`trimEnd\` (in seconds) and a \`playbackRate\` (speed) for each clip to maximize pacing, retention, and dramatic effect. 

CRITICAL RULES:
- The final rendered video should be between 30 and 60 seconds. Do not force exactly 60 seconds if it ruins the pacing or includes garbage footage.
- PHYSICAL BOUNDS: Your \`trimStart\` and \`trimEnd\` MUST NEVER exceed the actual \`duration\` of the clip provided.
- SKIP BLANK/GARBAGE: If OpenCV metadata shows that the first few seconds have no faces or no cuts, it means the camera was pointing at the floor or was blank. YOU MUST set \`trimStart\` to skip this garbage footage (e.g., start at the first scene cut). NEVER include blank/garbage frames just to pad the duration!
- It is MUCH better to have a shorter overall video (e.g., 25 seconds) than to show a blank screen or floor for 4 seconds.
- IMPORTANT: Apply slow-motion ONLY to the 'entering' (walking in) and 'haircut' (process) clips!
- DO NOT apply slow-motion to the 'reveal' (after) or 'choosing' clips. 
- "Not too slow": Your \`playbackRate\` should NEVER be lower than 0.5 (half speed).
- Calculate durations internally: \`duration = (trimEnd - trimStart) / playbackRate\`. 
- Ensure \`duration_entering + duration_choosing + duration_haircut + duration_reveal\` is between 30 and 60.
Return ONLY valid JSON matching this structure exactly:
{
  "entering": { "trimStart": number, "trimEnd": number, "playbackRate": number },
  "choosing": { "trimStart": number, "trimEnd": number, "playbackRate": number },
  "haircut": { "trimStart": number, "trimEnd": number, "playbackRate": number },
  "reveal": { "trimStart": number, "trimEnd": number, "playbackRate": number },
  "templateId": "cinematic"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let geminiConfig;
    try {
      geminiConfig = JSON.parse(responseText.trim());

      // PROGRAMMATIC SAFEGUARD: Force Gemini to obey physical duration limits
      const roles = ["entering", "choosing", "haircut", "reveal"];
      for (const role of roles) {
        if (geminiConfig[role] && analysisData[role] && analysisData[role].duration) {
          const maxDur = analysisData[role].duration;
          // 1. If start is beyond the end of the video, reset it
          if (geminiConfig[role].trimStart >= maxDur) {
            geminiConfig[role].trimStart = 0;
          }
          // 2. If end is beyond the video, cap it
          if (geminiConfig[role].trimEnd > maxDur) {
            geminiConfig[role].trimEnd = maxDur;
          }
          // 3. If start somehow equals or exceeds end now, reset both
          if (geminiConfig[role].trimStart >= geminiConfig[role].trimEnd) {
             geminiConfig[role].trimStart = 0;
             geminiConfig[role].trimEnd = maxDur;
          }
        }
      }

      console.log("\n==============================================");
      console.log("🤖 GEMINI AI CONFIGURATION DECISION:");
      console.log(JSON.stringify(geminiConfig, null, 2));
      console.log("==============================================\n");
    } catch (e) {
       console.error("Gemini returned invalid JSON:", responseText);
       throw new Error("Gemini returned invalid JSON");
    }

    return NextResponse.json({ success: true, config: geminiConfig, analysis: analysisData });

  } catch (error: any) {
    console.error("Analyze error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

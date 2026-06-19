"use client";

import React, { useState } from "react";
import { Player } from "@remotion/player";
import { MasterTemplate } from "../remotion/MasterTemplate";

export const Preview = ({ videoUrls, templateId }: { videoUrls: string[] | null; templateId: string }) => {
  const [isRendering, setIsRendering] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleRender = async () => {
    if (!videoUrls) return;
    setIsRendering(true);
    try {
      // Convert relative paths to absolute URLs so the headless Remotion renderer
      // can reliably fetch the videos directly from the Next.js host server.
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const absoluteUrls = videoUrls.map(url => 
        url.startsWith("/") ? `${origin}${url}` : url
      );

      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrls: absoluteUrls, templateId })
      });
      const data = await res.json();
      if (data.success) {
        setOutputUrl(data.url);
      } else {
        alert("Render failed: " + data.error);
      }
    } catch (err) {
      alert("Error: " + String(err));
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="glass-panel" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2 style={{ marginBottom: "1.5rem", fontWeight: 600 }}>Preview & Render</h2>
      
      <div className="preview-container">
        {!videoUrls ? (
          <div className="preview-placeholder">
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>🎬</div>
            <h3 style={{ marginBottom: "0.5rem" }}>No Preview Available</h3>
            <p>Upload your 4 clips and click "Generate" to see the AI magic.</p>
          </div>
        ) : (
          <div className="player-wrapper">
            <Player
              component={MasterTemplate}
              durationInFrames={480}
              compositionWidth={1080}
              compositionHeight={1920}
              fps={24}
              style={{
                width: 1080 / 3, // Scaled down purely for UI presentation
                height: 1920 / 3,
              }}
              controls
              inputProps={{ videoUrls, templateId: templateId as import("../remotion/MasterTemplate").TemplateId, logoUrl: "/logo.png" }}
            />
          </div>
        )}
      </div>

      <div style={{ marginTop: "2rem" }}>
        {outputUrl ? (
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "var(--accent)", marginBottom: "1rem", fontWeight: 700 }}>✨ Render Complete!</h3>
            <p style={{ marginBottom: "1.5rem", color: "#ccc" }}>Your AI-enhanced cinematic edit is ready.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
              <a 
                href={`/api/download?file=${outputUrl.split('/').pop()}`} 
                className="btn" 
                style={{ background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", color: "#fff", width: "100%", maxWidth: "320px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
              >
                📱 Download for Instagram Reel
              </a>
              <a 
                href={`/api/download?file=${outputUrl.split('/').pop()}`} 
                className="btn" 
                style={{ background: "#1877F2", color: "#fff", width: "100%", maxWidth: "320px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
              >
                📱 Download for Facebook Reel
              </a>
              <a 
                href={`/api/download?file=${outputUrl.split('/').pop()}`} 
                className="btn" 
                style={{ background: "#FF0000", color: "#fff", width: "100%", maxWidth: "320px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
              >
                ▶️ Download for YouTube Shorts
              </a>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <p style={{ marginBottom: "1rem", color: "#aaa" }}>
              Ready to export? The AI will compile your cinematic cuts in high resolution.
            </p>
            <button 
              className="btn" 
              onClick={handleRender} 
              disabled={isRendering}
              style={{ width: "100%", maxWidth: "320px", display: "inline-block" }}
            >
              {isRendering ? <div className="loader" style={{ margin: "0 auto" }} /> : "Render & Download Video"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Player } from "@remotion/player";
import { MasterTemplate } from "../remotion/MasterTemplate";

export const Preview = ({ videoUrls, claudeConfig, templateId, customAudioUrl }: { videoUrls: string[] | null; claudeConfig: any; templateId: string; customAudioUrl: string | null }) => {

  const FPS = 24;
  let dynamicDuration = 480; // default 20s
  if (claudeConfig) {
    let d1 = 3 * FPS, d2 = 2 * FPS, d3 = 10 * FPS, d4 = 5 * FPS;
    if (claudeConfig.entering) d1 = Math.max(1, Math.floor(((claudeConfig.entering.trimEnd - claudeConfig.entering.trimStart) / (claudeConfig.entering.playbackRate || 1)) * FPS));
    if (claudeConfig.choosing) d2 = Math.max(1, Math.floor(((claudeConfig.choosing.trimEnd - claudeConfig.choosing.trimStart) / (claudeConfig.choosing.playbackRate || 1)) * FPS));
    if (claudeConfig.haircut) d3 = Math.max(1, Math.floor(((claudeConfig.haircut.trimEnd - claudeConfig.haircut.trimStart) / (claudeConfig.haircut.playbackRate || 1)) * FPS));
    if (claudeConfig.reveal) d4 = Math.max(1, Math.floor(((claudeConfig.reveal.trimEnd - claudeConfig.reveal.trimStart) / (claudeConfig.reveal.playbackRate || 1)) * FPS));
    dynamicDuration = d1 + d2 + d3 + d4;
  }

  return (
    <div className="glass-panel" style={{ display: "flex", flexDirection: "column" }}>
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
              durationInFrames={dynamicDuration}
              compositionWidth={1080}
              compositionHeight={1920}
              fps={24}
              style={{
                width: 1080 / 3, // Scaled down purely for UI presentation
                height: 1920 / 3,
              }}
              controls
              inputProps={{ videoUrls, templateId: templateId as import("../remotion/MasterTemplate").TemplateId, logoUrl: "/logo.png", claudeConfig, bgmUrl: customAudioUrl || undefined }}
            />
          </div>
        )}
      </div>


    </div>
  );
};

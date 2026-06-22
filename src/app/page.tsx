"use client";

import React, { useState } from "react";
import { Uploader } from "@/components/Uploader";
import { Preview } from "@/components/Preview";

export default function Home() {
  const [videoUrls, setVideoUrls] = useState<string[] | null>(null);
  const [claudeConfig, setClaudeConfig] = useState<any>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("cinematic");
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);

  const handleAnalysisComplete = (urls: string[], config: any, audioUrl?: string) => {
    setVideoUrls(urls);
    setClaudeConfig(config);
    if (audioUrl) {
      setCustomAudioUrl(audioUrl);
    }
  };

  return (
    <main className="layout-split">
      {/* LEFT PANE: Inputs */}
      <div className="pane-left">
        <header className="header" style={{ textAlign: "left", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem" }}>AI Content generator for Naturals</h1>
          <p>Professional Before & After Reel Generator</p>
        </header>

        <Uploader 
          onAnalysisComplete={handleAnalysisComplete} 
          selectedTemplateId={selectedTemplateId}
          setSelectedTemplateId={setSelectedTemplateId}
        />
      </div>

      {/* RIGHT PANE: Output */}
      <div className="pane-right">
        <Preview videoUrls={videoUrls} claudeConfig={claudeConfig} templateId={selectedTemplateId} customAudioUrl={customAudioUrl} />
      </div>
    </main>
  );
}

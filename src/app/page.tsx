"use client";

import React, { useState } from "react";
import { Uploader } from "@/components/Uploader";
import { Preview } from "@/components/Preview";

export default function Home() {
  const [videoUrls, setVideoUrls] = useState<string[] | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("cinematic");

  return (
    <main className="layout-split">
      {/* LEFT PANE: Inputs */}
      <div className="pane-left">
        <header className="header" style={{ textAlign: "left", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem" }}>AI Content generator for Naturals</h1>
          <p>Professional Before & After Reel Generator</p>
        </header>

        <Uploader 
          onUploadSuccess={(urls) => setVideoUrls(urls)} 
          selectedTemplateId={selectedTemplateId}
          setSelectedTemplateId={setSelectedTemplateId}
        />
      </div>

      {/* RIGHT PANE: Output */}
      <div className="pane-right">
        <Preview videoUrls={videoUrls} templateId={selectedTemplateId} />
      </div>
    </main>
  );
}

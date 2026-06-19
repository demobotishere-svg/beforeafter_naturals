"use client";

import React, { useState } from "react";

const STEPS = [
  { id: "entering", label: "Entering Salon", desc: "Walking into the salon" },
  { id: "choosing", label: "Choosing Haircut", desc: "Consultation / Before" },
  { id: "cutting", label: "Getting Haircut", desc: "The process" },
  { id: "final", label: "Final Result", desc: "The reveal / After" }
];

export const Uploader = ({ 
  onUploadSuccess,
  selectedTemplateId,
  setSelectedTemplateId
}: { 
  onUploadSuccess: (urls: string[]) => void;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
}) => {
  const [files, setFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = file;
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.some(f => !f)) return alert("Please upload all 4 videos");
    
    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file, i) => {
      if (file) formData.append(`video_${i}`, file);
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        const urls = [
          data.files["video_0"],
          data.files["video_1"],
          data.files["video_2"],
          data.files["video_3"]
        ];
        onUploadSuccess(urls);
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (err) {
      alert("Error: " + String(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2 style={{ marginBottom: "1.5rem", fontWeight: 600 }}>1. Upload Your Clips</h2>
      <div className="step-grid">
        {STEPS.map((step, index) => (
          <div key={step.id} className={`upload-card ${files[index] ? 'has-file' : ''}`}>
            <input 
              type="file" 
              accept="video/mp4,video/quicktime,video/webm" 
              onChange={(e) => handleFileChange(index, e)} 
            />
            <span style={{ color: files[index] ? "var(--accent)" : "white" }}>
              {files[index] ? "✓ " + files[index]!.name : step.label}
            </span>
            {!files[index] && <small>{step.desc}</small>}
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: "1.5rem", marginTop: "2rem", fontWeight: 600 }}>2. Select a Style</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", paddingBottom: "2rem" }}>
        {[
          { id: "cinematic", name: "Cinematic Glass", icon: "✨", desc: "Slow iOS aesthetic" },
          { id: "hype", name: "Hype Energy", icon: "🔥", desc: "Fast cuts & high contrast" },
          { id: "minimalist", name: "Minimalist Luxury", icon: "💎", desc: "Elegant B&W to color" },
          { id: "vlog", name: "Vlog / Social", icon: "🤳", desc: "Handheld split-screens" }
        ].map(tpl => (
          <div 
            key={tpl.id}
            onClick={() => setSelectedTemplateId(tpl.id)}
            style={{
              minWidth: "160px",
              padding: "1rem",
              borderRadius: "15px",
              background: selectedTemplateId === tpl.id ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${selectedTemplateId === tpl.id ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)"}`,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{tpl.icon}</div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{tpl.name}</h3>
            <p style={{ fontSize: "0.8rem", color: "#aaa" }}>{tpl.desc}</p>
          </div>
        ))}
      </div>

      <button 
        className="btn" 
        onClick={handleUpload} 
        disabled={isUploading || files.some(f => !f)}
      >
        {isUploading ? <div className="loader" /> : "Generate"}
      </button>
    </div>
  );
};

"use client";

import React, { useState } from "react";

const STEPS = [
  { id: "entering", label: "Entering Salon", desc: "Walking into the salon" },
  { id: "choosing", label: "Choosing Haircut", desc: "Consultation / Before" },
  { id: "cutting", label: "Getting Haircut", desc: "The process" },
  { id: "final", label: "Final Result", desc: "The reveal / After" }
];

export const Uploader = ({ 
  onAnalysisComplete,
  selectedTemplateId,
  setSelectedTemplateId
}: { 
  onAnalysisComplete: (urls: string[], config: any, audioUrl?: string) => void;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
}) => {
  const [files, setFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("Generate AI Sequence");
  const [trendingMeta, setTrendingMeta] = useState<{ title: string; artist: string; duration: number; audioUrl: string } | null>(null);

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = file;
      return newFiles;
    });
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioFile(e.target.files?.[0] || null);
    setTrendingMeta(null); // Clear trending if manual upload
  };

  const fetchTrendingAudio = async () => {
    setIsProcessing(true);
    setStatusText("Fetching Trending Track...");
    try {
      const res = await fetch("/api/trending-audio", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTrendingMeta(data);
        setAudioFile(null); // Clear manual upload if trending
      } else {
        alert("Failed to fetch trending audio: " + data.error);
      }
    } catch (e) {
      alert("Error: " + String(e));
    } finally {
      setIsProcessing(false);
      setStatusText("Generate AI Sequence");
    }
  };

  const handleUpload = async () => {
    if (files.some(f => !f)) return alert("Please upload all 4 videos");
    
    setIsProcessing(true);
    setStatusText("Uploading Clips...");
    const formData = new FormData();
    files.forEach((file, i) => {
      if (file) formData.append(`video_${i}`, file);
    });
    if (audioFile) {
      formData.append("audio_track", audioFile);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      const urls = [
        data.files["video_0"],
        data.files["video_1"],
        data.files["video_2"],
        data.files["video_3"]
      ];
      
      const customAudioUrl = data.files["audio_track"];

      setStatusText("Analyzing with OpenCV & Claude...");
      
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrls: urls, musicMetadata: trendingMeta })
      });
      
      const analyzeData = await analyzeRes.json();
      if (!analyzeData.success) {
         throw new Error(analyzeData.error);
      }

      const finalAudioUrl = trendingMeta ? trendingMeta.audioUrl : customAudioUrl;
      onAnalysisComplete(urls, analyzeData.config, finalAudioUrl);
      setStatusText("Ready!");
    } catch (err) {
      alert("Error: " + String(err));
      setStatusText("Generate AI Sequence");
    } finally {
      setIsProcessing(false);
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

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <div className={`upload-card ${audioFile ? 'has-file' : ''}`} style={{ flex: 1, minWidth: "250px" }}>
          <input 
            type="file" 
            accept="audio/mp3,audio/wav,audio/mpeg,audio/m4a" 
            onChange={handleAudioChange} 
          />
          <span style={{ color: audioFile ? "var(--accent)" : "white" }}>
            {audioFile ? "🎵 " + audioFile.name : "🎵 Custom Audio Track"}
          </span>
          {!audioFile && <small>Upload MP3/WAV to replace default music</small>}
        </div>

        <div 
          className={`upload-card ${trendingMeta ? 'has-file' : ''}`} 
          style={{ flex: 1, minWidth: "250px", cursor: "pointer", justifyContent: "center" }}
          onClick={fetchTrendingAudio}
        >
          <span style={{ color: trendingMeta ? "var(--accent)" : "white", fontWeight: "bold" }}>
            {trendingMeta ? `🔥 ${trendingMeta.title} by ${trendingMeta.artist}` : "🔥 Auto-Fetch Trending Track"}
          </span>
          {!trendingMeta && <small>Pull #1 trending song from YT Charts</small>}
        </div>
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
        disabled={isProcessing || files.some(f => !f)}
      >
        {isProcessing ? (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }}>
            <div className="loader" /> <span>{statusText}</span>
          </div>
        ) : statusText}
      </button>
    </div>
  );
};

import React from "react";
import { CinematicTemplate } from "./templates/CinematicTemplate";
import { HypeTemplate } from "./templates/HypeTemplate";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { VlogTemplate } from "./templates/VlogTemplate";
export type TemplateId = 
  | "cinematic" 
  | "hype" 
  | "minimalist" 
  | "vlog";

import { AbsoluteFill, Img, Audio, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const MasterTemplate: React.FC<{ 
  templateId?: TemplateId; 
  videoUrls: string[]; 
  logoUrl?: string; 
  claudeConfig?: any;
  bgmUrl?: string;
}> = ({ templateId = "cinematic", videoUrls, logoUrl, claudeConfig, bgmUrl }) => {
  let TemplateComponent;
  switch (templateId) {
    case "cinematic": TemplateComponent = <CinematicTemplate videoUrls={videoUrls} claudeConfig={claudeConfig} bgmUrl={bgmUrl} />; break;
    case "hype": TemplateComponent = <HypeTemplate videoUrls={videoUrls} claudeConfig={claudeConfig} bgmUrl={bgmUrl} />; break;
    case "minimalist": TemplateComponent = <MinimalistTemplate videoUrls={videoUrls} claudeConfig={claudeConfig} bgmUrl={bgmUrl} />; break;
    case "vlog": TemplateComponent = <VlogTemplate videoUrls={videoUrls} claudeConfig={claudeConfig} bgmUrl={bgmUrl} />; break;
    default: TemplateComponent = <CinematicTemplate videoUrls={videoUrls} claudeConfig={claudeConfig} bgmUrl={bgmUrl} />; break;
  }
  const { durationInFrames } = useVideoConfig();
  const finalBgmUrl = bgmUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";

  return (
    <>
      <Audio 
        src={finalBgmUrl} 
        volume={(f) => interpolate(f, [0, 24, durationInFrames - 24, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} 
      />
      {TemplateComponent}
      {logoUrl && (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 40,
            pointerEvents: "none",
            zIndex: 999,
          }}
        >
          <Img src={logoUrl} style={{ width: 300, opacity: 0.9, mixBlendMode: "screen" }} />
        </AbsoluteFill>
      )}
    </>
  );
};

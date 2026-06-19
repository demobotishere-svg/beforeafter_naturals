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

import { AbsoluteFill, Img } from "remotion";

export const MasterTemplate: React.FC<{ 
  templateId?: TemplateId; 
  videoUrls: string[]; 
  logoUrl?: string; 
}> = ({ templateId = "cinematic", videoUrls, logoUrl }) => {
  let TemplateComponent;
  switch (templateId) {
    case "cinematic": TemplateComponent = <CinematicTemplate videoUrls={videoUrls} />; break;
    case "hype": TemplateComponent = <HypeTemplate videoUrls={videoUrls} />; break;
    case "minimalist": TemplateComponent = <MinimalistTemplate videoUrls={videoUrls} />; break;
    case "vlog": TemplateComponent = <VlogTemplate videoUrls={videoUrls} />; break;
    default: TemplateComponent = <CinematicTemplate videoUrls={videoUrls} />; break;
  }

  return (
    <>
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
          <Img src={logoUrl} style={{ width: 180, opacity: 0.9, mixBlendMode: "screen" }} />
        </AbsoluteFill>
      )}
    </>
  );
};

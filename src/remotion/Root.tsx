import { Composition } from "remotion";
import { MasterTemplate, TemplateId } from "./MasterTemplate";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="SalonEdit"
        component={MasterTemplate}
        // Exact duration: 20 seconds at 24fps = 480 frames
        durationInFrames={480} 
        fps={24}
        width={1080}
        height={1920} // Portrait mode for cinematic reels
        defaultProps={{
          videoUrls: [
            "/placeholder.mp4",
            "/placeholder.mp4",
            "/placeholder.mp4",
          ],
          logoUrl: "/logo.png",
          templateId: "cinematic" as TemplateId,
        }}
      />
    </>
  );
};

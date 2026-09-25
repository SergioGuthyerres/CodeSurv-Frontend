import type { ReactNode } from "react";
import fallBackground from "./../design/fallbackBackground.png";
import background from "./../design/background.mp4";
interface BackgroundHeroProps {
  children?: ReactNode;
}

export default function BackgroundHero({ children }: BackgroundHeroProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={fallBackground}
        className="absolute inset-0 w-full h-full object-cover -z-20"
      >
        <source src={background} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/50 -z-10 w-full"></div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center h-full px-4 text-center">
        {children}
      </div>
    </div>
  );
}

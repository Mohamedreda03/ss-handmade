"use client";

import { Play, Pause } from "lucide-react";
import { useEffect, useState } from "react";

interface VideoOverlayProps {
  playing: boolean;
  onPlayPause: () => void;
  showControls: boolean;
}

export function VideoOverlay({
  playing,
  onPlayPause,
  showControls,
}: VideoOverlayProps) {
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showPlayIcon) {
      timeout = setTimeout(() => {
        setShowPlayIcon(false);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [showPlayIcon]);

  const handlePlayPause = () => {
    setShowPlayIcon(true);
    onPlayPause();
  };

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 
        ${showControls ? "bg-black/20" : "bg-transparent"} 
        cursor-pointer`}
      onClick={handlePlayPause}
    >
      {showPlayIcon && (
        <div className="rounded-full bg-black/50 p-4 transition-transform hover:scale-110 animate-fade-in">
          {playing ? (
            <Pause className="h-12 w-12 text-white" />
          ) : (
            <Play className="h-12 w-12 text-white" />
          )}
        </div>
      )}
    </div>
  );
}

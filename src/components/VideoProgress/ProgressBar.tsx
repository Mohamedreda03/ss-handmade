"use client";

import { useState, useRef } from "react";
import { TimePreview } from "./TimePreview";

interface ProgressBarProps {
  progress: number;
  duration: number;
  onSeek: (percentage: number) => void;
  onSeekStart: () => void;
  onSeekEnd: () => void;
}

export function ProgressBar({
  progress,
  duration,
  onSeek,
  onSeekStart,
  onSeekEnd,
}: ProgressBarProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    setPreviewPosition(e.clientX - rect.left);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    onSeek(Math.min(Math.max(percentage, 0), 100));
  };

  return (
    <div
      ref={progressRef}
      className="relative h-2 group"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseDown={onSeekStart}
      onMouseUp={onSeekEnd}
    >
      <div className="absolute inset-0 bg-secondary rounded-full">
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <TimePreview
        duration={duration}
        containerRef={progressRef}
        show={showPreview}
        position={previewPosition}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";

interface TimePreviewProps {
  duration: number;
  containerRef: React.RefObject<HTMLDivElement>;
  show: boolean;
  position: number;
}

export function TimePreview({
  duration,
  containerRef,
  show,
  position,
}: TimePreviewProps) {
  const [previewTime, setPreviewTime] = useState(0);
  const [previewStyle, setPreviewStyle] = useState({ left: "0px" });

  useEffect(() => {
    if (!containerRef.current || !show) return;

    const rect = containerRef.current.getBoundingClientRect();
    const time = (position / rect.width) * duration;
    const left = Math.max(0, Math.min(position, rect.width));

    setPreviewTime(time);
    setPreviewStyle({
      left: `${left}px`,
    });
  }, [position, duration, show, containerRef]);

  if (!show) return null;

  return (
    <div
      className="absolute -top-8 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-sm"
      style={previewStyle}
    >
      {formatTime(previewTime)}
    </div>
  );
}

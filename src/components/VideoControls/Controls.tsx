"use client";

import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Rewind,
  FastForward,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

interface ControlsProps {
  playing: boolean;
  muted: boolean;
  isFullscreen: boolean;
  progress: number;
  duration: number;
  onPlayPause: () => void;
  onMute: () => void;
  onFullscreen: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
}

export function Controls({
  playing,
  muted,
  isFullscreen,
  progress,
  duration,
  onPlayPause,
  onMute,
  onFullscreen,
  onSeekForward,
  onSeekBackward,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {/* زر التقديم (+10 ثوانٍ) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSeekForward}
          className="hover:bg-secondary"
        >
          <FastForward
            className={cn("h-5 w-5", {
              "text-white": isFullscreen,
            })}
          />
        </Button>

        {/* زر التشغيل/الإيقاف */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPlayPause}
          className="hover:bg-secondary"
        >
          {playing ? (
            <Pause
              className={cn("h-5 w-5", {
                "text-white": isFullscreen,
              })}
            />
          ) : (
            <Play
              className={cn("h-5 w-5", {
                "text-white": isFullscreen,
              })}
            />
          )}
        </Button>

        {/* زر التقديم (-10 ثوانٍ) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSeekBackward}
          className="hover:bg-secondary"
        >
          <Rewind
            className={cn("h-5 w-5", {
              "text-white": isFullscreen,
            })}
          />
        </Button>

        {/* زر كتم/إلغاء كتم الصوت */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMute}
          className="hover:bg-secondary"
        >
          {muted ? (
            <VolumeX
              className={cn("h-5 w-5", {
                "text-white": isFullscreen,
              })}
            />
          ) : (
            <Volume2
              className={cn("h-5 w-5", {
                "text-white": isFullscreen,
              })}
            />
          )}
        </Button>

        {/* زر ملء الشاشة/تصغير الشاشة */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onFullscreen}
          className="hover:bg-secondary"
        >
          {isFullscreen ? (
            <Minimize
              className={cn("h-5 w-5", {
                "text-white": isFullscreen,
              })}
            />
          ) : (
            <Maximize
              className={cn("h-5 w-5", {
                "text-white": isFullscreen,
              })}
            />
          )}
        </Button>
      </div>

      {/* الوقت المنقضي والوقت الكلي */}
      <div
        className={cn("text-sm text-muted-foreground", {
          "text-white": isFullscreen,
        })}
      >
        {formatTime((progress * duration) / 100)} / {formatTime(duration)}
      </div>
    </div>
  );
}

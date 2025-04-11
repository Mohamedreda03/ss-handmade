"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactPlayer from "react-player/youtube";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "./VideoProgress/ProgressBar";
import { Controls } from "./VideoControls/Controls";
import { VideoOverlay } from "./VideoOverlay";

interface SecureVideoPlayerProps {
  videoId: string;
  onVideoEnd?: () => void;
  title?: string;
}

export function SecureVideoPlayer({
  videoId,
  onVideoEnd,
  title,
}: SecureVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenActive = !!document.fullscreenElement;
      setIsFullscreen(fullscreenActive);
      if (!fullscreenActive) {
        setShowControls(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleProgress = (state: { played: number }) => {
    if (!seeking) {
      setProgress(state.played * 100);
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  const handleSeek = (percentage: number) => {
    const seekTo = percentage / 100;
    setProgress(percentage);
    playerRef.current?.seekTo(seekTo, "fraction");
  };

  const togglePlay = useCallback(() => {
    setPlaying((prevPlaying) => !prevPlaying);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prevMuted) => !prevMuted);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  const handleSeekForward = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.min(currentTime + 10, duration), "seconds");
    }
  };

  const handleSeekBackward = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(currentTime - 10, 0), "seconds");
    }
  };

  const handleMouseMove = () => {
    if (isFullscreen) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      controlsTimeoutRef.current = setTimeout(() => {
        if (isFullscreen && !seeking) {
          setShowControls(false);
        }
      }, 2000);
    }
  };

  const handleMouseLeave = () => {
    if (isFullscreen && !seeking) {
      setShowControls(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(Math.max(currentTime - 5, 0), "seconds");
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(
              Math.min(currentTime + 5, duration),
              "seconds"
            );
          }
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [playing, duration, isFullscreen, toggleMute, togglePlay]);

  return (
    <Card
      ref={containerRef}
      className={`w-full max-w-none mx-auto overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseMove}
      onTouchMove={handleMouseMove}
    >
      <div
        className={`relative ${
          isFullscreen ? "h-full" : "aspect-video"
        } bg-black`}
      >
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/embed/${videoId}?rel=0`}
          width="100%"
          height="100%"
          playing={playing}
          controls={false}
          muted={muted}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={handleEnded}
          config={{
            playerVars: {
              modestbranding: 1,
              showinfo: 0,
              rel: 0,
              iv_load_policy: 3,
              cc_load_policy: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              playsinline: 1,
              origin:
                typeof window !== "undefined" ? window.location.origin : "",
              suggestedQuality: "hd1080",
            },
          }}
          style={{ pointerEvents: "none" }}
        />
        <VideoOverlay
          playing={playing}
          onPlayPause={togglePlay}
          showControls={showControls}
        />
      </div>

      <div
        className={`${
          isFullscreen
            ? "absolute bottom-0 left-0 right-0 bg-black/70"
            : "relative"
        } p-4 space-y-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {title && !isFullscreen && (
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        )}

        <div className="space-y-2">
          <ProgressBar
            progress={progress}
            duration={duration}
            onSeek={handleSeek}
            onSeekStart={() => setSeeking(true)}
            onSeekEnd={() => setSeeking(false)}
          />

          <Controls
            playing={playing}
            muted={muted}
            isFullscreen={isFullscreen}
            progress={progress}
            duration={duration}
            onPlayPause={togglePlay}
            onMute={toggleMute}
            onFullscreen={toggleFullscreen}
            onSeekForward={handleSeekForward}
            onSeekBackward={handleSeekBackward}
          />
        </div>
      </div>
    </Card>
  );
}

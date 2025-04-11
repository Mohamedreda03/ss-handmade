"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const JolPlayer = dynamic(() => import("jol-player"), { ssr: false });

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <JolPlayer
        option={{
          videoSrc: videoUrl,
          width: 750,
          height: 420,
          language: "en",
          isShowScreenshot: false,
          isShowPicture: false,
          isShowSet: false,
          isShowWebFullScreen: false,
        }}
      />
    </>
  );
};

export default VideoPlayer;

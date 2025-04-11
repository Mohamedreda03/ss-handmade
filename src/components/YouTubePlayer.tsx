"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "plyr/dist/plyr.css";
import "./player.css";

const Plyr = dynamic(() => import("plyr-react"), { ssr: false });

const YouTubePlayer = ({ videoId }: { videoId: string }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && Plyr && typeof Plyr === "function") {
      setIsMounted(true);
    }
  }, []);

  if (!isMounted) return null;

  return (
    <div className="w-full h-full">
      <Plyr
        source={{
          type: "video",
          sources: [
            {
              src: videoId,
              provider: "youtube",
            },
          ],
        }}
        options={{
          controls: [
            "play",
            "progress",
            "current-time",
            "mute",
            "volume",
            "fullscreen",
            "settings",
          ],
          settings: ["quality", "speed"],
          autoplay: false,
          muted: false,
          youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
          },
        }}
      />
    </div>
  );
};

export default YouTubePlayer;

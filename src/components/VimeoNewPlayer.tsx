"use client";

import React, { useEffect, useRef } from "react";
import Player from "@vimeo/player";

type Props = {
  videoUrl: string;
  onEnded: () => void;
};

export default function VimeoNewPlayer({ videoUrl, onEnded }: Props) {
  const playerRef = useRef<HTMLDivElement>(null);

  const latest = videoUrl.split("/").pop();
  const id = Number(latest?.split("?")[0]);

  useEffect(() => {
    let options = {
      id: id,
      loop: false,
      autoplay: false,
    };

    if (playerRef.current !== null) {
      let player = new Player(playerRef.current, options);

      player.on("ended", () => {
        onEnded();
      });
    }
  }, [videoUrl, id, onEnded]);

  return (
    <div className="vimeo-custom-player rounded-lg overflow-hidden">
      <div ref={playerRef}></div>
    </div>
  );
}

"use client";

const VimeoPlayer = ({
  videoUrl,
  title,
}: {
  videoUrl: string;
  title?: string;
}) => {
  //   1920 960 480 240
  //   1080 540 270 135

  return (
    <iframe
      src={`${videoUrl};transparent=0`}
      allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
      className="border-none w-full h-full bg-transparent rounded-lg"
      allowFullScreen
      title={title || "لا يوجد عنوان"}
    ></iframe>
  );
};

export default VimeoPlayer;

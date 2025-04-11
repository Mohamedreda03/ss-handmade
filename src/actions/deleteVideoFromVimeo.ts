import axios from "axios";

export const deleteVideoFromVimeo = async (videoUrl: string) => {
  const last = videoUrl.split("/").pop();
  const videoId = last?.split("?")[0];

  const token = process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN;

  await axios.delete(`https://api.vimeo.com/videos/${videoId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

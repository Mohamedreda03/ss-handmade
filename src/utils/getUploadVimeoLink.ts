import axios from "axios";

export const getUploadVimeoLink = async (formData: FormData) => {
  const file = formData.get("file") as File;
  const token = process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN;

  const response = await axios({
    method: "POST",
    url: "https://api.vimeo.com/me/videos",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: {
      upload: {
        approach: "tus",
        size: file.size,
      },
    },
  });

  const videoLink = response.data.player_embed_url;

  const uploadLink = response.data.upload.upload_link;

  return {
    uploadLink,
    videoLink,
  };
};

export const updateVimeoVideoTitle = async (
  videoLink: string,
  title: string
) => {
  const token = process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN;

  const last = videoLink.split("/").pop();
  const videoId = last?.split("?")[0];

  await axios({
    method: "PATCH",
    url: `https://api.vimeo.com/videos/${videoId}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: {
      name: title,
    },
  });
};

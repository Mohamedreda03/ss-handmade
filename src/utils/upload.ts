import axios from "axios";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const data = await axios.post("/api/upload/file", formData);

  return data.data.path;
};

export const deleteFile = async (url: string) => {
  await axios.delete("/api/upload/file", { data: { path: url } });
};

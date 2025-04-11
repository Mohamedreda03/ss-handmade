import { supabase } from "./supabase";
import { v4 as uuid } from "uuid";

type BucketName = "images" | "videos" | "files";

export const uploadToSupabase = async (file: File, bucketName: BucketName) => {
  const name = `${uuid().split("-").join("")}`;
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(name, file);

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${name}`;

  if (error) {
    throw new Error(error.message);
  }

  return url;
};

export const deleteFromSupabase = async (
  url: string,
  bucketName: BucketName
) => {
  const name = url.split("/").pop();
  const { data, error } = await supabase.storage
    .from(bucketName)
    .remove([name!]);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export const uploadUrl = async (bucketName: string) => {
  const filePath = `${uuid().split("-").join("")}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUploadUrl(filePath);

  if (error) throw error;

  const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filePath}`;

  const uploadUrl = data?.signedUrl;

  return { uploadUrl, fileUrl };
};

// ------------------------------------------------------------

export const uploadVideoToSupabase = async (file: File) => {
  const videoName = `${uuid().split("-").join("")}`;
  const { data, error } = await supabase.storage
    .from("videos")
    .upload(videoName, file);

  const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/${videoName}`;

  if (error) {
    throw new Error(error.message);
  }

  return videoUrl;
};

export const uploadFileToSupabase = async (file: File) => {
  const fileName = `${uuid().split("-").join("")}`;
  const { data, error } = await supabase.storage
    .from("files")
    .upload(fileName, file);

  const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/files/${fileName}`;

  if (error) {
    throw new Error(error.message);
  }

  return fileUrl;
};

export const uploadImageToSupabase = async (file: File) => {
  const imageName = `${uuid().split("-").join("")}`;
  const { data, error } = await supabase.storage
    .from("images")
    .upload(imageName, file);

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${imageName}`;

  if (error) {
    throw new Error(error.message);
  }

  return imageUrl;
};

export const deleteImageFromSupabase = async (imageUrl: string) => {
  const imageName = imageUrl.split("/").pop();
  const { data, error } = await supabase.storage
    .from("images")
    .remove([imageName!]);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export const deleteFileFromSupabase = async (fileUrl: string) => {
  const fileName = fileUrl.split("/").pop();
  const { data, error } = await supabase.storage
    .from("files")
    .remove([fileName!]);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export const deleteVideoFromSupabase = async (videoUrl: string) => {
  const videoName = videoUrl.split("/").pop();
  const { data, error } = await supabase.storage
    .from("videos")
    .remove([videoName!]);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

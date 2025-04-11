"use server";
import { s3Client } from "@/utils/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

// NEXT_S3_BUCKET_NAME=abdul-samad-uploads

const uploadFileToS3 = async (
  buffer: Buffer,
  fileName: string,
  type: string
) => {
  const typePath = type.split("/")[0] as "image" | "video";

  const params = {
    Bucket: "abdul-samad-uploads",
    Key: typePath === "image" ? `images/${fileName}` : `videos/${fileName}`,
    Body: buffer,
    ContentType: type,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);

    const fileUrl = `https://${params.Bucket}.s3.${process.env.NEXT_S3_REGION}.amazonaws.com/${params.Key}`;
    console.log(fileUrl);
    return fileUrl;
  } catch (error) {
    console.log("Error uploading file to S3:", error);
    throw error;
  }
};

export const uploadS3 = async (formData: FormData) => {
  const file = formData.get("file") as File;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (!file) {
      return { error: "لم يتم ادراج اي ملف" };
    }

    let params: any;
    // اذا كان الملف  صوره
    if (file.type.split("/")[0] !== "image") {
      params = {
        Bucket: "abdul-samad-uploads",
        Key: `uploads/images/${file.name}`, // المسار داخل الحاوية
        Body: file.stream(),
        ContentType: file.type,
      };
    }

    // اذا كان الملف فيديو
    if (file.type.split("/")[0] === "video") {
      params = {
        Bucket: "abdul-samad-uploads",
        Key: `uploads/videos/${file.name}`, // المسار داخل الحاوية
        Body: file.stream(),
        ContentType: file.type,
      };
    }

    const fileName = `${uuid()}-${file.name}`;

    const url = await uploadFileToS3(buffer, fileName, file.type);

    return { url };
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

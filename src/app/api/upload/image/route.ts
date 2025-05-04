import { existsSync } from "fs";
import { writeFile, mkdir } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join, dirname } from "path";
import { v4 as uuid } from "uuid";

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename with original extension
    const fileName = `${uuid().replace(/-/g, "")}.${file.name
      .split(".")
      .pop()}`;

    // Create path to uploads directory
    const uploadDir = join(process.cwd(), "public", "uploads", "images");

    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error("Error creating directory:", err);
    }

    // Save the file
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, new Uint8Array(buffer));

    // Generate public URL for the image
    const imageUrl = `/uploads/images/${fileName}`;

    return NextResponse.json({
      success: true,
      path: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
};

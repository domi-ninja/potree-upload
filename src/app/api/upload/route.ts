import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { s3Client } from "~/lib/s3";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";

const BUCKET_NAME = `potree-upload-${env.NODE_ENV}`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    console.log(user.id);

    // Create a unique filename
    const fileName = `${user.id}_${Date.now()}`;

    // Create the upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type
    });

    // Upload the file to S3
    try {
      await s3Client.send(uploadCommand);
    } catch (error) {
      console.error("S3 upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Generate a signed URL to access the file (valid for 1 hour)
    const getObjectCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName
    });

    const publicUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 });

    return NextResponse.json({ 
      success: true, 
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath: fileName,
      publicUrl: publicUrl
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 
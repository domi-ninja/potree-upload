import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { BUCKET_NAME, s3Client } from "~/lib/s3";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { db } from "~/server/db";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";
import { uploads } from "~/server/db/schema";

const type="server-only"

function getSafeTitle(userinput: string) {
  let title = userinput.trim();
  const parts = title.split(".");
  if (parts.length !== 2) {
    throw new Error("Unauthorized");
  }
  if (!parts[0]) {
    throw new Error("Unauthorized");
  }
  if (title.length  === 0){ 
    throw new Error("Unauthorized");
  }
  title = parts[0];
  title = title.replace(/[^a-zA-Z0-9_-]/g, "_");
  if (title.length > 80) {
    title = title.slice(0, 80);
  }
  return title;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    const user = await currentUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    
    const upload = {
      title: getSafeTitle(file.name),
      uuid: crypto.randomUUID(),
      userId: user.id,
      fileType: file.type,
      createdAt: new Date(),
    };


    // Create a unique filename
    const fileName = `${user.id}_${upload.uuid}`;

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

    //const publicUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 });

    const uploadResult = await db.insert(uploads).values(upload);
    console.log(uploadResult);

    return NextResponse.json({ 
      success: true, 
      fileName: file.name,
      fileSize: file.size,
      fileType: "application/json",
      filePath: fileName,
      publicUrl: upload.uuid,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 
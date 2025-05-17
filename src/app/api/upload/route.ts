import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

    // For now, just return success response with file info
    return NextResponse.json({ 
      success: true, 
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 
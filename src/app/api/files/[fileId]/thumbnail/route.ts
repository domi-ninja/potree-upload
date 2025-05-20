import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { BUCKET_NAME, s3Client } from "~/lib/s3";
import {getMyUploadById } from "~/server/queries";
import { getBucketFileName } from "~/lib/s3";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
const type = "server-only";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ fileId: string }> }
) {
	const { fileId } = await params;

	const fileRecord = await getMyUploadById(fileId);

	if (!fileRecord) {
		return NextResponse.json({ error: "File not found" }, { status: 404 });
	}

	const body = await request.json();
	const image = body.image;
	
	// remove the data:image/jpeg;base64, prefix
	const imageData = image.replace(/^data:image\/\w+;base64,/, "");

	// Create a unique filename
	const fileName = getBucketFileName(fileRecord.uuid.toString(), "thumbnail");

	// Upload the base64 decoded image data
	const putCommand = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: fileName,
		Body: Buffer.from(imageData, 'base64'),
		ContentType: "image/jpeg",
	});	

	try {
		// Upload the file to S3
		const response = await s3Client.send(putCommand);

		return NextResponse.json({ success: true }, { status: 200 });

	} catch (error) {
		console.error("S3 put thumbnail error:", error);
		return NextResponse.json(
			{ error: "Failed to upload thumbnail" }, { status: 500 },
		);
	}
}


export async function GET(
	request: Request,
	{ params }: { params: Promise<{ fileId: string }> }
) {
	const { fileId } = await params;	

	const fileRecord = await getMyUploadById(fileId);

	if (!fileRecord) {
		return NextResponse.json({ error: "File not found" }, { status: 404 });
	}		
	

	const fileName = getBucketFileName(fileRecord.uuid.toString(), "thumbnail");

	const getCommand = new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: fileName,
	});
	
	try {
		const response = await s3Client.send(getCommand);
		console.log(response);

		// Stream the file directly to the client
		const headers = new Headers();
		headers.set("Content-Type", "image/jpeg");
	
		// Convert streaming body to array buffer
		const bodyContents = await response.Body?.transformToByteArray();

		return new NextResponse(bodyContents, {
			headers,
		});
	
	} catch (error) {
		if (error instanceof Error && error.name.includes("NoSuchKey")) {
			console.log("File not found");
			return NextResponse.json({ error: "File not found" }, { status: 404 });
		}
		
		console.error("S3 get thumbnail error:", error);
		return NextResponse.json(
			{ status: 500 },
		);
	}
}
	
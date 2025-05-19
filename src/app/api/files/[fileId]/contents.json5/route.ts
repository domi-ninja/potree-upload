import { GetObjectCommand } from "@aws-sdk/client-s3";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { BUCKET_NAME, s3Client } from "~/lib/s3";
import {getMyUploadById } from "~/server/queries";
import { getBucketFileName } from "../../route";
const type = "server-only";

// force dynamic
export const dynamic = 'force-dynamic';



export async function GET(
	request: Request,
	{ params }: { params: { fileId: string } },
) {
	const { fileId }  = await params;

	console.log("fileId", fileId);
	const fileRecord = await getMyUploadById(fileId);

	if (!fileRecord) {
		return NextResponse.json({ error: "File not found" }, { status: 404 });
	}

	// Create a unique filename
	const fileName = getBucketFileName(fileRecord.uuid.toString());

	// Create the get command
	const getCommand = new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: fileName,
	});

	try {
		// Get the file from S3
		const response = await s3Client.send(getCommand);

		// Stream the file directly to the client
		const headers = new Headers();
		headers.set("Content-Type", fileRecord.fileType);

		// Convert streaming body to array buffer
		const bodyContents = await response.Body?.transformToString();
		if (!bodyContents) {
			throw new Error("Empty response from S3");
		}

		return new Response(bodyContents, {
			headers,
		});
	} catch (error) {
		console.error("S3 fetch error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch file from storage" },
			{ status: 500 },
		);
	}
}


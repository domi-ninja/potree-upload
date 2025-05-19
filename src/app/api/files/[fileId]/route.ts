import { s3Client } from "~/lib/s3";
import { getMyUploadById, updateFileTitle } from "~/server/queries";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { BUCKET_NAME } from "~/lib/s3";
import { deleteFile } from "~/server/queries";
import { getBucketFileName } from "../route";
export async function DELETE(
	request: Request,
	{ params }: { params: { fileId: string } },
) {
	const user = await currentUser();

	const { fileId } = await params;

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const fileRecord = await getMyUploadById(fileId);

	if (!fileRecord) {
		return NextResponse.json({ error: "File not found" }, { status: 404 });
	}

    const fileName = getBucketFileName(fileRecord.uuid.toString());
    try {
        // delete the file from s3
        s3Client.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
        }));
    } catch (error) {
        console.error(error);
    }

	await deleteFile(fileRecord.uuid);

	return NextResponse.json({ success: true }, { status: 200 });
}

export async function PATCH(
	request: Request,
	{ params }: { params: { fileId: string } },
) {
	const user = await currentUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { fileId } = params;
	const { title } = await request.json();

	if (!title || typeof title !== 'string') {
		return NextResponse.json({ error: "Title is required" }, { status: 400 });
	}

	const fileRecord = await getMyUploadById(fileId);

	if (!fileRecord) {
		return NextResponse.json({ error: "File not found" }, { status: 404 });
	}

	await updateFileTitle(fileId, title);

	return NextResponse.json({ success: true }, { status: 200 });
}

import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { uploads } from "./db/schema";

export async function getMyUploads(userId: string) {
	const results = await db.query.uploads.findMany({
		where: eq(uploads.userId, userId),
		orderBy: desc(uploads.createdAt),
	});
	return results;
}

export async function adminGetSomeUserUploads(userId: string) {
	if (!userId) {
		return [];
	}

	const results = await db.query.uploads.findMany({
		where: eq(uploads.userId, userId),
		orderBy: desc(uploads.createdAt),
	});
	return results;
}

export async function getMyUploadById(uuid: string) {
	const upload = await db.query.uploads.findFirst({
		where: eq(uploads.uuid, uuid),
	});

	if (!upload) {
		throw new Error("Upload not found");
	}

	return upload;
}

export async function deleteFile(uuid: string) {
	const user = await currentUser();

	if (!user) {
		throw new Error("User not found");
	}

	const file = await db.query.uploads.findFirst({
		where: eq(uploads.uuid, uuid),
	});

	if (!file) {
		throw new Error("File not found");
	}

	await db.delete(uploads).where(eq(uploads.uuid, uuid));
}

export async function updateFileTitle(uuid: string, title: string) {
	const user = await currentUser();

	if (!user) {
		throw new Error("User not found");
	}

	const file = await db.query.uploads.findFirst({
		where: and(eq(uploads.uuid, uuid), eq(uploads.userId, user.id)),
	});

	if (!file) {
		throw new Error("File not found");
	}

	await db.update(uploads).set({ title }).where(eq(uploads.uuid, uuid));
}

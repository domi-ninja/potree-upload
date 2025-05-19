import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { uploads } from "./db/schema";

export async function getMyUploads() {
	const user = await currentUser();

	if (!user) {
		return [];
	}

	console.log(user);

	const results = await db.query.uploads.findMany({
		where: eq(uploads.userId, user.id),
		orderBy: desc(uploads.createdAt),
	});
	return results;
}

export async function getMyUploadById(uuid: string) {
	const user = await currentUser();

	if (!user) {
		throw new Error("User not found");
	}

	const upload = await db.query.uploads.findFirst({
		where: eq(uploads.uuid, uuid),
	});

	if (!upload) {
		throw new Error("Upload not found");
	}

	return upload;
}

import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMyUploads } from "~/server/queries";

const type = "server-only";

export async function GET(request: Request	) {
	const user = await currentUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const files = await getMyUploads();

	return NextResponse.json(files);
}

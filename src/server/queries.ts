import "server-only"
import {db} from "./db"
import { currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { uploads } from "./db/schema"

export async function getMyUploads(){
    const uploads = await db.query.uploads.findMany();
	return uploads;
}

export async function getUploadById(uuid: string){
    const user = await currentUser();

    if (!user) {
        throw new Error("User not found");
    }

    const upload = await db.query.uploads.findFirst({
        where: eq(uploads.uuid, uuid)
    })

    if (!upload) {
        throw new Error("Upload not found");
    }

    return upload;
}
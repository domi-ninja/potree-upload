import "server-only"
import {db} from "./db"

export async function getMyUploads(){
    const uploads = await db.query.uploads.findMany();
	return uploads;
}
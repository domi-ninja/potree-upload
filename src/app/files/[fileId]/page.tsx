import { getMyUploadById } from "~/server/queries";

export default async function FilePage({
	params,
}: { params: { fileId: string } }) {
	const { fileId } = await params;
    let file: Awaited<ReturnType<typeof getMyUploadById>>;

    try {
	    file = await getMyUploadById(fileId);
    } catch (error) {
        return (
        <div className="text-red-500 flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">
                {error instanceof Error ? error.message : String(error)}
            </h1>
            <a href="/" className="text-blue-500">Go back</a>
        </div>
            );
    }

	return (
		// <div>
		// 	<h1>{file.title}</h1>
		// 	<p>{file.fileType}</p>
		// 	<p>{file.createdAt.toLocaleString()}</p>
		// 	<p>{file.uuid}</p>
		// 	<p>{file.userId}</p>
		// 	<img src={`/api/files/${file.uuid}/contents`} alt={file.title} />
		// </div>
	);
}

import { getMyUploadById } from "~/server/queries";

export default async function FilePage({params}: {params: {fileId: string}}) {

    const { fileId } = await params;

    const file = await getMyUploadById(fileId)

    if (!file) {
        return <div>File not found</div>;
    }
  
    return (
        <div>
            <h1>{file.title}</h1>
            <p>{file.fileType}</p>
            <p>{file.createdAt.toLocaleString()}</p>
            <p>{file.uuid}</p>
            <p>{file.userId}</p>
            <img src={`/api/files/${file.uuid}/contents`} alt={file.title} />
        </div>
    )
}
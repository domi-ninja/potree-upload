import type { FileUpload } from "./UploadsTable";

export default function FilesToLink({ selectedFiles, uploads }: { selectedFiles: string[], uploads: FileUpload[] }) {
return (
        <div>
            <h2 className="text-lg font-medium mb-2">Links to selected files</h2>

            <div id="links-to-copy" className="p-6 rounded-lg border border-gray-200">
                {Array.from(selectedFiles).map(uuid => {
                    const file = uploads.find(f => f.uuid === uuid);
                    return file && (
                        <div key={uuid}>
                            <a href={`/files/${file.uuid}`} className="text-purple-600 hover:text-purple-900">
                                {file.title || file.uuid}
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
);
}
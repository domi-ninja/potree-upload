import type { FileUpload } from "./UploadsTable";

export default function FilesToLink({
	selectedFiles,
	uploads,
}: { selectedFiles: string[]; uploads: FileUpload[] }) {
	return (
		<div>
			<h2 className="mb-2 font-medium text-lg">Links to selected files
                <span className="text-sm text-gray-500"> (for copy pasting!)</span>
                </h2>
			<div id="links-to-copy" className="rounded-lg border border-gray-200 p-6">
				{Array.from(selectedFiles).map((uuid) => {
					const file = uploads.find((f) => f.uuid === uuid);
					return (
						file && (
							<div key={uuid}>
								<a
									href={`/potree.html?file=/api/files/${file.uuid}/contents`}
									className="text-purple-600 hover:text-purple-900"
								>
									{file.title || file.uuid}
								</a>
							</div>
						)
					);
				})}
			</div>
		</div>
	);
}

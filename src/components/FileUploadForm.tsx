"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface UploadResult {
	success: boolean;
	fileName: string;
	fileSize: number;
	fileType: string;
	filePath?: string;
	publicUrl?: string;
}

export default function FileUploadForm({ onUpload }: { onUpload: () => void }) {
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			setFile(files[0] as File);
			setError(null);
			setUploadResult(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!file) {
			setError("Please select a file to upload");
			return;
		}

		setUploading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Upload failed");
			}

			setUploadResult(result);

      onUpload();

		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="mt-10 w-full rounded-lg bg-white p-4 shadow-md">
			<h2 className="mb-4 font-semibold text-gray-800 text-xl">Upload File</h2>

			<form onSubmit={handleSubmit} className="flex flex-row items-end gap-4">
				<label
					htmlFor="file"
					className="block py-4 font-medium text-gray-700 text-sm"
				>
					Select a file
				</label>
				<div className="flex-1">
					<input
						type="file"
						id="file"
						onChange={handleFileChange}
						className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
					/>
				</div>

				<button
					type="submit"
					disabled={uploading || !file}
					className={`rounded-md px-8 py-4 font-medium ${
						uploading || !file
							? "cursor-not-allowed bg-purple-700 opacity-50"
							: "bg-purple-600 text-white hover:bg-purple-700"
					}`}
				>
					{uploading ? "Uploading..." : "Upload"}
				</button>
			</form>

			{error && (
				<div className="mt-4 rounded-md bg-red-100 p-3 text-red-800">
					{error}storage
				</div>
			)}

			{uploadResult && (
				<div className="mt-4 rounded-md bg-green-100 p-3 text-green-800">
					<p>Upload successful!</p>
				</div>
			)}
		</div>
	);
}

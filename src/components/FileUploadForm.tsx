"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			const selectedFile = files[0] as File;
			setFile(selectedFile);
			setError(null);
			setUploadResult(null);
			
			// Trigger upload immediately
			await uploadFile(selectedFile);
			
			// Clear file input
			e.target.value = '';
		}
	};

	const uploadFile = async (fileToUpload: File) => {
		if (!fileToUpload) {
			setError("Please select a file to upload");
			toast.error("Please select a file to upload");
			return;
		}

		setUploading(true);
		setError(null);
		toast.info(`Uploading ${fileToUpload.name}...`, { 
			autoClose: false,
			toastId: "uploading"
		});

		try {
			const formData = new FormData();
			formData.append("file", fileToUpload);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Upload failed");
			}

			toast.dismiss("uploading");
			toast.success(`${fileToUpload.name} uploaded successfully!`);
			setUploadResult(result);
			setFile(null); // Clear file selection in state
			onUpload();

		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Upload failed";
			toast.dismiss("uploading");
			toast.error(errorMessage);
			setError(errorMessage);
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (file) {
			await uploadFile(file);
		}
	};

	return (
		<div className="mt-10 w-full rounded-lg bg-white p-4 shadow-md">
			<h2 className="mb-4 font-semibold text-gray-800 text-xl">Upload File</h2>

			<form onSubmit={handleSubmit} className="flex flex-row items-end gap-4">
				<div className="flex-1">
					<input
						type="file"
						id="file"
						onChange={handleFileChange}
						className="file:mr-4 file:p-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 w-full text-sm text-slate-500 rounded-md border border-gray-300 bg-gray-50"
						disabled={uploading}
					/>
				</div>

			</form>

			{error && (
				<div className="mt-4 rounded-md bg-red-100 p-3 text-red-800">
					{error}
				</div>
			)}

		</div>
	);
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import {
	FaCheck,
	FaPen,
	FaSearch,
	FaSort,
	FaSortDown,
	FaSortUp,
	FaTimes,
} from "react-icons/fa";
import FileUploadForm from "./FileUploadForm";
import FilesToLink from "./FilesToLink";

// Helper function to format dates in a readable way
function formatDate(dateString: string | Date): string {
	const date = dateString instanceof Date ? dateString : new Date(dateString);

	const now = new Date();
	const diffMs = now.getTime() - date.getTime();

	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSecs < 60) return "just now";
	if (diffMins < 60)
		return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
	if (diffHours < 24)
		return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
	if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export type FileUpload = {
	uuid: string;
	title: string;
	fileType: string;
	createdAt: string | Date;
};

type SortField = "title" | "fileType" | "createdAt";
type SortDirection = "asc" | "desc";

export default function UploadsTable({ uploads }: { uploads: FileUpload[] }) {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [sortField, setSortField] = useState<SortField>("createdAt");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [editingFile, setEditingFile] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
	const [filesList, setFilesList] = useState<FileUpload[]>(uploads);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSort = (field: SortField) => {
		if (field === sortField) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const getSortIcon = (field: SortField) => {
		if (field !== sortField) return <FaSort className="ml-1 inline" />;
		return sortDirection === "asc" ? (
			<FaSortUp className="ml-1 inline" />
		) : (
			<FaSortDown className="ml-1 inline" />
		);
	};

	const filteredAndSortedUploads = useMemo(() => {
		return [...filesList]
			.filter(
				(file) =>
					file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					file.fileType.toLowerCase().includes(searchTerm.toLowerCase()),
			)
			.sort((a, b) => {
				if (sortField === "createdAt") {
					const dateA = new Date(a.createdAt).getTime();
					const dateB = new Date(b.createdAt).getTime();
					return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
				}

				const valueA = String(a[sortField]).toLowerCase();
				const valueB = String(b[sortField]).toLowerCase();
				return sortDirection === "asc"
					? valueA.localeCompare(valueB)
					: valueB.localeCompare(valueA);
			});
	}, [filesList, searchTerm, sortField, sortDirection]);

	useEffect(() => {
		if (editingFile && inputRef.current) {
			inputRef.current.focus();
		}
	}, [editingFile]);

	const handleEditStart = (file: FileUpload) => {
		setEditingFile(file.uuid);
		setEditTitle(file.title);
		// input will be focused by the useEffect
	};

	const handleEditCancel = () => {
		setEditingFile(null);
	};

	const handleEditSave = (file: FileUpload) => {
		// Here you would normally make an API call to update the title
		// For this simple implementation, we'll just update it in the UI
		// In a real app, add the API call here

		console.log("file", file);

		const updatedUploads = filesList.map((f) =>
			f.uuid === file.uuid ? { ...f, title: editTitle } : f,
		);
		
		// Update state with the new list
		setFilesList(updatedUploads);

		// Update UI immediately (optimistic update)
		file.title = editTitle;

		setEditingFile(null);
	};

	const handleDeleteFile = async (uuid: string) => {
	
		// call the api to delete the file, no need to use fetch
		await fetch(`/api/files/${uuid}`, {
			method: "DELETE",
		});

		// refresh the page
		router.refresh();
	};


	const handleDeleteSelectedFiles = async () => {
		for (const uuid of selectedFiles) {
			await handleDeleteFile(uuid);
		}
	};

	const toggleFileSelection = (uuid: string) => {
		setSelectedFiles((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(uuid)) {
				newSet.delete(uuid);
			} else {
				newSet.add(uuid);
			}
			return newSet;
		});
	};

	const toggleAllFiles = () => {
		if (selectedFiles.size === filteredAndSortedUploads.length) {
			// If all are selected, deselect all
			setSelectedFiles(new Set());
		} else {
			// Otherwise, select all
			setSelectedFiles(
				new Set(filteredAndSortedUploads.map((file) => file.uuid)),
			);
		}
	};


	return (
		<div>
			<div className="mb-12 grid grid-cols-2 gap-4">
				<FileUploadForm onUpload={() =>{

					console.log("onUpload");
					router.refresh()
				
				}}	 />
				<FilesToLink
					selectedFiles={Array.from(selectedFiles)}
					uploads={uploads}
				/>
			</div>
			<h2 className="mb-4 font-semibold text-2xl">My Uploads

				<button
					type="button"
					onClick={() => handleDeleteSelectedFiles()}
					className="text-red-500 hover:text-red-700 float-right"
					aria-label="Delete files"
				>
					Delete {selectedFiles.size} file{selectedFiles.size !== 1 ? "s" : ""}
				</button>
			</h2>

			<div className="relative mb-4">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<FaSearch className="text-gray-400" />
				</div>
				<input
					type="text"
					className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 text-sm focus:border-purple-500 focus:ring-purple-500"
					placeholder="Search files..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			<div className="overflow-hidden rounded-lg bg-white shadow">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
								<input
									type="checkbox"
									className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
									checked={
										selectedFiles.size > 0 &&
										selectedFiles.size === filteredAndSortedUploads.length
									}
									onChange={toggleAllFiles}
								/>
							</th>
							<th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
								View
							</th>
							<th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
								<button
									type="button"
									className="flex items-center focus:outline-none"
									onClick={() => handleSort("title")}
									aria-label="Sort by title"
								>
									File Name {getSortIcon("title")}
								</button>
							</th>
							<th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
								<button
									type="button"
									className="flex items-center focus:outline-none"
									onClick={() => handleSort("createdAt")}
									aria-label="Sort by upload date"
								>
									Uploaded {getSortIcon("createdAt")}
								</button>
							</th>
							<th className="px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					
					<tbody className="divide-y divide-gray-200 bg-white">
						{filteredAndSortedUploads.map((file) => (
							<tr key={file.uuid} className="hover:bg-gray-50">
								<td className="whitespace-nowrap px-6 py-4">
									<input
										type="checkbox"
										className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
										checked={selectedFiles.has(file.uuid)}
										onChange={() => toggleFileSelection(file.uuid)}
									/>
								</td>
								<td className="whitespace-nowrap">
									<Link
										href={`/files/${file.uuid}`}
										className="bg-purple-600 p-4 text-white"
									>
										View
									</Link>
								</td>
								<td className="whitespace-nowrap">
									<div className="font-medium text-gray-900 text-sm">
										{editingFile === file.uuid ? (
											<div className="flex items-center">
												<input
													type="text"
													value={editTitle}
													onChange={(e) => setEditTitle(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															handleEditSave(file);
														} else if (e.key === "Escape") {
															handleEditCancel();
														}
													}}
													className="flex-1 rounded border border-gray-300 p-4 text-sm"
													id={`edit-title-${file.uuid}`}
													ref={inputRef}
												/>
												<button
													type="button"
													onClick={() => handleEditSave(file)}
													className="mx-2 rounded border border-gray-300 p-4 text-green-500 text-sm hover:text-green-700"
													aria-label="Save"
												>
													<FaCheck />
												</button>
												<button
													type="button"
													onClick={handleEditCancel}
													className="mx-2 rounded border border-gray-300 p-4 text-red-500 text-sm hover:text-red-700"
													aria-label="Cancel"
												>
													<FaTimes />
												</button>
											</div>
										) : (
											<div className="flex items-center">
												<button
													type="button"
													className="cursor-pointer border-none bg-transparent p-0 text-left font-medium text-gray-900 text-sm hover:text-purple-700"
													onClick={() => handleEditStart(file)}
													aria-label="Edit title"
												>
													{file.title}
												</button>
												<button
													type="button"
													onClick={() => handleEditStart(file)}
													className="ml-2 text-gray-500 hover:text-purple-700"
													aria-label="Edit title"
												>
													<FaPen size={14} />
												</button>
											</div>
										)}
									</div>
								</td>

								<td className="whitespace-nowrap">
									<div className="text-gray-500 text-sm">
										{formatDate(file.createdAt)}
									</div>
								</td>
								<td className="whitespace-nowrap">
									<button
										type="button"
										onClick={() => handleDeleteFile(file.uuid)}
										className="text-red-500 hover:text-red-700"
										aria-label="Delete file"
									>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{selectedFiles.size > 0 && (
					<div className="bg-gray-50 px-6 py-3 text-sm">
						<span className="mr-2">
							{selectedFiles.size} file{selectedFiles.size !== 1 ? "s" : ""}{" "}
							selected
						</span>
					</div>
				)}
			</div>
		</div>
	);
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FaSearch, FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

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

type FileUpload = {
	uuid: string;
	title: string;
	fileType: string;
	createdAt: string | Date;
};

type SortField = "title" | "fileType" | "createdAt";
type SortDirection = "asc" | "desc";

export default function UploadsTable({ uploads }: { uploads: FileUpload[] }) {
	const [searchTerm, setSearchTerm] = useState("");
	const [sortField, setSortField] = useState<SortField>("createdAt");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
		return [...uploads]
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
	}, [uploads, searchTerm, sortField, sortDirection]);

	if (uploads.length === 0) {
		return (
			<div className="rounded-lg bg-slate-100 p-8 text-center">
				<h2 className="mb-2 font-medium text-xl">No files uploaded yet</h2>
				<p className="mb-4 text-slate-600">
					Use the upload form above to add your first file
				</p>
			</div>
		);
	}

	return (
		<div>
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
							<th
								className="cursor-pointer px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hover:bg-gray-100"
								onClick={() => handleSort("title")}
							>
								File Name {getSortIcon("title")}
							</th>
							<th
								className="cursor-pointer px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hover:bg-gray-100"
								onClick={() => handleSort("fileType")}
							>
								Type {getSortIcon("fileType")}
							</th>
							<th
								className="cursor-pointer px-6 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider hover:bg-gray-100"
								onClick={() => handleSort("createdAt")}
							>
								Uploaded {getSortIcon("createdAt")}
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
									<div className="font-medium text-gray-900 text-sm">
										{file.title}
									</div>
								</td>
								<td className="whitespace-nowrap px-6 py-4">
									<div className="text-gray-500 text-sm">{file.fileType}</div>
								</td>
								<td className="whitespace-nowrap px-6 py-4">
									<div className="text-gray-500 text-sm">
										{formatDate(file.createdAt)}
									</div>
								</td>
								<td className="whitespace-nowrap px-6 py-4 font-medium text-sm">
									<Link
										href={`/files/${file.uuid}`}
										className="mr-4 text-purple-600 hover:text-purple-900"
									>
										View
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

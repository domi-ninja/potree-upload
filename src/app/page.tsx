import { SignedIn, SignedOut } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import FileUploadForm from "~/components/FileUploadForm";
import UploadsTable from "~/components/UploadsTable";
import { getMyUploads } from "~/server/queries";

// Helper function to format dates in a readable way
function formatDate(dateString: string | Date): string {
	const date = dateString instanceof Date ? dateString : new Date(dateString);

	// Get time difference in milliseconds
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();

	// Convert to different units
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	// Format based on time difference
	if (diffSecs < 60) {
		return "just now";
	}

	if (diffMins < 60) {
		return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
	}

	if (diffHours < 24) {
		return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
	}

	if (diffDays < 30) {
		return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
	}

	// Format as date for older items
	return date.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export default async function FilesPage() {

	const user = await currentUser();

	if (!user) {
		return <div>Please sign in to view your files.</div>;
	}

	const uploads = await getMyUploads(user.id.toString());

	return (
		<main className="container mx-auto px-4 py-10">
			<div className="mb-6">
				<h1 className="mb-2 font-bold text-3xl">My Files</h1>
			</div>

			<SignedOut>
				<div className="mb-6 rounded border border-amber-400 bg-amber-100 p-4 text-amber-800">
					<p>Please sign in to view your files.</p>
				</div>
			</SignedOut>

			<SignedIn>
				<UploadsTable uploads={uploads} admin={false} />
			</SignedIn>
		</main>
	);
}

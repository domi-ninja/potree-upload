import React from "react";
import UploadsTable from "~/components/UploadsTable";
import { adminGetAllUsers, isCurrentUserAdmin } from "~/server/auth/clerk";
import { adminGetSomeUserUploads } from "~/server/queries";

export default async function AdminPage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const isAdmin = await isCurrentUserAdmin();

	const { userId } = await params;

	if (!isAdmin) {
		return (
			<div>
				<h1>You are not authorized to access this page</h1>
			</div>
		);
	}

	const users = await adminGetAllUsers();
	const user = users.find((user) => user.id === userId);
	const files = await adminGetSomeUserUploads(userId);

	return (
		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<h1 className="mb-20 bg-red-500 p-4 text-center font-bold text-2xl text-white">
				Managing user:{" "}
				{user?.emailAddresses?.[0]?.emailAddress || "Unknown email"}
			</h1>
			<UploadsTable uploads={files} admin={true} />
		</div>
	);
}

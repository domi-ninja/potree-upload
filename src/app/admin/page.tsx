import Link from "next/link";
import React from "react";
import { adminGetAllUsers, isCurrentUserAdmin } from "~/server/auth/clerk";

// Mark this route as dynamic to allow headers usage
export const dynamic = "force-dynamic";

export default async function AdminPage() {
	const isAdmin = await isCurrentUserAdmin();

	if (!isAdmin) {
		return (
			<div>
				<h1>You are not authorized to access this page</h1>
			</div>
		);
	}

	const users = await adminGetAllUsers();

	return (
		<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<h1 className="font-bold text-2xl">Admin Page</h1>
			{users.map((user) => (
				<div key={user.id} className="m-10 rounded-md bg-red-300 p-4">
					<Link href={`/admin/${user.id}`}>
						Manage {user.emailAddresses[0]?.emailAddress}
					</Link>
				</div>
			))}
		</div>
	);
}

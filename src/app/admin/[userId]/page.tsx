import React from "react";
import { isCurrentUserAdmin, adminGetAllUsers } from "~/server/auth/clerk";
import { adminGetSomeUserUploads } from "~/server/queries";
import UploadsTable from "~/components/UploadsTable";

export default async function AdminPage({
    params,
}: {
    params: Promise<{ userId: string }>
}) {
    const isAdmin = await isCurrentUserAdmin();

    const { userId } = await params;

    if (!isAdmin) {
        return (
            <div>
                <h1>You are not authorized to access this page</h1>
            </div>
        )
    }

    const users = await adminGetAllUsers();
    const user = users.find((user) => user.id === userId);
    const files = await adminGetSomeUserUploads(userId);

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold p-4 text-center bg-red-500 text-white mb-20">
                Managing user: {user?.emailAddresses?.[0]?.emailAddress || "Unknown email"}
            </h1>
            <UploadsTable uploads={files} admin={true} />
        </div>
    )
}
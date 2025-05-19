import React from "react";
import { isCurrentUserAdmin, adminGetAllUsers } from "~/server/auth/clerk";
import Link from "next/link";
export default async function AdminPage() {
    
    const isAdmin = await isCurrentUserAdmin();

    if (!isAdmin) {
        return (
            <div>
                <h1>You are not authorized to access this page</h1>
            </div>
        )
    }
    
    const users = await adminGetAllUsers();

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold">Admin Page</h1>
            {users.map((user) => (
                <div key={user.id} className="m-10 p-4 bg-red-300 rounded-md">
                    <Link href={`/admin/${user.id}`}>Manage {user.emailAddresses[0].emailAddress}</Link>
                </div>
            ))}
        </div>
    )
}   
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";

/**
 * Server-side function to check if the current user has admin role
 * This is more secure than client-side checks
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) return false;
    if (typeof user.privateMetadata.admin !== 'boolean' ) {
        return false;
    }
    return user.privateMetadata.admin;
  } catch (error) {
    console.error("Error verifying admin status:", error);
    return false;
  }
} 

/**
 * Server-side function to get all users from Clerk
 * @returns Promise with array of User objects
 */
export async function adminGetAllUsers(): Promise<User[]> {
  try {
    const client = await clerkClient();
    const { data, totalCount } = await client.users.getUserList()
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
} 

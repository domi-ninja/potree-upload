import { isCurrentUserAdmin } from "~/server/auth/clerk";
export default async function AdminHeader() { 

  if (! await isCurrentUserAdmin()) {
    return null;
  }

  return (
    <span className="mr-2 inline-block">
      <a href="/admin" className="p-2 bg-red-300">
        Admin
      </a>
    </span>
  );
} 
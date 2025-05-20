import { isCurrentUserAdmin } from "~/server/auth/clerk";
export default async function AdminHeader() {
	if (!(await isCurrentUserAdmin())) {
		return null;
	}

	return (
		<span className="mr-2 inline-block">
			<a href="/admin" className="bg-red-300 p-2">
				Admin
			</a>
		</span>
	);
}

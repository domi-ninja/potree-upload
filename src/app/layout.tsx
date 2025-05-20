import "~/styles/globals.css";

import {
	ClerkProvider,
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
	useUser,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import AdminHeader from "~/components/AdminHeader";

export const metadata: Metadata = {
	title: "potree upload",
	description: "upload potree projects",
	icons: {
		icon: "/favicon.ico",
	},
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider>
			<html lang="en" className={`${geist.variable}`}>
				<body>
					<header className="h-16 gap-4 bg-gray-100 p-4 text-2xl">
						<div className="container mx-auto px-4">
							<h1 className="inline-block font-bold text-2xl">
								<Link href="/">Potree Viewer</Link>
							</h1>
							<div className="float-right">
								<SignedOut>
									<SignInButton />
								</SignedOut>
								<SignedIn>
									<AdminHeader />
									<UserButton />
								</SignedIn>
							</div>
						</div>
					</header>
					{children}
				</body>
			</html>
		</ClerkProvider>
	);
}

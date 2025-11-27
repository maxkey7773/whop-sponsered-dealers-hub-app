import { WhopApp } from "@whop/react/components";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationProvider } from "@/components/NotificationProvider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "InfluencerHub - Connect Brands & Influencers",
	description: "Secure platform connecting brands with influencers. Escrow payments, direct messaging, and seamless collaboration.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getServerSession(authOptions);

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
			>
				<NotificationProvider session={session}>
					<WhopApp>{children}</WhopApp>
				</NotificationProvider>
			</body>
		</html>
	);
}

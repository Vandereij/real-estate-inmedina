import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sign In - Admin Access | Real Estate InMedina",
	description:
		"Secure login for InMedina property management. Access your admin dashboard to manage listings, inquiries, and client communications. Magic link authentication for enhanced security.",
	robots: "none"
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
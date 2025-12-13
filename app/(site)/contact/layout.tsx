import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Contact Us - Get Expert Guidance on Moroccan Property | Real Estate InMedina",
	description:
		"Ready to explore Moroccan properties? Contact our on-the-ground team for honest advice on buying, renting, or restoring riads and villas. WhatsApp or email consultations available.",
};

export default function ContactLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
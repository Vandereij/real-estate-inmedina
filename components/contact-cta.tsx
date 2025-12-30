"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import CIcon from "@coreui/icons-react";
import { cibWhatsapp } from "@coreui/icons";
import EnquiryDialog from "./enquiry-dialog";
import Link from "next/link";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactCta() {
	const [newsletterEmail, setNewsletterEmail] = useState("");
	const [newsletterStatus, setNewsletterStatus] = useState<Status>("idle");
	const [newsletterMessage, setNewsletterMessage] = useState("");

	const handleNewsletterSubscribe = async () => {
		if (!newsletterEmail) {
			setNewsletterStatus("error");
			setNewsletterMessage("Please enter your email.");
			return;
		}

		setNewsletterStatus("loading");
		setNewsletterMessage("");

		try {
			const res = await fetch("/api/newsletter", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: newsletterEmail }),
			});

			const data = await res.json();

			if (!res.ok || data?.error) {
				setNewsletterStatus("error");
				setNewsletterMessage(
					data?.error || "Something went wrong. Please try again."
				);
				return;
			}

			setNewsletterStatus("success");
			setNewsletterMessage(data?.message || "You’ve been subscribed!");
			setNewsletterEmail("");
		} catch (err) {
			console.error(err);
			setNewsletterStatus("error");
			setNewsletterMessage("Network error. Please try again.");
		}
	};

	return (
		<section className="bg-[#f8f3ee]">
			<div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-8">
				<h3 className="font-serif text-3xl md:text-4xl">
					Let's begin your journey
				</h3>
				<p className="mt-3 text-neutral-800">
					Reach out for a tailored property selection or renovation
					consultation.
				</p>

				<div className="mt-8 flex justify-center gap-3">
					<EnquiryDialog
						source="contact-cta"
						subject="Website enquiry"
						trigger={
							<Button variant="default" className="rounded-full">
								<Mail className="h-4 w-4" /> Email
							</Button>
						}
						// keep your styling consistent with CTA background
						contentClassName="sm:max-w-md"
					/>

					<Button variant="default" className="rounded-full">
						<Link
							target="_blank"
							className="flex gap-2 items-center"
							href={
								"https://chat.whatsapp.com/B6GkWGDEnhABwkbiSCLeuX"
							}
						>
							<CIcon
								className="fill-accent-foreground"
								icon={cibWhatsapp}
							/>{" "}
							Chat
						</Link>
					</Button>
				</div>

				<p className="mt-8 max-w-8/12 md:max-w-5/12 mx-auto text-neutral-800">
					Or you can join our newsletter to receive updates about our
					properties and services.
				</p>

				<div className="mt-6 flex flex-col items-center gap-3 md:flex-row md:justify-center">
					<Input
						placeholder="you@domain.com"
						className="max-w-xs bg-[#f8f3ee]/80"
						type="email"
						value={newsletterEmail}
						onChange={(e) => setNewsletterEmail(e.target.value)}
					/>
					<Button
						className="bg-[#c98a5a] text-white hover:bg-[#b37750]"
						onClick={handleNewsletterSubscribe}
						disabled={newsletterStatus === "loading"}
					>
						{newsletterStatus === "loading"
							? "Subscribing..."
							: "Subscribe"}
					</Button>
				</div>

				{newsletterMessage && (
					<p
						className={`mt-3 text-sm ${
							newsletterStatus === "error"
								? "text-red-600"
								: "text-green-700"
						}`}
					>
						{newsletterMessage}
					</p>
				)}
			</div>
		</section>
	);
}

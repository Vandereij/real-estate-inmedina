"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogTrigger,
} from "./ui/dialog";

type Status = "idle" | "loading" | "success" | "error";

type EnquiryDialogProps = {
	trigger: React.ReactNode;

	title?: string;
	description?: string;

	// Optional metadata
	subject?: string; // e.g. "Enquiry: Riad Aziza"
	source?: string; // e.g. "contact-page", "property-detail"

	// Property context (shown in UI + sent to API)
	propertyTitle?: string;
	propertyId?: string;
	propertySlug?: string;
	propertyUrl?: string; // optional explicit URL; if omitted API can build it

	defaultMessage?: string;
	apiPath?: string; // default "/api/enquiry"
	onSent?: () => void;

	// UI class customization (optional)
	contentClassName?: string;
};

export default function EnquiryDialog({
	trigger,
	title = "Send us an enquiry",
	description = "Tell us a bit about what you're looking for and we'll get back to you.",

	subject,
	source,

	propertyTitle,
	propertyId,
	propertySlug,
	propertyUrl,

	defaultMessage = "",
	apiPath = "/api/enquiry",
	onSent,
	contentClassName,
}: EnquiryDialogProps) {
	const [open, setOpen] = useState(false);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState(defaultMessage);

	const [status, setStatus] = useState<Status>("idle");
	const [feedback, setFeedback] = useState("");

	// Keep message in sync if defaultMessage changes between pages/renders
	useEffect(() => {
		if (!open) setMessage(defaultMessage);
	}, [defaultMessage, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !message) {
			setStatus("error");
			setFeedback("Please provide at least your email and a message.");
			return;
		}

		setStatus("loading");
		setFeedback("");

		try {
			const res = await fetch(apiPath, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					email,
					message,

					// meta
					subject,
					source,

					// property context
					propertyTitle,
					propertyId,
					propertySlug,
					propertyUrl,
				}),
			});

			const data = await res.json();

			if (!res.ok || data?.error) {
				setStatus("error");
				setFeedback(
					data?.error || "Failed to send enquiry. Please try again."
				);
				return;
			}

			setStatus("success");
			setFeedback(data?.message || "Your enquiry has been sent.");

			// reset fields
			setName("");
			setEmail("");
			setMessage(defaultMessage);

			setOpen(false);
			onSent?.();
		} catch (err) {
			console.error(err);
			setStatus("error");
			setFeedback("Network error. Please try again.");
		}
	};

	const showPropertyBlock =
		(typeof propertyTitle === "string" &&
			propertyTitle.trim().length > 0) ||
		(typeof propertySlug === "string" && propertySlug.trim().length > 0) ||
		(typeof propertyId === "string" && propertyId.trim().length > 0);

	const propertyDisplay =
		(typeof propertyTitle === "string" && propertyTitle.trim()) ||
		(typeof propertySlug === "string" && propertySlug.trim()) ||
		(typeof propertyId === "string" && propertyId.trim()) ||
		"";

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>

			<DialogContent className={contentClassName ?? "sm:max-w-md"}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>

					{showPropertyBlock && (
						<div className="mt-2 rounded-md border border-border bg-muted px-4 py-3 text-sm">
							<p className="text-muted-foreground">
								You’re enquiring about
							</p>
							<p className="font-medium">{propertyDisplay}</p>
						</div>
					)}
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="text-left space-y-2">
						<label className="text-sm font-medium">Name</label>
						<Input
							placeholder="Your name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="bg-[#f8f3ee]/80"
							required
						/>
					</div>

					<div className="text-left space-y-2">
						<label className="text-sm font-medium">Email</label>
						<Input
							type="email"
							placeholder="you@domain.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="bg-[#f8f3ee]/80"
							required
						/>
					</div>

					<div className="text-left space-y-2">
						<label className="text-sm font-medium">Message</label>
						<Textarea
							placeholder="Tell us about your property needs or renovation ideas..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							className="bg-[#f8f3ee]/80 min-h-[120px]"
							required
						/>
					</div>

					{feedback && (
						<p
							className={`text-sm ${
								status === "error"
									? "text-red-600"
									: "text-green-700"
							}`}
						>
							{feedback}
						</p>
					)}

					<DialogFooter className="mt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-[#c98a5a] text-white hover:bg-[#b37750]"
							disabled={status === "loading"}
						>
							{status === "loading"
								? "Sending..."
								: "Send enquiry"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

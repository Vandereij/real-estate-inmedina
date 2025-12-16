// app/api/enquiry/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const isDev = process.env.NODE_ENV !== "production";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		console.log("[/api/enquiry] Incoming body:", body);

		const {
			name,
			email,
			message,
			phone,
			enquiryType,
			source,

			// NEW (optional)
			subject: customSubject,
			propertyTitle,
			propertyId,
			propertySlug,
			propertyUrl: propertyUrlFromClient,
		} = body;

		// Basic validation (keep the same so old callers still work)
		if (!email || typeof email !== "string") {
			return NextResponse.json(
				{ error: "A valid email is required." },
				{ status: 400 }
			);
		}

		if (!message || typeof message !== "string") {
			return NextResponse.json(
				{ error: "Please include a message." },
				{ status: 400 }
			);
		}

		const toEmail = process.env.ENQUIRY_TO_EMAIL;
		const resendKey = process.env.RESEND_API_KEY;

		console.log("[/api/enquiry] Env check:", {
			hasEnquiryToEmail: !!toEmail,
			hasResendKey: !!resendKey,
		});

		if (!toEmail || !resendKey) {
			return NextResponse.json(
				{
					error: "Server misconfigured.",
					...(isDev && {
						details:
							"Missing one of: ENQUIRY_TO_EMAIL, RESEND_API_KEY",
					}),
				},
				{ status: 500 }
			);
		}

		const displayName =
			name && typeof name === "string" ? name : "Website visitor";

		// Optional: human-friendly label for enquiry type
		const enquiryTypeLabel = (() => {
			if (!enquiryType || typeof enquiryType !== "string")
				return "Not specified";
			const map: Record<string, string> = {
				sale: "Property purchase / sale",
				rent: "Long-term rent",
				restoration: "Restoration / renovation",
				other: "Other enquiry",
			};
			return map[enquiryType] ?? enquiryType;
		})();

		// Build a property label (for subject + body)
		const propertyLabel =
			typeof propertyTitle === "string" && propertyTitle.trim()
				? propertyTitle.trim()
				: typeof propertySlug === "string" && propertySlug.trim()
				? propertySlug.trim()
				: typeof propertyId === "string" && propertyId.trim()
				? propertyId.trim()
				: null;

		// Build property URL if possible (prefer explicit client URL)
		const siteUrl =
			process.env.SITE_URL ||
			(process.env.VERCEL_URL
				? `https://${process.env.VERCEL_URL}`
				: "") ||
			"";

		const propertyPath =
			typeof propertySlug === "string" && propertySlug.trim()
				? `/properties/${propertySlug.trim()}`
				: typeof propertyId === "string" && propertyId.trim()
				? `/properties/${propertyId.trim()}`
				: null;

		const propertyUrl =
			typeof propertyUrlFromClient === "string" &&
			propertyUrlFromClient.trim()
				? propertyUrlFromClient.trim()
				: siteUrl && propertyPath
				? `${siteUrl}${propertyPath}`
				: null;

		// Subject: prefer custom subject, else build one
		const subject =
			typeof customSubject === "string" && customSubject.trim()
				? customSubject.trim()
				: [
						"New enquiry",
						propertyLabel ? `(Property: ${propertyLabel})` : null,
						source ? `via ${source}` : null,
						enquiryType ? `(${enquiryTypeLabel})` : null,
						`from ${displayName}`,
				  ]
						.filter(Boolean)
						.join(" ");

		console.log("[/api/enquiry] Sending email via Resend…");

		const { error } = await resend.emails.send({
			from: "Enquiries <realestate@inmedina.com>", // verified domain in Resend
			to: [toEmail],
			replyTo: email,
			subject,
			html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6;">
          <h2>New enquiry from your website</h2>

          <p><strong>Subject:</strong> ${subject}</p>

          <p><strong>Name:</strong> ${displayName}</p>
          <p><strong>Email:</strong> ${email}</p>

          ${phone ? `<p><strong>Phone / WhatsApp:</strong> ${phone}</p>` : ""}

          ${
				enquiryType
					? `<p><strong>Enquiry type:</strong> ${enquiryTypeLabel}</p>`
					: ""
			}

          ${source ? `<p><strong>Source:</strong> ${source}</p>` : ""}

          ${
				propertyLabel
					? `<p><strong>Property:</strong> ${propertyLabel}</p>`
					: ""
			}

          ${
				propertyUrl
					? `<p><strong>Property URL:</strong> <a href="${propertyUrl}" target="_blank" rel="noreferrer">${propertyUrl}</a></p>`
					: ""
			}

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />

          <p><strong>Message:</strong></p>
          <p>${String(message).replace(/\n/g, "<br/>")}</p>
        </div>
      `,
		});

		if (error) {
			console.error("[/api/enquiry] Resend error:", error);
			return NextResponse.json(
				{
					error: "Failed to send enquiry. Please try again later.",
					...(isDev && { details: JSON.stringify(error) }),
				},
				{ status: 500 }
			);
		}

		console.log("[/api/enquiry] Email sent successfully");

		return NextResponse.json(
			{
				ok: true,
				message: "Your enquiry has been sent. We'll be in touch soon.",
			},
			{ status: 200 }
		);
	} catch (err: any) {
		console.error("[/api/enquiry] Uncaught error:", err);

		return NextResponse.json(
			{
				error: "Unexpected server error.",
				...(isDev && { details: String(err?.message || err) }),
			},
			{ status: 500 }
		);
	}
}

"use client";
import Link from "next/link";
import { CIcon } from '@coreui/icons-react';
import { cibFacebookF, cibInstagram, cibWhatsapp, cibPinterest } from '@coreui/icons';

type SocialProps = {
	isHomePage: boolean;
}

export default function SocialLinks(linksProps: SocialProps) {
	const color = linksProps.isHomePage ? "fill-foreground/50 hover:fill-foreground" : "fill-foreground/50 hover:fill-foreground";
	return (
		<nav className="mx-auto flex max-w-7xl px-4 pt-4 md:px-8 gap-8 text-sm items-center -mb-0.5">
			{/* <Link className="w-3" href={"https://inmedina.com"}>
				<CIcon className={`${color}`} icon={cibFacebookF} />
			</Link>
			<Link className="w-3" href={"https://inmedina.com"}>
				<CIcon className={`${color}`} icon={cibInstagram} />
			</Link>
			<Link className="w-3" href={"https://inmedina.com"}>
				<CIcon className={`${color}`} icon={cibPinterest} />
			</Link> */}
			<Link className={`${color} text-foreground/50 hover:text-foreground text-xs flex gap-2 flex-row-reverse`} target="_blank" href={"https://chat.whatsapp.com/B6GkWGDEnhABwkbiSCLeuX"}>
				Contact us via WhatsApp <CIcon className={`w-3`} icon={cibWhatsapp} />
			</Link>
		</ nav>
	);
}

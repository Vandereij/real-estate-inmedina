import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { formatLabel } from "@/lib/amenities-template";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PropertyGallery } from "@/components/property-gallery";
import Image from "next/image";
import nmlogo from "../../../../public/nmlogo.png";

// ✅ NEW
import EnquiryDialog from "@/components/enquiry-dialog";
import { Button } from "@/components/ui/button";

type Props = {
	params: Promise<{ slug: string }>;
};

import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const supabase = await createClient();

	const { data: property, error } = await supabase
		.from("properties")
		.select(
			"title, excerpt, seo_title, seo_description, seo_canonical, seo_robots, status",
		)
		.eq("slug", slug)
		.maybeSingle();

	if (error) {
		console.error("[generateMetadata] Supabase error:", error);
	}

	const fallback: Metadata = {
		title: "Property not found | Real Estate InMedina",
		description:
			"Explore carefully selected properties across Morocco with Real Estate InMedina.",
		robots: {
			index: false,
			follow: false,
		},
	};

	if (!property) {
		return fallback;
	}

	const defaults: Metadata = {
		title: `Property ${property.title} | Real Estate InMedina`,
		description: property.excerpt ?? undefined,
	};

	return buildMetadata(property, defaults);
}

export default async function PropertyDetail({ params }: Props) {
	const { slug } = await params;
	const supabase = await createClient();

	const { data: property } = await supabase
		.from("properties")
		.select("*")
		.eq("slug", slug)
		.maybeSingle();

	if (!property || property.status !== "published") return notFound();

	const inmedina = {
		title: "InMedina Team is here to respond to all your enquiries. Don't esitate to contact us via the form or WhatsApp",
	};

	const floorPlanUrl = property.floor_plan_image_url;

	const mapEmbedUrl =
		property.latitude && property.longitude
			? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${property.latitude},${property.longitude}&zoom=16`
			: null;

	function getAmenitiesFromProperty(propertyAmenities: any) {
		if (!propertyAmenities || typeof propertyAmenities !== "object") {
			return {};
		}

		const amenitiesData = Array.isArray(propertyAmenities)
			? propertyAmenities[0]
			: propertyAmenities;

		const transformed: Record<string, string[]> = {};

		Object.entries(amenitiesData).forEach(([category, items]) => {
			if (typeof items === "object" && items !== null) {
				const activeAmenities = Object.entries(items)
					.filter(([_, value]) => {
						if (typeof value === "boolean") return value === true;
						if (typeof value === "number") return value > 0;
						return false;
					})
					.map(([key, value]) => {
						const label = formatLabel(key);
						if (typeof value === "number" && value > 1) {
							return `${label} (${value})`;
						}
						return label;
					});

				if (activeAmenities.length > 0) {
					transformed[formatLabel(category)] = activeAmenities;
				}
			}
		});

		return transformed;
	}

	return (
		<article className="bg-white">
			<header className="relative min-h-[300px] w-full overflow-hidden shadow-lg">
				<img
					src={property.cover_image_url}
					alt={`${property.title} hero banner`}
					className="absolute inset-0 w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-linear-to-b from-black/65 to-black/85 flex items-center justify-center text-center px-6">
					<div className="max-w-2xl text-white space-y-4 p-8">
						<h1 className="text-xl md:text-2xl font-medium">
							{property.title}
						</h1>
						<p className="text-gray-200">{property.excerpt}</p>
					</div>
				</div>
			</header>

			<div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="lg:grid lg:grid-cols-3 lg:gap-12">
					<div className="lg:col-span-2">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left border-t border-b border-gray-200 py-8 mb-12">
							<div>
								<strong className="block text-sm font-normal text-gray-500 mb-1">
									Price
								</strong>
								<div className="text-xl font-medium text-gray-800">
									{property.currency || "$"}{" "}
									{Number(property.price).toLocaleString()}
								</div>
							</div>
							{property.bedrooms && (
								<div>
									<strong className="block text-sm font-normal text-gray-500 mb-1">
										Bedrooms
									</strong>
									<div className="text-xl font-medium text-gray-800">
										{property.bedrooms}
									</div>
								</div>
							)}
							{property.bathrooms && (
								<div>
									<strong className="block text-sm font-normal text-gray-500 mb-1">
										Bathrooms
									</strong>
									<div className="text-xl font-medium text-gray-800">
										{property.bathrooms}
									</div>
								</div>
							)}
							{(property.area_sqft || property.area_sqm) && (
								<div>
									<strong className="block text-sm font-normal text-gray-500 mb-1">
										Area
									</strong>
									<div className="text-xl font-medium text-gray-800">
										{property.area_sqft
											? `${property.area_sqft} sqft`
											: `${property.area_sqm} m²`}
									</div>
								</div>
							)}
						</div>

						<section className="mb-12">
							<h2 className="text-2xl font-light text-gray-800 mb-4">
								Description
							</h2>
							<div
								className="prose prose-lg max-w-none font-light text-gray-600"
								dangerouslySetInnerHTML={{
									__html: property.description,
								}}
							/>
						</section>

						{(() => {
							const amenities = getAmenitiesFromProperty(
								property.amenities,
							);
							const hasAmenities =
								Object.keys(amenities).length > 0;

							if (!hasAmenities) return null;

							return (
								<section className="mb-12">
									<h2 className="text-2xl font-light text-gray-800 mb-6">
										Amenities
									</h2>
									<div className="space-y-6">
										{Object.entries(amenities).map(
											([category, items]) => (
												<div key={category}>
													<h3 className="text-lg font-medium text-gray-700 mb-3 capitalize border-b border-gray-200 pb-2">
														{category}
													</h3>
													<div className="grid grid-cols-2 gap-x-6 gap-y-2">
														{items.map((item) => (
															<div
																key={item}
																className="flex items-center"
															>
																<Check className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
																<span className="text-gray-600 font-light">
																	{item}
																</span>
															</div>
														))}
													</div>
												</div>
											),
										)}
									</div>
								</section>
							);
						})()}

						{floorPlanUrl && (
							<section className="mb-12">
								<h2 className="text-2xl font-light text-gray-800 mb-6">
									Floor Plan
								</h2>
								<img
									src={floorPlanUrl}
									alt="Floor Plan"
									className="w-full aspect-3/1 object-contain rounded-md border border-gray-200 bg-gray-50"
								/>
							</section>
						)}

						<PropertyGallery
							images={property.gallery || []}
							propertyTitle={property.title}
						/>

						{mapEmbedUrl && (
							<section>
								<h2 className="text-2xl font-light text-gray-800 mb-3">
									Location
								</h2>
								{property.title && (
									<p className="text-sm text-gray-500 mb-3">
										{property.title}
									</p>
								)}
								<div className="h-[400px] w-full">
									<iframe
										src={mapEmbedUrl}
										className="w-full h-full border-0 rounded-md"
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
										title={`Map location of ${property.title}`}
									></iframe>
								</div>
							</section>
						)}
					</div>

					{/* --- Sidebar / Agent Contact --- */}
					<aside className="lg:col-span-1 mt-12 lg:mt-0">
						<div className="sticky top-24">
							<div className="border border-gray-200 rounded-lg p-8 shadow-sm">
								<h3 className="text-xl font-medium text-gray-800 mb-6">
									Contact for more information
								</h3>

								<div className="flex items-center space-x-4 mb-6">
									<Image
										alt="InMedina Logo"
										src={nmlogo}
										width={70}
										height={70}
									/>
									<div>
										<div className="text-sm text-gray-500">
											{inmedina.title}
										</div>
									</div>
								</div>

								{/* ✅ NEW: Enquiry dialog trigger */}
								<EnquiryDialog
									source="property-detail"
									propertyTitle={property.title}
									propertySlug={property.slug} // enables auto property URL in the email
									subject={`Enquiry: ${property.title}`}
									defaultMessage={`Hi,\n\nI'm interested in "${property.title}". Could you share more details and the next steps to arrange a viewing?\n\nThank you.`}
									trigger={
										<Button className="w-full bg-gray-800 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200 text-center font-medium">
											Schedule a Viewing
										</Button>
									}
								/>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</article>
	);
}

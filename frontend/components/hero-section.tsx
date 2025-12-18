// src/components/custom/hero-section.tsx
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi";
import type { IHeroSectionProps } from "@/types";
import { Button } from "./ui/button";

const styles = {
    header: "relative h-[600px] overflow-hidden",
    backgroundImage: "absolute inset-0 object-cover w-full h-full",
    overlay:
        "relative z-10 flex flex-col items-center justify-center h-full text-center text-white bg-black/50",
    heading: "text-4xl font-bold md:text-5xl lg:text-6xl",
    subheading: "mt-4 text-lg md:text-xl lg:text-2xl",
    button:
        "mt-8 inline-flex items-center justify-center px-6 py-3 text-base font-medium text-black bg-white rounded-md shadow hover:bg-gray-100 transition-colors",
};

export function HeroSection({ data }: { readonly data: IHeroSectionProps }) {
    if (!data) {
        console.error('❌ No data provided to HeroSection');
        return null;
    }

    console.log('📦 HeroSection received data:', JSON.stringify(data, null, 2));

    const { heading, subHeading, image, link } = data;

    // Verifica si tenemos imagen
    if (!image || !image.url) {
        console.error('❌ No image data found in hero section:', { image });
        // Mostrar el hero sin imagen como fallback
        return (
            <header className={styles.header}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-900" />
                <div className={styles.overlay}>
                    <h1 className={styles.heading}>{heading}</h1>
                    <p className={styles.subheading}>{subHeading}</p>
                    {link && (
                        <Link className={styles.button} href={link.href}>
                            {link.label}
                        </Link>
                    )}
                </div>
            </header>
        );
    }

    const imageUrl = getStrapiMedia(image.url);

    console.log('🖼️ Image URL generated:', imageUrl);

    return (
        <header className={styles.header}>
            <img
                alt={image.alternativeText || heading}
                className={styles.backgroundImage}
                src={imageUrl}
                style={{
                    objectFit: "cover",
                }}
                sizes="100vw"
            />
            <div className={styles.overlay}>
                <h1 className={styles.heading}>{heading}</h1>
                <p className={styles.subheading}>{subHeading}</p>
                {link && (
                    <Link className={styles.button} href={link.href}>
                        {link.label}
                    </Link>
                )}
            </div>
        </header>
    );
}
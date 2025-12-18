// types.ts - Type definitions for Strapi components

export interface IHeroSectionProps {
  heading: string;
  subHeading: string;
  image: {
    url: string;
    alternativeText?: string;
  };
  link?: {
    href: string;
    label: string;
    isExternal?: boolean;
  };
}

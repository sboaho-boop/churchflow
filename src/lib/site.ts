export type SiteProduct = {
  name: string;
  tagline: string;
  description: string;
  features: string[];
  href: string;
  accent: string;
};

export const site = {
  name: "ChurchFlow",
  productTagline: "Church management, made simple.",
  productDescription:
    "One powerful platform for membership, attendance, giving, events and teams.",
  products: [
    {
      name: "ChurchFlow",
      tagline: "Church management platform",
      description:
        "Members, attendance, giving, events, groups and more — all in one place.",
      features: ["Giving & finance", "Attendance", "Online services"],
      href: "/login",
      accent: "emerald",
    },
  ],
} satisfies { name: string; productTagline: string; productDescription: string; products: SiteProduct[] };

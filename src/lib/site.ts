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
    "One multi-tenant platform for membership, attendance, giving, events and teams.",
  products: [
    {
      name: "ChurchFlow",
      tagline: "Church management platform",
      description:
        "Members, attendance, giving, events, groups and more — for one church or a hundred.",
      features: ["Multi-tenant", "Giving & finance", "Attendance"],
      href: "/login",
      accent: "emerald",
    },
  ],
} satisfies { name: string; productTagline: string; productDescription: string; products: SiteProduct[] };

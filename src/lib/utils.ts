export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type NumberLike = number | string | { toNumber(): number };

export function toNumber(value: NumberLike | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  return value.toNumber() || 0;
}

export function formatCurrency(
  value: NumberLike | null | undefined,
  currency = "GHS"
): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(toNumber(value));
}

export function formatNumber(value: NumberLike | null | undefined): string {
  return new Intl.NumberFormat("en-GH").format(toNumber(value));
}

export function formatDate(
  value: Date | string | null | undefined
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(
  value: Date | string | null | undefined
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ageFromDate(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const dob = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

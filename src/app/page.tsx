import Link from "next/link";
import { site } from "@/lib/site";

const accentStyles: Record<string, { text: string; bg: string; ring: string }> = {
  emerald: {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-600/20",
  },
  indigo: {
    text: "text-indigo-600",
    bg: "bg-indigo-50",
    ring: "ring-indigo-600/20",
  },
  blue: {
    text: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-600/20",
  },
  amber: {
    text: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-600/20",
  },
  rose: {
    text: "text-rose-600",
    bg: "bg-rose-50",
    ring: "ring-rose-600/20",
  },
};

function accentFor(name: string) {
  return accentStyles[name] ?? accentStyles.emerald;
}

export default function LandingPage() {
  const featured = site.products[0];

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              {site.name.slice(0, 1)}
            </div>
            <span className="text-lg font-semibold text-slate-900">{site.name}</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 sm:flex">
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#systems" className="hover:text-slate-900">
              Our systems
            </a>
          </nav>
          <Link
            href="/login"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {site.productTagline}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {site.productDescription}
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              Built to serve one congregation or a hundred — secure, scoped and ready
              for your ministry.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
              >
                Open dashboard
              </Link>
              <a
                href="#features"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Explore features
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
              Everything your church runs on
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Members & families", desc: "Profiles, families, documents and team roles in one place." },
                { title: "Attendance", desc: "Quick check-in and service tracking across campuses." },
                { title: "Giving & finance", desc: "Pledges, transactions and category reporting." },
                { title: "Events & groups", desc: "Services, small groups and registrations." },
                { title: "Visitors & follow-ups", desc: "Capture visitors and stay on top of every follow-up." },
                { title: "Prayer & counseling", desc: "Private request intake with clear status workflows." },
                { title: "Sermons & media", desc: "Organize sermons and their files and resources." },
                { title: "Reports & audit", desc: "Insights plus a full audit trail of every change." },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-6"
                >
                  <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="systems" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Our systems
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
            Tools built by the same team — add and link your other products in{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-700">
              src/lib/site.ts
            </code>
            .
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.products.map((p) => {
              const a = accentFor(p.accent);
              return (
                <a
                  key={p.name}
                  href={p.href}
                  target={p.href.startsWith("http") ? "_blank" : undefined}
                  rel={p.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <div
                    className={`inline-flex w-fit rounded-lg px-2 py-1 text-xs font-semibold ${a.bg} ${a.text} ring-1 ${a.ring}`}
                  >
                    {p.tagline}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {p.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{p.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                  <span
                    className={`mt-5 text-sm font-medium ${a.text} group-hover:underline`}
                  >
                    {p.name === featured.name ? "Open dashboard" : "Learn more"}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <Link href="/login" className="hover:text-slate-900">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}

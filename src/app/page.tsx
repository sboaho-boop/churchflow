import Link from "next/link";
import { site } from "@/lib/site";

const testimonials = [
  {
    quote: "ChurchFlow transformed how we manage our 2,000-member congregation. The attendance tracking alone saved us hours every week.",
    name: "Pastor Michael Chen",
    role: "Senior Pastor, Grace Community Church",
    avatar: "MC",
    color: "from-violet-500 to-purple-600",
  },
  {
    quote: "The finance module gave us complete transparency. Our board loves the real-time giving reports.",
    name: "Sarah Williams",
    role: "Church Administrator, Living Water Fellowship",
    avatar: "SW",
    color: "from-amber-500 to-orange-600",
  },
  {
    quote: "We went from scattered spreadsheets to a unified system in just two weeks. The follow-up workflows ensure no visitor falls through the cracks.",
    name: "David Thompson",
    role: "Operations Director, New Hope Church",
    avatar: "DT",
    color: "from-emerald-500 to-teal-600",
  },
];

const stats = [
  { value: "500+", label: "Churches Served", color: "from-violet-600 to-indigo-600" },
  { value: "150K+", label: "Members Managed", color: "from-emerald-500 to-teal-500" },
  { value: "99.9%", label: "Uptime", color: "from-amber-500 to-orange-500" },
  { value: "24/7", label: "Support", color: "from-rose-500 to-pink-600" },
];

const features = [
  { title: "Members & families", desc: "Profiles, families, documents and team roles in one place.", icon: "👥", color: "from-violet-500 to-purple-600", bg: "bg-violet-50", text: "text-violet-700" },
  { title: "Attendance", desc: "Quick check-in and service tracking across campuses.", icon: "✅", color: "from-emerald-500 to-green-600", bg: "bg-emerald-50", text: "text-emerald-700" },
  { title: "Giving & finance", desc: "Pledges, transactions and category reporting.", icon: "💰", color: "from-amber-500 to-yellow-600", bg: "bg-amber-50", text: "text-amber-700" },
  { title: "Events & groups", desc: "Services, small groups and registrations.", icon: "📅", color: "from-blue-500 to-cyan-600", bg: "bg-blue-50", text: "text-blue-700" },
  { title: "Online services", desc: "Live stream embeds, virtual meetings and online attendance.", icon: "🎥", color: "from-rose-500 to-pink-600", bg: "bg-rose-50", text: "text-rose-700" },
  { title: "Visitors & follow-ups", desc: "Capture visitors and stay on top of every follow-up.", icon: "🤝", color: "from-teal-500 to-cyan-600", bg: "bg-teal-50", text: "text-teal-700" },
  { title: "Prayer & counseling", desc: "Private request intake with clear status workflows.", icon: "🙏", color: "from-indigo-500 to-blue-600", bg: "bg-indigo-50", text: "text-indigo-700" },
  { title: "Reports & audit", desc: "Insights plus a full audit trail of every change.", icon: "📊", color: "from-orange-500 to-red-600", bg: "bg-orange-50", text: "text-orange-700" },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for small churches getting started",
    features: ["Up to 100 members", "Basic attendance", "Giving tracking", "Email support"],
    cta: "Get Started Free",
    gradient: "from-slate-50 to-gray-100",
    border: "border-slate-200",
    accent: "text-slate-700",
    btn: "bg-slate-900 text-white hover:bg-slate-800",
  },
  {
    name: "Growth",
    price: "$29",
    period: "/month",
    description: "For growing congregations that need more",
    features: ["Up to 500 members", "Advanced analytics", "Event management", "Priority support", "Custom branding"],
    cta: "Start Free Trial",
    gradient: "from-emerald-50 via-white to-teal-50",
    border: "border-emerald-300",
    accent: "text-emerald-700",
    btn: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-campus churches and networks",
    features: ["Unlimited members", "Multi-campus support", "API access", "Dedicated support", "Custom integrations"],
    cta: "Contact Sales",
    gradient: "from-violet-50 to-purple-100",
    border: "border-violet-200",
    accent: "text-violet-700",
    btn: "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700",
  },
];

export default function LandingPage() {
  return (
    <div className="flex-1">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/30">
              {site.name.slice(0, 1)}
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{site.name}</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
            <a href="#features" className="transition-colors hover:text-emerald-600">
              Features
            </a>
            <a href="#testimonials" className="transition-colors hover:text-emerald-600">
              Testimonials
            </a>
            <a href="#pricing" className="transition-colors hover:text-emerald-600">
              Pricing
            </a>
          </nav>
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-24 pt-24 sm:px-6 sm:pt-32">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-violet-200/40 to-purple-200/40 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/30 blur-3xl" />

          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
              ✨ {site.productTagline}
            </span>
            <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                {site.productDescription}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Built to serve one congregation or a hundred — secure, scoped and ready
              for your ministry. Manage everything from members to finances in one beautiful platform.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="group rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-emerald-500/25 transition-all hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105"
              >
                Get Started Free
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border-2 border-slate-200 bg-white/80 px-8 py-4 text-sm font-semibold text-slate-700 backdrop-blur-sm transition-all hover:border-emerald-300 hover:bg-white hover:shadow-lg"
              >
                Sign in to Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="relative py-16">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-4xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="relative overflow-hidden py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-emerald-50/30 to-white" />
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                FEATURES
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Everything your church runs on
              </h2>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${f.color} opacity-10 transition-all group-hover:scale-150`} />
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-2xl text-white shadow-lg`}>
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="relative overflow-hidden py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-50 via-white to-purple-50" />
          <div className="absolute -left-48 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-violet-200/30 to-purple-200/30 blur-3xl" />
          <div className="absolute -right-48 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/30 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                TESTIMONIALS
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Trusted by churches everywhere
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-500">
                See what church leaders are saying about ChurchFlow
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${t.color} opacity-10`} />
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-slate-600">&quot;{t.quote}&quot;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white shadow-md`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="relative overflow-hidden py-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50" />
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                PRICING
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-500">
                Start free and scale as your church grows
              </p>
            </div>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative overflow-hidden rounded-2xl border ${plan.border} bg-gradient-to-br ${plan.gradient} p-7 transition-all hover:-translate-y-1 hover:shadow-xl ${
                    plan.highlighted ? "ring-2 ring-emerald-500/30 shadow-lg" : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-20" />
                  )}
                  {plan.highlighted && (
                    <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                      Most Popular
                    </div>
                  )}
                  <div className={`text-lg font-bold ${plan.accent}`}>{plan.name}</div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm font-medium text-slate-500">{plan.period}</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{plan.description}</p>
                  <ul className="mt-7 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-bold transition-all hover:scale-[1.02] ${plan.btn}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiLz48L3N2Zz4=')] opacity-40" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to transform your church management?
            </h2>
            <p className="mt-5 text-lg text-emerald-100">
              Join hundreds of churches already using ChurchFlow to serve their communities better.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-2xl bg-white px-8 py-4 text-sm font-bold text-emerald-700 shadow-xl transition-all hover:shadow-2xl hover:scale-105"
              >
                Start Free Today ✨
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white">
              {site.name.slice(0, 1)}
            </div>
            <span className="font-semibold text-slate-700">© {new Date().getFullYear()} {site.name}</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-emerald-600">Features</a>
            <a href="#pricing" className="hover:text-emerald-600">Pricing</a>
            <Link href="/login" className="hover:text-emerald-600">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

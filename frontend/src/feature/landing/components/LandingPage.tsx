import { Activity, BarChart2, Calendar, Target, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: <Calendar className="w-6 h-6" />,
    iconClass: 'bg-progress/15 text-progress',
    title: 'Smart Scheduling',
    desc: 'Plan your week with structured time blocks across work, study, free time and outdoor activities.',
  },
  {
    icon: <Target className="w-6 h-6" />,
    iconClass: 'bg-study/60 text-text-main',
    title: 'Goal Tracking',
    desc: 'Set weekly goals, track completion rates and celebrate every streak you build.',
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    iconClass: 'bg-freetime/60 text-text-main',
    title: 'Analytics & Insights',
    desc: 'Visual breakdowns of how you spend your time — so you can do more of what matters.',
  },
];

const BENEFITS = [
  'Visual weekly planner',
  'Category-based time tracking',
  'Progress streaks & goals',
  'Dark & light mode',
  'Available on all devices',
];

export function LandingPage() {
  return (
    <div className="min-h-full flex flex-col gap-20 py-4">

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center gap-6 pt-10">
        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-progress/15 border border-progress/25 text-progress text-sm font-semibold">
          <Activity className="w-4 h-4" />
          <span>Your personal habit tracker</span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl font-bold leading-tight max-w-2xl m-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-text-main) 0%, var(--color-progress) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Build better habits,<br />one day at a time.
        </h1>

        <p className="text-lg text-secondary max-w-xl m-0 leading-relaxed">
          Pecker helps you plan, track and understand how you spend your time —
          turning daily routines into measurable progress.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 mt-2 flex-wrap justify-center">
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3 bg-progress text-progress-text font-semibold
                       rounded-xl no-underline shadow-[0_2px_12px_rgba(128,184,134,0.3)]
                       hover:shadow-[0_4px_18px_rgba(128,184,134,0.45)] hover:-translate-y-0.5
                       transition-all duration-200"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3 bg-surface border border-border text-text-main
                       font-semibold rounded-xl no-underline hover:bg-hover
                       transition-all duration-200"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-main m-0 mb-2">Everything you need to stay consistent</h2>
          <p className="text-secondary m-0">Simple tools, powerful results.</p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {FEATURES.map(({ icon, iconClass, title, desc }) => (
            <div
              key={title}
              className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4
                         shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-200
                         hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
            >
              <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${iconClass}`}>
                {icon}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-text-main m-0">{title}</h3>
                <p className="text-sm text-secondary m-0 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefits strip ── */}
      <section
        className="bg-surface border border-border rounded-2xl p-8 flex flex-col md:flex-row
                   items-center gap-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
      >
        <div className="flex-1 flex flex-col gap-3">
          <h2 className="text-2xl font-bold text-text-main m-0">Why Pecker?</h2>
          <p className="text-secondary m-0 leading-relaxed">
            Designed to be lightweight, beautiful and distraction-free.
            Focus on building the life you want — Pecker handles the tracking.
          </p>
        </div>

        <ul className="flex-1 list-none p-0 m-0 flex flex-col gap-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-3 text-sm text-text-main font-medium">
              <CheckCircle className="w-4 h-4 text-progress shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* ── CTA bottom ── */}
      <section className="flex flex-col items-center text-center gap-6 pb-10">
        <h2 className="text-3xl font-bold text-text-main m-0">Ready to start?</h2>
        <p className="text-secondary m-0">Create your free account in seconds. No credit card required.</p>
        <Link
          to="/login"
          className="flex items-center gap-2 px-8 py-3.5 bg-progress text-progress-text font-semibold
                     rounded-xl no-underline text-base shadow-[0_2px_12px_rgba(128,184,134,0.3)]
                     hover:shadow-[0_4px_18px_rgba(128,184,134,0.45)] hover:-translate-y-0.5
                     transition-all duration-200"
        >
          Create free account
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

    </div>
  );
}

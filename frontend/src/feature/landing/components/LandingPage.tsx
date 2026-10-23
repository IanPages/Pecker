import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const FEATURES = [
  {
    title: 'Plan the week in blocks',
    desc: 'Lay out work, study, free time and outdoor hours on one weekly planner, each category in its own colour.',
  },
  {
    title: 'Track goals and streaks',
    desc: 'Set weekly goals, watch the completion rate move, and keep the streak going one day at a time.',
  },
  {
    title: 'See where the time went',
    desc: 'Visual breakdowns of how you spend your week, so you can do more of what matters.',
  },
];

const BENEFITS = [
  'Visual weekly planner',
  'Category-based time tracking',
  'Progress streaks and goals',
  'Dark and light mode',
  'Works on every device',
];

const BUTTON = 'inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold no-underline transition-colors duration-150';

export function LandingPage() {
  // The live thing: tap days to mark them done and watch the week fill up
  const [done, setDone] = useState<boolean[]>([true, true, false, true, false, false, false]);
  const count = done.filter(Boolean).length;
  const toggle = (i: number) => setDone((d) => d.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="flex flex-col gap-32 md:gap-44 w-full max-w-[1500px] mx-auto pb-8">

      {/* ── Hero ── */}
      <section className="flex flex-col gap-10 pt-6 md:pt-16">
        <h1 className="font-extrabold text-[clamp(3rem,10vw,8rem)] leading-[0.92] tracking-[-0.04em] text-balance max-w-[12ch]">
          Small pecks. Big habits.
        </h1>

        <p className="text-lg md:text-xl max-w-xl leading-relaxed">
          Pecker helps you plan, track and understand how you spend your time, turning daily routines into measurable progress.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/login" className={`${BUTTON} bg-accent text-accent-text hover:brightness-110`}>
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className={`${BUTTON} bg-surface text-text-main hover:bg-hover`}>
            Log in
          </Link>
        </div>

        {/* Live week: one tap per day */}
        <div className="bg-surface rounded-3xl p-5 md:p-8 flex flex-col gap-6">
          <p className="text-lg font-semibold">
            Try it: tap the days you showed up.{' '}
            <span className="text-secondary font-normal tabular-nums">{count} of 7 done</span>
          </p>
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {DAYS.map((day, i) => (
              <button
                key={day}
                type="button"
                aria-pressed={done[i]}
                onClick={() => toggle(i)}
                className={[
                  'h-28 md:h-40 rounded-xl flex items-end justify-center pb-3 text-sm md:text-base font-semibold',
                  'cursor-pointer transition-colors duration-150 active:scale-95',
                  done[i] ? 'bg-accent text-accent-text' : 'bg-hover text-secondary hover:text-text-main',
                ].join(' ')}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product preview ── */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-[0.98] text-balance">Your week, at a glance</h2>
          <p className="text-lg text-secondary max-w-xl leading-relaxed">
            Hours tracked, streaks, daily averages and recent activity, all on one dashboard.
          </p>
        </div>
        <div className="bg-surface rounded-3xl p-2 md:p-4">
          {/* one screenshot per theme; the hidden one is never downloaded thanks to lazy loading */}
          <img
            src="/DashboardLight.png"
            alt="Pecker dashboard showing hours tracked this week, a daily bar chart and recent activity"
            width={1582}
            height={807}
            loading="lazy"
            className="w-full h-auto rounded-2xl dark:hidden"
          />
          <img
            src="/Dashboard.png"
            alt="Pecker dashboard showing hours tracked this week, a daily bar chart and recent activity"
            width={1592}
            height={801}
            loading="lazy"
            className="w-full h-auto rounded-2xl hidden dark:block"
          />
        </div>
      </section>

      {/* ── Features: a plain ledger, no cards ── */}
      <section className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
        <h2 className="text-4xl md:text-6xl font-extrabold leading-[0.98] text-balance">
          Everything you need to stay consistent
        </h2>
        <ul className="list-none flex flex-col gap-12 md:pt-3">
          {FEATURES.map(({ title, desc }) => (
            <li key={title} className="flex flex-col gap-2">
              <h3 className="text-2xl md:text-3xl font-semibold">{title}</h3>
              <p className="text-lg text-secondary max-w-xl leading-relaxed">{desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Why: full-field colour change ── */}
      <section className="bg-text-main text-background rounded-3xl p-8 md:p-16 grid gap-10 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-[0.98]">Why Pecker?</h2>
          <p className="text-lg leading-relaxed max-w-md">
            Lightweight, quiet and distraction-free. You focus on building the life you want, and Pecker handles the tracking.
          </p>
        </div>
        <ul className="list-none flex flex-col gap-3">
          {BENEFITS.map((b) => (
            <li key={b} className="text-xl md:text-2xl font-display font-semibold">{b}</li>
          ))}
        </ul>
      </section>

      {/* ── Close ── */}
      <section className="bg-accent text-accent-text rounded-3xl p-8 md:p-16 flex flex-col gap-8 items-start">
        <h2 className="text-5xl md:text-8xl font-extrabold leading-[0.92] tracking-[-0.04em]">Ready to start?</h2>
        <p className="text-lg md:text-xl max-w-lg">Create your free account in seconds. No credit card required.</p>
        <Link to="/login" className={`${BUTTON} bg-accent-text text-accent hover:opacity-90`}>
          Create free account
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

    </div>
  );
}

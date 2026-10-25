import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BellRing, Building2, CheckCircle2, ClipboardCheck, Eye, FileCheck2, FileSearch, FlaskConical,
  Gauge, LayoutDashboard, Menu, Scale, ScrollText, Send, ShieldCheck, X,
} from 'lucide-react';
import Logo from '@/components/common/Logo';
import HeroPreview from '@/components/dashboard/HeroPreview';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/utils/constants';

const NAV = [
  ['Product', '#product'],
  ['Features', '#features'],
  ['Workflow', '#workflow'],
  ['Benefits', '#benefits'],
];

const FEATURES = [
  { icon: Send, title: 'Digital Approval Workflows', text: 'Guide applications from submission to a recorded decision through a configurable, trackable lifecycle.' },
  { icon: FileSearch, title: 'Intelligent Document Validation', text: 'Check file types, sizes and required fields instantly. Deeper OCR verification is planned for the backend.' },
  { icon: ShieldCheck, title: 'Compliance Monitoring', text: 'Follow faculty, infrastructure, intake and disclosure requirements against configurable demonstration rules.' },
  { icon: BellRing, title: 'Automated Deadline Alerts', text: 'Surface upcoming and overdue tasks with reminder schedules for every role.' },
  { icon: LayoutDashboard, title: 'Role-Based Dashboards', text: 'Separate, focused workspaces for institutes, officers and administrators.' },
  { icon: ScrollText, title: 'Transparent Audit Trails', text: 'Every simulated action is logged with actor, role, entity and time for easy review.' },
];

const STEPS = [
  { icon: Send, title: 'Submit Application', text: 'Institutes complete a guided form and attach required documents.' },
  { icon: FileCheck2, title: 'Validate Documents', text: 'Automated checks flag missing files and incomplete fields early.' },
  { icon: ClipboardCheck, title: 'Review and Scrutinize', text: 'Officers review documents, compliance items and record notes.' },
  { icon: Eye, title: 'Track Decision', text: 'Everyone sees the status, feedback and a clear activity timeline.' },
];

const BENEFITS = [
  'Reduced repetitive paperwork',
  'Improved application visibility',
  'Faster identification of missing documents',
  'Centralized compliance monitoring',
  'Transparent action history',
  'Better deadline management',
];

export default function Landing() {
  const navigate = useNavigate();
  const { session, signIn } = useAuth();
  const [menu, setMenu] = useState(false);

  const explore = () => {
    const current = session || signIn('institute');
    navigate(ROLES[current.role].home);
  };

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-40 border-b border-line bg-card/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className="text-sm font-medium text-muted hover:text-ink">{label}</a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="btn btn-ghost">Sign In</Link>
            <Link to="/login" className="btn btn-primary">Get Started</Link>
          </div>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-soft md:hidden" onClick={() => setMenu((m) => !m)} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu}>
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menu && (
          <div className="border-t border-line bg-card px-4 py-3 md:hidden">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenu(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-soft">{label}</a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
              <Link to="/login" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section id="product" className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-50 px-3 py-1 text-xs font-semibold text-accent">
                <FlaskConical size={13} aria-hidden="true" /> Prototype demonstration
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
                Transform Institutional Approvals with Intelligent Automation
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Track applications, simplify compliance, validate documents, and manage regulatory deadlines through one unified platform.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={explore} className="btn btn-primary px-6 py-3 text-base">
                  Explore Dashboard <ArrowRight size={18} aria-hidden="true" />
                </button>
                <a href="#features" className="btn btn-secondary px-6 py-3 text-base">Discover Features</a>
              </div>
              <p className="mt-4 text-xs text-muted">No sign-up needed. Explore with fictional data in demo mode.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <HeroPreview />
            </motion.div>
          </div>
        </section>

        <section id="features" className="border-y border-line bg-card py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle eyebrow="Platform capabilities" title="Everything an approval workflow needs in one place" />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }, i) => (
                <motion.article key={title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="rounded-xl border border-line bg-page p-6 transition-shadow hover:shadow-pop">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy text-white"><Icon size={20} aria-hidden="true" /></span>
                  <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle eyebrow="How it works" title="From submission to decision in four clear steps" />
            <ol className="mt-12 grid gap-8 md:grid-cols-4 md:gap-4">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                  {i < STEPS.length - 1 && (
                    <>
                      <span aria-hidden="true" className="absolute left-7 top-16 -bottom-8 w-0.5 bg-line md:hidden" />
                      <span aria-hidden="true" className="absolute left-[calc(50%+2.25rem)] top-7 hidden h-0.5 w-[calc(100%-4.5rem)] bg-gradient-to-r from-accent/60 to-line md:block" />
                    </>
                  )}
                  <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-card text-accent shadow-card">
                    <Icon size={24} aria-hidden="true" />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{i + 1}</span>
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-ink">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="benefits" className="border-y border-line bg-card py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <SectionTitle eyebrow="Benefits" title="Clarity for institutes, focus for officers" align="left" />
              <p className="mt-4 text-muted">
                Trackify brings applications, documents, compliance items and deadlines into a single view, so everyone works from the same up-to-date picture.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3 rounded-lg border border-line bg-page p-4">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                    <span className="text-sm font-medium text-ink">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-page p-6 sm:p-8">
              <h3 className="text-base font-semibold text-ink">Try each role in the demo</h3>
              <p className="mt-1 text-sm text-muted">Enter instantly with fictional data. No credentials needed.</p>
              <div className="mt-5 space-y-3">
                {[
                  ['institute', Building2],
                  ['officer', Scale],
                  ['admin', Gauge],
                ].map(([key, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { const s = signIn(key); navigate(ROLES[s.role].home); }}
                    className="flex w-full items-center gap-4 rounded-xl border border-line bg-card p-4 text-left transition-colors hover:border-accent/50 hover:bg-soft"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent"><Icon size={18} aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{ROLES[key].label}</span>
                      <span className="block text-xs text-muted">{ROLES[key].blurb}</span>
                    </span>
                    <ArrowRight size={16} className="shrink-0 text-muted" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="flex gap-3 rounded-xl border border-warning/30 bg-warning-50 p-5">
              <FlaskConical size={20} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-ink">
                <strong>About Trackify</strong> Trackify is an approval workflow and Compliance monitoring platform that help institutes manage application, tracks approvals and handle alerts through role-based dashboards.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-sidebar text-white/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="md:col-span-1">
            <Logo light />
            <p className="mt-3 text-sm leading-relaxed">Approval workflow automation, compliance monitoring and alert management. Prototype demonstration.</p>
          </div>
          <FooterCol title="Product" links={[['Overview', '#product'], ['Workflow', '#workflow'], ['Benefits', '#benefits']]} />
          <FooterCol title="Features" links={[['Capabilities', '#features'], ['Role dashboards', '#benefits']]} />
          <div>
            <h4 className="text-sm font-semibold text-white">Help and contact</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white">Sign in to the demo</Link></li>
              <li><Link to="/forgot-password" className="hover:text-white">Password help</Link></li>
              <li>Privacy: placeholder (no data leaves your browser)</li>
              <li>Contact: placeholder@demo.trackify.test</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs">
          @ 2026 Trackify. Built by Team
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ eyebrow, title, align = 'center' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">{title}</h2>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}><a href={href} className="hover:text-white">{label}</a></li>
        ))}
      </ul>
    </div>
  );
}

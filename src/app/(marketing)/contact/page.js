import Link from "next/link";
import { ArrowRight, Handshake, Headphones, Mail, PhoneCall, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Contact Nesti | Nesti AI",
  description: "Contact the Nesti AI team for support, partnerships, privacy, and platform questions.",
  alternates: {
    canonical: "https://nesti.ca/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-background-light/20 to-white">
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Contact Nesti</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-text-heading md:text-6xl">
              Let&apos;s move real estate forward.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-text-body">
              Whether you need help with Nesti, want to explore a partnership, or have a privacy question, our team is ready to listen.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-text-body">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-2">
                <Headphones size={15} className="text-primary" aria-hidden />
                Product support
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-2">
                <Handshake size={15} className="text-primary" aria-hidden />
                Partnerships
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-primary/15 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Start a conversation</p>
            <h2 className="mt-2 text-2xl font-bold text-text-heading">Choose what works for you.</h2>
            <div className="mt-6 grid gap-3">
              <a href="mailto:ravinnaraveenthiran@nesti.ca" className="group flex items-center gap-3 rounded-2xl border border-border bg-background-light/30 p-4 transition hover:border-primary/30 hover:bg-primary/[0.04]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Mail size={19} aria-hidden /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-text-heading">Email the team</span><span className="mt-1 block break-all text-xs text-text-muted">ravinnaraveenthiran@nesti.ca</span></span>
                <ArrowRight size={16} className="shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
              </a>
              <a href="tel:+14165654791" className="group flex items-center gap-3 rounded-2xl border border-border bg-background-light/30 p-4 transition hover:border-primary/30 hover:bg-primary/[0.04]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><PhoneCall size={19} aria-hidden /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-text-heading">Call the team</span><span className="mt-1 block text-xs text-text-muted">+1 (416) 565-4791</span></span>
                <ArrowRight size={16} className="shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm"><Headphones className="text-primary" size={22} aria-hidden /><h2 className="mt-4 text-lg font-bold text-text-heading">Product support</h2><p className="mt-2 text-sm leading-6 text-text-body">Questions about your account, workspace, leads, or Nesti features?</p></div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm"><Handshake className="text-primary" size={22} aria-hidden /><h2 className="mt-4 text-lg font-bold text-text-heading">Partnerships</h2><p className="mt-2 text-sm leading-6 text-text-body">Tell us how your team, brokerage, or service can work with Nesti.</p></div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm"><ShieldCheck className="text-primary" size={22} aria-hidden /><h2 className="mt-4 text-lg font-bold text-text-heading">Privacy questions</h2><p className="mt-2 text-sm leading-6 text-text-body">Send privacy, data, or compliance requests directly to our team.</p></div>
        </div>
        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-primary/15 bg-primary/[0.05] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div><h2 className="text-xl font-bold text-text-heading">Looking for answers first?</h2><p className="mt-1 text-sm text-text-body">Browse common questions about Nesti and how it works.</p></div>
          <Link href="/faq" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-dark">Visit the FAQ<ArrowRight size={16} aria-hidden /></Link>
        </div>
      </section>
    </div>
  );
}
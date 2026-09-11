import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-6 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(52,199,89,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(52,199,89,0.06),_transparent_45%)]" />

      <div className="relative z-10 mx-auto w-full max-w-lg text-center">
        <Image
          src="/logo/logo.png"
          alt="Nesti AI"
          width={44}
          height={44}
          className="mx-auto h-11 w-11 rounded-xl object-cover"
          priority
        />

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/80">
          404
        </p>

        <h1 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-semibold tracking-tight text-text-heading sm:text-4xl">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-7 text-text-muted">
          This link doesn’t lead anywhere. It may have been moved or removed.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 min-w-[10.5rem] items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <Home size={15} />
            Home
          </Link>
          <Link
            href="/about"
            className="inline-flex h-11 min-w-[10.5rem] items-center justify-center gap-2 rounded-full border border-border bg-white/70 px-6 text-sm font-semibold text-text-heading transition hover:border-primary/30 hover:text-primary"
          >
            About Nesti
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

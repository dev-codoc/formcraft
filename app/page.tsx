import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { CTASection } from '@/components/landing/CTASection';
import Link from 'next/link';
import { PencilRuler, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DemoSection />
      <CTASection />
      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display font-semibold text-foreground"
        >
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
            <PencilRuler className="h-3.5 w-3.5" />
          </span>
          FormCraft
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link href="#demo" className="transition-colors hover:text-foreground">
            Demo
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/login"
            className="rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/builder"
            className="flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start building
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-6 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="field-id">formcraft_ai</span>
          <span>· © {new Date().getFullYear()}</span>
        </div>
        <p className="text-xs text-muted-foreground">Built with Next.js &amp; OpenRouter</p>
      </div>
    </footer>
  );
}

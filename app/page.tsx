import { HeroSection } from '@/app/components/landing/HeroSection';
import { FeaturesSection } from '@/app/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/app/components/landing/HowItWorksSection';
import { DemoSection } from '@/app/components/landing/DemoSection';
import { CTASection } from '@/app/components/landing/CTASection';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative">
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-transparent">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-medium">
          <span className="text-[#7C3AED]">{'<>'}</span>
          FormCraft AI
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-[#71717A]">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#" className="hover:text-white transition-colors">How it works</Link>
          <Link href="#demo" className="hover:text-white transition-colors">Demo</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#A1A1AA] hover:text-white transition-colors px-3 py-2">
            Sign in
          </Link>
          <Link
            href="/builder"
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Start building
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1E1E2E] py-8">
      <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-[#71717A]">
          <span className="text-[#7C3AED]">{'<>'}</span>
          FormCraft AI · © {new Date().getFullYear()}
        </div>
        <p className="text-xs text-[#52525B]">Built with Next.js & OpenRouter</p>
      </div>
    </footer>
  );
}
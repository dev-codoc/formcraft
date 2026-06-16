'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Something went wrong');
        setLoading(false);
        return;
      }

      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.error('Account created — please sign in');
        router.push('/login');
        return;
      }

      router.push('/dashboard');
    } catch {
      toast.error('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0A0F] px-6 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#7C3AED] rounded-full opacity-[0.12] blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#2DD4BF] rounded-full opacity-[0.12] blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <Link href="/" className="flex items-center justify-center gap-2 text-white font-medium mb-8">
          <span className="text-[#7C3AED]">{'<>'}</span>
          FormCraft AI
        </Link>

        <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6">
          <h1 className="text-xl font-medium text-white mb-1">Create your account</h1>
          <p className="text-sm text-[#71717A] mb-6">Start building AI-powered forms</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm text-[#A1A1AA]">Name</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="bg-[#0A0A0F] border-[#1E1E2E] text-white placeholder:text-[#52525B] focus-visible:ring-[#7C3AED]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-[#A1A1AA]">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-[#0A0A0F] border-[#1E1E2E] text-white placeholder:text-[#52525B] focus-visible:ring-[#7C3AED]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-[#A1A1AA]">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="bg-[#0A0A0F] border-[#1E1E2E] text-white placeholder:text-[#52525B] focus-visible:ring-[#7C3AED]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Create account
            </Button>
          </form>

          <p className="text-sm text-[#71717A] text-center mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[#A78BFA] hover:text-white transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
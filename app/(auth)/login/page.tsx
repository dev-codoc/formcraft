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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      toast.error('Invalid email or password');
      return;
    }

    router.push('/dashboard');
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
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
          <h1 className="text-xl font-medium text-white mb-1">Welcome back</h1>
          <p className="text-sm text-[#71717A] mb-6">Sign in to manage your forms</p>

          <Button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            variant="outline"
            className="w-full bg-transparent border-[#1E1E2E] text-white hover:bg-[#1E1E2E] mb-4"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#1E1E2E]" />
            <span className="text-xs text-[#52525B]">or</span>
            <div className="flex-1 h-px bg-[#1E1E2E]" />
          </div>

          <form onSubmit={handleCredentialsLogin} className="space-y-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#0A0A0F] border-[#1E1E2E] text-white placeholder:text-[#52525B] focus-visible:ring-[#7C3AED]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Sign in
            </Button>
          </form>

          <p className="text-sm text-[#71717A] text-center mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#A78BFA] hover:text-white transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
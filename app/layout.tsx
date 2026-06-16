import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'FormCraft AI — Describe it. Ship it.',
  description:
    'AI-powered form builder. Describe your form in plain English, get a validated schema, embeddable link, and response analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="bg-[#0A0A0F] text-white font-sans antialiased">
        {children}
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'GymPro — Gestão Inteligente de Academias',
    template: '%s | GymPro',
  },
  description:
    'Plataforma SaaS para gestão completa de academias. Fichas de treino digitais, controle financeiro, manutenção de equipamentos e muito mais.',
  keywords: ['academia', 'gestão', 'saas', 'fichas de treino', 'fitness'],
  authors: [{ name: 'GymPro Team' }],
  creator: 'GymPro',
  metadataBase: new URL('https://gympro.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'GymPro',
    description: 'Plataforma SaaS para gestão inteligente de academias.',
    siteName: 'GymPro',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7d14ff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}

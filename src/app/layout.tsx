import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'RepoDocs - Git to Docs in 30 Seconds',
    template: '%s | RepoDocs',
  },
  description: 'The most reliable & high-performance bridge between Git and Docs. Turn your GitHub repo into beautiful documentation instantly.',
  keywords: ['documentation', 'github', 'markdown', 'docs', 'developer tools'],
  authors: [{ name: 'RepoDocs' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://repodocs.dev',
    siteName: 'RepoDocs',
    title: 'RepoDocs - Git to Docs in 30 Seconds',
    description: 'Turn your GitHub repo into beautiful documentation instantly.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RepoDocs - Git to Docs in 30 Seconds',
    description: 'Turn your GitHub repo into beautiful documentation instantly.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

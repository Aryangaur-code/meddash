import type { Metadata } from 'next';
import { Inter, IBM_Plex_Sans, IBM_Plex_Serif, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({ subsets: ['latin'] });
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
});
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "AI Medical Co-Pilot",
  description: "Clinical AI Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.className} ${ibmPlexSans.variable} ${ibmPlexSerif.variable} ${ibmPlexMono.variable}`}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

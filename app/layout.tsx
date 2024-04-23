import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';
import Breadcrumbs from '@components/Breadcrumbs';
import NavBar from '@components/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Invoice Visard',
  description: 'Invoice Visard is a simple invoicing app for freelancers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        className="bg-white text-gray-950 duration-300"
        data-theme="bumblebee"
        lang="en"
      >
        <body className={inter.className}>
          <main className="flex min-h-screen flex-col gap-5 px-8">
            <NavBar />
            <Breadcrumbs />
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}

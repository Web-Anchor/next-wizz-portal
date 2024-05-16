import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';
import { classNames } from '@helpers/index';
import { Toaster } from 'sonner';

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
        className="h-full bg-white text-gray-950 duration-300"
        data-theme="bumblebee"
        lang="en"
      >
        <body className={classNames(inter.className, 'h-full')}>
          <Toaster
            // richColors // enable rich colors
            // closeButton // close button cta on toast
            position="top-center" // toast position
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

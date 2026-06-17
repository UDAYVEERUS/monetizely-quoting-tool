import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monetizely Quoting Tool',
  description: 'A professional SaaS quoting tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <a href="/" className="text-2xl font-bold text-green-600">
                  Monetizely
                </a>
              </div>
              <div className="hidden space-x-8 md:flex">
                <a href="/catalog" className="text-gray-600 hover:text-gray-900">
                  Catalog
                </a>
                <a href="/quotes" className="text-gray-600 hover:text-gray-900">
                  Quotes
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}

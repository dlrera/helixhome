import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '900'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Home Portal',
  description: 'Your home maintenance management system',
}

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  }
}

// Inline script to prevent FOUC by applying theme before page renders
const themeScript = `
(function() {
  try {
    var prefs = localStorage.getItem('helix-user-preferences');
    if (prefs) {
      var parsed = JSON.parse(prefs);
      var theme = parsed.theme;
      var isDark = theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#216093] focus:text-white focus:px-4 focus:py-3 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#216093]"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}

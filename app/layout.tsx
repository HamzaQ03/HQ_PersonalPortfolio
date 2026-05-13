import type { Metadata } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import '../styles/globals.css'
import ShellWrapper from '@/components/ShellWrapper'
import SmoothScrollProvider from '@/components/SmoothScrollProvider'
import Splash from '@/components/Splash'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'Hamza Qureshi',
  description: 'Portfolio of Hamza Qureshi',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased" style={{ background: '#000000', color: '#f0f0f0' }}>
        {/* Vignette + grain — inner pages only, splash has its own bg */}
        <div aria-hidden="true" style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 40%, #0d0d0d 0%, #000000 70%)',
        }} />
        <svg aria-hidden="true" style={{
          position: 'fixed', inset: 0, width: '100%', height: '100%',
          zIndex: 0, pointerEvents: 'none', opacity: 0.03,
        }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        <SmoothScrollProvider>
          <ShellWrapper>
            {children}
            <Splash />
          </ShellWrapper>
        </SmoothScrollProvider>
      </body>
    </html>
  )
}

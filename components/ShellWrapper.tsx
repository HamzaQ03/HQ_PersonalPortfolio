'use client'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import DotSideNav from '@/components/DotSideNav'
import CustomCursor from '@/components/CustomCursor'
import SpotlightOverlay from '@/components/SpotlightOverlay'
import PageTransition from '@/components/PageTransition'
import VisitTracker from '@/components/VisitTracker'

const HamzasIntel = dynamic(() => import('@/components/HamzasIntel'), { ssr: false })

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname()
  const isSplash    = pathname === '/'
  const isDashboard = pathname === '/dashboard'
  const showShell   = !isSplash && !isDashboard

  // The hard-refresh redirect gate used to live here as a fixed black
  // overlay that would briefly cover the page until the useEffect
  // redirected the user to /. The gate relied on `splashState.shown`
  // (read from localStorage at render time), which returns false during
  // SSR because localStorage doesn't exist server-side — so the gate
  // would render in the HTML payload, get hydrated, and then never
  // properly clear because React had no state dependency to trigger a
  // re-render when the client-side value flipped to true. End result:
  // a permanent black overlay covering the page after every refresh.
  // The Splash component now handles the equivalent logic correctly:
  // it short-circuits to splashDone on refresh and only plays for the
  // first-ever visit. The gate is gone.

  return (
    <>
      <CustomCursor />
      <SpotlightOverlay />
      <PageTransition />
      {showShell && <Navbar />}
      {showShell && <DotSideNav />}
      {showShell && <HamzasIntel />}
      <VisitTracker />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </>
  )
}

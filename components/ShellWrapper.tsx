'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import DotSideNav from '@/components/DotSideNav'
import CustomCursor from '@/components/CustomCursor'
import SpotlightOverlay from '@/components/SpotlightOverlay'
import PageTransition from '@/components/PageTransition'
import VisitTracker from '@/components/VisitTracker'
import { splashState } from '@/lib/splashState'

const HamzasIntel = dynamic(() => import('@/components/HamzasIntel'), { ssr: false })

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname()
  const router      = useRouter()
  const isSplash    = pathname === '/'
  const isDashboard = pathname === '/dashboard'
  const showShell   = !isSplash && !isDashboard

  // Gate: if an inner page is loaded directly (hard refresh) before the splash
  // has been completed this session, redirect silently to /.
  const needsGate = !isSplash && !isDashboard && !splashState.shown

  useEffect(() => {
    if (needsGate) {
      router.replace('/')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* Black gate — only visible while still on the inner page, clears the
          instant pathname becomes '/' after the redirect */}
      {needsGate && (
        <div style={{
          position: 'fixed', inset: 0,
          background: '#000000',
          zIndex: 99999,
          pointerEvents: 'none',
        }} />
      )}

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

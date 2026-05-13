let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return audioCtx
}

export function playClickSound() {
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Main tone: C6 (1046Hz), very soft
    const g1 = ctx.createGain()
    g1.gain.setValueAtTime(0, now)
    g1.gain.linearRampToValueAtTime(0.12, now + 0.006)
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    g1.connect(ctx.destination)

    const o1 = ctx.createOscillator()
    o1.type = 'sine'
    o1.frequency.setValueAtTime(1046, now)
    o1.frequency.linearRampToValueAtTime(1040, now + 0.12)
    o1.connect(g1)
    o1.start(now); o1.stop(now + 0.2)

    // Harmonic: 2093Hz (C7)
    const g2 = ctx.createGain()
    g2.gain.setValueAtTime(0, now)
    g2.gain.linearRampToValueAtTime(0.04, now + 0.004)
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    g2.connect(ctx.destination)

    const o2 = ctx.createOscillator()
    o2.type = 'sine'
    o2.frequency.setValueAtTime(2093, now)
    o2.connect(g2)
    o2.start(now); o2.stop(now + 0.1)
  } catch {
    // AudioContext blocked or unavailable — fail silently
  }
}

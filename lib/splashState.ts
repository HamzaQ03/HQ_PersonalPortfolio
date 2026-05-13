// Splash gate state — backed by localStorage so it survives HMR
// module re-evaluation and browser/tab restarts.
// Only resets when the user explicitly clears browser storage.

const SESSION_KEY = 'hq_splash_shown'

// Module-level cache so repeated reads don't hit localStorage every time
let _cache: boolean | null = null

function readShown(): boolean {
  if (_cache !== null) return _cache
  try {
    _cache = localStorage.getItem(SESSION_KEY) === '1'
  } catch {
    _cache = false
  }
  return _cache
}

export const splashState = {
  get shown(): boolean {
    return readShown()
  },
  markShown(): void {
    _cache = true
    try {
      localStorage.setItem(SESSION_KEY, '1')
    } catch {
      // Private browsing or storage blocked — fail silently
    }
  },
}

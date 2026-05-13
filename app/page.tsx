// Root route — the layout-level Splash overlay handles the intro.
// Rendering null keeps pathname === '/' so ShellWrapper's gate
// (needsGate = !isSplash && !splashState.shown) stays false.
export default function Root() {
  return null
}

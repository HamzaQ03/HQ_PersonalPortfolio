export default function Footer() {
  return (
    <footer
      className="border-t border-gold/20 px-6 md:px-12 lg:px-24 py-6"
      style={{ boxShadow: '0 -1px 0 rgba(200,149,34,0.08)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="font-mono text-white/30 text-xs tracking-widest">
          {/* TODO #12 — Update name */}
          © {new Date().getFullYear()} FULL NAME HERE
        </p>
        <p className="font-mono text-white/20 text-xs">
          Built with <span className="text-gold/50">Next.js</span>
        </p>
      </div>
    </footer>
  )
}

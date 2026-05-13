'use client'
import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { playClickSound } from '@/lib/sound'

type Role = 'user' | 'assistant'
type Message = { role: Role; content: string }
type HistoryEntry = { role: 'user' | 'model'; parts: [{ text: string }] }

const OPEN_MESSAGE: Message = {
  role: 'assistant',
  content:
    "Hello! I'm Hamza's Intel. Ask me anything about Hamza's background, experience, skills, certifications, or projects.",
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px 12px 12px 2px',
        padding: '10px 14px',
        display: 'flex',
        gap: 5,
        alignItems: 'center',
      }}
    >
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#c8a87c',
            display: 'inline-block',
            animation: `intel-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default function HamzasIntel() {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [history, setHistory]     = useState<HistoryEntry[]>([])
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  // Inject opening message the first time the window opens
  const openedOnce = useRef(false)
  useEffect(() => {
    if (open && !openedOnce.current) {
      openedOnce.current = true
      setMessages([OPEN_MESSAGE])
    }
  }, [open])

  // Auto-scroll to bottom whenever messages change or typing indicator appears
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when window opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 220)
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    playClickSound()

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/hamzas-intel', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text, history }),
      })
      const data = await res.json()
      const reply: string = data.reply ?? "Sorry, I couldn't get a response. Please try again."

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      setHistory(prev => [
        ...prev,
        { role: 'user',  parts: [{ text }] },
        { role: 'model', parts: [{ text: reply }] },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  function toggleOpen() {
    playClickSound()
    setOpen(v => !v)
  }

  function handleClose() {
    playClickSound()
    setOpen(false)
  }

  return (
    <>
      {/* ── Keyframe injection ─────────────────────────────────────────── */}
      <style>{`
        @keyframes intel-bubble-pulse {
          0%, 100% { border-color: rgba(200,168,124,0.4); box-shadow: 0 0 20px rgba(200,168,124,0.15); }
          50%       { border-color: rgba(200,168,124,0.8); box-shadow: 0 0 30px rgba(200,168,124,0.3);  }
        }
        @keyframes intel-dot-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%           { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes intel-tooltip-pulse {
          0%, 100% { opacity: 0.6; }
          50%      { opacity: 1;   }
        }
        .intel-bubble {
          animation: intel-bubble-pulse 3s ease-in-out infinite;
        }
        .intel-bubble:hover {
          border-color: rgba(200,168,124,0.8) !important;
          box-shadow: 0 0 30px rgba(200,168,124,0.3) !important;
          animation: none;
        }
        .intel-send-btn:hover { opacity: 0.7; }
        .intel-close-btn:hover { color: #c8a87c !important; }
        .intel-messages::-webkit-scrollbar { width: 4px; }
        .intel-messages::-webkit-scrollbar-track { background: transparent; }
        .intel-messages::-webkit-scrollbar-thumb { background: rgba(200,168,124,0.15); border-radius: 2px; }
      `}</style>

      {/* ── Floating bubble + tooltip ──────────────────────────────────── */}
      <div className="hidden md:block" style={{ position: 'fixed', bottom: 28, right: 24, zIndex: 50 }}>

        {/* Intel Available tooltip — hidden when chat is open */}
        {!open && (
          <>
            {/* Tooltip box — right-aligned to bubble's right edge */}
            <div style={{
              position:      'absolute',
              bottom:        'calc(100% + 12px)',
              right:         0,
              whiteSpace:    'nowrap',
              fontFamily:    'var(--font-jetbrains-mono)',
              fontSize:      10,
              color:         '#c8a87c',
              background:    'rgba(0,0,0,0.85)',
              border:        '1px solid rgba(200,168,124,0.3)',
              borderRadius:  6,
              padding:       '5px 10px',
              letterSpacing: 1,
              animation:     'intel-tooltip-pulse 3s ease-in-out infinite',
            }}>
              Intel Available
            </div>
            {/* Arrow — centered over the 52px bubble (right: 21px = 52/2 − 5px half-width) */}
            <div style={{
              position:    'absolute',
              bottom:      'calc(100% + 7px)',
              right:       21,
              width:       0,
              height:      0,
              borderLeft:  '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop:   '5px solid rgba(200,168,124,0.3)',
              animation:   'intel-tooltip-pulse 3s ease-in-out infinite',
            }} />
          </>
        )}

        <button
          onClick={toggleOpen}
          className="intel-bubble"
          aria-label="Open Hamza's Intel chat"
          style={{
            display:        'flex',
            width:          52,
            height:         52,
            borderRadius:   '50%',
            background:     '#000000',
            border:         '1px solid rgba(200,168,124,0.4)',
            alignItems:     'center',
            justifyContent: 'center',
            fontFamily:     'var(--font-space-grotesk)',
            fontWeight:     700,
            fontSize:       14,
            color:          '#c8a87c',
            letterSpacing:  1,
          }}
        >
          HQ
        </button>
      </div>

      {/* ── Chat window ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1,    opacity: 1 }}
            exit={{    scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position:       'fixed',
              bottom:         92,
              right:          28,
              zIndex:         50,
              width:          360,
              height:         500,
              background:     'rgba(0,0,0,0.92)',
              border:         '1px solid rgba(200,168,124,0.2)',
              borderRadius:   12,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow:      '0 0 40px rgba(0,0,0,0.6)',
              display:        'flex',
              flexDirection:  'column',
              transformOrigin: 'bottom right',
              overflow:       'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              height:       52,
              borderBottom: '1px solid rgba(200,168,124,0.1)',
              padding:      '0 14px',
              display:      'flex',
              alignItems:   'center',
              gap:          10,
              flexShrink:   0,
            }}>
              {/* HQ avatar */}
              <div style={{
                width:          28,
                height:         28,
                borderRadius:   '50%',
                background:     '#000',
                border:         '1px solid rgba(200,168,124,0.35)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontFamily:     'var(--font-space-grotesk)',
                fontWeight:     700,
                fontSize:       9,
                color:          '#c8a87c',
                letterSpacing:  0.5,
                flexShrink:     0,
              }}>HQ</div>

              {/* Name + status */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily:    'var(--font-space-grotesk)',
                  fontSize:      13,
                  fontWeight:    600,
                  color:         '#f0f0f0',
                  letterSpacing: 0.5,
                  margin:        0,
                  lineHeight:    1.2,
                }}>Hamza&apos;s Intel</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#22c55e', display: 'inline-block', flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-jetbrains-mono)',
                    fontSize:   9,
                    color:      'rgba(200,168,124,0.5)',
                  }}>Online</span>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="intel-close-btn"
                aria-label="Close chat"
                style={{
                  background:  'none',
                  border:      'none',
                  color:       'rgba(200,168,124,0.6)',
                  fontSize:    20,
                  lineHeight:  1,
                  padding:     '0 2px',
                  flexShrink:  0,
                  transition:  'color 150ms',
                }}
              >×</button>
            </div>

            {/* Messages */}
            <div
              className="intel-messages"
              style={{
                flex:          1,
                overflowY:     'auto',
                padding:       16,
                display:       'flex',
                flexDirection: 'column',
                gap:           12,
              }}
            >
              {messages.map((msg, i) =>
                msg.role === 'user' ? (
                  <div
                    key={i}
                    style={{
                      alignSelf:    'flex-end',
                      background:   'rgba(200,168,124,0.1)',
                      border:       '1px solid rgba(200,168,124,0.15)',
                      borderRadius: '12px 12px 2px 12px',
                      maxWidth:     '80%',
                      padding:      '8px 12px',
                      fontSize:     12,
                      color:        '#f0f0f0',
                      lineHeight:   1.5,
                      wordBreak:    'break-word',
                    }}
                  >
                    {msg.content}
                  </div>
                ) : (
                  <div
                    key={i}
                    style={{
                      alignSelf:    'flex-start',
                      background:   'rgba(255,255,255,0.04)',
                      border:       '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px 12px 12px 2px',
                      maxWidth:     '85%',
                      padding:      '8px 12px',
                      fontSize:     12,
                      color:        '#e0e0e0',
                      lineHeight:   1.5,
                      wordBreak:    'break-word',
                    }}
                  >
                    {msg.content}
                  </div>
                )
              )}

              {loading && <TypingDots />}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{
              borderTop: '1px solid rgba(200,168,124,0.1)',
              padding:   12,
              display:   'flex',
              gap:       8,
              flexShrink: 0,
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                placeholder="Ask about Hamza..."
                style={{
                  flex:         1,
                  background:   'rgba(255,255,255,0.04)',
                  border:       '1px solid rgba(200,168,124,0.15)',
                  borderRadius: 8,
                  color:        '#f0f0f0',
                  fontSize:     12,
                  padding:      '8px 12px',
                  outline:      'none',
                  fontFamily:   'var(--font-jetbrains-mono)',
                  transition:   'border-color 150ms',
                  opacity:      loading ? 0.6 : 1,
                }}
                onFocus={e  => (e.target.style.borderColor = 'rgba(200,168,124,0.5)')}
                onBlur={e   => (e.target.style.borderColor = 'rgba(200,168,124,0.15)')}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="intel-send-btn"
                aria-label="Send message"
                style={{
                  background:  'none',
                  border:      'none',
                  color:       '#c8a87c',
                  fontSize:    18,
                  padding:     '0 8px',
                  transition:  'opacity 150ms',
                  opacity:     loading || !input.trim() ? 0.3 : 1,
                  flexShrink:  0,
                }}
              >→</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

'use client'
import { useEffect, useState } from 'react'

export function useTypewriter(
  text: string,
  speed: number = 28,
  startDelay: number = 0,
  enabled: boolean = true
): { displayed: string; isDone: boolean } {
  const [displayed, setDisplayed] = useState(enabled ? '' : text)
  const [isDone, setIsDone] = useState(!enabled)

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text)
      setIsDone(true)
      return
    }

    setDisplayed('')
    setIsDone(false)

    let idx = 0
    let timeoutId: ReturnType<typeof setTimeout>

    const startTimer = setTimeout(() => {
      const tick = () => {
        idx++
        setDisplayed(text.slice(0, idx))
        if (idx < text.length) {
          timeoutId = setTimeout(tick, speed)
        } else {
          setIsDone(true)
        }
      }
      tick()
    }, startDelay)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(timeoutId)
    }
  }, [text, speed, startDelay, enabled])

  return { displayed, isDone }
}

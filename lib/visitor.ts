'use client'

const STORAGE_KEY = 'hq_id'
const SESSION_KEY = 'hq_sid'

function makeUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.localStorage.getItem(STORAGE_KEY)
    if (!id) {
      id = makeUUID()
      window.localStorage.setItem(STORAGE_KEY, id)
    }
    return id
  } catch {
    return makeUUID()
  }
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let sid = window.sessionStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = makeUUID()
      window.sessionStorage.setItem(SESSION_KEY, sid)
    }
    return sid
  } catch {
    return makeUUID()
  }
}

export function resetSession(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(SESSION_KEY)
  } catch {}
}

export function getLanguage(): string {
  if (typeof navigator === 'undefined') return 'unknown'
  return navigator.language || 'unknown'
}

export function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
  } catch {
    return 'unknown'
  }
}

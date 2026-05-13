// Middleware intentionally left as passthrough.
// Splash gating is handled client-side via splashState.ts
import { NextResponse } from 'next/server'
export function middleware() { return NextResponse.next() }
export const config = { matcher: [] }

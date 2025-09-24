import { NextRequest, NextResponse } from 'next/server'
import { clearAdminSession } from '@/lib/cookies'

export async function POST(req: NextRequest) {
  clearAdminSession()
  return NextResponse.redirect(new URL('/admin/login', req.url))
}

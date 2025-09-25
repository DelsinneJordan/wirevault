import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect('/admin/login')
  res.cookies.delete('wv_admin')
  return res
}

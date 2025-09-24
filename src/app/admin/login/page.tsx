import { authenticate } from '@/lib/auth'
import { setAdminSession, getAdminSession } from '@/lib/cookies'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const existing = getAdminSession()
  if (existing) redirect('/admin')

  async function login(formData: FormData) {
    'use server'
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')
    const u = await authenticate(email, password)
    if (!u) throw new Error('Invalid credentials')
    setAdminSession(u.email)
    redirect('/admin')
  }

  return (
    <form action={login} className="max-w-sm mx-auto card grid gap-3">
      <h2 className="text-xl font-semibold">Admin login</h2>
      <input name="email" type="email" required placeholder="Email" className="border rounded-xl px-3 py-2" />
      <input name="password" type="password" required placeholder="Password" className="border rounded-xl px-3 py-2" />
      <button className="btn-brand" type="submit">Sign in</button>
    </form>
  )
}

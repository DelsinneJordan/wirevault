import Link from 'next/link'
export default function Page() {
  return (
    <div className="grid gap-8">
      <section className="rounded-2xl bg-gradient-to-br from-brand/10 to-accent/10 p-10">
        <h1 className="text-3xl font-bold">WireVault</h1>
        <p className="mt-2 text-gray-700">Scan. Enter PIN. Access your electrical board dossier securely.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/b/DEMO01" className="btn-brand">Try DEMO01</Link>
          <Link href="/admin" className="btn-ghost">Admin</Link>
        </div>
      </section>
    </div>
  )
}

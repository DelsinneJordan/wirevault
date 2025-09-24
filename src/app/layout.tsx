import './globals.css'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = { title: 'WireVault – Up2Charge', description: 'Secure board dossiers via QR + PIN' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b sticky top-0 z-40 bg-white/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo-up2charge.svg" alt="Up2Charge" width={28} height={28} />
              <span className="font-semibold">WireVault</span>
            </Link>
            <nav className="ml-auto flex gap-3">
              <Link className="btn-ghost" href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
            © {new Date().getFullYear()} Up2Charge – WireVault
          </div>
        </footer>
      </body>
    </html>
  )
}

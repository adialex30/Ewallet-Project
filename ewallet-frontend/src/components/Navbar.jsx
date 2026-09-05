import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-primary-light text-primary' : 'text-ink/60 hover:text-ink'
  }`

const mobileLinkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-primary-light text-primary' : 'text-ink/70 hover:bg-paper'
  }`

export default function Navbar() {
  const { email, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Admin's job here is user management + oversight, not a personal wallet,
  // so Dashboard/Profil are User-only; Kelola Pengguna is Admin-only.
  // Riwayat Transaksi is shared by both (everyone, admin included, has a wallet).
  const links = isAdmin
    ? [
        { to: '/admin/users', label: 'Kelola Pengguna' },
        { to: '/transactions', label: 'Riwayat Transaksi' },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/transactions', label: 'Riwayat Transaksi' },
        { to: '/profile', label: 'Profil' },
      ]

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg font-semibold tracking-tight">Dompi</span>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden text-sm text-ink/60 sm:inline">{email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="hidden rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-paper md:inline-block"
          >
            Keluar
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Buka menu"
            aria-expanded={menuOpen}
            className="rounded-md p-2 text-ink/70 hover:bg-paper md:hidden"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-line bg-white px-4 py-3 md:hidden">
          <p className="px-3 pb-2 text-sm text-ink/50">{email}</p>
          <div className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 w-full rounded-md border border-line px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-paper"
          >
            Keluar
          </button>
        </nav>
      )}
    </header>
  )
}

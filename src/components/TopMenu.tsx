"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useState } from "react";
import NotificationBell from "@/components/ui/NotificationBell";

export default function TopMenu() {
  const { data: session } = useSession();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <img src="/img/GoGo.png" alt="Logo" className="h-9" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            Go<span className="text-indigo-600">Go</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/providers">Providers</NavLink>
          {session && session.user.role !== "admin" && (
            <NavLink href="/rentals">My Rentals</NavLink>
          )}
          {session && session.user.role !== "admin" && (
            <Link
              href="/rentals/manage"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Cart
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}
          {session?.user.role === "admin" && (
            <NavLink href="/admin">Admin</NavLink>
          )}
        </nav>

        {/* Auth + Notifications */}
        <div className="hidden md:flex items-center gap-2">
          {session && <NotificationBell />}
          {session ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-sm">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-slate-700 max-w-[120px] truncate">
                  {session.user.name}
                </span>
                {session.user.role === "admin" && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
                    admin
                  </span>
                )}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Sign out"
              >
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          <MobileLink href="/providers" onClick={() => setMobileOpen(false)}>Providers</MobileLink>
          {session && session.user.role !== "admin" && (
            <MobileLink href="/rentals" onClick={() => setMobileOpen(false)}>My Rentals</MobileLink>
          )}
          {session && session.user.role !== "admin" && (
            <MobileLink href="/rentals/manage" onClick={() => setMobileOpen(false)}>
              Cart ({cartItems.length})
            </MobileLink>
          )}
          {session?.user.role === "admin" && (
            <MobileLink href="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</MobileLink>
          )}
          <hr className="my-2 border-slate-100" />
          {session ? (
            <button
              onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          ) : (
            <>
              <MobileLink href="/login" onClick={() => setMobileOpen(false)}>Sign in</MobileLink>
              <MobileLink href="/register" onClick={() => setMobileOpen(false)}>Register</MobileLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
      {children}
    </Link>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">
      {children}
    </Link>
  );
}

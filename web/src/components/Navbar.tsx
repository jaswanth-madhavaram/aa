"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [status, setStatus] = useState<string>("Checking...");
  const [statusOk, setStatusOk] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => {
        setStatus(`${d.medicines_in_db} Medicines`);
        setStatusOk(d.status === "ok");
      })
      .catch(() => {
        setStatus("Offline");
        setStatusOk(false);
      });
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    { href: "/upload", label: "Upload Rx" },
    { href: "/browse", label: "Browse" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              💊
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              Medico<span className="text-emerald-600">.AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  pathname === link.href
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                statusOk
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-orange-50 text-orange-700 border-orange-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  statusOk ? "bg-emerald-500 animate-pulse" : "bg-orange-500"
                }`}
              />
              {status}
            </div>

            {session?.user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="text-sm font-bold text-emerald-700 hover:text-emerald-800"
                >
                  {session.user.name}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-xs font-bold text-gray-500 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm font-bold text-emerald-700 border-2 border-emerald-300 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 text-sm font-bold text-white bg-emerald-600 border-2 border-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-bold ${
                pathname === link.href
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

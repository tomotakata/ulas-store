"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              <span className="text-cyan-400">ULAS</span>
              <span className="text-white/80 text-lg font-normal ml-1">O3 finger</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-white/70 hover:text-white text-sm transition-colors">
              特徴
            </Link>
            <Link href="/#reservation" className="text-white/70 hover:text-white text-sm transition-colors">
              予約する
            </Link>
            <Link href="/tokushoho" className="text-white/70 hover:text-white text-sm transition-colors">
              特定商取引法
            </Link>
            {user ? (
              <>
                <Link
                  href="/mypage"
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  マイページ
                </Link>
                {user.isAdmin && (
                  <Link href="/admin" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                    管理画面
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                href="/mypage"
                className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm px-4 py-2 rounded-full transition-colors"
              >
                ログイン
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white"></div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 flex flex-col gap-4">
            <Link href="/#features" className="text-white/70 text-sm" onClick={() => setMenuOpen(false)}>
              特徴
            </Link>
            <Link href="/#reservation" className="text-white/70 text-sm" onClick={() => setMenuOpen(false)}>
              予約する
            </Link>
            <Link href="/tokushoho" className="text-white/70 text-sm" onClick={() => setMenuOpen(false)}>
              特定商取引法
            </Link>
            {user ? (
              <>
                <Link href="/mypage" className="text-white/70 text-sm" onClick={() => setMenuOpen(false)}>
                  マイページ
                </Link>
                {user.isAdmin && (
                  <Link href="/admin" className="text-cyan-400 text-sm" onClick={() => setMenuOpen(false)}>
                    管理画面
                  </Link>
                )}
                <button onClick={handleLogout} className="text-white/70 text-sm text-left">
                  ログアウト
                </button>
              </>
            ) : (
              <Link href="/mypage" className="text-cyan-400 text-sm" onClick={() => setMenuOpen(false)}>
                ログイン
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

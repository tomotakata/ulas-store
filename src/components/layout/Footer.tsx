import Link from "next/link";
import { COMPANY } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#0a0f1e] text-white/60 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="text-xl font-bold text-white mb-2">
              <span className="text-cyan-400">ULAS</span> O3 finger
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              水からオゾン水を生成する<br />コンパクトタイプのオゾン水生成器
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">リンク</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors">
                  トップページ
                </Link>
              </li>
              <li>
                <Link href="/tokushoho" className="text-sm hover:text-white transition-colors">
                  特定商取引法に基づく表示
                </Link>
              </li>
              <li>
                <Link href="/mypage" className="text-sm hover:text-white transition-colors">
                  マイページ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">お問い合わせ</h3>
            <p className="text-sm mb-1">{COMPANY.name}</p>
            <a
              href={`mailto:${COMPANY.email}`}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              {COMPANY.email}
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-xs text-white/30">
          <p>© {new Date().getFullYear()} {COMPANY.name} All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

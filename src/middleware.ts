import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "ulas_session";
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "ulas-store-secret-key-change-in-production"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin のみ認証保護（/mypage は page.tsx 側でログインフォームを表示）
  if (pathname.startsWith("/admin")) {
    // /admin/login は保護しない
    if (pathname === "/admin/login") return NextResponse.next();

    const token = req.cookies.get(COOKIE_NAME)?.value;
    let session = null;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET);
        session = payload;
      } catch {
        // invalid token
      }
    }
    if (!session || !session.isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};

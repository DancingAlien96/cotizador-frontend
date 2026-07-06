import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "./app/lib/token";

// Rutas accesibles sin sesión.
const PUBLIC_ROUTES = ["/login"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = verifyToken(req.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  // Sin sesión en ruta protegida -> al login.
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Con sesión en /login -> al cotizador.
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Corre en todo excepto assets estáticos e imágenes.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|ico|webp)$).*)",
  ],
};

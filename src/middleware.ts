import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Importante: el middleware usa SOLO authConfig (sin Prisma/bcrypt).
// El authorize completo (con BD) se ejecuta en el route handler de NextAuth.
export default NextAuth(authConfig).auth;

export const config = {
  // Protege todo excepto assets estáticos, imágenes y la API de auth
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.svg).*)"],
};
import type { NextAuthConfig } from "next-auth";

// Config compartida: SOLO lo que puede correr en Edge (middleware).
// Nada de Prisma/bcrypt aquí. Los providers reales viven en auth.ts.
export const authConfig = {
  pages: { signIn: "/" },
  session: { strategy: "jwt" },
  providers: [], // se completa en auth.ts
  callbacks: {
    // Control de acceso por ruta (corre en middleware/Edge)
    authorized({ auth, request: { nextUrl } }) {
      const isLogged = !!auth?.user;

      // Raíz = página de login
      if (nextUrl.pathname === "/") {
        if (isLogged) return Response.redirect(new URL("/dashboard", nextUrl));
        return true; // mostrar el login
      }

      // Cualquier otra ruta protegida (dashboard/*, 404s protegidos)
      if (!isLogged) return Response.redirect(new URL("/", nextUrl));
      return true;
    },
  },
} satisfies NextAuthConfig;
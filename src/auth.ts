import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user || !user.activo) return null;

        const ok = bcrypt.compareSync(password, user.password);
        if (!ok) return null;

        return {
          id: String(user.id),
          name: user.nombre,
          email: user.email,
          username: user.username,
          tipo_usuario: user.tipo_usuario,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.tipo_usuario = (user as any).tipo_usuario;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.username) (session.user as any).username = token.username;
      if (token.tipo_usuario) (session.user as any).tipo_usuario = token.tipo_usuario;
      return session;
    },
  },
});

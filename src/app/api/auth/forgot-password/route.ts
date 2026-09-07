import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/auth/forgot-password
// Accepts: { identifier: string } (username or email)
// Returns success message regardless (does not reveal if user exists)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = String(body?.identifier ?? "").trim();

    if (!identifier) {
      return NextResponse.json(
        { error: "Ingrese su usuario o correo electrónico" },
        { status: 400 },
      );
    }

    // Look up user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
      select: { id: true, email: true, username: true },
    });

    // Always return success to prevent user enumeration
    if (user && user.email) {
      // In production: generate reset token, send email with reset link
      // For now, we return a generic success message
      console.log(`[forgot-password] Password reset requested for user: ${user.username}`);
    }

    return NextResponse.json({
      message: "Si el usuario existe, recibirá un correo con las instrucciones para restablecer su contraseña.",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Si el usuario existe, recibirá un correo con las instrucciones para restablecer su contraseña." },
      { status: 200 },
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";

/**
 * POST /api/auth/register
 * Handles registration of a new administrator account.
 */
export async function POST(request: Request) {
  try {
    const { email, password, confirmPassword } = await request.json();

    // 1. Basic validation
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El correo electrónico no tiene un formato válido." },
        { status: 400 }
      );
    }

    // Password strength check (min 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    // Confirm password match check
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden." },
        { status: 400 }
      );
    }

    // 2. Check for duplicate emails (uniqueness check)
    // Note: Since email is unique in Prisma, we query if there is any user with this email (even soft-deleted ones)
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado." },
        { status: 400 }
      );
    }

    // 3. Create the user
    await db.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
      },
    });

    return NextResponse.json(
      { success: true, message: "Administrador creado correctamente." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration API execution:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

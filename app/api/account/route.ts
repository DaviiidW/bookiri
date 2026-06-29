import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";


export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Cuenta eliminada correctamente de forma lógica.",
    });
  } catch (error) {
    console.error("Error soft-deleting user account:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

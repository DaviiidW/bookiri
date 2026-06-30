import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const property = await db.property.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Vivienda no encontrada" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    if (isNaN(page) || page <= 0) {
      return NextResponse.json(
        { error: "Página no válida" },
        { status: 400 }
      );
    }

    if (isNaN(limit) || ![5, 10, 15].includes(limit)) {
      return NextResponse.json(
        { error: "Límite de reservas por página no válido" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const totalCount = await db.booking.count({
      where: {
        propertyId: id,
        deletedAt: null,
      },
    });

    const bookings = await db.booking.findMany({
      where: {
        propertyId: id,
        deletedAt: null,
      },
      orderBy: {
        checkInDate: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      bookings,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching property bookings:", error);
    return NextResponse.json(
      { error: "Error al obtener las reservas de la vivienda" },
      { status: 500 }
    );
  }
}

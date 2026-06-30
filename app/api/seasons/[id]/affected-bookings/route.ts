import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const season = await db.season.findFirst({
      where: {
        id,
        deletedAt: null,
        property: { userId: session.user.id, deletedAt: null },
      },
    });

    if (!season) {
      return NextResponse.json({ error: "Temporada no encontrada" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const affectedBookings = await db.booking.findMany({
      where: {
        deletedAt: null,
        checkOutDate: { gte: today },
        priceSegments: {
          some: { seasonId: id },
        },
      },
      include: {
        property: { select: { id: true, name: true, color: true } },
        priceSegments: {
          where: { seasonId: id },
          select: { id: true, nights: true, pricePerNight: true, subtotal: true },
        },
      },
      orderBy: { checkInDate: "asc" },
    });

    const result = affectedBookings.map((b) => ({
      id: b.id,
      guestName: b.guestName,
      checkInDate: b.checkInDate.toISOString(),
      checkOutDate: b.checkOutDate.toISOString(),
      totalPrice: b.totalPrice,
      propertyId: b.propertyId,
      propertyName: b.property.name,
      propertyColor: b.property.color,
      seasonSegments: b.priceSegments,
    }));

    return NextResponse.json({ success: true, affectedBookings: result });
  } catch (error) {
    console.error("Error fetching affected bookings:", error);
    return NextResponse.json(
      { error: "Error al obtener las reservas afectadas" },
      { status: 500 }
    );
  }
}

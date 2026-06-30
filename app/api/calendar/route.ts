import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const properties = await db.property.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        availabilityPeriods: {
          orderBy: { startDate: "asc" },
        },
        bookings: {
          where: { deletedAt: null },
          orderBy: { checkInDate: "asc" },
          select: {
            id: true,
            guestName: true,
            guestsTotal: true,
            checkInDate: true,
            checkOutDate: true,
            totalPrice: true,
            fullyPaid: true,
            depositPaid: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const result = properties.map((prop) => ({
      id: prop.id,
      name: prop.name,
      color: prop.color,
      maxGuests: prop.maxGuests,
      availabilityPeriods: prop.availabilityPeriods.map((p) => ({
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString(),
        description: p.description,
      })),
      bookings: prop.bookings.map((b) => ({
        id: b.id,
        guestName: b.guestName,
        guestsTotal: b.guestsTotal,
        checkInDate: b.checkInDate.toISOString(),
        checkOutDate: b.checkOutDate.toISOString(),
        propertyId: prop.id,
        propertyName: prop.name,
        propertyColor: prop.color,
        totalPrice: b.totalPrice,
        fullyPaid: b.fullyPaid,
        depositPaid: b.depositPaid,
      })),
    }));

    return NextResponse.json({ success: true, properties: result });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json(
      { error: "Error al obtener datos del calendario" },
      { status: 500 }
    );
  }
}

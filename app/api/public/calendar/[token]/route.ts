import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ token: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  try {
    const calendar = await db.sharedCalendar.findUnique({
      where: { token },
      include: {
        priceRules: { orderBy: { startDate: "asc" } },
        properties: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                color: true,
                availabilityPeriods: { orderBy: { startDate: "asc" } },
                bookings: {
                  where: {
                    deletedAt: null,
                    checkOutDate: { gte: new Date() },
                  },
                  select: { checkInDate: true, checkOutDate: true },
                  orderBy: { checkInDate: "asc" },
                },
                seasons: {
                  where: { deletedAt: null },
                  select: {
                    id: true,
                    name: true,
                    startDate: true,
                    endDate: true,
                    pricePerNight: true,
                    color: true,
                  },
                  orderBy: { startDate: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!calendar) {
      return NextResponse.json({ error: "Enlace no encontrado" }, { status: 404 });
    }
    if (calendar.expiresAt && calendar.expiresAt < new Date()) {
      return NextResponse.json({ error: "Enlace expirado" }, { status: 410 });
    }

    const priceRules = calendar.showPrice
      ? calendar.priceRules.map((r) => ({
          id: r.id,
          label: r.label,
          startDate: r.startDate.toISOString(),
          endDate: r.endDate.toISOString(),
          pricePerNight: r.pricePerNight,
          daysOfWeek: r.daysOfWeek,
          propertyId: r.propertyId,
        }))
      : [];

    const properties = calendar.properties.map(({ property }) => ({
      id: property.id,
      name: property.name,
      color: property.color,
      availabilityPeriods: property.availabilityPeriods.map((p) => ({
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString(),
      })),
      occupiedRanges: property.bookings.map((b) => ({
        checkInDate: b.checkInDate.toISOString(),
        checkOutDate: b.checkOutDate.toISOString(),
      })),
      priceRules: priceRules.filter((r) => r.propertyId === property.id),
      seasons:
        calendar.showPrice && calendar.showSeasonPrices
          ? property.seasons.map((s) => ({
              id: s.id,
              name: s.name,
              startDate: s.startDate.toISOString(),
              endDate: s.endDate.toISOString(),
              pricePerNight: s.pricePerNight,
              color: s.color,
            }))
          : [],
    }));

    return NextResponse.json({
      success: true,
      name: calendar.name,
      showPrice: calendar.showPrice,
      showSeasonPrices: calendar.showSeasonPrices,
      viewType: calendar.viewType,
      properties,
    });
  } catch (error) {
    console.error("Error fetching public calendar:", error);
    return NextResponse.json(
      { error: "Error al cargar el calendario" },
      { status: 500 }
    );
  }
}

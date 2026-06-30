import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { splitBookingIntoTramos, calculatePriceFromTramos } from "@/lib/price-calculator";

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

    // Read query params for simulation
    const url = new URL(_req.url);
    const newPriceParam = url.searchParams.get("pricePerNight");
    const newStartParam = url.searchParams.get("startDate");
    const newEndParam = url.searchParams.get("endDate");
    const newPropertyIdParam = url.searchParams.get("propertyId");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oldPropertyId = season.propertyId;
    const oldStartDate = season.startDate;
    const oldEndDate = season.endDate;

    const newPropertyId = newPropertyIdParam || oldPropertyId;
    const newStartDate = newStartParam ? new Date(newStartParam + "T00:00:00") : oldStartDate;
    const newEndDate = newEndParam ? new Date(newEndParam + "T23:59:59") : oldEndDate;

    // A future booking is affected if its checkInDate >= today and intersects with old season or new season
    const affectedBookings = await db.booking.findMany({
      where: {
        deletedAt: null,
        checkInDate: { gte: today },
        OR: [
          {
            propertyId: oldPropertyId,
            checkInDate: { lte: oldEndDate },
            checkOutDate: { gt: oldStartDate },
          },
          {
            propertyId: newPropertyId,
            checkInDate: { lte: newEndDate },
            checkOutDate: { gt: newStartDate },
          }
        ]
      },
      include: {
        property: { select: { id: true, name: true, color: true } },
      },
      orderBy: { checkInDate: "asc" },
    });

    const seasonsInvolved = await db.season.findMany({
      where: {
        propertyId: { in: [oldPropertyId, newPropertyId] },
        deletedAt: null,
      }
    });

    const getSimulatedSeasons = (bookingPropertyId: string) => {
      const baseSeasons = seasonsInvolved
        .filter(s => s.propertyId === bookingPropertyId && s.id !== id)
        .map(s => ({
          id: s.id,
          propertyId: s.propertyId,
          name: s.name,
          color: s.color,
          startDate: s.startDate,
          endDate: s.endDate,
          pricePerNight: s.pricePerNight,
          minimumStayNights: s.minimumStayNights
        }));

      if (newPropertyId === bookingPropertyId) {
        baseSeasons.push({
          id,
          propertyId: newPropertyId,
          name: season.name,
          color: season.color,
          startDate: newStartDate,
          endDate: newEndDate,
          pricePerNight: newPriceParam ? parseFloat(newPriceParam) : season.pricePerNight,
          minimumStayNights: season.minimumStayNights
        });
      }

      return baseSeasons;
    };

    const result = affectedBookings.map((b) => {
      const simulatedSeasons = getSimulatedSeasons(b.propertyId);
      const bookingTramos = splitBookingIntoTramos(
        b.checkInDate.toISOString(),
        b.checkOutDate.toISOString(),
        simulatedSeasons
      );

      const tramoConfigs = bookingTramos.map((t) => ({
        startDate: t.startDate,
        endDate: t.endDate,
        selectedSeasonId: t.selectedSeasonId
      }));

      const calc = calculatePriceFromTramos(tramoConfigs, simulatedSeasons);

      return {
        id: b.id,
        guestName: b.guestName,
        checkInDate: b.checkInDate.toISOString(),
        checkOutDate: b.checkOutDate.toISOString(),
        totalPrice: b.totalPrice,
        propertyId: b.propertyId,
        propertyName: b.property.name,
        propertyColor: b.property.color,
        recalculatedPrice: calc.totalPrice,
      };
    });

    return NextResponse.json({ success: true, affectedBookings: result });
  } catch (error) {
    console.error("Error fetching affected bookings:", error);
    return NextResponse.json(
      { error: "Error al obtener las reservas afectadas" },
      { status: 500 }
    );
  }
}

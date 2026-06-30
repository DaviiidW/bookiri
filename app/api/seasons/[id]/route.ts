import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { splitBookingIntoTramos, calculatePriceFromTramos } from "@/lib/price-calculator";

type RouteParams = { params: Promise<{ id: string }> };

async function getOwnedSeason(seasonId: string, userId: string) {
  return db.season.findFirst({
    where: {
      id: seasonId,
      deletedAt: null,
      property: { userId, deletedAt: null },
    },
    include: { property: { select: { id: true, name: true } } },
  });
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const season = await getOwnedSeason(id, session.user.id);
    if (!season) {
      return NextResponse.json({ error: "Temporada no encontrada" }, { status: 404 });
    }

    const body = await req.json();
    const {
      propertyId,
      name,
      color,
      startDate,
      endDate,
      pricePerNight,
      minimumStayNights,
      bookingActions,
    } = body;

    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json({ error: "La vivienda es obligatoria" }, { status: 400 });
    }
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    if (!color || typeof color !== "string" || color.trim() === "") {
      return NextResponse.json({ error: "El color es obligatorio" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Fechas no válidas" }, { status: 400 });
    }
    if (start >= end) {
      return NextResponse.json(
        { error: "La fecha de inicio debe ser anterior a la fecha de fin" },
        { status: 400 }
      );
    }

    const price = parseFloat(pricePerNight);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: "El precio por noche debe ser mayor que cero" },
        { status: 400 }
      );
    }

    const minStay = parseInt(minimumStayNights, 10);
    if (isNaN(minStay) || minStay < 1) {
      return NextResponse.json(
        { error: "La estancia mínima debe ser al menos una noche" },
        { status: 400 }
      );
    }

    const property = await db.property.findFirst({
      where: { id: propertyId, userId: session.user.id, deletedAt: null },
    });
    if (!property) {
      return NextResponse.json({ error: "Vivienda no encontrada" }, { status: 404 });
    }

    const updated = await db.season.update({
      where: { id },
      data: {
        propertyId,
        name: name.trim(),
        color: color.trim(),
        startDate: start,
        endDate: end,
        pricePerNight: price,
        minimumStayNights: minStay,
      },
      include: {
        property: { select: { id: true, name: true, color: true } },
      },
    });

    if (Array.isArray(bookingActions) && bookingActions.length > 0) {
      for (const action of bookingActions) {
        const { bookingId, action: actionType, manualPrice } = action;

        if (actionType === "keep") {
          await db.bookingPriceSegment.deleteMany({
            where: { bookingId },
          });
          continue;
        }

        if (actionType === "manual") {
          const manualVal = parseFloat(manualPrice);
          if (!isNaN(manualVal)) {
            await db.booking.update({
              where: { id: bookingId },
              data: { totalPrice: manualVal },
            });
            await db.bookingPriceSegment.deleteMany({
              where: { bookingId },
            });
          }
          continue;
        }

        if (actionType === "recalculate") {
          const bookingToRecalc = await db.booking.findUnique({
            where: { id: bookingId },
          });

          if (bookingToRecalc) {
            const propSeasons = await db.season.findMany({
              where: { propertyId: bookingToRecalc.propertyId, deletedAt: null },
            });
            const bookingTramos = splitBookingIntoTramos(
              bookingToRecalc.checkInDate.toISOString(),
              bookingToRecalc.checkOutDate.toISOString(),
              propSeasons
            );

            const tramoConfigs = bookingTramos.map((t) => ({
              startDate: t.startDate,
              endDate: t.endDate,
              selectedSeasonId: t.selectedSeasonId
            }));

            const calc = calculatePriceFromTramos(tramoConfigs, propSeasons);

            await db.booking.update({
              where: { id: bookingId },
              data: { totalPrice: calc.totalPrice },
            });

            await db.bookingPriceSegment.deleteMany({
              where: { bookingId },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, season: updated });
  } catch (error) {
    console.error("Error updating season:", error);
    return NextResponse.json(
      { error: "Error al actualizar la temporada" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const season = await getOwnedSeason(id, session.user.id);
    if (!season) {
      return NextResponse.json({ error: "Temporada no encontrada" }, { status: 404 });
    }

    await db.season.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting season:", error);
    return NextResponse.json(
      { error: "Error al eliminar la temporada" },
      { status: 500 }
    );
  }
}

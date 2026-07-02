import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { validateBookingDates } from "@/lib/booking-validator";

type RouteParams = { params: Promise<{ id: string }> };

async function getOwnedBooking(bookingId: string, userId: string) {
  return db.booking.findFirst({
    where: {
      id: bookingId,
      deletedAt: null,
      property: {
        userId,
        deletedAt: null,
      },
    },
    include: {
      priceSegments: {
        include: {
          season: true,
        },
      },
      property: true,
    },
  });
}

export async function GET(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const booking = await getOwnedBooking(id, session.user.id);
    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Error retrieving booking:", error);
    return NextResponse.json({ error: "Error al recuperar la reserva" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existingBooking = await getOwnedBooking(id, session.user.id);
    if (!existingBooking) {
      return NextResponse.json({ error: "Reserva no encontrada o no autorizada" }, { status: 404 });
    }

    const body = await req.json();
    const {
      propertyId,
      checkInDate,
      checkOutDate,
      checkInTime,
      checkOutTime,
      guestName,
      guestsTotal,
      adults,
      children,
      notes,
      totalPrice,
      depositAmount,
      depositPaid,
      depositPaidAt,
      fullyPaid,
      fullyPaidAt,
      segments,
    } = body;

    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json({ error: "La vivienda es obligatoria" }, { status: 400 });
    }
    if (!guestName || typeof guestName !== "string" || !guestName.trim()) {
      return NextResponse.json({ error: "El nombre del huésped es obligatorio" }, { status: 400 });
    }
    if (!checkInDate || !checkOutDate) {
      return NextResponse.json({ error: "Las fechas de entrada y salida son obligatorias" }, { status: 400 });
    }

    const guestsTotalNum = parseInt(guestsTotal, 10);
    const adultsNum = parseInt(adults, 10);
    const childrenNum = parseInt(children, 10);

    if (isNaN(guestsTotalNum) || guestsTotalNum <= 0) {
      return NextResponse.json({ error: "El número total de huéspedes debe ser mayor que 0" }, { status: 400 });
    }
    if (isNaN(adultsNum) || adultsNum < 0) {
      return NextResponse.json({ error: "El número de adultos no puede ser negativo" }, { status: 400 });
    }
    if (isNaN(childrenNum) || childrenNum < 0) {
      return NextResponse.json({ error: "El número de niños no puede ser negativo" }, { status: 400 });
    }

    const priceTotalNum = parseFloat(totalPrice);
    const depositAmtNum = parseFloat(depositAmount || "0");

    if (isNaN(priceTotalNum) || priceTotalNum < 0) {
      return NextResponse.json({ error: "El precio total no puede ser negativo" }, { status: 400 });
    }
    if (isNaN(depositAmtNum) || depositAmtNum < 0) {
      return NextResponse.json({ error: "El importe de la señal no puede ser negativo" }, { status: 400 });
    }
    if (depositAmtNum > priceTotalNum) {
      return NextResponse.json({ error: "El importe de la señal no puede ser mayor que el precio total" }, { status: 400 });
    }

    const isFullyPaid = !!fullyPaid;
    const isDepositPaid = isFullyPaid || !!depositPaid;
    const effectiveDepositPaidAt = isDepositPaid ? (depositPaidAt || fullyPaidAt || null) : null;

    if (isDepositPaid && !effectiveDepositPaidAt) {
      return NextResponse.json({ error: "La fecha de pago de la señal es obligatoria si está pagada" }, { status: 400 });
    }
    if (isFullyPaid && !fullyPaidAt) {
      return NextResponse.json({ error: "La fecha de pago completo es obligatoria si está pagada" }, { status: 400 });
    }

    const property = await db.property.findFirst({
      where: { id: propertyId, userId: session.user.id, deletedAt: null },
    });
    if (!property) {
      return NextResponse.json({ error: "Vivienda no encontrada" }, { status: 404 });
    }

    const dateValidation = await validateBookingDates(
      id,
      propertyId,
      checkInDate,
      checkOutDate
    );

    if (!dateValidation.isValid) {
      return NextResponse.json({ error: dateValidation.error }, { status: 400 });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const updated = await db.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: {
          propertyId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          checkInTime: checkInTime || null,
          checkOutTime: checkOutTime || null,
          guestName: guestName.trim(),
          guestsTotal: guestsTotalNum,
          adults: adultsNum,
          children: childrenNum,
          notes: notes || null,
          totalPrice: priceTotalNum,
          depositAmount: depositAmtNum,
          depositPaid: isDepositPaid,
          depositPaidAt: effectiveDepositPaidAt ? new Date(effectiveDepositPaidAt) : null,
          fullyPaid: isFullyPaid,
          fullyPaidAt: isFullyPaid && fullyPaidAt ? new Date(fullyPaidAt) : null,
        },
      });

      await tx.bookingPriceSegment.deleteMany({
        where: { bookingId: id },
      });

      if (Array.isArray(segments) && segments.length > 0) {
        const hasMissingSeason = segments.some((s) => !s.seasonId);
        if (hasMissingSeason) {
          throw new Error("Todos los tramos de precio deben tener una temporada seleccionada para el modo automático.");
        }

        await tx.bookingPriceSegment.createMany({
          data: segments.map((seg) => ({
            bookingId: id,
            seasonId: seg.seasonId,
            startDate: new Date(seg.startDate),
            endDate: new Date(seg.endDate),
            pricePerNight: parseFloat(seg.pricePerNight),
            nights: parseInt(seg.nights, 10),
            subtotal: parseFloat(seg.subtotal),
          })),
        });
      }

      return b;
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar la reserva" },
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
    const existingBooking = await getOwnedBooking(id, session.user.id);
    if (!existingBooking) {
      return NextResponse.json({ error: "Reserva no encontrada o no autorizada" }, { status: 404 });
    }

    await db.booking.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: "Error al eliminar la reserva" }, { status: 500 });
  }
}

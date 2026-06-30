import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

interface ProposedPeriod {
  id?: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export async function POST(
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

    const body = await req.json();
    const { periods }: { periods: ProposedPeriod[] } = body;

    if (!Array.isArray(periods)) {
      return NextResponse.json(
        { error: "Formato de periodos no válido" },
        { status: 400 }
      );
    }

    for (const p of periods) {
      const pStart = new Date(p.startDate);
      const pEnd = new Date(p.endDate);

      if (isNaN(pStart.getTime()) || isNaN(pEnd.getTime())) {
        return NextResponse.json(
          { error: "Las fechas de los periodos deben ser válidas" },
          { status: 400 }
        );
      }

      if (pEnd < pStart) {
        return NextResponse.json(
          { error: "La fecha de fin no puede ser anterior a la de inicio" },
          { status: 400 }
        );
      }
    }

    for (let i = 0; i < periods.length; i++) {
      for (let j = i + 1; j < periods.length; j++) {
        const startA = new Date(periods[i].startDate).getTime();
        const endA = new Date(periods[i].endDate).getTime();
        const startB = new Date(periods[j].startDate).getTime();
        const endB = new Date(periods[j].endDate).getTime();

        if (startA < endB && startB < endA) {
          return NextResponse.json(
            { error: "No se permiten periodos de disponibilidad que se solapen entre sí." },
            { status: 400 }
          );
        }
      }
    }

    const bookings = await db.booking.findMany({
      where: {
        propertyId: id,
        checkOutDate: {
          gt: new Date(),
        },
        deletedAt: null,
      },
      orderBy: {
        checkInDate: "asc",
      },
    });

    const affectedBookings = [];

    const toMidnightUTC = (date: Date) => {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    };

    const normalizedPeriods = periods.map(p => ({
      start: toMidnightUTC(new Date(p.startDate)),
      end: toMidnightUTC(new Date(p.endDate)),
    }));

    for (const booking of bookings) {
      const bStart = toMidnightUTC(booking.checkInDate);
      const bEnd = toMidnightUTC(booking.checkOutDate);

      let isCovered = true;

      for (let day = new Date(bStart); day < bEnd; day.setUTCDate(day.getUTCDate() + 1)) {
        const currentNight = day.getTime();
        const nightIsAvailable = normalizedPeriods.some(p => {
          return currentNight >= p.start.getTime() && currentNight < p.end.getTime();
        });

        if (!nightIsAvailable) {
          isCovered = false;
          break;
        }
      }

      if (!isCovered) {
        affectedBookings.push({
          id: booking.id,
          guestName: booking.guestName,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          propertyName: property.name,
        });
      }
    }

    return NextResponse.json({ success: true, affectedBookings });
  } catch (error) {
    console.error("Error validating availability conflicts:", error);
    return NextResponse.json(
      { error: "Error al validar los conflictos de disponibilidad" },
      { status: 500 }
    );
  }
}

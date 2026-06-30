import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

interface SavePeriod {
  startDate: string;
  endDate: string;
  description?: string;
}

interface BookingAction {
  bookingId: string;
  action: "keep" | "delete" | "edit";
  checkInDate?: string;
  checkOutDate?: string;
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
    const {
      periods,
      bookingActions,
    }: { periods: SavePeriod[]; bookingActions: BookingAction[] } = body;

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

    await db.$transaction(async (tx) => {
      await tx.propertyAvailabilityPeriod.deleteMany({
        where: {
          propertyId: id,
        },
      });

      if (periods.length > 0) {
        await tx.propertyAvailabilityPeriod.createMany({
          data: periods.map(p => ({
            propertyId: id,
            startDate: new Date(p.startDate),
            endDate: new Date(p.endDate),
            description: p.description ? p.description.trim() : null,
          })),
        });
      }

      if (Array.isArray(bookingActions)) {
        for (const action of bookingActions) {
          const booking = await tx.booking.findFirst({
            where: {
              id: action.bookingId,
              propertyId: id,
              deletedAt: null,
            },
          });

          if (!booking) continue;

          if (action.action === "delete") {
            await tx.booking.update({
              where: { id: action.bookingId },
              data: { deletedAt: new Date() },
            });
          } else if (action.action === "edit" && action.checkInDate && action.checkOutDate) {
            await tx.booking.update({
              where: { id: action.bookingId },
              data: {
                checkInDate: new Date(action.checkInDate),
                checkOutDate: new Date(action.checkOutDate),
              },
            });
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Disponibilidad guardada correctamente.",
    });
  } catch (error) {
    console.error("Error saving availability and resolving conflicts:", error);
    return NextResponse.json(
      { error: "Error al guardar los cambios de disponibilidad" },
      { status: 500 }
    );
  }
}

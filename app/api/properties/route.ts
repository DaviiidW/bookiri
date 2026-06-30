import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const properties = await db.property.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        availabilityPeriods: true,
        bookings: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            checkInDate: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const today = new Date();
    const toMidnight = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };
    const todayMs = toMidnight(today);

    const propertiesWithStats = properties.map((prop) => {
      const { availabilityPeriods, bookings, ...rest } = prop;


      const isAvailableNow = availabilityPeriods.some((p) => {
        const start = toMidnight(p.startDate);
        const end = toMidnight(p.endDate);
        return todayMs >= start && todayMs < end;
      });

      const isBookedNow = bookings.some((b) => {
        const start = toMidnight(b.checkInDate);
        const end = toMidnight(b.checkOutDate);
        return todayMs >= start && todayMs < end;
      });

      const nextBooking = bookings.find((b) => {
        const start = toMidnight(b.checkInDate);
        return start > todayMs;
      });

      const futureBookingsCount = bookings.filter((b) => {
        const start = toMidnight(b.checkInDate);
        return start > todayMs;
      }).length;

      return {
        ...rest,
        availabilityPeriods: availabilityPeriods.map(p => ({
          id: p.id,
          startDate: p.startDate,
          endDate: p.endDate,
          description: p.description,
        })),
        isAvailableNow,
        isBookedNow,
        nextBooking: nextBooking
          ? {
              guestName: nextBooking.guestName,
              checkInDate: nextBooking.checkInDate,
              checkOutDate: nextBooking.checkOutDate,
            }
          : null,
        futureBookingsCount,
      };
    });

    return NextResponse.json({ success: true, properties: propertiesWithStats });
  } catch (error) {
    console.error("Error fetching properties with stats:", error);
    return NextResponse.json(
      { error: "Error al obtener las viviendas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { name, color, maxGuests } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    if (!color || typeof color !== "string" || color.trim() === "") {
      return NextResponse.json(
        { error: "El color identificativo es obligatorio" },
        { status: 400 }
      );
    }

    const guests = parseInt(maxGuests, 10);
    if (isNaN(guests) || guests <= 0) {
      return NextResponse.json(
        { error: "La capacidad máxima debe ser mayor que cero" },
        { status: 400 }
      );
    }

    const newProperty = await db.property.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        color: color.trim(),
        maxGuests: guests,
      },
    });

    return NextResponse.json({ success: true, property: newProperty });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Error al crear la vivienda" },
      { status: 500 }
    );
  }
}

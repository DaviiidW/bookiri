import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function PUT(
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
    const existingProperty = await db.property.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Vivienda no encontrada" },
        { status: 404 }
      );
    }

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

    const updatedProperty = await db.property.update({
      where: { id },
      data: {
        name: name.trim(),
        color: color.trim(),
        maxGuests: guests,
      },
    });

    return NextResponse.json({ success: true, property: updatedProperty });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Error al actualizar la vivienda" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const existingProperty = await db.property.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Vivienda no encontrada o ya eliminada" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";
    const checkOnly = searchParams.get("checkOnly") === "true";

    const futureBookings = await db.booking.findMany({
      where: {
        propertyId: id,
        checkOutDate: {
          gt: new Date(),
        },
        deletedAt: null,
      },
      select: {
        id: true,
        guestName: true,
        checkInDate: true,
        checkOutDate: true,
      },
      orderBy: {
        checkInDate: "asc",
      },
    });

    if (futureBookings.length > 0 && !force) {
      return NextResponse.json(
        {
          success: false,
          requireConfirmation: true,
          bookings: futureBookings,
        },
        { status: 409 }
      );
    }

    if (checkOnly) {
      return NextResponse.json({
        success: true,
        hasFutureBookings: false,
      });
    }

    await db.$transaction(async (tx) => {
      if (futureBookings.length > 0) {
        await tx.booking.updateMany({
          where: {
            propertyId: id,
            checkOutDate: {
              gt: new Date(),
            },
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        });
      }

      await tx.property.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      await tx.season.updateMany({
        where: {
          propertyId: id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      await tx.propertyAvailabilityPeriod.deleteMany({
        where: {
          propertyId: id,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Vivienda eliminada correctamente de forma lógica.",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Error al eliminar la vivienda" },
      { status: 500 }
    );
  }
}

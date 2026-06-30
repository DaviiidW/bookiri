import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
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

    const availabilityPeriods = await db.propertyAvailabilityPeriod.findMany({
      where: {
        propertyId: id,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return NextResponse.json({ success: true, availabilityPeriods });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Error al obtener la disponibilidad" },
      { status: 500 }
    );
  }
}

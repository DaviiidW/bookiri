import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const seasons = await db.season.findMany({
      where: {
        deletedAt: null,
        property: {
          userId: session.user.id,
          deletedAt: null,
        },
      },
      include: {
        property: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, seasons });
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return NextResponse.json(
      { error: "Error al obtener las temporadas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { propertyId, name, color, startDate, endDate, pricePerNight, minimumStayNights } = body;

    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json({ error: "La vivienda es obligatoria" }, { status: 400 });
    }
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    if (!color || typeof color !== "string" || color.trim() === "") {
      return NextResponse.json({ error: "El color es obligatorio" }, { status: 400 });
    }
    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Las fechas son obligatorias" }, { status: 400 });
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

    const season = await db.season.create({
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

    return NextResponse.json({ success: true, season }, { status: 201 });
  } catch (error) {
    console.error("Error creating season:", error);
    return NextResponse.json(
      { error: "Error al crear la temporada" },
      { status: 500 }
    );
  }
}

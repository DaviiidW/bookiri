import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

import { validatePriceRules, type PriceRuleInput } from "@/lib/price-rule-validator";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const calendars = await db.sharedCalendar.findMany({
      where: {
        properties: {
          some: { property: { userId: session.user.id, deletedAt: null } },
        },
      },
      include: {
        properties: {
          include: { property: { select: { id: true, name: true, color: true } } },
        },
        priceRules: { orderBy: { startDate: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, calendars });
  } catch (error) {
    console.error("Error fetching shared calendars:", error);
    return NextResponse.json(
      { error: "Error al obtener los calendarios compartidos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, propertyIds, showPrice, showSeasonPrices, expiresAt, viewType, priceRules } = body;

    if (!propertyIds || propertyIds.length === 0) {
      return NextResponse.json(
        { error: "Debes seleccionar al menos una vivienda" },
        { status: 400 }
      );
    }

    const ownedProperties = await db.property.findMany({
      where: { id: { in: propertyIds }, userId: session.user.id, deletedAt: null },
      select: { id: true },
    });

    if (ownedProperties.length !== propertyIds.length) {
      return NextResponse.json(
        { error: "Una o más viviendas no pertenecen a tu cuenta" },
        { status: 403 }
      );
    }

    const token = randomBytes(24).toString("hex");
    const rules: PriceRuleInput[] = Array.isArray(priceRules) ? priceRules : [];

    const overlapError = validatePriceRules(rules);
    if (overlapError) {
      return NextResponse.json({ error: overlapError }, { status: 400 });
    }

    const calendar = await db.sharedCalendar.create({
      data: {
        token,
        name: name ?? null,
        showPrice: showPrice ?? false,
        showSeasonPrices: showSeasonPrices ?? false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        viewType: viewType ?? "MONTH",
        properties: { create: propertyIds.map((id: string) => ({ propertyId: id })) },
        priceRules: {
          create: rules.map((r) => ({
            label: r.label ?? null,
            startDate: new Date(r.startDate),
            endDate: new Date(r.endDate),
            pricePerNight: r.pricePerNight,
            daysOfWeek: r.daysOfWeek ?? [],
            propertyId: r.propertyId,
          })),
        },
      },
      include: {
        properties: {
          include: { property: { select: { id: true, name: true, color: true } } },
        },
        priceRules: { orderBy: { startDate: "asc" } },
      },
    });

    return NextResponse.json({ success: true, calendar }, { status: 201 });
  } catch (error) {
    console.error("Error creating shared calendar:", error);
    return NextResponse.json(
      { error: "Error al crear el enlace compartido" },
      { status: 500 }
    );
  }
}

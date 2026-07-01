import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

import { validatePriceRules, type PriceRuleInput } from "@/lib/price-rule-validator";

async function getOwnedCalendar(id: string, userId: string) {
  return db.sharedCalendar.findFirst({
    where: {
      id,
      properties: { some: { property: { userId, deletedAt: null } } },
    },
    include: {
      properties: {
        include: { property: { select: { id: true, name: true, color: true } } },
      },
      priceRules: { orderBy: { startDate: "asc" } },
    },
  });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const calendar = await getOwnedCalendar(id, session.user.id);
  if (!calendar) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ success: true, calendar });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedCalendar(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  try {
    const body = await req.json();
    const { name, propertyIds, showPrice, showSeasonPrices, expiresAt, isActive, viewType, priceRules } = body;

    if (propertyIds !== undefined && propertyIds.length === 0) {
      return NextResponse.json(
        { error: "Debes seleccionar al menos una vivienda" },
        { status: 400 }
      );
    }

    if (propertyIds) {
      const owned = await db.property.findMany({
        where: { id: { in: propertyIds }, userId: session.user.id, deletedAt: null },
        select: { id: true },
      });
      if (owned.length !== propertyIds.length) {
        return NextResponse.json(
          { error: "Una o más viviendas no pertenecen a tu cuenta" },
          { status: 403 }
        );
      }
    }

    if (priceRules !== undefined) {
      const overlapError = validatePriceRules(priceRules as PriceRuleInput[]);
      if (overlapError) {
        return NextResponse.json({ error: overlapError }, { status: 400 });
      }
    }

    const calendar = await db.$transaction(async (tx) => {
      if (propertyIds) {
        await tx.sharedCalendarProperty.deleteMany({ where: { sharedCalendarId: id } });
      }
      if (priceRules !== undefined) {
        await tx.sharedCalendarPriceRule.deleteMany({ where: { sharedCalendarId: id } });
      }

      return tx.sharedCalendar.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(showPrice !== undefined && { showPrice }),
          ...(showSeasonPrices !== undefined && { showSeasonPrices }),
          ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
          ...(isActive !== undefined && { isActive }),
          ...(viewType !== undefined && { viewType }),
          ...(propertyIds && {
            properties: { create: propertyIds.map((pid: string) => ({ propertyId: pid })) },
          }),
          ...(priceRules !== undefined && {
            priceRules: {
              create: (priceRules as PriceRuleInput[]).map((r) => ({
                label: r.label ?? null,
                startDate: new Date(r.startDate),
                endDate: new Date(r.endDate),
                pricePerNight: r.pricePerNight,
                daysOfWeek: r.daysOfWeek ?? [],
                propertyId: r.propertyId,
              })),
            },
          }),
        },
        include: {
          properties: {
            include: { property: { select: { id: true, name: true, color: true } } },
          },
          priceRules: { orderBy: { startDate: "asc" } },
        },
      });
    });

    return NextResponse.json({ success: true, calendar });
  } catch (error) {
    console.error("Error updating shared calendar:", error);
    return NextResponse.json({ error: "Error al actualizar el enlace" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await getOwnedCalendar(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  await db.sharedCalendar.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

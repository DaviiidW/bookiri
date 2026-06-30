import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("La variable de entorno DATABASE_URL no está definida.");
  }

  console.log("Iniciando la siembra de datos (Seeding)...");
  
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  try {
    const email = "admin@bookiri.com";
    const passwordHash = bcrypt.hashSync("admin123", 10); // Contraseña estándar: admin123

    // 1. Limpiar o buscar usuario admin
    let user = await db.user.findUnique({
      where: { email },
    });

    if (user) {
      console.log(`Usuario ${email} ya existe. Limpiando sus viviendas antiguas...`);
      // Delete old properties associated with user (Cascades to periods, seasons, bookings)
      const userProperties = await db.property.findMany({
        where: { userId: user.id },
      });
      for (const prop of userProperties) {
        await db.property.delete({ where: { id: prop.id } });
      }
    } else {
      console.log(`Creando usuario admin: ${email}`);
      user = await db.user.create({
        data: {
          email,
          passwordHash,
        },
      });
    }

    const today = new Date();
    const getRelativeDate = (days: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    console.log("Insertando viviendas, temporadas, periodos de disponibilidad y reservas...");

    // ==========================================
    // VIVIENDA 1: Villa Vista Mar (Ocupado Hoy)
    // ==========================================
    const villa = await db.property.create({
      data: {
        userId: user.id,
        name: "Villa Vista Mar",
        color: "#6366f1", // Indigo
        maxGuests: 6,
      },
    });

    // Periodos de disponibilidad para Villa Vista Mar
    await db.propertyAvailabilityPeriod.createMany({
      data: [
        {
          propertyId: villa.id,
          description: "Temporada de Verano & Otoño",
          startDate: getRelativeDate(-30), // Hace 30 días
          endDate: getRelativeDate(90),    // En 90 días
        },
        {
          propertyId: villa.id,
          description: "Navidad y Año Nuevo",
          startDate: getRelativeDate(160),
          endDate: getRelativeDate(190),
        }
      ]
    });

    // Temporadas
    const villaSummerSeason = await db.season.create({
      data: {
        propertyId: villa.id,
        name: "Temporada Alta Verano",
        color: "#f43f5e",
        startDate: getRelativeDate(-10),
        endDate: getRelativeDate(45),
        pricePerNight: 150,
        minimumStayNights: 3,
      }
    });

    // Reservas para Villa Vista Mar
    // Reserva 1: Pasada (Completada)
    await db.booking.create({
      data: {
        propertyId: villa.id,
        guestName: "Juan Pérez",
        guestsTotal: 4,
        adults: 2,
        children: 2,
        checkInDate: getRelativeDate(-18),
        checkOutDate: getRelativeDate(-14),
        totalPrice: 600,
        depositAmount: 150,
        depositPaid: true,
        depositPaidAt: getRelativeDate(-25),
        fullyPaid: true,
        fullyPaidAt: getRelativeDate(-18),
        notes: "Familia de vacaciones. Requiere cuna de bebé.",
      }
    });

    // Reserva 2: En curso (Ocupado Hoy)
    await db.booking.create({
      data: {
        propertyId: villa.id,
        guestName: "María López",
        guestsTotal: 3,
        adults: 3,
        children: 0,
        checkInDate: getRelativeDate(-2), // Empezó hace 2 días
        checkOutDate: getRelativeDate(3),  // Termina en 3 días
        totalPrice: 750,
        depositAmount: 200,
        depositPaid: true,
        depositPaidAt: getRelativeDate(-10),
        fullyPaid: false, // Pendiente pago total (Señalada)
        notes: "Viaje de trabajo / ocio.",
      }
    });

    // Reserva 3: Próxima futura (Señalizada y Pagada)
    const bookingVilla3 = await db.booking.create({
      data: {
        propertyId: villa.id,
        guestName: "Carlos Gómez",
        guestsTotal: 5,
        adults: 4,
        children: 1,
        checkInDate: getRelativeDate(10), // En 10 días
        checkOutDate: getRelativeDate(15),
        totalPrice: 750,
        depositAmount: 150,
        depositPaid: true,
        depositPaidAt: getRelativeDate(-5),
        fullyPaid: true,
        fullyPaidAt: getRelativeDate(-2),
        notes: "Check-in tardío solicitado.",
      }
    });

    // Segmentos de precios de la reserva 3 (Villa)
    await db.bookingPriceSegment.create({
      data: {
        bookingId: bookingVilla3.id,
        seasonId: villaSummerSeason.id,
        startDate: getRelativeDate(10),
        endDate: getRelativeDate(15),
        pricePerNight: 150,
        nights: 5,
        subtotal: 750,
      }
    });

    // Reserva 4: Próxima futura (Pendiente de pago)
    await db.booking.create({
      data: {
        propertyId: villa.id,
        guestName: "Sophia Schmidt",
        guestsTotal: 2,
        adults: 2,
        children: 0,
        checkInDate: getRelativeDate(25), // En 25 días
        checkOutDate: getRelativeDate(30),
        totalPrice: 750,
        depositAmount: 150,
        depositPaid: false,
        fullyPaid: false,
        notes: "Huésped extranjero.",
      }
    });


    // ==========================================
    // VIVIENDA 2: Apartamento Centro (Disponible)
    // ==========================================
    const apto = await db.property.create({
      data: {
        userId: user.id,
        name: "Apartamento Centro",
        color: "#10b981", // Emerald
        maxGuests: 4,
      },
    });

    // Periodos de disponibilidad
    await db.propertyAvailabilityPeriod.create({
      data: {
        propertyId: apto.id,
        description: "Todo el año",
        startDate: getRelativeDate(-30),
        endDate: getRelativeDate(365),
      }
    });

    // Temporadas
    const aptoHighSeason = await db.season.create({
      data: {
        propertyId: apto.id,
        name: "Semana Santa y Puentes",
        color: "#3b82f6",
        startDate: getRelativeDate(5),
        endDate: getRelativeDate(12),
        pricePerNight: 90,
        minimumStayNights: 2,
      }
    });

    // Reserva futura para Apartamento Centro
    const bookingApto = await db.booking.create({
      data: {
        propertyId: apto.id,
        guestName: "Ana Martínez",
        guestsTotal: 2,
        adults: 2,
        children: 0,
        checkInDate: getRelativeDate(5),
        checkOutDate: getRelativeDate(9),
        totalPrice: 360,
        depositAmount: 100,
        depositPaid: true,
        depositPaidAt: getRelativeDate(-1),
        fullyPaid: false,
      }
    });

    await db.bookingPriceSegment.create({
      data: {
        bookingId: bookingApto.id,
        seasonId: aptoHighSeason.id,
        startDate: getRelativeDate(5),
        endDate: getRelativeDate(9),
        pricePerNight: 90,
        nights: 4,
        subtotal: 360,
      }
    });


    // ==========================================
    // VIVIENDA 3: Casa Rural Pirineos (No Disponible)
    // ==========================================
    const casa = await db.property.create({
      data: {
        userId: user.id,
        name: "Casa Rural Pirineos",
        color: "#f59e0b", // Amber
        maxGuests: 8,
      },
    });

    // Periodos de disponibilidad (Expirado)
    await db.propertyAvailabilityPeriod.create({
      data: {
        propertyId: casa.id,
        description: "Temporada Invierno Pasada",
        startDate: getRelativeDate(-90),
        endDate: getRelativeDate(-10), // Finalizó hace 10 días, por lo tanto HOY está No Disponible
      }
    });

    // Reserva histórica pasada
    await db.booking.create({
      data: {
        propertyId: casa.id,
        guestName: "Lucía Fernández",
        guestsTotal: 6,
        adults: 6,
        children: 0,
        checkInDate: getRelativeDate(-40),
        checkOutDate: getRelativeDate(-35),
        totalPrice: 1000,
        depositAmount: 200,
        depositPaid: true,
        depositPaidAt: getRelativeDate(-50),
        fullyPaid: true,
        fullyPaidAt: getRelativeDate(-40),
      }
    });

    console.log("¡Siembra de datos completada con éxito!");
  } finally {
    await db.$disconnect();
    pool.end();
  }
}

main().catch((err) => {
  console.error("Error al sembrar la base de datos:", err);
  process.exit(1);
});

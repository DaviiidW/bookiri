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
        // Delete all BookingPriceSegments for the bookings of this property to avoid Restrict constraint issues
        await db.bookingPriceSegment.deleteMany({
          where: {
            booking: { propertyId: prop.id }
          }
        });
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
          description: "Anual Villa Vista Mar",
          startDate: getRelativeDate(-30), // Hace 30 días
          endDate: getRelativeDate(250),    // En 250 días
        }
      ]
    });

    // Temporadas Villa Vista Mar
    const villaSummerSeason = await db.season.create({
      data: {
        propertyId: villa.id,
        name: "Temporada Alta Verano",
        color: "#f43f5e", // Rose
        startDate: getRelativeDate(-10),
        endDate: getRelativeDate(45),
        pricePerNight: 150,
        minimumStayNights: 3,
      }
    });

    const villaAutumnSeason = await db.season.create({
      data: {
        propertyId: villa.id,
        name: "Temporada de Otoño",
        color: "#f97316", // Orange
        startDate: getRelativeDate(46),
        endDate: getRelativeDate(120),
        pricePerNight: 110,
        minimumStayNights: 2,
      }
    });

    const villaWinterSeason = await db.season.create({
      data: {
        propertyId: villa.id,
        name: "Escapadas de Invierno",
        color: "#38bdf8", // Sky
        startDate: getRelativeDate(121),
        endDate: getRelativeDate(200),
        pricePerNight: 95,
        minimumStayNights: 2,
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

    // Reserva 3: Próxima futura (Señalizada y Pagada) en verano
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

    // Reserva 4: Próxima futura (Pendiente de pago) en verano
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

    // Reserva 5: En temporada de Otoño
    const bookingVilla5 = await db.booking.create({
      data: {
        propertyId: villa.id,
        guestName: "Diego Silva",
        guestsTotal: 2,
        adults: 2,
        children: 0,
        checkInDate: getRelativeDate(50),
        checkOutDate: getRelativeDate(55),
        totalPrice: 550,
        depositAmount: 110,
        depositPaid: true,
        depositPaidAt: getRelativeDate(10),
        fullyPaid: false,
        notes: "Prefiere cama de matrimonio.",
      }
    });

    await db.bookingPriceSegment.create({
      data: {
        bookingId: bookingVilla5.id,
        seasonId: villaAutumnSeason.id,
        startDate: getRelativeDate(50),
        endDate: getRelativeDate(55),
        pricePerNight: 110,
        nights: 5,
        subtotal: 550,
      }
    });

    // Reserva 6: En temporada de Invierno
    const bookingVilla6 = await db.booking.create({
      data: {
        propertyId: villa.id,
        guestName: "Helen Smith",
        guestsTotal: 4,
        adults: 4,
        children: 0,
        checkInDate: getRelativeDate(130),
        checkOutDate: getRelativeDate(137),
        totalPrice: 665,
        depositAmount: 150,
        depositPaid: false,
        fullyPaid: false,
        notes: "Cliente recurrente.",
      }
    });

    await db.bookingPriceSegment.create({
      data: {
        bookingId: bookingVilla6.id,
        seasonId: villaWinterSeason.id,
        startDate: getRelativeDate(130),
        endDate: getRelativeDate(137),
        pricePerNight: 95,
        nights: 7,
        subtotal: 665,
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
        color: "#3b82f6", // Blue
        startDate: getRelativeDate(5),
        endDate: getRelativeDate(12),
        pricePerNight: 90,
        minimumStayNights: 2,
      }
    });

    const aptoSummerSeason = await db.season.create({
      data: {
        propertyId: apto.id,
        name: "Verano Centro Histórico",
        color: "#ec4899", // Pink
        startDate: getRelativeDate(30),
        endDate: getRelativeDate(100),
        pricePerNight: 120,
        minimumStayNights: 3,
      }
    });

    const aptoOffSeason = await db.season.create({
      data: {
        propertyId: apto.id,
        name: "Temporada Promocional",
        color: "#14b8a6", // Teal
        startDate: getRelativeDate(101),
        endDate: getRelativeDate(180),
        pricePerNight: 65,
        minimumStayNights: 1,
      }
    });

    // Reservas para Apartamento Centro
    // Reserva 1: En Semana Santa y Puentes
    const bookingApto1 = await db.booking.create({
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
        bookingId: bookingApto1.id,
        seasonId: aptoHighSeason.id,
        startDate: getRelativeDate(5),
        endDate: getRelativeDate(9),
        pricePerNight: 90,
        nights: 4,
        subtotal: 360,
      }
    });

    // Reserva 2: En Verano Centro Histórico
    const bookingApto2 = await db.booking.create({
      data: {
        propertyId: apto.id,
        guestName: "Guillaume Dubois",
        guestsTotal: 3,
        adults: 2,
        children: 1,
        checkInDate: getRelativeDate(40),
        checkOutDate: getRelativeDate(47),
        totalPrice: 840,
        depositAmount: 200,
        depositPaid: true,
        depositPaidAt: getRelativeDate(12),
        fullyPaid: true,
        fullyPaidAt: getRelativeDate(35),
        notes: "Solicita plaza de garaje.",
      }
    });

    await db.bookingPriceSegment.create({
      data: {
        bookingId: bookingApto2.id,
        seasonId: aptoSummerSeason.id,
        startDate: getRelativeDate(40),
        endDate: getRelativeDate(47),
        pricePerNight: 120,
        nights: 7,
        subtotal: 840,
      }
    });

    // Reserva 3: En Temporada Promocional
    const bookingApto3 = await db.booking.create({
      data: {
        propertyId: apto.id,
        guestName: "Roberto Mancini",
        guestsTotal: 2,
        adults: 2,
        children: 0,
        checkInDate: getRelativeDate(110),
        checkOutDate: getRelativeDate(114),
        totalPrice: 260,
        depositAmount: 65,
        depositPaid: false,
        fullyPaid: false,
      }
    });

    await db.bookingPriceSegment.create({
      data: {
        bookingId: bookingApto3.id,
        seasonId: aptoOffSeason.id,
        startDate: getRelativeDate(110),
        endDate: getRelativeDate(114),
        pricePerNight: 65,
        nights: 4,
        subtotal: 260,
      }
    });

    // Reserva 4: Reserva corta regular (sin temporada asociada)
    await db.booking.create({
      data: {
        propertyId: apto.id,
        guestName: "Elena Petrova",
        guestsTotal: 1,
        adults: 1,
        children: 0,
        checkInDate: getRelativeDate(15),
        checkOutDate: getRelativeDate(17),
        totalPrice: 160, // Tarifa base
        depositAmount: 40,
        depositPaid: true,
        depositPaidAt: getRelativeDate(2),
        fullyPaid: true,
        fullyPaidAt: getRelativeDate(14),
      }
    });


    // ==========================================
    // VIVIENDA 3: Casa Rural Pirineos (Ocupado Hoy)
    // ==========================================
    const casa = await db.property.create({
      data: {
        userId: user.id,
        name: "Casa Rural Pirineos",
        color: "#f59e0b", // Amber
        maxGuests: 8,
      },
    });

    // Periodos de disponibilidad (Expirado e Invierno/Primavera Activo)
    await db.propertyAvailabilityPeriod.createMany({
      data: [
        {
          propertyId: casa.id,
          description: "Temporada Invierno Pasada",
          startDate: getRelativeDate(-90),
          endDate: getRelativeDate(-10),
        },
        {
          propertyId: casa.id,
          description: "Temporada de Montaña Activa",
          startDate: getRelativeDate(0),
          endDate: getRelativeDate(200),
        }
      ]
    });

    // Temporadas
    const casaHikingSeason = await db.season.create({
      data: {
        propertyId: casa.id,
        name: "Senderismo Primavera-Verano",
        color: "#10b981", // Emerald
        startDate: getRelativeDate(10),
        endDate: getRelativeDate(90),
        pricePerNight: 180,
        minimumStayNights: 2,
      }
    });

    const casaFoliageSeason = await db.season.create({
      data: {
        propertyId: casa.id,
        name: "Otoño y Micología",
        color: "#8b5cf6", // Violet
        startDate: getRelativeDate(91),
        endDate: getRelativeDate(150),
        pricePerNight: 160,
        minimumStayNights: 2,
      }
    });

    // Reserva 1: Histórica pasada
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

    // Reserva 2: Activa (Empieza hoy)
    await db.booking.create({
      data: {
        propertyId: casa.id,
        guestName: "Lucas Varela",
        guestsTotal: 8,
        adults: 6,
        children: 2,
        checkInDate: getRelativeDate(0), // Hoy
        checkOutDate: getRelativeDate(5),
        totalPrice: 900,
        depositAmount: 250,
        depositPaid: true,
        depositPaidAt: getRelativeDate(-20),
        fullyPaid: false,
        notes: "Viaja con mascota.",
      }
    });

    // Reserva 3: Senderismo Primavera-Verano
    const bookingCasa3 = await db.booking.create({
      data: {
        propertyId: casa.id,
        guestName: "Javier Bardem",
        guestsTotal: 4,
        adults: 4,
        children: 0,
        checkInDate: getRelativeDate(20),
        checkOutDate: getRelativeDate(25),
        totalPrice: 900,
        depositAmount: 200,
        depositPaid: true,
        depositPaidAt: getRelativeDate(-2),
        fullyPaid: true,
        fullyPaidAt: getRelativeDate(15),
      }
    });

    await db.bookingPriceSegment.create({
      data: {
        bookingId: bookingCasa3.id,
        seasonId: casaHikingSeason.id,
        startDate: getRelativeDate(20),
        endDate: getRelativeDate(25),
        pricePerNight: 180,
        nights: 5,
        subtotal: 900,
      }
    });

    // Reserva 4: Otoño y Micología
    const bookingCasa4 = await db.booking.create({
      data: {
        propertyId: casa.id,
        guestName: "Laura Pausini",
        guestsTotal: 6,
        adults: 5,
        children: 1,
        checkInDate: getRelativeDate(100),
        checkOutDate: getRelativeDate(107),
        totalPrice: 1120,
        depositAmount: 300,
        depositPaid: true,
        depositPaidAt: getRelativeDate(40),
        fullyPaid: false,
        notes: "Solicita leña para la chimenea.",
      }
    });

    await db.bookingPriceSegment.create({
      data: {
        bookingId: bookingCasa4.id,
        seasonId: casaFoliageSeason.id,
        startDate: getRelativeDate(100),
        endDate: getRelativeDate(107),
        pricePerNight: 160,
        nights: 7,
        subtotal: 1120,
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

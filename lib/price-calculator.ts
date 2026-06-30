export interface Season {
  id: string;
  propertyId: string;
  name: string;
  color: string;
  startDate: string | Date;
  endDate: string | Date;
  pricePerNight: number;
  minimumStayNights: number;
}

export interface Tramo {
  startDate: Date;
  endDate: Date;
  nights: number;
  availableSeasons: Season[];
  selectedSeasonId: string | null;
}

export interface TramoConfig {
  startDate: string | Date;
  endDate: string | Date;
  selectedSeasonId: string | null;
}

export function splitBookingIntoTramos(
  checkInStr: string,
  checkOutStr: string,
  seasons: Season[]
): Tramo[] {
  const checkIn = new Date(checkInStr);
  checkIn.setHours(0, 0, 0, 0);
  const checkOut = new Date(checkOutStr);
  checkOut.setHours(0, 0, 0, 0);

  const totalNights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  if (totalNights <= 0) return [];

  const daySegments: { date: Date; seasons: Season[] }[] = [];

  for (let i = 0; i < totalNights; i++) {
    const currentDay = new Date(checkIn);
    currentDay.setDate(checkIn.getDate() + i);

    const activeSeasons = seasons.filter((s) => {
      const start = new Date(s.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(s.endDate);
      end.setHours(0, 0, 0, 0);
      return currentDay >= start && currentDay < end;
    });

    daySegments.push({
      date: currentDay,
      seasons: activeSeasons,
    });
  }

  const tramos: Tramo[] = [];
  if (daySegments.length === 0) return [];

  let currentTramoDays: Date[] = [daySegments[0].date];
  let currentTramoSeasons = daySegments[0].seasons;

  const getSeasonIdsStr = (sList: Season[]) =>
    sList.map((s) => s.id).sort().join(",");

  for (let i = 1; i < daySegments.length; i++) {
    const day = daySegments[i];
    const prevIds = getSeasonIdsStr(currentTramoSeasons);
    const currIds = getSeasonIdsStr(day.seasons);

    if (prevIds === currIds) {
      currentTramoDays.push(day.date);
    } else {
      const start = currentTramoDays[0];
      const end = new Date(currentTramoDays[currentTramoDays.length - 1]);
      end.setDate(end.getDate() + 1);

      const selectedSeasonId =
        currentTramoSeasons.length === 1 ? currentTramoSeasons[0].id : null;

      tramos.push({
        startDate: start,
        endDate: end,
        nights: currentTramoDays.length,
        availableSeasons: currentTramoSeasons,
        selectedSeasonId,
      });

      currentTramoDays = [day.date];
      currentTramoSeasons = day.seasons;
    }
  }

  const start = currentTramoDays[0];
  const end = new Date(currentTramoDays[currentTramoDays.length - 1]);
  end.setDate(end.getDate() + 1);

  const selectedSeasonId =
    currentTramoSeasons.length === 1 ? currentTramoSeasons[0].id : null;

  tramos.push({
    startDate: start,
    endDate: end,
    nights: currentTramoDays.length,
    availableSeasons: currentTramoSeasons,
    selectedSeasonId,
  });

  return tramos;
}

export function calculatePriceFromTramos(
  tramos: TramoConfig[],
  seasons: Season[]
) {
  let totalPrice = 0;
  const segmentsBreakdown = tramos.map((t) => {
    const checkIn = new Date(t.startDate);
    const checkOut = new Date(t.endDate);
    const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    let pricePerNight = 0;
    let seasonName = "Sin temporada";
    let subtotal = 0;

    if (t.selectedSeasonId) {
      const season = seasons.find((s) => s.id === t.selectedSeasonId);
      if (season) {
        pricePerNight = season.pricePerNight;
        seasonName = season.name;
        subtotal = nights * pricePerNight;
      }
    }

    totalPrice += subtotal;

    return {
      startDate: t.startDate,
      endDate: t.endDate,
      nights,
      pricePerNight,
      seasonName,
      seasonId: t.selectedSeasonId,
      subtotal,
    };
  });

  return {
    totalPrice,
    segmentsBreakdown,
  };
}

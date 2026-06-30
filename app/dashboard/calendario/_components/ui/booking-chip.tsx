"use client";

import { CalendarBooking } from "../../_types";

interface BookingChipProps {
  booking: CalendarBooking;
  compact?: boolean;
}

export default function BookingChip({ booking, compact = false }: BookingChipProps) {
  const bgColor = booking.propertyColor;

  if (compact) {
    return (
      <span
        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: bgColor }}
        title={`${booking.guestName} – ${booking.propertyName}`}
      />
    );
  }

  return (
    <div
      className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-white truncate max-w-full leading-tight"
      style={{
        backgroundColor: `${bgColor}33`, // 20% opacity background
        borderLeft: `3px solid ${bgColor}`,
        color: "white",
      }}
      title={`${booking.guestName} – ${booking.propertyName}`}
    >
      <span className="truncate block">{booking.guestName}</span>
    </div>
  );
}

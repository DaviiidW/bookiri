"use client";

import { CalendarBooking } from "../../_types";

interface BookingChipProps {
  booking: CalendarBooking;
  compact?: boolean;
  onClick?: () => void;
}

export default function BookingChip({ booking, compact = false, onClick }: BookingChipProps) {
  const bgColor = booking.propertyColor;

  if (compact) {
    return (
      <span
        onClick={onClick}
        className="inline-block w-2 h-2 rounded-full flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: bgColor }}
        title={`${booking.guestName} – ${booking.propertyName}`}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-white truncate max-w-full leading-tight cursor-pointer hover:scale-[1.02] transition-transform"
      style={{
        backgroundColor: `${bgColor}33`,
        borderLeft: `3px solid ${bgColor}`,
        color: "white",
      }}
      title={`${booking.guestName} – ${booking.propertyName}`}
    >
      <span className="truncate block">{booking.guestName}</span>
    </div>
  );
}

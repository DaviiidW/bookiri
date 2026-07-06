"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { BookingDayType, CalendarBooking } from "../../_types";

interface BookingChipProps {
  booking: CalendarBooking;
  compact?: boolean;
  onClick?: () => void;
  dayType?: BookingDayType;
}

export default function BookingChip({ booking, compact = false, onClick, dayType = "middle" }: BookingChipProps) {
  const bgColor = booking.propertyColor;

  if (compact) {
    const dayLabel =
      dayType === "checkin" ? "Entra" : dayType === "checkout" ? "Sale" : null;

    return (
      <span
        onClick={onClick}
        className="inline-flex items-center justify-center w-3 h-3 rounded-full flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: bgColor }}
        title={`${booking.guestName} – ${booking.propertyName}${dayLabel ? ` (${dayLabel})` : ""}`}
      >
        {dayType === "checkin" && <ArrowDownRight size={9} strokeWidth={3} className="text-white" />}
        {dayType === "checkout" && <ArrowUpRight size={9} strokeWidth={3} className="text-white" />}
      </span>
    );
  }

  return (
    <div
      onClick={onClick}
      className="px-1.5 py-0.5 rounded-md text-[10px] font-bold truncate max-w-full leading-tight cursor-pointer hover:scale-[1.02] transition-transform"
      style={{
        backgroundColor: `${bgColor}18`,
        borderLeft: `3px solid ${bgColor}`,
        color: bgColor,
      }}
      title={`${booking.guestName} – ${booking.propertyName}`}
    >
      <span className="truncate block">{booking.guestName}</span>
    </div>
  );
}

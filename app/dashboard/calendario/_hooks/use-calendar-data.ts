"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CalendarView,
  CalendarProperty,
  CalendarBooking,
} from "../_types";

export function useCalendarData() {
  const [allProperties, setAllProperties] = useState<CalendarProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<CalendarView>("month");

  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al cargar el calendario");
      }
      setAllProperties(data.properties || []);
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProperties = useMemo<CalendarProperty[]>(() => {
    if (!selectedPropertyId) return allProperties;
    return allProperties.filter((p) => p.id === selectedPropertyId);
  }, [allProperties, selectedPropertyId]);

  const visibleBookings = useMemo<CalendarBooking[]>(() => {
    return filteredProperties.flatMap((p) => p.bookings);
  }, [filteredProperties]);


  const goToPrev = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      d.setDate(1);
      return d;
    });
  }, []);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      d.setDate(1);
      return d;
    });
  }, []);

  const goToToday = useCallback(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCurrentDate(d);
  }, []);

  return {
    allProperties,
    filteredProperties,
    visibleBookings,
    isLoading,
    error,
    view,
    setView,
    currentDate,
    goToPrev,
    goToNext,
    goToToday,
    selectedPropertyId,
    setSelectedPropertyId,
    selectedDate,
    setSelectedDate,
    refresh: fetchData,
  };
}

"use client";

import { useState, useEffect } from "react";

interface Property {
  id: string;
  name: string;
  color: string;
  maxGuests: number;
  isAvailableNow: boolean;
  isBookedNow: boolean;
  nextBooking: {
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
  } | null;
  futureBookingsCount: number;
}

interface Period {
  id?: string;
  startDate: string;
  endDate: string;
  description?: string;
}

interface AffectedBooking {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  propertyName: string;
  type?: "total" | "parcial";
}

interface BookingDecision {
  bookingId: string;
  action: "keep" | "delete";
  checkInDate: string;
  checkOutDate: string;
}

interface Booking {
  id: string;
  guestName: string;
  guestsTotal: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  fullyPaid: boolean;
  depositPaid: boolean;
}

export function usePropertyDetail(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [originalPeriods, setOriginalPeriods] = useState<Period[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isPeriodFormOpen, setIsPeriodFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [isConflictOpen, setIsConflictOpen] = useState(false);
  const [affectedBookings, setAffectedBookings] = useState<AffectedBooking[]>([]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsLimit, setBookingsLimit] = useState(5);
  const [bookingsTotalCount, setBookingsTotalCount] = useState(0);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);

  useEffect(() => {
    fetchPropertyAndAvailability();
  }, [id]);

  useEffect(() => {
    fetchBookings(bookingsPage, bookingsLimit);
  }, [id, bookingsPage, bookingsLimit]);

  const fetchPropertyAndAvailability = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const propRes = await fetch(`/api/properties`);
      const propData = await propRes.json();
      if (!propRes.ok || !propData.success) {
        throw new Error(propData.error || "No se pudo cargar la vivienda.");
      }

      const foundProp = propData.properties.find((p: Property) => p.id === id);
      if (!foundProp) {
        throw new Error("Vivienda no encontrada.");
      }
      setProperty(foundProp);

      const availRes = await fetch(`/api/properties/${id}/availability`);
      const availData = await availRes.json();
      if (!availRes.ok || !availData.success) {
        throw new Error(availData.error || "No se pudo cargar la disponibilidad.");
      }

      const formattedPeriods = (availData.availabilityPeriods || []).map((p: any) => ({
        id: p.id,
        startDate: new Date(p.startDate).toISOString().split("T")[0],
        endDate: new Date(p.endDate).toISOString().split("T")[0],
        description: p.description || "",
      }));

      setPeriods(formattedPeriods);
      setOriginalPeriods(JSON.parse(JSON.stringify(formattedPeriods)));
    } catch (err: any) {
      setError(err.message || "Error de conexión.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async (page: number, limit: number) => {
    setIsBookingsLoading(true);
    try {
      const res = await fetch(`/api/properties/${id}/bookings?page=${page}&limit=${limit}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings(data.bookings || []);
        setBookingsTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const handleOpenAddPeriod = () => {
    setEditingIndex(null);
    setIsPeriodFormOpen(true);
  };

  const handleOpenEditPeriod = (period: Period, index: number) => {
    setEditingIndex(index);
    setIsPeriodFormOpen(true);
  };

  const handleClosePeriodForm = () => {
    setIsPeriodFormOpen(false);
  };

  const handlePeriodFormSubmit = async (formData: { startDate: string; endDate: string; description: string }) => {
    const newPeriod: Period = {
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
    };

    let proposed: Period[] = [];
    if (editingIndex !== null) {
      proposed = periods.map((p, idx) => (idx === editingIndex ? newPeriod : p));
    } else {
      proposed = [...periods, newPeriod];
    }

    setIsPeriodFormOpen(false);
    await validateAndSave(proposed);
  };

  const handleLocalDeletePeriod = async (index: number) => {
    const proposed = periods.filter((_, idx) => idx !== index);
    await validateAndSave(proposed);
  };

  const validateAndSave = async (proposed: Period[]) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/properties/${id}/availability/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periods: proposed }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.affectedBookings && data.affectedBookings.length > 0) {
          setPeriods(proposed);
          setAffectedBookings(data.affectedBookings);
          setIsConflictOpen(true);
        } else {
          await performSave(proposed, []);
        }
      } else {
        setError(data.error || "Ocurrió un error al validar la disponibilidad.");
      }
    } catch (err) {
      setError("Error de conexión al validar disponibilidad.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const performSave = async (savePeriods: Period[], bookingActions: BookingDecision[]) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/properties/${id}/availability/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periods: savePeriods,
          bookingActions,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Disponibilidad guardada correctamente.");
        setTimeout(() => setSuccess(null), 4000);
        await fetchPropertyAndAvailability();
        await fetchBookings(1, bookingsLimit);
      } else {
        setError(data.error || "No se pudieron guardar los cambios de disponibilidad.");
        setPeriods(JSON.parse(JSON.stringify(originalPeriods)));
      }
    } catch (err) {
      setError("Error de conexión al guardar cambios.");
      console.error(err);
      setPeriods(JSON.parse(JSON.stringify(originalPeriods)));
    } finally {
      setIsSaving(false);
      setIsConflictOpen(false);
    }
  };

  const handleCloseConflict = () => {
    setIsConflictOpen(false);
    setPeriods(JSON.parse(JSON.stringify(originalPeriods)));
  };

  const handleConfirmConflicts = async (decisions: BookingDecision[]) => {
    await performSave(periods, decisions);
  };

  const editingPeriod = editingIndex !== null ? periods[editingIndex] : null;

  return {
    property,
    periods,
    isLoading,
    isSaving,
    error,
    success,
    isPeriodFormOpen,
    editingPeriod,
    isConflictOpen,
    affectedBookings,
    bookings,
    bookingsPage,
    bookingsLimit,
    bookingsTotalCount,
    isBookingsLoading,

    setBookingsPage,
    setBookingsLimit,
    handleOpenAddPeriod,
    handleOpenEditPeriod,
    handleClosePeriodForm,
    handlePeriodFormSubmit,
    handleLocalDeletePeriod,
    handleCloseConflict,
    handleConfirmConflicts,
    setSuccess,
    setError,
  };
}

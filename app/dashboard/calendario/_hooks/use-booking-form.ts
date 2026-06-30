import { useState, useEffect, useRef } from "react";
import { splitBookingIntoTramos, calculatePriceFromTramos, Tramo, Season } from "@/lib/price-calculator";

export interface Property {
  id: string;
  name: string;
  maxGuests: number;
  color: string;
}

export interface BookingPriceSegment {
  id: string;
  seasonId: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  nights: number;
  subtotal: number;
  season?: Season;
}

export interface Booking {
  id: string;
  propertyId: string;
  guestName: string;
  guestsTotal: number;
  adults: number;
  children: number;
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  depositPaidAt: string | null;
  fullyPaid: boolean;
  fullyPaidAt: string | null;
  notes: string | null;
  priceSegments?: BookingPriceSegment[];
  property?: Property;
}

interface UseBookingFormProps {
  isOpen: boolean;
  booking?: Booking | null;
  defaultCheckInDate?: string;
  defaultCheckOutDate?: string;
  defaultPropertyId?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function useBookingForm({
  isOpen,
  booking,
  defaultCheckInDate = "",
  defaultCheckOutDate = "",
  defaultPropertyId = "",
  onSuccess,
  onClose,
}: UseBookingFormProps) {
  const isEditMode = !!booking;

  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const depDateRef = useRef<HTMLInputElement>(null);
  const fullDateRef = useRef<HTMLInputElement>(null);

  const [properties, setProperties] = useState<Property[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);

  const [propertyId, setPropertyId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestsTotal, setGuestsTotal] = useState("2");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("16:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [notes, setNotes] = useState("");

  const [priceCalculationMode, setPriceCalculationMode] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  const [totalPrice, setTotalPrice] = useState("0");
  const [depositAmount, setDepositAmount] = useState("0");
  const [depositPaid, setDepositPaid] = useState(false);
  const [depositPaidAt, setDepositPaidAt] = useState("");
  const [fullyPaid, setFullyPaid] = useState(false);
  const [fullyPaidAt, setFullyPaidAt] = useState("");

  const [tramos, setTramos] = useState<Tramo[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [manualPriceBackup, setManualPriceBackup] = useState("");

  const [step, setStep] = useState<"form" | "confirm-delete">("form");

  useEffect(() => {
    async function loadData() {
      setIsLoadingData(true);
      try {
        const [propsRes, seasonsRes] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/seasons"),
        ]);
        const propsData = await propsRes.json();
        const seasonsData = await seasonsRes.json();

        setProperties(propsData.properties || []);
        setSeasons(seasonsData.seasons || []);
      } catch (err) {
        console.error("Error loading form properties/seasons:", err);
      } finally {
        setIsLoadingData(false);
      }
    }
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && properties.length > 0) {
      if (booking) {
        setIsReadOnly(true);
        setPropertyId(booking.propertyId);
        setGuestName(booking.guestName);
        setGuestsTotal(String(booking.guestsTotal));
        setAdults(String(booking.adults));
        setChildren(String(booking.children));
        setCheckInDate(booking.checkInDate.split("T")[0]);
        setCheckOutDate(booking.checkOutDate.split("T")[0]);
        setCheckInTime(booking.checkInTime || "16:00");
        setCheckOutTime(booking.checkOutTime || "12:00");
        setNotes(booking.notes || "");

        const mode = (booking.priceSegments && booking.priceSegments.length > 0) ? "AUTOMATIC" : "MANUAL";
        setPriceCalculationMode(mode);
        setTotalPrice(String(booking.totalPrice));
        setManualPriceBackup(String(booking.totalPrice));
        setDepositAmount(String(booking.depositAmount));
        setDepositPaid(booking.depositPaid);
        setDepositPaidAt(booking.depositPaidAt ? booking.depositPaidAt.split("T")[0] : "");
        setFullyPaid(booking.fullyPaid);
        setFullyPaidAt(booking.fullyPaidAt ? booking.fullyPaidAt.split("T")[0] : "");

        const propSeasons = seasons.filter(s => s.propertyId === booking.propertyId);
        const bookingTramos = splitBookingIntoTramos(
          booking.checkInDate.split("T")[0],
          booking.checkOutDate.split("T")[0],
          propSeasons
        );

        setTramos(bookingTramos);
      } else {
        setIsReadOnly(false);
        setPropertyId(defaultPropertyId || properties[0]?.id || "");
        setGuestName("");
        setGuestsTotal("2");
        setAdults("2");
        setChildren("0");
        setCheckInDate(defaultCheckInDate);
        setCheckOutDate(defaultCheckOutDate);
        setCheckInTime("16:00");
        setCheckOutTime("12:00");
        setNotes("");
        setPriceCalculationMode("AUTOMATIC");
        setTotalPrice("0");
        setManualPriceBackup("");
        setDepositAmount("0");
        setDepositPaid(false);
        setDepositPaidAt("");
        setFullyPaid(false);
        setFullyPaidAt("");
        setTramos([]);
      }
      setStep("form");
      setError(null);
    }
  }, [isOpen, booking, properties, seasons, defaultCheckInDate, defaultCheckOutDate, defaultPropertyId]);

  useEffect(() => {
    if (checkInDate && checkOutDate && propertyId) {
      const propSeasons = seasons.filter(s => s.propertyId === propertyId);
      const computedTramos = splitBookingIntoTramos(checkInDate, checkOutDate, propSeasons);
      setTramos(computedTramos);
    } else {
      setTramos([]);
    }
  }, [checkInDate, checkOutDate, propertyId, seasons]);

  useEffect(() => {
    if (priceCalculationMode === "AUTOMATIC" && tramos.length > 0) {
      const propSeasons = seasons.filter(s => s.propertyId === propertyId);
      const tramoConfigs = tramos.map((t) => ({
        startDate: t.startDate,
        endDate: t.endDate,
        selectedSeasonId: t.selectedSeasonId
      }));
      const calc = calculatePriceFromTramos(tramoConfigs, propSeasons);
      setTotalPrice(String(calc.totalPrice));
    }
  }, [tramos, priceCalculationMode, seasons, propertyId]);

  useEffect(() => {
    if (depositPaid && !depositPaidAt) {
      setDepositPaidAt(new Date().toISOString().split("T")[0]);
    } else if (!depositPaid) {
      setDepositPaidAt("");
    }
  }, [depositPaid]);

  useEffect(() => {
    if (fullyPaid && !fullyPaidAt) {
      setFullyPaidAt(new Date().toISOString().split("T")[0]);
    } else if (!fullyPaid) {
      setFullyPaidAt("");
    }
  }, [fullyPaid]);

  const selectedProperty = properties.find((p) => p.id === propertyId);
  const guestsNum = parseInt(guestsTotal, 10) || 0;
  const isOverCapacity = selectedProperty && guestsNum > selectedProperty.maxGuests;

  const pendingAmount = Math.max(0, (parseFloat(totalPrice) || 0) - (parseFloat(depositAmount) || 0));

  const handleModeToggle = (mode: "AUTOMATIC" | "MANUAL") => {
    if (mode === priceCalculationMode) return;
    setPriceCalculationMode(mode);
    if (mode === "MANUAL") {
      setTotalPrice(manualPriceBackup || totalPrice);
    }
  };

  const confirmDelete = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${booking!.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar la reserva");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setStep("form");
    } finally {
      setIsSaving(false);
    }
  };

  const submitSave = async () => {
    setIsSaving(true);
    setError(null);

    let finalTotalPrice = parseFloat(totalPrice) || 0;

    const depAmt = parseFloat(depositAmount) || 0;
    if (depAmt > finalTotalPrice) {
      setError("El importe de la señal no puede ser mayor que el precio total");
      setIsSaving(false);
      setStep("form");
      return;
    }

    const payload = {
      propertyId,
      checkInDate: new Date(checkInDate).toISOString(),
      checkOutDate: new Date(checkOutDate).toISOString(),
      checkInTime,
      checkOutTime,
      guestName,
      guestsTotal: guestsNum,
      adults: parseInt(adults, 10) || 0,
      children: parseInt(children, 10) || 0,
      notes,
      totalPrice: finalTotalPrice,
      depositAmount: parseFloat(depositAmount) || 0,
      depositPaid,
      depositPaidAt: depositPaid ? new Date(depositPaidAt).toISOString() : null,
      fullyPaid,
      fullyPaidAt: fullyPaid ? new Date(fullyPaidAt).toISOString() : null,
    };

    try {
      const url = isEditMode ? `/api/bookings/${booking!.id}` : "/api/bookings";
      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar la reserva");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setStep("form");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!propertyId) return setError("Selecciona una vivienda");
    if (!guestName.trim()) return setError("El nombre del huésped es obligatorio");
    if (!checkInDate || !checkOutDate) return setError("Las fechas son obligatorias");

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn) {
      return setError("La fecha de salida debe ser posterior a la de entrada");
    }

    const priceTotalNum = parseFloat(totalPrice) || 0;
    const depositAmtNum = parseFloat(depositAmount) || 0;
    if (depositAmtNum > priceTotalNum) {
      return setError("El importe de la señal no puede ser mayor que el precio total");
    }

    if (priceCalculationMode === "AUTOMATIC") {
      const hasMissingSeason = tramos.some((t) => !t.selectedSeasonId);
      if (hasMissingSeason) {
        return setError("Todos los tramos deben tener una temporada asignada. En su defecto, cambia a precio manual.");
      }
    }

    await submitSave();
  };

  return {
    state: {
      isEditMode,
      propertyId,
      guestName,
      guestsTotal,
      adults,
      children,
      checkInDate,
      checkOutDate,
      checkInTime,
      checkOutTime,
      notes,
      priceCalculationMode,
      totalPrice,
      depositAmount,
      depositPaid,
      depositPaidAt,
      fullyPaid,
      fullyPaidAt,
      tramos,
      isLoadingData,
      isSaving,
      error,
      isReadOnly,
      manualPriceBackup,
      step,
      properties,
      seasons,
    },
    actions: {
      setPropertyId,
      setGuestName,
      setGuestsTotal,
      setAdults,
      setChildren,
      setCheckInDate,
      setCheckOutDate,
      setCheckInTime,
      setCheckOutTime,
      setNotes,
      setPriceCalculationMode,
      setTotalPrice,
      setDepositAmount,
      setDepositPaid,
      setDepositPaidAt,
      setFullyPaid,
      setFullyPaidAt,
      setIsReadOnly,
      setStep,
      handleModeToggle,
      confirmDelete,
      handleSubmit,
      setError,
    },
    computedValues: {
      selectedProperty,
      guestsNum,
      isOverCapacity,
      pendingAmount,
    },
    refs: {
      checkInRef,
      checkOutRef,
      depDateRef,
      fullDateRef,
    }
  };
}

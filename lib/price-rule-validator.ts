export interface PriceRuleInput {
  label?: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  daysOfWeek?: number[];
  propertyId: string;
}

export function validatePriceRules(rules: PriceRuleInput[]): string | null {
  for (const r of rules) {
    if (!r.propertyId)
      return "Falta asociar la vivienda a uno de los tramos.";
    if (!r.startDate || !r.endDate)
      return "Todos los tramos necesitan fecha de inicio y fin.";
    if (new Date(r.endDate) < new Date(r.startDate))
      return "La fecha de fin debe ser posterior a la de inicio.";
    if (typeof r.pricePerNight !== "number" || r.pricePerNight <= 0)
      return "El precio por noche debe ser mayor que 0.";
  }

  const rulesByProperty: Record<string, PriceRuleInput[]> = {};
  for (const r of rules) {
    if (!rulesByProperty[r.propertyId]) {
      rulesByProperty[r.propertyId] = [];
    }
    rulesByProperty[r.propertyId].push(r);
  }

  for (const propertyId in rulesByProperty) {
    const propRules = rulesByProperty[propertyId];

    for (let i = 0; i < propRules.length; i++) {
      for (let j = i + 1; j < propRules.length; j++) {
        const a = propRules[i];
        const b = propRules[j];

        const datesOverlap =
          new Date(a.startDate) <= new Date(b.endDate) &&
          new Date(b.startDate) <= new Date(a.endDate);

        if (!datesOverlap) continue;

        const aDays = (a.daysOfWeek ?? []).length === 0 ? [1, 2, 3, 4, 5, 6, 7] : a.daysOfWeek!;
        const bDays = (b.daysOfWeek ?? []).length === 0 ? [1, 2, 3, 4, 5, 6, 7] : b.daysOfWeek!;
        const daysOverlap = aDays.some((d) => bDays.includes(d));

        if (daysOverlap) {
          const nameA = a.label?.trim() || `Tramo ${i + 1}`;
          const nameB = b.label?.trim() || `Tramo ${j + 1}`;
          return `En la misma vivienda, los tramos "${nameA}" y "${nameB}" se solapan en fechas y días de semana.`;
        }
      }
    }
  }

  return null;
}

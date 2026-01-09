import { formatPrettyDate } from "./formatPrettyDate";

/**
 * page = 0 → current week
 * page = 1 → previous week
 * page = 2 → 2 weeks ago
 */
export const getWeekRange = (page = 0) => {
  const today = new Date();

  // Move back by `page` weeks
  const base = new Date(today);
  base.setDate(today.getDate() - page * 7);

  // Start of week (Sunday)
  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay());

  // End of week (Saturday)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  // YYYY-MM-DD formatter
  const toISO = (d) => d.toISOString().split("T")[0];

  // Build all 7 dates
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    weekDates.push(toISO(d));
  }

  return {
    startDate: toISO(start),
    endDate: toISO(end),
    startLabel: formatPrettyDate(start),
    endLabel: formatPrettyDate(end),
    weekDates,
  };
};

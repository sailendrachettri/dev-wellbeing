import { formatPrettyDate } from "./formatPrettyDate";

/**
 * page = 0 → current week
 * page = 1 → previous week
 */

const toYMD = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getWeekRange = (page = 0) => {
  const today = new Date();

  // Shift by weeks
  const base = new Date(today);
  base.setDate(today.getDate() - page * 7);

  // ISO week (Monday = 1, Sunday = 7)
  const day = base.getDay() === 0 ? 7 : base.getDay();

  // Monday
  const start = new Date(base);
  start.setDate(base.getDate() - (day - 1));

  // Sunday
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    weekDates.push(toYMD(d));
  }

  return {
    startDate: toYMD(start), // ✅ local
    endDate: toYMD(end),     // ✅ local
    startLabel: formatPrettyDate(start),
    endLabel: formatPrettyDate(end),
    weekDates,              // Mon → Sun
  };
};

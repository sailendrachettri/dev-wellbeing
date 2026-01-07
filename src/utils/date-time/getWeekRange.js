import { formatPrettyDate } from "./formatPrettyDate";

export const getWeekRange = (page = 0) => {
  const today = new Date();

  // Move back by (page * 7) days
  const end = new Date(today);
  end.setDate(today.getDate() - page * 7);

  const start = new Date(end);
  start.setDate(end.getDate() - 6);

  return {
    startLabel: formatPrettyDate(start),
    endLabel: formatPrettyDate(end),
  };
};

export const getWeekRange = (page = 0) => {
  const today = new Date();

  // Move back by (page * 7) days
  const end = new Date(today);
  end.setDate(today.getDate() - page * 7);

  const start = new Date(end);
  start.setDate(end.getDate() - 6);

  const format = (d) =>
    d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return {
    startLabel: format(start),
    endLabel: format(end),
  };
};

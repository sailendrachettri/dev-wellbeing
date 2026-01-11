export function formatDateShort(dateStr) {
  const date = new Date(dateStr);

  const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
  const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
  const month = date.toLocaleDateString("en-GB", { month: "short" });

  return `${weekday}, ${day} ${month}`;
}

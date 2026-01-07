export function formatPrettyDate(dateStr) {
  const date = new Date(dateStr);

  const day = date.getDate();
  const year = date.getFullYear();

  const month = date.toLocaleString("en-US", { month: "short" });

  // Ordinal suffix logic
  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
    day % 10 === 2 && day !== 12 ? "nd" :
    day % 10 === 3 && day !== 13 ? "rd" :
    "th";

  return `${day}${suffix} ${month} ${year}`;
}

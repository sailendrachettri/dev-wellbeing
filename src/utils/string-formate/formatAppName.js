export function formatAppName(name) {
  if (!name) return "";

  // Remove .exe
  let clean = name.replace(/\.exe$/i, "");

  // Add space before uppercase letters that are not at the start
  clean = clean.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Capitalize first character of each word
  clean = clean
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return clean;
}

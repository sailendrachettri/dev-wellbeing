export function formatAppName(rawPath) {
  if (!rawPath) return "";

  // Extract base file name
  const parts = rawPath.split(/[/\\]/); // split on / or \
  let rawName = parts[parts.length - 1]; // last part of path

  const name = rawName.toLowerCase();

  const appMap = {
    "code.exe": "VS Code",
    "githubdesktop.exe": "GitHub Desktop",
    "pgadmin4.exe": "pgAdmin 4",
    "photos.exe": "Photos",
    "msedge.exe": "Microsoft Edge",
    "chrome.exe": "Google Chrome",
    "firefox.exe": "Firefox",
    "brave.exe": "Brave Browser",
    "app.exe": "Dev Wellbeing",
  };

  // Exact match first
  if (appMap[name]) {
    return appMap[name];
  }

  // Remove .exe
  let cleaned = rawName.replace(/\.exe$/i, "");

  // Insert space before numbers (pgAdmin4 → pgAdmin 4)
  cleaned = cleaned.replace(/([a-zA-Z])(\d)/g, "$1 $2");

  // Insert space before capitals (GitHubDesktop → GitHub Desktop)
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Capitalize words
  cleaned = cleaned
    .split(/[\s-_]+/) // split by space, dash, underscore
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return cleaned;
}

export function formatSeconds(seconds) {
  if (seconds < 1) return "0s"; // less than 1 second
  if (seconds < 60) return `${seconds}s`; // less than 1 minute

  const mins = Math.floor(seconds / 60);
  if (mins < 60) {
    const sec = seconds % 60;
    return sec > 0 ? `${mins}m ${sec}s` : `${mins}m`;
  }

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hours < 24) {
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

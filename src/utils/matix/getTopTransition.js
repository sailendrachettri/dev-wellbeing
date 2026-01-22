export const getTopTransition = (switches) => {
  const map = {};

  switches?.forEach((s) => {
    const a = s?.from_app;
    const b = s?.to_app;
    if (!a || !b) return;

    const key = [a, b].sort().join(" ↔ ");
    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
};


export const getTopBackAndForth = (switches) => {
  const map = {};

  switches?.forEach((s) => {
    const a = s?.from_app;
    const b = s?.to_app;
    if (!a || !b || a === b) return;

    // Treat A <-> B as same pair
    const [app1, app2] = [a, b].sort();
    const key = `${app1}↔${app2}`;

    map[key] = (map[key] || 0) + 1;
  });

  const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];

  if (!top) return null;

  const [pair, count] = top;
  const [app1, app2] = pair.split("↔");

  return {
    app1,
    app2,
    count,
  };
};

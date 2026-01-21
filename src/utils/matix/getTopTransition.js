
export const getTopTransition = (switches) => {
  const map = {};

  switches?.forEach((s) => {
    const key = `${s?.from_app} → ${s?.to_app}`;
    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
};
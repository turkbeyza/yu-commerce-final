export function money(n) {
  const v = Number(n || 0);
  return `$${v.toFixed(0)}`;
}

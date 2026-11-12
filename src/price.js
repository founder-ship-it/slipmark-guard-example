/** Price in pence after a percentage discount, rounded to the nearest penny. */
export function discounted(pence, percent) {
  if (!Number.isInteger(pence) || pence < 0) throw new RangeError("pence must be a non-negative integer");
  if (percent < 0 || percent > 100) throw new RangeError("percent must be between 0 and 100");
  return Math.round(pence * (1 - percent / 100));
}

export function roundUp(pence, step = 5) {
  return Math.ceil(pence / step) * step;
}

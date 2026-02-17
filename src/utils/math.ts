/** Clamp a value between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Linear interpolation between a and b by factor t. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Generate a normally distributed random number using the Box-Muller transform. */
export function randomNormal(mean: number, stddev: number): number {
  let u1 = Math.random();
  let u2 = Math.random();
  // Avoid log(0)
  while (u1 === 0) u1 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z * stddev;
}

/** Generate a Poisson-distributed random integer using Knuth's algorithm. */
export function randomPoisson(lambda: number): number {
  const l = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > l);
  return k - 1;
}

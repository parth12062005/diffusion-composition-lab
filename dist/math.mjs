export function normal(x, mean, variance) {
  if (!(variance > 0)) return NaN;
  return Math.exp(-0.5 * (x - mean) ** 2 / variance) / Math.sqrt(2 * Math.PI * variance);
}
export function score(x, g) { return -(x - g.mean) / g.variance; }
export function diffuse(g, a) {
  return {mean: a * g.mean, variance: a * a * g.variance + 1 - a * a};
}
export function combine(A, B, weight = 1) {
  const precision = 1 / A.variance + weight / B.variance;
  if (!(precision > 1e-10)) return null;
  const variance = 1 / precision;
  return {mean: variance * (A.mean / A.variance + weight * B.mean / B.variance), variance};
}
export function model(state) {
  const a = 1 - state.t;
  const A = {mean: state.mA, variance: state.vA};
  const B = {mean: state.mB, variance: state.vB};
  const weight = state.mode === 'and' ? 1 : -state.alpha;
  const clean = combine(A, B, weight);
  const noisyA = diffuse(A, a), noisyB = diffuse(B, a);
  return {a, A, B, weight, clean, noisyA, noisyB,
    current: combine(noisyA, noisyB, weight),
    required: clean ? diffuse(clean, a) : null};
}
export function seededRandom(seed = 814) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export function gaussianRandom(random) {
  return Math.sqrt(-2 * Math.log(Math.max(1e-12, random()))) * Math.cos(2 * Math.PI * random());
}
export function moments(values) {
  const mean = values.reduce((a,b)=>a+b,0)/values.length;
  return {mean, variance: values.reduce((a,b)=>a+(b-mean)**2,0)/values.length};
}

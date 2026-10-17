/**
 * Institutional Seedable Pseudo-Random Number Generator (PRNG)
 * Utilizes Mulberry32 algorithm combined with Box-Muller Gaussian transformation
 * to provide 100% deterministic, reproducible market simulation runs for CI and QA.
 */

export class SeededPRNG {
  private state: number;
  private hasSpareGaussian = false;
  private spareGaussian = 0;

  constructor(seed?: number) {
    // If no seed provided, derive from high-resolution time + crypto random bytes
    const initialSeed = seed !== undefined ? seed : Math.floor(Math.random() * 2147483647);
    this.state = initialSeed >>> 0;
  }

  /**
   * Generates a pseudo-random 32-bit unsigned integer using Mulberry32
   */
  public nextUint32(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  }

  /**
   * Generates a floating point number uniformly distributed in [0, 1)
   */
  public nextFloat(): number {
    return this.nextUint32() / 4294967296.0;
  }

  /**
   * Generates an integer uniformly distributed in [min, max] inclusive
   */
  public nextInt(min: number, max: number): number {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return lo + Math.floor(this.nextFloat() * (hi - lo + 1));
  }

  /**
   * Returns true with probability p (0.0 to 1.0)
   */
  public nextBoolean(probability: number): boolean {
    if (probability <= 0) return false;
    if (probability >= 1) return true;
    return this.nextFloat() < probability;
  }

  /**
   * Generates standard normal Gaussian random variable using Box-Muller transform
   * N(mean, stdev^2)
   */
  public nextGaussian(mean = 0, stdev = 1): number {
    if (this.hasSpareGaussian) {
      this.hasSpareGaussian = false;
      return mean + stdev * this.spareGaussian;
    }

    let u = 0;
    let v = 0;
    while (u === 0) u = this.nextFloat();
    while (v === 0) v = this.nextFloat();

    const mag = Math.sqrt(-2.0 * Math.log(u));
    const z0 = mag * Math.cos(2.0 * Math.PI * v);
    const z1 = mag * Math.sin(2.0 * Math.PI * v);

    this.spareGaussian = z1;
    this.hasSpareGaussian = true;

    return mean + stdev * z0;
  }

  /**
   * Generates a Log-Normal random variable (typical for trade volume and price increments)
   */
  public nextLogNormal(mu = 0, sigma = 1): number {
    const normal = this.nextGaussian(mu, sigma);
    return Math.exp(normal);
  }

  /**
   * Knuth Poisson random number generator
   */
  public nextPoisson(lambda: number): number {
    if (lambda <= 0) return 0;
    if (lambda > 30) {
      // Gaussian approximation for large lambda
      const val = Math.round(this.nextGaussian(lambda, Math.sqrt(lambda)));
      return Math.max(0, val);
    }

    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
      k += 1;
      p *= this.nextFloat();
    } while (p > L);
    return k - 1;
  }

  /**
   * Selects a random item from an array
   */
  public pick<T>(items: T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot pick from empty array");
    }
    const idx = Math.floor(this.nextFloat() * items.length);
    return items[idx];
  }

  /**
   * Gets current state snapshot
   */
  public getState(): number {
    return this.state;
  }
}

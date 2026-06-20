import seedrandom from "seedrandom";

export interface Prng {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
  chance: (probability: number) => boolean;
}

export function createPrng(seed: string): Prng {
  const rng = seedrandom(seed);

  return {
    next: () => rng.quick(),
    int: (min, max) => Math.floor(rng.quick() * (max - min + 1)) + min,
    pick: (items) => items[Math.floor(rng.quick() * items.length)],
    chance: (probability) => rng.quick() < probability
  };
}

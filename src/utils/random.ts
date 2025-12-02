// Mulberry32 seeded random number generator
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Returns a random number between 0 and 1
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns a random number between min and max
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  // Returns a random integer between min (inclusive) and max (exclusive)
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }
}

// Generate seed from date string (YYYY-MM-DD)
export function getSeedFromDate(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year * 10000 + month * 100 + day;
}

// Get today's seed
export function getTodaysSeed(): number {
  return getSeedFromDate(new Date());
}

// Format date for sharing (YYYY-MM-DD)
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

import { describe, it, expect } from 'vitest';
import { clamp, lerp, randomNormal, randomPoisson } from '../math';

describe('clamp', () => {
  it('returns min when value is below min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when value is above max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns value when in range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('returns a when t = 0', () => {
    expect(lerp(3, 7, 0)).toBe(3);
  });

  it('returns b when t = 1', () => {
    expect(lerp(3, 7, 1)).toBe(7);
  });

  it('returns midpoint when t = 0.5', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it('handles negative values', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });
});

describe('randomNormal', () => {
  it('produces samples with mean approximately equal to target', () => {
    const mean = 50;
    const stddev = 10;
    const n = 10000;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += randomNormal(mean, stddev);
    }
    const sampleMean = sum / n;
    expect(Math.abs(sampleMean - mean)).toBeLessThan(1);
  });
});

describe('randomPoisson', () => {
  it('produces samples with mean approximately equal to lambda', () => {
    const lambda = 5;
    const n = 10000;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += randomPoisson(lambda);
    }
    const sampleMean = sum / n;
    expect(Math.abs(sampleMean - lambda)).toBeLessThan(0.5);
  });

  it('returns non-negative integers', () => {
    for (let i = 0; i < 100; i++) {
      const val = randomPoisson(3);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(val)).toBe(true);
    }
  });
});

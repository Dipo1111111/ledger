import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    limiter = new RateLimiter({ windowMs: 1000, maxRequests: 3 });
  });

  it('allows requests within limit', () => {
    expect(limiter.checkLimit('key1')).toBe(true);
    expect(limiter.checkLimit('key1')).toBe(true);
    expect(limiter.checkLimit('key1')).toBe(true);
  });

  it('blocks requests over limit', () => {
    limiter.checkLimit('key1');
    limiter.checkLimit('key1');
    limiter.checkLimit('key1');
    expect(limiter.checkLimit('key1')).toBe(false);
  });

  it('resets after window expires', () => {
    limiter.checkLimit('key1');
    limiter.checkLimit('key1');
    limiter.checkLimit('key1');
    expect(limiter.checkLimit('key1')).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(1001);
    expect(limiter.checkLimit('key1')).toBe(true);
  });

  it('tracks different keys independently', () => {
    limiter.checkLimit('key1');
    limiter.checkLimit('key1');
    limiter.checkLimit('key1');
    expect(limiter.checkLimit('key1')).toBe(false);

    // Different key should still work
    expect(limiter.checkLimit('key2')).toBe(true);
  });

  it('getRemaining returns correct count', () => {
    expect(limiter.getRemaining('key1')).toBe(3);
    limiter.checkLimit('key1');
    expect(limiter.getRemaining('key1')).toBe(2);
    limiter.checkLimit('key1');
    limiter.checkLimit('key1');
    expect(limiter.getRemaining('key1')).toBe(0);
  });

  it('getResetTime returns 0 for unknown key', () => {
    expect(limiter.getResetTime('unknown')).toBe(0);
  });

  it('getResetTime returns positive for active key', () => {
    limiter.checkLimit('key1');
    const resetTime = limiter.getResetTime('key1');
    expect(resetTime).toBeGreaterThan(0);
    expect(resetTime).toBeLessThanOrEqual(1000);
  });
});

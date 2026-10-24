import { describe, it, expect } from 'vitest';
import { formatWeddingDate, formatShortDate, calculateTimeLeft } from './dateUtils.js';

describe('dateUtils', () => {
  it('formats wedding date correctly for display', () => {
    const formatted = formatWeddingDate('2026-12-14T19:30:00.000Z');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('December');
  });

  it('handles invalid or null dates gracefully', () => {
    expect(formatWeddingDate(null)).toBe('Date to be announced');
    expect(formatWeddingDate('invalid-date')).toBe('Date to be announced');
  });

  it('calculates remaining days, hours, minutes, and seconds', () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3600 * 1000).toISOString();
    const result = calculateTimeLeft(futureDate);
    expect(result.days).toBe(5);
    expect(result.isPast).toBe(false);
  });

  it('handles past dates with isPast flag', () => {
    const pastDate = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const result = calculateTimeLeft(pastDate);
    expect(result.isPast).toBe(true);
    expect(result.days).toBe(0);
  });
});

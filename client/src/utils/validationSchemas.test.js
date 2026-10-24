import { describe, it, expect } from 'vitest';
import {
  weddingDetailsSchema,
  eventItemSchema,
  customerLoginSchema,
  customerRegisterSchema,
} from './validationSchemas.js';

describe('validationSchemas', () => {
  it('validates a correct wedding details payload', () => {
    const validPayload = {
      brideName: 'Priya Sharma',
      groomName: 'Rohan Mehra',
      weddingDate: '2026-12-14',
      weddingTime: '07:30 PM',
      language: 'English',
      tagline: 'Two Souls, One Sacred Destiny',
      familyMessage: 'Together with our families, we invite you.',
      venueName: 'The Oberoi Udaivilas',
      venueAddress: 'Haridas Ji Ki Magri, Udaipur',
      venueMapUrl: 'https://maps.google.com/?q=Oberoi',
    };

    const result = weddingDetailsSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects short bride or groom names', () => {
    const invalidPayload = {
      brideName: 'P',
      groomName: 'R',
      weddingDate: '2026-12-14',
      venueName: 'Palace',
    };

    const result = weddingDetailsSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it('validates a dynamic ceremony event item', () => {
    const event = {
      id: 'evt-1',
      title: 'Haldi Ceremony',
      date: 'Day 1 — Morning',
      time: '10:30 AM',
      venue: 'Courtyard Lawn',
      description: 'Golden turmeric anointment ritual',
      icon: 'Sun',
    };

    const result = eventItemSchema.safeParse(event);
    expect(result.success).toBe(true);
  });

  it('validates customer login credentials', () => {
    const valid = customerLoginSchema.safeParse({
      email: 'bride@example.com',
      password: 'password123',
    });
    expect(valid.success).toBe(true);

    const invalid = customerLoginSchema.safeParse({
      email: 'not-an-email',
      password: '',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates customer registration with minimum 8 character password', () => {
    const valid = customerRegisterSchema.safeParse({
      name: 'Ananya Singhania',
      email: 'ananya@example.com',
      password: 'StrongPassword@123',
    });
    expect(valid.success).toBe(true);

    const shortPassword = customerRegisterSchema.safeParse({
      name: 'Ananya',
      email: 'ananya@example.com',
      password: 'short',
    });
    expect(shortPassword.success).toBe(false);
  });
});

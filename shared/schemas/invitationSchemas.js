import { z } from 'zod';

export const weddingDetailsSchema = z.object({
  brideName: z.string().min(2, "Bride's name must be at least 2 characters").max(60),
  groomName: z.string().min(2, "Groom's name must be at least 2 characters").max(60),
  weddingDate: z.string().min(1, 'Please select the auspicious wedding date'),
  weddingTime: z.string().optional().default('07:00 PM'),
  language: z.string().default('English'),
  tagline: z.string().max(100, 'Tagline is too long').default('Two Souls, One Sacred Destiny'),
  familyMessage: z.string().max(400, 'Family message cannot exceed 400 characters').default(
    'Together with their families, we cordially invite you to celebrate the joyous union of our beloved children.'
  ),
  venueName: z.string().min(3, 'Venue name is required'),
  venueAddress: z.string().max(250, 'Address is too long').optional().default(''),
  venueMapUrl: z.string().url('Please enter a valid Google Maps URL').or(z.literal('')).optional(),
});

export const eventItemSchema = z.object({
  id: z.string(),
  title: z.string().min(2, 'Ceremony title is required'),
  date: z.string().min(1, 'Date or Day label is required'),
  time: z.string().min(1, 'Time is required'),
  venue: z.string().optional().default(''),
  description: z.string().optional().default(''),
  icon: z.string().default('Calendar'),
});

export const photoUploadValidation = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 6,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
};

export const customerLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const customerRegisterSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});


import { format, isValid, parseISO } from 'date-fns';

/**
 * Format date nicely for display, e.g. "December 14, 2026"
 */
export const formatWeddingDate = (dateString) => {
  if (!dateString) return 'Date to be announced';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return 'Date to be announced';
    return format(date, 'EEEE, MMMM do, yyyy');
  } catch (e) {
    return 'Date to be announced';
  }
};

/**
 * Format short date, e.g. "Dec 14, 2026"
 */
export const formatShortDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return '';
    return format(date, 'MMM do, yyyy');
  } catch (e) {
    return '';
  }
};

/**
 * Calculate countdown units from target wedding date
 */
export const calculateTimeLeft = (targetDateString) => {
  if (!targetDateString) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isToday: false, totalSeconds: 0 };
  }

  try {
    const target = new Date(targetDateString).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (isNaN(difference)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isToday: false, totalSeconds: 0 };
    }

    if (difference <= 0) {
      // Past or ongoing
      const isWithinToday = Math.abs(difference) < 24 * 60 * 60 * 1000;
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isPast: !isWithinToday,
        isToday: isWithinToday,
        totalSeconds: 0,
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    const totalSeconds = Math.floor(difference / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      isPast: false,
      isToday: false,
      totalSeconds,
    };
  } catch (e) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isToday: false, totalSeconds: 0 };
  }
};

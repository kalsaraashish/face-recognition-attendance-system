import { format, parseISO } from 'date-fns';

export const formatDate = (dateString, formatPattern = 'dd MMM yyyy') => {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    return format(date, formatPattern);
  } catch (error) {
    return dateString;
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return '-';
  try {
    // If it's a "HH:MM:SS" time string
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const parts = timeString.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
    }
    return timeString;
  } catch (error) {
    return timeString;
  }
};

/**
 * Utilities for handling datetime inputs without unwanted timezone conversions
 * 
 * When using HTML datetime-local inputs, we want to preserve the exact date/time
 * the user enters without browser timezone conversions affecting the stored value.
 */

/**
 * Parse a datetime-local string (YYYY-MM-DDTHH:mm) to a Date object
 * without timezone conversion. The resulting Date will represent the
 * exact local date/time entered by the user.
 * 
 * @param dateTimeString - String in format "YYYY-MM-DDTHH:mm"
 * @returns Date object representing the local date/time
 * 
 * @example
 * parseDateTimeLocal("2025-01-02T14:00") // January 2, 2025 at 14:00 exactly
 */
export function parseDateTimeLocal(dateTimeString: string): Date {
  if (!dateTimeString) return new Date();
  
  // Split the datetime string into date and time parts
  const [datePart, timePart] = dateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = (timePart || '00:00').split(':').map(Number);
  
  // Create Date using local timezone constructor
  // Note: month is 0-indexed in JavaScript Date constructor
  return new Date(year, month - 1, day, hour, minute);
}

/**
 * Format a Date object to datetime-local string (YYYY-MM-DDTHH:mm)
 * Uses the Date's local values without timezone conversion.
 * 
 * @param date - Date object to format
 * @returns String in format "YYYY-MM-DDTHH:mm"
 * 
 * @example
 * formatDateTimeLocal(new Date(2025, 0, 2, 14, 0)) // "2025-01-02T14:00"
 */
export function formatDateTimeLocal(date: Date): string {
  if (!date || isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parse a stored date value (string or Date) to ensure it's a proper Date object
 * without unwanted timezone conversions for dates that should be treated as local.
 * 
 * @param dateValue - Date string, Date object, or timestamp
 * @returns Date object
 */
export function parseStoredDate(dateValue: string | Date | number): Date {
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === 'number') return new Date(dateValue);
  return new Date(dateValue);
}

/**
 * Validate if a datetime-local string is in the correct format
 * 
 * @param dateTimeString - String to validate
 * @returns boolean indicating if format is valid
 */
export function isValidDateTimeLocal(dateTimeString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (!regex.test(dateTimeString)) return false;
  
  const date = parseDateTimeLocal(dateTimeString);
  return !isNaN(date.getTime());
}
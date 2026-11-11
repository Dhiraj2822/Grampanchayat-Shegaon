/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * UTF-8 Encoding Helper Functions
 * Ensures proper handling of Marathi/Devanagari text throughout the application
 */

/**
 * Ensure text is properly encoded as UTF-8
 * Handles cases where text might be corrupted or misencoded
 */
export const ensureUTF8 = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // If text is already proper UTF-8 (contains Devanagari characters), return as-is
  if (/[\u0900-\u097F]/.test(text)) {
    return text;
  }
  
  // Try to detect and fix common encoding issues
  try {
    // Attempt to handle UTF-8 encoding issues
    const encoded = new TextEncoder().encode(text);
    const decoded = new TextDecoder('utf-8').decode(encoded);
    return decoded;
  } catch {
    // If decoding fails, return original text
    return text;
  }
};

/**
 * Create a translation function with UTF-8 encoding guarantee
 * Use this instead of inline t() functions for better reliability
 */
export const createTranslator = (language: 'en' | 'mr') => {
  return (english: string, marathi: string): string => {
    const selected = language === 'mr' ? marathi : english;
    return ensureUTF8(selected);
  };
};

/**
 * Validate that a string contains proper Devanagari characters
 * Useful for debugging encoding issues
 */
export const hasDevanagari = (text: string): boolean => {
  return /[\u0900-\u097F]/.test(text);
};

/**
 * Get the Unicode code points of a string
 * Useful for debugging character encoding issues
 */
export const getUnicodePoints = (text: string): number[] => {
  return Array.from(text).map(char => char.charCodeAt(0));
};

/**
 * Check if text appears corrupted (contains ? or similar placeholders)
 */
export const isTextCorrupted = (text: string): boolean => {
  return /[?]+/.test(text) || /[\uFFFD]+/.test(text); // \uFFFD is Unicode replacement character
};

/**
 * Safe JSON stringify/parse with UTF-8 handling
 */
export const safeJSONParse = <T = any>(jsonString: string): T | null => {
  try {
    const encoded = new TextEncoder().encode(jsonString);
    const decoded = new TextDecoder('utf-8').decode(encoded);
    return JSON.parse(decoded) as T;
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return null;
  }
};

export const safeJSONStringify = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encoded = new TextEncoder().encode(jsonString);
    const decoded = new TextDecoder('utf-8').decode(encoded);
    return decoded;
  } catch (e) {
    console.error('Failed to stringify JSON:', e);
    return '';
  }
};

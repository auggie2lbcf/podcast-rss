// src/utils.js

/**
 * Escapes special XML characters in a string.
 * @param {string} text The text to escape.
 * @returns {string} The escaped text.
 */
export function escapeXml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
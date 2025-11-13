/**
 * Normalize store_codes input to a unique, trimmed array
 * Supports both single store_code and store_codes array for backward compatibility
 *
 * @param {string|string[]|null|undefined} store_code - Single store code (backward compatibility)
 * @param {string[]|null|undefined} store_codes - Array of store codes (new format)
 * @returns {string[]|null} - Normalized array of unique, trimmed store codes or null
 */
const normalizeStoreCodes = (store_code, store_codes) => {
  const codes = [];

  // Handle store_codes array (new format)
  if (store_codes !== undefined && store_codes !== null) {
    if (Array.isArray(store_codes)) {
      store_codes.forEach(code => {
        if (code && typeof code === 'string') {
          const trimmed = code.trim();
          if (trimmed !== '') {
            codes.push(trimmed);
          }
        }
      });
    } else if (typeof store_codes === 'string') {
      const trimmed = store_codes.trim();
      if (trimmed !== '') {
        codes.push(trimmed);
      }
    }
  }

  // Handle single store_code (backward compatibility)
  if (store_code !== undefined && store_code !== null && typeof store_code === 'string') {
    const trimmed = store_code.trim();
    if (trimmed !== '') {
      codes.push(trimmed);
    }
  }

  // Return unique codes or null if empty
  if (codes.length === 0) {
    return null;
  }

  // Remove duplicates using Set
  return Array.from(new Set(codes));
};

/**
 * Validate store_codes array
 *
 * @param {string[]|null} storeCodes - Array of store codes to validate
 * @param {boolean} required - Whether store codes are required
 * @returns {{ valid: boolean, error: string|null }} - Validation result
 */
const validateStoreCodes = (storeCodes, required = false) => {
  if (!storeCodes || storeCodes.length === 0) {
    if (required) {
      return {
        valid: false,
        error: 'At least one store code is required'
      };
    }
    return { valid: true, error: null };
  }

  if (!Array.isArray(storeCodes)) {
    return {
      valid: false,
      error: 'store_codes must be an array'
    };
  }

  const invalidCodes = storeCodes.filter(code => !code || typeof code !== 'string' || code.trim() === '');
  if (invalidCodes.length > 0) {
    return {
      valid: false,
      error: 'All store codes must be non-empty strings'
    };
  }

  return { valid: true, error: null };
};

/**
 * Parse boolean value from string or boolean
 *
 * @param {any} value - Value to parse
 * @param {boolean} defaultValue - Default value if parsing fails
 * @returns {boolean} - Parsed boolean value
 */
const parseBoolean = (value, defaultValue) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (lowered === 'true') {
      return true;
    }
    if (lowered === 'false') {
      return false;
    }
  }

  return defaultValue;
};

/**
 * Parse number value from string or number
 *
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} - Parsed number value
 */
const parseNumber = (value, defaultValue) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : defaultValue;
};

module.exports = {
  normalizeStoreCodes,
  validateStoreCodes,
  parseBoolean,
  parseNumber
};

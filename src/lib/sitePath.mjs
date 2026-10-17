/**
 * @param {string} value
 * @returns {string}
 */
export function normalizeBasePath(value) {
  const path = value.replace(/^\/+|\/+$/g, '');
  return path ? `/${path}` : '';
}

/**
 * @param {string} value
 * @param {string} [basePath]
 * @returns {string}
 */
export function withBasePath(value, basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '') {
  const prefix = normalizeBasePath(basePath);
  if (!prefix || !value.startsWith('/') || value.startsWith('//')) return value;
  if (value === prefix || ['/', '?', '#'].some(boundary => value.startsWith(`${prefix}${boundary}`))) {
    return value;
  }
  return `${prefix}${value}`;
}

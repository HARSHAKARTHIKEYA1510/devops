import { formatPrice } from '../../utils/helpers';

describe('Frontend Helpers - Unit Tests', () => {
  test('formatPrice should correctly format numbers as INR', () => {
    // Note: Intl formatting might result in non-breaking spaces, so we replace them or just check the number
    const result = formatPrice(1299).replace(/\u00a0/g, ' ');
    expect(result).toMatch(/₹\s?1,299/);
  });

  test('formatPrice should handle 0 correctly', () => {
    const result = formatPrice(0).replace(/\u00a0/g, ' ');
    expect(result).toMatch(/₹\s?0/);
  });

  test('formatPrice should return default for non-numbers', () => {
    expect(formatPrice('abc')).toBe('₹0');
    expect(formatPrice(null)).toBe('₹0');
  });
});

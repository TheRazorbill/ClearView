import { describe, expect, it } from 'vitest';
import { pt } from '../i18n/locales/pt';
import { en } from '../i18n/locales/en';

function getNestedKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(getNestedKeys(v as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe('i18n system', () => {
  it('has identical key parity between pt and en locales', () => {
    const ptKeys = getNestedKeys(pt as unknown as Record<string, unknown>);
    const enKeys = getNestedKeys(en as unknown as Record<string, unknown>);

    expect(ptKeys).toEqual(enKeys);
  });

  it('contains valid non-empty string values for all pt translations', () => {
    const ptKeys = getNestedKeys(pt as unknown as Record<string, unknown>);
    expect(ptKeys.length).toBeGreaterThan(50);

    for (const key of ptKeys) {
      const parts = key.split('.');
      let val: unknown = pt;
      for (const part of parts) {
        val = (val as Record<string, unknown>)[part];
      }
      expect(typeof val).toBe('string');
      expect((val as string).trim().length).toBeGreaterThan(0);
    }
  });

  it('contains valid non-empty string values for all en translations', () => {
    const enKeys = getNestedKeys(en as unknown as Record<string, unknown>);
    expect(enKeys.length).toBeGreaterThan(50);

    for (const key of enKeys) {
      const parts = key.split('.');
      let val: unknown = en;
      for (const part of parts) {
        val = (val as Record<string, unknown>)[part];
      }
      expect(typeof val).toBe('string');
      expect((val as string).trim().length).toBeGreaterThan(0);
    }
  });

  it('does not contain forbidden em-dashes in any translation string', () => {
    const allStrings = [
      ...Object.values(pt.common),
      ...Object.values(pt.player),
      ...Object.values(en.common),
      ...Object.values(en.player),
    ];
    for (const s of allStrings) {
      if (typeof s === 'string') {
        expect(s).not.toMatch(/[—–]/);
      }
    }
  });
});

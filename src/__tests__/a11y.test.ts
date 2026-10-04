import { beforeEach, describe, expect, it } from 'vitest';
import { announceToScreenReader } from '../utils/a11y';

describe('a11y utilities', () => {
  beforeEach(() => {
    const elements: Record<string, any> = {};
    (globalThis as any).document = {
      getElementById: (id: string) => elements[id] || null,
      createElement: (tag: string) => {
        const el: any = {
          tagName: tag,
          attributes: {} as Record<string, string>,
          setAttribute: (name: string, val: string) => {
            el.attributes[name] = val;
          },
          getAttribute: (name: string) => el.attributes[name] || null,
          textContent: '',
          style: {},
          className: '',
        };
        return el;
      },
      body: {
        appendChild: (el: any) => {
          if (el.id) elements[el.id] = el;
        },
      },
    };
  });

  it('creates live region element in DOM and announces message', async () => {
    announceToScreenReader('Teste de leitor de tela');
    const region = (document as any).getElementById('a11y-live-region');
    expect(region).not.toBeNull();
    expect(region?.getAttribute('aria-live')).toBe('polite');

    await new Promise((r) => setTimeout(r, 60));
    expect(region?.textContent).toBe('Teste de leitor de tela');
  });

  it('supports assertive priority', async () => {
    announceToScreenReader('Mensagem urgente', 'assertive');
    const region = (document as any).getElementById('a11y-live-region');
    expect(region?.getAttribute('aria-live')).toBe('assertive');

    await new Promise((r) => setTimeout(r, 60));
    expect(region?.textContent).toBe('Mensagem urgente');
  });
});

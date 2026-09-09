import { describe, it, expect, beforeEach } from 'vitest';
import { createOverlay, placeOverlay, removeOverlay } from '../../src/utils.js';

describe('loading overlay', () => {
    let host;

    beforeEach(() => {
        host = document.createElement('div');
        host.appendChild(document.createTextNode('content'));
        document.body.appendChild(host);
    });

    it('has no debug text, gradient, or global z-index', () => {
        const overlay = createOverlay({})[0];

        expect(overlay.className).toBe('komponent-overlay');
        expect(overlay.textContent).toBe('');
        expect(overlay.querySelector('.komponent-overlay-spinner')).not.toBeNull();
        expect(overlay.getAttribute('style') || '').not.toMatch(/linear-gradient|z-index:\s*100000/);
        expect(document.getElementById('kviews-overlay-styles').textContent).not.toMatch(/z-index:\s*100000/);
        expect(document.getElementById('kviews-overlay-styles').textContent).toMatch(/z-index:\s*1/);
    });

    it('mounts inside the host and isolates stacking', () => {
        const $overlay = placeOverlay(host, {});
        const overlay = $overlay[0];

        expect(overlay.parentNode).toBe(host);
        expect(host.style.position).toBe('relative');
        expect(host.style.isolation).toBe('isolate');
        expect(host.nextElementSibling).not.toBe(overlay);
    });

    it('restores host stacking styles when removed', () => {
        const $overlay = placeOverlay(host, {});
        removeOverlay($overlay);

        expect(host.querySelector('.komponent-overlay')).toBeNull();
        expect(host.style.position).toBe('');
        expect(host.style.isolation).toBe('');
    });

    it('keeps isolation until the last overlay on the host is gone', () => {
        const first = placeOverlay(host, {});
        const second = placeOverlay(host, {});

        removeOverlay(first);
        expect(host.style.isolation).toBe('isolate');
        expect(host.querySelectorAll(':scope > .komponent-overlay')).toHaveLength(1);

        removeOverlay(second);
        expect(host.style.isolation).toBe('');
        expect(host.querySelector('.komponent-overlay')).toBeNull();
    });
});

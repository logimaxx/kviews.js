import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KViews } from '../../src/KViews.js';

describe('Collection Integration', () => {
    let mockFetch;

    beforeEach(() => {
        mockFetch = vi.fn();
        global.fetch = mockFetch;
        KViews.baseUrl = null;
    });

    it('should load and render collection', async () => {
        const mockData = {
            data: [
                {
                    id: '1',
                    type: 'posts',
                    attributes: { title: 'Post 1', content: 'Content 1' }
                },
                {
                    id: '2',
                    type: 'posts',
                    attributes: { title: 'Post 2', content: 'Content 2' }
                }
            ]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            text: () => Promise.resolve(JSON.stringify(mockData))
        });

        const el = document.createElement('div');
        el.innerHTML = '<div class="item"><h2>{{attributes.title}}</h2></div>';

        const collection = KViews.createCollectionInstance(el, {
            url: '/api/posts',
            type: 'posts'
        });

        // Wait for load to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(collection.items).toBeDefined();
        expect(collection.items.length).toBeGreaterThan(0);
    });

    it('should handle collection events', async () => {
        const el = document.createElement('div');
        el.innerHTML = '<div class="item">{{attributes.title}}</div>';

        const collection = KViews.createCollectionInstance(el, {
            url: '/api/posts',
            type: 'posts',
            dontload: true
        });

        const loadCallback = vi.fn();
        collection.on('load', loadCallback);

        // Simulate load
        await collection.loadFromData([
            { id: '1', type: 'posts', attributes: { title: 'Test' } }
        ]);

        expect(loadCallback).toHaveBeenCalled();
    });
});

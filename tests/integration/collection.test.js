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

    it('should apply item listeners to all items in collection', async () => {
        const el = document.createElement('div');
        el.innerHTML = '<div class="item">{{attributes.title}}</div>';

        const itemLoadCallback = vi.fn();
        const itemUpdateCallback = vi.fn();

        const collection = KViews.createCollectionInstance(el, {
            url: '/api/posts',
            type: 'posts',
            dontload: true,
            itemOn: {
                load: itemLoadCallback,
                update: itemUpdateCallback
            }
        });

        // Load items
        collection.loadFromData([
            { id: '1', type: 'posts', attributes: { title: 'Test 1' } },
            { id: '2', type: 'posts', attributes: { title: 'Test 2' } }
        ]);

        // Wait a bit for events to fire
        await new Promise(resolve => setTimeout(resolve, 50));

        // Check that item listeners were applied
        expect(collection.items.length).toBe(2);
        expect(itemLoadCallback).toHaveBeenCalledTimes(2);
        
        // Verify listeners are on items
        expect(collection.items[0].hasListeners('load')).toBe(true);
        expect(collection.items[0].hasListeners('update')).toBe(true);
        expect(collection.items[1].hasListeners('load')).toBe(true);
        expect(collection.items[1].hasListeners('update')).toBe(true);
    });

    it('should support itemListeners alias for itemOn', async () => {
        const el = document.createElement('div');
        el.innerHTML = '<div class="item">{{attributes.title}}</div>';

        const itemLoadCallback = vi.fn();

        const collection = KViews.createCollectionInstance(el, {
            url: '/api/posts',
            type: 'posts',
            dontload: true,
            itemListeners: {
                load: itemLoadCallback
            }
        });

        collection.loadFromData([
            { id: '1', type: 'posts', attributes: { title: 'Test' } }
        ]);

        await new Promise(resolve => setTimeout(resolve, 50));

        expect(itemLoadCallback).toHaveBeenCalled();
        expect(collection.items[0].hasListeners('load')).toBe(true);
    });
});

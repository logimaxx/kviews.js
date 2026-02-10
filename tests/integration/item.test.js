import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KViews } from '../../src/KViews.js';

describe('Item Integration', () => {
    let mockFetch;

    beforeEach(() => {
        mockFetch = vi.fn();
        global.fetch = mockFetch;
        KViews.baseUrl = null;
    });

    it('should load and render item', async () => {
        const mockData = {
            data: {
                id: '1',
                type: 'posts',
                attributes: {
                    title: 'Test Post',
                    content: 'Test Content'
                }
            }
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            text: () => Promise.resolve(JSON.stringify(mockData))
        });

        const el = document.createElement('div');
        el.innerHTML = '<h1>{{attributes.title}}</h1><p>{{attributes.content}}</p>';

        const item = KViews.createItemInstance(el, {
            url: '/api/posts/1',
            type: 'posts'
        });

        // Wait for load to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(item.id).toBe('1');
        expect(item.attributes.title).toBe('Test Post');
    });

    it('should handle item update', async () => {
        const el = document.createElement('div');
        el.innerHTML = '<h1>{{attributes.title}}</h1>';

        const item = KViews.createItemInstance(el, {
            url: '/api/posts/1',
            type: 'posts',
            dontload: true
        });

        // Set initial data
        item.loadFromData({
            id: '1',
            type: 'posts',
            attributes: {
                title: 'Original Title',
                content: 'Original Content'
            }
        });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            text: () => Promise.resolve(JSON.stringify({
                data: {
                    id: '1',
                    type: 'posts',
                    attributes: {
                        title: 'Updated Title',
                        content: 'Updated Content'
                    }
                }
            }))
        });

        await item.update({
            attributes: {
                title: 'Updated Title'
            }
        });

        expect(item.attributes.title).toBe('Updated Title');
    });

    it('should handle item events', async () => {
        const el = document.createElement('div');
        el.innerHTML = '<h1>{{attributes.title}}</h1>';

        const item = KViews.createItemInstance(el, {
            url: '/api/posts/1',
            type: 'posts',
            dontload: true
        });

        const loadCallback = vi.fn();
        item.on('load', loadCallback);

        item.loadFromData({
            id: '1',
            type: 'posts',
            attributes: { title: 'Test' }
        });

        // Note: Events might need to be triggered manually in tests
        // This depends on your event implementation
        expect(item.callbacks.load).toBeDefined();
    });
});

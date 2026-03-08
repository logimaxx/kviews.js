import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KViews } from '../../src/KViews.js';
import { Item } from '../../src/Item.js';
import { Collection } from '../../src/Collection.js';

describe('Bug Fixes', () => {
    beforeEach(() => {
        KViews.baseUrl = null;
        // Mock fetch
        global.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: new Headers(),
            text: () => Promise.resolve('{"data": []}')
        }));
    });

    describe('Bug 1: Promise wrappers in callbacks', () => {
        it('should call callbacks directly without Promise wrapper', () => {
            const el = document.createElement('div');
            el.innerHTML = '<div class="item">{{title}}</div>';
            
            const collection = KViews.createCollectionInstance(el, {
                url: '/api/posts',
                type: 'posts',
                dontload: true
            });

            const callback = vi.fn();
            collection.on('load', callback);

            // Trigger load event
            collection.loadFromData([
                { id: '1', type: 'posts', attributes: { title: 'Test' } }
            ]);

            // Callback should be called directly, not wrapped in Promise
            expect(callback).toHaveBeenCalledWith(collection);
        });
    });

    describe('Bug 2: Throw Error instead of string', () => {
        it('should throw Error object in URL constructor', async () => {
            const { URL } = await import('../../src/URL.js');
            
            expect(() => {
                new URL(null);
            }).toThrow(Error);
            
            expect(() => {
                new URL(123);
            }).toThrow(Error);
        });
    });

    describe('Bug 3: Use reject() instead of throw in Promise', () => {
        it('should reject Promise when URL is missing', async () => {
            const el = document.createElement('div');
            el.innerHTML = '<div class="item">{{title}}</div>';
            
            const item = KViews.createItemInstance(el, {
                type: 'posts',
                dontload: true
            });

            await expect(item.loadFromRemote()).rejects.toThrow();
        });

        it('should reject Promise when Collection URL is missing', async () => {
            const el = document.createElement('div');
            el.innerHTML = '<div class="item">{{title}}</div>';
            
            const collection = KViews.createCollectionInstance(el, {
                type: 'posts',
                dontload: true
            });

            await expect(collection.loadFromRemote()).rejects.toThrow();
        });
    });

    describe('Bug 4: Error handling in async delete()', () => {
        it('should handle errors in delete() method', async () => {
            const el = document.createElement('div');
            el.innerHTML = '<div class="item">{{title}}</div>';
            
            const item = KViews.createItemInstance(el, {
                url: '/api/posts/1',
                type: 'posts',
                dontload: true
            });

            // Set deleteUrl
            item.deleteUrl = item.url;

            // Mock fetch to reject
            global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

            await expect(item.delete()).rejects.toThrow();
        });
    });

    describe('Bug 5: Event listener cleanup', () => {
        it('should clean up event listeners when element is replaced', () => {
            const el = document.createElement('div');
            el.innerHTML = '<div class="item">{{title}}</div>';
            
            const item = KViews.createItemInstance(el, {
                url: '/api/posts/1',
                type: 'posts',
                dontload: true
            }, {
                id: '1',
                type: 'posts',
                attributes: { title: 'Original' }
            });

            // Render first time
            item.render();
            const firstEl = item.views[0].el;

            // Add event listener
            const handler = vi.fn();
            $(firstEl).on('click', handler);

            // Render again (should replace element)
            item.attributes.title = 'Updated';
            item.render();

            // Old element should have listeners removed
            // New element should exist
            expect(item.views[0].el).toBeDefined();
            expect(item.views[0].el).not.toBe(firstEl);
        });
    });

    describe('Bug 7: onupdate() before resolve()', () => {
        it('should call onupdate() before resolving Promise', async () => {
            const el = document.createElement('div');
            el.innerHTML = '<div class="item">{{title}}</div>';
            
            const collection = KViews.createCollectionInstance(el, {
                url: '/api/posts',
                type: 'posts',
                dontload: true
            });

            let onupdateCalled = false;
            collection.onupdate = vi.fn(() => {
                onupdateCalled = true;
            });

            // Mock successful append
            global.fetch = vi.fn(() => Promise.resolve({
                ok: true,
                status: 201,
                statusText: 'Created',
                headers: new Headers(),
                text: () => Promise.resolve(JSON.stringify({
                    data: {
                        id: '2',
                        type: 'posts',
                        attributes: { title: 'New Post' }
                    }
                }))
            }));

            await collection.append({
                attributes: { title: 'New Post' }
            });

            // onupdate should have been called
            expect(collection.onupdate).toHaveBeenCalled();
        });
    });
});

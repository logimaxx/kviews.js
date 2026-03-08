/**
 * Tests for Collection.append() fix - ensure existing items are not cleared
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Collection } from '../../src/Collection.js';
import { Item } from '../../src/Item.js';

describe('Collection.append() Fix', () => {
    it('should not clear existing items when appending a new item', async () => {
        const collection = new Collection({ 
            type: 'posts',
            navtype: 'page',
            url: '/api/posts'
        });

        // Add existing items
        const existingItem1 = new Item({ type: 'posts', id: '1', attributes: { title: 'Post 1' } });
        const existingItem2 = new Item({ type: 'posts', id: '2', attributes: { title: 'Post 2' } });
        collection.items.push(existingItem1);
        collection.items.push(existingItem2);

        // Mock storage.create to return single item response
        const mockResponse = {
            data: {
                data: {
                    id: '3',
                    type: 'posts',
                    attributes: { title: 'New Post' }
                }
            }
        };

        collection.storage = {
            create: vi.fn().mockResolvedValue(mockResponse)
        };
        collection.insertUrl = { toString: () => '/api/posts' };
        collection.view = {
            reset: vi.fn(),
            render: vi.fn()
        };

        // Mock loadItem to simulate adding item
        const originalLoadItem = collection.loadItem.bind(collection);
        collection.loadItem = vi.fn((data) => {
            const item = new Item({ type: 'posts', id: data.id, attributes: data.attributes });
            collection.items.push(item);
            item.render = vi.fn();
            return item;
        });

        await collection.append({ attributes: { title: 'New Post' } });

        // Should have all 3 items (2 existing + 1 new)
        expect(collection.items.length).toBe(3);
        expect(collection.items[0].id).toBe('1');
        expect(collection.items[1].id).toBe('2');
        expect(collection.items[2].id).toBe('3');
    });

    it('should handle single item response correctly', async () => {
        const collection = new Collection({ 
            type: 'posts',
            url: '/api/posts'
        });

        const mockResponse = {
            data: {
                data: {
                    id: '1',
                    type: 'posts',
                    attributes: { title: 'New Post' }
                }
            }
        };

        collection.storage = {
            create: vi.fn().mockResolvedValue(mockResponse)
        };
        collection.insertUrl = { toString: () => '/api/posts' };
        collection.view = {
            reset: vi.fn(),
            render: vi.fn()
        };

        collection.loadItem = vi.fn((data) => {
            const item = new Item({ type: 'posts', id: data.id, attributes: data.attributes });
            collection.items.push(item);
            item.render = vi.fn();
            return item;
        });

        const result = await collection.append({ attributes: { title: 'New Post' } });

        // Should return the new item
        expect(result).toBeDefined();
        expect(result.id).toBe('1');
        expect(collection.items.length).toBe(1);
    });

    it('should still handle collection responses correctly', () => {
        const collection = new Collection({ 
            type: 'posts',
            navtype: 'page'
        });

        const mockData = {
            data: [
                { id: '1', type: 'posts', attributes: { title: 'Post 1' } },
                { id: '2', type: 'posts', attributes: { title: 'Post 2' } }
            ]
        };

        collection.view = {
            reset: vi.fn(),
            render: vi.fn()
        };

        collection.loadItem = vi.fn((data) => {
            const item = new Item({ type: 'posts', id: data.id, attributes: data.attributes });
            collection.items.push(item);
            return item;
        });

        const result = collection.receiveRemoteData(mockData);

        // Should process collection correctly
        expect(collection.items.length).toBe(2);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
    });
});

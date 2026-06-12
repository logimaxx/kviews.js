/**
 * Tests for Collection insert() vs batchInsert() separation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Collection } from '../../src/Collection.js';
import { Item } from '../../src/Item.js';

describe('Collection insert() vs batchInsert() Separation', () => {
    describe('insert() - single item', () => {
        it('should insert a single item', async () => {
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
                _render: vi.fn()
            };

            collection.loadItem = vi.fn((data) => {
                const item = new Item({ type: 'posts', id: data.id, attributes: data.attributes });
                collection.items.push(item);
                item.render = vi.fn();
                return item;
            });

            const result = await collection.insert({ attributes: { title: 'New Post' } });

            // Should return single Item instance
            expect(result).toBeInstanceOf(Item);
            expect(result.id).toBe('1');
            expect(collection.items.length).toBe(1);
        });

        it('should throw error if array is passed to insert()', () => {
            const collection = new Collection({ type: 'posts' });

            expect(() => {
                collection.insert([{ attributes: { title: 'Post 1' } }]);
            }).toThrow('insert() expects a single item object. Use batchInsert() for multiple items.');
        });
    });

    describe('batchInsert() - multiple items', () => {
        it('should insert multiple items', async () => {
            const collection = new Collection({ 
                type: 'posts',
                url: '/api/posts'
            });

            const mockResponse = {
                data: {
                    data: [
                        { id: '1', type: 'posts', attributes: { title: 'Post 1' } },
                        { id: '2', type: 'posts', attributes: { title: 'Post 2' } }
                    ]
                }
            };

            collection.storage = {
                create: vi.fn().mockResolvedValue(mockResponse)
            };
            collection.insertUrl = { toString: () => '/api/posts' };
            collection.view = {
                reset: vi.fn(),
                _render: vi.fn()
            };

            const loadedItems = [];
            collection.loadItem = vi.fn((data) => {
                const item = new Item({ type: 'posts', id: data.id, attributes: data.attributes });
                collection.items.push(item);
                loadedItems.push(item);
                return item;
            });

            const result = await collection.batchInsert([
                { attributes: { title: 'Post 1' } },
                { attributes: { title: 'Post 2' } }
            ]);

            // Should return array of Item instances
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
            expect(result[0]).toBeInstanceOf(Item);
            expect(result[1]).toBeInstanceOf(Item);
            expect(collection.items.length).toBe(2);
        });

        it('should return empty array for empty input', async () => {
            const collection = new Collection({ type: 'posts' });

            const result = await collection.batchInsert([]);

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        it('should throw error if non-array is passed to batchInsert()', () => {
            const collection = new Collection({ type: 'posts' });

            expect(() => {
                collection.batchInsert({ attributes: { title: 'Post' } });
            }).toThrow('batchInsert() expects an array of items. Use insert() for a single item.');
        });
    });

    describe('append() - backward compatibility', () => {
        it('should delegate to insert() for single item', async () => {
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
                _render: vi.fn()
            };

            collection.loadItem = vi.fn((data) => {
                const item = new Item({ type: 'posts', id: data.id, attributes: data.attributes });
                collection.items.push(item);
                item.render = vi.fn();
                return item;
            });

            const result = await collection.append({ attributes: { title: 'New Post' } });

            // Should return single Item (delegated to insert())
            expect(result).toBeInstanceOf(Item);
            expect(result.id).toBe('1');
        });

        it('should delegate to batchInsert() for array', async () => {
            const collection = new Collection({ 
                type: 'posts',
                url: '/api/posts'
            });

            const mockResponse = {
                data: {
                    data: [
                        { id: '1', type: 'posts', attributes: { title: 'Post 1' } }
                    ]
                }
            };

            collection.storage = {
                create: vi.fn().mockResolvedValue(mockResponse)
            };
            collection.insertUrl = { toString: () => '/api/posts' };
            collection.view = {
                reset: vi.fn(),
                _render: vi.fn()
            };

            const loadedItems = [];
            collection.loadItem = vi.fn((data) => {
                const item = new Item({ type: 'posts', id: data.id, attributes: data.attributes });
                collection.items.push(item);
                loadedItems.push(item);
                return item;
            });

            const result = await collection.append([{ attributes: { title: 'Post 1' } }]);

            // Should return array (delegated to batchInsert())
            expect(Array.isArray(result)).toBe(true);
        });
    });
});

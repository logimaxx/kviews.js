/**
 * Tests for Collection integration fixes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Collection } from '../../src/Collection.js';
import { Item } from '../../src/Item.js';

describe('Collection Integration Fixes', () => {
    describe('Remove/Update Event Flow', () => {
        it('should emit update event only once when item is removed', async () => {
            const collection = new Collection({ type: 'posts' });
            const item = new Item({ type: 'posts', id: '1' });
            collection.items.push(item);
            item.collection = collection;

            const updateSpy = vi.spyOn(collection, 'onupdate');
            const triggerSpy = vi.spyOn(collection, '_trigger');

            await item.remove();

            // Should be called exactly once
            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(triggerSpy).toHaveBeenCalledWith('update', collection);
        });

        it('should not trigger update in removeItem()', () => {
            const collection = new Collection({ type: 'posts' });
            const item = new Item({ type: 'posts', id: '1' });
            collection.items.push(item);

            const updateSpy = vi.spyOn(collection, 'onupdate');

            collection.removeItem(item);

            // removeItem() should not trigger update (Item.remove() does it)
            expect(updateSpy).not.toHaveBeenCalled();
            expect(collection.items.length).toBe(0);
        });
    });

    describe('loadFromDataSource() navtype behavior', () => {
        it('should clear items for navtype="page"', async () => {
            const collection = new Collection({ 
                type: 'posts',
                navtype: 'page',
                url: '/api/posts'
            });

            // Add some existing items
            collection.items.push(new Item({ type: 'posts', id: '1' }));
            collection.items.push(new Item({ type: 'posts', id: '2' }));

            // Mock storage.read to return data
            const mockData = {
                data: [
                    { id: '3', type: 'posts', attributes: { title: 'New Post' } }
                ]
            };

            collection.storage = {
                read: vi.fn().mockResolvedValue({ data: mockData })
            };

            // Mock receiveRemoteData to simulate loading
            const originalReceive = collection.receiveRemoteData.bind(collection);
            collection.receiveRemoteData = vi.fn((data) => {
                collection.items.push(new Item({ type: 'posts', id: '3' }));
                return collection;
            });

            await collection.loadFromDataSource();

            // For page navtype, should clear and replace
            expect(collection.items.length).toBe(1);
            expect(collection.items[0].id).toBe('3');
        });

        it('should append items for navtype="scroll"', async () => {
            const collection = new Collection({ 
                type: 'posts',
                navtype: 'scroll',
                url: '/api/posts'
            });

            // Add some existing items
            const item1 = new Item({ type: 'posts', id: '1' });
            const item2 = new Item({ type: 'posts', id: '2' });
            collection.items.push(item1);
            collection.items.push(item2);

            // Mock storage.read to return data
            const mockData = {
                data: [
                    { id: '3', type: 'posts', attributes: { title: 'New Post' } }
                ]
            };

            collection.storage = {
                read: vi.fn().mockResolvedValue({ data: mockData })
            };

            // Mock receiveRemoteData to simulate loading
            collection.receiveRemoteData = vi.fn((data) => {
                collection.items.push(new Item({ type: 'posts', id: '3' }));
                return collection;
            });

            await collection.loadFromDataSource();

            // For scroll navtype, should append
            expect(collection.items.length).toBe(3);
            expect(collection.items[0].id).toBe('1');
            expect(collection.items[1].id).toBe('2');
            expect(collection.items[2].id).toBe('3');
        });
    });

    describe('extractMetadataAndData()', () => {
        it('should extract metadata and return data array', () => {
            const collection = new Collection({ type: 'posts' });
            
            const doc = {
                data: [
                    { id: '1', type: 'posts' },
                    { id: '2', type: 'posts' }
                ],
                meta: {
                    totalRecords: 100,
                    offset: 10
                }
            };

            const result = collection.extractMetadataAndData(doc);

            expect(result).toHaveLength(2);
            expect(collection.total).toBe(100);
            expect(collection.offset).toBe(10);
        });

        it('should work with parse() alias for backward compatibility', () => {
            const collection = new Collection({ type: 'posts' });
            
            const doc = {
                data: [{ id: '1', type: 'posts' }],
                meta: { totalRecords: 50 }
            };

            const result = collection.parse(doc);

            expect(result).toHaveLength(1);
            expect(collection.total).toBe(50);
        });
    });
});

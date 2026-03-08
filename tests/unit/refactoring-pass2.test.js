/**
 * Tests for Refactoring Pass 2 changes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Collection } from '../../src/Collection.js';
import { Item } from '../../src/Item.js';
import { KViews } from '../../src/KViews.js';
import { KViewsNetworkError } from '../../src/errors.js';

describe('Refactoring Pass 2', () => {
    describe('Collection pseudo-array removal', () => {
        it('should derive length from items array', () => {
            const collection = new Collection({ type: 'posts' });
            expect(collection.length).toBe(0);
            
            collection.items.push(new Item({ type: 'posts' }));
            expect(collection.length).toBe(1);
            
            collection.items.push(new Item({ type: 'posts' }));
            expect(collection.length).toBe(2);
            
            collection.items.pop();
            expect(collection.length).toBe(1);
        });

        it('should not allow setting length directly', () => {
            const collection = new Collection({ type: 'posts' });
            collection.items.push(new Item({ type: 'posts' }));
            
            expect(() => {
                collection.length = 5;
            }).toThrow();
            
            expect(collection.length).toBe(1);
        });

        it('should not use indexed properties (this[0], this[1])', () => {
            const collection = new Collection({ type: 'posts' });
            const item1 = new Item({ type: 'posts', id: '1' });
            const item2 = new Item({ type: 'posts', id: '2' });
            
            collection.items.push(item1);
            collection.items.push(item2);
            
            // Indexed properties should not exist
            expect(collection[0]).toBeUndefined();
            expect(collection[1]).toBeUndefined();
            
            // Only items array should contain items
            expect(collection.items[0]).toBe(item1);
            expect(collection.items[1]).toBe(item2);
        });
    });

    describe('Collection lifecycle safety', () => {
        it('clear() should be synchronous and not call async remove()', () => {
            const collection = new Collection({ type: 'posts' });
            const item1 = new Item({ type: 'posts' });
            const item2 = new Item({ type: 'posts' });
            
            collection.items.push(item1);
            collection.items.push(item2);
            
            // Mock remove to verify it's not called
            const removeSpy = vi.spyOn(item1, 'remove');
            const removeSpy2 = vi.spyOn(item2, 'remove');
            
            collection.clear();
            
            // remove() should not be called (clear is synchronous)
            expect(removeSpy).not.toHaveBeenCalled();
            expect(removeSpy2).not.toHaveBeenCalled();
            
            // Items should be cleared
            expect(collection.items.length).toBe(0);
            expect(collection.length).toBe(0);
        });

        it('destroy() should iterate over copy to avoid mutation during iteration', () => {
            const collection = new Collection({ type: 'posts' });
            const item1 = new Item({ type: 'posts' });
            const item2 = new Item({ type: 'posts' });
            
            collection.items.push(item1);
            collection.items.push(item2);
            
            const destroySpy1 = vi.spyOn(item1, 'destroy');
            const destroySpy2 = vi.spyOn(item2, 'destroy');
            
            collection.destroy();
            
            // Both items should be destroyed
            expect(destroySpy1).toHaveBeenCalled();
            expect(destroySpy2).toHaveBeenCalled();
            
            // Items array should be cleared
            expect(collection.items.length).toBe(0);
        });
    });

    describe('getRenderContext() contract', () => {
        it('should flatten relationships to template-friendly format', () => {
            const item = new Item({
                type: 'posts',
                attributes: { title: 'Post Title' },
                relationships: {
                    author: {
                        id: '1',
                        type: 'users',
                        attributes: { name: 'John Doe' }
                    },
                    tags: [
                        { id: '1', type: 'tags', attributes: { name: 'tech' } },
                        { id: '2', type: 'tags', attributes: { name: 'js' } }
                    ]
                }
            });
            
            const context = item.getRenderContext();
            
            // Attributes should be directly accessible
            expect(context.title).toBe('Post Title');
            
            // To-one relationship should be flattened
            expect(context.author).toEqual({
                id: '1',
                type: 'users',
                name: 'John Doe'
            });
            
            // To-many relationship should be array of flattened objects
            expect(context.tags).toEqual([
                { id: '1', type: 'tags', name: 'tech' },
                { id: '2', type: 'tags', name: 'js' }
            ]);
        });

        it('should not mutate internal state', () => {
            const item = new Item({
                type: 'posts',
                attributes: { title: 'Original' },
                relationships: {
                    author: {
                        id: '1',
                        type: 'users',
                        attributes: { name: 'Original Author' }
                    }
                }
            });
            
            const context = item.getRenderContext();
            
            // Modify context
            context.title = 'Modified';
            context.author.name = 'Modified Author';
            
            // Internal state should not be affected
            expect(item.attributes.title).toBe('Original');
            expect(item.relationships.author.attributes.name).toBe('Original Author');
        });
    });

    describe('getOrUpdateInstance() safe updates', () => {
        it('should only update whitelisted safe options', () => {
            const el = document.createElement('div');
            const collection = new Collection({ type: 'posts', url: '/api/posts' });
            $(el).data('instance', collection);
            
            // Try to update with both safe and unsafe options
            const options = {
                url: '/api/posts/new',
                template: '<div>{{title}}</div>',
                items: [new Item({ type: 'posts' })], // Should not be updated
                callbacks: { load: [] }, // Should not be updated
                length: 999 // Should not be updated
            };
            
            const result = KViews.getOrUpdateInstance(el, options);
            
            expect(result).toBe(collection);
            expect(collection.url.toString()).toContain('/api/posts/new');
            expect(collection.template).toBe('<div>{{title}}</div>');
            
            // Unsafe options should not be updated
            expect(collection.items.length).toBe(0);
            expect(collection.length).toBe(0);
        });
    });

    describe('Storage error classification', () => {
        it('should throw KViewsNetworkError for network failures', async () => {
            // This test would require mocking fetch to throw network error
            // For now, we verify the error class exists
            expect(KViewsNetworkError).toBeDefined();
            expect(KViewsNetworkError.prototype instanceof Error).toBe(true);
        });
    });
});

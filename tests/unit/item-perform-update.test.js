/**
 * Tests for Item.perform_update() relationship serialization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Item } from '../../src/Item.js';

describe('Item.perform_update() Relationship Serialization', () => {
    describe('Runtime to Wire Format Serialization', () => {
        it('should serialize to-one runtime object to JSON:API format', () => {
            const item = new Item({
                type: 'posts',
                id: '1',
                attributes: { title: 'Post' },
                relationships: {
                    author: {
                        id: '10',
                        type: 'users',
                        attributes: { name: 'Alice' }
                    }
                }
            });

            // Create shadow to mark relationship as changed
            item.shadow = {
                attributes: { title: 'Post' },
                relationships: {
                    author: null // Changed from null to object
                }
            };

            // Mock storage.update
            const updateSpy = vi.fn().mockResolvedValue({
                data: {
                    data: {
                        id: '1',
                        type: 'posts',
                        attributes: { title: 'Post' }
                    }
                }
            });

            item.storage = { update: updateSpy };
            item.updateUrl = { toString: () => '/api/posts/1' };

            return item.perform_update({ sync: true }).then(() => {
                // Verify the PATCH payload was serialized correctly
                const callArgs = updateSpy.mock.calls[0];
                const patchData = JSON.parse(callArgs[3]); // 4th argument is patchData

                // Relationship should be in JSON:API format
                expect(patchData.data.relationships.author).toEqual({
                    data: {
                        type: 'users',
                        id: '10'
                    }
                });

                // Runtime state should remain unchanged (runtime object)
                expect(item.relationships.author).toEqual({
                    id: '10',
                    type: 'users',
                    attributes: { name: 'Alice' }
                });
                expect(item.relationships.author.data).toBeUndefined();
            });
        });

        it('should serialize to-many runtime array to JSON:API format', () => {
            const item = new Item({
                type: 'posts',
                id: '1',
                relationships: {
                    tags: [
                        { id: '1', type: 'tags', attributes: { name: 'tech' } },
                        { id: '2', type: 'tags', attributes: { name: 'js' } }
                    ]
                }
            });

            item.shadow = {
                attributes: {},
                relationships: {
                    tags: [] // Changed from empty to array
                }
            };

            const updateSpy = vi.fn().mockResolvedValue({
                data: {
                    data: {
                        id: '1',
                        type: 'posts'
                    }
                }
            });

            item.storage = { update: updateSpy };
            item.updateUrl = { toString: () => '/api/posts/1' };

            return item.perform_update({ sync: true }).then(() => {
                const callArgs = updateSpy.mock.calls[0];
                const patchData = JSON.parse(callArgs[3]);

                // Relationship should be in JSON:API format
                expect(patchData.data.relationships.tags).toEqual({
                    data: [
                        { type: 'tags', id: '1' },
                        { type: 'tags', id: '2' }
                    ]
                });

                // Runtime state should remain unchanged (array of runtime objects)
                expect(Array.isArray(item.relationships.tags)).toBe(true);
                expect(item.relationships.tags[0].id).toBe('1');
                expect(item.relationships.tags[0].attributes.name).toBe('tech');
            });
        });

        it('should serialize null relationship to JSON:API format', () => {
            const item = new Item({
                type: 'posts',
                id: '1',
                relationships: {
                    author: null
                }
            });

            item.shadow = {
                attributes: {},
                relationships: {
                    author: {
                        id: '10',
                        type: 'users'
                    } // Changed from object to null
                }
            };

            const updateSpy = vi.fn().mockResolvedValue({
                data: {
                    data: {
                        id: '1',
                        type: 'posts'
                    }
                }
            });

            item.storage = { update: updateSpy };
            item.updateUrl = { toString: () => '/api/posts/1' };

            return item.perform_update({ sync: true }).then(() => {
                const callArgs = updateSpy.mock.calls[0];
                const patchData = JSON.parse(callArgs[3]);

                // Null relationship should be serialized correctly
                expect(patchData.data.relationships.author).toEqual({
                    data: null
                });

                // Runtime state should remain null
                expect(item.relationships.author).toBeNull();
            });
        });

        it('should not mutate runtime relationships during serialization', () => {
            const originalAuthor = {
                id: '10',
                type: 'users',
                attributes: { name: 'Alice' }
            };

            const item = new Item({
                type: 'posts',
                id: '1',
                relationships: {
                    author: originalAuthor
                }
            });

            item.shadow = {
                attributes: {},
                relationships: {
                    author: null
                }
            };

            const updateSpy = vi.fn().mockResolvedValue({
                data: {
                    data: {
                        id: '1',
                        type: 'posts'
                    }
                }
            });

            item.storage = { update: updateSpy };
            item.updateUrl = { toString: () => '/api/posts/1' };

            return item.perform_update({ sync: true }).then(() => {
                // Runtime relationship should be the same object reference
                expect(item.relationships.author).toBe(originalAuthor);
                expect(item.relationships.author.id).toBe('10');
                expect(item.relationships.author.data).toBeUndefined();
            });
        });

        it('should handle Item instances in relationships', () => {
            const authorItem = new Item({
                id: '10',
                type: 'users',
                attributes: { name: 'Alice' }
            });

            const item = new Item({
                type: 'posts',
                id: '1',
                relationships: {
                    author: authorItem
                }
            });

            item.shadow = {
                attributes: {},
                relationships: {
                    author: null
                }
            };

            const updateSpy = vi.fn().mockResolvedValue({
                data: {
                    data: {
                        id: '1',
                        type: 'posts'
                    }
                }
            });

            item.storage = { update: updateSpy };
            item.updateUrl = { toString: () => '/api/posts/1' };

            return item.perform_update({ sync: true }).then(() => {
                const callArgs = updateSpy.mock.calls[0];
                const patchData = JSON.parse(callArgs[3]);

                // Should serialize Item instance correctly
                expect(patchData.data.relationships.author).toEqual({
                    data: {
                        type: 'users',
                        id: '10'
                    }
                });

                // Runtime state should remain as Item instance
                expect(item.relationships.author).toBe(authorItem);
            });
        });
    });

    describe('Error handling', () => {
        it('rejects with the original storage error when PATCH fails', async () => {
            const item = new Item({ type: 'orders', id: '1', attributes: { x: 1 } });
            item.shadow = { attributes: { x: 0 }, relationships: {} };
            item.attributes.x = 1;
            const httpError = new Error('HTTP 422');
            httpError.jqXHR = { status: 422 };
            item.storage = { update: vi.fn().mockRejectedValue(httpError) };
            item.updateUrl = { toString: () => '/api/orders/1' };

            await expect(item.perform_update()).rejects.toBe(httpError);
        });
    });
});

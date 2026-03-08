/**
 * Tests for Item runtime relationship consistency
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Item } from '../../src/Item.js';

describe('Item Runtime Relationship Consistency', () => {
    describe('toJSON() side-effect free', () => {
        it('should not mutate relationships when serializing', () => {
            const item = new Item({
                type: 'posts',
                id: '1',
                attributes: { title: 'Post' },
                relationships: {
                    author: {
                        id: '10',
                        type: 'users',
                        attributes: { name: 'Alice' }
                    },
                    tags: [
                        { id: '1', type: 'tags', attributes: { name: 'tech' } },
                        { id: '2', type: 'tags', attributes: { name: 'js' } }
                    ],
                    invalidRel: 'some-invalid-value'
                }
            });

            const originalRelationships = JSON.parse(JSON.stringify(item.relationships));
            
            const json = item.toJSON();

            // Relationships should not be mutated
            expect(item.relationships).toEqual(originalRelationships);
            expect(item.relationships.invalidRel).toBe('some-invalid-value');
            
            // JSON should have JSON:API format
            expect(json.relationships.author.data).toEqual({ type: 'users', id: '10' });
            expect(json.relationships.tags.data).toHaveLength(2);
        });

        it('should serialize runtime objects to JSON:API format', () => {
            const item = new Item({
                type: 'posts',
                id: '1',
                relationships: {
                    author: {
                        id: '10',
                        type: 'users',
                        attributes: { name: 'Alice' }
                    },
                    tags: [
                        { id: '1', type: 'tags' },
                        { id: '2', type: 'tags' }
                    ],
                    nullRel: null
                }
            });

            const json = item.toJSON();

            // To-one relationship
            expect(json.relationships.author).toEqual({
                data: { type: 'users', id: '10' }
            });

            // To-many relationship
            expect(json.relationships.tags).toEqual({
                data: [
                    { type: 'tags', id: '1' },
                    { type: 'tags', id: '2' }
                ]
            });

            // Null relationship
            expect(json.relationships.nullRel).toEqual({
                data: null
            });
        });
    });

    describe('update()/updateRelation() runtime shape', () => {
        it('should maintain runtime object format, not JSON:API wrapper', () => {
            const item = new Item({
                type: 'posts',
                id: '1',
                relationships: {
                    author: {
                        id: '10',
                        type: 'users',
                        attributes: { name: 'Alice' }
                    }
                }
            });

            // Update with object
            item.update({
                author: {
                    id: '20',
                    type: 'users',
                    attributes: { name: 'Bob' }
                }
            }, { sync: false });

            // Should be runtime object, not { data: { id } }
            expect(item.relationships.author).toBeDefined();
            expect(item.relationships.author.id).toBe('20');
            expect(item.relationships.author.type).toBe('users');
            expect(item.relationships.author.data).toBeUndefined();
        });

        it('should handle id string updates without JSON:API wrapper', () => {
            const item = new Item({
                type: 'posts',
                id: '1',
                relationships: {
                    author: {
                        id: '10',
                        type: 'users'
                    }
                }
            });

            // Update with id string
            item.update({
                author: '20'
            }, { sync: false });

            // Should be runtime object with id, not { data: { id } }
            const rel = item.relationships.author;
            expect(rel).toBeDefined();
            expect(rel.id).toBe('20');
            expect(rel.data).toBeUndefined();
        });

        it('should handle null updates', () => {
            const item = new Item({
                type: 'posts',
                id: '1',
                relationships: {
                    author: {
                        id: '10',
                        type: 'users'
                    }
                }
            });

            item.update({
                author: null
            }, { sync: false });

            expect(item.relationships.author).toBeNull();
        });
    });

    describe('destroy() safe iteration', () => {
        it('should iterate over copy of views to avoid mutation', () => {
            const item = new Item({ type: 'posts' });
            
            // Create mock views that remove themselves on destroy
            const view1 = {
                destroy: () => {
                    // Simulate view removing itself from array
                    const index = item.views.indexOf(view1);
                    if (index !== -1) {
                        item.views.splice(index, 1);
                    }
                }
            };
            const view2 = {
                destroy: () => {
                    const index = item.views.indexOf(view2);
                    if (index !== -1) {
                        item.views.splice(index, 1);
                    }
                }
            };

            item.views = [view1, view2];

            // Should not throw or skip views
            expect(() => {
                item.destroy();
            }).not.toThrow();

            // Views should be cleared
            expect(item.views).toEqual([]);
        });
    });
});

/**
 * Tests for object identity preservation in parseItemData()
 */

import { describe, it, expect } from 'vitest';
import { parseItemData, hydrateDocumentData } from '../../src/dataParser.js';

describe('parseItemData() Identity Preservation', () => {
    it('should return the same object instance from hydrateDocumentData', () => {
        const doc = {
            data: {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' },
                relationships: {
                    author: {
                        data: { id: '10', type: 'users' }
                    }
                }
            },
            included: [
                { id: '10', type: 'users', attributes: { name: 'Alice' } }
            ]
        };

        const hydrated = hydrateDocumentData(doc);
        const parsed = parseItemData(doc);

        // Should be the same object instance
        expect(parsed).toBe(hydrated);
        expect(parsed).toBe(doc.data);
    });

    it('should preserve identity when called with already-hydrated resource', () => {
        const resource = {
            id: '1',
            type: 'posts',
            attributes: { title: 'Hello' }
        };

        const parsed = parseItemData(resource);

        // Should be the same object instance
        expect(parsed).toBe(resource);
    });

    it('should attach url to resource without breaking identity', () => {
        const doc = {
            data: {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' }
            },
            links: {
                self: '/api/posts/1'
            }
        };

        const hydrated = hydrateDocumentData(doc);
        const parsed = parseItemData(doc);

        // Should be the same object instance
        expect(parsed).toBe(hydrated);
        expect(parsed).toBe(doc.data);
        
        // URL should be attached
        expect(parsed.url).toBeDefined();
        expect(parsed.url.toString()).toContain('/api/posts/1');
    });

    it('should not overwrite existing url property', () => {
        const doc = {
            data: {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' },
                url: '/existing/url'
            },
            links: {
                self: '/api/posts/1'
            }
        };

        const parsed = parseItemData(doc);

        // Should preserve existing url
        expect(parsed.url).toBe('/existing/url');
    });

    it('should preserve shared object references in relationships', () => {
        const doc = {
            data: {
                id: '1',
                type: 'posts',
                relationships: {
                    author: {
                        data: { id: '10', type: 'users' }
                    }
                }
            },
            included: [
                { id: '10', type: 'users', attributes: { name: 'Alice' } }
            ]
        };

        const parsed = parseItemData(doc);

        // Relationship should reference the same object from included
        expect(parsed.relationships.author).toBe(doc.included[0]);
    });

    it('should preserve identity when parsing multiple times from same document', () => {
        const doc = {
            data: {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' }
            }
        };

        const parsed1 = parseItemData(doc);
        const parsed2 = parseItemData(doc);

        // Should be the same object instance (document is mutated)
        expect(parsed1).toBe(parsed2);
        expect(parsed1).toBe(doc.data);
    });
});

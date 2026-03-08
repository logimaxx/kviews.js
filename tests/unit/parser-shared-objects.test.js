/**
 * Tests for shared object instances in parser hydration
 * 
 * Ensures that multiple references to the same resource share the same object instance.
 */

import { describe, it, expect } from 'vitest';
import { hydrateDocumentData, parseCollectionData } from '../../src/dataParser.js';

describe('Parser Shared Object Instances', () => {
    it('should share the same object instance when multiple resources reference the same included resource', () => {
        const doc = {
            data: [
                {
                    id: '1',
                    type: 'posts',
                    attributes: { title: 'Post 1' },
                    relationships: {
                        author: {
                            data: { id: '10', type: 'users' }
                        }
                    }
                },
                {
                    id: '2',
                    type: 'posts',
                    attributes: { title: 'Post 2' },
                    relationships: {
                        author: {
                            data: { id: '10', type: 'users' }
                        }
                    }
                }
            ],
            included: [
                {
                    id: '10',
                    type: 'users',
                    attributes: { name: 'Alice' }
                }
            ]
        };

        const hydrated = hydrateDocumentData(doc);

        // Both posts should reference the same user object instance
        expect(hydrated[0].relationships.author).toBe(hydrated[1].relationships.author);
        expect(hydrated[0].relationships.author.id).toBe('10');
        expect(hydrated[1].relationships.author.id).toBe('10');
    });

    it('should share the same object instance in nested relationships', () => {
        const doc = {
            data: {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' },
                relationships: {
                    author: {
                        data: { id: '10', type: 'users' }
                    },
                    reviewer: {
                        data: { id: '10', type: 'users' }
                    }
                }
            },
            included: [
                {
                    id: '10',
                    type: 'users',
                    attributes: { name: 'Alice' }
                }
            ]
        };

        const hydrated = hydrateDocumentData(doc);

        // Author and reviewer should reference the same user object instance
        expect(hydrated.relationships.author).toBe(hydrated.relationships.reviewer);
        expect(hydrated.relationships.author.id).toBe('10');
        expect(hydrated.relationships.reviewer.id).toBe('10');
    });

    it('should share the same object instance in to-many relationships', () => {
        const doc = {
            data: [
                {
                    id: '1',
                    type: 'posts',
                    relationships: {
                        tags: {
                            data: [
                                { id: '1', type: 'tags' },
                                { id: '2', type: 'tags' }
                            ]
                        }
                    }
                },
                {
                    id: '2',
                    type: 'posts',
                    relationships: {
                        tags: {
                            data: [
                                { id: '1', type: 'tags' },
                                { id: '2', type: 'tags' }
                            ]
                        }
                    }
                }
            ],
            included: [
                { id: '1', type: 'tags', attributes: { name: 'tech' } },
                { id: '2', type: 'tags', attributes: { name: 'js' } }
            ]
        };

        const hydrated = hydrateDocumentData(doc);

        // Both posts should reference the same tag objects
        expect(hydrated[0].relationships.tags[0]).toBe(hydrated[1].relationships.tags[0]);
        expect(hydrated[0].relationships.tags[1]).toBe(hydrated[1].relationships.tags[1]);
    });

    it('should share the same object instance through parseCollectionData', () => {
        const doc = {
            data: [
                {
                    id: '1',
                    type: 'posts',
                    relationships: {
                        author: {
                            data: { id: '10', type: 'users' }
                        }
                    }
                },
                {
                    id: '2',
                    type: 'posts',
                    relationships: {
                        author: {
                            data: { id: '10', type: 'users' }
                        }
                    }
                }
            ],
            included: [
                { id: '10', type: 'users', attributes: { name: 'Alice' } }
            ]
        };

        const parsed = parseCollectionData(doc);

        // Both posts should reference the same user object instance
        expect(parsed[0].relationships.author).toBe(parsed[1].relationships.author);
    });

    it('should mutate original document and share objects', () => {
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

        const originalDataRef = doc.data;
        const hydrated = hydrateDocumentData(doc);

        // Should mutate original document
        expect(doc.data).toBe(originalDataRef);
        expect(hydrated).toBe(doc.data);
        
        // Should use same object from included
        expect(hydrated.relationships.author).toBe(doc.included[0]);
    });
});

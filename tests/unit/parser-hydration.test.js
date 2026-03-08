/**
 * Tests for JSON:API parser hydration layer
 */

import { describe, it, expect } from 'vitest';
import {
    getIncludedResources,
    buildResourceIndex,
    hydrateResource,
    hydrateDocumentData,
    parseItemData,
    parseCollectionData
} from '../../src/dataParser.js';

describe('JSON:API Parser Hydration', () => {
    describe('getIncludedResources()', () => {
        it('should extract included resources from standard JSON:API document', () => {
            const doc = {
                data: { id: '1', type: 'posts' },
                included: [
                    { id: '10', type: 'users', attributes: { name: 'Alice' } },
                    { id: '20', type: 'companies', attributes: { name: 'Acme' } }
                ]
            };

            const included = getIncludedResources(doc);
            expect(included).toHaveLength(2);
            expect(included[0].id).toBe('10');
            expect(included[1].id).toBe('20');
        });

        it('should support legacy includes field', () => {
            const doc = {
                data: { id: '1', type: 'posts' },
                includes: [
                    { id: '10', type: 'users', attributes: { name: 'Alice' } }
                ]
            };

            const included = getIncludedResources(doc);
            expect(included).toHaveLength(1);
            expect(included[0].id).toBe('10');
        });

        it('should prefer included over includes', () => {
            const doc = {
                data: { id: '1', type: 'posts' },
                included: [{ id: '10', type: 'users' }],
                includes: [{ id: '20', type: 'users' }]
            };

            const included = getIncludedResources(doc);
            expect(included).toHaveLength(1);
            expect(included[0].id).toBe('10');
        });

        it('should return empty array for documents without included', () => {
            const doc = { data: { id: '1', type: 'posts' } };
            expect(getIncludedResources(doc)).toEqual([]);
        });
    });

    describe('buildResourceIndex()', () => {
        it('should build index from primary data and included', () => {
            const doc = {
                data: { id: '1', type: 'posts', attributes: { title: 'Post' } },
                included: [
                    { id: '10', type: 'users', attributes: { name: 'Alice' } }
                ]
            };

            const index = buildResourceIndex(doc);
            expect(index.get('posts/1')).toBeDefined();
            expect(index.get('users/10')).toBeDefined();
            expect(index.get('posts/1').attributes.title).toBe('Post');
        });

        it('should handle array primary data', () => {
            const doc = {
                data: [
                    { id: '1', type: 'posts' },
                    { id: '2', type: 'posts' }
                ],
                included: [{ id: '10', type: 'users' }]
            };

            const index = buildResourceIndex(doc);
            expect(index.get('posts/1')).toBeDefined();
            expect(index.get('posts/2')).toBeDefined();
            expect(index.get('users/10')).toBeDefined();
        });
    });

    describe('hydrateResource()', () => {
        it('should hydrate to-one relationships', () => {
            const resource = {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' },
                relationships: {
                    author: {
                        data: { id: '10', type: 'users' }
                    }
                }
            };

            const index = new Map();
            index.set('users/10', {
                id: '10',
                type: 'users',
                attributes: { name: 'Alice' }
            });

            hydrateResource(resource, index);

            expect(resource.relationships.author).toBeDefined();
            expect(resource.relationships.author.id).toBe('10');
            expect(resource.relationships.author.attributes.name).toBe('Alice');
        });

        it('should hydrate to-many relationships', () => {
            const resource = {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' },
                relationships: {
                    tags: {
                        data: [
                            { id: '1', type: 'tags' },
                            { id: '2', type: 'tags' }
                        ]
                    }
                }
            };

            const index = new Map();
            index.set('tags/1', { id: '1', type: 'tags', attributes: { name: 'tech' } });
            index.set('tags/2', { id: '2', type: 'tags', attributes: { name: 'js' } });

            hydrateResource(resource, index);

            expect(Array.isArray(resource.relationships.tags)).toBe(true);
            expect(resource.relationships.tags).toHaveLength(2);
            expect(resource.relationships.tags[0].attributes.name).toBe('tech');
            expect(resource.relationships.tags[1].attributes.name).toBe('js');
        });

        it('should hydrate nested relationships', () => {
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
                    {
                        id: '10',
                        type: 'users',
                        attributes: { name: 'Alice' },
                        relationships: {
                            company: {
                                data: { id: '20', type: 'companies' }
                            }
                        }
                    },
                    {
                        id: '20',
                        type: 'companies',
                        attributes: { name: 'Acme' }
                    }
                ]
            };

            const index = buildResourceIndex(doc);
            const hydrated = hydrateDocumentData(doc);

            expect(hydrated.relationships.author).toBeDefined();
            expect(hydrated.relationships.author.id).toBe('10');
            expect(hydrated.relationships.author.relationships.company).toBeDefined();
            expect(hydrated.relationships.author.relationships.company.id).toBe('20');
            expect(hydrated.relationships.author.relationships.company.attributes.name).toBe('Acme');
        });

        it('should handle null relationships', () => {
            const resource = {
                id: '1',
                type: 'posts',
                relationships: {
                    author: {
                        data: null
                    }
                }
            };

            const index = new Map();
            hydrateResource(resource, index);

            expect(resource.relationships.author).toBeNull();
        });

        it('should prevent infinite recursion with cyclic relationships', () => {
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
                    {
                        id: '10',
                        type: 'users',
                        relationships: {
                            posts: {
                                data: [{ id: '1', type: 'posts' }]
                            }
                        }
                    }
                ]
            };

            const index = buildResourceIndex(doc);
            const hydrated = hydrateDocumentData(doc);

            // Should not cause infinite recursion
            expect(hydrated).toBeDefined();
            expect(hydrated.relationships.author).toBeDefined();
        });
    });

    describe('hydrateDocumentData()', () => {
        it('should hydrate single resource', () => {
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

            expect(hydrated.id).toBe('1');
            expect(hydrated.relationships.author).toBeDefined();
            expect(hydrated.relationships.author.attributes.name).toBe('Alice');
        });

        it('should hydrate collection', () => {
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

            const hydrated = hydrateDocumentData(doc);

            expect(Array.isArray(hydrated)).toBe(true);
            expect(hydrated).toHaveLength(2);
            expect(hydrated[0].relationships.author.attributes.name).toBe('Alice');
            expect(hydrated[1].relationships.author.attributes.name).toBe('Alice');
        });
    });

    describe('parseItemData()', () => {
        it('should parse and hydrate item from JSON:API document', () => {
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
                ],
                links: {
                    self: '/api/posts/1'
                }
            };

            const parsed = parseItemData(doc);

            expect(parsed.id).toBe('1');
            expect(parsed.url).toBeDefined();
            expect(parsed.relationships.author).toBeDefined();
            expect(parsed.relationships.author.attributes.name).toBe('Alice');
        });

        it('should handle already-hydrated resource', () => {
            const resource = {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' },
                relationships: {
                    author: {
                        id: '10',
                        type: 'users',
                        attributes: { name: 'Alice' }
                    }
                }
            };

            const parsed = parseItemData(resource);
            expect(parsed.id).toBe('1');
            expect(parsed.relationships.author.attributes.name).toBe('Alice');
        });
    });

    describe('parseCollectionData()', () => {
        it('should parse and hydrate collection from JSON:API document', () => {
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
                    }
                ],
                included: [
                    { id: '10', type: 'users', attributes: { name: 'Alice' } }
                ]
            };

            const parsed = parseCollectionData(doc);

            expect(Array.isArray(parsed)).toBe(true);
            expect(parsed).toHaveLength(1);
            expect(parsed[0].relationships.author.attributes.name).toBe('Alice');
        });

        it('should wrap single resource in array', () => {
            const doc = {
                data: {
                    id: '1',
                    type: 'posts'
                }
            };

            const parsed = parseCollectionData(doc);
            expect(Array.isArray(parsed)).toBe(true);
            expect(parsed).toHaveLength(1);
        });
    });
});

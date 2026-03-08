import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Item } from '../../src/Item.js';
import { Collection } from '../../src/Collection.js';
import { ItemView } from '../../src/ItemView.js';
import { CollectionView } from '../../src/CollectionView.js';
import { Filtering } from '../../src/Filtering.js';
import { Paging } from '../../src/Paging.js';
import { KViewsHttpError, KViewsParseError, KViewsUrlError } from '../../src/errors.js';
import { flattenDoc, buildDb } from '../../src/dataParser.js';

describe('Refactoring Tests', () => {
    describe('Render Context - No State Mutation', () => {
        it('should not mutate item.attributes when getting render context', () => {
            const item = new Item({ type: 'posts' });
            item.id = '1';
            item.attributes = { title: 'Original Title', content: 'Content' };
            item.relationships = {
                author: {
                    id: '123',
                    type: 'users',
                    attributes: { name: 'John' }
                }
            };

            const originalAttributes = Object.assign({}, item.attributes);
            const renderContext = item.getRenderContext();

            // Modify render context
            renderContext.title = 'Modified Title';
            renderContext.author.name = 'Jane';

            // Original attributes should be unchanged
            expect(item.attributes.title).toBe('Original Title');
            expect(item.attributes).toEqual(originalAttributes);
            expect(item.relationships.author.attributes.name).toBe('John');
        });

        it('should create safe copies of relationships in render context', () => {
            const item = new Item({ type: 'posts' });
            item.id = '1';
            item.attributes = { title: 'Post' };
            item.relationships = {
                tags: [
                    { id: '1', type: 'tags', attributes: { name: 'Tag1' } },
                    { id: '2', type: 'tags', attributes: { name: 'Tag2' } }
                ]
            };

            const renderContext = item.getRenderContext();

            // Modify render context
            renderContext.tags[0].name = 'Modified Tag';

            // Original relationship should be unchanged
            expect(item.relationships.tags[0].attributes.name).toBe('Tag1');
        });
    });

    describe('Parser - No Global State', () => {
        it('should not use global state in flattenDoc', () => {
            const doc1 = {
                data: [
                    { id: '1', type: 'posts', attributes: { title: 'Post 1' } }
                ],
                included: [
                    { id: '1', type: 'users', attributes: { name: 'User 1' } }
                ]
            };

            const doc2 = {
                data: [
                    { id: '2', type: 'posts', attributes: { title: 'Post 2' } }
                ],
                included: [
                    { id: '2', type: 'users', attributes: { name: 'User 2' } }
                ]
            };

            // Call flattenDoc multiple times - should not share state
            const result1 = flattenDoc(doc1);
            const result2 = flattenDoc(doc2);

            // Results should be independent
            expect(result1.length).toBe(2);
            expect(result2.length).toBe(2);
            expect(result1[0].id).toBe('1');
            expect(result2[0].id).toBe('2');
        });

        it('should support both includes and included (JSON:API)', () => {
            const docWithIncludes = {
                data: [{ id: '1', type: 'posts', attributes: { title: 'Post' } }],
                includes: [{ id: '1', type: 'users', attributes: { name: 'User' } }]
            };

            const docWithIncluded = {
                data: [{ id: '1', type: 'posts', attributes: { title: 'Post' } }],
                included: [{ id: '1', type: 'users', attributes: { name: 'User' } }]
            };

            const result1 = flattenDoc(docWithIncludes);
            const result2 = flattenDoc(docWithIncluded);

            expect(result1.length).toBe(2);
            expect(result2.length).toBe(2);
        });
    });

    describe('Destroy/Cleanup Lifecycle', () => {
        it('should clean up Item resources on destroy', () => {
            const item = new Item({ type: 'posts' });
            item.id = '1';
            item.attributes = { title: 'Test' };
            
            // Add a view
            const view = new ItemView({ template: () => '<div>Test</div>' });
            item.bindView(view);

            // Add event listeners
            const handler = vi.fn();
            item.on('load', handler);

            // Destroy
            item.destroy();

            // Check cleanup
            expect(item.views.length).toBe(0);
            expect(Object.keys(item.callbacks).length).toBe(0);
            expect(item.collection).toBeNull();
            expect(item.storage).toBeNull();
            expect(item.url).toBeNull();
            expect(item.attributes).toEqual({});
        });

        it('should clean up Collection resources on destroy', () => {
            const collection = new Collection({ type: 'posts' });
            collection.url = { toString: () => '/api/posts' };
            
            // Add items
            const item1 = new Item({ type: 'posts' });
            const item2 = new Item({ type: 'posts' });
            collection.items = [item1, item2];
            // length is now derived from items array (getter), no need to set it

            // Add view
            const view = new CollectionView({ el: document.createElement('div') });
            collection.view = view;

            // Add event listeners
            const handler = vi.fn();
            collection.on('load', handler);

            // Destroy
            collection.destroy();

            // Check cleanup
            expect(collection.items.length).toBe(0);
            expect(collection.length).toBe(0);
            expect(collection.view).toBeNull();
            expect(Object.keys(collection.callbacks).length).toBe(0);
            expect(collection.storage).toBeNull();
            expect(collection.url).toBeNull();
        });

        it('should clean up ItemView resources on destroy', () => {
            const item = new Item({ type: 'posts' });
            const view = new ItemView({ template: () => '<div>Test</div>' });
            view.item = item;
            view.el = document.createElement('div');
            
            // Add callbacks
            const handler = vi.fn();
            view.on('afterrender', handler);

            // Destroy
            view.destroy();

            // Check cleanup
            expect(view.item).toBeNull();
            expect(view.el).toBeNull();
            expect(Object.keys(view.callbacks).length).toBe(0);
            expect(view.template).toBeNull();
        });

        it('should clean up Filtering resources on destroy', () => {
            const collection = new Collection({ type: 'posts' });
            const form = document.createElement('form');
            form.innerHTML = '<input name="filter" />';
            
            const filtering = new Filtering(form, collection);

            // Destroy
            filtering.destroy();

            // Check cleanup
            expect(filtering.collection).toBeNull();
            expect(filtering.el).toBeNull();
        });
    });

    describe('Error Classes', () => {
        it('should create KViewsHttpError with proper properties', () => {
            const error = new KViewsHttpError('Test error', {
                status: 404,
                statusText: 'Not Found',
                responseText: 'Not found',
                responseJSON: { error: 'Not found' },
                jqXHR: { status: 404 },
                textStatus: 'error'
            });

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(KViewsHttpError);
            expect(error.message).toBe('Test error');
            expect(error.status).toBe(404);
            expect(error.statusText).toBe('Not Found');
            expect(error.jqXHR).toBeDefined();
            expect(error.textStatus).toBe('error');
        });

        it('should create KViewsParseError', () => {
            const error = new KViewsParseError('Parse error', {
                rawData: { invalid: 'data' },
                parseStep: 'relationships'
            });

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(KViewsParseError);
            expect(error.message).toBe('Parse error');
            expect(error.rawData).toBeDefined();
            expect(error.parseStep).toBe('relationships');
        });

        it('should create KViewsUrlError', () => {
            const error = new KViewsUrlError('URL error', {
                url: '/invalid/url'
            });

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(KViewsUrlError);
            expect(error.message).toBe('URL error');
            expect(error.url).toBe('/invalid/url');
        });
    });

    describe('API Standardization', () => {
        it('should have loadFromRemote as canonical method', () => {
            const collection = new Collection({ type: 'posts' });
            expect(typeof collection.loadFromRemote).toBe('function');
            // Note: reload and refresh are defined but may not be accessible until after loadFromRemote is called
            // They are deprecated aliases that call loadFromRemote
        });

        it('should have append as canonical method for adding items', () => {
            const collection = new Collection({ type: 'posts' });
            expect(typeof collection.append).toBe('function');
            expect(typeof collection.createItem).toBe('function'); // deprecated alias
            expect(typeof collection.newItem).toBe('function'); // deprecated alias
        });
    });
});

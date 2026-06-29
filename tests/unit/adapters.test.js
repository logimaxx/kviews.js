import { describe, it, expect } from 'vitest';
import { JsonApiAdapter } from '../../src/adapters/JsonApiAdapter.js';
import { PlainRestAdapter } from '../../src/adapters/PlainRestAdapter.js';
import { resolveAdapter, registerAdapter, setDefaultAdapter, getDefaultAdapter } from '../../src/adapters/resolveAdapter.js';
import { Collection } from '../../src/Collection.js';
import { Item } from '../../src/Item.js';

describe('JsonApiAdapter', () => {
    const adapter = new JsonApiAdapter();

    it('identifies single-item vs collection responses', () => {
        expect(adapter.isSingleItemResponse({ data: { id: '1', type: 'posts' } })).toBe(true);
        expect(adapter.isSingleItemResponse({ data: [{ id: '1', type: 'posts' }] })).toBe(false);
        expect(adapter.isSingleItemResponse({ items: [] })).toBe(false);
    });

    it('parses collection response with metadata', () => {
        const doc = {
            data: [
                { id: '1', type: 'posts', attributes: { title: 'Hello' } },
            ],
            meta: { totalRecords: 42, offset: 10 },
        };

        const { items, meta } = adapter.parseCollectionResponse(doc);

        expect(items).toHaveLength(1);
        expect(items[0].attributes.title).toBe('Hello');
        expect(meta.totalRecords).toBe(42);
        expect(meta.offset).toBe(10);
    });

    it('parses single item response', () => {
        const doc = {
            data: { id: '1', type: 'posts', attributes: { title: 'Hello' } },
        };

        const item = adapter.parseItemResponse(doc);
        expect(item.id).toBe('1');
        expect(item.attributes.title).toBe('Hello');
    });

    it('serializes create and update payloads', () => {
        const create = adapter.serializeForCreate({ title: 'New' }, { type: 'posts' });
        const createBody = JSON.parse(create.body);
        expect(create.contentType).toBe('application/vnd.api+json');
        expect(createBody.data.attributes.title).toBe('New');
        expect(createBody.type).toBe('posts');

        const update = adapter.serializeForUpdate({
            id: '1',
            type: 'posts',
            attributes: { title: 'Updated' },
            relationships: {},
        });
        const updateBody = JSON.parse(update.body);
        expect(updateBody.data.attributes.title).toBe('Updated');
    });

    it('serializes relationships for PATCH', () => {
        expect(adapter.serializeRelationship(null)).toEqual({ data: null });
        expect(adapter.serializeRelationship({ id: '2', type: 'authors' })).toEqual({
            data: { id: '2', type: 'authors' },
        });
        expect(adapter.serializeRelationship([
            { id: '1', type: 'tags' },
            { id: '2', type: 'tags' },
        ])).toEqual({
            data: [
                { id: '1', type: 'tags' },
                { id: '2', type: 'tags' },
            ],
        });
    });

    it('rejects collection document when loading as item', () => {
        expect(() => adapter.validateItemRemoteDoc({ data: [] })).toThrow(/collection/);
    });

    it('extracts pageSize and offset from JSON:API list query params in URL', () => {
        const url = {
            parameters: {
                'page[posts][limit]': '500',
                'page[posts][offset]': '20',
            },
        };

        expect(adapter.extractListQueryFromUrl(url, { type: 'posts' })).toEqual({
            pageSize: '500',
            offset: '20',
        });
    });
});

describe('PlainRestAdapter', () => {
    const adapter = new PlainRestAdapter();

    it('identifies single-item vs collection responses', () => {
        expect(adapter.isSingleItemResponse({ id: 1, title: 'Hello' })).toBe(true);
        expect(adapter.isSingleItemResponse({ data: { id: 1, title: 'Hello' } })).toBe(true);
        expect(adapter.isSingleItemResponse([{ id: 1 }])).toBe(false);
        expect(adapter.isSingleItemResponse({ data: [{ id: 1 }] })).toBe(false);
        expect(adapter.isSingleItemResponse({ items: [{ id: 1 }], total: 1 })).toBe(false);
    });

    it('parses root array collection responses', () => {
        const doc = [
            { id: 1, title: 'One' },
            { id: 2, title: 'Two' },
        ];

        const { items, meta } = adapter.parseCollectionResponse(doc, { type: 'posts' });

        expect(items).toHaveLength(2);
        expect(items[0].id).toBe('1');
        expect(items[0].attributes.title).toBe('One');
        expect(items[0].type).toBe('posts');
        expect(meta).toEqual({});
    });

    it('parses wrapped collection responses with metadata', () => {
        const doc = {
            data: [
                { id: 1, title: 'One', author: { id: 9, name: 'Ada' } },
            ],
            total: 50,
            offset: 20,
        };

        const { items, meta } = adapter.parseCollectionResponse(doc, { type: 'posts' });

        expect(items).toHaveLength(1);
        expect(items[0].relationships.author.id).toBe('9');
        expect(items[0].relationships.author.attributes.name).toBe('Ada');
        expect(meta.totalRecords).toBe(50);
        expect(meta.offset).toBe(20);
    });

    it('parses single flat item responses', () => {
        const item = adapter.parseItemResponse(
            { id: 3, title: 'Detail', author: { id: 9, name: 'Ada' } },
            { type: 'posts' }
        );

        expect(item.id).toBe('3');
        expect(item.attributes.title).toBe('Detail');
        expect(item.relationships.author.attributes.name).toBe('Ada');
    });

    it('serializes create and update payloads as flat JSON', () => {
        const create = adapter.serializeForCreate({ title: 'New' }, { type: 'posts' });
        expect(create.contentType).toBe('application/json');
        expect(JSON.parse(create.body)).toEqual({ title: 'New', type: 'posts' });

        const update = adapter.serializeForUpdate({
            id: '1',
            type: 'posts',
            attributes: { title: 'Updated' },
            relationships: {
                author: { id: '9', type: 'authors' },
            },
        });

        expect(JSON.parse(update.body)).toEqual({
            id: '1',
            type: 'posts',
            title: 'Updated',
            author: { id: '9', type: 'authors' },
        });
    });

    it('uses offset/limit query params by default', () => {
        const plain = new PlainRestAdapter();
        const url = { parameters: {} };

        plain.applyListQuery(url, { offset: 20, pageSize: 10 });

        expect(url.parameters).toEqual({ offset: 20, limit: 10 });
    });

    it('supports page-based pagination style', () => {
        const plain = new PlainRestAdapter({ paginationStyle: 'page' });
        const url = { parameters: {} };

        plain.applyListQuery(url, { offset: 20, pageSize: 10 });

        expect(url.parameters).toEqual({ page: 3, limit: 10 });
    });

    it('extracts pageSize and offset from plain REST list query params in URL', () => {
        const plain = new PlainRestAdapter();
        const url = { parameters: { limit: '500', offset: '40' } };

        expect(plain.extractListQueryFromUrl(url)).toEqual({
            pageSize: '500',
            offset: '40',
        });
    });

    it('extracts offset from page number when using page-based pagination', () => {
        const plain = new PlainRestAdapter({ paginationStyle: 'page' });
        const url = { parameters: { page: '3', limit: '10' } };

        expect(plain.extractListQueryFromUrl(url)).toEqual({
            pageSize: '10',
            offset: 20,
        });
    });

    it('supports custom itemsPath and itemPath', () => {
        const plain = new PlainRestAdapter({
            itemsPath: 'results.items',
            itemPath: 'result',
            totalPath: 'results.total',
        });

        const collectionDoc = {
            results: {
                items: [{ id: 1, name: 'A' }],
                total: 1,
            },
        };

        expect(plain.parseCollectionResponse(collectionDoc).items[0].attributes.name).toBe('A');
        expect(plain.parseItemResponse({ result: { id: 2, name: 'B' } }).attributes.name).toBe('B');
    });
});

describe('resolveAdapter', () => {
    it('resolves built-in jsonapi adapter by name', () => {
        const adapter = resolveAdapter('jsonapi');
        expect(adapter.name).toBe('jsonapi');
    });

    it('returns custom adapter instances as-is', () => {
        const custom = { name: 'custom' };
        expect(resolveAdapter(custom)).toBe(custom);
    });

    it('uses global default when adapter is omitted', () => {
        setDefaultAdapter('jsonapi');
        expect(resolveAdapter().name).toBe('jsonapi');
        expect(getDefaultAdapter()).toBe('jsonapi');
    });

    it('resolves built-in plain adapter by name', () => {
        const adapter = resolveAdapter('plain');
        expect(adapter.name).toBe('plain');
    });

    it('supports registering custom adapters', () => {
        const custom = { name: 'custom-test' };
        registerAdapter('custom-test', custom);
        expect(resolveAdapter('custom-test')).toBe(custom);
    });

    it('throws for unknown adapter names', () => {
        expect(() => resolveAdapter('unknown-format')).toThrow(/Unknown data adapter/);
    });
});

describe('Collection/Item adapter wiring', () => {
    it('defaults to jsonapi adapter on Collection', () => {
        const collection = new Collection({ type: 'posts', dontload: true });
        expect(collection.adapter.name).toBe('jsonapi');
    });

    it('inherits adapter from collection on Item', () => {
        const collection = new Collection({ type: 'posts', dontload: true });
        const item = new Item({ collection });
        expect(item.adapter).toBe(collection.adapter);
    });

    it('uses plain adapter when configured on Collection', () => {
        const collection = new Collection({ type: 'posts', adapter: 'plain', dontload: true });
        expect(collection.adapter.name).toBe('plain');
    });

    it('loadFromRemoteDoc works with plain adapter', () => {
        const item = new Item({ type: 'posts', adapter: 'plain' });
        item.loadFromRemoteDoc({ id: 1, title: 'Plain item' });
        expect(item.id).toBe('1');
        expect(item.attributes.title).toBe('Plain item');
    });

    it('reads pageSize from JSON:API URL when not provided in options', () => {
        const collection = new Collection({
            type: 'config_document_types',
            url: '/config_document_types?sort=type&page[config_document_types][limit]=500',
            dontload: true,
        });

        expect(collection.pageSize).toBe('500');
    });

    it('prefers explicit pageSize option over URL param', () => {
        const collection = new Collection({
            type: 'config_document_types',
            url: '/config_document_types?page[config_document_types][limit]=500',
            pageSize: 100,
            dontload: true,
        });

        expect(collection.pageSize).toBe(100);
    });

    it('reads pageSize from plain REST limit param in URL', () => {
        const collection = new Collection({
            type: 'posts',
            adapter: 'plain',
            url: '/api/posts?limit=250',
            dontload: true,
        });

        expect(collection.pageSize).toBe('250');
    });
});

import { describe, it, expect } from 'vitest';
import { deepEqual } from '../../src/utils.js';
import { Item } from '../../src/Item.js';

describe('deepEqual', () => {
    it('compares nested objects and arrays', () => {
        expect(deepEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] })).toBe(true);
        expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
        expect(deepEqual([1, { x: 2 }], [1, { x: 2 }])).toBe(true);
    });
});

describe('Item._remoteDataEquals()', () => {
    it('treats unloaded items as changed', () => {
        const item = new Item({ type: 'posts', dontload: true });
        expect(item._remoteDataEquals({
            id: '1',
            type: 'posts',
            attributes: { title: 'Hello' },
            relationships: {},
        })).toBe(false);
    });

    it('detects unchanged loaded data', () => {
        const item = new Item({ type: 'posts', dontload: true });
        item.loadFromData({
            id: '1',
            type: 'posts',
            attributes: { title: 'Hello' },
        });

        expect(item._remoteDataEquals({
            id: '1',
            type: 'posts',
            attributes: { title: 'Hello' },
            relationships: {},
        })).toBe(true);
    });

    it('detects attribute changes', () => {
        const item = new Item({ type: 'posts', dontload: true });
        item.loadFromData({
            id: '1',
            type: 'posts',
            attributes: { title: 'Hello' },
        });

        expect(item._remoteDataEquals({
            id: '1',
            type: 'posts',
            attributes: { title: 'Updated' },
            relationships: {},
        })).toBe(false);
    });

    it('compares hydrated relationship objects', () => {
        const item = new Item({ type: 'posts', dontload: true });
        item.loadFromData({
            id: '1',
            type: 'posts',
            attributes: { title: 'Hello' },
            relationships: {
                author: {
                    id: '10',
                    type: 'users',
                    attributes: { name: 'Alice' },
                },
            },
        });

        expect(item._remoteDataEquals({
            id: '1',
            type: 'posts',
            attributes: { title: 'Hello' },
            relationships: {
                author: {
                    id: '10',
                    type: 'users',
                    attributes: { name: 'Alice' },
                },
            },
        })).toBe(true);
    });
});

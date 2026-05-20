import { describe, it, expect, vi } from 'vitest';
import { Collection } from '../../src/Collection.js';
import { Item } from '../../src/Item.js';

describe('Plain REST collection integration', () => {
    it('loads wrapped plain REST collection responses', async () => {
        const collection = new Collection({
            type: 'posts',
            adapter: 'plain',
            url: '/api/posts',
        });

        collection.storage = {
            read: vi.fn().mockResolvedValue({
                data: {
                    data: [
                        { id: 1, title: 'Post 1' },
                        { id: 2, title: 'Post 2' },
                    ],
                    total: 2,
                    offset: 0,
                },
            }),
        };

        collection.url = {
            toString: () => '/api/posts',
            parameters: {},
        };

        collection.view = {
            reset: vi.fn(),
            render: vi.fn(),
        };

        await collection.loadFromRemote();

        expect(collection.items).toHaveLength(2);
        expect(collection.items[0].attributes.title).toBe('Post 1');
        expect(collection.total).toBe(2);
    });

    it('inserts a single item using plain JSON payloads', async () => {
        const collection = new Collection({
            type: 'posts',
            adapter: 'plain',
            url: '/api/posts',
        });

        collection.storage = {
            create: vi.fn().mockResolvedValue({
                data: { id: 3, title: 'Created' },
            }),
        };

        collection.insertUrl = { toString: () => '/api/posts' };
        collection.view = {
            reset: vi.fn(),
            render: vi.fn(),
        };

        collection.loadItem = vi.fn((data) => {
            const item = new Item({ type: 'posts', adapter: collection.adapter });
            item.loadFromData(data);
            item.render = vi.fn();
            collection.items.push(item);
            return item;
        });

        const created = await collection.insert({ title: 'Created' });

        expect(collection.storage.create).toHaveBeenCalledWith(
            collection,
            '/api/posts',
            { contentType: 'application/json' },
            JSON.stringify({ title: 'Created', type: 'posts' })
        );
        expect(created.attributes.title).toBe('Created');
    });
});

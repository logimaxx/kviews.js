import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Item } from '../../src/Item.js';
import * as utils from '../../src/utils.js';

describe('Item.loadFromRemote()', () => {
    let renderSpy;

    beforeEach(() => {
        renderSpy = vi.spyOn(Item.prototype, 'render').mockImplementation(function () {
            return this;
        });
    });

    afterEach(() => {
        renderSpy.mockRestore();
    });

    function createLoadedItem(initialDoc) {
        const item = new Item({
            url: '/api/posts/1',
            type: 'posts',
            dontload: true,
        });

        item.loadFromRemoteDoc(initialDoc);
        renderSpy.mockClear();
        return item;
    }

    function mockRead(item, responseDoc) {
        item.storage = {
            read: vi.fn().mockResolvedValue({ data: responseDoc }),
        };
    }

    it('renders on first remote load', async () => {
        const item = new Item({
            url: '/api/posts/1',
            type: 'posts',
            dontload: true,
        });

        mockRead(item, {
            data: {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' },
            },
        });

        await item.loadFromRemote();

        expect(renderSpy).toHaveBeenCalledTimes(1);
        expect(item.attributes.title).toBe('Hello');
    });

    it('skips render when remote data is unchanged', async () => {
        const doc = {
            data: {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' },
            },
        };

        const item = createLoadedItem(doc);
        mockRead(item, doc);

        await item.loadFromRemote();

        expect(renderSpy).not.toHaveBeenCalled();
        expect(item.attributes.title).toBe('Hello');
    });

    it('renders when remote data changes', async () => {
        const item = createLoadedItem({
            data: {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' },
            },
        });

        mockRead(item, {
            data: {
                id: '1',
                type: 'posts',
                attributes: { title: 'Updated' },
            },
        });

        await item.loadFromRemote();

        expect(renderSpy).toHaveBeenCalledTimes(1);
        expect(item.attributes.title).toBe('Updated');
    });

    it('still fires load event when remote data is unchanged', async () => {
        const doc = {
            data: {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' },
            },
        };

        const item = createLoadedItem(doc);
        mockRead(item, doc);

        const loadHandler = vi.fn();
        item.on('load', loadHandler);

        await item.loadFromRemote();

        expect(loadHandler).toHaveBeenCalledTimes(1);
        expect(renderSpy).not.toHaveBeenCalled();
    });

    it('does not show loader overlay when showLoader is false', async () => {
        const createOverlaySpy = vi.spyOn(utils, 'createOverlay');

        const item = new Item({
            url: '/api/posts/1',
            type: 'posts',
            dontload: true,
            showLoader: false,
        });

        mockRead(item, {
            data: {
                id: '1',
                type: 'posts',
                attributes: { title: 'Hello' },
            },
        });

        await item.loadFromRemote();

        expect(createOverlaySpy).not.toHaveBeenCalled();
        createOverlaySpy.mockRestore();
    });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Storage } from '../../src/Storage.js';
import { apiBaseConfig } from '../../src/apiBase.js';

describe('Storage', () => {
    let storage;
    let mockFetch;

    beforeEach(() => {
        storage = new Storage();
        mockFetch = vi.fn();
        global.fetch = mockFetch;
        apiBaseConfig.defaultHeaders = {};
    });

    describe('read', () => {
        it('should perform GET request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                text: () => Promise.resolve('{"data": {"id": "1", "type": "posts"}}')
            });

            const result = await storage.read({}, '/api/posts/1', {});

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/posts/1',
                expect.objectContaining({
                    method: 'GET'
                })
            );
            expect(result.data).toBeDefined();
        });

        it('should handle error response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                headers: new Headers(),
                text: () => Promise.resolve('{"error": "Not found"}')
            });

            await expect(storage.read({}, '/api/posts/999', {})).rejects.toThrow();
        });
    });

    describe('create', () => {
        it('should perform POST request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                statusText: 'Created',
                headers: new Headers(),
                text: () => Promise.resolve('{"data": {"id": "2", "type": "posts"}}')
            });

            const data = JSON.stringify({ data: { type: 'posts', attributes: { title: 'New Post' } } });
            await storage.create({}, '/api/posts', {}, data);

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/posts',
                expect.objectContaining({
                    method: 'POST',
                    body: data
                })
            );
        });
    });

    describe('update', () => {
        it('should perform PATCH request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                text: () => Promise.resolve('{"data": {"id": "1", "type": "posts"}}')
            });

            const data = JSON.stringify({ data: { id: '1', attributes: { title: 'Updated' } } });
            await storage.update({}, '/api/posts/1', {}, data);

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/posts/1',
                expect.objectContaining({
                    method: 'PATCH',
                    body: data
                })
            );
        });
    });

    describe('delete', () => {
        it('should perform DELETE request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
                statusText: 'No Content',
                headers: new Headers(),
                text: () => Promise.resolve('')
            });

            await storage.delete({}, '/api/posts/1', {});

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/posts/1',
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
        });
    });

    describe('baseUrl / basePath handling', () => {
        it('should prepend baseUrl if set', async () => {
            const { KViews } = await import('../../src/KViews.js');
            KViews.baseUrl = 'https://api.example.com';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                text: () => Promise.resolve('{}')
            });

            await storage.read({}, '/api/posts', {});

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.example.com/api/posts',
                expect.any(Object)
            );

            KViews.baseUrl = null;
        });

        it('should prepend basePath when baseUrl is unset', async () => {
            const { KViews } = await import('../../src/KViews.js');
            KViews.basePath = '/api/v2';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                text: () => Promise.resolve('{}')
            });

            await storage.read({}, '/users', {});

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/v2/users',
                expect.any(Object)
            );

            KViews.basePath = null;
        });

        it('should prefer baseUrl over basePath when both set', async () => {
            const { KViews } = await import('../../src/KViews.js');
            KViews.baseUrl = 'https://a.example.com';
            KViews.basePath = '/ignored';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                text: () => Promise.resolve('{}')
            });

            await storage.read({}, 'x', {});

            expect(mockFetch).toHaveBeenCalledWith(
                'https://a.example.com/x',
                expect.any(Object)
            );

            KViews.baseUrl = null;
            KViews.basePath = null;
        });

        it('merges constructor headers with per-request headers', async () => {
            const s = new Storage({
                headers: { Authorization: 'Bearer a', 'X-App': '1' }
            });
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                text: () => Promise.resolve('{}')
            });

            await s.read({}, '/api/x', { headers: { Authorization: 'Bearer b' } });

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/x',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer b',
                        'X-App': '1'
                    })
                })
            );
        });

        it('merges global defaultHeaders, Storage defaults, and per-request headers', async () => {
            apiBaseConfig.defaultHeaders = {
                Authorization: 'Bearer global',
                'X-Global': '1'
            };
            const s = new Storage({
                headers: { Authorization: 'Bearer instance', 'X-App': '2' }
            });
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                text: () => Promise.resolve('{}')
            });

            await s.read({}, '/api/x', { headers: { 'X-Request': '3' } });

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/x',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer instance',
                        'X-Global': '1',
                        'X-App': '2',
                        'X-Request': '3'
                    })
                })
            );
        });

        it('should not prepend for absolute http(s) URLs', async () => {
            const { KViews } = await import('../../src/KViews.js');
            KViews.baseUrl = 'https://api.example.com';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: new Headers(),
                text: () => Promise.resolve('{}')
            });

            await storage.read({}, 'https://other.example.com/z', {});

            expect(mockFetch).toHaveBeenCalledWith(
                'https://other.example.com/z',
                expect.any(Object)
            );

            KViews.baseUrl = null;
        });
    });
});

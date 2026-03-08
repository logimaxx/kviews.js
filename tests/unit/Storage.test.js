import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Storage } from '../../src/Storage.js';

describe('Storage', () => {
    let storage;
    let mockFetch;

    beforeEach(() => {
        storage = new Storage();
        mockFetch = vi.fn();
        global.fetch = mockFetch;
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

    describe('baseUrl handling', () => {
        it('should prepend baseUrl if set', async () => {
            // Import KViews to set baseUrl
            const { KViews } = await import('../../src/KViews.js');
            KViews.baseUrl = 'https://api.example.com';
            global.KViews = KViews; // Make it available globally

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
            
            // Cleanup
            KViews.baseUrl = null;
            delete global.KViews;
        });
    });
});

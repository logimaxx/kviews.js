import { describe, it, expect, beforeEach } from 'vitest';
import { apiBaseConfig, resolveRequestUrl } from '../../src/apiBase.js';

describe('apiBase', () => {
    beforeEach(() => {
        apiBaseConfig.baseUrl = null;
        apiBaseConfig.basePath = null;
        apiBaseConfig.defaultHeaders = {};
    });

    describe('resolveRequestUrl', () => {
        it('returns url unchanged when no base is set', () => {
            expect(resolveRequestUrl('/a/b')).toBe('/a/b');
        });

        it('normalizes duplicate slashes between base and path', () => {
            apiBaseConfig.baseUrl = 'https://x.com/api/';
            expect(resolveRequestUrl('/posts')).toBe('https://x.com/api/posts');
        });

        it('uses basePath when baseUrl is null', () => {
            apiBaseConfig.basePath = '/v1';
            expect(resolveRequestUrl('items')).toBe('/v1/items');
        });
    });
});

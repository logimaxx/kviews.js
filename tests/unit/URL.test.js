import { describe, it, expect } from 'vitest';
import { URL, createURL } from '../../src/URL.js';

describe('URL', () => {
    describe('Constructor', () => {
        it('should parse simple URL', () => {
            const url = new URL('http://example.com/path');
            expect(url.protocol).toBe('http');
            expect(url.fqdn).toBe('example.com');
            expect(url.path).toBe('/path');
        });

        it('should parse URL with port', () => {
            const url = new URL('http://example.com:8080/path');
            expect(url.port).toBe('8080');
        });

        it('should parse URL with query parameters', () => {
            const url = new URL('http://example.com/path?key=value&foo=bar');
            expect(url.parameters.key).toBe('value');
            expect(url.parameters.foo).toBe('bar');
        });

        it('should parse URL with fragment', () => {
            const url = new URL('http://example.com/path#section');
            expect(url.fragment).toBe('section');
        });

        it('should throw error for non-string input', () => {
            expect(() => new URL(123)).toThrow();
        });
    });

    describe('toString', () => {
        it('should convert URL to string', () => {
            const url = new URL('http://example.com/path?key=value');
            expect(url.toString()).toBe('http://example.com/path?key=value');
        });

        it('should handle URL without protocol', () => {
            const url = new URL('/api/posts?page=1');
            expect(url.toString()).toBe('/api/posts?page=1');
        });

        it('should handle empty parameters', () => {
            const url = new URL('http://example.com/path');
            url.parameters = {};
            expect(url.toString()).toBe('http://example.com/path');
        });
    });

    describe('createURL factory', () => {
        it('should create URL instance', () => {
            const url = createURL('http://example.com/path');
            expect(url).toBeInstanceOf(URL);
            expect(url.fqdn).toBe('example.com');
        });
    });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KViews } from '../../src/KViews.js';

describe('KViews', () => {
    beforeEach(() => {
        // Reset baseUrl before each test
        KViews.baseUrl = null;
    });

    describe('Static Properties', () => {
        it('should have baseUrl property', () => {
            expect(KViews.baseUrl).toBeDefined();
            expect(KViews.baseUrl).toBeNull();
        });

        it('should set baseUrl', () => {
            KViews.baseUrl = 'https://api.example.com';
            expect(KViews.baseUrl).toBe('https://api.example.com');
        });

        it('should have helpers property', () => {
            expect(KViews.helpers).toBeDefined();
            expect(typeof KViews.helpers.fillForm).toBe('function');
            expect(typeof KViews.helpers.captureFormSubmit).toBe('function');
            expect(typeof KViews.helpers.fetchFormData).toBe('function');
        });
    });

    describe('createCollectionInstance', () => {
        it('should return null if no element provided', () => {
            const result = KViews.createCollectionInstance(null, { url: '/api/posts' });
            expect(result).toBeNull();
        });

        it('should create collection instance with valid element', () => {
            const el = document.createElement('div');
            el.innerHTML = '<div class="item">{{attributes.title}}</div>';
            
            const collection = KViews.createCollectionInstance(el, {
                url: '/api/posts',
                type: 'posts',
                dontload: true
            });

            expect(collection).toBeDefined();
            expect(collection.url).toBeDefined();
            expect(collection.type).toBe('posts');
        });

        it('should handle string URL option', () => {
            const el = document.createElement('div');
            const collection = KViews.createCollectionInstance(el, '/api/posts', {
                type: 'posts',
                dontload: true
            });

            expect(collection).toBeDefined();
            expect(collection.url.toString()).toContain('/api/posts');
        });

        it('should update existing instance if element already has one', () => {
            const el = document.createElement('div');
            
            const collection1 = KViews.createCollectionInstance(el, {
                url: '/api/posts',
                type: 'posts',
                dontload: true
            });

            const collection2 = KViews.createCollectionInstance(el, {
                url: '/api/posts',
                type: 'posts',
                dontload: true
            });

            expect(collection1).toBe(collection2);
        });
    });

    describe('createItemInstance', () => {
        it('should return null if no element provided', () => {
            const result = KViews.createItemInstance(null, { url: '/api/posts/1' });
            expect(result).toBeNull();
        });

        it('should create item instance with valid element', () => {
            const el = document.createElement('div');
            el.innerHTML = '<h1>{{attributes.title}}</h1>';
            
            const item = KViews.createItemInstance(el, {
                url: '/api/posts/1',
                type: 'posts',
                dontload: true
            });

            expect(item).toBeDefined();
            expect(item.url).toBeDefined();
            expect(item.type).toBe('posts');
        });

        it('should create item instance with initial data', () => {
            const el = document.createElement('div');
            el.innerHTML = '<h1>{{attributes.title}}</h1>';
            
            const item = KViews.createItemInstance(el, {
                url: '/api/posts/1',
                type: 'posts',
                dontload: true
            }, {
                id: '1',
                type: 'posts',
                attributes: {
                    title: 'Test Post'
                }
            });

            expect(item).toBeDefined();
            expect(item.id).toBe('1');
            expect(item.attributes.title).toBe('Test Post');
        });
    });
});

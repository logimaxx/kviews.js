import { describe, it, expect, beforeEach } from 'vitest';
import { utilities } from '../../src/utilities.js';

describe('Utilities', () => {
    describe('fetchFormData', () => {
        it('should extract form data', () => {
            const form = document.createElement('form');
            form.innerHTML = `
                <input name="title" value="Test Title">
                <input name="content" value="Test Content">
                <input type="checkbox" name="active" checked value="1">
            `;

            const data = utilities.fetchFormData(form);

            expect(data.title).toBe('Test Title');
            expect(data.content).toBe('Test Content');
            expect(data.active).toBe('1');
        });

        it('should handle array notation', () => {
            const form = document.createElement('form');
            form.innerHTML = `
                <input name="tags[]" value="tag1">
                <input name="tags[]" value="tag2">
                <input name="tags[]" value="tag3">
            `;

            const data = utilities.fetchFormData(form);

            expect(Array.isArray(data.tags)).toBe(true);
            expect(data.tags).toHaveLength(3);
            expect(data.tags).toContain('tag1');
            expect(data.tags).toContain('tag2');
            expect(data.tags).toContain('tag3');
        });

        it('should ignore unchecked checkboxes', () => {
            const form = document.createElement('form');
            form.innerHTML = `
                <input type="checkbox" name="checked" checked value="yes">
                <input type="checkbox" name="unchecked" value="no">
            `;

            const data = utilities.fetchFormData(form);

            expect(data.checked).toBe('yes');
            expect(data.unchecked).toBeUndefined();
        });

        it('should handle empty form', () => {
            const form = document.createElement('form');
            const data = utilities.fetchFormData(form);
            expect(data).toEqual({});
        });
    });

    describe('extractFormData', () => {
        it('should be alias for fetchFormData', () => {
            const form = document.createElement('form');
            form.innerHTML = '<input name="test" value="value">';

            const data1 = utilities.fetchFormData(form);
            const data2 = utilities.extractFormData(form);

            expect(data1).toEqual(data2);
        });
    });

    describe('fillForm', () => {
        it('should fill form with item attributes', () => {
            const form = document.createElement('form');
            form.innerHTML = `
                <input name="title">
                <input name="content">
            `;

            const item = {
                attributes: {
                    title: 'Test Title',
                    content: 'Test Content'
                }
            };

            utilities.fillForm(form, item);

            expect(form.elements.title.value).toBe('Test Title');
            expect(form.elements.content.value).toBe('Test Content');
        });

        it('should handle relationships', () => {
            const form = document.createElement('form');
            form.innerHTML = '<select name="author"></select>';

            const item = {
                attributes: {},
                relationships: {
                    author: {
                        id: '123',
                        attributes: { name: 'John Doe' }
                    }
                }
            };

            utilities.fillForm(form, item);

            expect(form.elements.author.value).toBe('123');
        });
    });
});

/**
 * Test setup file
 * Configures global test environment
 */

import { vi } from 'vitest';

// Mock Handlebars globally
global.Handlebars = {
    compile: vi.fn((template) => {
        return (data) => {
            // Simple template replacement for testing
            let result = template;
            if (data && typeof data === 'object') {
                // Handle nested attributes
                if (data.attributes) {
                    Object.keys(data.attributes).forEach(key => {
                        result = result.replace(
                            new RegExp(`\\{\\{attributes\\.${key}\\}\\}`, 'g'),
                            data.attributes[key]
                        );
                    });
                }
                // Handle id
                if (data.id) {
                    result = result.replace(/\{\{id\}\}/g, data.id);
                }
                // Handle relationships
                if (data.relationships) {
                    Object.keys(data.relationships).forEach(key => {
                        const rel = data.relationships[key];
                        if (rel && rel.attributes) {
                            Object.keys(rel.attributes).forEach(attrKey => {
                                result = result.replace(
                                    new RegExp(`\\{\\{relationships\\.${key}\\.attributes\\.${attrKey}\\}\\}`, 'g'),
                                    rel.attributes[attrKey]
                                );
                            });
                        }
                    });
                }
            }
            return result;
        };
    })
};

// Mock window.KViews for bundle tests
global.window = global.window || {};
global.window.KViews = null; // Will be set in tests that need it

// Mock fetch globally (can be overridden in tests)
global.fetch = global.fetch || vi.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve({ data: [] }),
        text: () => Promise.resolve('{}')
    })
);

// Clean up after each test
afterEach(() => {
    vi.clearAllMocks();
});

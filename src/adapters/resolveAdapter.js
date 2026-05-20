import { JsonApiAdapter } from './JsonApiAdapter.js';
import { PlainRestAdapter } from './PlainRestAdapter.js';

/** @type {Map<string, object>} */
const registry = new Map([
    ['jsonapi', new JsonApiAdapter()],
    ['plain', new PlainRestAdapter()],
]);

/** @type {string|import('./JsonApiAdapter.js').JsonApiAdapter} */
let defaultAdapter = 'jsonapi';

/**
 * Register a named data adapter.
 *
 * @param {string} name - Adapter identifier (e.g. 'jsonapi', 'plain')
 * @param {object} adapter - Adapter instance implementing the DataAdapter interface
 */
export function registerAdapter(name, adapter) {
    if (!name || typeof name !== 'string') {
        throw new Error('Adapter name must be a non-empty string');
    }
    registry.set(name, adapter);
}

/**
 * Set the global default adapter used when none is specified on Collection/Item.
 *
 * @param {string|object} adapter - Adapter name or instance
 */
export function setDefaultAdapter(adapter) {
    defaultAdapter = adapter;
}

/**
 * Get the global default adapter name or instance.
 *
 * @returns {string|object}
 */
export function getDefaultAdapter() {
    return defaultAdapter;
}

/**
 * Resolve an adapter from a name, instance, or undefined (falls back to default).
 *
 * @param {string|object|undefined} adapter - Adapter name, instance, or omitted
 * @returns {object} Adapter instance
 */
export function resolveAdapter(adapter) {
    if (adapter && typeof adapter === 'object') {
        return adapter;
    }

    const name = typeof adapter === 'string' ? adapter : defaultAdapter;

    if (typeof name === 'object') {
        return name;
    }

    const resolved = registry.get(name);
    if (!resolved) {
        throw new Error(`Unknown data adapter: ${name}`);
    }

    return resolved;
}

export { JsonApiAdapter, PlainRestAdapter };

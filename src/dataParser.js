import { deepmerge } from './utils.js';
import { createURL } from './URL.js';
import { KViewsParseError } from './errors.js';

/**
 * JSON:API Document Parser and Hydration Layer
 * 
 * Purpose: Parse JSON:API documents and hydrate relationship references
 * by replacing {type, id} references with actual resource objects from
 * the same document's included resources.
 * 
 * Flow:
 * 1. Extract included resources from document (supports both 'included' and legacy 'includes')
 * 2. Build resource index (type/id -> resource object)
 * 3. Hydrate primary data by replacing relationship references with actual objects
 * 4. Return hydrated resources ready for Collection/Item loading
 */

/**
 * Get included resources from JSON:API document
 * 
 * Supports both standard 'included' and legacy 'includes' fields.
 * Returns array of all included resource objects.
 * 
 * @param {Object} doc - JSON:API document
 * @returns {Array} Array of included resource objects
 */
export function getIncludedResources(doc) {
    if (!doc || typeof doc !== 'object') {
        return [];
    }

    // Support both 'included' (JSON:API standard) and 'includes' (legacy)
    const includedData = doc.hasOwnProperty('included')
        ? doc.included
        : (doc.hasOwnProperty('includes') ? doc.includes : null);

    if (!includedData) {
        return [];
    }

    if (!Array.isArray(includedData)) {
        return [];
    }

    return includedData;
}

/**
 * Build resource index from JSON:API document
 * 
 * Creates a map of type/id -> resource object for fast lookup.
 * Indexes both primary data and included resources.
 * 
 * @param {Object} doc - JSON:API document
 * @returns {Map} Map with keys like "type/id" -> resource object
 */
export function buildResourceIndex(doc) {
    const index = new Map();

    if (!doc || typeof doc !== 'object') {
        return index;
    }

    /**
     * Index a single resource
     */
    function indexResource(resource) {
        if (!resource || typeof resource !== 'object') {
            return;
        }

        if (!resource.type || !resource.id) {
            return;
        }

        const key = `${resource.type}/${resource.id}`;
        if (!index.has(key)) {
            index.set(key, resource);
        }
    }

    // Index primary data
    if (doc.data) {
        if (Array.isArray(doc.data)) {
            doc.data.forEach(indexResource);
        } else if (typeof doc.data === 'object') {
            indexResource(doc.data);
        }
    }

    // Index included resources
    const included = getIncludedResources(doc);
    included.forEach(indexResource);

    return index;
}

/**
 * Get resource from index by type/id reference
 * 
 * @param {Object|string} typeOrRef - Either {type, id} object or type string
 * @param {string} id - ID (if first param is type string)
 * @param {Map} resourceIndex - Resource index
 * @returns {Object|null} Resource object or null if not found
 */
function getResourceFromIndex(typeOrRef, id, resourceIndex) {
    let type, resourceId;

    if (typeof typeOrRef === 'object' && typeOrRef !== null) {
        type = typeOrRef.type;
        resourceId = typeOrRef.id;
    } else {
        type = typeOrRef;
        resourceId = id;
    }

    if (!type || !resourceId) {
        return null;
    }

    const key = `${type}/${resourceId}`;
    return resourceIndex.get(key) || null;
}

/**
 * Hydrate a single resource's relationships recursively
 * 
 * Replaces relationship references {type, id} with actual resource objects
 * from the index. Handles both to-one and to-many relationships.
 * Prevents infinite recursion with visited set.
 * 
 * IMPORTANT: Uses resources directly from index (no cloning) to ensure
 * that multiple references to the same resource share the same object instance.
 * 
 * @param {Object} resource - Resource object to hydrate
 * @param {Map} resourceIndex - Resource index
 * @param {Set} visited - Set of already visited resource keys (for cycle detection)
 * @returns {Object} Hydrated resource (mutates original)
 */
export function hydrateResource(resource, resourceIndex, visited = new Set()) {
    if (!resource || typeof resource !== 'object') {
        return resource;
    }

    // Skip if no relationships
    if (!resource.relationships) {
        return resource;
    }

    // Create key for cycle detection
    const resourceKey = resource.type && resource.id 
        ? `${resource.type}/${resource.id}` 
        : null;

    // Prevent infinite recursion
    if (resourceKey && visited.has(resourceKey)) {
        return resource;
    }

    if (resourceKey) {
        visited.add(resourceKey);
    }

    // Hydrate each relationship
    Object.keys(resource.relationships).forEach(relName => {
        const rel = resource.relationships[relName];

        // Skip null relationships
        if (rel === null) {
            return;
        }

        // Handle relationship data object
        if (rel.data !== undefined) {
            if (rel.data === null) {
                // Null to-one relationship
                resource.relationships[relName] = null;
            } else if (Array.isArray(rel.data)) {
                // To-many relationship: array of {type, id}
                resource.relationships[relName] = rel.data
                    .map(ref => {
                        const hydrated = getResourceFromIndex(ref, null, resourceIndex);
                        if (hydrated) {
                            // Use resource directly from index (no clone)
                            // Recursively hydrate nested relationships
                            return hydrateResource(
                                hydrated, // Use same object instance from index
                                resourceIndex,
                                new Set(visited) // New visited set for each branch
                            );
                        }
                        return ref; // Keep reference if not found
                    })
                    .filter(r => r !== null);
            } else if (typeof rel.data === 'object' && rel.data.type && rel.data.id) {
                // To-one relationship: {type, id}
                const hydrated = getResourceFromIndex(rel.data, null, resourceIndex);
                if (hydrated) {
                    // Use resource directly from index (no clone)
                    // Recursively hydrate nested relationships
                    resource.relationships[relName] = hydrateResource(
                        hydrated, // Use same object instance from index
                        resourceIndex,
                        new Set(visited) // New visited set for each branch
                    );
                } else {
                    // Keep original reference if not found
                    resource.relationships[relName] = rel.data;
                }
            } else {
                // Already hydrated or invalid format
                resource.relationships[relName] = rel.data;
            }
        } else {
            // Relationship without data field (already hydrated or invalid)
            resource.relationships[relName] = rel;
        }
    });

    return resource;
}

/**
 * Hydrate primary data in a JSON:API document
 * 
 * Builds resource index and hydrates all primary data resources
 * by replacing relationship references with actual objects.
 * 
 * IMPORTANT: Mutates the original document to ensure that multiple
 * references to the same resource share the same object instance.
 * Resources are not cloned - they are unique objects from the index.
 * 
 * @param {Object} doc - JSON:API document (will be mutated)
 * @returns {Object|Array} Hydrated primary data (single resource or array)
 */
export function hydrateDocumentData(doc) {
    if (!doc || typeof doc !== 'object') {
        throw new KViewsParseError('Invalid document: must be an object');
    }

    // Build resource index (indexes resources from original document)
    const resourceIndex = buildResourceIndex(doc);

    if (!doc.data) {
        return null;
    }

    // Use original data directly (no cloning) to ensure shared object instances
    const data = doc.data;

    if (Array.isArray(data)) {
        // Collection: hydrate each resource (mutates original)
        data.forEach(resource => hydrateResource(resource, resourceIndex));
        return data;
    } else if (typeof data === 'object') {
        // Single resource: hydrate it (mutates original)
        return hydrateResource(data, resourceIndex);
    }

    return data;
}

/**
 * Parse item data from JSON:API document
 * 
 * Hydrates relationships and extracts item data ready for Item.loadFromData().
 * Handles both single item responses and item data within collection responses.
 * 
 * IMPORTANT: This function preserves object identity. The returned resource
 * is the same runtime object from the hydrated graph, not a copy. This ensures
 * that multiple references to the same resource share the same object instance.
 * 
 * The returned object is a hydrated resource with relationships resolved to
 * actual runtime objects (not JSON:API relationship wrappers). If document
 * links.self exists, the url property is attached directly to the resource object.
 * 
 * @param {Object} data - JSON:API document or already-hydrated resource object
 * @param {Object} options - Options (legacy db parameter for backward compatibility)
 * @returns {Object} The hydrated resource object (same instance, not a copy)
 */
export function parseItemData(data, options = {}) {
    let hydratedResource;
    let doc = data;

    // If data is already a hydrated resource (from hydrateDocumentData), use it directly
    if (data && typeof data === 'object' && data.type && data.id && !data.data) {
        hydratedResource = data;
    } else if (data && data.data) {
        // JSON:API document format - hydrate it
        doc = data;
        hydratedResource = hydrateDocumentData(doc);
    } else {
        // Fallback: assume it's already hydrated or plain object
        hydratedResource = data;
    }

    if (!hydratedResource || typeof hydratedResource !== 'object') {
        throw new KViewsParseError('Invalid item data: must be an object');
    }

    // Attach URL from document links directly to the resource object (preserves identity)
    // Only attach if not already present to avoid overwriting existing url
    if (doc && doc.links && doc.links.self && !hydratedResource.url) {
        hydratedResource.url = createURL(doc.links.self);
    }

    // Return the original hydrated resource object (not a copy)
    // This preserves object identity across the entire hydrated graph
    return hydratedResource;
}

/**
 * Parse collection data from JSON:API document
 * 
 * Hydrates relationships and extracts array of item data ready for Collection.loadFromData().
 * 
 * @param {Object} doc - JSON:API document
 * @returns {Array} Array of hydrated resource objects
 */
export function parseCollectionData(doc) {
    if (!doc || typeof doc !== 'object') {
        return [];
    }

    const hydratedData = hydrateDocumentData(doc);

    if (!hydratedData) {
        return [];
    }

    if (!Array.isArray(hydratedData)) {
        // Single resource in collection response - wrap in array
        return [hydratedData];
    }

    return hydratedData;
}

/**
 * Build database from JSON API data (LEGACY - for backward compatibility)
 * 
 * @deprecated Use buildResourceIndex() and hydrateDocumentData() instead
 * This function is kept for backward compatibility but may be removed in future versions.
 */
export function buildDb(data) {
    // Build index
    const index = buildResourceIndex(data);

    // Convert Map to legacy db format for backward compatibility
    const db = {
        __get: function (resName, keyId) {
            if (!resName) {
                return null;
            }

            if (resName.constructor === Object && resName.hasOwnProperty('id') && resName.hasOwnProperty('type')) {
                keyId = resName.id;
                resName = resName.type;
            }

            const resource = getResourceFromIndex(resName, keyId, index);
            return resource || null;
        },
        __add: function (resName, keyId, data) {
            // Legacy method - not used in new hydration flow
            return null;
        }
    };

    // Hydrate document data (mutates index entries)
    if (data && data.data) {
        hydrateDocumentData(data);
    }

    return db;
}

/**
 * Flatten document data (LEGACY - kept for backward compatibility)
 * 
 * @deprecated This function is no longer needed with the new hydration approach.
 * It's kept for backward compatibility but may be removed in future versions.
 */
export function flattenDoc(doc) {
    // Return array of all resources (primary + included) for legacy compatibility
    const resources = [];

    if (doc && doc.data) {
        if (Array.isArray(doc.data)) {
            resources.push(...doc.data);
        } else if (typeof doc.data === 'object') {
            resources.push(doc.data);
        }
    }

    const included = getIncludedResources(doc);
    resources.push(...included);

    return resources;
}

/**
 * Parse data for insert or update
 * 
 * Converts plain object data into JSON:API format for POST/PUT requests.
 * This is the inverse of parsing - it serializes data to JSON:API format.
 */
export function parseDataForInsertOrUpdate(itemData) {
    if (itemData === null) {
        return null;
    }

    if (typeof itemData !== 'object') {
        throw new Error('Invalid item data: ' + itemData);
    }

    if (itemData.constructor === Array || (itemData.hasOwnProperty('items') && itemData.hasOwnProperty('length'))) {
        let resource = [];
        itemData.forEach(function (item) {
            resource.push(parseDataForInsertOrUpdate(item));
        });
        return resource;
    }

    if (itemData.constructor !== Object) {
        throw new Error('Invalid case');
    }

    let resource = {};

    if (!itemData.hasOwnProperty('attributes')) {
        let tmp = { attributes: {} };
        if (itemData.hasOwnProperty('type')) {
            tmp.type = itemData.type;
        }
        Object.assign(tmp.attributes, itemData);
        itemData = tmp;
    }

    Object.getOwnPropertyNames(itemData.attributes).forEach(function (attr) {
        if (itemData.attributes[attr] && typeof itemData.attributes[attr] === 'object') {
            if (!resource.relationships) {
                resource.relationships = {};
            }
            resource.relationships[attr] = {
                data: parseDataForInsertOrUpdate(itemData.attributes[attr])
            };
            return;
        }
        if (!resource.attributes) {
            resource.attributes = {};
        }
        resource.attributes[attr] = itemData.attributes[attr];
    });

    return resource;
}

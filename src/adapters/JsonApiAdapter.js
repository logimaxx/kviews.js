import {
    parseCollectionData,
    parseItemData,
    parseDataForInsertOrUpdate,
} from '../dataParser.js';

/**
 * JSON:API data adapter — default wire format for KViews.
 *
 * Handles document parsing/hydration, metadata extraction, list query params,
 * and create/update payload serialization for JSON:API backends.
 */
export class JsonApiAdapter {
    /** @type {string} */
    name = 'jsonapi';

    /**
     * Whether a remote response represents a single resource (not a collection).
     *
     * @param {object} data - Raw HTTP response body
     * @returns {boolean}
     */
    isSingleItemResponse(data) {
        return !!(data
            && data.data
            && typeof data.data === 'object'
            && !Array.isArray(data.data));
    }

    /**
     * Extract pagination metadata from a remote document.
     *
     * @param {object} data - Raw HTTP response body
     * @returns {{ totalRecords?: number, offset?: number }}
     */
    extractMetadata(data) {
        const meta = {};

        if (!data || !data.hasOwnProperty('meta') || typeof data.meta !== 'object') {
            return meta;
        }

        if (data.meta.hasOwnProperty('totalRecords')) {
            meta.totalRecords = data.meta.totalRecords * 1;
        }

        if (data.meta.hasOwnProperty('offset')) {
            meta.offset = data.meta.offset;
        }

        return meta;
    }

    /**
     * Apply extracted metadata to a Collection instance.
     *
     * @param {object} collection - Collection instance
     * @param {{ totalRecords?: number, offset?: number }} meta
     */
    applyMetadata(collection, meta) {
        if (meta.totalRecords !== undefined) {
            collection.total = meta.totalRecords;
        }
        if (meta.offset !== undefined) {
            collection.offset = meta.offset;
        }
    }

    /**
     * Parse a single-item remote document into a canonical resource object.
     *
     * @param {object} data - Raw HTTP response body
     * @param {object} [options]
     * @returns {object} Hydrated resource ready for Item.loadFromData()
     */
    parseItemResponse(data, options = {}) {
        this.validateItemRemoteDoc(data, options);
        return parseItemData(data, options);
    }

    /**
     * Validate that a remote document is suitable for a single Item load.
     *
     * @param {object} data - Raw HTTP response body
     * @param {object} [options]
     * @param {object} [options.collection] - Parent collection (for type inference)
     */
    validateItemRemoteDoc(data) {
        if (data?.data?.constructor === Array) {
            throw new Error('Invalid configuration: resource type is item but server response is collection');
        }
    }

    /**
     * Infer resource type from a single-item remote document.
     *
     * @param {object} data - Raw HTTP response body
     * @returns {string|undefined}
     */
    inferItemType(data) {
        return data?.data?.type;
    }

    /**
     * Parse a collection remote document into canonical resource objects.
     *
     * @param {object} doc - Raw HTTP response body
     * @returns {{ items: Array<object>, meta: object }}
     */
    parseCollectionResponse(doc) {
        const items = parseCollectionData(doc);
        const meta = this.extractMetadata(doc);
        return { items, meta };
    }

    /**
     * Apply list query parameters to a URL object before a collection fetch.
     *
     * @param {import('../URL.js').URL} url - Collection URL
     * @param {{ type?: string, offset?: number, pageSize?: number }} params
     */
    applyListQuery(url, params) {
        const { type, offset, pageSize } = params;

        if (typeof offset !== 'undefined' && offset !== null && type) {
            url.parameters[`page[${type}][offset]`] = offset;
        }

        if (typeof pageSize !== 'undefined' && pageSize !== null && type) {
            url.parameters[`page[${type}][limit]`] = pageSize;
        }
    }

    /**
     * Serialize plain item data for a create (POST) request.
     *
     * @param {object|Array} itemData - Single item or array of items
     * @param {{ type?: string }} [context]
     * @returns {{ body: string, contentType: string, headers?: object }}
     */
    serializeForCreate(itemData, context = {}) {
        const doc = { data: parseDataForInsertOrUpdate(itemData) };

        if (context.type) {
            doc.type = context.type;
        }

        return {
            body: JSON.stringify(doc),
            contentType: 'application/vnd.api+json',
        };
    }

    /**
     * Serialize changed fields for an update (PATCH) request.
     *
     * @param {object} toUpdate - Resource patch with id, type, attributes, relationships
     * @returns {{ body: string, contentType: string }}
     */
    serializeForUpdate(toUpdate) {
        return {
            body: JSON.stringify({ data: toUpdate }),
            contentType: 'application/vnd.api+json',
        };
    }

    /**
     * Serialize a runtime relationship value to JSON:API wire format.
     *
     * @param {object|Array|null} rel - Runtime relationship value
     * @returns {object} JSON:API relationship: { data: ... }
     */
    serializeRelationship(rel) {
        if (rel === null) {
            return { data: null };
        }

        if (rel && typeof rel === 'object' && !Array.isArray(rel)) {
            if (rel.id) {
                const result = { data: { id: rel.id } };
                if (rel.type) {
                    result.data.type = rel.type;
                }
                return result;
            }

            if (rel.hasOwnProperty('toJSON')) {
                const json = rel.toJSON();
                const result = { data: { id: json.id } };
                if (json.type) {
                    result.data.type = json.type;
                }
                return result;
            }

            return { data: null };
        }

        if (Array.isArray(rel)) {
            return {
                data: rel.map((item) => {
                    if (item && typeof item === 'object') {
                        if (item.type && item.id) {
                            const result = { id: item.id };
                            if (item.type) {
                                result.type = item.type;
                            }
                            return result;
                        }

                        if (item.hasOwnProperty('toJSON')) {
                            const json = item.toJSON();
                            const result = { id: json.id };
                            if (json.type) {
                                result.type = json.type;
                            }
                            return result;
                        }
                    }
                    return item;
                }).filter((item) => item && item.id),
            };
        }

        return { data: null };
    }
}

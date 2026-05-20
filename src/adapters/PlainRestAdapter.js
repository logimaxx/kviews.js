import {
    getPath,
    extractCollectionRows,
    extractTotalRecords,
    extractOffset,
} from './plainUtils.js';

/**
 * Plain REST data adapter for flat JSON APIs.
 *
 * Supports common response shapes:
 * - Collection: `[{ id, ... }]` or `{ data|items|results: [...], total?, offset? }`
 * - Item: `{ id, ... }` or `{ data: { id, ... } }`
 *
 * Wire format uses `application/json` with flat objects (no JSON:API envelope).
 */
export class PlainRestAdapter {
    /** @type {string} */
    name = 'plain';

    /**
     * @param {object} [opts]
     * @param {string|null} [opts.itemsPath] - Dot path to item array (null = auto-detect)
     * @param {string|null} [opts.itemPath] - Dot path to single item in a wrapper document
     * @param {string|null} [opts.totalPath] - Dot path to total count (null = auto-detect)
     * @param {string|null} [opts.offsetPath] - Dot path to offset (null = auto-detect)
     * @param {string} [opts.idField] - Primary key field name
     * @param {string|null} [opts.typeField] - Resource type field on wire objects
     * @param {'offset'|'page'} [opts.paginationStyle] - Query param style for list fetches
     * @param {string} [opts.offsetParam] - Offset query parameter name
     * @param {string} [opts.limitParam] - Page size query parameter name
     * @param {string} [opts.pageParam] - Page number query parameter name (1-based)
     * @param {boolean} [opts.embedRelationships] - Embed nested objects on write (default: id stub)
     */
    constructor(opts = {}) {
        this.itemsPath = opts.itemsPath ?? null;
        this.itemPath = opts.itemPath ?? null;
        this.totalPath = opts.totalPath ?? null;
        this.offsetPath = opts.offsetPath ?? null;
        this.idField = opts.idField ?? 'id';
        this.typeField = opts.typeField ?? 'type';
        this.paginationStyle = opts.paginationStyle ?? 'offset';
        this.offsetParam = opts.offsetParam ?? 'offset';
        this.limitParam = opts.limitParam ?? 'limit';
        this.pageParam = opts.pageParam ?? 'page';
        this.embedRelationships = opts.embedRelationships ?? false;
    }

    /**
     * @param {object|Array} data
     * @returns {boolean}
     */
    isSingleItemResponse(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return false;
        }

        if (this.itemPath) {
            const item = getPath(data, this.itemPath);
            if (Array.isArray(item)) {
                return false;
            }
            if (item && typeof item === 'object') {
                return item[this.idField] != null;
            }
            return false;
        }

        const rows = extractCollectionRows(data, this.itemsPath);
        if (rows.length > 0) {
            return false;
        }

        if (data.data && Array.isArray(data.data)) {
            return false;
        }

        if (data.data && typeof data.data === 'object' && data.data[this.idField] != null) {
            return true;
        }

        return data[this.idField] != null;
    }

    /**
     * @param {object} data
     * @returns {{ totalRecords?: number, offset?: number }}
     */
    extractMetadata(data) {
        const meta = {};
        const totalRecords = extractTotalRecords(data, this.totalPath);

        if (totalRecords !== undefined) {
            meta.totalRecords = totalRecords;
        }

        const offset = extractOffset(data, this.offsetPath);
        if (offset !== undefined) {
            meta.offset = offset;
        }

        return meta;
    }

    /**
     * @param {object} collection
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
     * @param {object} data
     * @param {object} [options]
     * @returns {object}
     */
    parseItemResponse(data, options = {}) {
        this.validateItemRemoteDoc(data, options);
        const raw = this.extractRawItem(data);
        const defaultType = options.collection?.type ?? options.type;
        return this.normalize(raw, defaultType);
    }

    /**
     * @param {object} data
     */
    validateItemRemoteDoc(data) {
        if (Array.isArray(data)) {
            throw new Error('Invalid configuration: resource type is item but server response is collection');
        }

        if (this.itemPath) {
            const item = getPath(data, this.itemPath);
            if (Array.isArray(item)) {
                throw new Error('Invalid configuration: resource type is item but server response is collection');
            }
            return;
        }

        if (data?.data && Array.isArray(data.data)) {
            throw new Error('Invalid configuration: resource type is item but server response is collection');
        }
    }

    /**
     * @param {object} data
     * @returns {string|undefined}
     */
    inferItemType(data) {
        const raw = this.extractRawItem(data);
        if (!raw || typeof raw !== 'object') {
            return undefined;
        }
        return raw[this.typeField];
    }

    /**
     * @param {object|Array} doc
     * @param {object} [options]
     * @returns {{ items: Array<object>, meta: object }}
     */
    parseCollectionResponse(doc, options = {}) {
        const rows = extractCollectionRows(doc, this.itemsPath);
        const defaultType = options.type;
        const items = rows.map((row) => this.normalize(row, defaultType));
        const meta = this.extractMetadata(doc);
        return { items, meta };
    }

    /**
     * @param {import('../URL.js').URL} url
     * @param {{ offset?: number, pageSize?: number }} params
     */
    applyListQuery(url, params) {
        const { offset, pageSize } = params;

        if (typeof pageSize === 'undefined' || pageSize === null) {
            return;
        }

        if (this.paginationStyle === 'page') {
            const safeOffset = typeof offset === 'undefined' || offset === null ? 0 : offset;
            const page = Math.floor(safeOffset / pageSize) + 1;
            url.parameters[this.pageParam] = page;
            url.parameters[this.limitParam] = pageSize;
            return;
        }

        if (typeof offset !== 'undefined' && offset !== null) {
            url.parameters[this.offsetParam] = offset;
        }

        url.parameters[this.limitParam] = pageSize;
    }

    /**
     * @param {object|Array} itemData
     * @param {object} [context]
     * @returns {{ body: string, contentType: string }}
     */
    serializeForCreate(itemData, context = {}) {
        const defaultType = context.type;
        let payload;

        if (Array.isArray(itemData)) {
            payload = itemData.map((item) => this.flattenForWire(this.coerceToCanonical(item, defaultType)));
        } else {
            payload = this.flattenForWire(this.coerceToCanonical(itemData, defaultType));
        }

        return {
            body: JSON.stringify(payload),
            contentType: 'application/json',
        };
    }

    /**
     * @param {object} toUpdate
     * @returns {{ body: string, contentType: string }}
     */
    serializeForUpdate(toUpdate) {
        const relationships = {};

        Object.entries(toUpdate.relationships || {}).forEach(([name, rel]) => {
            relationships[name] = this.unwrapRelationship(rel);
        });

        const payload = this.flattenForWire({
            id: toUpdate.id,
            type: toUpdate.type,
            attributes: toUpdate.attributes,
            relationships,
        });

        return {
            body: JSON.stringify(payload),
            contentType: 'application/json',
        };
    }

    /**
     * @param {object|Array|null} rel
     * @returns {object|Array|null|undefined}
     */
    serializeRelationship(rel) {
        return this.unwrapRelationship(rel);
    }

    /**
     * @param {object} data
     * @returns {object}
     * @private
     */
    extractRawItem(data) {
        if (this.itemPath) {
            return getPath(data, this.itemPath);
        }

        if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
            return data.data;
        }

        return data;
    }

    /**
     * @param {object} row
     * @param {string|undefined} defaultType
     * @returns {object}
     */
    normalize(row, defaultType) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) {
            throw new Error('Invalid item data: must be an object');
        }

        if (row.attributes && typeof row.attributes === 'object') {
            const relationships = {};

            Object.entries(row.relationships || {}).forEach(([name, value]) => {
                if (value === null) {
                    relationships[name] = null;
                } else if (Array.isArray(value)) {
                    relationships[name] = value.map((entry) => this.normalize(entry, defaultType));
                } else {
                    relationships[name] = this.normalize(value, defaultType);
                }
            });

            const normalized = {
                attributes: { ...row.attributes },
                relationships,
            };

            if (row.id != null) {
                normalized.id = String(row.id);
            }

            if (row.type ?? defaultType) {
                normalized.type = row.type ?? defaultType;
            }

            return normalized;
        }

        const attributes = {};
        const relationships = {};
        let id;
        let type;

        Object.entries(row).forEach(([key, value]) => {
            if (key === this.idField) {
                id = value;
                return;
            }

            if (key === this.typeField) {
                type = value;
                return;
            }

            if (value === null || value === undefined) {
                attributes[key] = value;
                return;
            }

            if (Array.isArray(value)) {
                if (value.length > 0 && value.every((entry) => this.isNestedResource(entry))) {
                    relationships[key] = value.map((entry) => this.normalize(entry, defaultType));
                } else {
                    attributes[key] = value;
                }
                return;
            }

            if (this.isNestedResource(value)) {
                relationships[key] = this.normalize(value, defaultType);
                return;
            }

            attributes[key] = value;
        });

        const normalized = { attributes, relationships };

        if (id != null) {
            normalized.id = String(id);
        }

        if (type ?? defaultType) {
            normalized.type = type ?? defaultType;
        }

        return normalized;
    }

    /**
     * @param {*} value
     * @returns {boolean}
     * @private
     */
    isNestedResource(value) {
        return value
            && typeof value === 'object'
            && !Array.isArray(value)
            && value[this.idField] != null;
    }

    /**
     * @param {object} data
     * @param {string|undefined} defaultType
     * @returns {object}
     * @private
     */
    coerceToCanonical(data, defaultType) {
        if (!data || typeof data !== 'object') {
            return data;
        }

        if (data.attributes || data.relationships) {
            return data;
        }

        return this.normalize(data, defaultType);
    }

    /**
     * @param {object} canonical
     * @returns {object}
     * @private
     */
    flattenForWire(canonical) {
        if (!canonical || typeof canonical !== 'object') {
            return canonical;
        }

        const result = { ...(canonical.attributes || {}) };

        if (canonical.id != null) {
            result[this.idField] = canonical.id;
        }

        if (canonical.type != null && this.typeField) {
            result[this.typeField] = canonical.type;
        }

        Object.entries(canonical.relationships || {}).forEach(([name, rel]) => {
            if (rel === null) {
                result[name] = null;
                return;
            }

            if (Array.isArray(rel)) {
                result[name] = rel.map((entry) => this.relationshipToWire(entry));
                return;
            }

            result[name] = this.relationshipToWire(rel);
        });

        return result;
    }

    /**
     * @param {object|null|undefined} rel
     * @returns {object|null|undefined}
     * @private
     */
    relationshipToWire(rel) {
        if (!rel) {
            return null;
        }

        if (this.embedRelationships && rel.attributes) {
            return this.flattenForWire(rel);
        }

        const stub = { [this.idField]: rel.id ?? rel[this.idField] };

        if ((rel.type ?? rel[this.typeField]) != null) {
            stub[this.typeField] = rel.type ?? rel[this.typeField];
        }

        return stub;
    }

    /**
     * @param {*} rel
     * @returns {object|Array|null|undefined}
     * @private
     */
    unwrapRelationship(rel) {
        if (rel == null) {
            return null;
        }

        if (rel.data !== undefined) {
            if (rel.data === null) {
                return null;
            }

            if (Array.isArray(rel.data)) {
                return rel.data.map((entry) => ({ ...entry }));
            }

            return { ...rel.data };
        }

        if (Array.isArray(rel)) {
            return rel.map((entry) => this.unwrapRelationship(entry));
        }

        if (typeof rel === 'object') {
            if (rel.attributes) {
                return rel;
            }

            return { ...rel };
        }

        return rel;
    }
}

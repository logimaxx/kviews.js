import { dbg, log, parseOptions, createOverlay } from './utils.js';
import { createURL } from './URL.js';
import { Storage } from './Storage.js';
import { parseItemData } from './dataParser.js';
import { ItemView } from './ItemView.js';

/**
 * Item class - represents a single resource item
 */
export class Item {
    constructor(options = {},data=null) {
        this.id = null;
        this.type = null;
        this.attributes = {};
        this.relationships = {};
        this.views = [];
        this.collection = null;
        this.url = null;
        this.updateUrl = null;
        this.deleteUrl = null;
        this.strict = false;
        this.shadow = null;
        this.syncOp = null;
        this.emptyview = null;
        this.uievents = [];
        this.callbacks = {};
        
        try {
            Object.assign(this, parseOptions(options));
        } catch (e) {
            throw new Error("Error on Item init", e);
        }

        this.storage = options.storage || new Storage();

        let render = false;
        // Load initial data if provided (before URL setup)
        if (data) {
            log("Loading data",data);
            try {
                this.loadFromData(data);
                render = true;
            } catch (e) {
                console.error("Error loading data",e);
            }
        }
        
        // Initialize URLs (after data is loaded)
        if (this.url) {
            this.setUrl(this.url);
        }
        if(this.deleteUrl) {
            log("deleteUrl", this.deleteUrl);
            this.setUrl(this.deleteUrl, "delete");
        }
        if(this.updateUrl) {
            this.setUrl(this.updateUrl, "update");
        }
        if(this.insertUrl) {
            this.setUrl(this.insertUrl, "insert");
        }

        // Link views to this item
        this.views.forEach((view) => {
            view.item = this;
        });

        // Apply item listeners if provided in options (from collection)
        if (options.itemListeners && typeof options.itemListeners === "object") {
            Object.getOwnPropertyNames(options.itemListeners).forEach((eventName) => {
                this.on(eventName, options.itemListeners[eventName]);
            });
        }

        if(render) {
            log("Rendering data",data);
            this.render();
        }
    }

    /**
     * Event listener registration
     */
    on(eventName, cb) {
        if (typeof this.callbacks[eventName] === "undefined") {
            this.callbacks[eventName] = [];
        }
        this.callbacks[eventName].push(cb);
        return this;
    }

    /**
     * Remove event listener(s)
     * @param {string} eventName - Event name
     * @param {Function} [cb] - Optional callback to remove. If not provided, removes all listeners for the event
     * @returns {Item} This instance for chaining
     */
    off(eventName, cb) {
        if (!eventName) {
            // Remove all listeners
            this.callbacks = {};
            return this;
        }
        
        if (!this.callbacks[eventName]) {
            return this;
        }

        if (cb) {
            // Remove specific callback
            const index = this.callbacks[eventName].indexOf(cb);
            if (index > -1) {
                this.callbacks[eventName].splice(index, 1);
            }
            // Clean up empty arrays
            if (this.callbacks[eventName].length === 0) {
                delete this.callbacks[eventName];
            }
        } else {
            // Remove all listeners for this event
            delete this.callbacks[eventName];
        }
        
        return this;
    }

    /**
     * Register a one-time event listener
     * @param {string} eventName - Event name
     * @param {Function} cb - Callback function
     * @returns {Item} This instance for chaining
     */
    once(eventName, cb) {
        const wrapper = (...args) => {
            cb(...args);
            this.off(eventName, wrapper);
        };
        return this.on(eventName, wrapper);
    }

    /**
     * Check if event has listeners
     * @param {string} eventName - Event name
     * @returns {boolean} True if event has listeners
     */
    hasListeners(eventName) {
        return this.callbacks[eventName] && Array.isArray(this.callbacks[eventName]) && this.callbacks[eventName].length > 0;
    }

    /**
     * Trigger an event (internal helper)
     * @private
     * @param {string} eventName - Event name
     * @param {...any} args - Arguments to pass to callbacks
     */
    _trigger(eventName, ...args) {
        if (this.callbacks[eventName] && Array.isArray(this.callbacks[eventName])) {
            this.callbacks[eventName].forEach(cb => {
                if (typeof cb === 'function') {
                    cb(...args);
                }
            });
        }
    }

    /**
     * Emit/trigger an event manually
     * @param {string} eventName - Event name
     * @param {...any} args - Arguments to pass to callbacks
     * @returns {Item} This instance for chaining
     */
    emit(eventName, ...args) {
        this._trigger(eventName, ...args);
        return this;
    }

    /**
     * Set URL for this item
     */
    setUrl(url,type) {
        switch(type) {
            case "delete":
                this.deleteUrl = createURL(url);
                break;
            case "update":
                this.updateUrl = createURL(url);
                break;
            case "insert":
                this.insertUrl = createURL(url);
                break;
            default:
                this.url = createURL(url);
                this.deleteUrl = typeof this.deleteUrl == "string" ? createURL(this.deleteUrl) : (this.deleteUrl ?? createURL(this.url));
                this.updateUrl = typeof this.updateUrl == "string" ? createURL(this.updateUrl) : (this.updateUrl ?? createURL(this.url));
                break;
        }
        return this;
    }

    /**
     * Load from remote
     * 
     * Canonical method for loading item data from API
     */
    loadFromRemote() {
        return this.loadFromDataSource();
    }

    /**
     * Load from data source (internal implementation)
     * @private
     */
    loadFromDataSource() {
        let loaders = [];
        const overlay = createOverlay();

        this.views.forEach((itemView) => {
            if (itemView.el) {
                let $el = $(itemView.el);
                let loader = overlay.clone();
                loader.insertBefore(itemView.el)
                    .width($el.width())
                    .height($el.height());
                loaders.push(loader);
            }
        });

        return new Promise((resolve, reject) => {
            if (!this.url) {
                reject(new Error("No valid URL provided"));
                return;
            }

            this._trigger('beforeload', this);

            // Convert URL object to string for Storage
            let urlString = this.url.toString ? this.url.toString() : this.url;
            
            this.storage.read(this, urlString, {})
                .then((resp) => {
                    let data = resp.data;
                    this.loadFromJSONAPIDoc(data).render();
                    this._trigger('load', this);
                    loaders.forEach((loader) => {
                        loader.remove();
                    });
                    resolve(this);
                })
                .catch((error) => {
                    dbg("fail to load item resource", this.url, error);
                    // Handle both old error format and new Error instances
                    // KViewsHttpError has jqXHR, textStatus, errorThrown properties
                    if (error instanceof Error && error.jqXHR) {
                        // New error format (KViewsHttpError)
                        this.fail(error.jqXHR, error.textStatus || 'error', error.errorThrown || error);
                        reject(error);
                    } else if (error && error.jqXHR) {
                        // Old error format (backward compatibility - plain object)
                        this.fail(error.jqXHR, error.textStatus, error.errorThrown);
                        reject(error);
                    } else {
                        // Plain Error instance or other error
                        this.fail(null, 'error', error);
                        reject(error);
                    }
                });
        });
    }

    /**
     * @deprecated Use loadFromRemote() instead
     * Alias for backward compatibility
     */
    refresh() {
        return this.loadFromRemote();
    }

    /**
     * @deprecated Use loadFromRemote() instead
     * Alias for backward compatibility
     */
    reload() {
        return this.loadFromRemote();
    }

    /**
     * @deprecated Use loadFromRemote() instead
     * Internal method, use loadFromRemote() for public API
     * @private
     */
    load_from_data_source() {
        return this.loadFromDataSource();
    }

    /**
     * Unbind a view from this item
     */
    unbindView(view) {
        let found = false;
        for (let i = 0; i < this.views.length; i++) {
            if (this.views[i] === view) {
                found = i;
            }
        }
        if (found !== false) {
            this.views.splice(found, 1);
        }
    }

    /**
     * Bind a view to this item
     */
    bindView(view, returnView) {
        // Handle jQuery or DOM element
        let $el = $(view);
        if ($el.length === 0) {
            throw new Error("Nothing to bind to: empty view element");
        }

        if (!(view instanceof ItemView)) {
            view = new ItemView(view);
        }

        let bound = false;
        this.views.forEach((v) => {
            dbg("bind to existing view", v.el);
            if (v === view) {
                bound = true;
            }
        });

        if (bound) {
            return returnView ? view : this;
        }

        view.item = this;
        this.views.push(view);
        return returnView ? view : this;
    }

    /**
     * Load from JSON API document
     */
    loadFromJSONAPIDoc(data) {
        dbg("Load from JSONAPIDoc", data);
        if(this.collection && !this.collection.type ) {
            this.type = data.data.type;
        }

        if (data.data && data.data.constructor === Array) {
            dbg("Invalid configuration: resource type is item but server response is collection", data);
            throw new Error("Invalid configuration: resource type is item but server response is collection");
        }

        // Parse and hydrate item data (relationships are resolved)
        const parsedData = parseItemData(data);
        Object.assign(this, parsedData);
        if (this.url) {
            this.url = createURL(this.url);
        }
        return this;
    }

    /**
     * Load from data object
     */
    loadFromData(data, render=false) {
        if (data === null || typeof data !== "object" || data.constructor !== Object) {
            dbg("cannot load ", data, " into ", this);
            throw new Error("Cannot load data into item");
        }

        // Normalize data if not delivered in standard JSONAPI structure
        if (!data.hasOwnProperty("attributes") && !data.hasOwnProperty("id") && !data.hasOwnProperty("type")) {
            dbg("need to normalize data", data);

            let attributes = {};
            let relationships = {};

            Object.getOwnPropertyNames(data).forEach((propName) => {
                if (data[propName] && data[propName].constructor === Object) {
                    relationships[propName] = new Item().loadFromData(data[propName]);
                    return;
                }
                if (data[propName] && data[propName].constructor === Array) {
                    // Note: Collection import would cause circular dependency
                    // This should be handled at a higher level
                    relationships[propName] = data[propName]; // Store as-is for now
                    return;
                }

                attributes[propName] = data[propName];
            });

            data = {
                attributes: attributes,
            };

            if (Object.getOwnPropertyNames(relationships).length) {
                data.relationships = relationships;
            }
        }

        Object.assign(this, data);
        this._trigger('load', this);
        if(render) {
            this.render();
        }
        return this;
    }

    /**
     * Handle failure
     */
    fail(xhr, statusText, error) {
        dbg("item.fail", xhr, statusText, error);
        this.views.forEach((view) => {
            if (xhr && xhr.status === 404) {
                view.renderEmpty();
            }
        });
    }

    /**
     * Get render context - safe view model for templates
     * 
     * RENDER CONTEXT CONTRACT:
     * 
     * Returns a template-friendly object where:
     * - Attributes are exposed directly (e.g., {{title}} not {{attributes.title}})
     * - Relationships are flattened to plain objects with attributes, id, type
     * - All data is shallow-copied to prevent mutation of internal state
     * 
     * Relationship representation strategy:
     * - To-one: { id, type, ...attributes } (flattened plain object)
     * - To-many: Array of { id, type, ...attributes } (array of flattened objects)
     * - Null relationships: null
     * 
     * This ensures Handlebars templates can access data directly:
     *   {{title}} - item attribute
     *   {{author.name}} - relationship attribute
     *   {{#each tags}}{{name}}{{/each}} - relationship array
     * 
     * @returns {Object} Render context object safe for template rendering
     */
    getRenderContext() {
        // Create a shallow copy of attributes (exposed directly in template)
        const context = Object.assign({}, this.attributes);
        
        // Add relationships as separate properties (flattened to template-friendly format)
        // Strategy: Flatten relationships to plain objects with id, type, and attributes merged
        if (this.relationships) {
            Object.getOwnPropertyNames(this.relationships).forEach(relName => {
                const rel = this.relationships[relName];
                
                if (rel === null) {
                    // Null relationship
                    context[relName] = null;
                } else if (Array.isArray(rel)) {
                    // To-many: Array of flattened objects
                    context[relName] = rel.map(item => {
                        if (item && typeof item === 'object' && item.attributes) {
                            // Item-like object: flatten to { id, type, ...attributes }
                            return Object.assign({}, item.attributes, {
                                id: item.id,
                                type: item.type
                            });
                        }
                        // Already plain object or primitive
                        return item;
                    });
                } else if (rel && typeof rel === 'object' && rel.attributes) {
                    // To-one: Flatten to { id, type, ...attributes }
                    context[relName] = Object.assign({}, rel.attributes, {
                        id: rel.id,
                        type: rel.type
                    });
                } else {
                    // Fallback: plain object or primitive (create copy if object)
                    context[relName] = (typeof rel === 'object' && rel !== null) 
                        ? Object.assign({}, rel) 
                        : rel;
                }
            });
        }
        
        // Add id and type for template access
        if (this.id !== null && this.id !== undefined) {
            context.id = this.id;
        }
        if (this.type) {
            context.type = this.type;
        }
        
        return context;
    }

    /**
     * Convert to JSON:API format
     * 
     * Serializes item to JSON:API format for API requests.
     * This method is side-effect free - it does not mutate this.relationships.
     * 
     * Runtime relationships (hydrated objects) are converted to JSON:API
     * relationship format: { data: { type, id } } or { data: [{ type, id }, ...] }
     * 
     * @returns {Object} JSON:API formatted object
     */
    toJSON() {
        let json = {
            type: this.type,
            attributes: this.attributes || {}
        };
        
        if (this.id) {
            json.id = this.id;
        }

        // Serialize relationships to JSON:API format (side-effect free)
        if (this.relationships && Object.keys(this.relationships).length > 0) {
            json.relationships = {};

            for (let relName in this.relationships) {
                if (!this.relationships.hasOwnProperty(relName)) {
                    continue;
                }

                const rel = this.relationships[relName];

                // Null relationship
                if (rel === null) {
                    json.relationships[relName] = { data: null };
                    continue;
                }

                // To-one relationship: runtime object -> { data: { type, id } }
                if (rel && typeof rel === 'object' && !Array.isArray(rel)) {
                    if (rel.type && rel.id) {
                        // Runtime object with type/id
                        json.relationships[relName] = {
                            data: {
                                type: rel.type,
                                id: rel.id
                            }
                        };
                    } else if (rel.hasOwnProperty('toJSON')) {
                        // Item instance - use its toJSON
                        json.relationships[relName] = {
                            data: rel.toJSON()
                        };
                    } else {
                        // Unknown format - skip (don't mutate original)
                        continue;
                    }
                    continue;
                }

                // To-many relationship: array of runtime objects -> { data: [{ type, id }, ...] }
                if (Array.isArray(rel)) {
                    json.relationships[relName] = {
                        data: rel.map(item => {
                            if (item && typeof item === 'object') {
                                if (item.type && item.id) {
                                    // Runtime object with type/id
                                    return {
                                        type: item.type,
                                        id: item.id
                                    };
                                } else if (item.hasOwnProperty('toJSON')) {
                                    // Item instance - use its toJSON
                                    return item.toJSON();
                                }
                            }
                            // Fallback: use as-is
                            return item;
                        })
                    };
                    continue;
                }

                // Invalid format - skip (don't mutate original)
                continue;
            }
        }
        
        dbg("item.json", json);
        return json;
    }

    /**
     * Serialize a single relationship to JSON:API wire format
     * 
     * Converts runtime relationship state (hydrated objects, arrays, null) to
     * JSON:API relationship format for wire transmission.
     * 
     * IMPORTANT: This is a serialization function - it does NOT mutate runtime state.
     * Runtime relationships remain as hydrated objects/arrays/null.
     * 
     * @param {Object|Array|null} rel - Runtime relationship value
     * @returns {Object} JSON:API relationship format: { data: { type, id } } or { data: [{ type, id }, ...] } or { data: null }
     */
    _serializeRelationshipToWireFormat(rel) {
        // Null relationship
        if (rel === null) {
            return { data: null };
        }

        // To-one relationship: runtime object -> { data: { type, id } }
        if (rel && typeof rel === 'object' && !Array.isArray(rel)) {
            if (rel.type && rel.id) {
                // Runtime object with type/id
                return {
                    data: {
                        type: rel.type,
                        id: rel.id
                    }
                };
            } else if (rel.hasOwnProperty('toJSON')) {
                // Item instance - extract type/id from toJSON result
                const json = rel.toJSON();
                return {
                    data: {
                        type: json.type,
                        id: json.id
                    }
                };
            } else {
                // Unknown format - return null (can't serialize)
                return { data: null };
            }
        }

        // To-many relationship: array of runtime objects -> { data: [{ type, id }, ...] }
        if (Array.isArray(rel)) {
            return {
                data: rel.map(item => {
                    if (item && typeof item === 'object') {
                        if (item.type && item.id) {
                            // Runtime object with type/id
                            return {
                                type: item.type,
                                id: item.id
                            };
                        } else if (item.hasOwnProperty('toJSON')) {
                            // Item instance - extract type/id
                            const json = item.toJSON();
                            return {
                                type: json.type,
                                id: json.id
                            };
                        }
                    }
                    // Fallback: return as-is (may be invalid)
                    return item;
                }).filter(item => item && item.type && item.id) // Filter out invalid items
            };
        }

        // Unknown format - return null
        return { data: null };
    }

    /**
     * Sync pending operations
     */
    sync() {
        if (this.syncOp) {
            let syncOp = this.syncOp;
            dbg("Syncing", this, syncOp);
            this.syncOp = null;
            return syncOp();
        } else {
            dbg("Nothing to sync on", this);
        }
    }

    /**
     * Perform update operation
     * 
     * Builds PATCH payload with changed attributes and relationships.
     * 
     * IMPORTANT: Runtime relationship state (hydrated objects/arrays/null) is serialized
     * to JSON:API wire format ({ data: { type, id } }) for transmission. Runtime state
     * remains unchanged - this is a serialization layer, not a state mutation.
     */
    perform_update(opts) {
        let options = {
            rerender: true
        };
        Object.assign(options, opts);

        return new Promise((resolve, reject) => {
            let toUpdate = {
                id: this.id,
                attributes: {},
                relationships: {}
            };

            if (this.type) {
                toUpdate.type = this.type;
            }

            // Collect changed attributes
            Object.getOwnPropertyNames(this.attributes).forEach((attrName) => {
                if (this.shadow && this.shadow.attributes[attrName] !== this.attributes[attrName]) {
                    toUpdate.attributes[attrName] = this.attributes[attrName];
                }
            });

            // Collect changed relationships and serialize to JSON:API wire format
            // Runtime state (hydrated objects) -> JSON:API format ({ data: { type, id } })
            Object.getOwnPropertyNames(this.relationships).forEach((relaName) => {
                if (this.shadow && this.shadow.relationships[relaName] !== this.relationships[relaName]) {
                    const runtimeRel = this.relationships[relaName];
                    // Serialize runtime relationship to JSON:API wire format
                    toUpdate.relationships[relaName] = this._serializeRelationshipToWireFormat(runtimeRel);
                }
            });

            // Nothing to update
            if (!Object.getOwnPropertyNames(toUpdate.attributes).length
                && !Object.getOwnPropertyNames(toUpdate.relationships).length) {
                this.syncOp = null;
                resolve(this);
                return;
            }

            let patchData = JSON.stringify({ data: toUpdate });

            if (opts && opts.justSimulate) {
                dbg(patchData);
                resolve(this);
                return;
            }

                // Convert URL object to string for Storage
                let updateUrlString = this.updateUrl.toString ? this.updateUrl.toString() : this.updateUrl;
                
                this.storage.update(this, updateUrlString, {}, patchData)
                    .then((resp) => {
                    // Parse and hydrate item data (relationships are resolved)
                    let newData = parseItemData(resp.data);
                    Object.assign(this, newData);
                    this.shadow = null;

                    if (options.rerender) {
                        this.views.forEach((view) => {
                            view.render();
                        });
                    }

                    this._trigger('update', this);

                    if (this.collection) {
                        this.collection.onupdate();
                    }
                    resolve(this);
                })
                .catch((error) => {
                    dbg("Update NOK", this.updateUrl, patchData, error);
                    // Handle both old error format and new Error instances
                    if (error instanceof Error && error.jqXHR) {
                        reject(error);
                    } else if (error.jqXHR) {
                        reject(error);
                    } else {
                        reject(error instanceof Error ? error : new Error(String(error)));
                    }
                });
        });
    }

    /**
     * Update item
     */
    update(updateData, opts) {
        if (!updateData || updateData.constructor !== Object) {
            return;
        }

        let updateOptions = {
            sync: true,
            rerender: true,
        };

        if (opts && opts.constructor === Object) {
            Object.assign(updateOptions, opts);
        }

        if (!this.shadow) {
            this.shadow = { attributes: {}, relationships: {} };
            Object.assign(this.shadow.attributes, this.attributes);
            Object.assign(this.shadow.relationships, this.relationships);
        }

        /**
         * Update relationship value
         * 
         * Maintains runtime relationship shape: hydrated objects, arrays, or null.
         * Does NOT reintroduce JSON:API wrapper format like { data: { id } }.
         * 
         * @param {Object|Array|null} rel - Current relationship value (runtime object/array/null)
         * @param {*} data - New relationship data (can be object, id string, or null)
         * @returns {Object|Array|null} Updated relationship value (runtime format)
         */
        const updateRelation = (rel, data) => {
            dbg("update relation", rel, data);

            // Handle null
            if (data === null) {
                return null;
            }

            // rel is to-many (array)
            if (rel && Array.isArray(rel)) {
                // For arrays, keep as array (don't convert to single object)
                // If data is array, replace; if single object/id, wrap in array
                if (Array.isArray(data)) {
                    // Replace array with new array of runtime objects
                    return data.map(item => {
                        if (typeof item === 'object' && item !== null) {
                            return new Item().loadFromData(item);
                        }
                        // If it's an id, find existing item or create placeholder
                        return item;
                    });
                }
                // Single item - add to array or replace? For now, keep existing behavior
                dbg("to fix: array relationship update");
                return rel;
            }

            // rel is to-one (object or null)
            if (typeof data === "object" && data !== null) {
                // Data is object - load as Item instance (runtime object)
                dbg("Update 1:1 relation");
                let item = new Item().loadFromData(data);
                dbg("relation", item);
                return item;
            }

            // Data is id string
            if (typeof data === "string" || typeof data === "number") {
                // If current rel matches id, keep it
                if (rel && rel.id && (rel.id === data || String(rel.id) === String(data))) {
                    return rel;
                }
                
                // Otherwise, create a minimal runtime object with just id
                // (type will be inferred or set elsewhere)
                // This maintains runtime format, not JSON:API wrapper format
                return {
                    id: String(data),
                    type: rel && rel.type ? rel.type : null
                };
            }

            // Unknown format - return as-is
            return rel;
        };

        // Update relationships
        Object.getOwnPropertyNames(this.relationships).forEach((relName) => {
            if (!updateData.hasOwnProperty(relName)) {
                return;
            }
            if (updateData[relName] === null) {
                this.relationships[relName] = null;
                return;
            }
            this.relationships[relName] = updateRelation(this.relationships[relName], updateData[relName]);
            delete updateData[relName];
        });

        // Check attributes
        Object.getOwnPropertyNames(updateData).forEach((attrName) => {
            if (updateData[attrName] && typeof updateData[attrName] === "object") {
                if (!this.strict && typeof this.relationships[attrName] === "undefined") {
                    this.relationships[attrName] = updateRelation(this.relationships[attrName], updateData[attrName]);
                }
                return;
            }

            if (!this.shadow.attributes.hasOwnProperty(attrName)) {
                if (!this.strict) {
                    this.attributes[attrName] = updateData[attrName];
                }
                return;
            }

            // Update only if different from prev value
            if (updateData[attrName] !== this.shadow.attributes[attrName]) {
                this.attributes[attrName] = updateData[attrName];
            }
        });

        if (updateOptions.sync) {
            return this.perform_update(updateOptions);
        }

        return new Promise((resolve) => {
            this.syncOp = () => this.perform_update(updateOptions);
            this.views.forEach((view) => {
                if (updateOptions.rerender) {
                    view.render();
                }
            });
            resolve();
        });
    }

    /**
     * Remove item
     */
    remove() {
        return new Promise((resolve, reject) => {
            let ps = [];
            for (let i = this.views.length - 1; i >= 0; i--) {
                ps.push(this.views[i].remove());
            }

            let collection = this.collection;
            if (collection) {
                ps.push(collection.removeItem(this));
            }

            Promise.all(ps)
                .then(() => {
                    this._trigger('remove', this);
                    // Trigger collection update event once (removeItem() no longer triggers it)
                    if (collection) {
                        collection.onupdate();
                    }
                })
                .finally(() => resolve());
        });
    }

    /**
     * Delete item
     */
    async delete(ops) {
        if(!this.deleteUrl) {
            return this.remove();
        }

        let deleteOps = {
            sync: true,
        };

        if (ops && ops.constructor === Object) {
            Object.assign(deleteOps, ops);
        }

        try {
            // Convert URL object to string for Storage
            log("delete", this.deleteUrl.toString());
            await this.storage.delete(this, this.deleteUrl.toString(), {});
            await this.remove();
        } catch (error) {
            dbg("Error deleting item", error);
            throw error;
        }
    }

    /**
     * Render item
     */
    render(collectionView, addontop = false) {
        dbg("Render from item", this);
        this.views.forEach((view) => {
            if (typeof collectionView === "undefined") {
                dbg("collectionView is undefined so render view");
                view.render();
                return;
            }
            if (view.container === collectionView) {
                dbg("collectionView matches view container so render view");
                view.render(false, addontop);
            }
        });
        this._trigger('afterrender', this);
        return this;
    }

    /**
     * Destroy item and clean up resources
     * 
     * Removes event handlers, views, and clears references.
     * Safe to call multiple times.
     * 
     * @returns {Item} This instance for chaining
     */
    destroy() {
        // Create shallow copy to avoid mutation during iteration
        const viewsToDestroy = this.views ? [...this.views] : [];
        
        // Destroy all views (iterate over copy, not live array)
        viewsToDestroy.forEach(view => {
            if (view && typeof view.destroy === 'function') {
                view.destroy();
            }
        });
        
        // Clear views array after iteration
        this.views = [];

        // Clean up callbacks
        this.callbacks = {};

        // Remove from collection if part of one
        if (this.collection) {
            // Note: collection.removeItem() will handle cleanup
            // but we clear the reference here
            this.collection = null;
        }

        // Clear storage reference
        this.storage = null;

        // Clear URLs
        this.url = null;
        this.updateUrl = null;
        this.deleteUrl = null;

        // Clear data
        this.attributes = {};
        this.relationships = {};
        this.shadow = null;

        // Clear views array
        this.views = [];

        return this;
    }
}

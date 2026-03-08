import { dbg, log, parseOptions, createOverlay } from './utils.js';
import { createURL } from './URL.js';
import { Storage } from './Storage.js';
import { parseCollectionData, parseItemData, parseDataForInsertOrUpdate } from './dataParser.js';
import { Item } from './Item.js';
import { ItemView } from './ItemView.js';
import { CollectionView } from './CollectionView.js';
import { Paging } from './Paging.js';

/**
 * Collection class - represents a collection of items
 */
export class Collection {
    constructor(opts = {}) {
       
        this.url = null;
        this.deleteUrl = null;
        this.insertUrl = null;
        this.updateUrl = null;
        this.paging = null;
        this.view = null;
        this.offset = 0;
        this.total = null;
        this.pageSize = 10;
        this.template = null;
        this.navtype = "page";
        this.type = null;
        this.emptyview = null;
        this.items = []; // Canonical storage - use this.items only
        this.addontop = false;
        this.uievents = [];
        this.setAttrAsId = null;
        this.itemListeners = null; // Listeners to apply to all items created in this collection

        this.callbacks = {};
        this.iterator = -1;

        try {
            opts = parseOptions(opts);
        } catch (e) {
            throw new Error("Error on Collection init", e);
        }
        
        // Define length as getter (derived from items array)
        // This replaces manual length management and pseudo-array behavior
        Object.defineProperty(this, 'length', {
            get() {
                return this.items.length;
            },
            enumerable: true,
            configurable: true
        });

        let options = Object.assign({}, opts);
        
        Object.assign(this, options);

        if (options.hasOwnProperty("paging") && $(options.paging).length) {
            this.paging = new Paging($(options.paging)[0], this);
        }

        if(this.url) {
            this.setUrl(this.url);
        }

        if (this.view) {
            this.view.collection = this;
        }

        if (this.total) {
            this.total = this.total * 1;
        }

        if (["page", "scroll"].indexOf(this.navtype) === -1) {
            throw new Error("Invalid navigations type. Should be page or scroll");
        }

        this.storage = opts.hasOwnProperty("storage") ? opts.storage : (
            opts.hasOwnProperty("ajaxOpts") ? new Storage(opts.ajaxOpts) : new Storage()
        );

        if (typeof opts.listeners === "object") {
            for (let event in opts.listeners) {
                this.on(event, opts.listeners[event]);
            }
        }

        // Store item listeners if provided (via 'itemListeners' or 'itemOn' option)
        if (opts.itemListeners && typeof opts.itemListeners === "object") {
            this.itemListeners = opts.itemListeners;
        } else if (opts.itemOn && typeof opts.itemOn === "object") {
            this.itemListeners = opts.itemOn;
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
     * @returns {Collection} This instance for chaining
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
     * @returns {Collection} This instance for chaining
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
     * @returns {Collection} This instance for chaining
     */
    emit(eventName, ...args) {
        this._trigger(eventName, ...args);
        return this;
    }

    /**
     * Show listeners (debug)
     */
    showlisteners() {
        dbg(this.callbacks);
    }

   

    /**
     * Remove item from collection
     * 
     * Removes item from items array. Does NOT trigger update event
     * (that's handled by Item.remove() to avoid duplication).
     * 
     * @param {Item} item - Item instance to remove
     * @returns {Promise} Resolves when item is removed
     */
    removeItem(item) {
        const index = this.items.findIndex(i => i === item || (i.id && item.id && i.id === item.id));
        if (index !== -1) {
            // Remove from items array (no pseudo-array manipulation)
            this.items.splice(index, 1);
            // Note: update event is triggered by Item.remove() to avoid duplication
        }
        // Return promise for consistency (item.remove() is async)
        return Promise.resolve();
    }

    /**
     * Set page size
     */
    setPageSize(val) {
        if (/^\d+$/.test(val)) {
            this.pageSize = val;
            return true;
        }
        return false;
    }

    /**
     * Empty collection
     */
    empty() {
        return this.clear();
    }

    /**
     * Set offset
     */
    setOffset(val) {
        if (/^\d+$/.test(val)) {
            this.offset = val;
            return true;
        }
        return false;
    }

    /**
     * Bulk update (not implemented)
     */
    update(data) {
        throw new Error("Not implemented... yet");
    }
    setUrl(url,type) {
        if(!url)
            return this;
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
                log("setUrl", url);
                this.url = createURL(url);
                this.deleteUrl = typeof this.deleteUrl == "string" ? createURL(this.deleteUrl) : (this.deleteUrl ?? createURL(this.url));
                this.updateUrl = typeof this.updateUrl == "string" ? createURL(this.updateUrl) : (this.updateUrl ?? createURL(this.url));
                this.insertUrl = typeof this.insertUrl == "string" ? createURL(this.insertUrl) : (this.insertUrl ?? createURL(this.url));
                break;
        }
        return this;
    }
    

    /**
     * Receive remote data
     * 
     * Processes JSON:API document by hydrating relationships and extracting data array.
     * Uses the new explicit hydration layer to replace relationship references with
     * actual resource objects from included resources.
     * 
     * IMPORTANT: For single item responses (e.g., from append/create), uses parseItemData()
     * to avoid wrapping in array and triggering collection replacement behavior.
     */
    receiveRemoteData(data) {
        dbg("Remote data received", data);

        // Check if response is a single item or collection
        // Single item: data.data is an object (not array)
        // Collection: data.data is an array
        const isSingleItem = data && data.data && typeof data.data === 'object' && !Array.isArray(data.data);

        if (isSingleItem) {
            // Single item response (e.g., from append/create) - parse as item, not collection
            const hydratedItem = parseItemData(data);
            
            // Extract metadata if available
            if (data.hasOwnProperty("meta")) {
                if (data.meta.hasOwnProperty("totalRecords")) {
                    this.total = data.meta.totalRecords * 1;
                }
                if (data.meta.hasOwnProperty("offset")) {
                    this.offset = data.meta.offset;
                }
            }

            // Add single item to collection (don't clear existing items)
            if (this.items.length === 0) {
                this.view.reset(true);
            }
            dbg("Append single item to collection");
            let newItem = this.loadItem(hydratedItem);
            newItem.render(this.view, this.addontop);
            this._trigger('afterrender', this);
            return newItem;
        } else {
            // Collection response - parse as collection
            const hydratedData = parseCollectionData(data);

            // Extract metadata and return hydrated data array
            const dataArray = this.extractMetadataAndData({ ...data, data: hydratedData });

            if (dataArray == null) {
                return;
            }

            // Received data is a collection (array)
            if (dataArray.constructor === Array) {
                log("Append multiple items to collection");
                if (this.items.length === 0) {
                    this.view.reset(true);
                }
                
                // Load all items and collect them for return
                const loadedItems = [];
                dataArray.forEach((item) => {
                    const loadedItem = this.loadItem(item);
                    if (loadedItem) {
                        loadedItems.push(loadedItem);
                    }
                });
                
                this.render();
                return loadedItems; // Return array of items for batchInsert()
            }
        }
    }

    /**
     * Extract metadata and data from JSON:API document
     * 
     * Extracts metadata (totalRecords, offset) from JSON:API response meta object
     * and returns the hydrated data array. Data hydration is handled by
     * parseCollectionData() before this is called.
     * 
     * @param {Object} data - JSON:API document (data property should already be hydrated)
     * @returns {Array} Array of hydrated item data objects
     */
    extractMetadataAndData(data) {
        dbg("extract metadata and data", data);

        if (!data.hasOwnProperty("data")) {
            return data;
        }

        // Extract metadata
        if (data.hasOwnProperty("meta")) {
            if (data.meta.hasOwnProperty("totalRecords")) {
                this.total = data.meta.totalRecords * 1;
            }
            if (data.meta.hasOwnProperty("offset")) {
                this.offset = data.meta.offset;
            }
        }
        
        // Return hydrated data array (relationships already resolved)
        return data.data;
    }

    /**
     * Parse collection data from JSON:API document (legacy alias)
     * 
     * @deprecated Use extractMetadataAndData() instead
     * @param {Object} data - JSON:API document
     * @returns {Array} Array of hydrated item data objects
     */
    parse(data) {
        return this.extractMetadataAndData(data);
    }

    /**
     * Load from data
     */
    loadFromData(data) {
        dbg("collection load from data", data);

        if (data === null || typeof data !== "object" || data.constructor !== Array) {
            dbg("cannot load ", data, " into collection ", this);
            return this;
        }

        if (this.navtype === "page") {
            this.items = [];
        }

        data.forEach((item) => {
            this.loadItem(item);
        });

        if (this.view) {
            this.view.render();
        } else {
            dbg("collection does not have a view ", this);
        }

        this._trigger('load', this);
        return this;
    }

    /**
     * Next page
     */
    next() {
        this.offset = parseInt(this.offset) + parseInt(this.pageSize);
        this.loadFromRemote();
    }

    /**
     * Previous page
     */
    prev() {
        this.offset = parseInt(this.offset) - parseInt(this.pageSize);
        this.loadFromRemote();
    }

    /**
     * Clear collection
     * 
     * Synchronously clears items array and renders empty state.
     * For async item cleanup, use destroy() instead.
     * 
     * @returns {Collection} This instance for chaining
     */
    clear() {
        // Clear items array synchronously (no async remove calls)
        // If you need to cleanup item resources, call destroy() instead
        this.items = [];
        
        // Render empty state
        if (this.view) {
            this.view.render();
        }
        
        this._trigger('update', this);
        return this;
    }

    /**
     * Render collection
     */
    render() {
        if (this.view) {
            this.view.render();
        }

        this._trigger('afterrender', this);
        return this;
    }

    /**
     * Load from remote
     * 
     * Canonical method for loading collection data from API
     */
    loadFromRemote() {
        return this.loadFromDataSource();
    }

    /**
     * Load from data source (internal implementation)
     * @private
     */
    loadFromDataSource() {
        const overlay = createOverlay();
        let loader = null;

        if (this.view && this.view.el) {
            loader = $(overlay).clone().insertBefore(this.view.el)
                .width($(this.view.el).width())
                .height($(this.view.el).height());
        }

        this._trigger('beforeload', this);

        return new Promise((resolve, reject) => {
            if (!this.url) {
                reject(new Error("No valid URL provided"));
                return;
            }

            if (typeof this.offset !== "undefined" && this.offset !== null) {
                this.url.parameters["page[" + this.type + "][offset]"] = this.offset;
            }

            if (typeof this.pageSize !== "undefined" && this.pageSize !== null) {
                this.url.parameters["page[" + this.type + "][limit]"] = this.pageSize;
            }

            // Convert URL object to string for Storage
            let urlString = this.url.toString ? this.url.toString() : this.url;
            
            this.storage.read(this, urlString, {})
                .then((res) => {
                    // For page navigation, clear existing items (replace)
                    // For scroll navigation, append to existing items
                    if (this.navtype === "page") {
                        this.items = [];
                    }
                    // receiveRemoteData() will load items into collection
                    this.receiveRemoteData(res.data);
                    this._trigger('load', this);
                    if (loader) {
                        $(loader).remove();
                    }
                    if(this.paging) {
                        this.paging.render();
                    }
                    resolve(this);
                })
                .catch((error) => {
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
     * Handle failure
     */
    fail(xhr, txt, err) {
        dbg("Fail to load collection", xhr, txt, err, this);
    }

    /**
     * On update callback
     */
    onupdate() {
        dbg("onupdate");
        this._trigger('update', this);
        return this;
    }

    /**
     * Insert a single new item into collection
     * 
     * Creates a single item via POST request and adds it to the collection.
     * The server response should contain the created item in JSON:API format.
     * 
     * @param {Object} itemData - Single item data object (not an array)
     * @returns {Promise<Item>} Promise resolving to the created Item instance
     * @throws {Error} If itemData is an array (use batchInsert() instead)
     */
    insert(itemData) {
        // Validate that itemData is not an array
        if (Array.isArray(itemData)) {
            throw new Error('insert() expects a single item object. Use batchInsert() for multiple items.');
        }

        let jsonApiDoc = { data: parseDataForInsertOrUpdate(itemData) };
        if (this.type) {
            jsonApiDoc.type = this.type;
        }

        return new Promise((resolve, reject) => {
            if (!this.insertUrl) {
                this.insertUrl = this.url;
            }

            // Convert URL object to string for Storage
            let insertUrlString = this.insertUrl.toString ? this.insertUrl.toString() : this.insertUrl;

            this.storage
                .create(this, insertUrlString, { contentType: "application/vnd.api+json" }, JSON.stringify(jsonApiDoc))
                .then((resp) => {
                    let data = resp.data;
                    let newItem = this.receiveRemoteData(data);
                    log("newItem", newItem);
                    this.onupdate();
                    resolve(newItem);
                })
                .catch((resp) => {
                    dbg("fail to receive data", resp);
                    reject(resp);
                });
        });
    }

    /**
     * Batch insert multiple items into collection
     * 
     * Creates multiple items via POST request and adds them to the collection.
     * The server response should contain an array of created items in JSON:API format.
     * 
     * @param {Array} itemsData - Array of item data objects
     * @returns {Promise<Array<Item>>} Promise resolving to array of created Item instances
     * @throws {Error} If itemsData is not an array
     */
    batchInsert(itemsData) {
        // Validate that itemsData is an array
        if (!Array.isArray(itemsData)) {
            throw new Error('batchInsert() expects an array of items. Use insert() for a single item.');
        }

        if (itemsData.length === 0) {
            return Promise.resolve([]);
        }

        let jsonApiDoc = { data: parseDataForInsertOrUpdate(itemsData) };
        if (this.type) {
            jsonApiDoc.type = this.type;
        }

        return new Promise((resolve, reject) => {
            if (!this.insertUrl) {
                this.insertUrl = this.url;
            }

            // Convert URL object to string for Storage
            let insertUrlString = this.insertUrl.toString ? this.insertUrl.toString() : this.insertUrl;

            this.storage
                .create(this, insertUrlString, { contentType: "application/vnd.api+json" }, JSON.stringify(jsonApiDoc))
                .then((resp) => {
                    let data = resp.data;
                    // For batch insert, response should be a collection (array)
                    const result = this.receiveRemoteData(data);
                    
                    // If result is collection (array was processed), return all new items
                    // If result is single item, wrap in array for consistency
                    const newItems = Array.isArray(result) ? result : (result ? [result] : []);
                    
                    log("batchInsert newItems", newItems);
                    this.onupdate();
                    resolve(newItems);
                })
                .catch((resp) => {
                    dbg("fail to receive batch data", resp);
                    reject(resp);
                });
        });
    }

    /**
     * @deprecated Use insert() for single items or batchInsert() for multiple items
     * This method is bivalent and will be removed in a future version.
     * Alias for backward compatibility - delegates to insert() or batchInsert() based on input type.
     */
    append(itemData) {
        if (Array.isArray(itemData)) {
            return this.batchInsert(itemData);
        } else {
            return this.insert(itemData);
        }
    }

    /**
     * @deprecated Use insert() instead
     * Alias for backward compatibility
     */
    createItem(itemData) {
        return this.insert(itemData);
    }

    /**
     * @deprecated Use insert() instead
     * Alias for backward compatibility
     */
    newItem(itemData) {
        return this.insert(itemData);
    }

    /**
     * Load item
     */
    loadItem(itemData) {
        log("loadItem from collection", itemData);
        if (!itemData) {
            log("no item data", itemData);
            return null;
        }

        let opts = {
            type: this.type,
            collection: this,
            uievents: this.uievents,
            storage: this.storage
        };
        if(this.setAttrAsId && itemData.id==null) {
            log("set item id from attribute", this.setAttrAsId, itemData);
            itemData.id = itemData.attributes[this.setAttrAsId];
        }

        if (itemData.id && this.url) {
            // Create new URL instances by cloning and modifying
            let tmp;
            
            tmp = createURL(this.url.toString());
            tmp.path += "/" + itemData.id;
            // tmp.path += "/" + itemData.id;
            opts.url = createURL(tmp.toString());
            opts.updateUrl = createURL(tmp.toString());
            opts.deleteUrl = createURL(tmp.toString());

        }

        // Apply item listeners before creating item (so they're active when loadFromData triggers events)
        if (this.itemListeners) {
            // Store listeners temporarily in opts so they're applied during Item construction
            opts.itemListeners = this.itemListeners;
        }

        let newItem = new Item(opts)
            .bindView(new ItemView({
                template: this.template,
                container: this.view
            }))
            .loadFromData(itemData);

        // Add to items array (no pseudo-array manipulation)
        if (this.addontop) {
            dbg("Add on top");
            this.items.unshift(newItem);
        } else {
            this.items.push(newItem);
        }

        return newItem;
    }

    /**
     * Destroy collection and clean up resources
     * 
     * Removes event handlers, destroys all items and views, clears references.
     * Safe to call multiple times.
     * 
     * @returns {Collection} This instance for chaining
     */
    destroy() {
        // Create shallow copy to avoid mutation during iteration
        const itemsToDestroy = [...this.items];
        
        // Destroy all items (iterate over copy, not live array)
        itemsToDestroy.forEach(item => {
            if (item && typeof item.destroy === 'function') {
                item.destroy();
            }
        });
        
        // Clear items array after iteration
        this.items = [];

        // Destroy view
        if (this.view && typeof this.view.destroy === 'function') {
            this.view.destroy();
        }
        this.view = null;

        // Destroy filtering
        if (this.filtering && typeof this.filtering.destroy === 'function') {
            this.filtering.destroy();
        }
        this.filtering = null;

        // Destroy paging
        if (this.paging && typeof this.paging.destroy === 'function') {
            this.paging.destroy();
        }
        this.paging = null;

        // Clean up callbacks
        this.callbacks = {};

        // Clear storage reference
        this.storage = null;

        // Clear URLs
        this.url = null;
        this.deleteUrl = null;
        this.insertUrl = null;
        this.updateUrl = null;

        // Reset state
        this.items = []; // length is derived from items array (getter)
        this.total = null;
        this.offset = 0;

        return this;
    }

}

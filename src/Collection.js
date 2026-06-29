import { dbg, log, parseOptions, createOverlay, trace } from './utils.js';
import { createURL } from './URL.js';
import { Storage } from './Storage.js';
import { resolveAdapter } from './adapters/index.js';
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
        this.adapter = null;

        this.callbacks = {};
        this.iterator = -1;

        trace("Collection init", opts);
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

        const explicitListQuery = {
            pageSize: options.hasOwnProperty("pageSize"),
            offset: options.hasOwnProperty("offset"),
        };
        
        Object.assign(this, options);

        if (options.hasOwnProperty("paging") && $(options.paging).length) {
            this.paging = new Paging($(options.paging)[0], this);
        }

        if(this.url) {
            this.setUrl(this.url);
        }
        if(this.deleteUrl) {
            this.setUrl(this.deleteUrl, "delete");
        }
        if(this.updateUrl) {
            this.setUrl(this.updateUrl, "update");
        }
        if(this.insertUrl) {
            this.setUrl(this.insertUrl, "insert");
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

        this.adapter = resolveAdapter(opts.adapter);

        if (this.url) {
            this._syncListQueryFromUrl(this.url, explicitListQuery);
        }

        this.storage = opts.hasOwnProperty("storage")
            ? opts.storage
            : new Storage(
                  (() => {
                      const storageOpts = Object.assign({}, opts.ajaxOpts || {});
                      if (opts.headers && typeof opts.headers === "object") {
                          storageOpts.headers = Object.assign(
                              {},
                              storageOpts.headers || {},
                              opts.headers
                          );
                      }
                      return storageOpts;
                  })()
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
                if (this.adapter) {
                    this._syncListQueryFromUrl(this.url);
                }
                break;
        }
        return this;
    }

    /**
     * Apply pagination params from URL query string to collection state.
     * @private
     * @param {import('./URL.js').URL} url
     * @param {{ pageSize?: boolean, offset?: boolean }} [explicit] - Options explicitly set at init
     */
    _syncListQueryFromUrl(url, explicit = {}) {
        if (!url || !this.adapter || typeof this.adapter.extractListQueryFromUrl !== "function") {
            return;
        }

        const fromUrl = this.adapter.extractListQueryFromUrl(url, { type: this.type });

        if (fromUrl.pageSize != null && !explicit.pageSize) {
            this.setPageSize(fromUrl.pageSize);
        }

        if (fromUrl.offset != null && !explicit.offset) {
            this.offset = fromUrl.offset * 1;
        }
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

        if (this.adapter.isSingleItemResponse(data)) {
            const hydratedItem = this.adapter.parseItemResponse(data);
            this.adapter.applyMetadata(this, this.adapter.extractMetadata(data));

            if (this.items.length === 0) {
                this.view.reset(true);
            }
            dbg("Append single item to collection");
            let newItem = this.loadItem(hydratedItem);
            newItem.render(this.view, this.addontop);
            this._trigger('afterrender', this);
            return newItem;
        }

        const { items, meta } = this.adapter.parseCollectionResponse(data, { type: this.type });
        this.adapter.applyMetadata(this, meta);

        if (items == null) {
            return;
        }

        if (items.constructor === Array) {
            log("Append multiple items to collection");
            if (this.items.length === 0) {
                this.view.reset(true);
            }

            const loadedItems = [];
            items.forEach((item) => {
                const loadedItem = this.loadItem(item);
                if (loadedItem) {
                    loadedItems.push(loadedItem);
                }
            });

            this.render();
            return loadedItems;
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

        this.adapter.applyMetadata(this, this.adapter.extractMetadata(data));
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
            this.view._render();
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
            this.view._render();
        }
        
        this._trigger('update', this);
        return this;
    }

    /**
     * Render collection
     */
    render() {
        if (this.view) {
            this.view._render();
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

    load(data) {
        return data ? this.loadFromData(data):this.loadFromRemote();
    }

    /**
     * Load from data source (internal implementation)
     * @private
     */
    loadFromDataSource() {
        let loader = null;
        const showLoader = this.showLoader !== false;

        if (showLoader && this.view && this.view.el) {
            const overlay = createOverlay(this);
            loader = $(overlay).clone().insertBefore(this.view.el)
                .width($(this.view.el).width())
                .height($(this.view.el).height());
        }

        const removeLoader = () => {
            if (loader) {
                $(loader).remove();
            }
        };

        this._trigger('beforeload', this);

        return new Promise((resolve, reject) => {
            if (!this.url) {
                removeLoader();
                reject(new Error("No valid URL provided"));
                return;
            }

            this.adapter.applyListQuery(this.url, {
                type: this.type,
                offset: this.offset,
                pageSize: this.pageSize,
            });

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
                    removeLoader();
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
                        removeLoader();
                        reject(error);
                    } else if (error && error.jqXHR) {
                        // Old error format (backward compatibility - plain object)
                        this.fail(error.jqXHR, error.textStatus, error.errorThrown);
                        removeLoader();
                        reject(error);
                    } else {
                        // Plain Error instance or other error
                        this.fail(null, 'error', error);
                        removeLoader();
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
        console.log("onupdate");
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

        const payload = this.adapter.serializeForCreate(itemData, { type: this.type });

        return new Promise((resolve, reject) => {
            if (!this.insertUrl) {
                this.insertUrl = this.url;
            }

            // Convert URL object to string for Storage
            let insertUrlString = this.insertUrl.toString ? this.insertUrl.toString() : this.insertUrl;

            this.storage
                .create(this, insertUrlString, { contentType: payload.contentType }, payload.body)
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

        const payload = this.adapter.serializeForCreate(itemsData, { type: this.type });

        return new Promise((resolve, reject) => {
            if (!this.insertUrl) {
                this.insertUrl = this.url;
            }

            // Convert URL object to string for Storage
            let insertUrlString = this.insertUrl.toString ? this.insertUrl.toString() : this.insertUrl;

            this.storage
                .create(this, insertUrlString, { contentType: payload.contentType }, payload.body)
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
            storage: this.storage,
            adapter: this.adapter,
        };
        if(this.setAttrAsId && itemData.id==null) {
            log("set item id from attribute", this.setAttrAsId, itemData);
            itemData.id = itemData.attributes[this.setAttrAsId];
        }

        if (itemData.id && this.url) {
            // Create new URL instances by cloning and modifying
            let tmp;
            
            const url = createURL(this.url.toString());
            url.path += "/" + itemData.id;
            opts.url = createURL(url.toString());

            const updateUrl = createURL(this.updateUrl.toString());
            updateUrl.path += "/" + itemData.id;
            opts.updateUrl = createURL(updateUrl.toString());

            const deleteUrl = createURL(this.deleteUrl.toString());
            deleteUrl.path += "/" + itemData.id;
            opts.deleteUrl = createURL(deleteUrl.toString());
            
            const insertUrl = createURL(this.insertUrl.toString());
            insertUrl.path += "/" + itemData.id;
            opts.insertUrl = createURL(insertUrl.toString());
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

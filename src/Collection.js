import { dbg, log, error, parseOptions, createOverlay } from './utils.js';
import { createURL } from './URL.js';
import { Storage } from './Storage.js';
import { flattenDoc, buildDb, parseDataForInsertOrUpdate } from './dataParser.js';
import { Item } from './Item.js';
import { ItemView } from './ItemView.js';
import { CollectionView } from './CollectionView.js';

/**
 * Collection class - represents a collection of items
 */
export class Collection {
    constructor(opts = {}) {
        dbg("Collection options", opts);
        let allowedOptions = ["url", "deleteUrl", "insertUrl", "updateUrl",
            "view", "offset", "pageSize", "template", "type", "emptyview", "filter", "pagesize",
            "resourcetype", "dataBindings", "addontop", "template", "actions"];

        this.url = null;
        this.deleteUrl = null;
        this.insertUrl = null;
        this.updateUrl = null;
        // Paging removed - kept for backward compatibility but not used
        this.paging = null;
        this.view = null;
        this.offset = 0;
        this.total = null;
        this.pageSize = 10;
        this.template = null;
        this.navtype = "page";
        this.type = null;
        this.emptyview = null;
        this.length = 0;
        this.items = [];
        this.addontop = false;
        this.actions = [];
        this.onafterrender = null;
        this.onbeforeload = null;

        this.callbacks = {};
        this.iterator = -1;

        try {
            opts = parseOptions(opts);
        } catch (e) {
            throw new Error("Error on Collection init", e);
        }

        let options = {};
        Object.getOwnPropertyNames(opts).forEach((key) => {
            if (allowedOptions.indexOf(key) !== -1) {
                options[key] = opts[key];
            }
        });

        Object.assign(this, options);

        this.setUrl(this.url);

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
     * Show listeners (debug)
     */
    showlisteners() {
        dbg(this.callbacks);
    }

   

    /**
     * Remove item from collection
     */
    removeItem(item) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id === item.id) {
                this.items.splice(i, 1);
                for (var j = i; j < this.length - 1; j++) {
                    this[j] = this[j + 1];
                }
                delete this[j];
                this.length--;
                break;
            }
        }
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
                console.log("setUrl", url);
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
     */
    receiveRemoteData(data) {
        dbg("Remote data received", data);

        data = this.parse(data);

        if (data == null) {
            return;
        }

        // Received data is a collection
        if (data.constructor === Array) {
            log("Append multiple items to collection");
            if (this.items.length === 0) {
                this.view.reset(true);
            }
            data.forEach((item) => {
                this.loadItem(item);
            });
            return this.render();
        }

        // Received data is an item => add it
        if (data.constructor === Object) {
            if (this.items.length === 0) {
                this.view.reset(true);
            }
            dbg("Append single item to collection");
            let newItem = this.loadItem(data);
            newItem.render(this.view, this.addontop);
            if (this.onafterrender) {
                this.onafterrender(this);
            }
            return newItem;
        }
    }

    /**
     * Parse data
     */
    parse(data) {
        flattenDoc(data);
        let doc = buildDb(data);

        dbg("parse data", data);

        if (!data.hasOwnProperty("data")) {
            return data;
        }

        if (data.hasOwnProperty("meta")) {
            if (data.meta.hasOwnProperty("totalRecords")) {
                this.total = data.meta.totalRecords * 1;
            }
            if (data.meta.hasOwnProperty("offset")) {
                this.offset = data.meta.offset;
            }
        }
        return data.data;
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

        if (this.callbacks.load) {
            this.callbacks.load.forEach((cb) => new Promise(() => cb(this)));
        }
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
     */
    clear() {
        this.items.forEach((item) => {
            item.remove();
        });
        this.items = [];
        this.length = 0;
        this.render();
        return this;
    }

    /**
     * Render collection
     */
    render() {
        if (this.view) {
            this.view.render();
        }

        if (this.callbacks.afterrender) {
            this.callbacks.afterrender.forEach((cb) => typeof cb === "function" && cb(this));
        }
        if (this.onafterrender && typeof this.onafterrender === "function") {
            this.onafterrender(this);
        }
        return this;
    }

    /**
     * Load from remote
     */
    loadFromRemote() {
        return this.load_from_data_source();
    }

    reload() {
        return this.loadFromRemote();
    }

    refresh() {
        return this.loadFromRemote();
    }

    /**
     * Load from data source
     */
    load_from_data_source() {
        const overlay = createOverlay();
        let loader = null;

        if (this.view && this.view.el) {
            if (typeof $ !== "undefined") {
                loader = $(overlay).clone().insertBefore(this.view.el)
                    .width($(this.view.el).width())
                    .height($(this.view.el).height());
            } else {
                loader = overlay.cloneNode(true);
                if (this.view.el.parentNode) {
                    this.view.el.parentNode.insertBefore(loader, this.view.el);
                }
            }
        }

        if (this.onbeforeload && typeof this.onbeforeload === "function") {
            dbg("Exec onbeforeload");
            this.onbeforeload(this);
        }

        return new Promise((resolve, reject) => {
            if (!this.url) {
                throw new Error("No valid URL provided");
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
                    this.clear();
                    this.receiveRemoteData(res.data);
                    if (this.callbacks["load"]) {
                        this.callbacks["load"].forEach((cb) => new Promise(() => cb(this)));
                    }
                    if (loader) {
                        if (typeof loader.remove === "function") {
                            loader.remove();
                        } else if (loader.parentNode) {
                            loader.parentNode.removeChild(loader);
                        }
                    }
                    resolve(this);
                })
                .catch((error) => {
                    this.fail(error.jqXHR || error, error.textStatus, error.errorThrown);
                    reject(error);
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
     * Create item
     */
    createItem(itemData) {
        return this.append(itemData);
    }

    /**
     * New item alias
     */
    newItem(itemData) {
        return this.append(itemData);
    }

    /**
     * On update callback
     */
    onupdate() {
        dbg("onupdate");
        if (!this.callbacks.update) {
            return;
        }
        this.callbacks.update.forEach((cb) => cb(this));
    }

    /**
     * Append item
     */
    append(itemData) {
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
                    resolve(newItem);
                    this.onupdate();
                })
                .catch((resp) => {
                    dbg("fail to receive data", resp);
                    reject(resp);
                });
        });
    }

    /**
     * Load item
     */
    loadItem(itemData) {
        if (!itemData) {
            return null;
        }

        let opts = {
            type: this.type,
            collection: this,
            actions: this.actions,
            storage: this.storage
        };

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

        let newItem = new Item(opts)
            .bindView(new ItemView({
                template: this.template,
                container: this.view
            }))
            .loadFromData(itemData);

        if (this.addontop) {
            dbg("Add on top");
            this.items.unshift(newItem);
            for (let i = this.length; i > 0; i--) {
                this[i] = this[i - 1];
            }
            this[0] = newItem;
            this.length++;
        } else {
            this.items.push(newItem);
            this[this.length] = newItem;
            this.length++;
        }

        return newItem;
    }

}

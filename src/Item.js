import { dbg, log, error, parseOptions, createOverlay } from './utils.js';
import { createURL } from './URL.js';
import { Storage } from './Storage.js';
import { parseItemData, buildDb, parseDataForInsertOrUpdate } from './dataParser.js';
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
        // Initialize URLs
        if (this.url) {
            this.setUrl(this.url);
        }
        else if(data) {
            console.log("Loading data",data);
            try {
                this.loadFromData(data);
                render = true;
            } catch (e) {
                console.error("Error loading data",e);
            }
        }

        // Link views to this item
        this.views.forEach((view) => {
            view.item = this;
        });

        if(render) {
            console.log("Rendering data",data);
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
            default:
                this.url = createURL(url);
                this.deleteUrl = typeof this.deleteUrl == "string" ? createURL(this.deleteUrl) : (this.deleteUrl ?? createURL(this.url));
                this.updateUrl = typeof this.updateUrl == "string" ? createURL(this.updateUrl) : (this.updateUrl ?? createURL(this.url));
                break;
        }
        return this;
    }

    /**
     * Load from remote data source
     */
    loadFromRemote() {
        return this.load_from_data_source();
    }

    refresh() {
        return this.loadFromRemote();
    }

    reload() {
        return this.loadFromRemote();
    }

    /**
     * Load item data from data source storage
     */
    load_from_data_source() {
        let loaders = [];
        const overlay = createOverlay();

        this.views.forEach((itemView) => {
            if (typeof $ !== "undefined" && itemView.el) {
                let $el = $(itemView.el);
                let loader = overlay.clone();
                if (typeof loader.insertBefore === "function") {
                    loader.insertBefore(itemView.el)
                        .width($el.width())
                        .height($el.height());
                }
                loaders.push(loader);
            }
        });

        return new Promise((resolve, reject) => {
            if (!this.url) {
                throw new Error("No valid URL provided");
            }

            // Convert URL object to string for Storage
            let urlString = this.url.toString ? this.url.toString() : this.url;
            
            this.storage.read(this, urlString, {})
                .then((resp) => {
                    let data = resp.data;
                    this.loadFromJSONAPIDoc(data).render();
                    loaders.forEach((loader) => {
                        if (typeof loader.remove === "function") {
                            loader.remove();
                        } else if (loader.parentNode) {
                            loader.parentNode.removeChild(loader);
                        }
                    });
                    resolve(this);
                })
                .catch((error) => {
                    dbg("fail to load item resource", this.url, error);
                    this.fail(error.jqXHR || error, error.textStatus, error.errorThrown);
                    reject(error);
                });
        });
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
        let $el;
        if (typeof $ !== "undefined") {
            $el = $(view);
            if ($el.length === 0) {
                throw new Error("Nothing to bind to: empty view element");
            }
        } else if (!view || !view.nodeName) {
            throw new Error("Nothing to bind to: invalid view element");
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

        Object.assign(this, parseItemData(data, buildDb(data)));
        this.url = createURL(this.url);
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
     * Convert to JSON
     */
    toJSON() {
        let json = {
            type: this.type,
            attributes: this.attributes
        };
        if (this.id) {
            json.id = this.id;
        }
        if (this.attributes) {
            json.attributes = this.attributes;
        }

        if (!this.hasOwnProperty("relationships")) {
            return json;
        }

        json.relationships = {};

        for (let relName in this.relationships) {
            if (!this.relationships.hasOwnProperty(relName)) {
                continue;
            }

            json.relationships[relName] = {
                data: null,
            };

            if (this.relationships[relName] === null) {
                continue;
            }

            // 1:1 relation
            if (this.relationships[relName].constructor === Object) {
                json.relationships[relName].data = this.relationships[relName].hasOwnProperty("toJSON")
                    ? this.relationships[relName].toJSON() : this.relationships[relName];
                continue;
            }

            // Invalid relation data
            if (this.relationships[relName].constructor !== Array) {
                delete this.relationships[relName];
                delete json.relationships[relName];
                continue;
            }

            // 1:n relations
            json.relationships[relName].data = [];
            for (let i = 0; i < this.relationships[relName].length; i++) {
                let tmp = this.relationships[relName][i].hasOwnProperty("toJSON")
                    ? this.relationships[relName][i].toJSON()
                    : this.relationships[relName][i];
                json.relationships[relName].data.push(tmp);
            }
        }
        dbg("item.json", json);
        return json;
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

            Object.getOwnPropertyNames(this.attributes).forEach((attrName) => {
                if (this.shadow && this.shadow.attributes[attrName] !== this.attributes[attrName]) {
                    toUpdate.attributes[attrName] = this.attributes[attrName];
                }
            });

            Object.getOwnPropertyNames(this.relationships).forEach((relaName) => {
                if (this.shadow && this.shadow.relationships[relaName] !== this.relationships[relaName]) {
                    toUpdate.relationships[relaName] = this.relationships[relaName];
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
                    let newData = parseItemData(resp.data, buildDb(resp.data));
                    Object.assign(this, newData);
                    this.shadow = null;

                    if (options.rerender) {
                        this.views.forEach((view) => {
                            view.render();
                        });
                    }

                    if (this.callbacks.update) {
                        this.callbacks.update.forEach((cb) => new Promise(() => cb(this)));
                    }

                    if (this.collection) {
                        this.collection.onupdate();
                    }
                    resolve(this);
                })
                .catch((xhr) => {
                    dbg("Update NOK", this.updateUrl, patchData, xhr);
                    reject(xhr);
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

        const updateRelation = (rel, data) => {
            dbg("update relation", rel, data);

            // rel is 1:n
            if (rel && rel.hasOwnProperty("length")) {
                dbg("to fix");
                return rel;
            }

            // rel is 1:1
            if (typeof data === "object") {
                dbg("Update 1:1 relation");
                let item = new Item().loadFromData(data);
                dbg("relation", item);
                return item;
            }

            if (rel && rel.id && rel.id === data) {
                return rel;
            }

            return {
                data: {
                    id: data
                }
            };
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
                    if (this.callbacks["remove"]) {
                        this.callbacks["remove"].forEach((cb) => new Promise(() => cb(this)));
                    }
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

        // Convert URL object to string for Storage
        await this.storage.delete(this, this.deleteUrl.toString(), {})
        await this.remove();
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
    }
}

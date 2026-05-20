/**
 * KViews - Class-based API data binding library
 * Refactored from jQuery plugin to ES6 classes
 */

import { KViews } from './KViews.js';
import { apiBaseConfig } from './apiBase.js';
export { Item } from './Item.js';
export { Collection } from './Collection.js';
export { ItemView } from './ItemView.js';
export { CollectionView } from './CollectionView.js';
export { Storage } from './Storage.js';
export { URL, createURL } from './URL.js';
export { Filtering } from './Filtering.js';
export { Sorting } from './Sorting.js';
export { Paging } from './Paging.js';
export { utilities } from './utilities.js';
export { JsonApiAdapter, PlainRestAdapter, resolveAdapter, registerAdapter, setDefaultAdapter, getDefaultAdapter } from './adapters/index.js';
export * from './utils.js';

// Export KViews as default for bundle compatibility
export default KViews;
export { KViews };

// Make KViews available globally for backward compatibility
if (typeof window !== "undefined") {
    window.KViews = KViews;
}

// jQuery plugin wrapper for backward compatibility
if (typeof $ !== "undefined" && $.fn) {
    $.fn.kviews = function (opts) {
        let el = this.length ? this[0] : this;
        
        // Determine resource type
        let resourcetype = "collection"; // default
        if (opts && opts.resourcetype) {
            resourcetype = opts.resourcetype;
        } else {
            let dataResourcetype = $(el).data("resourcetype");
            if (dataResourcetype) {
                resourcetype = dataResourcetype;
            }
        }

        // Call appropriate method
        if (resourcetype === "item") {
            return KViews.createItemInstance(el, opts);
        } else {
            return KViews.createCollectionInstance(el, opts);
        }
    };

    Object.defineProperty($.fn.kviews, "baseUrl", {
        enumerable: true,
        configurable: true,
        get() {
            return apiBaseConfig.baseUrl;
        },
        set(v) {
            apiBaseConfig.baseUrl = v;
        },
    });
    Object.defineProperty($.fn.kviews, "basePath", {
        enumerable: true,
        configurable: true,
        get() {
            return apiBaseConfig.basePath;
        },
        set(v) {
            apiBaseConfig.basePath = v;
        },
    });
    Object.defineProperty($.fn.kviews, "defaultHeaders", {
        enumerable: true,
        configurable: true,
        get() {
            return apiBaseConfig.defaultHeaders;
        },
        set(v) {
            if (v && typeof v === "object" && !Array.isArray(v)) {
                apiBaseConfig.defaultHeaders = v;
            } else {
                apiBaseConfig.defaultHeaders = {};
            }
        },
    });

    // Helper methods
    $.fn.kviewsCollection = function (opts) {
        let options = {
            resourcetype: "collection"
        };

        if (typeof opts === "undefined") {
            opts = {};
        }
        if (typeof opts === "string") {
            opts = {
                url: opts,
            };
        }
        opts = Object.assign(opts, options);
        return this.kviews(opts);
    };

    $.fn.kviewsItem = function (opts) {
        let options = {
            resourcetype: "item"
        };

        if (typeof opts === "undefined") {
            opts = {};
        }
        if (typeof opts === "string") {
            opts = {
                url: opts,
            };
        }

        opts = Object.assign(opts, options);
        return this.kviews(opts);
    };

    
}

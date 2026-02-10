import { dbg, parseOptions, template } from './utils.js';
import { createURL } from './URL.js';
import { Collection } from './Collection.js';
import { Item } from './Item.js';
import { CollectionView } from './CollectionView.js';
import { ItemView } from './ItemView.js';
import { Filtering } from './Filtering.js';
import { utilities } from './utilities.js';

/**
 * Main KViews class - factory for creating Item and Collection instances
 */
export class KViews {
    constructor() {
        // Static properties
        KViews.baseUrl = null;
    }

    /**
     * Helper: Extract and merge options from element and parameters
     */
    static prepareOptions(el, opts) {
        if (!el) {
            dbg("Warning: no DOM element provided for apiator");
            return null;
        }

        // Handle string URL as options
        if (typeof opts === "string") {
            opts = {
                url: opts,
            };
        }

        // Extract data attributes from HTML element
        let options = { dataBindings: {}, addontop: false };
        
        if (typeof $ !== "undefined") {
            options = Object.assign(options, $(el).data());
        } else {
            // Fallback: read data-* attributes
            if (el.dataset) {
                Object.keys(el.dataset).forEach(key => {
                    try {
                        options[key] = JSON.parse(el.dataset[key]);
                    } catch (e) {
                        options[key] = el.dataset[key];
                    }
                });
            }
        }

        // Assign options passed as parameter
        try {
            Object.assign(options, parseOptions(opts));
        } catch (e) {
            throw new Error("Error on KViews init", e);
        }

        return options;
    }

    /**
     * Helper: Check for existing instance and update if found
     */
    static getOrUpdateInstance(el, options) {
        let existingInstance;
        if (typeof $ !== "undefined") {
            existingInstance = $(el).data("instance");
        } else {
            existingInstance = el._instance;
        }

        if (existingInstance !== undefined) {
            if (options.url) {
                existingInstance.setUrl(options.url);
                delete options.url;
            }

            Object.assign(existingInstance, parseOptions(options));
            return existingInstance;
        }

        return null;
    }

    /**
     * Helper: Handle emptyview option
     */
    static processEmptyView(options) {
        if (options.hasOwnProperty("emptyview")) {
            if (typeof $ !== "undefined") {
                options.emptyview = $(options.emptyview).remove();
            } else {
                let emptyViewEl = typeof options.emptyview === "string" 
                    ? document.querySelector(options.emptyview) 
                    : options.emptyview;
                if (emptyViewEl && emptyViewEl.parentNode) {
                    emptyViewEl.parentNode.removeChild(emptyViewEl);
                }
                options.emptyview = emptyViewEl;
            }
        }
    }

    /**
     * Helper: Attach listeners and finalize instance
     */
    static finalizeInstance(el, instance, options, listeners) {
        // Attach event listeners
        if (listeners) {
            Object.getOwnPropertyNames(listeners).forEach((eventName) => {
                instance.on(eventName, listeners[eventName]);
            });
        }

        // Store instance on element
        if (typeof $ !== "undefined") {
            $(el).data("instance", instance);
        } else {
            el._instance = instance;
        }

        dbg("instance", instance.url);

        // Auto-load if URL is provided
        if (instance.url && (typeof instance.dontload === "undefined" || !instance.dontload)) {
            instance.loadFromRemote();
        }

        return instance;
    }

    /**
     * Create collection instance
     */
    static createCollectionInstance(el, opts) {
        // Prepare options
        let options = KViews.prepareOptions(el, opts);
        if (!options) {
            return null;
        }

        // Check for existing instance
        let existingInstance = KViews.getOrUpdateInstance(el, options);
        if (existingInstance) {
            return existingInstance;
        }

        dbg("init apiator collection on ", el, options);

        // Handle emptyview
        KViews.processEmptyView(options);

        // Extract listeners
        let listeners = options.on;
        delete options.on;
        dbg("Create collection instance", options);

        let templateTxt = null;
        if (typeof $ !== "undefined") {
            templateTxt = $(el).length ? $(el).html() : null;
        } else {
            templateTxt = el.innerHTML;
        }

        // Handle template option
        if (options.template) {
            if (typeof $ !== "undefined" && options.template instanceof jQuery) {
                dbg("template is jQuery object", options.template, el);
                let $tpl = $(options.template).clone().removeAttr("id");
                templateTxt = $("<div>").append($tpl).html();
            } else if (typeof options.template === "string") {
                dbg("template is raw text: can be either a jQuery selector or raw HTML", options.template, el);
                if (typeof $ !== "undefined") {
                    templateTxt = $("<div>").append($(options.template).clone().removeAttr("id")).html();
                } else {
                    let tplEl = document.querySelector(options.template);
                    if (tplEl) {
                        let div = document.createElement("div");
                        div.appendChild(tplEl.cloneNode(true));
                        templateTxt = div.innerHTML;
                    }
                }
            }
        }

        // Process template text
        if (templateTxt !== null) {
            templateTxt = templateTxt
                .replace(/&lt;/gi, '<')
                .replace(/&gt;/gi, ">")
                .replace(/&apos;/gi, "'")
                .replace(/&quot;/gi, '"')
                .replace(/&nbsp;/gi, " ")
                .replace(/&amp;/gi, "&");
            options.template = template(templateTxt);
        }

        let collectionConfig = {
            el: el,
            itemsContainer: options.hasOwnProperty("container") 
                ? (typeof $ !== "undefined" ? $(options.container) : document.querySelector(options.container))
                : el,
            allowempty: options.disableempty !== true
        };

        options.view = new CollectionView(collectionConfig);

        let instance = new Collection(options);

        // Setup filtering
        if (options.hasOwnProperty("filter")) {
            let filterEl;
            if (typeof $ !== "undefined") {
                filterEl = $(options.filter);
                if (filterEl.length && filterEl.prop("tagName") === "FORM") {
                    instance.filtering = new Filtering(filterEl, instance);
                }
            } else {
                filterEl = typeof options.filter === "string" 
                    ? document.querySelector(options.filter) 
                    : options.filter;
                if (filterEl && filterEl.tagName === "FORM") {
                    instance.filtering = new Filtering(filterEl, instance);
                }
            }
        }

        // Finalize instance (attach listeners, store on element, auto-load)
        KViews.finalizeInstance(el, instance, options, listeners);

        return instance;
    }

    /**
     * Create item instance
     */
    static createItemInstance(el, opts, data=null) {
        // Prepare options
        let options = KViews.prepareOptions(el, opts);
        if (!options) {
            return null;
        }

        // Check for existing instance
        let existingInstance = KViews.getOrUpdateInstance(el, options);
        if (existingInstance) {
            return existingInstance;
        }

        dbg("init apiator item on ", el, options);

        // Handle emptyview
        KViews.processEmptyView(options);

        // Extract listeners
        let listeners = options.on;
        delete options.on;

        // Extract template
        options.template = null;
        let templateTxt = null;

        if (typeof $ !== "undefined") {
            if ($(el).length) {
                templateTxt = el[0] ? el[0].outerHTML : el.outerHTML;
            }
        } else {
            templateTxt = el.outerHTML;
        }

        if (templateTxt) {
            templateTxt = templateTxt
                .replace(/&lt;/gi, '<')
                .replace(/&gt;/gi, ">")
                .replace(/&apos;/gi, "'")
                .replace(/&quot;/gi, '"')
                .replace(/&nbsp;/gi, " ")
                .replace(/&amp;/gi, "&");
            options.template = template(templateTxt);
        }

        let elId = typeof $ !== "undefined" ? $(el).attr("id") : el.id;
        let instance = new Item(options, data).bindView(new ItemView({
            template: options.template,
            el: el,
            id: elId ? elId : null
        }));

        // Finalize instance (attach listeners, store on element, auto-load)
        KViews.finalizeInstance(el, instance, options, listeners);

        // If dontload is true, render immediately with current data (if any)
        if (options.dontload && instance.attributes && Object.keys(instance.attributes).length > 0) {
            instance.render();
        }

        return instance;
    }
    static helpers = utilities;
}

// Export static baseUrl
KViews.baseUrl = null;

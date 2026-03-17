import { dbg, log, parseOptions, uid, getBoundObjects, template } from './utils.js';

/**
 * ItemView class - handles rendering of individual items
 */
export class ItemView {
    constructor(params) {
        // params is actually an existing ItemView
        if (params && params.isView) {
            return params;
        }

        this.type = "ItemView";
        this.dataBindings = null;
        this.template = null;
        this.container = null;
        this.collectionView = null;
        this.item = null;
        this.el = null;
        this.id = uid();
        this.isView = true;

        this.callbacks = {};

        // Handle jQuery or DOM element
        if (params && (params.length || (params.nodeName && !params.jquery))) {
            dbg("params is actually a jquery object or an html node", params);
            let $el = $(params);
            if ($el.data("view")) {
                return $el.data("view");
            }

            let tmp = $("<div>").append($el.clone(true));
            let html = tmp.html()
                .replace(/&lt;%/gi, '<%')
                .replace(/&lt;/gi, '<')
                .replace(/%&gt;/gi, "%>")
                .replace(/&gt;/gi, '>')
                .replace(/&amp;/gi, "&");

            params = {
                template: template(html),
                el: $el
            };
            if ($el.attr("id")) {
                params.id = $el.attr("id");
            }
            tmp.remove();
        }

        try {
            params = parseOptions(params);
        } catch (e) {
            throw new Error("Error on ItemView", this, e);
        }

        Object.assign(this, params);

        if (this.el !== null) {
            this.dataBindings = getBoundObjects(this.el);
        }
    }

    /**
     * Event listener registration
     */
    on(event, cb) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(cb);
        return this;
    }

    /**
     * Unbind from item
     */
    unbind() {
        if (this.item) {
            this.item.unbindView(this);
        }
    }

    /**
     * Create element from template
     */
    createElementFromTemplate() {
        if (this.template == null) {
            dbg('Warning: no template defined. Nothing to render');
            return null;
        }

        if (!this.item) {
            dbg('Warning: no item bound to view. Cannot render template.');
            return null;
        }

        let el;
        try {
            // Use getRenderContext() to get safe render data without mutating item state
            const renderContext = this.item.getRenderContext();
            let html = this.template(renderContext);
            el = $(html)
                .attr("data-type", "item")
                .attr("id", this.id)
                .data("view", this)
                .data("instance", this.item);
        } catch (e) {
            dbg("Error create view from template", e, this.item);
            el = $("<div>Could not render view: <strong>" + e.toString() + "</strong></div>");
        }
        
        return el;

        // this.dataBindings = this.dataBindings || (this.item && this.item.collection && this.item.collection.view ? this.item.collection.view.dataBindings : {});

        // // Set data bindings
        // if (typeof $ !== "undefined" && el.jquery) {
        //     for (let key in this.dataBindings) {
        //         el.data(key, this.dataBindings[key]);
        //         el.find("*").data(key, this.dataBindings[key]);
        //     }
        //     el.data("instance", this.item);
        // }

        // return el;
    }

    /**
     * After render callback
     */
    afterrender() {
        
        if (!this.callbacks.afterrender) {
            return;
        }
        console.log("afterend of view", this);
        this.callbacks.afterrender.forEach((cb) => cb(this));
    }

    /**
     * Render the view
     */
    render(doNotAttachToContainer = false, addontop = false) {
        log("ItemView.render called", this.item, this.el);
        
        // Render element
        let renderedEl = this.createElementFromTemplate();
        // dbg("Rendered element:", renderedEl, "Original el:", this.el);
        
        if (!renderedEl) {
            // dbg("No rendered element, returning null");
            return null;
        }
        
        log("View item", this.item);
        if (this.item && this.item.uievents ) {
            log("UI events", this.item.uievents);
            this.item.uievents.forEach(action => {
                log("UI event", action, renderedEl);
                if (action.selector && action.event && action.callback) {
                    const actionEls =  $(renderedEl).find(action.selector);
                    log("UI event els", action, renderedEl, actionEls);
                    actionEls.on(action.event, (event) => {
                        event.preventDefault();
                        log("UIevent triggered", event, this.item, this);
                        action.callback(event,this.item, this);
                    });
                }
            });
        }
        

        if (doNotAttachToContainer) {
            this.el = renderedEl;
            return this.el;
        }

        // Replace already rendered element
        if (this.el) {
            let oldEl = this.el;
            // Normalize to jQuery
            if (!oldEl.jquery) {
                oldEl = $(oldEl);
            }
            // Clean up event listeners from old element before removing
            oldEl.off();
            this.el = $(renderedEl).insertBefore(oldEl);
            oldEl.remove();
            this.afterrender();
            return this;
        }

        this.el = renderedEl;
        this.afterrender();

        if (!this.container) {
            return this;
        }

        // Append to container
        $(this.el).appendTo(this.container.el);

        return this;
    }

    /**
     * Render empty state
     */
    renderEmpty(returnView) {
        if (this.item && this.item.emptyview && this.el) {
            let emptyView = $(this.item.emptyview).clone(true).css("display", "block");
            $(this.el).replaceWith(emptyView);
        }
    }

    /**
     * Remove view with animation
     */
    remove(idx) {
        return new Promise((resolve) => {
            if (this.item && this.item.collection) {
                this.item.collection._trigger('afterrender', this.item.collection);
            }

            if (this.el) {
                let $el = this.el.jquery ? this.el : $(this.el);
                $el.fadeOut({
                    complete: () => {
                        $el.remove();
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Destroy view and clean up resources
     * 
     * Removes event handlers, jQuery data, and DOM references
     */
    destroy() {
        // Clean up event handlers from element
        if (this.el) {
            const $el = this.el.jquery ? this.el : $(this.el);
            $el.off(); // Remove all jQuery event handlers
            $el.removeData(); // Remove jQuery data
        }

        // Clean up callbacks
        this.callbacks = {};

        // Unbind from item
        if (this.item) {
            this.item.unbindView(this);
        }

        // Clear references
        this.item = null;
        this.container = null;
        this.collectionView = null;
        this.el = null;
        this.template = null;
        this.dataBindings = null;

        return this;
    }
}

import { dbg, parseOptions, uid, getBoundObjects, template } from './utils.js';

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
        if (params && (params.length || params.nodeName)) {
            dbg("params is actually a jquery object or an html node", params);
            let $el;
            if (typeof $ !== "undefined") {
                $el = $(params);
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
            } else {
                // Fallback for non-jQuery
                let el = params.nodeName ? params : params[0];
                let html = el.outerHTML
                    .replace(/&lt;%/gi, '<%')
                    .replace(/&lt;/gi, '<')
                    .replace(/%&gt;/gi, "%>")
                    .replace(/&gt;/gi, '>')
                    .replace(/&amp;/gi, "&");

                params = {
                    template: template(html),
                    el: el
                };
                if (el.id) {
                    params.id = el.id;
                }
            }
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
            let data = this.item.attributes;
            if (this.item.relationships) {
                Object.assign(data, this.item.relationships);
            }
            let html = this.template(data);
            if (typeof $ !== "undefined") {
                el = $(html)
                    .attr("data-type", "item")
                    .attr("id", this.id)
                    .data("view", this)
                    .data("instance", this.item);
            } else {
                // Fallback without jQuery
                let div = document.createElement("div");
                div.innerHTML = html;
                el = div.firstElementChild || div;
                if (el) {
                    el.setAttribute("data-type", "item");
                    el.setAttribute("id", this.id);
                    el._view = this;
                    el._instance = this.item;
                }
            }
        } catch (e) {
            dbg("Error create view from template", e, this.item);
            if (typeof $ !== "undefined") {
                el = $("<div>Could not render view: <strong>" + e.toString() + "</strong></div>");
            } else {
                el = document.createElement("div");
                el.innerHTML = "Could not render view: <strong>" + e.toString() + "</strong>";
            }
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
        this.callbacks.afterrender.forEach((cb) => cb(this));
    }

    /**
     * Render the view
     */
    render(doNotAttachToContainer = false, addontop = false) {
        dbg("ItemView.render called", this.item, this.el);
        
        // Render element
        let renderedEl = this.createElementFromTemplate();
        // dbg("Rendered element:", renderedEl, "Original el:", this.el);
        
        if (!renderedEl) {
            // dbg("No rendered element, returning null");
            return null;
        }
        
        dbg("View item", this.item);
        if (!renderedEl) {
            return null;
        }
        if (this.item && this.item.uievents) {
            this.item.uievents.forEach(action => {
                // console.log("action", action, renderedEl);
                if (action.selector && action.event && action.callback) {
                    const actionEls =  $(renderedEl).find(action.selector);
                    // console.log("action", action, renderedEl, actionEls);
                    actionEls.on(action.event, (event) => {
                        event.preventDefault();
                        // console.log("event triggered", event, this.item, this);
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
            // Get the actual DOM element (handle both jQuery objects and DOM elements)
            let oldElDom = (typeof $ !== "undefined" && oldEl.jquery) ? oldEl[0] : oldEl;
            
            if (typeof $ !== "undefined") {
                // Use jQuery for manipulation
                if (oldEl.jquery) {
                    // oldEl is a jQuery object
                    this.el = $(renderedEl).insertBefore(oldEl);
                    oldEl.remove();
                } else {
                    // oldEl is a DOM element
                    this.el = $(renderedEl).insertBefore(oldEl);
                    $(oldEl).remove();
                }
            } else {
                // Pure DOM manipulation
                if (oldElDom && oldElDom.parentNode) {
                    oldElDom.parentNode.insertBefore(renderedEl, oldElDom);
                    oldElDom.parentNode.removeChild(oldElDom);
                }
                this.el = renderedEl;
            }
            this.afterrender();
            return this;
        }

        this.el = renderedEl;
        this.afterrender();

        if (!this.container) {
            return this;
        }

        // Append to container
        if (typeof $ !== "undefined") {
            $(this.el).appendTo(this.container.el);
        } else {
            if (this.container.el) {
                this.container.el.appendChild(this.el);
            }
        }

        return this;
    }

    /**
     * Render empty state
     */
    renderEmpty(returnView) {
        if (this.item && this.item.emptyview && this.el) {
            if (typeof $ !== "undefined") {
                let emptyView = $(this.item.emptyview).clone(true).css("display", "block");
                $(this.el).replaceWith(emptyView);
            } else {
                let emptyView = this.item.emptyview.cloneNode(true);
                emptyView.style.display = "block";
                if (this.el.parentNode) {
                    this.el.parentNode.replaceChild(emptyView, this.el);
                }
            }
        }
    }

    /**
     * Remove view with animation
     */
    remove(idx) {
        return new Promise((resolve) => {
            if (this.item && this.item.collection && this.item.collection.onafterrender) {
                this.item.collection.onafterrender(this.item.collection);
            }

            if (typeof $ !== "undefined" && this.el && this.el.jquery) {
                $(this.el).fadeOut({
                    complete: () => {
                        $(this.el).remove();
                        resolve();
                    }
                });
            } else if (this.el) {
                // Fallback without jQuery animation
                if (this.el.parentNode) {
                    this.el.parentNode.removeChild(this.el);
                }
                resolve();
            } else {
                resolve();
            }
        });
    }
}

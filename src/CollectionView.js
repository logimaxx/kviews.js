import { dbg, parseOptions, getBoundObjects } from './utils.js';

/**
 * CollectionView class - handles rendering of collections
 */
export class CollectionView {
    constructor(options = {}) {
        this.el = null;
        this.type = "CollectionView";
        this.container = null;
        this.collection = null;
        this.itemsContainer = null;
        this.allowempty = true;

        try {
            Object.assign(this, parseOptions(options));
        } catch (e) {
            throw new Error("Error on CollectionView init", e);
        }

        this.dataBindings = getBoundObjects(this.el);
    }

    /**
     * Reset the view
     */
    reset(force) {
        if (this.allowempty || force) {
            if (this.el) {
                $(this.el).empty();
            }
        }
        return this;
    }

    /**
     * Render the collection view
     * @private
     */
    _render() {
        dbg("Render _collectionView", this.collection);

        if (this.collection && this.collection.navtype === "page") {
            this.reset();
        }

        if (this.collection && this.collection.items.length === 0) {
            this.renderEmpty();
            return this;
        }

        if (this.collection) {
            this.collection.items.forEach((item) => {
                item.render(this);
            });
        }

        return this;
    }

    /**
     * Render empty state
     */
    renderEmpty() {
        if (!this.collection || !this.collection.emptyview) {
            return this;
        }

        this.reset();
        $(this.el).append(this.collection.emptyview);
        return this;
    }

    /**
     * Destroy view and clean up resources
     */
    destroy() {
        // Clean up DOM
        if (this.el) {
            const $el = $(this.el);
            $el.empty();
            $el.removeData();
        }

        // Clear references
        this.collection = null;
        this.el = null;
        this.container = null;
        this.itemsContainer = null;
        this.dataBindings = null;

        return this;
    }
}

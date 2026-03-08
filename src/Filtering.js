import { dbg } from './utils.js';

/**
 * Filtering class - handles filter form submission
 */
export class Filtering {
    constructor(filterForm, collection) {
        this.collection = collection;
        this.el = filterForm;

        let $form = $(filterForm);
        $form.data("instance", collection)
            .on("submit", (e) => {
                dbg("Filter form was submitted");
                e.preventDefault();
                this.handleSubmit($form[0]);
            })
            .on("reset", () => {
                delete this.collection.url.parameters.filter;
                this.collection.loadFromRemote();
                dbg("filter form reset");
            });
    }

    /**
     * Handle form submit
     */
    handleSubmit(form) {
        let filter = [];
        for (let i = 0; i < form.elements.length; i++) {
            let el = form.elements[i];
            let $el = $(el);
            let value = $el.val();
            let operator = $el.data("operator");

            if (el.name && value) {
                filter.push(
                    el.name + (operator ? operator : "=") + value
                );
            }
        }

        this.collection.offset = 0;
        if (filter.length) {
            this.collection.url.parameters.filter = filter.join(",");
        } else {
            delete this.collection.url.parameters.filter;
        }
        this.collection.loadFromRemote();
    }

    /**
     * Destroy filtering and clean up resources
     */
    destroy() {
        // Remove event handlers
        if (this.el) {
            const $form = $(this.el);
            $form.off("submit");
            $form.off("reset");
            // Remove jQuery data if available
            if (typeof $form.removeData === 'function') {
                $form.removeData("instance");
            }
        }

        // Clear references
        this.collection = null;
        this.el = null;

        return this;
    }
}

import { dbg } from './utils.js';

/**
 * Filtering class - handles filter form submission
 */
export class Filtering {
    constructor(filterForm, collection) {
        this.collection = collection;
        this.el = filterForm;

        // Normalize to jQuery or DOM element
        let $form;
        if (typeof $ !== "undefined") {
            $form = $(filterForm);
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
        } else {
            // Fallback without jQuery
            let form = filterForm.nodeName ? filterForm : filterForm[0];
            form._instance = collection;
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleSubmit(form);
            });
            form.addEventListener("reset", () => {
                delete this.collection.url.parameters.filter;
                this.collection.loadFromRemote();
                dbg("filter form reset");
            });
        }
    }

    /**
     * Handle form submit
     */
    handleSubmit(form) {
        let filter = [];
        for (let i = 0; i < form.elements.length; i++) {
            let el = form.elements[i];
            let value;
            let operator;

            if (typeof $ !== "undefined") {
                let $el = $(el);
                value = $el.val();
                operator = $el.data("operator");
            } else {
                value = el.value;
                operator = el.dataset ? el.dataset.operator : null;
            }

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
}

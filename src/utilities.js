import { dbg } from './utils.js';

/**
 * Utility functions for form handling and other operations
 */
export const utilities = {
    /**
     * Fill form fields with data from instance
     */
    fillForm: function (form, instance) {
        let formEl = $(form)[0];
        if ($(form).prop("tagName") !== "FORM") {
            return null;
        }

        if (!instance || !instance.hasOwnProperty("attributes")) {
            return null;
        }

        Object.getOwnPropertyNames(instance.attributes).forEach((attrName) => {
            if (!formEl.elements.hasOwnProperty(attrName)) {
                return;
            }
            let val = instance.attributes[attrName];
            let inp = formEl.elements[attrName];
            let $inp = $(inp);
            
            if (instance.attributes[attrName] && typeof instance.attributes[attrName] === "object" && instance.attributes[attrName].hasOwnProperty("id")) {
                val = instance.attributes[attrName].id;
            }
            if ($inp.attr('type') === 'date') {
                val = val ? val.substr(0, 10) : val;
            }
            $inp.val(val);
        });

        if (!instance.relationships) {
            return;
        }

        Object.getOwnPropertyNames(instance.relationships).forEach((relName) => {
            if (!formEl.elements.hasOwnProperty(relName)) {
                return;
            }

            if (!instance.relationships[relName]) {
                $(formEl.elements[relName]).val(null);
                return;
            }

            let rel = instance.relationships[relName];
            let formElRel = formEl.elements[relName];

            if (rel.constructor === Array) {
                let vals = [];
                rel.forEach((relItem) => {
                    vals.push(relItem.id);
                });
                $(formElRel).val(vals);
            } else {
                dbg("set ", relName, rel);
                if (formElRel.tagName === "SELECT") {
                    let lbl = $(formElRel).data("label");
                    let lblVal = rel.hasOwnProperty("attributes") && rel.attributes[lbl] ? rel.attributes[lbl] : rel.id;

                    $("<option>")
                        .val(rel.id)
                        .text(lblVal)
                        .appendTo($(formElRel));
                }
                $(formElRel).val(rel.id);
            }
        });
    },

    /**
     * Capture form submit event and redirect it to callback
     */
    captureFormSubmit: function (form, cb) {
        let formEl = $(form);
        if (formEl.prop("tagName") !== "FORM" || typeof cb !== "function") {
            return;
        }

        formEl.off("submit").on("submit", (event) => {
            event.preventDefault();
            let frm = formEl[0];
            cb(this.fetchFormData(frm), event);
        });
        return formEl;
    },

    /**
     * Fetch form data - handles array notation (name[]) and normalizes form element
     */
    fetchFormData: function (form) {
        // Normalize form element (handle jQuery, string selector, or DOM element)
        let formEl = $(form)[0];

        let formElements = {};
        Object.getOwnPropertyNames(formEl.elements).forEach((item) => {
            let el = formEl.elements[item];
            let $item = $(el);
            
            if (!$item.attr("name") || $item.attr("name") === "") {
                return;
            }
            if ($item.attr("type") === "checkbox" && !$item[0].checked) {
                return;
            }
            let name = $item.attr("name");
            let value = $item.val();

            // Handle array notation: name="field[]" creates formElements.field = [value1, value2, ...]
            let arrayMatch = /(\w+)\[\]/.exec(name);
            if (arrayMatch) {
                let arrayName = arrayMatch[1];
                if (!formElements[arrayName]) {
                    formElements[arrayName] = [];
                }
                formElements[arrayName].push(value);
            } else {
                // Regular field: name="field" creates formElements.field = value
                formElements[name] = value;
            }
        });
        return formElements;
    },

    /**
     * Extract form data - alias for fetchFormData (for backward compatibility)
     */
    extractFormData: function (form) {
        return this.fetchFormData(form);
    }
};

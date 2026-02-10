import { dbg } from './utils.js';

/**
 * Utility functions for form handling and other operations
 */
export const utilities = {
    /**
     * Fill form fields with data from instance
     */
    fillForm: function (form, instance) {
        let formEl;
        if (typeof $ !== "undefined") {
            formEl = $(form)[0];
            if ($(form).prop("tagName") !== "FORM") {
                return null;
            }
        } else {
            formEl = form.nodeName ? form : form[0];
            if (formEl.tagName !== "FORM") {
                return null;
            }
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

            if (typeof $ !== "undefined") {
                let $inp = $(inp);
                if (instance.attributes[attrName] && typeof instance.attributes[attrName] === "object" && instance.attributes[attrName].hasOwnProperty("id")) {
                    val = instance.attributes[attrName].id;
                }
                if ($inp.attr('type') === 'date') {
                    val = val ? val.substr(0, 10) : val;
                }
                $inp.val(val);
            } else {
                if (instance.attributes[attrName] && typeof instance.attributes[attrName] === "object" && instance.attributes[attrName].hasOwnProperty("id")) {
                    val = instance.attributes[attrName].id;
                }
                if (inp.type === 'date') {
                    val = val ? val.substr(0, 10) : val;
                }
                inp.value = val;
            }
        });

        if (!instance.relationships) {
            return;
        }

        Object.getOwnPropertyNames(instance.relationships).forEach((relName) => {
            if (!formEl.elements.hasOwnProperty(relName)) {
                return;
            }

            if (!instance.relationships[relName]) {
                if (typeof $ !== "undefined") {
                    $(formEl.elements[relName]).val(null);
                } else {
                    formEl.elements[relName].value = null;
                }
                return;
            }

            let rel = instance.relationships[relName];
            let formElRel = formEl.elements[relName];

            if (rel.constructor === Array) {
                let vals = [];
                rel.forEach((relItem) => {
                    vals.push(relItem.id);
                });
                if (typeof $ !== "undefined") {
                    $(formElRel).val(vals);
                } else {
                    if (formElRel.multiple) {
                        Array.from(formElRel.options).forEach(opt => {
                            opt.selected = vals.indexOf(opt.value) !== -1;
                        });
                    } else {
                        formElRel.value = vals[0] || null;
                    }
                }
            } else {
                dbg("set ", relName, rel);
                if (formElRel.tagName === "SELECT") {
                    let lbl = typeof $ !== "undefined" ? $(formElRel).data("label") : (formElRel.dataset ? formElRel.dataset.label : null);
                    let lblVal = rel.hasOwnProperty("attributes") && rel.attributes[lbl] ? rel.attributes[lbl] : rel.id;

                    if (typeof $ !== "undefined") {
                        $("<option>")
                            .val(rel.id)
                            .text(lblVal)
                            .appendTo($(formElRel));
                    } else {
                        let option = document.createElement("option");
                        option.value = rel.id;
                        option.textContent = lblVal;
                        formElRel.appendChild(option);
                    }
                }
                if (typeof $ !== "undefined") {
                    $(formElRel).val(rel.id);
                } else {
                    formElRel.value = rel.id;
                }
            }
        });
    },

    /**
     * Capture form submit event and redirect it to callback
     */
    captureFormSubmit: function (form, cb) {
        let formEl;
        if (typeof $ !== "undefined") {
            formEl = $(form);
            if (formEl.prop("tagName") !== "FORM" || typeof cb !== "function") {
                return;
            }

            formEl.off("submit").on("submit", (event) => {
                event.preventDefault();
                let frm = formEl[0];
                cb(this.fetchFormData(frm), event);
            });
            return formEl;
        } else {
            formEl = form.nodeName ? form : form[0];
            if (formEl.tagName !== "FORM" || typeof cb !== "function") {
                return;
            }

            formEl.addEventListener("submit", (event) => {
                event.preventDefault();
                cb(this.fetchFormData(formEl), event);
            });
            return formEl;
        }
    },

    /**
     * Fetch form data - handles array notation (name[]) and normalizes form element
     */
    fetchFormData: function (form) {
        // Normalize form element (handle jQuery, string selector, or DOM element)
        let formEl;
        if (typeof $ !== "undefined") {
            formEl = $(form)[0];
        } else {
            formEl = form.nodeName ? form : form[0];
        }

        let formElements = {};
        Object.getOwnPropertyNames(formEl.elements).forEach((item) => {
            let el = formEl.elements[item];
            let name, value;

            if (typeof $ !== "undefined") {
                let $item = $(el);
                if (!$item.attr("name") || $item.attr("name") === "") {
                    return;
                }
                if ($item.attr("type") === "checkbox" && !$item[0].checked) {
                    return;
                }
                name = $item.attr("name");
                value = $item.val();
            } else {
                if (!el.name || el.name === "") {
                    return;
                }
                if (el.type === "checkbox" && !el.checked) {
                    return;
                }
                name = el.name;
                value = el.value;
            }

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

import { dbg } from './utils.js';

/**
 * Paging class - handles pagination UI for collections
 */
export class Paging {
    constructor(pagingEl, collection) {
        this.collection = collection;
        
        // Normalize element (handle jQuery or DOM element)
        if (typeof $ !== "undefined") {
            this.el = $(pagingEl);
        } else {
            this.el = pagingEl.nodeName ? pagingEl : pagingEl[0];
        }


        // Link paging to collection
        this.collection.paging = this;

        // Initialize offset
        this.iniOffset = (this.collection.offset ? this.collection.offset : 0) * 1;

        // Default page size
        this.defaultPageSize = 20;
        this.pageSize = this.collection.pageSize;

        // Setup page size input
        this.setupPageSizeInput();

        // Setup offset input
        this.setupOffsetInput();

        // Extract button templates
        this.buttons = this.extractButtons();
        console.log("buttons", this.buttons);

        // Get total count element
        this.setupTotalCount();

        // Clear and prepare container
        this.render();
    }

    /**
     * Setup page size input handler
     */
    setupPageSizeInput() {
        let pageSizeInp;
        if (typeof $ !== "undefined") {
            pageSizeInp = $(this.collection.pagesizeinp);
            if (pageSizeInp.length) {
                this.collection.setPageSize(pageSizeInp.val());
                pageSizeInp.off("change").on("change", () => {
                    if (this.collection.setPageSize(pageSizeInp.val())) {
                        this.collection.loadFromRemote();
                    }
                });
            }
        } else {
            pageSizeInp = typeof this.collection.pagesizeinp === "string" 
                ? document.querySelector(this.collection.pagesizeinp)
                : this.collection.pagesizeinp;
            if (pageSizeInp) {
                this.collection.setPageSize(pageSizeInp.value);
                pageSizeInp.addEventListener("change", () => {
                    if (this.collection.setPageSize(pageSizeInp.value)) {
                        this.collection.loadFromRemote();
                    }
                });
            }
        }
    }

    /**
     * Setup offset input handler
     */
    setupOffsetInput() {
        let offsetInp;
        if (typeof $ !== "undefined") {
            offsetInp = $(this.collection.offsetinp);
            if (offsetInp.length) {
                this.collection.setOffset(offsetInp.val());
                offsetInp.off("change").on("change", () => {
                    if (this.collection.setOffset(offsetInp.val())) {
                        this.collection.loadFromRemote();
                    }
                });
            }
        } else {
            offsetInp = typeof this.collection.offsetinp === "string"
                ? document.querySelector(this.collection.offsetinp)
                : this.collection.offsetinp;
            if (offsetInp) {
                this.collection.setOffset(offsetInp.value);
                offsetInp.addEventListener("change", () => {
                    if (this.collection.setOffset(offsetInp.value)) {
                        this.collection.loadFromRemote();
                    }
                });
            }
        }
    }

    /**
     * Extract button templates from container
     */
    extractButtons() {
        let buttons = {};

        if (typeof $ !== "undefined") {
            // Clone and remove from DOM
            const pageBtn = $(this.el).find("[name=page]");
            if (pageBtn.length) {
                buttons.page = pageBtn.clone();
                pageBtn.remove();
            }

            const prevBtn = $(this.el).find("[name=prev]");
            if (prevBtn.length) {
                buttons.prev = prevBtn.clone();
                prevBtn.remove();
            }

            const nextBtn = $(this.el).find("[name=next]");
            if (nextBtn.length) {
                buttons.next = nextBtn.clone();
                nextBtn.remove();
            }

            const firstBtn = $(this.el).find("[name=first]");
            if (firstBtn.length) {
                buttons.first = firstBtn.clone();
                firstBtn.remove();
            }

            const lastBtn = $(this.el).find("[name=last]");
            if (lastBtn.length) {
                buttons.last = lastBtn.clone();
                lastBtn.remove();
            }
        } else {
            // Clone and remove from DOM
            const pageBtn = this.el.querySelector("[name=page]");
            if (pageBtn) {
                buttons.page = pageBtn.cloneNode(true);
                pageBtn.parentNode.removeChild(pageBtn);
            }

            const prevBtn = this.el.querySelector("[name=prev]");
            if (prevBtn) {
                buttons.prev = prevBtn.cloneNode(true);
                prevBtn.parentNode.removeChild(prevBtn);
            }

            const nextBtn = this.el.querySelector("[name=next]");
            if (nextBtn) {
                buttons.next = nextBtn.cloneNode(true);
                nextBtn.parentNode.removeChild(nextBtn);
            }

            const firstBtn = this.el.querySelector("[name=first]");
            if (firstBtn) {
                buttons.first = firstBtn.cloneNode(true);
                firstBtn.parentNode.removeChild(firstBtn);
            }

            const lastBtn = this.el.querySelector("[name=last]");
            if (lastBtn) {
                buttons.last = lastBtn.cloneNode(true);
                lastBtn.parentNode.removeChild(lastBtn);
            }
        }

        return buttons;
    }

    /**
     * Setup total count element
     */
    setupTotalCount() {
        if (typeof $ !== "undefined") {
            this.$totalCount = $(this.collection.totalrecscount);
        } else {
            this.totalCountEl = typeof this.collection.totalrecscount === "string"
                ? document.querySelector(this.collection.totalrecscount)
                : this.collection.totalrecscount;
        }
    }

    /**
     * Clear container
     */
    clearContainer() {
        if (typeof $ !== "undefined") {
            $(this.el).empty();
            $(this.el).find("[data-type=pages]").empty();
        } else {
            this.el.innerHTML = "";
            const pagesContainer = this.el.querySelector("[data-type=pages]");
            if (pagesContainer) {
                pagesContainer.innerHTML = "";
            }
        }
    }

    /**
     * Update total count display
     */
    updateTotalCount(total) {
        if (typeof $ !== "undefined" && this.$totalCount && this.$totalCount.length) {
            if (this.$totalCount[0].tagName === "INPUT") {
                this.$totalCount.val(total);
            } else {
                this.$totalCount.text(total);
            }
        } else if (this.totalCountEl) {
            if (this.totalCountEl.tagName === "INPUT") {
                this.totalCountEl.value = total;
            } else {
                this.totalCountEl.textContent = total;
            }
        }
    }

    /**
     * Create and append button element
     */
    appendButton(button, clickHandler, title) {
        let btn;
        if (typeof $ !== "undefined") {
            btn = button.clone();
            if (title !== undefined) {
                btn.attr("title", title);
            }
            btn.on("click", clickHandler);
            $(this.el).append(btn);
        } else {
            btn = button.cloneNode(true);
            if (title !== undefined) {
                btn.setAttribute("title", title);
            }
            btn.addEventListener("click", clickHandler);
            this.el.appendChild(btn);
        }
        return btn;
    }

    /**
     * Render pagination controls
     */
    render() {
        const pagesToShow = 5;
        const total = this.collection.total;

        console.log("Paging render", total, this.buttons);
        // Update total count
        this.updateTotalCount(total);

        // Clear container
        this.clearContainer();

        // Update initial offset
        this.iniOffset = this.collection.offset * 1;

        // Determine page size
        if (this.collection.pageSize) {
            this.pageSize = this.collection.pageSize;
        } else if (total - this.iniOffset - this.collection.items.length > 0) {
            this.pageSize = this.collection.items.length;
        } else {
            this.pageSize = this.defaultPageSize;
        }

        this.pageSize = this.pageSize * 1;
        console.log("Paging obj",this,this.pageSize,total)
        // Don't render if page size is larger than total
        if (this.pageSize > total) {
            return;
        }
        

        // Render first and prev buttons
        if (this.iniOffset > 0) {
            if (this.buttons.first) {
                this.appendButton(
                    this.buttons.first,
                    () => {
                        this.collection.setOffset(0);
                        this.collection.loadFromRemote();
                    },
                    0
                );
            }

            if (this.buttons.prev) {
                this.appendButton(
                    this.buttons.prev,
                    () => {
                        this.collection.setOffset(this.iniOffset - this.pageSize);
                        this.collection.loadFromRemote();
                    },
                    this.iniOffset - this.pageSize
                );
            }
        }

        // Calculate page range to show
        let lowerLimit = Math.floor(this.iniOffset / this.pageSize) - Math.floor(pagesToShow / 2);
        lowerLimit = lowerLimit < 0 ? 0 : lowerLimit;

        let upperLimit = Math.floor(this.iniOffset / this.pageSize) + Math.ceil(pagesToShow / 2);
        upperLimit = upperLimit * this.pageSize < total ? upperLimit : Math.ceil(total / this.pageSize);

        // Render page number buttons
        for (let i = lowerLimit; i < upperLimit; i++) {
            if (!this.buttons.page) {
                continue;
            }

            const pageOffset = i * this.pageSize;
            const isActive = Math.floor(this.iniOffset / this.pageSize) === i;

            let pageBtn;
            if (typeof $ !== "undefined") {
                pageBtn = this.buttons.page.clone();
                pageBtn.text(i + 1)
                    .attr("title", pageOffset)
                    .on("click", () => {
                        this.collection.setOffset(pageOffset);
                        this.collection.loadFromRemote();
                    });
                if (isActive) {
                    pageBtn.addClass("active").off("click");
                }
                $(this.el).append(pageBtn);
            } else {
                pageBtn = this.buttons.page.cloneNode(true);
                pageBtn.textContent = i + 1;
                pageBtn.setAttribute("title", pageOffset);
                if (isActive) {
                    pageBtn.classList.add("active");
                } else {
                    pageBtn.addEventListener("click", () => {
                        this.collection.setOffset(pageOffset);
                        this.collection.loadFromRemote();
                    });
                }
                this.el.appendChild(pageBtn);
            }
        }

        // Render next and last buttons
        const nxtOffset = this.iniOffset + this.pageSize;
        if (this.iniOffset + this.pageSize < total) {
            if (this.buttons.next) {
                this.appendButton(
                    this.buttons.next,
                    () => {
                        this.collection.setOffset(nxtOffset);
                        this.collection.loadFromRemote();
                    },
                    nxtOffset
                );
            }

            if (this.buttons.last) {
                const lastPageOffset = (Math.ceil(total / this.pageSize) - 1) * this.pageSize;
                console.log("last button", total, lastPageOffset,this.pageSize,this.offset);
                if(lastPageOffset>this.iniOffset*1) {
                    this.appendButton(
                        this.buttons.last,
                        () => {
                            this.collection.setOffset(lastPageOffset);
                            this.collection.loadFromRemote();
                        },
                        lastPageOffset
                    );
                }
            }
        }

        // Update offset input value
        let offsetInp;
        if (typeof $ !== "undefined") {
            offsetInp = $(this.collection.offsetinp);
            if (offsetInp.length) {
                offsetInp.val(this.iniOffset);
            }
        } else {
            offsetInp = typeof this.collection.offsetinp === "string"
                ? document.querySelector(this.collection.offsetinp)
                : this.collection.offsetinp;
            if (offsetInp) {
                offsetInp.value = this.iniOffset;
            }
        }
    }
}

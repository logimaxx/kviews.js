import { dbg, log } from './utils.js';

/**
 * Paging class - handles pagination UI for collections
 */
export class Paging {
    constructor(pagingEl, collection) {
        this.collection = collection;
        this.el = $(pagingEl);


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
        log("buttons", this.buttons);

        // Get total count element
        this.setupTotalCount();

        // Clear and prepare container
        this.render();
    }

    /**
     * Setup page size input handler
     */
    setupPageSizeInput() {
        let pageSizeInp = $(this.collection.pagesizeinp);
        if (pageSizeInp.length) {
            this.collection.setPageSize(pageSizeInp.val());
            pageSizeInp.off("change").on("change", () => {
                if (this.collection.setPageSize(pageSizeInp.val())) {
                    this.collection.loadFromRemote();
                }
            });
        }
    }

    /**
     * Setup offset input handler
     */
    setupOffsetInput() {
        let offsetInp = $(this.collection.offsetinp);
        if (offsetInp.length) {
            this.collection.setOffset(offsetInp.val());
            offsetInp.off("change").on("change", () => {
                if (this.collection.setOffset(offsetInp.val())) {
                    this.collection.loadFromRemote();
                }
            });
        }
    }

    /**
     * Extract button templates from container
     */
    extractButtons() {
        let buttons = {};

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

        return buttons;
    }

    /**
     * Setup total count element
     */
    setupTotalCount() {
        this.$totalCount = $(this.collection.totalrecscount);
    }

    /**
     * Clear container
     */
    clearContainer() {
        $(this.el).empty();
        $(this.el).find("[data-type=pages]").empty();
    }

    /**
     * Update total count display
     */
    updateTotalCount(total) {
        if (this.$totalCount && this.$totalCount.length) {
            if (this.$totalCount[0].tagName === "INPUT") {
                this.$totalCount.val(total);
            } else {
                this.$totalCount.text(total);
            }
        }
    }

    /**
     * Create and append button element
     */
    appendButton(button, clickHandler, title) {
        let btn = button.clone();
        if (title !== undefined) {
            btn.attr("title", title);
        }
        btn.on("click", clickHandler);
        $(this.el).append(btn);
        return btn;
    }

    /**
     * Render pagination controls
     */
    render() {
        const pagesToShow = 5;
        const total = this.collection.total;

        log("Paging render", total, this.buttons);
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
        log("Paging obj",this,this.pageSize,total)
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

            let pageBtn = this.buttons.page.clone();
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
                log("last button", total, lastPageOffset,this.pageSize,this.offset);
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
        let offsetInp = $(this.collection.offsetinp);
        if (offsetInp.length) {
            offsetInp.val(this.iniOffset);
        }
    }

    /**
     * Destroy paging and clean up resources
     */
    destroy() {
        // Remove event handlers from page size input
        if (this.collection && this.collection.pagesizeinp) {
            const pageSizeInp = $(this.collection.pagesizeinp);
            pageSizeInp.off("change");
        }

        // Remove event handlers from offset input
        if (this.collection && this.collection.offsetinp) {
            const offsetInp = $(this.collection.offsetinp);
            offsetInp.off("change");
        }

        // Clean up container
        if (this.el) {
            const $el = $(this.el);
            $el.empty();
            $el.off(); // Remove any remaining event handlers
            $el.removeData();
        }

        // Clear references
        this.collection = null;
        this.el = null;
        this.buttons = null;
        this.$totalCount = null;

        return this;
    }
}

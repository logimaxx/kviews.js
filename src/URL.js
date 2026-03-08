import { dbg } from './utils.js';
import { KViewsUrlError } from './errors.js';

/**
 * URL parsing and manipulation utility class
 * 
 * Wraps standard URL/URLSearchParams API for better reliability
 * while maintaining backward compatibility with existing API
 */
export class URL {
    constructor(url) {
        if (!url) {
            throw new KViewsUrlError("URL is not provided", { url: url });
        }

        // If already a URL instance, copy properties
        if (typeof url === "object" && url.hasOwnProperty("protocol")) {
            Object.assign(this, url);
            // Ensure parameters object has toString method
            if (this.parameters && !this.parameters.toString) {
                this._addParametersToString();
            }
            return;
        }

        if (url.constructor !== String) {
            dbg("URL is not a string", url);
            throw new KViewsUrlError("URL is not a string: " + url.toString(), { url: url });
        }

        // Check if URL is absolute (has protocol) or relative
        const isAbsolute = /^[a-z]+:\/\//i.test(url);
        
        if (isAbsolute && typeof window !== 'undefined' && window.URL) {
            // Use standard URL API for absolute URLs
            try {
                const standardUrl = new window.URL(url);
                this.protocol = standardUrl.protocol ? standardUrl.protocol.replace(':', '') : null;
                this.fqdn = standardUrl.hostname || null;
                this.port = standardUrl.port || null;
                this.path = standardUrl.pathname || null;
                this.fragment = standardUrl.hash ? standardUrl.hash.replace('#', '') : null;
                
                // Parse query parameters using URLSearchParams
                this.parameters = {};
                if (standardUrl.search) {
                    const params = new URLSearchParams(standardUrl.search);
                    params.forEach((value, key) => {
                        this.parameters[key] = value;
                    });
                }
            } catch (e) {
                // Fallback if standard URL API fails
                this._parseRelativeUrl(url);
            }
        } else {
            // Relative URL - use regex-based parsing
            this._parseRelativeUrl(url);
        }

        // Ensure parameters object has toString method
        this._addParametersToString();
    }

    /**
     * Parse relative URL using regex fallback
     * @private
     */
    _parseRelativeUrl(url) {
        // Improved regex that handles relative URLs better
        let regExp = /^((?:([a-z]+):)([\/]{2,3})([\w\.\-\_]+)(?::(\d+))?)?(?:(\/?[^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/i;
        let parts = regExp.exec(url);

        this.protocol = null;
        this.fqdn = null;
        this.port = null;
        this.path = null;
        this.parameters = {};
        this.fragment = null;

        if (typeof parts[2] !== "undefined") {
            this.protocol = parts[2];
        }
        if (typeof parts[4] !== "undefined") {
            this.fqdn = parts[4];
        }
        if (typeof parts[5] !== "undefined") {
            this.port = parts[5];
        }
        if (typeof parts[6] !== "undefined") {
            this.path = parts[6];
        }
        if (typeof parts[7] !== "undefined") {
            // Use URLSearchParams for query parsing when available
            try {
                const params = new URLSearchParams(parts[7]);
                params.forEach((value, key) => {
                    this.parameters[key] = value;
                });
            } catch (e) {
                // Fallback to manual parsing
                let tmp = parts[7].split("&");
                tmp.forEach((item) => {
                    if (!item || item === "") {
                        return;
                    }
                    let eqPos = item.indexOf("=");
                    if (eqPos === -1) {
                        this.parameters[item] = "";
                    } else {
                        this.parameters[item.substr(0, eqPos)] = decodeURIComponent(item.substr(eqPos + 1));
                    }
                });
            }
        }
        if (typeof parts[8] !== "undefined") {
            this.fragment = parts[8];
        }
    }

    /**
     * Add toString method to parameters object
     * @private
     */
    _addParametersToString() {
        if (!this.parameters.toString || this.parameters.toString === Object.prototype.toString) {
            const self = this;
            this.parameters.toString = function () {
                // Use URLSearchParams when available for proper encoding
                if (typeof URLSearchParams !== 'undefined') {
                    try {
                        const params = new URLSearchParams();
                        for (let para in this) {
                            if (this.hasOwnProperty(para) && para !== "toString") {
                                params.append(para, String(this[para]));
                            }
                        }
                        return params.toString();
                    } catch (e) {
                        // Fallback to manual encoding
                    }
                }
                
                // Fallback to manual encoding
                let paras = [];
                for (let para in this) {
                    if (this.hasOwnProperty(para) && para !== "toString") {
                        const value = String(this[para]);
                        paras.push(encodeURIComponent(para) + "=" + encodeURIComponent(value));
                    }
                }
                return paras.join("&");
            };
        }
    }

    toString() {
        let str = "";
        
        // Build absolute URL part if present
        if (this.protocol && this.fqdn) {
            // Absolute URL - use standard URL API when available for proper encoding
            if (typeof window !== 'undefined' && window.URL) {
                try {
                    const baseUrl = this.protocol + "://" + this.fqdn + (this.port ? ":" + this.port : "");
                    const url = new window.URL(this.path || "/", baseUrl);
                    
                    // Set query parameters
                    if (this.parameters && Object.keys(this.parameters).length > 0) {
                        Object.getOwnPropertyNames(this.parameters).forEach(key => {
                            if (key !== "toString") {
                                url.searchParams.set(key, this.parameters[key]);
                            }
                        });
                    }
                    
                    // Set fragment
                    if (this.fragment) {
                        url.hash = this.fragment;
                    }
                    
                    return url.toString();
                } catch (e) {
                    // Fallback to manual construction if URL API fails
                }
            }
            
            // Manual construction for absolute URLs
            str += this.protocol + "://" + this.fqdn;
            if (this.port) {
                str += ":" + this.port;
            }
        }

        // Add path (for both absolute and relative URLs)
        if (this.path) {
            str += this.path;
        }
        
        // Add query parameters
        if (this.parameters && Object.keys(this.parameters).length > 0) {
            str += "?" + this.parameters.toString();
        }
        
        // Add fragment
        if (this.fragment) {
            str += "#" + this.fragment;
        }
        
        return str;
    }
}

/**
 * Factory function for backward compatibility
 */
export function createURL(url) {
    return new URL(url);
}

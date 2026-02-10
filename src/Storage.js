import { parseOptions } from './utils.js';

/**
 * Storage class for HTTP operations
 */
export class Storage {
    constructor(options = {}) {
        let defaultOptions = {
            url: null,
            method: "GET"
        };

        options = parseOptions(options);
        Object.assign(defaultOptions, options);
        this.defaultOptions = defaultOptions;
    }

    /**
     * Base sync method - uses Fetch API
     */
    sync(options) {
        // Ensure URL is a string (convert URL objects)
        if (options.url && typeof options.url === "object" && options.url.toString) {
            options.url = options.url.toString();
        }
        
        if (typeof KViews !== "undefined" && KViews.baseUrl) {
            options.url = KViews.baseUrl + options.url;
        }
        options = Object.assign(
            Object.assign({}, this.defaultOptions),
            parseOptions(options)
        );

        if (!options.hasOwnProperty("url")) {
            throw new Error("No URL provided");
        }
        
        // Final check - ensure URL is a string
        if (options.url && typeof options.url === "object" && options.url.toString) {
            options.url = options.url.toString();
        }

        // Build fetch options
        const fetchOptions = {
            method: options.method || "GET",
            headers: {}
        };

        // Set headers
        if (options.headers) {
            Object.assign(fetchOptions.headers, options.headers);
        }

        // Set Content-Type header
        if (options.contentType) {
            fetchOptions.headers['Content-Type'] = options.contentType;
        }

        // Set request body for methods that support it
        if (options.data && ['POST', 'PUT', 'PATCH'].includes(fetchOptions.method)) {
            fetchOptions.body = options.data;
        }

        // Make the request using Fetch API
        return fetch(options.url, fetchOptions)
            .then(async response => {
                // Create a response object that mimics jQuery's jqXHR structure
                const jqXHR = {
                    status: response.status,
                    statusText: response.statusText,
                    responseText: null,
                    responseJSON: null,
                    getAllResponseHeaders: () => {
                        const headers = {};
                        response.headers.forEach((value, key) => {
                            headers[key] = value;
                        });
                        return Object.entries(headers)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\r\n');
                    },
                    getResponseHeader: (name) => {
                        return response.headers.get(name);
                    }
                };

                // Read response body once (can only be read once)
                const text = await response.text();
                
                // Try to parse as JSON
                let data = text;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    // Not JSON, use text as-is
                }
                
                jqXHR.responseText = text;
                jqXHR.responseJSON = typeof data === 'object' ? data : null;

                // Check if response is ok (status 200-299)
                if (!response.ok) {
                    throw {
                        options: options,
                        jqXHR: jqXHR,
                        textStatus: 'error',
                        errorThrown: new Error(`HTTP ${response.status}: ${response.statusText}`)
                    };
                }

                // Successful response
                return {
                    data: data,
                    textStatus: 'success',
                    jqXHR: jqXHR
                };
            })
            .catch(error => {
                // Handle network errors or other fetch failures
                const jqXHR = {
                    status: 0,
                    statusText: 'error',
                    responseText: null,
                    responseJSON: null,
                    getAllResponseHeaders: () => '',
                    getResponseHeader: () => null
                };

                // If error was thrown from response handling, re-throw it
                if (error.jqXHR) {
                    throw error;
                }

                // Network or other error
                throw {
                    options: options,
                    jqXHR: jqXHR,
                    textStatus: 'error',
                    errorThrown: error instanceof Error ? error : new Error(String(error))
                };
            });
    }

    /**
     * Create (POST) operation
     */
    create(ctx, url, opts, data) {
        let options = {
            context: ctx,
            url: url,
            method: "POST",
            data: data
        };
        Object.assign(options, opts);
        return this.sync(options);
    }

    /**
     * Read (GET) operation
     */
    read(ctx, url, opts) {
        let options = {
            context: ctx,
            url: url,
            method: "GET"
        };
        Object.assign(options, opts);
        return this.sync(options);
    }

    /**
     * Delete (DELETE) operation
     */
    delete(ctx, url, opts) {
        let options = {
            context: ctx,
            url: url,
            method: "DELETE"
        };
        Object.assign(options, opts);
        return this.sync(options);
    }

    /**
     * Update (PATCH) operation
     */
    update(ctx, url, opts, data) {
        let options = {
            context: ctx,
            url: url,
            method: "PATCH",
            contentType: "application/vnd.api+json",
            data: data
        };
        Object.assign(options, opts);
        return this.sync(options);
    }
}

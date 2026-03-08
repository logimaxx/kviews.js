/**
 * KViews Error Classes
 * 
 * Custom error hierarchy for KViews operations
 */

/**
 * Base error class for all KViews errors
 */
export class KViewsError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = 'KViewsError';
        this.options = options.options || {};
        this.context = options.context || null;
        
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * HTTP-related errors
 */
export class KViewsHttpError extends KViewsError {
    constructor(message, options = {}) {
        super(message, options);
        this.name = 'KViewsHttpError';
        this.status = options.status || 0;
        this.statusText = options.statusText || 'error';
        this.responseText = options.responseText || null;
        this.responseJSON = options.responseJSON || null;
        this.jqXHR = options.jqXHR || null;
        this.textStatus = options.textStatus || 'error'; // For backward compatibility
        this.errorThrown = options.errorThrown || null;
    }
}

/**
 * JSON:API parsing errors
 */
export class KViewsParseError extends KViewsError {
    constructor(message, options = {}) {
        super(message, options);
        this.name = 'KViewsParseError';
        this.rawData = options.rawData || null;
        this.parseStep = options.parseStep || null;
    }
}

/**
 * URL-related errors
 */
export class KViewsUrlError extends KViewsError {
    constructor(message, options = {}) {
        super(message, options);
        this.name = 'KViewsUrlError';
        this.url = options.url || null;
    }
}

/**
 * Network/fetch errors (distinct from HTTP errors)
 */
export class KViewsNetworkError extends KViewsError {
    constructor(message, options = {}) {
        super(message, options);
        this.name = 'KViewsNetworkError';
        this.originalError = options.originalError || null;
        this.url = options.url || null;
    }
}

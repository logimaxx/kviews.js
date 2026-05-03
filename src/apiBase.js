/**
 * Default base URL/path prepended to relative request URLs in Storage.sync.
 * Set via KViews.baseUrl (full origin or any prefix) or KViews.basePath (alias).
 * If both are set, baseUrl takes precedence.
 *
 * defaultHeaders: merged into every fetch (lowest precedence). Override per instance
 * with options.headers, or per request via Storage.sync options.
 */
export const apiBaseConfig = {
    baseUrl: null,
    basePath: null,
    defaultHeaders: {},
};

/**
 * @param {string} url
 * @returns {string}
 */
export function resolveRequestUrl(url) {
    if (url == null || url === "") {
        return url;
    }
    const s = typeof url === "string" ? url : String(url);
    if (/^https?:\/\//i.test(s) || s.startsWith("//")) {
        return s;
    }
    const base = apiBaseConfig.baseUrl || apiBaseConfig.basePath || "";
    if (!base) {
        return s;
    }
    const baseNorm = base.replace(/\/+$/, "");
    const pathNorm = s.replace(/^\/+/, "");
    if (!pathNorm) {
        return baseNorm + "/";
    }
    return baseNorm + "/" + pathNorm;
}

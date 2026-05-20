/*!
 * KViews - Class-based API data binding library
 * Version: 1.2.0
 * Built: 2026-05-20T07:51:23.396Z
 */
var KViews = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    Collection: () => Collection,
    CollectionView: () => CollectionView,
    Filtering: () => Filtering,
    Item: () => Item,
    ItemView: () => ItemView,
    JsonApiAdapter: () => JsonApiAdapter,
    KViews: () => KViews,
    Paging: () => Paging,
    PlainRestAdapter: () => PlainRestAdapter,
    Sorting: () => Sorting,
    Storage: () => Storage,
    URL: () => URL,
    createOverlay: () => createOverlay,
    createURL: () => createURL,
    dbg: () => dbg,
    deepmerge: () => deepmerge,
    default: () => index_default,
    error: () => error,
    getBoundObjects: () => getBoundObjects,
    getDefaultAdapter: () => getDefaultAdapter,
    log: () => log,
    parseOptions: () => parseOptions,
    registerAdapter: () => registerAdapter,
    resolveAdapter: () => resolveAdapter,
    setDefaultAdapter: () => setDefaultAdapter,
    template: () => template,
    trace: () => trace,
    uid: () => uid,
    utilities: () => utilities
  });

  // src/utils.js
  function dbg() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel >= 3) {
      console.trace(...arguments);
    }
  }
  function log() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel >= 2) {
      console.log(...arguments);
    }
  }
  function error() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel >= 1) {
      console.error(...arguments);
    }
  }
  function trace() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel >= 4) {
      console.trace(...arguments);
    }
  }
  function uid() {
    return "uid_" + Math.random().toString(36).substr(2, 9);
  }
  function parseOptions(options) {
    if (typeof options === "undefined") {
      return {};
    }
    if (options.constructor === Object) {
      return options;
    }
    throw new Error("Invalid options", options);
  }
  function deepmerge(target, source, optionsArgument) {
    function defaultArrayMerge(target2, source2, optionsArgument2) {
      let destination = target2.slice();
      source2.forEach(function(e, i) {
        if (typeof destination[i] === "undefined") {
          destination[i] = cloneIfNecessary(e, optionsArgument2);
        } else if (isMergeableObject(e)) {
          destination[i] = deepmerge(target2[i], e, optionsArgument2);
        } else if (target2.indexOf(e) === -1) {
          destination.push(cloneIfNecessary(e, optionsArgument2));
        }
      });
      return destination;
    }
    function isMergeableObject(val) {
      var nonNullObject = val && typeof val === "object";
      return nonNullObject && Object.prototype.toString.call(val) !== "[object RegExp]" && Object.prototype.toString.call(val) !== "[object Date]";
    }
    function emptyTarget(val) {
      return Array.isArray(val) ? [] : {};
    }
    function cloneIfNecessary(value, optionsArgument2) {
      let clone = optionsArgument2 && optionsArgument2.clone === true;
      return clone && isMergeableObject(value) ? deepmerge(emptyTarget(value), value, optionsArgument2) : value;
    }
    function mergeObject(target2, source2, optionsArgument2) {
      let destination = {};
      if (isMergeableObject(target2)) {
        Object.keys(target2).forEach(function(key) {
          destination[key] = cloneIfNecessary(target2[key], optionsArgument2);
        });
      }
      Object.keys(source2).forEach(function(key) {
        if (!isMergeableObject(source2[key]) || !target2[key]) {
          destination[key] = cloneIfNecessary(source2[key], optionsArgument2);
        } else {
          destination[key] = deepmerge(target2[key], source2[key], optionsArgument2);
        }
      });
      return destination;
    }
    let array = Array.isArray(source);
    let options = optionsArgument || { arrayMerge: defaultArrayMerge };
    let arrayMerge = options.arrayMerge || defaultArrayMerge;
    if (array) {
      return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument);
    } else {
      return mergeObject(target, source, optionsArgument);
    }
  }
  deepmerge.all = function deepmergeAll(array, optionsArgument) {
    if (!Array.isArray(array) || array.length < 2) {
      throw new Error("first argument should be an array with at least two elements");
    }
    return array.reduce(function(prev, next) {
      return deepmerge(prev, next, optionsArgument);
    });
  };
  function getBoundObjects(el) {
    let db = {};
    if (!el || $(el).length === 0) {
      return db;
    }
    let boundData = $(el).data();
    for (let key in boundData) {
      if (typeof boundData[key] === "object" && key !== "instance") {
        db[key] = boundData[key];
      }
    }
    return db;
  }
  function template(text) {
    if (typeof Handlebars !== "undefined") {
      return Handlebars.compile(text);
    }
    throw new Error("Handlebars is required for template compilation");
  }
  function createOverlay(instance) {
    return $(document.createElement("div")).text("Se incarca 123").addClass("komponent-overlay").data("asd", instance).attr(
      "style",
      "background: linear-gradient(135deg,rgb(191, 225, 205),rgb(236, 234, 232) 70%, #fca); text-align: center; position:absolute; z-index:100000;"
    );
  }

  // src/apiBase.js
  var apiBaseConfig = {
    baseUrl: null,
    basePath: null,
    defaultHeaders: {}
  };
  function resolveRequestUrl(url) {
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

  // src/errors.js
  var KViewsError = class extends Error {
    constructor(message, options = {}) {
      super(message);
      this.name = "KViewsError";
      this.options = options.options || {};
      this.context = options.context || null;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  };
  var KViewsHttpError = class extends KViewsError {
    constructor(message, options = {}) {
      super(message, options);
      this.name = "KViewsHttpError";
      this.status = options.status || 0;
      this.statusText = options.statusText || "error";
      this.responseText = options.responseText || null;
      this.responseJSON = options.responseJSON || null;
      this.jqXHR = options.jqXHR || null;
      this.textStatus = options.textStatus || "error";
      this.errorThrown = options.errorThrown || null;
    }
  };
  var KViewsParseError = class extends KViewsError {
    constructor(message, options = {}) {
      super(message, options);
      this.name = "KViewsParseError";
      this.rawData = options.rawData || null;
      this.parseStep = options.parseStep || null;
    }
  };
  var KViewsUrlError = class extends KViewsError {
    constructor(message, options = {}) {
      super(message, options);
      this.name = "KViewsUrlError";
      this.url = options.url || null;
    }
  };
  var KViewsNetworkError = class extends KViewsError {
    constructor(message, options = {}) {
      super(message, options);
      this.name = "KViewsNetworkError";
      this.originalError = options.originalError || null;
      this.url = options.url || null;
    }
  };

  // src/URL.js
  var URL = class {
    constructor(url) {
      if (!url) {
        throw new KViewsUrlError("URL is not provided", { url });
      }
      if (typeof url === "object" && url.hasOwnProperty("protocol")) {
        Object.assign(this, url);
        if (this.parameters && !this.parameters.toString) {
          this._addParametersToString();
        }
        return;
      }
      if (url.constructor !== String) {
        dbg("URL is not a string", url);
        throw new KViewsUrlError("URL is not a string: " + url.toString(), { url });
      }
      const isAbsolute = /^[a-z]+:\/\//i.test(url);
      if (isAbsolute && typeof window !== "undefined" && window.URL) {
        try {
          const standardUrl = new window.URL(url);
          this.protocol = standardUrl.protocol ? standardUrl.protocol.replace(":", "") : null;
          this.fqdn = standardUrl.hostname || null;
          this.port = standardUrl.port || null;
          this.path = standardUrl.pathname || null;
          this.fragment = standardUrl.hash ? standardUrl.hash.replace("#", "") : null;
          this.parameters = {};
          if (standardUrl.search) {
            const params = new URLSearchParams(standardUrl.search);
            params.forEach((value, key) => {
              this.parameters[key] = value;
            });
          }
        } catch (e) {
          this._parseRelativeUrl(url);
        }
      } else {
        this._parseRelativeUrl(url);
      }
      this._addParametersToString();
    }
    /**
     * Parse relative URL using regex fallback
     * @private
     */
    _parseRelativeUrl(url) {
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
        try {
          const params = new URLSearchParams(parts[7]);
          params.forEach((value, key) => {
            this.parameters[key] = value;
          });
        } catch (e) {
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
        this.parameters.toString = function() {
          if (typeof URLSearchParams !== "undefined") {
            try {
              const params = new URLSearchParams();
              for (let para in this) {
                if (this.hasOwnProperty(para) && para !== "toString") {
                  params.append(para, String(this[para]));
                }
              }
              return params.toString();
            } catch (e) {
            }
          }
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
      if (this.protocol && this.fqdn) {
        if (typeof window !== "undefined" && window.URL) {
          try {
            const baseUrl = this.protocol + "://" + this.fqdn + (this.port ? ":" + this.port : "");
            const url = new window.URL(this.path || "/", baseUrl);
            if (this.parameters && Object.keys(this.parameters).length > 0) {
              Object.getOwnPropertyNames(this.parameters).forEach((key) => {
                if (key !== "toString") {
                  url.searchParams.set(key, this.parameters[key]);
                }
              });
            }
            if (this.fragment) {
              url.hash = this.fragment;
            }
            return url.toString();
          } catch (e) {
          }
        }
        str += this.protocol + "://" + this.fqdn;
        if (this.port) {
          str += ":" + this.port;
        }
      }
      if (this.path) {
        str += this.path;
      }
      if (this.parameters && Object.keys(this.parameters).length > 0) {
        str += "?" + this.parameters.toString();
      }
      if (this.fragment) {
        str += "#" + this.fragment;
      }
      return str;
    }
  };
  function createURL(url) {
    return new URL(url);
  }

  // src/Storage.js
  var Storage = class {
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
      if (options.url && typeof options.url === "object" && options.url.toString) {
        options.url = options.url.toString();
      }
      options.url = resolveRequestUrl(options.url);
      options = Object.assign(
        Object.assign({}, this.defaultOptions),
        parseOptions(options)
      );
      const globalHeaders = apiBaseConfig.defaultHeaders && typeof apiBaseConfig.defaultHeaders === "object" ? apiBaseConfig.defaultHeaders : {};
      const defaultHeaders = this.defaultOptions.headers && typeof this.defaultOptions.headers === "object" ? this.defaultOptions.headers : {};
      const requestHeaders = options.headers && typeof options.headers === "object" ? options.headers : {};
      options.headers = Object.assign({}, globalHeaders, defaultHeaders, requestHeaders);
      if (!options.hasOwnProperty("url")) {
        throw new Error("No URL provided");
      }
      if (options.url && typeof options.url === "object" && options.url.toString) {
        options.url = options.url.toString();
      }
      const fetchOptions = {
        method: options.method || "GET",
        headers: {}
      };
      if (options.headers) {
        Object.assign(fetchOptions.headers, options.headers);
      }
      if (options.contentType) {
        fetchOptions.headers["Content-Type"] = options.contentType;
      }
      if (options.data && ["POST", "PUT", "PATCH"].includes(fetchOptions.method)) {
        fetchOptions.body = options.data;
      }
      return fetch(options.url, fetchOptions).catch((fetchError) => {
        throw new KViewsNetworkError(
          fetchError instanceof Error ? fetchError.message : String(fetchError),
          {
            originalError: fetchError instanceof Error ? fetchError : new Error(String(fetchError)),
            url: options.url,
            options
          }
        );
      }).then(async (response) => {
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
            return Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join("\r\n");
          },
          getResponseHeader: (name) => {
            return response.headers.get(name);
          }
        };
        const text = await response.text();
        let data = text;
        try {
          data = JSON.parse(text);
        } catch (e) {
        }
        jqXHR.responseText = text;
        jqXHR.responseJSON = typeof data === "object" ? data : null;
        if (!response.ok) {
          const error2 = new KViewsHttpError(
            `HTTP ${response.status}: ${response.statusText}`,
            {
              status: response.status,
              statusText: response.statusText,
              responseText: text,
              responseJSON: typeof data === "object" ? data : null,
              jqXHR,
              options,
              errorThrown: new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
          );
          error2.textStatus = "error";
          throw error2;
        }
        return {
          data,
          textStatus: "success",
          jqXHR
        };
      }).catch((error2) => {
        if (error2 instanceof KViewsHttpError || error2 instanceof KViewsNetworkError) {
          throw error2;
        }
        const jqXHR = {
          status: 0,
          statusText: "error",
          responseText: null,
          responseJSON: null,
          getAllResponseHeaders: () => "",
          getResponseHeader: () => null
        };
        const httpError = new KViewsHttpError(
          error2 instanceof Error ? error2.message : String(error2),
          {
            status: 0,
            statusText: "error",
            responseText: null,
            responseJSON: null,
            jqXHR,
            options,
            errorThrown: error2 instanceof Error ? error2 : new Error(String(error2))
          }
        );
        httpError.textStatus = "error";
        throw httpError;
      });
    }
    /**
     * Create (POST) operation
     */
    create(ctx, url, opts, data) {
      let options = {
        context: ctx,
        url,
        method: "POST",
        data
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
        url,
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
        url,
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
        url,
        method: "PATCH",
        contentType: "application/vnd.api+json",
        data
      };
      Object.assign(options, opts);
      return this.sync(options);
    }
  };

  // src/dataParser.js
  function getIncludedResources(doc) {
    if (!doc || typeof doc !== "object") {
      return [];
    }
    const includedData = doc.hasOwnProperty("included") ? doc.included : doc.hasOwnProperty("includes") ? doc.includes : null;
    if (!includedData) {
      return [];
    }
    if (!Array.isArray(includedData)) {
      return [];
    }
    return includedData;
  }
  function buildResourceIndex(doc) {
    const index = /* @__PURE__ */ new Map();
    if (!doc || typeof doc !== "object") {
      return index;
    }
    function indexResource(resource) {
      if (!resource || typeof resource !== "object") {
        return;
      }
      if (!resource.type || !resource.id) {
        return;
      }
      const key = `${resource.type}/${resource.id}`;
      if (!index.has(key)) {
        index.set(key, resource);
      }
    }
    if (doc.data) {
      if (Array.isArray(doc.data)) {
        doc.data.forEach(indexResource);
      } else if (typeof doc.data === "object") {
        indexResource(doc.data);
      }
    }
    const included = getIncludedResources(doc);
    included.forEach(indexResource);
    return index;
  }
  function getResourceFromIndex(typeOrRef, id, resourceIndex) {
    let type, resourceId;
    if (typeof typeOrRef === "object" && typeOrRef !== null) {
      type = typeOrRef.type;
      resourceId = typeOrRef.id;
    } else {
      type = typeOrRef;
      resourceId = id;
    }
    if (!type || !resourceId) {
      return null;
    }
    const key = `${type}/${resourceId}`;
    return resourceIndex.get(key) || null;
  }
  function hydrateResource(resource, resourceIndex, visited = /* @__PURE__ */ new Set()) {
    if (!resource || typeof resource !== "object") {
      return resource;
    }
    if (!resource.relationships) {
      return resource;
    }
    const resourceKey = resource.type && resource.id ? `${resource.type}/${resource.id}` : null;
    if (resourceKey && visited.has(resourceKey)) {
      return resource;
    }
    if (resourceKey) {
      visited.add(resourceKey);
    }
    Object.keys(resource.relationships).forEach((relName) => {
      const rel = resource.relationships[relName];
      if (rel === null) {
        return;
      }
      if (rel.data !== void 0) {
        if (rel.data === null) {
          resource.relationships[relName] = null;
        } else if (Array.isArray(rel.data)) {
          resource.relationships[relName] = rel.data.map((ref) => {
            const hydrated = getResourceFromIndex(ref, null, resourceIndex);
            if (hydrated) {
              return hydrateResource(
                hydrated,
                // Use same object instance from index
                resourceIndex,
                new Set(visited)
                // New visited set for each branch
              );
            }
            return ref;
          }).filter((r) => r !== null);
        } else if (typeof rel.data === "object" && rel.data.type && rel.data.id) {
          const hydrated = getResourceFromIndex(rel.data, null, resourceIndex);
          if (hydrated) {
            resource.relationships[relName] = hydrateResource(
              hydrated,
              // Use same object instance from index
              resourceIndex,
              new Set(visited)
              // New visited set for each branch
            );
          } else {
            resource.relationships[relName] = rel.data;
          }
        } else {
          resource.relationships[relName] = rel.data;
        }
      } else {
        resource.relationships[relName] = rel;
      }
    });
    return resource;
  }
  function hydrateDocumentData(doc) {
    if (!doc || typeof doc !== "object") {
      throw new KViewsParseError("Invalid document: must be an object");
    }
    const resourceIndex = buildResourceIndex(doc);
    if (!doc.data) {
      return null;
    }
    const data = doc.data;
    if (Array.isArray(data)) {
      data.forEach((resource) => hydrateResource(resource, resourceIndex));
      return data;
    } else if (typeof data === "object") {
      return hydrateResource(data, resourceIndex);
    }
    return data;
  }
  function parseItemData(data, options = {}) {
    let hydratedResource;
    let doc = data;
    if (data && typeof data === "object" && data.type && data.id && !data.data) {
      hydratedResource = data;
    } else if (data && data.data) {
      doc = data;
      hydratedResource = hydrateDocumentData(doc);
    } else {
      hydratedResource = data;
    }
    if (!hydratedResource || typeof hydratedResource !== "object") {
      throw new KViewsParseError("Invalid item data: must be an object");
    }
    if (doc && doc.links && doc.links.self && !hydratedResource.url) {
      hydratedResource.url = createURL(doc.links.self);
    }
    return hydratedResource;
  }
  function parseCollectionData(doc) {
    if (!doc || typeof doc !== "object") {
      return [];
    }
    const hydratedData = hydrateDocumentData(doc);
    if (!hydratedData) {
      return [];
    }
    if (!Array.isArray(hydratedData)) {
      return [hydratedData];
    }
    return hydratedData;
  }
  function parseDataForInsertOrUpdate(itemData) {
    if (itemData === null) {
      return null;
    }
    if (typeof itemData !== "object") {
      throw new Error("Invalid item data: " + itemData);
    }
    if (itemData.constructor === Array || itemData.hasOwnProperty("items") && itemData.hasOwnProperty("length")) {
      let resource2 = [];
      itemData.forEach(function(item) {
        resource2.push(parseDataForInsertOrUpdate(item));
      });
      return resource2;
    }
    if (itemData.constructor !== Object) {
      throw new Error("Invalid case");
    }
    let resource = {};
    if (!itemData.hasOwnProperty("attributes")) {
      let tmp = { attributes: {} };
      if (itemData.hasOwnProperty("type")) {
        tmp.type = itemData.type;
      }
      Object.assign(tmp.attributes, itemData);
      itemData = tmp;
    }
    Object.getOwnPropertyNames(itemData.attributes).forEach(function(attr) {
      if (itemData.attributes[attr] && typeof itemData.attributes[attr] === "object") {
        if (!resource.relationships) {
          resource.relationships = {};
        }
        resource.relationships[attr] = {
          data: parseDataForInsertOrUpdate(itemData.attributes[attr])
        };
        return;
      }
      if (!resource.attributes) {
        resource.attributes = {};
      }
      resource.attributes[attr] = itemData.attributes[attr];
    });
    return resource;
  }

  // src/adapters/JsonApiAdapter.js
  var JsonApiAdapter = class {
    /** @type {string} */
    name = "jsonapi";
    /**
     * Whether a remote response represents a single resource (not a collection).
     *
     * @param {object} data - Raw HTTP response body
     * @returns {boolean}
     */
    isSingleItemResponse(data) {
      return !!(data && data.data && typeof data.data === "object" && !Array.isArray(data.data));
    }
    /**
     * Extract pagination metadata from a remote document.
     *
     * @param {object} data - Raw HTTP response body
     * @returns {{ totalRecords?: number, offset?: number }}
     */
    extractMetadata(data) {
      const meta = {};
      if (!data || !data.hasOwnProperty("meta") || typeof data.meta !== "object") {
        return meta;
      }
      if (data.meta.hasOwnProperty("totalRecords")) {
        meta.totalRecords = data.meta.totalRecords * 1;
      }
      if (data.meta.hasOwnProperty("offset")) {
        meta.offset = data.meta.offset;
      }
      return meta;
    }
    /**
     * Apply extracted metadata to a Collection instance.
     *
     * @param {object} collection - Collection instance
     * @param {{ totalRecords?: number, offset?: number }} meta
     */
    applyMetadata(collection, meta) {
      if (meta.totalRecords !== void 0) {
        collection.total = meta.totalRecords;
      }
      if (meta.offset !== void 0) {
        collection.offset = meta.offset;
      }
    }
    /**
     * Parse a single-item remote document into a canonical resource object.
     *
     * @param {object} data - Raw HTTP response body
     * @param {object} [options]
     * @returns {object} Hydrated resource ready for Item.loadFromData()
     */
    parseItemResponse(data, options = {}) {
      this.validateItemRemoteDoc(data, options);
      return parseItemData(data, options);
    }
    /**
     * Validate that a remote document is suitable for a single Item load.
     *
     * @param {object} data - Raw HTTP response body
     * @param {object} [options]
     * @param {object} [options.collection] - Parent collection (for type inference)
     */
    validateItemRemoteDoc(data) {
      if (data?.data?.constructor === Array) {
        throw new Error("Invalid configuration: resource type is item but server response is collection");
      }
    }
    /**
     * Infer resource type from a single-item remote document.
     *
     * @param {object} data - Raw HTTP response body
     * @returns {string|undefined}
     */
    inferItemType(data) {
      return data?.data?.type;
    }
    /**
     * Parse a collection remote document into canonical resource objects.
     *
     * @param {object} doc - Raw HTTP response body
     * @returns {{ items: Array<object>, meta: object }}
     */
    parseCollectionResponse(doc) {
      const items = parseCollectionData(doc);
      const meta = this.extractMetadata(doc);
      return { items, meta };
    }
    /**
     * Apply list query parameters to a URL object before a collection fetch.
     *
     * @param {import('../URL.js').URL} url - Collection URL
     * @param {{ type?: string, offset?: number, pageSize?: number }} params
     */
    applyListQuery(url, params) {
      const { type, offset, pageSize } = params;
      if (typeof offset !== "undefined" && offset !== null && type) {
        url.parameters[`page[${type}][offset]`] = offset;
      }
      if (typeof pageSize !== "undefined" && pageSize !== null && type) {
        url.parameters[`page[${type}][limit]`] = pageSize;
      }
    }
    /**
     * Serialize plain item data for a create (POST) request.
     *
     * @param {object|Array} itemData - Single item or array of items
     * @param {{ type?: string }} [context]
     * @returns {{ body: string, contentType: string, headers?: object }}
     */
    serializeForCreate(itemData, context = {}) {
      const doc = { data: parseDataForInsertOrUpdate(itemData) };
      if (context.type) {
        doc.type = context.type;
      }
      return {
        body: JSON.stringify(doc),
        contentType: "application/vnd.api+json"
      };
    }
    /**
     * Serialize changed fields for an update (PATCH) request.
     *
     * @param {object} toUpdate - Resource patch with id, type, attributes, relationships
     * @returns {{ body: string, contentType: string }}
     */
    serializeForUpdate(toUpdate) {
      return {
        body: JSON.stringify({ data: toUpdate }),
        contentType: "application/vnd.api+json"
      };
    }
    /**
     * Serialize a runtime relationship value to JSON:API wire format.
     *
     * @param {object|Array|null} rel - Runtime relationship value
     * @returns {object} JSON:API relationship: { data: ... }
     */
    serializeRelationship(rel) {
      if (rel === null) {
        return { data: null };
      }
      if (rel && typeof rel === "object" && !Array.isArray(rel)) {
        if (rel.id) {
          const result = { data: { id: rel.id } };
          if (rel.type) {
            result.data.type = rel.type;
          }
          return result;
        }
        if (rel.hasOwnProperty("toJSON")) {
          const json = rel.toJSON();
          const result = { data: { id: json.id } };
          if (json.type) {
            result.data.type = json.type;
          }
          return result;
        }
        return { data: null };
      }
      if (Array.isArray(rel)) {
        return {
          data: rel.map((item) => {
            if (item && typeof item === "object") {
              if (item.type && item.id) {
                const result = { id: item.id };
                if (item.type) {
                  result.type = item.type;
                }
                return result;
              }
              if (item.hasOwnProperty("toJSON")) {
                const json = item.toJSON();
                const result = { id: json.id };
                if (json.type) {
                  result.type = json.type;
                }
                return result;
              }
            }
            return item;
          }).filter((item) => item && item.id)
        };
      }
      return { data: null };
    }
  };

  // src/adapters/plainUtils.js
  function getPath(obj, path) {
    if (!obj || !path || typeof path !== "string") {
      return void 0;
    }
    return path.split(".").reduce((current, key) => {
      if (current == null || typeof current !== "object") {
        return void 0;
      }
      return current[key];
    }, obj);
  }
  function extractCollectionRows(doc, itemsPath) {
    if (Array.isArray(doc)) {
      return doc;
    }
    if (!doc || typeof doc !== "object") {
      return [];
    }
    if (itemsPath) {
      const rows = getPath(doc, itemsPath);
      return Array.isArray(rows) ? rows : [];
    }
    if (Array.isArray(doc.data)) {
      return doc.data;
    }
    if (Array.isArray(doc.items)) {
      return doc.items;
    }
    if (Array.isArray(doc.results)) {
      return doc.results;
    }
    return [];
  }
  function extractTotalRecords(doc, totalPath) {
    if (!doc || typeof doc !== "object") {
      return void 0;
    }
    if (totalPath) {
      const value = getPath(doc, totalPath);
      return value != null ? value * 1 : void 0;
    }
    for (const path of ["total", "count", "totalCount", "meta.totalRecords"]) {
      const value = getPath(doc, path);
      if (value != null) {
        return value * 1;
      }
    }
    return void 0;
  }
  function extractOffset(doc, offsetPath) {
    if (!doc || typeof doc !== "object") {
      return void 0;
    }
    if (offsetPath) {
      const value = getPath(doc, offsetPath);
      return value != null ? value : void 0;
    }
    for (const path of ["offset", "meta.offset"]) {
      const value = getPath(doc, path);
      if (value != null) {
        return value;
      }
    }
    return void 0;
  }

  // src/adapters/PlainRestAdapter.js
  var PlainRestAdapter = class {
    /** @type {string} */
    name = "plain";
    /**
     * @param {object} [opts]
     * @param {string|null} [opts.itemsPath] - Dot path to item array (null = auto-detect)
     * @param {string|null} [opts.itemPath] - Dot path to single item in a wrapper document
     * @param {string|null} [opts.totalPath] - Dot path to total count (null = auto-detect)
     * @param {string|null} [opts.offsetPath] - Dot path to offset (null = auto-detect)
     * @param {string} [opts.idField] - Primary key field name
     * @param {string|null} [opts.typeField] - Resource type field on wire objects
     * @param {'offset'|'page'} [opts.paginationStyle] - Query param style for list fetches
     * @param {string} [opts.offsetParam] - Offset query parameter name
     * @param {string} [opts.limitParam] - Page size query parameter name
     * @param {string} [opts.pageParam] - Page number query parameter name (1-based)
     * @param {boolean} [opts.embedRelationships] - Embed nested objects on write (default: id stub)
     */
    constructor(opts = {}) {
      this.itemsPath = opts.itemsPath ?? null;
      this.itemPath = opts.itemPath ?? null;
      this.totalPath = opts.totalPath ?? null;
      this.offsetPath = opts.offsetPath ?? null;
      this.idField = opts.idField ?? "id";
      this.typeField = opts.typeField ?? "type";
      this.paginationStyle = opts.paginationStyle ?? "offset";
      this.offsetParam = opts.offsetParam ?? "offset";
      this.limitParam = opts.limitParam ?? "limit";
      this.pageParam = opts.pageParam ?? "page";
      this.embedRelationships = opts.embedRelationships ?? false;
    }
    /**
     * @param {object|Array} data
     * @returns {boolean}
     */
    isSingleItemResponse(data) {
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return false;
      }
      if (this.itemPath) {
        const item = getPath(data, this.itemPath);
        if (Array.isArray(item)) {
          return false;
        }
        if (item && typeof item === "object") {
          return item[this.idField] != null;
        }
        return false;
      }
      const rows = extractCollectionRows(data, this.itemsPath);
      if (rows.length > 0) {
        return false;
      }
      if (data.data && Array.isArray(data.data)) {
        return false;
      }
      if (data.data && typeof data.data === "object" && data.data[this.idField] != null) {
        return true;
      }
      return data[this.idField] != null;
    }
    /**
     * @param {object} data
     * @returns {{ totalRecords?: number, offset?: number }}
     */
    extractMetadata(data) {
      const meta = {};
      const totalRecords = extractTotalRecords(data, this.totalPath);
      if (totalRecords !== void 0) {
        meta.totalRecords = totalRecords;
      }
      const offset = extractOffset(data, this.offsetPath);
      if (offset !== void 0) {
        meta.offset = offset;
      }
      return meta;
    }
    /**
     * @param {object} collection
     * @param {{ totalRecords?: number, offset?: number }} meta
     */
    applyMetadata(collection, meta) {
      if (meta.totalRecords !== void 0) {
        collection.total = meta.totalRecords;
      }
      if (meta.offset !== void 0) {
        collection.offset = meta.offset;
      }
    }
    /**
     * @param {object} data
     * @param {object} [options]
     * @returns {object}
     */
    parseItemResponse(data, options = {}) {
      this.validateItemRemoteDoc(data, options);
      const raw = this.extractRawItem(data);
      const defaultType = options.collection?.type ?? options.type;
      return this.normalize(raw, defaultType);
    }
    /**
     * @param {object} data
     */
    validateItemRemoteDoc(data) {
      if (Array.isArray(data)) {
        throw new Error("Invalid configuration: resource type is item but server response is collection");
      }
      if (this.itemPath) {
        const item = getPath(data, this.itemPath);
        if (Array.isArray(item)) {
          throw new Error("Invalid configuration: resource type is item but server response is collection");
        }
        return;
      }
      if (data?.data && Array.isArray(data.data)) {
        throw new Error("Invalid configuration: resource type is item but server response is collection");
      }
    }
    /**
     * @param {object} data
     * @returns {string|undefined}
     */
    inferItemType(data) {
      const raw = this.extractRawItem(data);
      if (!raw || typeof raw !== "object") {
        return void 0;
      }
      return raw[this.typeField];
    }
    /**
     * @param {object|Array} doc
     * @param {object} [options]
     * @returns {{ items: Array<object>, meta: object }}
     */
    parseCollectionResponse(doc, options = {}) {
      const rows = extractCollectionRows(doc, this.itemsPath);
      const defaultType = options.type;
      const items = rows.map((row) => this.normalize(row, defaultType));
      const meta = this.extractMetadata(doc);
      return { items, meta };
    }
    /**
     * @param {import('../URL.js').URL} url
     * @param {{ offset?: number, pageSize?: number }} params
     */
    applyListQuery(url, params) {
      const { offset, pageSize } = params;
      if (typeof pageSize === "undefined" || pageSize === null) {
        return;
      }
      if (this.paginationStyle === "page") {
        const safeOffset = typeof offset === "undefined" || offset === null ? 0 : offset;
        const page = Math.floor(safeOffset / pageSize) + 1;
        url.parameters[this.pageParam] = page;
        url.parameters[this.limitParam] = pageSize;
        return;
      }
      if (typeof offset !== "undefined" && offset !== null) {
        url.parameters[this.offsetParam] = offset;
      }
      url.parameters[this.limitParam] = pageSize;
    }
    /**
     * @param {object|Array} itemData
     * @param {object} [context]
     * @returns {{ body: string, contentType: string }}
     */
    serializeForCreate(itemData, context = {}) {
      const defaultType = context.type;
      let payload;
      if (Array.isArray(itemData)) {
        payload = itemData.map((item) => this.flattenForWire(this.coerceToCanonical(item, defaultType)));
      } else {
        payload = this.flattenForWire(this.coerceToCanonical(itemData, defaultType));
      }
      return {
        body: JSON.stringify(payload),
        contentType: "application/json"
      };
    }
    /**
     * @param {object} toUpdate
     * @returns {{ body: string, contentType: string }}
     */
    serializeForUpdate(toUpdate) {
      const relationships = {};
      Object.entries(toUpdate.relationships || {}).forEach(([name, rel]) => {
        relationships[name] = this.unwrapRelationship(rel);
      });
      const payload = this.flattenForWire({
        id: toUpdate.id,
        type: toUpdate.type,
        attributes: toUpdate.attributes,
        relationships
      });
      return {
        body: JSON.stringify(payload),
        contentType: "application/json"
      };
    }
    /**
     * @param {object|Array|null} rel
     * @returns {object|Array|null|undefined}
     */
    serializeRelationship(rel) {
      return this.unwrapRelationship(rel);
    }
    /**
     * @param {object} data
     * @returns {object}
     * @private
     */
    extractRawItem(data) {
      if (this.itemPath) {
        return getPath(data, this.itemPath);
      }
      if (data?.data && typeof data.data === "object" && !Array.isArray(data.data)) {
        return data.data;
      }
      return data;
    }
    /**
     * @param {object} row
     * @param {string|undefined} defaultType
     * @returns {object}
     */
    normalize(row, defaultType) {
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        throw new Error("Invalid item data: must be an object");
      }
      if (row.attributes && typeof row.attributes === "object") {
        const relationships2 = {};
        Object.entries(row.relationships || {}).forEach(([name, value]) => {
          if (value === null) {
            relationships2[name] = null;
          } else if (Array.isArray(value)) {
            relationships2[name] = value.map((entry) => this.normalize(entry, defaultType));
          } else {
            relationships2[name] = this.normalize(value, defaultType);
          }
        });
        const normalized2 = {
          attributes: { ...row.attributes },
          relationships: relationships2
        };
        if (row.id != null) {
          normalized2.id = String(row.id);
        }
        if (row.type ?? defaultType) {
          normalized2.type = row.type ?? defaultType;
        }
        return normalized2;
      }
      const attributes = {};
      const relationships = {};
      let id;
      let type;
      Object.entries(row).forEach(([key, value]) => {
        if (key === this.idField) {
          id = value;
          return;
        }
        if (key === this.typeField) {
          type = value;
          return;
        }
        if (value === null || value === void 0) {
          attributes[key] = value;
          return;
        }
        if (Array.isArray(value)) {
          if (value.length > 0 && value.every((entry) => this.isNestedResource(entry))) {
            relationships[key] = value.map((entry) => this.normalize(entry, defaultType));
          } else {
            attributes[key] = value;
          }
          return;
        }
        if (this.isNestedResource(value)) {
          relationships[key] = this.normalize(value, defaultType);
          return;
        }
        attributes[key] = value;
      });
      const normalized = { attributes, relationships };
      if (id != null) {
        normalized.id = String(id);
      }
      if (type ?? defaultType) {
        normalized.type = type ?? defaultType;
      }
      return normalized;
    }
    /**
     * @param {*} value
     * @returns {boolean}
     * @private
     */
    isNestedResource(value) {
      return value && typeof value === "object" && !Array.isArray(value) && value[this.idField] != null;
    }
    /**
     * @param {object} data
     * @param {string|undefined} defaultType
     * @returns {object}
     * @private
     */
    coerceToCanonical(data, defaultType) {
      if (!data || typeof data !== "object") {
        return data;
      }
      if (data.attributes || data.relationships) {
        return data;
      }
      return this.normalize(data, defaultType);
    }
    /**
     * @param {object} canonical
     * @returns {object}
     * @private
     */
    flattenForWire(canonical) {
      if (!canonical || typeof canonical !== "object") {
        return canonical;
      }
      const result = { ...canonical.attributes || {} };
      if (canonical.id != null) {
        result[this.idField] = canonical.id;
      }
      if (canonical.type != null && this.typeField) {
        result[this.typeField] = canonical.type;
      }
      Object.entries(canonical.relationships || {}).forEach(([name, rel]) => {
        if (rel === null) {
          result[name] = null;
          return;
        }
        if (Array.isArray(rel)) {
          result[name] = rel.map((entry) => this.relationshipToWire(entry));
          return;
        }
        result[name] = this.relationshipToWire(rel);
      });
      return result;
    }
    /**
     * @param {object|null|undefined} rel
     * @returns {object|null|undefined}
     * @private
     */
    relationshipToWire(rel) {
      if (!rel) {
        return null;
      }
      if (this.embedRelationships && rel.attributes) {
        return this.flattenForWire(rel);
      }
      const stub = { [this.idField]: rel.id ?? rel[this.idField] };
      if ((rel.type ?? rel[this.typeField]) != null) {
        stub[this.typeField] = rel.type ?? rel[this.typeField];
      }
      return stub;
    }
    /**
     * @param {*} rel
     * @returns {object|Array|null|undefined}
     * @private
     */
    unwrapRelationship(rel) {
      if (rel == null) {
        return null;
      }
      if (rel.data !== void 0) {
        if (rel.data === null) {
          return null;
        }
        if (Array.isArray(rel.data)) {
          return rel.data.map((entry) => ({ ...entry }));
        }
        return { ...rel.data };
      }
      if (Array.isArray(rel)) {
        return rel.map((entry) => this.unwrapRelationship(entry));
      }
      if (typeof rel === "object") {
        if (rel.attributes) {
          return rel;
        }
        return { ...rel };
      }
      return rel;
    }
  };

  // src/adapters/resolveAdapter.js
  var registry = /* @__PURE__ */ new Map([
    ["jsonapi", new JsonApiAdapter()],
    ["plain", new PlainRestAdapter()]
  ]);
  var defaultAdapter = "jsonapi";
  function registerAdapter(name, adapter) {
    if (!name || typeof name !== "string") {
      throw new Error("Adapter name must be a non-empty string");
    }
    registry.set(name, adapter);
  }
  function setDefaultAdapter(adapter) {
    defaultAdapter = adapter;
  }
  function getDefaultAdapter() {
    return defaultAdapter;
  }
  function resolveAdapter(adapter) {
    if (adapter && typeof adapter === "object") {
      return adapter;
    }
    const name = typeof adapter === "string" ? adapter : defaultAdapter;
    if (typeof name === "object") {
      return name;
    }
    const resolved = registry.get(name);
    if (!resolved) {
      throw new Error(`Unknown data adapter: ${name}`);
    }
    return resolved;
  }

  // src/ItemView.js
  var ItemView = class {
    constructor(params) {
      if (params && params.isView) {
        return params;
      }
      this.type = "ItemView";
      this.dataBindings = null;
      this.template = null;
      this.container = null;
      this.collectionView = null;
      this.item = null;
      this.el = null;
      this.id = uid();
      this.isView = true;
      this.callbacks = {};
      if (params && (params.length || params.nodeName && !params.jquery)) {
        dbg("params is actually a jquery object or an html node", params);
        let $el = $(params);
        if ($el.data("view")) {
          return $el.data("view");
        }
        let tmp = $("<div>").append($el.clone(true));
        let html = tmp.html().replace(/&lt;%/gi, "<%").replace(/&lt;/gi, "<").replace(/%&gt;/gi, "%>").replace(/&gt;/gi, ">").replace(/&amp;/gi, "&");
        params = {
          template: template(html),
          el: $el
        };
        if ($el.attr("id")) {
          params.id = $el.attr("id");
        }
        tmp.remove();
      }
      try {
        params = parseOptions(params);
      } catch (e) {
        throw new Error("Error on ItemView", this, e);
      }
      Object.assign(this, params);
      if (this.el !== null) {
        this.dataBindings = getBoundObjects(this.el);
      }
    }
    /**
     * Event listener registration
     */
    on(event, cb) {
      if (!this.callbacks[event]) {
        this.callbacks[event] = [];
      }
      this.callbacks[event].push(cb);
      return this;
    }
    /**
     * Unbind from item
     */
    unbind() {
      if (this.item) {
        this.item.unbindView(this);
      }
    }
    /**
     * Create element from template
     */
    createElementFromTemplate() {
      if (this.template == null) {
        dbg("Warning: no template defined. Nothing to render");
        return null;
      }
      if (!this.item) {
        dbg("Warning: no item bound to view. Cannot render template.");
        return null;
      }
      let el;
      try {
        const renderContext = this.item.getRenderContext();
        console.log("renderContext", renderContext);
        let html = this.template(renderContext);
        el = $(html).attr("data-type", "item").attr("id", this.id).data("view", this).data("instance", this.item);
      } catch (e) {
        console.log("Error create view from template", e, this.item);
        el = $("<div>Could not render view: <strong>" + e.toString() + "</strong></div>");
      }
      return el;
    }
    /**
     * After render callback
     */
    afterrender() {
      if (!this.callbacks.afterrender) {
        return;
      }
      console.log("afterend of view", this);
      this.callbacks.afterrender.forEach((cb) => cb(this));
    }
    /**
     * Render the view
     */
    render(doNotAttachToContainer = false, addontop = false) {
      log("ItemView.render called", this.item, this.el);
      let renderedEl = this.createElementFromTemplate();
      if (!renderedEl) {
        return null;
      }
      log("View item", this.item);
      if (this.item && this.item.uievents) {
        log("UI events", this.item.uievents);
        this.item.uievents.forEach((action) => {
          log("UI event", action, renderedEl);
          if (action.selector && action.event && action.callback) {
            const actionEls = $(renderedEl).find(action.selector);
            log("UI event els", action, renderedEl, actionEls);
            actionEls.on(action.event, (event) => {
              event.preventDefault();
              log("UIevent triggered", event, this.item, this);
              action.callback(event, this.item, this);
            });
          }
        });
      }
      if (doNotAttachToContainer) {
        this.el = renderedEl;
        return this.el;
      }
      if (this.el) {
        let oldEl = this.el;
        if (!oldEl.jquery) {
          oldEl = $(oldEl);
        }
        oldEl.off();
        this.el = $(renderedEl).insertBefore(oldEl);
        oldEl.remove();
        this.afterrender();
        return this;
      }
      this.el = renderedEl;
      this.afterrender();
      if (!this.container) {
        return this;
      }
      $(this.el).appendTo(this.container.el);
      return this;
    }
    /**
     * Render empty state
     */
    renderEmpty(returnView) {
      if (this.item && this.item.emptyview && this.el) {
        let emptyView = $(this.item.emptyview).clone(true).css("display", "block");
        $(this.el).replaceWith(emptyView);
      }
    }
    /**
     * Remove view with animation
     */
    remove(idx) {
      return new Promise((resolve) => {
        if (this.item && this.item.collection) {
          this.item.collection._trigger("afterrender", this.item.collection);
        }
        if (this.el) {
          let $el = this.el.jquery ? this.el : $(this.el);
          $el.fadeOut({
            complete: () => {
              $el.remove();
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    }
    /**
     * Destroy view and clean up resources
     * 
     * Removes event handlers, jQuery data, and DOM references
     */
    destroy() {
      if (this.el) {
        const $el = this.el.jquery ? this.el : $(this.el);
        $el.off();
        $el.removeData();
      }
      this.callbacks = {};
      if (this.item) {
        this.item.unbindView(this);
      }
      this.item = null;
      this.container = null;
      this.collectionView = null;
      this.el = null;
      this.template = null;
      this.dataBindings = null;
      return this;
    }
  };

  // src/Item.js
  var Item = class _Item {
    constructor(options = {}, data = null) {
      this.id = null;
      this.type = null;
      this.attributes = {};
      this.relationships = {};
      this.views = [];
      this.collection = null;
      this.url = null;
      this.updateUrl = null;
      this.deleteUrl = null;
      this.strict = false;
      this.shadow = null;
      this.syncOp = null;
      this.emptyview = null;
      this.uievents = [];
      this.callbacks = {};
      this.adapter = null;
      try {
        Object.assign(this, parseOptions(options));
      } catch (e) {
        throw new Error("Error on Item init", e);
      }
      this.adapter = resolveAdapter(
        options.adapter ?? (options.collection && options.collection.adapter)
      );
      this.storage = options.storage || new Storage(
        (() => {
          const storageOpts = Object.assign({}, options.ajaxOpts || {});
          if (options.headers && typeof options.headers === "object") {
            storageOpts.headers = Object.assign(
              {},
              storageOpts.headers || {},
              options.headers
            );
          }
          return storageOpts;
        })()
      );
      let render = false;
      if (data) {
        log("Loading data", data);
        try {
          this.loadFromData(data);
          render = true;
        } catch (e) {
          console.error("Error loading data", e);
        }
      }
      if (this.url) {
        this.setUrl(this.url);
      }
      if (this.deleteUrl) {
        log("deleteUrl", this.deleteUrl);
        this.setUrl(this.deleteUrl, "delete");
      }
      if (this.updateUrl) {
        this.setUrl(this.updateUrl, "update");
      }
      if (this.insertUrl) {
        this.setUrl(this.insertUrl, "insert");
      }
      this.views.forEach((view) => {
        view.item = this;
      });
      if (options.itemListeners && typeof options.itemListeners === "object") {
        Object.getOwnPropertyNames(options.itemListeners).forEach((eventName) => {
          log("apply item listener", eventName, options.itemListeners[eventName]);
          this.on(eventName, options.itemListeners[eventName]);
        });
      }
      if (render) {
        log("Rendering data", data);
        this.render();
      }
    }
    /**
     * Event listener registration
     */
    on(eventName, cb) {
      if (typeof this.callbacks[eventName] === "undefined") {
        this.callbacks[eventName] = [];
      }
      this.callbacks[eventName].push(cb);
      return this;
    }
    /**
     * Remove event listener(s)
     * @param {string} eventName - Event name
     * @param {Function} [cb] - Optional callback to remove. If not provided, removes all listeners for the event
     * @returns {Item} This instance for chaining
     */
    off(eventName, cb) {
      if (!eventName) {
        this.callbacks = {};
        return this;
      }
      if (!this.callbacks[eventName]) {
        return this;
      }
      if (cb) {
        const index = this.callbacks[eventName].indexOf(cb);
        if (index > -1) {
          this.callbacks[eventName].splice(index, 1);
        }
        if (this.callbacks[eventName].length === 0) {
          delete this.callbacks[eventName];
        }
      } else {
        delete this.callbacks[eventName];
      }
      return this;
    }
    /**
     * Register a one-time event listener
     * @param {string} eventName - Event name
     * @param {Function} cb - Callback function
     * @returns {Item} This instance for chaining
     */
    once(eventName, cb) {
      const wrapper = (...args) => {
        cb(...args);
        this.off(eventName, wrapper);
      };
      return this.on(eventName, wrapper);
    }
    /**
     * Check if event has listeners
     * @param {string} eventName - Event name
     * @returns {boolean} True if event has listeners
     */
    hasListeners(eventName) {
      return this.callbacks[eventName] && Array.isArray(this.callbacks[eventName]) && this.callbacks[eventName].length > 0;
    }
    /**
     * Trigger an event (internal helper)
     * @private
     * @param {string} eventName - Event name
     * @param {...any} args - Arguments to pass to callbacks
     */
    _trigger(eventName, ...args) {
      if (this.callbacks[eventName] && Array.isArray(this.callbacks[eventName])) {
        this.callbacks[eventName].forEach((cb) => {
          if (typeof cb === "function") {
            cb(...args);
          }
        });
      }
    }
    /**
     * Emit/trigger an event manually
     * @param {string} eventName - Event name
     * @param {...any} args - Arguments to pass to callbacks
     * @returns {Item} This instance for chaining
     */
    emit(eventName, ...args) {
      this._trigger(eventName, ...args);
      return this;
    }
    /**
     * Set URL for this item
     */
    setUrl(url, type) {
      switch (type) {
        case "delete":
          this.deleteUrl = createURL(url);
          break;
        case "update":
          this.updateUrl = createURL(url);
          break;
        case "insert":
          this.insertUrl = createURL(url);
          break;
        default:
          this.url = createURL(url);
          this.deleteUrl = typeof this.deleteUrl == "string" ? createURL(this.deleteUrl) : this.deleteUrl ?? createURL(this.url);
          this.updateUrl = typeof this.updateUrl == "string" ? createURL(this.updateUrl) : this.updateUrl ?? createURL(this.url);
          break;
      }
      return this;
    }
    /**
     * Load from remote
     * 
     * Canonical method for loading item data from API
     */
    loadFromRemote() {
      return this.loadFromDataSource();
    }
    load(data) {
      return data ? this.loadFromData(data) : this.loadFromRemote();
    }
    /**
     * Load from data source (internal implementation)
     * @private
     */
    loadFromDataSource() {
      let loaders = [];
      const overlay = createOverlay(this);
      this.views.forEach((itemView) => {
        if (itemView.el) {
          let $el = $(itemView.el);
          let loader = overlay.clone();
          loader.insertBefore(itemView.el).width($el.width()).height($el.height());
          loaders.push(loader);
        }
      });
      return new Promise((resolve, reject) => {
        if (!this.url) {
          reject(new Error("No valid URL provided"));
          return;
        }
        this._trigger("beforeload", this);
        let urlString = this.url.toString ? this.url.toString() : this.url;
        this.storage.read(this, urlString, {}).then((resp) => {
          let data = resp.data;
          this.loadFromRemoteDoc(data).render();
          this._trigger("load", this);
          loaders.forEach((loader) => {
            loader.remove();
          });
          resolve(this);
        }).catch((error2) => {
          dbg("fail to load item resource", this.url, error2);
          if (error2 instanceof Error && error2.jqXHR) {
            this.fail(error2.jqXHR, error2.textStatus || "error", error2.errorThrown || error2);
            reject(error2);
          } else if (error2 && error2.jqXHR) {
            this.fail(error2.jqXHR, error2.textStatus, error2.errorThrown);
            reject(error2);
          } else {
            this.fail(null, "error", error2);
            reject(error2);
          }
        });
      });
    }
    /**
     * @deprecated Use loadFromRemote() instead
     * Alias for backward compatibility
     */
    refresh() {
      return this.loadFromRemote();
    }
    /**
     * @deprecated Use loadFromRemote() instead
     * Alias for backward compatibility
     */
    reload() {
      return this.loadFromRemote();
    }
    /**
     * @deprecated Use loadFromRemote() instead
     * Internal method, use loadFromRemote() for public API
     * @private
     */
    load_from_data_source() {
      return this.loadFromDataSource();
    }
    /**
     * Unbind a view from this item
     */
    unbindView(view) {
      let found = false;
      for (let i = 0; i < this.views.length; i++) {
        if (this.views[i] === view) {
          found = i;
        }
      }
      if (found !== false) {
        this.views.splice(found, 1);
      }
    }
    /**
     * Bind a view to this item
     */
    bindView(view, returnView) {
      let $el = $(view);
      if ($el.length === 0) {
        throw new Error("Nothing to bind to: empty view element");
      }
      if (!(view instanceof ItemView)) {
        view = new ItemView(view);
      }
      let bound = false;
      this.views.forEach((v) => {
        dbg("bind to existing view", v.el);
        if (v === view) {
          bound = true;
        }
      });
      if (bound) {
        return returnView ? view : this;
      }
      view.item = this;
      this.views.push(view);
      return returnView ? view : this;
    }
    /**
     * Load from a remote API document (format determined by adapter).
     *
     * @param {object} data - Raw HTTP response body
     * @returns {Item} This instance for chaining
     */
    loadFromRemoteDoc(data) {
      dbg("Load from remote doc", data);
      if (this.collection && !this.collection.type) {
        const inferredType = this.adapter.inferItemType(data);
        if (inferredType) {
          this.type = inferredType;
        }
      }
      this.adapter.validateItemRemoteDoc(data, { collection: this.collection });
      const parsedData = this.adapter.parseItemResponse(data, { collection: this.collection });
      Object.assign(this, parsedData);
      if (this.url) {
        this.url = createURL(this.url);
      }
      return this;
    }
    /**
     * @deprecated Use loadFromRemoteDoc() instead
     * @param {object} data - Raw HTTP response body
     * @returns {Item} This instance for chaining
     */
    loadFromJSONAPIDoc(data) {
      return this.loadFromRemoteDoc(data);
    }
    /**
     * Load from data object
     */
    loadFromData(data, render = false) {
      if (data === null || typeof data !== "object" || data.constructor !== Object) {
        dbg("cannot load ", data, " into ", this);
        throw new Error("Cannot load data into item");
      }
      if (!data.hasOwnProperty("attributes") && !data.hasOwnProperty("id") && !data.hasOwnProperty("type")) {
        dbg("need to normalize data", data);
        let attributes = {};
        let relationships = {};
        Object.getOwnPropertyNames(data).forEach((propName) => {
          if (data[propName] && data[propName].constructor === Object) {
            relationships[propName] = new _Item().loadFromData(data[propName]);
            return;
          }
          if (data[propName] && data[propName].constructor === Array) {
            relationships[propName] = data[propName];
            return;
          }
          attributes[propName] = data[propName];
        });
        data = {
          attributes
        };
        if (Object.getOwnPropertyNames(relationships).length) {
          data.relationships = relationships;
        }
      }
      Object.assign(this, data);
      this._trigger("load", this);
      if (render) {
        this.render();
      }
      return this;
    }
    /**
     * Handle failure
     */
    fail(xhr, statusText, error2) {
      dbg("item.fail", xhr, statusText, error2);
      this.views.forEach((view) => {
        if (xhr && xhr.status === 404) {
          view.renderEmpty();
        }
      });
    }
    /**
     * Get render context - safe view model for templates
     * 
     * RENDER CONTEXT CONTRACT:
     * 
     * Returns a template-friendly object where:
     * - Attributes are exposed directly (e.g., {{title}} not {{attributes.title}})
     * - Relationships are flattened to plain objects with attributes, id, type
     * - All data is shallow-copied to prevent mutation of internal state
     * 
     * Relationship representation strategy:
     * - To-one: { id, type, ...attributes } (flattened plain object)
     * - To-many: Array of { id, type, ...attributes } (array of flattened objects)
     * - Null relationships: null
     * 
     * This ensures Handlebars templates can access data directly:
     *   {{title}} - item attribute
     *   {{author.name}} - relationship attribute
     *   {{#each tags}}{{name}}{{/each}} - relationship array
     * 
     * @returns {Object} Render context object safe for template rendering
     */
    getRenderContext() {
      function copyntransform(obj, wd = 0) {
        if (wd > 5) {
          return null;
        }
        if (!obj) {
          return null;
        }
        if (!obj?.attributes) {
          return { id: obj.id };
        }
        const result = Object.assign(
          // { id: obj.id, ...(obj.type != null ? { type: obj.type } : {}) },
          { id: obj.id },
          obj?.attributes ?? {}
        );
        Object.keys(obj?.relationships ?? {}).forEach((relName) => {
          if (Array.isArray(obj.relationships[relName])) {
            result[relName] = obj.relationships[relName].map((item) => copyntransform(item, wd + 1));
          } else {
            result[relName] = copyntransform(obj.relationships[relName], wd);
          }
        });
        return result;
      }
      const tmp = copyntransform(this, 0);
      return tmp;
    }
    /**
     * Convert to JSON:API format
     * 
     * Serializes item to JSON:API format for API requests.
     * This method is side-effect free - it does not mutate this.relationships.
     * 
     * Runtime relationships (hydrated objects) are converted to JSON:API
     * relationship format: { data: { type, id } } or { data: [{ type, id }, ...] }
     * 
     * @returns {Object} JSON:API formatted object
     */
    toJSON() {
      let json = {
        type: this.type,
        attributes: this.attributes || {}
      };
      if (this.id) {
        json.id = this.id;
      }
      if (this.relationships && Object.keys(this.relationships).length > 0) {
        json.relationships = {};
        for (let relName in this.relationships) {
          if (!this.relationships.hasOwnProperty(relName)) {
            continue;
          }
          const rel = this.relationships[relName];
          if (rel === null) {
            json.relationships[relName] = { data: null };
            continue;
          }
          if (rel && typeof rel === "object" && !Array.isArray(rel)) {
            if (rel.type && rel.id) {
              json.relationships[relName] = {
                data: {
                  type: rel.type,
                  id: rel.id
                }
              };
            } else if (rel.hasOwnProperty("toJSON")) {
              json.relationships[relName] = {
                data: rel.toJSON()
              };
            } else {
              continue;
            }
            continue;
          }
          if (Array.isArray(rel)) {
            json.relationships[relName] = {
              data: rel.map((item) => {
                if (item && typeof item === "object") {
                  if (item.type && item.id) {
                    return {
                      type: item.type,
                      id: item.id
                    };
                  } else if (item.hasOwnProperty("toJSON")) {
                    return item.toJSON();
                  }
                }
                return item;
              })
            };
            continue;
          }
          continue;
        }
      }
      dbg("item.json", json);
      return json;
    }
    /**
     * Serialize a single relationship to JSON:API wire format
     * 
     * Converts runtime relationship state (hydrated objects, arrays, null) to
     * JSON:API relationship format for wire transmission.
     * 
     * IMPORTANT: This is a serialization function - it does NOT mutate runtime state.
     * Runtime relationships remain as hydrated objects/arrays/null.
     * 
     * @param {Object|Array|null} rel - Runtime relationship value
     * @returns {Object} JSON:API relationship format: { data: { type, id } } or { data: [{ type, id }, ...] } or { data: null }
     */
    _serializeRelationshipToWireFormat(rel) {
      return this.adapter.serializeRelationship(rel);
    }
    /**
     * Sync pending operations
     */
    sync() {
      if (this.syncOp) {
        let syncOp = this.syncOp;
        dbg("Syncing", this, syncOp);
        this.syncOp = null;
        return syncOp();
      } else {
        dbg("Nothing to sync on", this);
      }
    }
    /**
     * Perform update operation
     * 
     * Builds PATCH payload with changed attributes and relationships.
     * 
     * IMPORTANT: Runtime relationship state (hydrated objects/arrays/null) is serialized
     * to JSON:API wire format ({ data: { type, id } }) for transmission. Runtime state
     * remains unchanged - this is a serialization layer, not a state mutation.
     */
    perform_update(opts) {
      let options = {
        rerender: true
      };
      Object.assign(options, opts);
      return new Promise((resolve, reject) => {
        let toUpdate = {
          id: this.id,
          attributes: {},
          relationships: {}
        };
        if (this.type) {
          toUpdate.type = this.type;
        }
        Object.getOwnPropertyNames(this.attributes).forEach((attrName) => {
          if (this.shadow && this.shadow.attributes[attrName] !== this.attributes[attrName]) {
            toUpdate.attributes[attrName] = this.attributes[attrName];
          }
        });
        Object.getOwnPropertyNames(this.relationships).forEach((relaName) => {
          if (this.shadow && this.shadow.relationships[relaName] !== this.relationships[relaName]) {
            const runtimeRel = this.relationships[relaName];
            toUpdate.relationships[relaName] = this._serializeRelationshipToWireFormat(runtimeRel);
          }
        });
        if (!Object.getOwnPropertyNames(toUpdate.attributes).length && !Object.getOwnPropertyNames(toUpdate.relationships).length) {
          this.syncOp = null;
          resolve(this);
          return;
        }
        const payload = this.adapter.serializeForUpdate(toUpdate);
        if (opts && opts.justSimulate) {
          dbg(payload.body);
          resolve(this);
          return;
        }
        let updateUrlString = this.updateUrl.toString ? this.updateUrl.toString() : this.updateUrl;
        this.storage.update(this, updateUrlString, { contentType: payload.contentType }, payload.body).then((resp) => {
          let newData = this.adapter.parseItemResponse(resp.data);
          Object.assign(this, newData);
          this.shadow = null;
          if (options.rerender) {
            this.views.forEach((view) => {
              view.render();
              this._trigger("afterrender", this, view);
            });
          }
          this._trigger("update", this);
          if (this.collection) {
            this.collection.onupdate();
          }
          resolve(this);
        }).catch((error2) => {
          dbg("Update NOK", this.updateUrl, patchData, error2);
          if (error2 instanceof Error && error2.jqXHR) {
            reject(error2);
          } else if (error2.jqXHR) {
            reject(error2);
          } else {
            reject(error2 instanceof Error ? error2 : new Error(String(error2)));
          }
        });
      });
    }
    /**
     * Update item
     */
    update(updateData, opts) {
      if (!updateData || updateData.constructor !== Object) {
        return;
      }
      let updateOptions = {
        sync: true,
        rerender: true
      };
      if (opts && opts.constructor === Object) {
        Object.assign(updateOptions, opts);
      }
      if (!this.shadow) {
        this.shadow = { attributes: {}, relationships: {} };
        Object.assign(this.shadow.attributes, this.attributes);
        Object.assign(this.shadow.relationships, this.relationships);
      }
      const updateRelation = (rel, data) => {
        dbg("update relation", rel, data);
        if (data === null) {
          return null;
        }
        if (rel && Array.isArray(rel)) {
          if (Array.isArray(data)) {
            return data.map((item) => {
              if (typeof item === "object" && item !== null) {
                return new _Item().loadFromData(item);
              }
              return item;
            });
          }
          dbg("to fix: array relationship update");
          return rel;
        }
        if (typeof data === "object" || data === null) {
          dbg("Update 1:1 relation");
          let item = new _Item().loadFromData(data);
          dbg("relation", item);
          return item;
        }
        if (typeof data === "string" || typeof data === "number") {
          dbg("Update 1:1 relation with id", data);
          if (rel && rel.id && (rel.id === data || String(rel.id) === String(data))) {
            return rel;
          }
          const newRel = {
            id: String(data)
          };
          if (rel && rel.type) {
            newRel.type = rel.type;
          }
          return newRel;
        }
        return rel;
      };
      Object.getOwnPropertyNames(this.relationships).forEach((relName) => {
        if (!updateData.hasOwnProperty(relName)) {
          return;
        }
        if (updateData[relName] === null) {
          this.relationships[relName] = null;
          return;
        }
        this.relationships[relName] = updateRelation(this.relationships[relName], updateData[relName]);
        delete updateData[relName];
      });
      Object.getOwnPropertyNames(updateData).forEach((attrName) => {
        if (updateData[attrName] && typeof updateData[attrName] === "object") {
          if (!this.strict && typeof this.relationships[attrName] === "undefined") {
            this.relationships[attrName] = updateRelation(this.relationships[attrName], updateData[attrName]);
          }
          return;
        }
        if (!this.shadow.attributes.hasOwnProperty(attrName)) {
          if (!this.strict) {
            this.attributes[attrName] = updateData[attrName];
          }
          return;
        }
        if (updateData[attrName] !== this.shadow.attributes[attrName]) {
          this.attributes[attrName] = updateData[attrName];
        }
      });
      dbg("updateOptions", updateOptions);
      if (updateOptions.sync) {
        return this.perform_update(updateOptions);
      }
      return new Promise((resolve) => {
        this.syncOp = () => this.perform_update(updateOptions);
        this.views.forEach((view) => {
          if (updateOptions.rerender) {
            view.render();
          }
        });
        resolve();
      });
    }
    /**
     * Remove item
     */
    remove() {
      return new Promise((resolve, reject) => {
        let ps = [];
        for (let i = this.views.length - 1; i >= 0; i--) {
          ps.push(this.views[i].remove());
        }
        let collection = this.collection;
        if (collection) {
          ps.push(collection.removeItem(this));
        }
        Promise.all(ps).then(() => {
          this._trigger("remove", this);
          if (collection) {
            console.log("removed");
            collection.onupdate();
          }
        }).finally(() => resolve());
      });
    }
    /**
     * Delete item
     */
    async delete(ops) {
      if (!this.deleteUrl) {
        return this.remove();
      }
      let deleteOps = {
        sync: true
      };
      if (ops && ops.constructor === Object) {
        Object.assign(deleteOps, ops);
      }
      try {
        log("delete", this.deleteUrl.toString());
        await this.storage.delete(this, this.deleteUrl.toString(), {});
        await this.remove();
      } catch (error2) {
        dbg("Error deleting item", error2);
        throw error2;
      }
    }
    /**
     * Render item
     */
    render(collectionView, addontop = false) {
      dbg("Render from item", this);
      this.views.forEach((view) => {
        if (typeof collectionView === "undefined") {
          dbg("collectionView is undefined so render view");
          view.render();
        } else if (view.container === collectionView) {
          dbg("collectionView matches view container so render view");
          view.render(false, addontop);
        }
        dbg("trigger afterrender", this, view, view.el);
        this._trigger("afterrender", this, view);
      });
      return this;
    }
    /**
     * Destroy item and clean up resources
     * 
     * Removes event handlers, views, and clears references.
     * Safe to call multiple times.
     * 
     * @returns {Item} This instance for chaining
     */
    destroy() {
      const viewsToDestroy = this.views ? [...this.views] : [];
      viewsToDestroy.forEach((view) => {
        if (view && typeof view.destroy === "function") {
          view.destroy();
        }
      });
      this.views = [];
      this.callbacks = {};
      if (this.collection) {
        this.collection = null;
      }
      this.storage = null;
      this.url = null;
      this.updateUrl = null;
      this.deleteUrl = null;
      this.attributes = {};
      this.relationships = {};
      this.shadow = null;
      this.views = [];
      return this;
    }
  };

  // src/CollectionView.js
  var CollectionView = class {
    constructor(options = {}) {
      this.el = null;
      this.type = "CollectionView";
      this.container = null;
      this.collection = null;
      this.itemsContainer = null;
      this.allowempty = true;
      try {
        Object.assign(this, parseOptions(options));
      } catch (e) {
        throw new Error("Error on CollectionView init", e);
      }
      this.dataBindings = getBoundObjects(this.el);
    }
    /**
     * Reset the view
     */
    reset(force) {
      if (this.allowempty || force) {
        if (this.el) {
          $(this.el).empty();
        }
      }
      return this;
    }
    /**
     * Render the collection view
     */
    render() {
      dbg("Render _collectionView", this.collection);
      if (this.collection && this.collection.navtype === "page") {
        this.reset();
      }
      if (this.collection && this.collection.items.length === 0) {
        this.renderEmpty();
        return this;
      }
      if (this.collection) {
        this.collection.items.forEach((item) => {
          item.render(this);
        });
      }
      return this;
    }
    /**
     * Render empty state
     */
    renderEmpty() {
      if (!this.collection || !this.collection.emptyview) {
        return this;
      }
      this.reset();
      $(this.el).append(this.collection.emptyview);
      return this;
    }
    /**
     * Destroy view and clean up resources
     */
    destroy() {
      if (this.el) {
        const $el = $(this.el);
        $el.empty();
        $el.removeData();
      }
      this.collection = null;
      this.el = null;
      this.container = null;
      this.itemsContainer = null;
      this.dataBindings = null;
      return this;
    }
  };

  // src/Paging.js
  var Paging = class {
    constructor(pagingEl, collection) {
      this.collection = collection;
      this.el = $(pagingEl);
      this.collection.paging = this;
      this.iniOffset = (this.collection.offset ? this.collection.offset : 0) * 1;
      this.defaultPageSize = 20;
      this.pageSize = this.collection.pageSize;
      this.setupPageSizeInput();
      this.setupOffsetInput();
      this.buttons = this.extractButtons();
      log("buttons", this.buttons);
      this.setupTotalCount();
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
      if (title !== void 0) {
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
      this.updateTotalCount(total);
      this.clearContainer();
      this.iniOffset = this.collection.offset * 1;
      if (this.collection.pageSize) {
        this.pageSize = this.collection.pageSize;
      } else if (total - this.iniOffset - this.collection.items.length > 0) {
        this.pageSize = this.collection.items.length;
      } else {
        this.pageSize = this.defaultPageSize;
      }
      this.pageSize = this.pageSize * 1;
      log("Paging obj", this, this.pageSize, total);
      if (this.pageSize > total) {
        return;
      }
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
      let lowerLimit = Math.floor(this.iniOffset / this.pageSize) - Math.floor(pagesToShow / 2);
      lowerLimit = lowerLimit < 0 ? 0 : lowerLimit;
      let upperLimit = Math.floor(this.iniOffset / this.pageSize) + Math.ceil(pagesToShow / 2);
      upperLimit = upperLimit * this.pageSize < total ? upperLimit : Math.ceil(total / this.pageSize);
      for (let i = lowerLimit; i < upperLimit; i++) {
        if (!this.buttons.page) {
          continue;
        }
        const pageOffset = i * this.pageSize;
        const isActive = Math.floor(this.iniOffset / this.pageSize) === i;
        let pageBtn = this.buttons.page.clone();
        pageBtn.text(i + 1).attr("title", pageOffset).on("click", () => {
          this.collection.setOffset(pageOffset);
          this.collection.loadFromRemote();
        });
        if (isActive) {
          pageBtn.addClass("active").off("click");
        }
        $(this.el).append(pageBtn);
      }
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
          log("last button", total, lastPageOffset, this.pageSize, this.offset);
          if (lastPageOffset > this.iniOffset * 1) {
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
      let offsetInp = $(this.collection.offsetinp);
      if (offsetInp.length) {
        offsetInp.val(this.iniOffset);
      }
    }
    /**
     * Destroy paging and clean up resources
     */
    destroy() {
      if (this.collection && this.collection.pagesizeinp) {
        const pageSizeInp = $(this.collection.pagesizeinp);
        pageSizeInp.off("change");
      }
      if (this.collection && this.collection.offsetinp) {
        const offsetInp = $(this.collection.offsetinp);
        offsetInp.off("change");
      }
      if (this.el) {
        const $el = $(this.el);
        $el.empty();
        $el.off();
        $el.removeData();
      }
      this.collection = null;
      this.el = null;
      this.buttons = null;
      this.$totalCount = null;
      return this;
    }
  };

  // src/Collection.js
  var Collection = class {
    constructor(opts = {}) {
      this.url = null;
      this.deleteUrl = null;
      this.insertUrl = null;
      this.updateUrl = null;
      this.paging = null;
      this.view = null;
      this.offset = 0;
      this.total = null;
      this.pageSize = 10;
      this.template = null;
      this.navtype = "page";
      this.type = null;
      this.emptyview = null;
      this.items = [];
      this.addontop = false;
      this.uievents = [];
      this.setAttrAsId = null;
      this.itemListeners = null;
      this.adapter = null;
      this.callbacks = {};
      this.iterator = -1;
      trace("Collection init", opts);
      try {
        opts = parseOptions(opts);
      } catch (e) {
        throw new Error("Error on Collection init", e);
      }
      Object.defineProperty(this, "length", {
        get() {
          return this.items.length;
        },
        enumerable: true,
        configurable: true
      });
      let options = Object.assign({}, opts);
      Object.assign(this, options);
      if (options.hasOwnProperty("paging") && $(options.paging).length) {
        this.paging = new Paging($(options.paging)[0], this);
      }
      if (this.url) {
        this.setUrl(this.url);
      }
      if (this.deleteUrl) {
        this.setUrl(this.deleteUrl, "delete");
      }
      if (this.updateUrl) {
        this.setUrl(this.updateUrl, "update");
      }
      if (this.insertUrl) {
        this.setUrl(this.insertUrl, "insert");
      }
      if (this.view) {
        this.view.collection = this;
      }
      if (this.total) {
        this.total = this.total * 1;
      }
      if (["page", "scroll"].indexOf(this.navtype) === -1) {
        throw new Error("Invalid navigations type. Should be page or scroll");
      }
      this.adapter = resolveAdapter(opts.adapter);
      this.storage = opts.hasOwnProperty("storage") ? opts.storage : new Storage(
        (() => {
          const storageOpts = Object.assign({}, opts.ajaxOpts || {});
          if (opts.headers && typeof opts.headers === "object") {
            storageOpts.headers = Object.assign(
              {},
              storageOpts.headers || {},
              opts.headers
            );
          }
          return storageOpts;
        })()
      );
      if (typeof opts.listeners === "object") {
        for (let event in opts.listeners) {
          this.on(event, opts.listeners[event]);
        }
      }
      if (opts.itemListeners && typeof opts.itemListeners === "object") {
        this.itemListeners = opts.itemListeners;
      } else if (opts.itemOn && typeof opts.itemOn === "object") {
        this.itemListeners = opts.itemOn;
      }
    }
    /**
     * Event listener registration
     */
    on(eventName, cb) {
      if (typeof this.callbacks[eventName] === "undefined") {
        this.callbacks[eventName] = [];
      }
      this.callbacks[eventName].push(cb);
      return this;
    }
    /**
     * Remove event listener(s)
     * @param {string} eventName - Event name
     * @param {Function} [cb] - Optional callback to remove. If not provided, removes all listeners for the event
     * @returns {Collection} This instance for chaining
     */
    off(eventName, cb) {
      if (!eventName) {
        this.callbacks = {};
        return this;
      }
      if (!this.callbacks[eventName]) {
        return this;
      }
      if (cb) {
        const index = this.callbacks[eventName].indexOf(cb);
        if (index > -1) {
          this.callbacks[eventName].splice(index, 1);
        }
        if (this.callbacks[eventName].length === 0) {
          delete this.callbacks[eventName];
        }
      } else {
        delete this.callbacks[eventName];
      }
      return this;
    }
    /**
     * Register a one-time event listener
     * @param {string} eventName - Event name
     * @param {Function} cb - Callback function
     * @returns {Collection} This instance for chaining
     */
    once(eventName, cb) {
      const wrapper = (...args) => {
        cb(...args);
        this.off(eventName, wrapper);
      };
      return this.on(eventName, wrapper);
    }
    /**
     * Check if event has listeners
     * @param {string} eventName - Event name
     * @returns {boolean} True if event has listeners
     */
    hasListeners(eventName) {
      return this.callbacks[eventName] && Array.isArray(this.callbacks[eventName]) && this.callbacks[eventName].length > 0;
    }
    /**
     * Trigger an event (internal helper)
     * @private
     * @param {string} eventName - Event name
     * @param {...any} args - Arguments to pass to callbacks
     */
    _trigger(eventName, ...args) {
      if (this.callbacks[eventName] && Array.isArray(this.callbacks[eventName])) {
        this.callbacks[eventName].forEach((cb) => {
          if (typeof cb === "function") {
            cb(...args);
          }
        });
      }
    }
    /**
     * Emit/trigger an event manually
     * @param {string} eventName - Event name
     * @param {...any} args - Arguments to pass to callbacks
     * @returns {Collection} This instance for chaining
     */
    emit(eventName, ...args) {
      this._trigger(eventName, ...args);
      return this;
    }
    /**
     * Show listeners (debug)
     */
    showlisteners() {
      dbg(this.callbacks);
    }
    /**
     * Remove item from collection
     * 
     * Removes item from items array. Does NOT trigger update event
     * (that's handled by Item.remove() to avoid duplication).
     * 
     * @param {Item} item - Item instance to remove
     * @returns {Promise} Resolves when item is removed
     */
    removeItem(item) {
      const index = this.items.findIndex((i) => i === item || i.id && item.id && i.id === item.id);
      if (index !== -1) {
        this.items.splice(index, 1);
      }
      return Promise.resolve();
    }
    /**
     * Set page size
     */
    setPageSize(val) {
      if (/^\d+$/.test(val)) {
        this.pageSize = val;
        return true;
      }
      return false;
    }
    /**
     * Empty collection
     */
    empty() {
      return this.clear();
    }
    /**
     * Set offset
     */
    setOffset(val) {
      if (/^\d+$/.test(val)) {
        this.offset = val;
        return true;
      }
      return false;
    }
    /**
     * Bulk update (not implemented)
     */
    update(data) {
      throw new Error("Not implemented... yet");
    }
    setUrl(url, type) {
      if (!url)
        return this;
      switch (type) {
        case "delete":
          this.deleteUrl = createURL(url);
          break;
        case "update":
          this.updateUrl = createURL(url);
          break;
        case "insert":
          this.insertUrl = createURL(url);
          break;
        default:
          log("setUrl", url);
          this.url = createURL(url);
          this.deleteUrl = typeof this.deleteUrl == "string" ? createURL(this.deleteUrl) : this.deleteUrl ?? createURL(this.url);
          this.updateUrl = typeof this.updateUrl == "string" ? createURL(this.updateUrl) : this.updateUrl ?? createURL(this.url);
          this.insertUrl = typeof this.insertUrl == "string" ? createURL(this.insertUrl) : this.insertUrl ?? createURL(this.url);
          break;
      }
      return this;
    }
    /**
     * Receive remote data
     * 
     * Processes JSON:API document by hydrating relationships and extracting data array.
     * Uses the new explicit hydration layer to replace relationship references with
     * actual resource objects from included resources.
     * 
     * IMPORTANT: For single item responses (e.g., from append/create), uses parseItemData()
     * to avoid wrapping in array and triggering collection replacement behavior.
     */
    receiveRemoteData(data) {
      dbg("Remote data received", data);
      if (this.adapter.isSingleItemResponse(data)) {
        const hydratedItem = this.adapter.parseItemResponse(data);
        this.adapter.applyMetadata(this, this.adapter.extractMetadata(data));
        if (this.items.length === 0) {
          this.view.reset(true);
        }
        dbg("Append single item to collection");
        let newItem = this.loadItem(hydratedItem);
        newItem.render(this.view, this.addontop);
        this._trigger("afterrender", this);
        return newItem;
      }
      const { items, meta } = this.adapter.parseCollectionResponse(data, { type: this.type });
      this.adapter.applyMetadata(this, meta);
      if (items == null) {
        return;
      }
      if (items.constructor === Array) {
        log("Append multiple items to collection");
        if (this.items.length === 0) {
          this.view.reset(true);
        }
        const loadedItems = [];
        items.forEach((item) => {
          const loadedItem = this.loadItem(item);
          if (loadedItem) {
            loadedItems.push(loadedItem);
          }
        });
        this.render();
        return loadedItems;
      }
    }
    /**
     * Extract metadata and data from JSON:API document
     * 
     * Extracts metadata (totalRecords, offset) from JSON:API response meta object
     * and returns the hydrated data array. Data hydration is handled by
     * parseCollectionData() before this is called.
     * 
     * @param {Object} data - JSON:API document (data property should already be hydrated)
     * @returns {Array} Array of hydrated item data objects
     */
    extractMetadataAndData(data) {
      dbg("extract metadata and data", data);
      if (!data.hasOwnProperty("data")) {
        return data;
      }
      this.adapter.applyMetadata(this, this.adapter.extractMetadata(data));
      return data.data;
    }
    /**
     * Parse collection data from JSON:API document (legacy alias)
     * 
     * @deprecated Use extractMetadataAndData() instead
     * @param {Object} data - JSON:API document
     * @returns {Array} Array of hydrated item data objects
     */
    parse(data) {
      return this.extractMetadataAndData(data);
    }
    /**
     * Load from data
     */
    loadFromData(data) {
      dbg("collection load from data", data);
      if (data === null || typeof data !== "object" || data.constructor !== Array) {
        dbg("cannot load ", data, " into collection ", this);
        return this;
      }
      if (this.navtype === "page") {
        this.items = [];
      }
      data.forEach((item) => {
        this.loadItem(item);
      });
      if (this.view) {
        this.view.render();
      } else {
        dbg("collection does not have a view ", this);
      }
      this._trigger("load", this);
      return this;
    }
    /**
     * Next page
     */
    next() {
      this.offset = parseInt(this.offset) + parseInt(this.pageSize);
      this.loadFromRemote();
    }
    /**
     * Previous page
     */
    prev() {
      this.offset = parseInt(this.offset) - parseInt(this.pageSize);
      this.loadFromRemote();
    }
    /**
     * Clear collection
     * 
     * Synchronously clears items array and renders empty state.
     * For async item cleanup, use destroy() instead.
     * 
     * @returns {Collection} This instance for chaining
     */
    clear() {
      this.items = [];
      if (this.view) {
        this.view.render();
      }
      this._trigger("update", this);
      return this;
    }
    /**
     * Render collection
     */
    render() {
      if (this.view) {
        this.view.render();
      }
      this._trigger("afterrender", this);
      return this;
    }
    /**
     * Load from remote
     * 
     * Canonical method for loading collection data from API
     */
    loadFromRemote() {
      return this.loadFromDataSource();
    }
    load(data) {
      return data ? this.loadFromData(data) : this.loadFromRemote();
    }
    /**
     * Load from data source (internal implementation)
     * @private
     */
    loadFromDataSource() {
      const overlay = createOverlay(this);
      let loader = null;
      if (this.view && this.view.el) {
        loader = $(overlay).clone().insertBefore(this.view.el).width($(this.view.el).width()).height($(this.view.el).height());
      }
      this._trigger("beforeload", this);
      return new Promise((resolve, reject) => {
        if (!this.url) {
          loader.remove();
          reject(new Error("No valid URL provided"));
          return;
        }
        this.adapter.applyListQuery(this.url, {
          type: this.type,
          offset: this.offset,
          pageSize: this.pageSize
        });
        let urlString = this.url.toString ? this.url.toString() : this.url;
        this.storage.read(this, urlString, {}).then((res) => {
          if (this.navtype === "page") {
            this.items = [];
          }
          this.receiveRemoteData(res.data);
          this._trigger("load", this);
          if (loader) {
            $(loader).remove();
          }
          if (this.paging) {
            this.paging.render();
          }
          resolve(this);
        }).catch((error2) => {
          if (error2 instanceof Error && error2.jqXHR) {
            this.fail(error2.jqXHR, error2.textStatus || "error", error2.errorThrown || error2);
            loader.remove();
            reject(error2);
          } else if (error2 && error2.jqXHR) {
            this.fail(error2.jqXHR, error2.textStatus, error2.errorThrown);
            loader.remove();
            reject(error2);
          } else {
            this.fail(null, "error", error2);
            loader.remove();
            reject(error2);
          }
        });
      });
    }
    /**
     * Handle failure
     */
    fail(xhr, txt, err) {
      dbg("Fail to load collection", xhr, txt, err, this);
    }
    /**
     * On update callback
     */
    onupdate() {
      console.log("onupdate");
      this._trigger("update", this);
      return this;
    }
    /**
     * Insert a single new item into collection
     * 
     * Creates a single item via POST request and adds it to the collection.
     * The server response should contain the created item in JSON:API format.
     * 
     * @param {Object} itemData - Single item data object (not an array)
     * @returns {Promise<Item>} Promise resolving to the created Item instance
     * @throws {Error} If itemData is an array (use batchInsert() instead)
     */
    insert(itemData) {
      if (Array.isArray(itemData)) {
        throw new Error("insert() expects a single item object. Use batchInsert() for multiple items.");
      }
      const payload = this.adapter.serializeForCreate(itemData, { type: this.type });
      return new Promise((resolve, reject) => {
        if (!this.insertUrl) {
          this.insertUrl = this.url;
        }
        let insertUrlString = this.insertUrl.toString ? this.insertUrl.toString() : this.insertUrl;
        this.storage.create(this, insertUrlString, { contentType: payload.contentType }, payload.body).then((resp) => {
          let data = resp.data;
          let newItem = this.receiveRemoteData(data);
          log("newItem", newItem);
          this.onupdate();
          resolve(newItem);
        }).catch((resp) => {
          dbg("fail to receive data", resp);
          reject(resp);
        });
      });
    }
    /**
     * Batch insert multiple items into collection
     * 
     * Creates multiple items via POST request and adds them to the collection.
     * The server response should contain an array of created items in JSON:API format.
     * 
     * @param {Array} itemsData - Array of item data objects
     * @returns {Promise<Array<Item>>} Promise resolving to array of created Item instances
     * @throws {Error} If itemsData is not an array
     */
    batchInsert(itemsData) {
      if (!Array.isArray(itemsData)) {
        throw new Error("batchInsert() expects an array of items. Use insert() for a single item.");
      }
      if (itemsData.length === 0) {
        return Promise.resolve([]);
      }
      const payload = this.adapter.serializeForCreate(itemsData, { type: this.type });
      return new Promise((resolve, reject) => {
        if (!this.insertUrl) {
          this.insertUrl = this.url;
        }
        let insertUrlString = this.insertUrl.toString ? this.insertUrl.toString() : this.insertUrl;
        this.storage.create(this, insertUrlString, { contentType: payload.contentType }, payload.body).then((resp) => {
          let data = resp.data;
          const result = this.receiveRemoteData(data);
          const newItems = Array.isArray(result) ? result : result ? [result] : [];
          log("batchInsert newItems", newItems);
          this.onupdate();
          resolve(newItems);
        }).catch((resp) => {
          dbg("fail to receive batch data", resp);
          reject(resp);
        });
      });
    }
    /**
     * @deprecated Use insert() for single items or batchInsert() for multiple items
     * This method is bivalent and will be removed in a future version.
     * Alias for backward compatibility - delegates to insert() or batchInsert() based on input type.
     */
    append(itemData) {
      if (Array.isArray(itemData)) {
        return this.batchInsert(itemData);
      } else {
        return this.insert(itemData);
      }
    }
    /**
     * @deprecated Use insert() instead
     * Alias for backward compatibility
     */
    createItem(itemData) {
      return this.insert(itemData);
    }
    /**
     * @deprecated Use insert() instead
     * Alias for backward compatibility
     */
    newItem(itemData) {
      return this.insert(itemData);
    }
    /**
     * Load item
     */
    loadItem(itemData) {
      log("loadItem from collection", itemData);
      if (!itemData) {
        log("no item data", itemData);
        return null;
      }
      let opts = {
        type: this.type,
        collection: this,
        uievents: this.uievents,
        storage: this.storage,
        adapter: this.adapter
      };
      if (this.setAttrAsId && itemData.id == null) {
        log("set item id from attribute", this.setAttrAsId, itemData);
        itemData.id = itemData.attributes[this.setAttrAsId];
      }
      if (itemData.id && this.url) {
        let tmp;
        const url = createURL(this.url.toString());
        url.path += "/" + itemData.id;
        opts.url = createURL(url.toString());
        const updateUrl = createURL(this.updateUrl.toString());
        updateUrl.path += "/" + itemData.id;
        opts.updateUrl = createURL(updateUrl.toString());
        const deleteUrl = createURL(this.deleteUrl.toString());
        deleteUrl.path += "/" + itemData.id;
        opts.deleteUrl = createURL(deleteUrl.toString());
        const insertUrl = createURL(this.insertUrl.toString());
        insertUrl.path += "/" + itemData.id;
        opts.insertUrl = createURL(insertUrl.toString());
      }
      if (this.itemListeners) {
        opts.itemListeners = this.itemListeners;
      }
      let newItem = new Item(opts).bindView(new ItemView({
        template: this.template,
        container: this.view
      })).loadFromData(itemData);
      if (this.addontop) {
        dbg("Add on top");
        this.items.unshift(newItem);
      } else {
        this.items.push(newItem);
      }
      return newItem;
    }
    /**
     * Destroy collection and clean up resources
     * 
     * Removes event handlers, destroys all items and views, clears references.
     * Safe to call multiple times.
     * 
     * @returns {Collection} This instance for chaining
     */
    destroy() {
      const itemsToDestroy = [...this.items];
      itemsToDestroy.forEach((item) => {
        if (item && typeof item.destroy === "function") {
          item.destroy();
        }
      });
      this.items = [];
      if (this.view && typeof this.view.destroy === "function") {
        this.view.destroy();
      }
      this.view = null;
      if (this.filtering && typeof this.filtering.destroy === "function") {
        this.filtering.destroy();
      }
      this.filtering = null;
      if (this.paging && typeof this.paging.destroy === "function") {
        this.paging.destroy();
      }
      this.paging = null;
      this.callbacks = {};
      this.storage = null;
      this.url = null;
      this.deleteUrl = null;
      this.insertUrl = null;
      this.updateUrl = null;
      this.items = [];
      this.total = null;
      this.offset = 0;
      return this;
    }
  };

  // src/Filtering.js
  var Filtering = class {
    constructor(filterForm, collection) {
      this.collection = collection;
      this.el = filterForm;
      let $form = $(filterForm);
      $form.data("instance", collection).on("submit", (e) => {
        dbg("Filter form was submitted");
        e.preventDefault();
        this.handleSubmit($form[0]);
      }).on("reset", () => {
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
      if (this.el) {
        const $form = $(this.el);
        $form.off("submit");
        $form.off("reset");
        if (typeof $form.removeData === "function") {
          $form.removeData("instance");
        }
      }
      this.collection = null;
      this.el = null;
      return this;
    }
  };

  // src/Sorting.js
  var Sorting = class {
    constructor(sortHeader, collection) {
      this.el = sortHeader;
      this.collection = collection;
      const $sorts = sortHeader.find("[data-sortfld]").data("instance", this.collection).on("click", this.sortNow.bind(this));
    }
    sortNow(ev) {
      let $lnk = $(ev.currentTarget);
      let fld = $lnk.data("sortfld");
      let dir = $lnk.data("sortdir");
      let inst = this.collection;
      let sort = inst.url.parameters.hasOwnProperty("sort") ? inst.url.parameters.sort : "";
      let sortArr = [];
      sort.split(",").forEach(function(item) {
        let res = /^(-*)([a-z0-9\-\_]+)$/.exec(item.trim());
        if (!res)
          return;
        if (res[2] == fld)
          return;
        sortArr.push(item);
      });
      switch (dir) {
        case "up":
          sortArr.push("-" + fld);
          $lnk.data("sortdir", "down");
          $lnk.find(".sort-up").hide();
          $lnk.find(".sort-down").show();
          $lnk.find(".sort-default").hide();
          break;
        case "down":
          $lnk.data("sortdir", null);
          $lnk.find(".sort-up").hide();
          $lnk.find(".sort-down").hide();
          $lnk.find(".sort-default").show();
          break;
        default:
          $lnk.data("sortdir", "up");
          sortArr.push(fld);
          $lnk.find(".sort-up").show();
          $lnk.find(".sort-down").hide();
          $lnk.find(".sort-default").hide();
      }
      let nxtSort = sortArr.join(",");
      if (sort !== nxtSort) {
        inst.url.parameters.sort = nxtSort;
        inst.loadFromRemote();
      }
    }
    destroy() {
      if (this.el) {
        $(this.el).find("[data-sortfld]").each(function(sort) {
          $(this).off("click");
          $(this).removeData("instance");
        });
      }
      return this;
    }
  };

  // src/utilities.js
  var utilities = {
    /**
     * Fill form fields with data from instance
     */
    fillForm: function(form, instance) {
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
        if ($inp.attr("type") === "date") {
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
            $("<option>").val(rel.id).text(lblVal).appendTo($(formElRel));
          }
          $(formElRel).val(rel.id);
        }
      });
    },
    /**
     * Capture form submit event and redirect it to callback
     */
    captureFormSubmit: function(form, cb) {
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
    fetchFormData: function(form) {
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
        let arrayMatch = /(\w+)\[\]/.exec(name);
        if (arrayMatch) {
          let arrayName = arrayMatch[1];
          if (!formElements[arrayName]) {
            formElements[arrayName] = [];
          }
          formElements[arrayName].push(value);
        } else {
          formElements[name] = value;
        }
      });
      return formElements;
    },
    /**
     * Extract form data - alias for fetchFormData (for backward compatibility)
     */
    extractFormData: function(form) {
      return this.fetchFormData(form);
    }
  };

  // src/KViews.js
  var KViews = class _KViews {
    /**
     * Helper: Extract and merge options from element and parameters
     */
    static prepareOptions(el, opts) {
      if (!el) {
        dbg("Warning: no DOM element provided for apiator");
        return null;
      }
      if (typeof opts === "string") {
        opts = {
          url: opts
        };
      }
      let options = { dataBindings: {}, addontop: false };
      options = Object.assign(options, $(el).data());
      try {
        Object.assign(options, parseOptions(opts));
      } catch (e) {
        throw new Error("Error on KViews init", e);
      }
      return options;
    }
    /**
     * Helper: Check for existing instance and update if found
     * 
     * SAFE UPDATE CONTRACT:
     * Only updates whitelisted safe configuration options.
     * Does not overwrite internal runtime state (callbacks, items, views, etc.)
     * 
     * Safe to update:
     * - url, updateUrl, deleteUrl, insertUrl (via setUrl)
     * - template, type, pageSize, offset (configuration)
     * - emptyview, filter, paging (view configuration)
     * 
     * NOT updated (internal state):
     * - callbacks, items, views, storage, filtering, paging instances
     * - length, total, iterator (runtime state)
     */
    static getOrUpdateInstance(el, options) {
      let existingInstance = $(el).data("instance");
      if (existingInstance !== void 0) {
        const safeUpdateOptions = [
          "url",
          "updateUrl",
          "deleteUrl",
          "insertUrl",
          "template",
          "type",
          "pageSize",
          "offset",
          "emptyview",
          "filter",
          "paging",
          "addontop",
          "uievents",
          "setAttrAsId",
          "itemListeners",
          "itemOn",
          "headers",
          "adapter"
        ];
        if (options.url) {
          existingInstance.setUrl(options.url);
          delete options.url;
        }
        const parsedOptions = parseOptions(options);
        const safeUpdates = {};
        safeUpdateOptions.forEach((key) => {
          if (parsedOptions.hasOwnProperty(key)) {
            safeUpdates[key] = parsedOptions[key];
          }
        });
        Object.assign(existingInstance, safeUpdates);
        if (safeUpdates.adapter) {
          existingInstance.adapter = resolveAdapter(safeUpdates.adapter);
        }
        if (safeUpdates.headers && existingInstance.storage && existingInstance.storage.defaultOptions) {
          existingInstance.storage.defaultOptions.headers = Object.assign(
            {},
            existingInstance.storage.defaultOptions.headers || {},
            safeUpdates.headers
          );
        }
        return existingInstance;
      }
      return null;
    }
    /**
     * Helper: Handle emptyview option
     */
    static processEmptyView(options) {
      if (options.hasOwnProperty("emptyview")) {
        options.emptyview = $(options.emptyview).remove();
      }
    }
    /**
     * Helper: Attach listeners and finalize instance
     */
    static finalizeInstance(el, instance, options, listeners) {
      if (listeners) {
        Object.getOwnPropertyNames(listeners).forEach((eventName) => {
          instance.on(eventName, listeners[eventName]);
        });
      }
      $(el).data("instance", instance);
      dbg("instance", instance.url);
      if (instance.url && (typeof options.dontload === "undefined" || !options.dontload)) {
        log("loadFromRemote now", options, instance);
        instance.loadFromRemote();
      }
      return instance;
    }
    /**
     * Create collection instance
     */
    static createCollectionInstance(el, opts) {
      let options = _KViews.prepareOptions(el, opts);
      log("createCollectionInstance", options);
      if (!options) {
        return null;
      }
      let existingInstance = _KViews.getOrUpdateInstance(el, options);
      if (existingInstance) {
        return existingInstance;
      }
      dbg("init apiator collection on ", el, options);
      _KViews.processEmptyView(options);
      let listeners = options.on;
      delete options.on;
      dbg("Create collection instance", options);
      let templateTxt = $(el).length ? $(el).html() : null;
      if (options.template) {
        if (options.template instanceof jQuery) {
          dbg("template is jQuery object", options.template, el);
          let $tpl = $(options.template).clone().removeAttr("id");
          templateTxt = $("<div>").append($tpl).html();
        } else if (typeof options.template === "string") {
          dbg("template is raw text: can be either a jQuery selector or raw HTML", options.template, el);
          templateTxt = $("<div>").append($(options.template).clone().removeAttr("id")).html();
        }
      }
      if (templateTxt !== null) {
        templateTxt = templateTxt.replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&apos;/gi, "'").replace(/&quot;/gi, '"').replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&");
        options.template = template(templateTxt);
      }
      let collectionConfig = {
        el,
        itemsContainer: options.hasOwnProperty("container") ? $(options.container) : el,
        allowempty: options.disableempty !== true
      };
      options.view = new CollectionView(collectionConfig);
      log("Collection constructor", options);
      let instance = new Collection(options);
      if (options.hasOwnProperty("filter")) {
        let filterEl = $(options.filter);
        if (filterEl.length && filterEl.prop("tagName") === "FORM") {
          instance.filtering = new Filtering(filterEl, instance);
        }
      }
      if (options.hasOwnProperty("sort")) {
        log("setup sorting", options.sort);
        let sortEl = $(options.sort);
        if (sortEl.length) {
          instance.sorting = new Sorting(sortEl, instance);
        }
      }
      _KViews.finalizeInstance(el, instance, options, listeners);
      return instance;
    }
    /**
     * Create item instance
     */
    static createItemInstance(el, opts, data = null) {
      let options = _KViews.prepareOptions(el, opts);
      if (!options) {
        return null;
      }
      let existingInstance = _KViews.getOrUpdateInstance(el, options);
      if (existingInstance) {
        return existingInstance;
      }
      dbg("init apiator item on ", el, options);
      _KViews.processEmptyView(options);
      let listeners = options.on;
      delete options.on;
      options.template = null;
      let templateTxt = null;
      if ($(el).length) {
        var node = $(el)[0];
        templateTxt = node ? node.outerHTML : null;
      }
      if (templateTxt) {
        templateTxt = templateTxt.replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&apos;/gi, "'").replace(/&quot;/gi, '"').replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&");
        options.template = template(templateTxt);
      }
      let elId = $(el).attr("id");
      let instance = new Item(options, data).bindView(new ItemView({
        template: options.template,
        el,
        id: elId ? elId : null
      }));
      _KViews.finalizeInstance(el, instance, options, listeners);
      if (options.dontload && instance.attributes && Object.keys(instance.attributes).length > 0) {
        instance.render();
      }
      return instance;
    }
    static helpers = utilities;
    /**
     * Global default data adapter (name or instance). Defaults to 'jsonapi'.
     */
    static get defaultAdapter() {
      return getDefaultAdapter();
    }
    static set defaultAdapter(adapter) {
      setDefaultAdapter(adapter);
    }
    /**
     * Register a custom data adapter by name.
     *
     * @param {string} name
     * @param {object} adapter
     */
    static registerAdapter(name, adapter) {
      registerAdapter(name, adapter);
    }
  };
  Object.defineProperty(KViews, "baseUrl", {
    enumerable: true,
    configurable: true,
    get() {
      return apiBaseConfig.baseUrl;
    },
    set(v) {
      apiBaseConfig.baseUrl = v;
    }
  });
  Object.defineProperty(KViews, "basePath", {
    enumerable: true,
    configurable: true,
    get() {
      return apiBaseConfig.basePath;
    },
    set(v) {
      apiBaseConfig.basePath = v;
    }
  });
  Object.defineProperty(KViews, "defaultHeaders", {
    enumerable: true,
    configurable: true,
    get() {
      return apiBaseConfig.defaultHeaders;
    },
    set(v) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        apiBaseConfig.defaultHeaders = v;
      } else {
        apiBaseConfig.defaultHeaders = {};
      }
    }
  });

  // src/index.js
  var index_default = KViews;
  if (typeof window !== "undefined") {
    window.KViews = KViews;
  }
  if (typeof $ !== "undefined" && $.fn) {
    $.fn.kviews = function(opts) {
      let el = this.length ? this[0] : this;
      let resourcetype = "collection";
      if (opts && opts.resourcetype) {
        resourcetype = opts.resourcetype;
      } else {
        let dataResourcetype = $(el).data("resourcetype");
        if (dataResourcetype) {
          resourcetype = dataResourcetype;
        }
      }
      if (resourcetype === "item") {
        return KViews.createItemInstance(el, opts);
      } else {
        return KViews.createCollectionInstance(el, opts);
      }
    };
    Object.defineProperty($.fn.kviews, "baseUrl", {
      enumerable: true,
      configurable: true,
      get() {
        return apiBaseConfig.baseUrl;
      },
      set(v) {
        apiBaseConfig.baseUrl = v;
      }
    });
    Object.defineProperty($.fn.kviews, "basePath", {
      enumerable: true,
      configurable: true,
      get() {
        return apiBaseConfig.basePath;
      },
      set(v) {
        apiBaseConfig.basePath = v;
      }
    });
    Object.defineProperty($.fn.kviews, "defaultHeaders", {
      enumerable: true,
      configurable: true,
      get() {
        return apiBaseConfig.defaultHeaders;
      },
      set(v) {
        if (v && typeof v === "object" && !Array.isArray(v)) {
          apiBaseConfig.defaultHeaders = v;
        } else {
          apiBaseConfig.defaultHeaders = {};
        }
      }
    });
    $.fn.kviewsCollection = function(opts) {
      let options = {
        resourcetype: "collection"
      };
      if (typeof opts === "undefined") {
        opts = {};
      }
      if (typeof opts === "string") {
        opts = {
          url: opts
        };
      }
      opts = Object.assign(opts, options);
      return this.kviews(opts);
    };
    $.fn.kviewsItem = function(opts) {
      let options = {
        resourcetype: "item"
      };
      if (typeof opts === "undefined") {
        opts = {};
      }
      if (typeof opts === "string") {
        opts = {
          url: opts
        };
      }
      opts = Object.assign(opts, options);
      return this.kviews(opts);
    };
  }
  return index_default;
})();
//# sourceMappingURL=kviews.js.map

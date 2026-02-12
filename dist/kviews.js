/*!
 * KViews - Class-based API data binding library
 * Version: 1.0.0
 * Built: 2026-02-12T05:25:45.164Z
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
    KViews: () => KViews2,
    Paging: () => Paging,
    Storage: () => Storage,
    URL: () => URL,
    createOverlay: () => createOverlay,
    createURL: () => createURL,
    dbg: () => dbg,
    deepmerge: () => deepmerge,
    default: () => index_default,
    error: () => error,
    getBoundObjects: () => getBoundObjects,
    log: () => log,
    parseOptions: () => parseOptions,
    template: () => template,
    uid: () => uid,
    utilities: () => utilities
  });

  // src/utils.js
  function dbg() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel == 3) {
      console.trace(...arguments);
    }
  }
  function log() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel == 2) {
      console.log(...arguments);
    }
  }
  function error() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel == 1) {
      console.error(...arguments);
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
    if (!el || typeof $ !== "undefined" && $(el).length === 0) {
      return db;
    }
    let boundData;
    if (typeof $ !== "undefined") {
      boundData = $(el).data();
    } else {
      boundData = {};
      if (el.dataset) {
        Object.keys(el.dataset).forEach((key) => {
          try {
            db[key] = JSON.parse(el.dataset[key]);
          } catch (e) {
            db[key] = el.dataset[key];
          }
        });
      }
      return db;
    }
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
  function createOverlay() {
    if (typeof $ !== "undefined") {
      return $("<div>").text("Se incarca").addClass("komponent-overlay").attr("style", "background: silver; text-align: center;position:absolute; z-index:100000");
    }
    const overlay = document.createElement("div");
    overlay.textContent = "Se incarca";
    overlay.className = "komponent-overlay";
    overlay.style.cssText = "background: silver; text-align: center;position:absolute; z-index:100000";
    return overlay;
  }

  // src/URL.js
  var URL = class {
    constructor(url) {
      if (!url) {
        throw new Error("URL is not provided");
      }
      if (typeof url === "object" && url.hasOwnProperty("protocol")) {
        Object.assign(this, url);
        return;
      }
      if (url.constructor !== String) {
        dbg("URL is not a string", url);
        throw "URL is not a string: " + url.toString();
      }
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
        let tmp = parts[7].split("&");
        tmp.forEach(function(item) {
          if (!item || item === "") {
            return;
          }
          let eqPos = item.indexOf("=");
          if (eqPos === -1) {
            this.parameters[item] = "";
          } else {
            this.parameters[item.substr(0, eqPos)] = item.substr(eqPos + 1);
          }
        }.bind(this));
      }
      if (typeof parts[8] !== "undefined") {
        this.fragment = parts[8];
      }
      this.parameters.toString = function() {
        let paras = [];
        for (let para in this) {
          if (this.hasOwnProperty(para) && para !== "toString") {
            paras.push(para + "=" + this[para]);
          }
        }
        return paras.join("&");
      };
    }
    toString() {
      let str = "";
      if (this.protocol && this.fqdn) {
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
      return fetch(options.url, fetchOptions).then(async (response) => {
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
          throw {
            options,
            jqXHR,
            textStatus: "error",
            errorThrown: new Error(`HTTP ${response.status}: ${response.statusText}`)
          };
        }
        return {
          data,
          textStatus: "success",
          jqXHR
        };
      }).catch((error2) => {
        const jqXHR = {
          status: 0,
          statusText: "error",
          responseText: null,
          responseJSON: null,
          getAllResponseHeaders: () => "",
          getResponseHeader: () => null
        };
        if (error2.jqXHR) {
          throw error2;
        }
        throw {
          options,
          jqXHR,
          textStatus: "error",
          errorThrown: error2 instanceof Error ? error2 : new Error(String(error2))
        };
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
  var itemsArr = {};
  function flattenDoc(doc) {
    let arr = [];
    if (doc.hasOwnProperty("data") && doc.data !== null) {
      if (doc.data.constructor === Array) {
        arr = doc.data;
      } else {
        arr.push(doc.data);
      }
    }
    if (doc.hasOwnProperty("includes")) {
      arr = arr.concat(doc.includes);
    }
    arr.forEach(function(item) {
      if (!itemsArr.hasOwnProperty(item.type + "/" + item.id)) {
        itemsArr[item.type + "/" + item.id] = item;
      }
    });
    return arr;
  }
  function buildDb(data) {
    let db = {
      __get: function(resName, keyId) {
        if (!resName) {
          return null;
        }
        if (resName.constructor === Object && resName.hasOwnProperty("id") && resName.hasOwnProperty("type")) {
          keyId = resName.id;
          resName = resName.type;
        }
        if (!this.hasOwnProperty(resName)) {
          return null;
        }
        if (!this[resName].hasOwnProperty(keyId)) {
          return null;
        }
        return this[resName][keyId];
      },
      __add: function(resName, keyId, data2) {
        if (!resName) {
          return null;
        }
        if (resName.constructor === Object && resName.hasOwnProperty("id") && resName.hasOwnProperty("type")) {
          keyId = resName.id;
          resName = resName.type;
          if (resName.hasOwnProperty("data")) {
            data2 = resName.data;
          }
        }
        if (!this.hasOwnProperty(resName)) {
          this[resName] = {};
        }
        if (!this[resName].hasOwnProperty(keyId)) {
          this[resName][keyId] = {
            id: keyId,
            type: resName
          };
        }
        if (data2) {
          this[resName][keyId] = data2;
        }
        return this[resName][keyId];
      }
    };
    if (data.hasOwnProperty("data")) {
      db = deepmerge(db, parseDataProperty(data.data));
    }
    if (data.hasOwnProperty("includes")) {
      db = deepmerge(db, parseIncludesProperty(data.includes));
    }
    Object.getOwnPropertyNames(db).forEach(function(resName) {
      if (resName === "__get" || resName === "__add") return;
      Object.getOwnPropertyNames(db[resName]).forEach(function(keyId) {
        if (!db[resName][keyId]) {
          return;
        }
        if (!db[resName][keyId].hasOwnProperty("relationships")) {
          return;
        }
        Object.getOwnPropertyNames(db[resName][keyId].relationships).forEach(function(relName) {
          if (!db[resName][keyId].relationships[relName].hasOwnProperty("data") || !db[resName][keyId].relationships[relName].data) {
            db[resName][keyId].relationships[relName] = null;
            return;
          }
          let relTmp = db[resName][keyId].relationships[relName].data;
          if (relTmp.constructor === Object) {
            let tmp = db.__get(relTmp);
            if (!tmp) {
              tmp = db.__add(relTmp);
            }
            db[resName][keyId].relationships[relName] = tmp;
          }
          if (relTmp.constructor === Array) {
            db[resName][keyId].relationships[relName] = [];
            for (let i = 0; i < relTmp.length; i++) {
              let tmp = db.__get(relTmp[i].type, relTmp[i].id);
              db[resName][keyId].relationships[relName].push(tmp ? tmp : relTmp[i]);
            }
          }
        });
      });
    });
    function parseDataProperty(data2) {
      let db2 = {};
      if (!data2) {
        return db2;
      }
      if (data2.constructor === Object) {
        data2 = [data2];
      }
      if (data2.constructor !== Array) {
        return db2;
      }
      return addItems2Db(data2);
    }
    function parseIncludesProperty(data2) {
      let db2 = {};
      if (!data2 || data2.constructor !== Array) {
        return db2;
      }
      return addItems2Db(data2);
    }
    function addItems2Db(items) {
      let db2 = {};
      items.forEach(function(item) {
        if (!item.hasOwnProperty("attributes") && !item.hasOwnProperty("relationships")) {
          return;
        }
        if (!db2.hasOwnProperty(item.type)) {
          db2[item.type] = {};
        }
        db2[item.type][item.id] = item;
      });
      return db2;
    }
    return db;
  }
  function parseItemData(data, db) {
    let obj = {};
    let jsonApiObj = data.data;
    if (data.hasOwnProperty("links") && data.links && data.links.hasOwnProperty("self")) {
      obj.url = createURL(data.links.self);
    }
    let jsonApiItem = data.hasOwnProperty("data") ? data.data : data;
    let tmp = db.__get(jsonApiItem);
    if (tmp === null) {
      tmp = {};
    }
    obj = deepmerge(obj, tmp);
    if (!obj.relationships) {
      return obj;
    }
    Object.getOwnPropertyNames(obj.relationships).forEach(function(relName) {
      if (obj.relationships[relName] === null) {
        return;
      }
      let relUrl = null;
      if (jsonApiObj.relationships[relName].hasOwnProperty("links") && jsonApiObj.relationships[relName].links.hasOwnProperty("related")) {
        relUrl = jsonApiObj.relationships[relName].links.related;
      }
      let relData = obj.relationships[relName];
    });
    return obj;
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
      if (params && (params.length || params.nodeName)) {
        dbg("params is actually a jquery object or an html node", params);
        let $el;
        if (typeof $ !== "undefined") {
          $el = $(params);
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
        } else {
          let el = params.nodeName ? params : params[0];
          let html = el.outerHTML.replace(/&lt;%/gi, "<%").replace(/&lt;/gi, "<").replace(/%&gt;/gi, "%>").replace(/&gt;/gi, ">").replace(/&amp;/gi, "&");
          params = {
            template: template(html),
            el
          };
          if (el.id) {
            params.id = el.id;
          }
        }
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
        let data = this.item.attributes;
        if (this.item.relationships) {
          Object.assign(data, this.item.relationships);
        }
        let html = this.template(data);
        if (typeof $ !== "undefined") {
          el = $(html).attr("data-type", "item").attr("id", this.id).data("view", this).data("instance", this.item);
        } else {
          let div = document.createElement("div");
          div.innerHTML = html;
          el = div.firstElementChild || div;
          if (el) {
            el.setAttribute("data-type", "item");
            el.setAttribute("id", this.id);
            el._view = this;
            el._instance = this.item;
          }
        }
      } catch (e) {
        dbg("Error create view from template", e, this.item);
        if (typeof $ !== "undefined") {
          el = $("<div>Could not render view: <strong>" + e.toString() + "</strong></div>");
        } else {
          el = document.createElement("div");
          el.innerHTML = "Could not render view: <strong>" + e.toString() + "</strong>";
        }
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
      this.callbacks.afterrender.forEach((cb) => cb(this));
    }
    /**
     * Render the view
     */
    render(doNotAttachToContainer = false, addontop = false) {
      dbg("ItemView.render called", this.item, this.el);
      let renderedEl = this.createElementFromTemplate();
      if (!renderedEl) {
        return null;
      }
      dbg("View item", this.item);
      if (this.item && this.item.uievents) {
        this.item.uievents.forEach((action) => {
          if (action.selector && action.event && action.callback) {
            console.log("setup event", action);
            const actionEl = typeof $ !== "undefined" ? $(renderedEl).find(action.selector)[0] || null : renderedEl.querySelector(action.selector);
            if (actionEl) {
              actionEl.addEventListener(action.event, (event) => {
                event.preventDefault();
                console.log("event triggered", event, this.item, this);
                action.callback(event, this.item, this);
              });
            }
          }
        });
      }
      if (!renderedEl) {
        return null;
      }
      if (doNotAttachToContainer) {
        this.el = renderedEl;
        return this.el;
      }
      if (this.el) {
        let oldEl = this.el;
        let oldElDom = typeof $ !== "undefined" && oldEl.jquery ? oldEl[0] : oldEl;
        if (typeof $ !== "undefined") {
          if (oldEl.jquery) {
            this.el = $(renderedEl).insertBefore(oldEl);
            oldEl.remove();
          } else {
            this.el = $(renderedEl).insertBefore(oldEl);
            $(oldEl).remove();
          }
        } else {
          if (oldElDom && oldElDom.parentNode) {
            oldElDom.parentNode.insertBefore(renderedEl, oldElDom);
            oldElDom.parentNode.removeChild(oldElDom);
          }
          this.el = renderedEl;
        }
        this.afterrender();
        return this;
      }
      this.el = renderedEl;
      this.afterrender();
      if (!this.container) {
        return this;
      }
      if (typeof $ !== "undefined") {
        $(this.el).appendTo(this.container.el);
      } else {
        if (this.container.el) {
          this.container.el.appendChild(this.el);
        }
      }
      return this;
    }
    /**
     * Render empty state
     */
    renderEmpty(returnView) {
      if (this.item && this.item.emptyview && this.el) {
        if (typeof $ !== "undefined") {
          let emptyView = $(this.item.emptyview).clone(true).css("display", "block");
          $(this.el).replaceWith(emptyView);
        } else {
          let emptyView = this.item.emptyview.cloneNode(true);
          emptyView.style.display = "block";
          if (this.el.parentNode) {
            this.el.parentNode.replaceChild(emptyView, this.el);
          }
        }
      }
    }
    /**
     * Remove view with animation
     */
    remove(idx) {
      return new Promise((resolve) => {
        if (this.item && this.item.collection && this.item.collection.onafterrender) {
          this.item.collection.onafterrender(this.item.collection);
        }
        if (typeof $ !== "undefined" && this.el && this.el.jquery) {
          $(this.el).fadeOut({
            complete: () => {
              $(this.el).remove();
              resolve();
            }
          });
        } else if (this.el) {
          if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
          }
          resolve();
        } else {
          resolve();
        }
      });
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
      try {
        Object.assign(this, parseOptions(options));
      } catch (e) {
        throw new Error("Error on Item init", e);
      }
      this.storage = options.storage || new Storage();
      let render = false;
      if (this.url) {
        this.setUrl(this.url);
      } else if (data) {
        console.log("Loading data", data);
        try {
          this.loadFromData(data);
          render = true;
        } catch (e) {
          console.error("Error loading data", e);
        }
      }
      this.views.forEach((view) => {
        view.item = this;
      });
      if (render) {
        console.log("Rendering data", data);
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
        default:
          this.url = createURL(url);
          this.deleteUrl = typeof this.deleteUrl == "string" ? createURL(this.deleteUrl) : this.deleteUrl ?? createURL(this.url);
          this.updateUrl = typeof this.updateUrl == "string" ? createURL(this.updateUrl) : this.updateUrl ?? createURL(this.url);
          break;
      }
      return this;
    }
    /**
     * Load from remote data source
     */
    loadFromRemote() {
      return this.load_from_data_source();
    }
    refresh() {
      return this.loadFromRemote();
    }
    reload() {
      return this.loadFromRemote();
    }
    /**
     * Load item data from data source storage
     */
    load_from_data_source() {
      let loaders = [];
      const overlay = createOverlay();
      this.views.forEach((itemView) => {
        if (typeof $ !== "undefined" && itemView.el) {
          let $el = $(itemView.el);
          let loader = overlay.clone();
          if (typeof loader.insertBefore === "function") {
            loader.insertBefore(itemView.el).width($el.width()).height($el.height());
          }
          loaders.push(loader);
        }
      });
      return new Promise((resolve, reject) => {
        if (!this.url) {
          throw new Error("No valid URL provided");
        }
        let urlString = this.url.toString ? this.url.toString() : this.url;
        this.storage.read(this, urlString, {}).then((resp) => {
          let data = resp.data;
          this.loadFromJSONAPIDoc(data).render();
          loaders.forEach((loader) => {
            if (typeof loader.remove === "function") {
              loader.remove();
            } else if (loader.parentNode) {
              loader.parentNode.removeChild(loader);
            }
          });
          resolve(this);
        }).catch((error2) => {
          dbg("fail to load item resource", this.url, error2);
          this.fail(error2.jqXHR || error2, error2.textStatus, error2.errorThrown);
          reject(error2);
        });
      });
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
      let $el;
      if (typeof $ !== "undefined") {
        $el = $(view);
        if ($el.length === 0) {
          throw new Error("Nothing to bind to: empty view element");
        }
      } else if (!view || !view.nodeName) {
        throw new Error("Nothing to bind to: invalid view element");
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
     * Load from JSON API document
     */
    loadFromJSONAPIDoc(data) {
      dbg("Load from JSONAPIDoc", data);
      if (this.collection && !this.collection.type) {
        this.type = data.data.type;
      }
      if (data.data && data.data.constructor === Array) {
        dbg("Invalid configuration: resource type is item but server response is collection", data);
        throw new Error("Invalid configuration: resource type is item but server response is collection");
      }
      Object.assign(this, parseItemData(data, buildDb(data)));
      this.url = createURL(this.url);
      return this;
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
     * Convert to JSON
     */
    toJSON() {
      let json = {
        type: this.type,
        attributes: this.attributes
      };
      if (this.id) {
        json.id = this.id;
      }
      if (this.attributes) {
        json.attributes = this.attributes;
      }
      if (!this.hasOwnProperty("relationships")) {
        return json;
      }
      json.relationships = {};
      for (let relName in this.relationships) {
        if (!this.relationships.hasOwnProperty(relName)) {
          continue;
        }
        json.relationships[relName] = {
          data: null
        };
        if (this.relationships[relName] === null) {
          continue;
        }
        if (this.relationships[relName].constructor === Object) {
          json.relationships[relName].data = this.relationships[relName].hasOwnProperty("toJSON") ? this.relationships[relName].toJSON() : this.relationships[relName];
          continue;
        }
        if (this.relationships[relName].constructor !== Array) {
          delete this.relationships[relName];
          delete json.relationships[relName];
          continue;
        }
        json.relationships[relName].data = [];
        for (let i = 0; i < this.relationships[relName].length; i++) {
          let tmp = this.relationships[relName][i].hasOwnProperty("toJSON") ? this.relationships[relName][i].toJSON() : this.relationships[relName][i];
          json.relationships[relName].data.push(tmp);
        }
      }
      dbg("item.json", json);
      return json;
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
            toUpdate.relationships[relaName] = this.relationships[relaName];
          }
        });
        if (!Object.getOwnPropertyNames(toUpdate.attributes).length && !Object.getOwnPropertyNames(toUpdate.relationships).length) {
          this.syncOp = null;
          resolve(this);
          return;
        }
        let patchData = JSON.stringify({ data: toUpdate });
        if (opts && opts.justSimulate) {
          dbg(patchData);
          resolve(this);
          return;
        }
        let updateUrlString = this.updateUrl.toString ? this.updateUrl.toString() : this.updateUrl;
        this.storage.update(this, updateUrlString, {}, patchData).then((resp) => {
          let newData = parseItemData(resp.data, buildDb(resp.data));
          Object.assign(this, newData);
          this.shadow = null;
          if (options.rerender) {
            this.views.forEach((view) => {
              view.render();
            });
          }
          if (this.callbacks.update) {
            this.callbacks.update.forEach((cb) => new Promise(() => cb(this)));
          }
          if (this.collection) {
            this.collection.onupdate();
          }
          resolve(this);
        }).catch((xhr) => {
          dbg("Update NOK", this.updateUrl, patchData, xhr);
          reject(xhr);
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
        if (rel && rel.hasOwnProperty("length")) {
          dbg("to fix");
          return rel;
        }
        if (typeof data === "object") {
          dbg("Update 1:1 relation");
          let item = new _Item().loadFromData(data);
          dbg("relation", item);
          return item;
        }
        if (rel && rel.id && rel.id === data) {
          return rel;
        }
        return {
          data: {
            id: data
          }
        };
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
          if (this.callbacks["remove"]) {
            this.callbacks["remove"].forEach((cb) => new Promise(() => cb(this)));
          }
          if (collection) {
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
      await this.storage.delete(this, this.deleteUrl.toString(), {});
      await this.remove();
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
          return;
        }
        if (view.container === collectionView) {
          dbg("collectionView matches view container so render view");
          view.render(false, addontop);
        }
      });
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
        if (typeof $ !== "undefined" && this.el) {
          $(this.el).empty();
        } else if (this.el) {
          this.el.innerHTML = "";
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
      if (typeof $ !== "undefined") {
        $(this.el).append(this.collection.emptyview);
      } else {
        this.el.appendChild(this.collection.emptyview);
      }
      return this;
    }
  };

  // src/Paging.js
  var Paging = class {
    constructor(pagingEl, collection) {
      this.collection = collection;
      if (typeof $ !== "undefined") {
        this.el = $(pagingEl);
      } else {
        this.el = pagingEl.nodeName ? pagingEl : pagingEl[0];
      }
      this.collection.paging = this;
      this.iniOffset = (this.collection.offset ? this.collection.offset : 0) * 1;
      this.defaultPageSize = 20;
      this.pageSize = this.collection.pageSize;
      this.setupPageSizeInput();
      this.setupOffsetInput();
      this.buttons = this.extractButtons();
      console.log("buttons", this.buttons);
      this.setupTotalCount();
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
        pageSizeInp = typeof this.collection.pagesizeinp === "string" ? document.querySelector(this.collection.pagesizeinp) : this.collection.pagesizeinp;
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
        offsetInp = typeof this.collection.offsetinp === "string" ? document.querySelector(this.collection.offsetinp) : this.collection.offsetinp;
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
        this.totalCountEl = typeof this.collection.totalrecscount === "string" ? document.querySelector(this.collection.totalrecscount) : this.collection.totalrecscount;
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
        if (title !== void 0) {
          btn.attr("title", title);
        }
        btn.on("click", clickHandler);
        $(this.el).append(btn);
      } else {
        btn = button.cloneNode(true);
        if (title !== void 0) {
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
      console.log("Paging obj", this, this.pageSize, total);
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
        let pageBtn;
        if (typeof $ !== "undefined") {
          pageBtn = this.buttons.page.clone();
          pageBtn.text(i + 1).attr("title", pageOffset).on("click", () => {
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
          console.log("last button", total, lastPageOffset, this.pageSize, this.offset);
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
      let offsetInp;
      if (typeof $ !== "undefined") {
        offsetInp = $(this.collection.offsetinp);
        if (offsetInp.length) {
          offsetInp.val(this.iniOffset);
        }
      } else {
        offsetInp = typeof this.collection.offsetinp === "string" ? document.querySelector(this.collection.offsetinp) : this.collection.offsetinp;
        if (offsetInp) {
          offsetInp.value = this.iniOffset;
        }
      }
    }
  };

  // src/Collection.js
  var Collection = class {
    constructor(opts = {}) {
      let allowedOptions = [
        "url",
        "deleteUrl",
        "insertUrl",
        "updateUrl",
        "view",
        "offset",
        "pageSize",
        "template",
        "type",
        "emptyview",
        "filter",
        "pagesize",
        "resourcetype",
        "dataBindings",
        "addontop",
        "template",
        "uievents",
        "paging",
        "pagesizeinp"
      ];
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
      this.length = 0;
      this.items = [];
      this.addontop = false;
      this.uievents = [];
      this.onafterrender = null;
      this.onbeforeload = null;
      this.callbacks = {};
      this.iterator = -1;
      try {
        opts = parseOptions(opts);
      } catch (e) {
        throw new Error("Error on Collection init", e);
      }
      let options = {};
      Object.getOwnPropertyNames(opts).forEach((key) => {
        if (allowedOptions.indexOf(key) !== -1) {
          options[key] = opts[key];
        }
      });
      Object.assign(this, options);
      if (options.hasOwnProperty("paging") && $(options.paging).length) {
        this.paging = new Paging($(options.paging)[0], this);
      }
      if (this.url) {
        this.setUrl(this.url);
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
      this.storage = opts.hasOwnProperty("storage") ? opts.storage : opts.hasOwnProperty("ajaxOpts") ? new Storage(opts.ajaxOpts) : new Storage();
      if (typeof opts.listeners === "object") {
        for (let event in opts.listeners) {
          this.on(event, opts.listeners[event]);
        }
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
     * Show listeners (debug)
     */
    showlisteners() {
      dbg(this.callbacks);
    }
    /**
     * Remove item from collection
     */
    removeItem(item) {
      for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].id === item.id) {
          this.items.splice(i, 1);
          for (var j = i; j < this.length - 1; j++) {
            this[j] = this[j + 1];
          }
          delete this[j];
          this.length--;
          break;
        }
      }
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
          console.log("setUrl", url);
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
     */
    receiveRemoteData(data) {
      dbg("Remote data received", data);
      data = this.parse(data);
      if (data == null) {
        return;
      }
      if (data.constructor === Array) {
        log("Append multiple items to collection");
        if (this.items.length === 0) {
          this.view.reset(true);
        }
        data.forEach((item) => {
          this.loadItem(item);
        });
        return this.render();
      }
      if (data.constructor === Object) {
        if (this.items.length === 0) {
          this.view.reset(true);
        }
        dbg("Append single item to collection");
        let newItem = this.loadItem(data);
        newItem.render(this.view, this.addontop);
        if (this.onafterrender) {
          this.onafterrender(this);
        }
        return newItem;
      }
    }
    /**
     * Parse data
     */
    parse(data) {
      flattenDoc(data);
      let doc = buildDb(data);
      dbg("parse data", data);
      if (!data.hasOwnProperty("data")) {
        return data;
      }
      if (data.hasOwnProperty("meta")) {
        if (data.meta.hasOwnProperty("totalRecords")) {
          this.total = data.meta.totalRecords * 1;
        }
        if (data.meta.hasOwnProperty("offset")) {
          this.offset = data.meta.offset;
        }
      }
      return data.data;
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
      if (this.callbacks.load) {
        this.callbacks.load.forEach((cb) => new Promise(() => cb(this)));
      }
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
     */
    clear() {
      this.items.forEach((item) => {
        item.remove();
      });
      this.items = [];
      this.length = 0;
      this.render();
      return this;
    }
    /**
     * Render collection
     */
    render() {
      if (this.view) {
        this.view.render();
      }
      if (this.callbacks.afterrender) {
        this.callbacks.afterrender.forEach((cb) => typeof cb === "function" && cb(this));
      }
      if (this.onafterrender && typeof this.onafterrender === "function") {
        this.onafterrender(this);
      }
      return this;
    }
    /**
     * Load from remote
     */
    loadFromRemote() {
      return this.load_from_data_source();
    }
    reload() {
      return this.loadFromRemote();
    }
    refresh() {
      return this.loadFromRemote();
    }
    /**
     * Load from data source
     */
    load_from_data_source() {
      const overlay = createOverlay();
      let loader = null;
      if (this.view && this.view.el) {
        if (typeof $ !== "undefined") {
          loader = $(overlay).clone().insertBefore(this.view.el).width($(this.view.el).width()).height($(this.view.el).height());
        } else {
          loader = overlay.cloneNode(true);
          if (this.view.el.parentNode) {
            this.view.el.parentNode.insertBefore(loader, this.view.el);
          }
        }
      }
      if (this.onbeforeload && typeof this.onbeforeload === "function") {
        dbg("Exec onbeforeload");
        this.onbeforeload(this);
      }
      return new Promise((resolve, reject) => {
        if (!this.url) {
          throw new Error("No valid URL provided");
        }
        if (typeof this.offset !== "undefined" && this.offset !== null) {
          this.url.parameters["page[" + this.type + "][offset]"] = this.offset;
        }
        if (typeof this.pageSize !== "undefined" && this.pageSize !== null) {
          this.url.parameters["page[" + this.type + "][limit]"] = this.pageSize;
        }
        let urlString = this.url.toString ? this.url.toString() : this.url;
        this.storage.read(this, urlString, {}).then((res) => {
          this.clear();
          this.receiveRemoteData(res.data);
          if (this.callbacks["load"]) {
            this.callbacks["load"].forEach((cb) => new Promise(() => cb(this)));
          }
          if (loader) {
            if (typeof loader.remove === "function") {
              loader.remove();
            } else if (loader.parentNode) {
              loader.parentNode.removeChild(loader);
            }
          }
          if (this.paging) {
            this.paging.render();
          }
          resolve(this);
        }).catch((error2) => {
          this.fail(error2.jqXHR || error2, error2.textStatus, error2.errorThrown);
          reject(error2);
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
     * Create item
     */
    createItem(itemData) {
      return this.append(itemData);
    }
    /**
     * New item alias
     */
    newItem(itemData) {
      return this.append(itemData);
    }
    /**
     * On update callback
     */
    onupdate() {
      dbg("onupdate");
      if (!this.callbacks.update) {
        return;
      }
      this.callbacks.update.forEach((cb) => cb(this));
    }
    /**
     * Append item
     */
    append(itemData) {
      let jsonApiDoc = { data: parseDataForInsertOrUpdate(itemData) };
      if (this.type) {
        jsonApiDoc.type = this.type;
      }
      return new Promise((resolve, reject) => {
        if (!this.insertUrl) {
          this.insertUrl = this.url;
        }
        let insertUrlString = this.insertUrl.toString ? this.insertUrl.toString() : this.insertUrl;
        this.storage.create(this, insertUrlString, { contentType: "application/vnd.api+json" }, JSON.stringify(jsonApiDoc)).then((resp) => {
          let data = resp.data;
          let newItem = this.receiveRemoteData(data);
          resolve(newItem);
          this.onupdate();
        }).catch((resp) => {
          dbg("fail to receive data", resp);
          reject(resp);
        });
      });
    }
    /**
     * Load item
     */
    loadItem(itemData) {
      if (!itemData) {
        return null;
      }
      let opts = {
        type: this.type,
        collection: this,
        uievents: this.uievents,
        storage: this.storage
      };
      if (itemData.id && this.url) {
        let tmp;
        tmp = createURL(this.url.toString());
        tmp.path += "/" + itemData.id;
        opts.url = createURL(tmp.toString());
        opts.updateUrl = createURL(tmp.toString());
        opts.deleteUrl = createURL(tmp.toString());
      }
      let newItem = new Item(opts).bindView(new ItemView({
        template: this.template,
        container: this.view
      })).loadFromData(itemData);
      if (this.addontop) {
        dbg("Add on top");
        this.items.unshift(newItem);
        for (let i = this.length; i > 0; i--) {
          this[i] = this[i - 1];
        }
        this[0] = newItem;
        this.length++;
      } else {
        this.items.push(newItem);
        this[this.length] = newItem;
        this.length++;
      }
      return newItem;
    }
  };

  // src/Filtering.js
  var Filtering = class {
    constructor(filterForm, collection) {
      this.collection = collection;
      this.el = filterForm;
      let $form;
      if (typeof $ !== "undefined") {
        $form = $(filterForm);
        $form.data("instance", collection).on("submit", (e) => {
          dbg("Filter form was submitted");
          e.preventDefault();
          this.handleSubmit($form[0]);
        }).on("reset", () => {
          delete this.collection.url.parameters.filter;
          this.collection.loadFromRemote();
          dbg("filter form reset");
        });
      } else {
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
  };

  // src/utilities.js
  var utilities = {
    /**
     * Fill form fields with data from instance
     */
    fillForm: function(form, instance) {
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
          if ($inp.attr("type") === "date") {
            val = val ? val.substr(0, 10) : val;
          }
          $inp.val(val);
        } else {
          if (instance.attributes[attrName] && typeof instance.attributes[attrName] === "object" && instance.attributes[attrName].hasOwnProperty("id")) {
            val = instance.attributes[attrName].id;
          }
          if (inp.type === "date") {
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
              Array.from(formElRel.options).forEach((opt) => {
                opt.selected = vals.indexOf(opt.value) !== -1;
              });
            } else {
              formElRel.value = vals[0] || null;
            }
          }
        } else {
          dbg("set ", relName, rel);
          if (formElRel.tagName === "SELECT") {
            let lbl = typeof $ !== "undefined" ? $(formElRel).data("label") : formElRel.dataset ? formElRel.dataset.label : null;
            let lblVal = rel.hasOwnProperty("attributes") && rel.attributes[lbl] ? rel.attributes[lbl] : rel.id;
            if (typeof $ !== "undefined") {
              $("<option>").val(rel.id).text(lblVal).appendTo($(formElRel));
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
    captureFormSubmit: function(form, cb) {
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
    fetchFormData: function(form) {
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
  var KViews2 = class _KViews {
    constructor() {
      _KViews.baseUrl = null;
    }
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
      if (typeof $ !== "undefined") {
        options = Object.assign(options, $(el).data());
      } else {
        if (el.dataset) {
          Object.keys(el.dataset).forEach((key) => {
            try {
              options[key] = JSON.parse(el.dataset[key]);
            } catch (e) {
              options[key] = el.dataset[key];
            }
          });
        }
      }
      try {
        Object.assign(options, parseOptions(opts));
      } catch (e) {
        throw new Error("Error on KViews init", e);
      }
      return options;
    }
    /**
     * Helper: Check for existing instance and update if found
     */
    static getOrUpdateInstance(el, options) {
      let existingInstance;
      if (typeof $ !== "undefined") {
        existingInstance = $(el).data("instance");
      } else {
        existingInstance = el._instance;
      }
      if (existingInstance !== void 0) {
        if (options.url) {
          existingInstance.setUrl(options.url);
          delete options.url;
        }
        Object.assign(existingInstance, parseOptions(options));
        return existingInstance;
      }
      return null;
    }
    /**
     * Helper: Handle emptyview option
     */
    static processEmptyView(options) {
      if (options.hasOwnProperty("emptyview")) {
        if (typeof $ !== "undefined") {
          options.emptyview = $(options.emptyview).remove();
        } else {
          let emptyViewEl = typeof options.emptyview === "string" ? document.querySelector(options.emptyview) : options.emptyview;
          if (emptyViewEl && emptyViewEl.parentNode) {
            emptyViewEl.parentNode.removeChild(emptyViewEl);
          }
          options.emptyview = emptyViewEl;
        }
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
      if (typeof $ !== "undefined") {
        $(el).data("instance", instance);
      } else {
        el._instance = instance;
      }
      dbg("instance", instance.url);
      if (instance.url && (typeof options.dontload === "undefined" || !options.dontload)) {
        console.log("loadFromRemote now", options, instance);
        instance.loadFromRemote();
      }
      return instance;
    }
    /**
     * Create collection instance
     */
    static createCollectionInstance(el, opts) {
      let options = _KViews.prepareOptions(el, opts);
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
      let templateTxt = null;
      if (typeof $ !== "undefined") {
        templateTxt = $(el).length ? $(el).html() : null;
      } else {
        templateTxt = el.innerHTML;
      }
      if (options.template) {
        if (typeof $ !== "undefined" && options.template instanceof jQuery) {
          dbg("template is jQuery object", options.template, el);
          let $tpl = $(options.template).clone().removeAttr("id");
          templateTxt = $("<div>").append($tpl).html();
        } else if (typeof options.template === "string") {
          dbg("template is raw text: can be either a jQuery selector or raw HTML", options.template, el);
          if (typeof $ !== "undefined") {
            templateTxt = $("<div>").append($(options.template).clone().removeAttr("id")).html();
          } else {
            let tplEl = document.querySelector(options.template);
            if (tplEl) {
              let div = document.createElement("div");
              div.appendChild(tplEl.cloneNode(true));
              templateTxt = div.innerHTML;
            }
          }
        }
      }
      if (templateTxt !== null) {
        templateTxt = templateTxt.replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&apos;/gi, "'").replace(/&quot;/gi, '"').replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&");
        options.template = template(templateTxt);
      }
      let collectionConfig = {
        el,
        itemsContainer: options.hasOwnProperty("container") ? typeof $ !== "undefined" ? $(options.container) : document.querySelector(options.container) : el,
        allowempty: options.disableempty !== true
      };
      options.view = new CollectionView(collectionConfig);
      console.log("Collection constructor", options);
      let instance = new Collection(options);
      if (options.hasOwnProperty("filter")) {
        let filterEl;
        if (typeof $ !== "undefined") {
          filterEl = $(options.filter);
          if (filterEl.length && filterEl.prop("tagName") === "FORM") {
            instance.filtering = new Filtering(filterEl, instance);
          }
        } else {
          filterEl = typeof options.filter === "string" ? document.querySelector(options.filter) : options.filter;
          if (filterEl && filterEl.tagName === "FORM") {
            instance.filtering = new Filtering(filterEl, instance);
          }
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
      if (typeof $ !== "undefined") {
        if ($(el).length) {
          templateTxt = el[0] ? el[0].outerHTML : el.outerHTML;
        }
      } else {
        templateTxt = el.outerHTML;
      }
      if (templateTxt) {
        templateTxt = templateTxt.replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&apos;/gi, "'").replace(/&quot;/gi, '"').replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&");
        options.template = template(templateTxt);
      }
      let elId = typeof $ !== "undefined" ? $(el).attr("id") : el.id;
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
  };
  KViews2.baseUrl = null;

  // src/index.js
  var index_default = KViews2;
  if (typeof window !== "undefined") {
    window.KViews = KViews2;
  }
  if (typeof $ !== "undefined" && $.fn) {
    $.fn.kviews = function(opts) {
      let el = this.length ? this[0] : this;
      let resourcetype = "collection";
      if (opts && opts.resourcetype) {
        resourcetype = opts.resourcetype;
      } else if (typeof $ !== "undefined") {
        let dataResourcetype = $(el).data("resourcetype");
        if (dataResourcetype) {
          resourcetype = dataResourcetype;
        }
      } else if (el.dataset && el.dataset.resourcetype) {
        resourcetype = el.dataset.resourcetype;
      }
      if (resourcetype === "item") {
        return KViews2.createItemInstance(el, opts);
      } else {
        return KViews2.createCollectionInstance(el, opts);
      }
    };
    $.fn.kviews.baseUrl = null;
    KViews2.baseUrl = null;
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
  return KViews2;
})();
//# sourceMappingURL=kviews.js.map

import { deepmerge } from './utils.js';
import { createURL } from './URL.js';

/**
 * Data parsing utilities for JSON API format
 */

let itemsArr = {};

/**
 * Flatten document data
 */
export function flattenDoc(doc) {
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

    arr.forEach(function (item) {
        if (!itemsArr.hasOwnProperty(item.type + "/" + item.id)) {
            itemsArr[item.type + "/" + item.id] = item;
        }
    });
    return arr;
}

/**
 * Build database from JSON API data
 */
export function buildDb(data) {
    let db = {
        __get: function (resName, keyId) {
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
        __add: function (resName, keyId, data) {
            if (!resName) {
                return null;
            }

            if (resName.constructor === Object && resName.hasOwnProperty("id") && resName.hasOwnProperty("type")) {
                keyId = resName.id;
                resName = resName.type;
                if (resName.hasOwnProperty("data")) {
                    data = resName.data;
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

            if (data) {
                this[resName][keyId] = data;
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

    // Fix relations
    Object.getOwnPropertyNames(db).forEach(function (resName) {
        if (resName === "__get" || resName === "__add") return;
        Object.getOwnPropertyNames(db[resName]).forEach(function (keyId) {
            if (!db[resName][keyId]) {
                return;
            }

            if (!db[resName][keyId].hasOwnProperty("relationships")) {
                return;
            }

            Object.getOwnPropertyNames(db[resName][keyId].relationships).forEach(function (relName) {
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

    function parseDataProperty(data) {
        let db = {};
        if (!data) {
            return db;
        }

        if (data.constructor === Object) {
            data = [data];
        }

        if (data.constructor !== Array) {
            return db;
        }

        return addItems2Db(data);
    }

    function parseIncludesProperty(data) {
        let db = {};
        if (!data || data.constructor !== Array) {
            return db;
        }

        return addItems2Db(data);
    }

    function addItems2Db(items) {
        let db = {};
        items.forEach(function (item) {
            if (!item.hasOwnProperty("attributes") && !item.hasOwnProperty("relationships")) {
                return;
            }
            if (!db.hasOwnProperty(item.type)) {
                db[item.type] = {};
            }
            db[item.type][item.id] = item;
        });
        return db;
    }

    return db;
}

/**
 * Parse item data from JSON API format
 */
export function parseItemData(data, db) {
    let obj = {};
    let jsonApiObj = data.data;

    // Retrieve self URL
    if (data.hasOwnProperty("links") && data.links && data.links.hasOwnProperty("self")) {
        obj.url = createURL(data.links.self);
    }

    // Fill info
    let jsonApiItem = data.hasOwnProperty("data") ? data.data : data;
    let tmp = db.__get(jsonApiItem);
    if (tmp === null) {
        tmp = {};
    }
    obj = deepmerge(obj, tmp);

    // No relationships => job done & return
    if (!obj.relationships) {
        return obj;
    }

    // Iterate relationships data and create Item Objects
    Object.getOwnPropertyNames(obj.relationships).forEach(function (relName) {
        // Empty 1:1 relation
        if (obj.relationships[relName] === null) {
            return;
        }

        let relUrl = null;
        if (jsonApiObj.relationships[relName].hasOwnProperty("links")
            && jsonApiObj.relationships[relName].links.hasOwnProperty("related")) {
            relUrl = jsonApiObj.relationships[relName].links.related;
        }

        let relData = obj.relationships[relName];

        // 1:1 relation - will be handled by Item class after import
        // 1:n relationship - will be handled by Collection class after import
    });

    return obj;
}

/**
 * Parse data for insert or update
 */
export function parseDataForInsertOrUpdate(itemData) {
    if (itemData === null) {
        return null;
    }

    if (typeof itemData !== "object") {
        throw new Error("Invalid item data: " + itemData);
    }

    if (itemData.constructor === Array || (itemData.hasOwnProperty("items") && itemData.hasOwnProperty("length"))) {
        let resource = [];
        itemData.forEach(function (item) {
            resource.push(parseDataForInsertOrUpdate(item));
        });
        return resource;
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

    Object.getOwnPropertyNames(itemData.attributes).forEach(function (attr) {
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

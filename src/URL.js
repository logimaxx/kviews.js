import { dbg } from './utils.js';

/**
 * URL parsing and manipulation utility class
 */
export class URL {
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
            tmp.forEach(function (item) {
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

        // Add toString method to parameters
        this.parameters.toString = function () {
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
}

/**
 * Factory function for backward compatibility
 */
export function createURL(url) {
    return new URL(url);
}

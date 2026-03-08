/**
 * Test setup file
 * Configures global test environment
 */

import { vi } from 'vitest';

// Mock jQuery globally
const createJQueryMock = (element) => {
    const isArray = Array.isArray(element) || (element && element.length !== undefined && typeof element.length === 'number');
    const elements = isArray ? Array.from(element) : [element].filter(Boolean);
    
    const $mock = Object.assign(elements, {
        length: elements.length,
        jquery: true,
        [0]: elements[0],
        [1]: elements[1],
        [2]: elements[2],
        [3]: elements[3],
        
        // jQuery methods
        find: vi.fn((selector) => {
            const found = [];
            elements.forEach(el => {
                if (el && el.querySelectorAll) {
                    found.push(...Array.from(el.querySelectorAll(selector)));
                }
            });
            return createJQueryMock(found);
        }),
        
        attr: vi.fn((name, value) => {
            if (value !== undefined) {
                elements.forEach(el => {
                    if (el) {
                        if (typeof el.setAttribute === 'function') {
                            el.setAttribute(name, value);
                        } else {
                            el[name] = value;
                        }
                    }
                });
                return $mock;
            }
            if (elements[0]) {
                if (typeof elements[0].getAttribute === 'function') {
                    return elements[0].getAttribute(name);
                }
                return elements[0][name];
            }
            return undefined;
        }),
        
        data: vi.fn((key, value) => {
            if (value !== undefined) {
                elements.forEach(el => {
                    if (el) {
                        if (!el._jqueryData) el._jqueryData = {};
                        el._jqueryData[key] = value;
                    }
                });
                return $mock;
            }
            if (key === undefined) {
                // Return all data
                const allData = {};
                if (elements[0] && elements[0]._jqueryData) {
                    Object.assign(allData, elements[0]._jqueryData);
                }
                // Also read data-* attributes
                if (elements[0] && elements[0].dataset) {
                    Object.keys(elements[0].dataset).forEach(k => {
                        try {
                            allData[k] = JSON.parse(elements[0].dataset[k]);
                        } catch {
                            allData[k] = elements[0].dataset[k];
                        }
                    });
                }
                return allData;
            }
            if (elements[0]) {
                if (elements[0]._jqueryData && elements[0]._jqueryData[key] !== undefined) {
                    return elements[0]._jqueryData[key];
                }
                if (elements[0].dataset && elements[0].dataset[key] !== undefined) {
                    try {
                        return JSON.parse(elements[0].dataset[key]);
                    } catch {
                        return elements[0].dataset[key];
                    }
                }
            }
            return undefined;
        }),
        
        val: vi.fn((value) => {
            if (value !== undefined) {
                elements.forEach(el => {
                    if (el) el.value = value;
                });
                return $mock;
            }
            return elements[0] ? elements[0].value : undefined;
        }),
        
        text: vi.fn((text) => {
            if (text !== undefined) {
                elements.forEach(el => {
                    if (el) el.textContent = text;
                });
                return $mock;
            }
            return elements[0] ? elements[0].textContent : '';
        }),
        
        html: vi.fn((html) => {
            if (html !== undefined) {
                elements.forEach(el => {
                    if (el) el.innerHTML = html;
                });
                return $mock;
            }
            return elements[0] ? elements[0].innerHTML : '';
        }),
        
        empty: vi.fn(() => {
            elements.forEach(el => {
                if (el) el.innerHTML = '';
            });
            return $mock;
        }),
        
        remove: vi.fn(() => {
            elements.forEach(el => {
                if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
            return $mock;
        }),
        
        removeData: vi.fn((key) => {
            elements.forEach(el => {
                if (el) {
                    if (!el._jqueryData) el._jqueryData = {};
                    if (key) {
                        delete el._jqueryData[key];
                    } else {
                        el._jqueryData = {};
                    }
                }
            });
            return $mock;
        }),
        
        append: vi.fn((content) => {
            elements.forEach(el => {
                if (el) {
                    if (typeof content === 'string') {
                        el.innerHTML += content;
                    } else if (content && content.jquery) {
                        content.each((i, c) => el.appendChild(c.cloneNode(true)));
                    } else if (content) {
                        el.appendChild(content);
                    }
                }
            });
            return $mock;
        }),
        
        appendTo: vi.fn((target) => {
            const $target = typeof target === 'string' ? $(target) : (target.jquery ? target : $(target));
            elements.forEach(el => {
                if (el && $target[0]) {
                    $target[0].appendChild(el);
                }
            });
            return $mock;
        }),
        
        insertBefore: vi.fn((target) => {
            const $target = typeof target === 'string' ? $(target) : (target.jquery ? target : $(target));
            elements.forEach(el => {
                if (el && $target[0] && $target[0].parentNode) {
                    $target[0].parentNode.insertBefore(el, $target[0]);
                }
            });
            return $mock;
        }),
        
        clone: vi.fn((deep) => {
            const cloned = elements.map(el => el ? el.cloneNode(deep !== false) : null);
            return createJQueryMock(cloned);
        }),
        
        on: vi.fn((event, handler) => {
            elements.forEach(el => {
                if (el) {
                    if (!el._jqueryEvents) el._jqueryEvents = {};
                    if (!el._jqueryEvents[event]) el._jqueryEvents[event] = [];
                    el._jqueryEvents[event].push(handler);
                    el.addEventListener(event, handler);
                }
            });
            return $mock;
        }),
        
        off: vi.fn((event, handler) => {
            elements.forEach(el => {
                if (el && el._jqueryEvents) {
                    if (event) {
                        const handlers = el._jqueryEvents[event] || [];
                        handlers.forEach(h => el.removeEventListener(event, h));
                        delete el._jqueryEvents[event];
                    } else {
                        // Remove all events
                        Object.keys(el._jqueryEvents).forEach(evt => {
                            el._jqueryEvents[evt].forEach(h => el.removeEventListener(evt, h));
                        });
                        el._jqueryEvents = {};
                    }
                }
            });
            return $mock;
        }),
        
        prop: vi.fn((name, value) => {
            if (value !== undefined) {
                elements.forEach(el => {
                    if (el) el[name] = value;
                });
                return $mock;
            }
            return elements[0] ? elements[0][name] : undefined;
        }),
        
        addClass: vi.fn((className) => {
            elements.forEach(el => {
                if (el) el.classList.add(className);
            });
            return $mock;
        }),
        
        removeClass: vi.fn((className) => {
            elements.forEach(el => {
                if (el) el.classList.remove(className);
            });
            return $mock;
        }),
        
        css: vi.fn((prop, value) => {
            if (typeof prop === 'object') {
                Object.keys(prop).forEach(k => {
                    elements.forEach(el => {
                        if (el) el.style[k] = prop[k];
                    });
                });
                return $mock;
            }
            if (value !== undefined) {
                elements.forEach(el => {
                    if (el) el.style[prop] = value;
                });
                return $mock;
            }
            return elements[0] ? elements[0].style[prop] : undefined;
        }),
        
        width: vi.fn((value) => {
            if (value !== undefined) {
                elements.forEach(el => {
                    if (el) el.style.width = typeof value === 'number' ? value + 'px' : value;
                });
                return $mock;
            }
            return elements[0] ? elements[0].offsetWidth : 0;
        }),
        
        height: vi.fn((value) => {
            if (value !== undefined) {
                elements.forEach(el => {
                    if (el) el.style.height = typeof value === 'number' ? value + 'px' : value;
                });
                return $mock;
            }
            return elements[0] ? elements[0].offsetHeight : 0;
        }),
        
        fadeOut: vi.fn((options) => {
            const complete = options && options.complete ? options.complete : (options && typeof options === 'function' ? options : null);
            setTimeout(() => {
                elements.forEach(el => {
                    if (el) el.style.opacity = '0';
                });
                if (complete) complete();
            }, 0);
            return $mock;
        }),
        
        each: vi.fn((callback) => {
            elements.forEach((el, i) => {
                callback.call(el, i, el);
            });
            return $mock;
        })
    });
    
    return $mock;
};

global.$ = vi.fn((selector) => {
    if (typeof selector === 'string') {
        if (selector.startsWith('<')) {
            // Create element from HTML string
            const div = document.createElement('div');
            div.innerHTML = selector;
            return createJQueryMock(Array.from(div.children));
        }
        // Query selector
        const elements = Array.from(document.querySelectorAll(selector));
        return createJQueryMock(elements);
    }
    if (selector && selector.nodeName) {
        // DOM element
        return createJQueryMock([selector]);
    }
    if (selector && selector.jquery) {
        // Already a jQuery object
        return selector;
    }
    if (selector === null || selector === undefined) {
        return createJQueryMock([]);
    }
    return createJQueryMock([selector]);
});

global.jQuery = global.$;

// Mock Handlebars globally
global.Handlebars = {
    compile: vi.fn((template) => {
        return (data) => {
            // Simple template replacement for testing
            // Support direct attribute access: {{title}} instead of {{attributes.title}}
            let result = template;
            if (data && typeof data === 'object') {
                // Direct attributes (flattened)
                Object.keys(data).forEach(key => {
                    if (key !== 'attributes' && key !== 'relationships' && key !== 'id' && key !== 'type') {
                        result = result.replace(
                            new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
                            String(data[key] || '')
                        );
                    }
                });
                
                // Handle attributes directly: {{title}} maps to data.attributes.title
                if (data.attributes) {
                    Object.keys(data.attributes).forEach(key => {
                        result = result.replace(
                            new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
                            String(data.attributes[key] || '')
                        );
                        // Also support {{attributes.title}} for backward compatibility
                        result = result.replace(
                            new RegExp(`\\{\\{attributes\\.${key}\\}\\}`, 'g'),
                            String(data.attributes[key] || '')
                        );
                    });
                }
                
                // Handle id
                if (data.id) {
                    result = result.replace(/\{\{id\}\}/g, String(data.id));
                }
                
                // Handle type
                if (data.type) {
                    result = result.replace(/\{\{type\}\}/g, String(data.type));
                }
                
                // Handle relationships - direct access: {{author.attributes.name}}
                if (data.relationships) {
                    Object.keys(data.relationships).forEach(key => {
                        const rel = data.relationships[key];
                        if (rel && rel.attributes) {
                            Object.keys(rel.attributes).forEach(attrKey => {
                                result = result.replace(
                                    new RegExp(`\\{\\{${key}\\.attributes\\.${attrKey}\\}\\}`, 'g'),
                                    String(rel.attributes[attrKey] || '')
                                );
                            });
                        }
                        if (rel && rel.id) {
                            result = result.replace(
                                new RegExp(`\\{\\{${key}\\.id\\}\\}`, 'g'),
                                String(rel.id)
                            );
                        }
                    });
                }
                
                // Handle #each for arrays
                result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
                    const array = data[arrayName] || (data.relationships && data.relationships[arrayName]) || [];
                    if (!Array.isArray(array)) return '';
                    return array.map(item => {
                        let itemContent = content;
                        if (item.attributes) {
                            Object.keys(item.attributes).forEach(key => {
                                itemContent = itemContent.replace(
                                    new RegExp(`\\{\\{attributes\\.${key}\\}\\}`, 'g'),
                                    String(item.attributes[key] || '')
                                );
                                itemContent = itemContent.replace(
                                    new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
                                    String(item.attributes[key] || '')
                                );
                            });
                        }
                        if (item.id) {
                            itemContent = itemContent.replace(/\{\{id\}\}/g, String(item.id));
                        }
                        return itemContent;
                    }).join('');
                });
            }
            return result;
        };
    })
};

// Mock logging functions
global.log = vi.fn(() => {});
global.dbg = vi.fn(() => {});
global.error = vi.fn(() => {});

// Mock window.KViews for bundle tests
global.window = global.window || global;
global.window.KViews = null; // Will be set in tests that need it
global.window.$ = global.$;
global.window.jQuery = global.jQuery;
global.window.log = global.log;
global.window.dbg = global.dbg;
global.window.error = global.error;

// Mock fetch globally (can be overridden in tests)
global.fetch = global.fetch || vi.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve({ data: [] }),
        text: () => Promise.resolve('{}')
    })
);

// Clean up after each test
afterEach(() => {
    vi.clearAllMocks();
    // Clear jQuery data and events
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        delete el._jqueryData;
        delete el._jqueryEvents;
    });
});

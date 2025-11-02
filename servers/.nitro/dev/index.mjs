import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import destr from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/destr@2.0.5/node_modules/destr/dist/index.mjs';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, sendRedirect, proxyRequest, getRequestURL, getRequestHeader, getResponseHeader, getRequestHeaders, setResponseHeaders, setResponseStatus, send, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, createError, getRouterParam, readBody, getQuery as getQuery$1, getHeader } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/h3@1.15.3/node_modules/h3/dist/index.mjs';
import { createHooks } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/hookable@5.5.3/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/ofetch@1.4.1/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/node-mock-http@1.0.0/node_modules/node-mock-http/dist/index.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/ufo@1.6.1/node_modules/ufo/dist/index.mjs';
import { createStorage, prefixStorage } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/unstorage@1.16.0_db0@0.3.2+ioredis@5.6.1/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/unstorage@1.16.0_db0@0.3.2+ioredis@5.6.1/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/ohash@2.0.11/node_modules/ohash/dist/index.mjs';
import { klona } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/klona@2.0.6/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/defu@6.1.4/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/scule@1.3.0/node_modules/scule/dist/index.mjs';
import { getContext } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/unctx@2.4.1/node_modules/unctx/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/radix3@1.1.2/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import consola from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/consola@3.4.2/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/youch-core@0.3.2/node_modules/youch-core/build/index.js';
import { Youch } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/youch@4.1.0-beta.8/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/source-map@0.7.4/node_modules/source-map/source-map.js';
import { Server } from 'node:http';
import nodeCrypto from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import dayjs from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/dayjs@1.11.13/node_modules/dayjs/dayjs.min.js';
import { cloneDeep } from 'file:///Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/lodash.js';

const serverAssets = [{"baseName":"server","dir":"/Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/servers/assets"}];

const assets = createStorage();

for (const asset of serverAssets) {
  assets.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/chenrui/Downloads/vue-3-typescript-ant-pro-main"}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/servers"}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/servers/.nitro"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/servers/.nitro/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"/Users/chenrui/Downloads/vue-3-typescript-ant-pro-main/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/"
  },
  "nitro": {
    "routeRules": {}
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  {
    return _sharedRuntimeConfig;
  }
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

getContext("nitro-app", {
  asyncContext: undefined,
  AsyncLocalStorage: void 0
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$0 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json || !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const plugins = [
  
];

const _lazy_gyNdlQ = () => Promise.resolve().then(function () { return _401$1; });
const _lazy_zC9CDx = () => Promise.resolve().then(function () { return _403$1; });
const _lazy_o1GHsQ = () => Promise.resolve().then(function () { return _500$1; });
const _lazy_kOS30d = () => Promise.resolve().then(function () { return _id__delete$7; });
const _lazy_Am7psC = () => Promise.resolve().then(function () { return _id__get$b; });
const _lazy_J0zAjZ = () => Promise.resolve().then(function () { return _id__put$5; });
const _lazy_3N5RDn = () => Promise.resolve().then(function () { return create_post$9; });
const _lazy_SLEKGP = () => Promise.resolve().then(function () { return list_post$9; });
const _lazy_Pp7X9h = () => Promise.resolve().then(function () { return _typeCode__get$1; });
const _lazy_aZTpkv = () => Promise.resolve().then(function () { return _id__delete$5; });
const _lazy_DL2hkn = () => Promise.resolve().then(function () { return _id__get$9; });
const _lazy_0_mdN3 = () => Promise.resolve().then(function () { return _id__put$3; });
const _lazy_sLx2h8 = () => Promise.resolve().then(function () { return all_get$1; });
const _lazy_6Mz7u8 = () => Promise.resolve().then(function () { return create_post$7; });
const _lazy_WUT85d = () => Promise.resolve().then(function () { return list_post$7; });
const _lazy_cZKuAY = () => Promise.resolve().then(function () { return index$3; });
const _lazy__rLm9o = () => Promise.resolve().then(function () { return _id__delete$3; });
const _lazy_NSYZIK = () => Promise.resolve().then(function () { return basicList_post$1; });
const _lazy__YR0oB = () => Promise.resolve().then(function () { return consultList_post$1; });
const _lazy_7VGE2v = () => Promise.resolve().then(function () { return create_post$5; });
const _lazy_WrNzvn = () => Promise.resolve().then(function () { return crudTable_post$1; });
const _lazy_UFJepS = () => Promise.resolve().then(function () { return index_post$1; });
const _lazy_iyIZYs = () => Promise.resolve().then(function () { return index_put$1; });
const _lazy_1y92kW = () => Promise.resolve().then(function () { return login_post$1; });
const _lazy_mpi3sf = () => Promise.resolve().then(function () { return logout$1; });
const _lazy_DwmP7_ = () => Promise.resolve().then(function () { return index$1; });
const _lazy_A13qtQ = () => Promise.resolve().then(function () { return _id__get$7; });
const _lazy_HG0bS0 = () => Promise.resolve().then(function () { return tree$1; });
const _lazy_JwQ4Br = () => Promise.resolve().then(function () { return _id__get$5; });
const _lazy_dfp2tI = () => Promise.resolve().then(function () { return status_put$3; });
const _lazy_4THXJ_ = () => Promise.resolve().then(function () { return list_post$5; });
const _lazy_CridtN = () => Promise.resolve().then(function () { return _id__get$3; });
const _lazy_CNNrec = () => Promise.resolve().then(function () { return batchDelete_post$3; });
const _lazy_nXOHqB = () => Promise.resolve().then(function () { return create_post$3; });
const _lazy_JD1wA7 = () => Promise.resolve().then(function () { return list_post$3; });
const _lazy_V38yBI = () => Promise.resolve().then(function () { return _id__delete$1; });
const _lazy_QQyUSE = () => Promise.resolve().then(function () { return _id__get$1; });
const _lazy_SPPR86 = () => Promise.resolve().then(function () { return _id__put$1; });
const _lazy_qIWuek = () => Promise.resolve().then(function () { return permissions_get$1; });
const _lazy_M2ig9h = () => Promise.resolve().then(function () { return permissions_post$1; });
const _lazy_3yyIjM = () => Promise.resolve().then(function () { return status_put$1; });
const _lazy_XqQYN3 = () => Promise.resolve().then(function () { return batchDelete_post$1; });
const _lazy_3AKOu8 = () => Promise.resolve().then(function () { return create_post$1; });
const _lazy_tvNxaf = () => Promise.resolve().then(function () { return list_post$1; });
const _lazy_a_2pXV = () => Promise.resolve().then(function () { return test_delete$1; });
const _lazy_uEKqeI = () => Promise.resolve().then(function () { return test_post$1; });
const _lazy_4F33dK = () => Promise.resolve().then(function () { return test_put$1; });
const _lazy_EfnYIy = () => Promise.resolve().then(function () { return info$1; });

const handlers = [
  { route: '/401', handler: _lazy_gyNdlQ, lazy: true, middleware: false, method: undefined },
  { route: '/403', handler: _lazy_zC9CDx, lazy: true, middleware: false, method: undefined },
  { route: '/500', handler: _lazy_o1GHsQ, lazy: true, middleware: false, method: undefined },
  { route: '/dictionary/item/:id', handler: _lazy_kOS30d, lazy: true, middleware: false, method: "delete" },
  { route: '/dictionary/item/:id', handler: _lazy_Am7psC, lazy: true, middleware: false, method: "get" },
  { route: '/dictionary/item/:id', handler: _lazy_J0zAjZ, lazy: true, middleware: false, method: "put" },
  { route: '/dictionary/item/create', handler: _lazy_3N5RDn, lazy: true, middleware: false, method: "post" },
  { route: '/dictionary/item/list', handler: _lazy_SLEKGP, lazy: true, middleware: false, method: "post" },
  { route: '/dictionary/item/type/:typeCode', handler: _lazy_Pp7X9h, lazy: true, middleware: false, method: "get" },
  { route: '/dictionary/type/:id', handler: _lazy_aZTpkv, lazy: true, middleware: false, method: "delete" },
  { route: '/dictionary/type/:id', handler: _lazy_DL2hkn, lazy: true, middleware: false, method: "get" },
  { route: '/dictionary/type/:id', handler: _lazy_0_mdN3, lazy: true, middleware: false, method: "put" },
  { route: '/dictionary/type/all', handler: _lazy_sLx2h8, lazy: true, middleware: false, method: "get" },
  { route: '/dictionary/type/create', handler: _lazy_6Mz7u8, lazy: true, middleware: false, method: "post" },
  { route: '/dictionary/type/list', handler: _lazy_WUT85d, lazy: true, middleware: false, method: "post" },
  { route: '/', handler: _lazy_cZKuAY, lazy: true, middleware: false, method: undefined },
  { route: '/list/:id', handler: _lazy__rLm9o, lazy: true, middleware: false, method: "delete" },
  { route: '/list/basic-list', handler: _lazy_NSYZIK, lazy: true, middleware: false, method: "post" },
  { route: '/list/consult-list', handler: _lazy__YR0oB, lazy: true, middleware: false, method: "post" },
  { route: '/list/create', handler: _lazy_7VGE2v, lazy: true, middleware: false, method: "post" },
  { route: '/list/crud-table', handler: _lazy_WrNzvn, lazy: true, middleware: false, method: "post" },
  { route: '/list', handler: _lazy_UFJepS, lazy: true, middleware: false, method: "post" },
  { route: '/list', handler: _lazy_iyIZYs, lazy: true, middleware: false, method: "put" },
  { route: '/login', handler: _lazy_1y92kW, lazy: true, middleware: false, method: "post" },
  { route: '/logout', handler: _lazy_mpi3sf, lazy: true, middleware: false, method: undefined },
  { route: '/menu', handler: _lazy_DwmP7_, lazy: true, middleware: false, method: undefined },
  { route: '/organization/:id', handler: _lazy_A13qtQ, lazy: true, middleware: false, method: "get" },
  { route: '/organization/tree', handler: _lazy_HG0bS0, lazy: true, middleware: false, method: undefined },
  { route: '/personnel/:id', handler: _lazy_JwQ4Br, lazy: true, middleware: false, method: "get" },
  { route: '/personnel/:id/status', handler: _lazy_dfp2tI, lazy: true, middleware: false, method: "put" },
  { route: '/personnel/list', handler: _lazy_4THXJ_, lazy: true, middleware: false, method: "post" },
  { route: '/role-assignment/:id', handler: _lazy_CridtN, lazy: true, middleware: false, method: "get" },
  { route: '/role-assignment/batch-delete', handler: _lazy_CNNrec, lazy: true, middleware: false, method: "post" },
  { route: '/role-assignment/create', handler: _lazy_nXOHqB, lazy: true, middleware: false, method: "post" },
  { route: '/role-assignment/list', handler: _lazy_JD1wA7, lazy: true, middleware: false, method: "post" },
  { route: '/role/:id', handler: _lazy_V38yBI, lazy: true, middleware: false, method: "delete" },
  { route: '/role/:id', handler: _lazy_QQyUSE, lazy: true, middleware: false, method: "get" },
  { route: '/role/:id', handler: _lazy_SPPR86, lazy: true, middleware: false, method: "put" },
  { route: '/role/:id/permissions', handler: _lazy_qIWuek, lazy: true, middleware: false, method: "get" },
  { route: '/role/:id/permissions', handler: _lazy_M2ig9h, lazy: true, middleware: false, method: "post" },
  { route: '/role/:id/status', handler: _lazy_3yyIjM, lazy: true, middleware: false, method: "put" },
  { route: '/role/batch-delete', handler: _lazy_XqQYN3, lazy: true, middleware: false, method: "post" },
  { route: '/role/create', handler: _lazy_3AKOu8, lazy: true, middleware: false, method: "post" },
  { route: '/role/list', handler: _lazy_tvNxaf, lazy: true, middleware: false, method: "post" },
  { route: '/test', handler: _lazy_a_2pXV, lazy: true, middleware: false, method: "delete" },
  { route: '/test', handler: _lazy_uEKqeI, lazy: true, middleware: false, method: "post" },
  { route: '/test', handler: _lazy_4F33dK, lazy: true, middleware: false, method: "put" },
  { route: '/user/info', handler: _lazy_EfnYIy, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(nodeHandler, aRequest);
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const _401 = eventHandler((event) => {
  setResponseStatus(event, 401);
  return {
    code: 401,
    msg: "\u8BF7\u5148\u767B\u5F55"
  };
});

const _401$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _401
});

const _403 = eventHandler((event) => {
  setResponseStatus(event, 403);
  return {
    code: 403,
    msg: "\u8BF7\u5148\u767B\u5F55"
  };
});

const _403$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _403
});

const _500 = eventHandler((event) => {
  setResponseStatus(event, 500);
  return {
    code: 500,
    msg: "\u670D\u52A1\u5668\u9519\u8BEF"
  };
});

const _500$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _500
});

const _id__delete$6 = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  return {
    code: 200,
    message: "\u5220\u9664\u6210\u529F",
    data: {
      id: Number(id)
    }
  };
});

const _id__delete$7 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$6
});

const _id__get$a = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const mockData = {
    id: Number(id),
    typeId: 1,
    typeCode: "user_gender",
    label: "\u7537",
    value: "male",
    description: "\u7537\u6027",
    status: 1,
    sort: 1,
    createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
    updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
  };
  return {
    code: 200,
    message: "success",
    data: mockData
  };
});

const _id__get$b = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get$a
});

const _id__put$4 = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  return {
    code: 200,
    message: "\u66F4\u65B0\u6210\u529F",
    data: {
      id: Number(id),
      ...body,
      updateTime: Date.now()
    }
  };
});

const _id__put$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__put$4
});

const create_post$8 = defineEventHandler(async (event) => {
  const body = await readBody(event);
  return {
    code: 200,
    message: "\u521B\u5EFA\u6210\u529F",
    data: {
      id: Math.floor(Math.random() * 1e4),
      ...body,
      createTime: Date.now(),
      updateTime: Date.now()
    }
  };
});

const create_post$9 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: create_post$8
});

const list_post$8 = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const mockDataMap = {
    1: [
      // 用户性别
      {
        id: 1,
        typeId: 1,
        typeCode: "user_gender",
        label: "\u7537",
        value: "male",
        description: "\u7537\u6027",
        status: 1,
        sort: 1,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 2,
        typeId: 1,
        typeCode: "user_gender",
        label: "\u5973",
        value: "female",
        description: "\u5973\u6027",
        status: 1,
        sort: 2,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 3,
        typeId: 1,
        typeCode: "user_gender",
        label: "\u4FDD\u5BC6",
        value: "secret",
        description: "\u4FDD\u5BC6",
        status: 1,
        sort: 3,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      }
    ],
    2: [
      // 用户状态
      {
        id: 4,
        typeId: 2,
        typeCode: "user_status",
        label: "\u6B63\u5E38",
        value: "active",
        description: "\u8D26\u53F7\u6B63\u5E38",
        status: 1,
        sort: 1,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 5,
        typeId: 2,
        typeCode: "user_status",
        label: "\u7981\u7528",
        value: "disabled",
        description: "\u8D26\u53F7\u5DF2\u7981\u7528",
        status: 1,
        sort: 2,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 6,
        typeId: 2,
        typeCode: "user_status",
        label: "\u9501\u5B9A",
        value: "locked",
        description: "\u8D26\u53F7\u5DF2\u9501\u5B9A",
        status: 1,
        sort: 3,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      }
    ],
    3: [
      // 订单状态
      {
        id: 7,
        typeId: 3,
        typeCode: "order_status",
        label: "\u5F85\u652F\u4ED8",
        value: "pending",
        description: "\u7B49\u5F85\u652F\u4ED8",
        status: 1,
        sort: 1,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 8,
        typeId: 3,
        typeCode: "order_status",
        label: "\u5DF2\u652F\u4ED8",
        value: "paid",
        description: "\u5DF2\u5B8C\u6210\u652F\u4ED8",
        status: 1,
        sort: 2,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 9,
        typeId: 3,
        typeCode: "order_status",
        label: "\u5DF2\u53D1\u8D27",
        value: "shipped",
        description: "\u5DF2\u53D1\u8D27",
        status: 1,
        sort: 3,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 10,
        typeId: 3,
        typeCode: "order_status",
        label: "\u5DF2\u5B8C\u6210",
        value: "completed",
        description: "\u8BA2\u5355\u5DF2\u5B8C\u6210",
        status: 1,
        sort: 4,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 11,
        typeId: 3,
        typeCode: "order_status",
        label: "\u5DF2\u53D6\u6D88",
        value: "cancelled",
        description: "\u8BA2\u5355\u5DF2\u53D6\u6D88",
        status: 1,
        sort: 5,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      }
    ],
    4: [
      // 支付方式
      {
        id: 12,
        typeId: 4,
        typeCode: "payment_method",
        label: "\u5FAE\u4FE1\u652F\u4ED8",
        value: "wechat",
        description: "\u4F7F\u7528\u5FAE\u4FE1\u652F\u4ED8",
        status: 1,
        sort: 1,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 13,
        typeId: 4,
        typeCode: "payment_method",
        label: "\u652F\u4ED8\u5B9D",
        value: "alipay",
        description: "\u4F7F\u7528\u652F\u4ED8\u5B9D",
        status: 1,
        sort: 2,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 14,
        typeId: 4,
        typeCode: "payment_method",
        label: "\u94F6\u884C\u5361",
        value: "bank_card",
        description: "\u4F7F\u7528\u94F6\u884C\u5361\u652F\u4ED8",
        status: 1,
        sort: 3,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 15,
        typeId: 4,
        typeCode: "payment_method",
        label: "\u73B0\u91D1",
        value: "cash",
        description: "\u73B0\u91D1\u652F\u4ED8",
        status: 0,
        sort: 4,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      }
    ],
    5: [
      // 数据权限
      {
        id: 16,
        typeId: 5,
        typeCode: "data_permission",
        label: "\u5168\u90E8\u6570\u636E",
        value: "all",
        description: "\u53EF\u4EE5\u8BBF\u95EE\u6240\u6709\u6570\u636E",
        status: 1,
        sort: 1,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 17,
        typeId: 5,
        typeCode: "data_permission",
        label: "\u672C\u5355\u4F4D\u53CA\u4E0B\u5C5E\u5355\u4F4D",
        value: "org_and_sub",
        description: "\u672C\u5355\u4F4D\u53CA\u4E0B\u5C5E\u5355\u4F4D\u6570\u636E",
        status: 1,
        sort: 2,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 18,
        typeId: 5,
        typeCode: "data_permission",
        label: "\u4EC5\u672C\u5355\u4F4D",
        value: "org_only",
        description: "\u4EC5\u672C\u5355\u4F4D\u6570\u636E",
        status: 1,
        sort: 3,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 19,
        typeId: 5,
        typeCode: "data_permission",
        label: "\u4EC5\u672C\u4EBA",
        value: "self_only",
        description: "\u4EC5\u672C\u4EBA\u6570\u636E",
        status: 1,
        sort: 4,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      }
    ]
  };
  let filteredData = mockDataMap[body.typeId] || [];
  if (body.label) {
    filteredData = filteredData.filter(
      (item) => item.label.includes(body.label)
    );
  }
  if (body.value) {
    filteredData = filteredData.filter(
      (item) => item.value.includes(body.value)
    );
  }
  if (body.status !== void 0 && body.status !== null) {
    filteredData = filteredData.filter((item) => item.status === body.status);
  }
  if (body.orderbyFiled) {
    const [field, order] = body.orderbyFiled.split(":");
    filteredData.sort((a, b) => {
      if (order === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
  }
  const count = filteredData.length;
  const page = body.page || 1;
  const limit = body.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    code: 200,
    message: "success",
    data: {
      list: filteredData.slice(start, end),
      count,
      page,
      limit
    }
  };
});

const list_post$9 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_post$8
});

const _typeCode__get = defineEventHandler(async (event) => {
  const typeCode = getRouterParam(event, "typeCode");
  const mockDataMap = {
    user_gender: [
      {
        id: 1,
        typeId: 1,
        typeCode: "user_gender",
        label: "\u7537",
        value: "male",
        description: "\u7537\u6027",
        status: 1,
        sort: 1
      },
      {
        id: 2,
        typeId: 1,
        typeCode: "user_gender",
        label: "\u5973",
        value: "female",
        description: "\u5973\u6027",
        status: 1,
        sort: 2
      }
    ],
    user_status: [
      {
        id: 4,
        typeId: 2,
        typeCode: "user_status",
        label: "\u6B63\u5E38",
        value: "active",
        description: "\u8D26\u53F7\u6B63\u5E38",
        status: 1,
        sort: 1
      },
      {
        id: 5,
        typeId: 2,
        typeCode: "user_status",
        label: "\u7981\u7528",
        value: "disabled",
        description: "\u8D26\u53F7\u5DF2\u7981\u7528",
        status: 1,
        sort: 2
      }
    ]
  };
  return {
    code: 200,
    message: "success",
    data: mockDataMap[typeCode || ""] || []
  };
});

const _typeCode__get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _typeCode__get
});

const _id__delete$4 = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  return {
    code: 200,
    message: "\u5220\u9664\u6210\u529F",
    data: {
      id: Number(id)
    }
  };
});

const _id__delete$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$4
});

const _id__get$8 = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const mockData = {
    id: Number(id),
    typeName: "\u7528\u6237\u6027\u522B",
    typeCode: "user_gender",
    description: "\u7528\u6237\u6027\u522B\u5B57\u5178",
    status: 1,
    sort: 1,
    createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
    updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
  };
  return {
    code: 200,
    message: "success",
    data: mockData
  };
});

const _id__get$9 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get$8
});

const _id__put$2 = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  return {
    code: 200,
    message: "\u66F4\u65B0\u6210\u529F",
    data: {
      id: Number(id),
      ...body,
      updateTime: Date.now()
    }
  };
});

const _id__put$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__put$2
});

const all_get = defineEventHandler(async (event) => {
  const mockData = [
    {
      id: 1,
      typeName: "\u7528\u6237\u6027\u522B",
      typeCode: "user_gender",
      description: "\u7528\u6237\u6027\u522B\u5B57\u5178",
      status: 1,
      sort: 1,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 2,
      typeName: "\u7528\u6237\u72B6\u6001",
      typeCode: "user_status",
      description: "\u7528\u6237\u8D26\u53F7\u72B6\u6001",
      status: 1,
      sort: 2,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 3,
      typeName: "\u8BA2\u5355\u72B6\u6001",
      typeCode: "order_status",
      description: "\u8BA2\u5355\u72B6\u6001\u5B57\u5178",
      status: 1,
      sort: 3,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 4,
      typeName: "\u652F\u4ED8\u65B9\u5F0F",
      typeCode: "payment_method",
      description: "\u652F\u4ED8\u65B9\u5F0F\u5B57\u5178",
      status: 1,
      sort: 4,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 5,
      typeName: "\u6570\u636E\u6743\u9650",
      typeCode: "data_permission",
      description: "\u6570\u636E\u6743\u9650\u8303\u56F4",
      status: 1,
      sort: 5,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    }
  ];
  return {
    code: 200,
    message: "success",
    data: mockData.filter((item) => item.status === 1)
  };
});

const all_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: all_get
});

const create_post$6 = defineEventHandler(async (event) => {
  const body = await readBody(event);
  return {
    code: 200,
    message: "\u521B\u5EFA\u6210\u529F",
    data: {
      id: Math.floor(Math.random() * 1e4),
      ...body,
      createTime: Date.now(),
      updateTime: Date.now()
    }
  };
});

const create_post$7 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: create_post$6
});

const list_post$6 = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const mockData = [
    {
      id: 1,
      typeName: "\u7528\u6237\u6027\u522B",
      typeCode: "user_gender",
      description: "\u7528\u6237\u6027\u522B\u5B57\u5178",
      status: 1,
      sort: 1,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 2,
      typeName: "\u7528\u6237\u72B6\u6001",
      typeCode: "user_status",
      description: "\u7528\u6237\u8D26\u53F7\u72B6\u6001",
      status: 1,
      sort: 2,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 3,
      typeName: "\u8BA2\u5355\u72B6\u6001",
      typeCode: "order_status",
      description: "\u8BA2\u5355\u72B6\u6001\u5B57\u5178",
      status: 1,
      sort: 3,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 4,
      typeName: "\u652F\u4ED8\u65B9\u5F0F",
      typeCode: "payment_method",
      description: "\u652F\u4ED8\u65B9\u5F0F\u5B57\u5178",
      status: 1,
      sort: 4,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 5,
      typeName: "\u6570\u636E\u6743\u9650",
      typeCode: "data_permission",
      description: "\u6570\u636E\u6743\u9650\u8303\u56F4",
      status: 1,
      sort: 5,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 6,
      typeName: "\u901A\u77E5\u7C7B\u578B",
      typeCode: "notice_type",
      description: "\u7CFB\u7EDF\u901A\u77E5\u7C7B\u578B",
      status: 0,
      sort: 6,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    }
  ];
  let filteredData = [...mockData];
  if (body.typeName) {
    filteredData = filteredData.filter(
      (item) => item.typeName.includes(body.typeName)
    );
  }
  if (body.typeCode) {
    filteredData = filteredData.filter(
      (item) => item.typeCode.includes(body.typeCode)
    );
  }
  if (body.status !== void 0 && body.status !== null) {
    filteredData = filteredData.filter((item) => item.status === body.status);
  }
  if (body.orderbyFiled) {
    const [field, order] = body.orderbyFiled.split(":");
    filteredData.sort((a, b) => {
      if (order === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
  }
  const count = filteredData.length;
  const page = body.page || 1;
  const limit = body.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    code: 200,
    message: "success",
    data: {
      list: filteredData.slice(start, end),
      count,
      page,
      limit
    }
  };
});

const list_post$7 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_post$6
});

const index$2 = eventHandler(() => {
  return { nitro: "Hello Antdv Pro" };
});

const index$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index$2
});

const _id__delete$2 = eventHandler((event) => {
  const id = event.context.params.id;
  if (typeof id !== "number") {
    setResponseStatus(event, 403);
    return {
      code: 403,
      msg: "\u5220\u9664\u5931\u8D25"
    };
  }
  return {
    code: 200,
    msg: "\u5220\u9664\u6210\u529F"
  };
});

const _id__delete$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete$2
});

const basicList_post = eventHandler(async (_event) => {
  const dataList = [
    {
      title: "Aipay",
      link: "https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png",
      percent: 57,
      content: "\u4E00\u751F\u90A3\u4E48\u77ED\uFF0C\u9057\u5FD8\u53C8\u90A3\u4E48\u6F2B\u957F"
    },
    {
      title: "Ant Design Vue",
      link: "https://www.antdv.com/assets/logo.1ef800a8.svg",
      percent: 60,
      status: "active",
      content: "\u53EA\u6709\u5728\u68A6\u60F3\u4E2D\uFF0C\u4EBA\u624D\u80FD\u771F\u6B63\u81EA\u7531"
    },
    {
      title: "Vue",
      link: "https://gw.alipayobjects.com/zos/rmsportal/ComBAopevLwENQdKWiIn.png",
      percent: 70,
      status: "exception",
      content: "\u751F\u547D\u5C31\u50CF\u4E00\u76D2\u5DE7\u514B\u529B\uFF0C\u7ED3\u679C\u5F80\u5F80\u51FA\u4EBA\u610F\u6599"
    },
    {
      title: "Vite",
      link: "https://cn.vitejs.dev/logo.svg",
      percent: 100,
      status: "active",
      content: "\u6709\u65F6\uFF0C\u4F60\u5FC5\u987B\u8FDB\u5165\u522B\u4EBA\u7684\u4E16\u754C\u53BB\u53D1\u73B0\u81EA\u5DF1\u7684\u4E16\u754C\u7F3A\u5C11\u4EC0\u4E48"
    },
    {
      title: "React",
      link: "https://gw.alipayobjects.com/zos/rmsportal/kZzEzemZyKLKFsojXItE.png",
      percent: 50,
      status: "exception",
      content: "\u5E0C\u671B\u662F\u4EF6\u7F8E\u4E3D\u7684\u4E1C\u897F\uFF0C\u4E5F\u8BB8\u662F\u6700\u597D\u7684\u4E1C\u897F"
    },
    {
      title: "Antdv Pro",
      link: "/logo.svg",
      percent: 80,
      status: "active",
      content: "\u4EBA\u5E76\u975E\u751F\u6765\u5C31\u4F1F\u5927\uFF0C\u800C\u662F\u8D8A\u6D3B\u8D8A\u4F1F\u5927"
    },
    {
      title: "Webpack",
      link: "https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png",
      percent: 58,
      content: "\u4E0D\u7BA1\u4F55\u65F6\u4F55\u5730\uFF0C\u505A\u4F60\u60F3\u505A\u7684\u4E8B\u6C38\u8FDC\u90FD\u4E0D\u5ACC\u665A"
    },
    {
      title: "Angular",
      link: "https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png",
      percent: 70,
      status: "active",
      content: "\u4F60\u8981\u4E00\u76F4\u4E0D\u505C\u5730\u5F80\u524D\u8D70\uFF0C\u4E0D\u7136\u4F60\u4E0D\u4F1A\u77E5\u9053\u751F\u6D3B\u8FD8\u4F1A\u7ED9\u4F60\u4EC0\u4E48"
    }
  ];
  const data = [];
  for (let i = 0; i < 1e3; i++) {
    const arr = cloneDeep(dataList);
    data.push(...arr);
  }
  for (let i = 0; i < data.length; i++)
    data[i].start = dayjs().subtract(i, "hour").format("YYYY-MM-DD HH:mm");
  return {
    code: 200,
    msg: "\u83B7\u53D6\u6210\u529F",
    data
  };
});

const basicList_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: basicList_post
});

const consultList_post = eventHandler(async (_event) => {
  const body = await readBody(_event);
  const dataList = [
    {
      id: 1,
      name: "\u7B2C\u4E00\u4E2A\u4EFB\u52A1",
      callNo: 2e3,
      desc: "\u4E00\u751F\u90A3\u4E48\u77ED\uFF0C\u9057\u5FD8\u53C8\u90A3\u4E48\u6F2B\u957F",
      status: "2" /* ONLINE */,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm")
    },
    {
      id: 2,
      name: "Ant Design Vue",
      callNo: 200,
      desc: "\u6709\u65F6\uFF0C\u4F60\u5FC5\u987B\u8FDB\u5165\u522B\u4EBA\u7684\u4E16\u754C\u53BB\u53D1\u73B0\u81EA\u5DF1\u7684\u4E16\u754C\u7F3A\u5C11\u4EC0\u4E48",
      status: "0" /* OFF */,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm")
    },
    {
      id: 3,
      name: "Vue",
      callNo: 2010,
      desc: "\u4E00\u751F\u90A3\u4E48\u77ED\uFF0C\u9057\u5FD8\u53C8\u90A3\u4E48\u6F2B\u957F",
      status: "3" /* ERROR */,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm")
    },
    {
      id: 4,
      name: "Vite",
      callNo: 20300,
      desc: "\u5E0C\u671B\u662F\u4EF6\u7F8E\u4E3D\u7684\u4E1C\u897F\uFF0C\u4E5F\u8BB8\u662F\u6700\u597D\u7684\u4E1C\u897F",
      status: "3" /* ERROR */,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm")
    },
    {
      id: 5,
      name: "React",
      callNo: 2e3,
      desc: "\u4EBA\u5E76\u975E\u751F\u6765\u5C31\u4F1F\u5927\uFF0C\u800C\u662F\u8D8A\u6D3B\u8D8A\u4F1F\u5927",
      status: "2" /* ONLINE */,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm")
    },
    {
      id: 6,
      name: "Antdv Pro",
      callNo: 2e3,
      desc: "\u4E0D\u7BA1\u4F55\u65F6\u4F55\u5730\uFF0C\u505A\u4F60\u60F3\u505A\u7684\u4E8B\u6C38\u8FDC\u90FD\u4E0D\u5ACC\u665A",
      status: "0" /* OFF */,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm")
    },
    {
      id: 7,
      name: "Webpack",
      callNo: 2e3,
      desc: "\u4F60\u8981\u4E00\u76F4\u4E0D\u505C\u5730\u5F80\u524D\u8D70\uFF0C\u4E0D\u7136\u4F60\u4E0D\u4F1A\u77E5\u9053\u751F\u6D3B\u8FD8\u4F1A\u7ED9\u4F60\u4EC0\u4E48",
      status: "2" /* ONLINE */,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm")
    }
  ];
  const data = dataList.filter((i) => {
    if (body.name)
      return body.name === i.name;
    else return true;
  });
  return {
    code: 200,
    msg: "\u83B7\u53D6\u6210\u529F",
    data
  };
});

const consultList_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: consultList_post
});

const create_post$4 = eventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body);
  return {
    code: 200,
    msg: "\u521B\u5EFA\u6210\u529F"
  };
});

const create_post$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: create_post$4
});

const crudTable_post = eventHandler(async (_event) => {
  const body = await readBody(_event);
  const dataList = [
    {
      id: 1,
      name: "\u7B2C\u4E00\u4E2A\u4EFB\u52A1",
      value: "2000",
      remark: "\u4E00\u751F\u90A3\u4E48\u77ED\uFF0C\u9057\u5FD8\u53C8\u90A3\u4E48\u6F2B\u957F"
    },
    {
      id: 2,
      name: "Ant Design Vue",
      value: "200",
      remark: "\u6709\u65F6\uFF0C\u4F60\u5FC5\u987B\u8FDB\u5165\u522B\u4EBA\u7684\u4E16\u754C\u53BB\u53D1\u73B0\u81EA\u5DF1\u7684\u4E16\u754C\u7F3A\u5C11\u4EC0\u4E48"
    },
    {
      id: 3,
      name: "Vue",
      value: "2010",
      remark: "\u4E00\u751F\u90A3\u4E48\u77ED\uFF0C\u9057\u5FD8\u53C8\u90A3\u4E48\u6F2B\u957F"
    },
    {
      id: 4,
      name: "Vite",
      value: "20300",
      remark: "\u5E0C\u671B\u662F\u4EF6\u7F8E\u4E3D\u7684\u4E1C\u897F\uFF0C\u4E5F\u8BB8\u662F\u6700\u597D\u7684\u4E1C\u897F"
    },
    {
      id: 5,
      name: "React",
      value: "2000",
      remark: "\u4EBA\u5E76\u975E\u751F\u6765\u5C31\u4F1F\u5927\uFF0C\u800C\u662F\u8D8A\u6D3B\u8D8A\u4F1F\u5927"
    },
    {
      id: 6,
      name: "Antdv Pro",
      value: "2000",
      remark: "\u4E0D\u7BA1\u4F55\u65F6\u4F55\u5730\uFF0C\u505A\u4F60\u60F3\u505A\u7684\u4E8B\u6C38\u8FDC\u90FD\u4E0D\u5ACC\u665A"
    },
    {
      id: 7,
      name: "Webpack",
      value: "2000",
      remark: "\u4F60\u8981\u4E00\u76F4\u4E0D\u505C\u5730\u5F80\u524D\u8D70\uFF0C\u4E0D\u7136\u4F60\u4E0D\u4F1A\u77E5\u9053\u751F\u6D3B\u8FD8\u4F1A\u7ED9\u4F60\u4EC0\u4E48"
    }
  ];
  const data = dataList.filter((i) => {
    if (body.name)
      return body.name === i.name;
    else return true;
  });
  return {
    code: 200,
    msg: "\u83B7\u53D6\u6210\u529F",
    data: {
      records: data,
      total: data.length
    }
  };
});

const crudTable_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: crudTable_post
});

const index_post = eventHandler(async (event) => {
  var _a, _b, _c;
  const body = await readBody(event);
  const dataList = [];
  for (let i = 0; i < 10; i++) {
    const item = {
      id: i + 1,
      title: `${(_a = body.title) != null ? _a : "\u6D4B\u8BD5"}_${i}`,
      username: `${(_b = body.username) != null ? _b : "test"}_${i}`,
      password: `${(_c = body.username) != null ? _c : "test"}_pass_${i}`
    };
    dataList.push(item);
  }
  return {
    code: 200,
    msg: "\u83B7\u53D6\u6210\u529F",
    data: dataList
  };
});

const index_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_post
});

const index_put = eventHandler(async (_event) => {
  return {
    code: 200,
    msg: "\u7F16\u8F91\u6210\u529F"
  };
});

const index_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: index_put
});

const login_post = eventHandler(async (event) => {
  const body = await readBody(event);
  const { type } = body;
  const success = {
    code: 200,
    data: {
      token: "1234567890"
    },
    msg: "\u767B\u5F55\u6210\u529F"
  };
  if (type !== "mobile") {
    success.data.token = Buffer.from(body.username).toString("base64");
    if (body.username === "admin" && body.password === "admin")
      return success;
    if (body.username === "user" && body.password === "user")
      return success;
  } else {
    return success;
  }
  setResponseStatus(event, 403);
  return {
    code: 401,
    msg: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF"
  };
});

const login_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: login_post
});

const logout = eventHandler(() => {
  return {
    code: 200,
    msg: "success"
  };
});

const logout$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: logout
});

const menuData = [
  {
    id: 2,
    parentId: null,
    title: "\u5206\u6790\u9875",
    icon: "DashboardOutlined",
    component: "/dashboard/analysis",
    path: "/dashboard/analysis",
    name: "DashboardAnalysis",
    keepAlive: true,
    locale: "menu.dashboard.analysis"
  },
  {
    id: 1,
    parentId: null,
    title: "\u4EEA\u8868\u76D8",
    icon: "DashboardOutlined",
    component: "RouteView",
    redirect: "/dashboard/analysis",
    path: "/dashboard",
    name: "Dashboard",
    locale: "menu.dashboard"
  },
  {
    id: 3,
    parentId: null,
    title: "\u8868\u5355\u9875",
    icon: "FormOutlined",
    component: "RouteView",
    redirect: "/form/basic",
    path: "/form",
    name: "Form",
    locale: "menu.form"
  },
  {
    id: 5,
    parentId: null,
    title: "\u94FE\u63A5",
    icon: "LinkOutlined",
    component: "RouteView",
    redirect: "/link/iframe",
    path: "/link",
    name: "Link",
    locale: "menu.link"
  },
  {
    id: 6,
    parentId: 5,
    title: "AntDesign",
    url: "https://ant.design/",
    component: "Iframe",
    path: "/link/iframe",
    name: "LinkIframe",
    keepAlive: true,
    locale: "menu.link.iframe"
  },
  {
    id: 7,
    parentId: 5,
    title: "AntDesignVue",
    url: "https://antdv.com/",
    component: "Iframe",
    path: "/link/antdv",
    name: "LinkAntdv",
    keepAlive: true,
    locale: "menu.link.antdv"
  },
  {
    id: 8,
    parentId: 5,
    path: "https://www.baidu.com",
    name: "LinkExternal",
    title: "\u8DF3\u8F6C\u767E\u5EA6",
    locale: "menu.link.external"
  },
  {
    id: 9,
    parentId: null,
    title: "\u83DC\u5355",
    icon: "BarsOutlined",
    component: "RouteView",
    path: "/menu",
    redirect: "/menu/menu1",
    name: "Menu",
    locale: "menu.menu"
  },
  {
    id: 10,
    parentId: 9,
    title: "\u83DC\u53551",
    component: "/menu/menu1",
    path: "/menu/menu1",
    name: "MenuMenu11",
    keepAlive: true,
    locale: "menu.menu.menu1"
  },
  {
    id: 11,
    parentId: 9,
    title: "\u83DC\u53552",
    component: "/menu/menu2",
    path: "/menu/menu2",
    keepAlive: true,
    locale: "menu.menu.menu2"
  },
  {
    id: 12,
    parentId: 9,
    path: "/menu/menu3",
    redirect: "/menu/menu3/menu1",
    title: "\u83DC\u53551-1",
    component: "RouteView",
    locale: "menu.menu.menu3"
  },
  {
    id: 13,
    parentId: 12,
    path: "/menu/menu3/menu1",
    component: "/menu/menu-1-1/menu1",
    title: "\u83DC\u53551-1-1",
    keepAlive: true,
    locale: "menu.menu3.menu1"
  },
  {
    id: 14,
    parentId: 12,
    path: "/menu/menu3/menu2",
    component: "/menu/menu-1-1/menu2",
    title: "\u83DC\u53551-1-2",
    keepAlive: true,
    locale: "menu.menu3.menu2"
  },
  {
    id: 15,
    path: "/access",
    component: "RouteView",
    redirect: "/access/common",
    title: "\u6743\u9650\u6A21\u5757",
    name: "Access",
    parentId: null,
    icon: "ClusterOutlined",
    locale: "menu.access"
  },
  {
    id: 16,
    parentId: 15,
    path: "/access/common",
    title: "\u901A\u7528\u6743\u9650",
    name: "AccessCommon",
    component: "/access/common",
    locale: "menu.access.common"
  },
  {
    id: 17,
    parentId: 15,
    path: "/access/user",
    title: "\u666E\u901A\u7528\u6237",
    name: "AccessUser",
    component: "/access/user",
    locale: "menu.access.user"
  },
  {
    id: 19,
    parentId: null,
    title: "\u5F02\u5E38\u9875",
    icon: "WarningOutlined",
    component: "RouteView",
    redirect: "/exception/403",
    path: "/exception",
    name: "Exception",
    locale: "menu.exception"
  },
  {
    id: 20,
    parentId: 19,
    path: "/exception/403",
    title: "403",
    name: "403",
    component: "/exception/403",
    locale: "menu.exception.not-permission"
  },
  {
    id: 21,
    parentId: 19,
    path: "/exception/404",
    title: "404",
    name: "404",
    component: "/exception/404",
    locale: "menu.exception.not-find"
  },
  {
    id: 22,
    parentId: 19,
    path: "/exception/500",
    title: "500",
    name: "500",
    component: "/exception/500",
    locale: "menu.exception.server-error"
  },
  {
    id: 23,
    parentId: null,
    title: "\u7ED3\u679C\u9875",
    icon: "CheckCircleOutlined",
    component: "RouteView",
    redirect: "/result/success",
    path: "/result",
    name: "Result",
    locale: "menu.result"
  },
  {
    id: 24,
    parentId: 23,
    path: "/result/success",
    title: "\u6210\u529F\u9875",
    name: "ResultSuccess",
    component: "/result/success",
    locale: "menu.result.success"
  },
  {
    id: 25,
    parentId: 23,
    path: "/result/fail",
    title: "\u5931\u8D25\u9875",
    name: "ResultFail",
    component: "/result/fail",
    locale: "menu.result.fail"
  },
  {
    id: 26,
    parentId: null,
    title: "\u5217\u8868\u9875",
    icon: "TableOutlined",
    component: "RouteView",
    redirect: "/list/card-list",
    path: "/list",
    name: "List",
    locale: "menu.list"
  },
  {
    id: 27,
    parentId: 26,
    path: "/list/card-list",
    title: "\u5361\u7247\u5217\u8868",
    name: "ListCard",
    component: "/list/card-list",
    locale: "menu.list.card-list"
  },
  {
    id: 28,
    parentId: null,
    title: "\u8BE6\u60C5\u9875",
    icon: "ProfileOutlined",
    component: "RouteView",
    redirect: "/profile/basic",
    path: "/profile",
    name: "Profile",
    locale: "menu.profile"
  },
  {
    id: 29,
    parentId: 28,
    path: "/profile/basic",
    title: "\u57FA\u7840\u8BE6\u60C5\u9875",
    name: "ProfileBasic",
    component: "/profile/basic/index",
    locale: "menu.profile.basic"
  },
  {
    id: 30,
    parentId: 26,
    path: "/list/search-list",
    title: "\u641C\u7D22\u5217\u8868",
    name: "SearchList",
    component: "/list/search-list",
    locale: "menu.list.search-list"
  },
  {
    id: 31,
    parentId: 30,
    path: "/list/search-list/articles",
    title: "\u641C\u7D22\u5217\u8868\uFF08\u6587\u7AE0\uFF09",
    name: "SearchListArticles",
    component: "/list/search-list/articles",
    locale: "menu.list.search-list.articles"
  },
  {
    id: 32,
    parentId: 30,
    path: "/list/search-list/projects",
    title: "\u641C\u7D22\u5217\u8868\uFF08\u9879\u76EE\uFF09",
    name: "SearchListProjects",
    component: "/list/search-list/projects",
    locale: "menu.list.search-list.projects"
  },
  {
    id: 33,
    parentId: 30,
    path: "/list/search-list/applications",
    title: "\u641C\u7D22\u5217\u8868\uFF08\u5E94\u7528\uFF09",
    name: "SearchListApplications",
    component: "/list/search-list/applications",
    locale: "menu.list.search-list.applications"
  },
  {
    id: 34,
    parentId: 26,
    path: "/list/basic-list",
    title: "\u6807\u51C6\u5217\u8868",
    name: "BasicCard",
    component: "/list/basic-list",
    locale: "menu.list.basic-list"
  },
  {
    id: 35,
    parentId: 28,
    path: "/profile/advanced",
    title: "\u9AD8\u7EA7\u8BE6\u7EC6\u9875",
    name: "ProfileAdvanced",
    component: "/profile/advanced/index",
    locale: "menu.profile.advanced"
  },
  {
    id: 4,
    parentId: 3,
    title: "\u57FA\u7840\u8868\u5355",
    component: "/form/basic-form/index",
    path: "/form/basic-form",
    name: "FormBasic",
    keepAlive: false,
    locale: "menu.form.basic-form"
  },
  {
    id: 36,
    parentId: null,
    title: "\u4E2A\u4EBA\u9875",
    icon: "UserOutlined",
    component: "RouteView",
    redirect: "/account/center",
    path: "/account",
    name: "Account",
    locale: "menu.account"
  },
  {
    id: 37,
    parentId: 36,
    path: "/account/center",
    title: "\u4E2A\u4EBA\u4E2D\u5FC3",
    name: "AccountCenter",
    component: "/account/center",
    locale: "menu.account.center"
  },
  {
    id: 38,
    parentId: 36,
    path: "/account/settings",
    title: "\u4E2A\u4EBA\u8BBE\u7F6E",
    name: "AccountSettings",
    component: "/account/settings",
    locale: "menu.account.settings"
  },
  {
    id: 39,
    parentId: 3,
    title: "\u5206\u6B65\u8868\u5355",
    component: "/form/step-form/index",
    path: "/form/step-form",
    name: "FormStep",
    keepAlive: false,
    locale: "menu.form.step-form"
  },
  {
    id: 40,
    parentId: 3,
    title: "\u9AD8\u7EA7\u8868\u5355",
    component: "/form/advanced-form/index",
    path: "/form/advanced-form",
    name: "FormAdvanced",
    keepAlive: false,
    locale: "menu.form.advanced-form"
  },
  {
    id: 41,
    parentId: 26,
    path: "/list/table-list",
    title: "\u67E5\u8BE2\u8868\u683C",
    name: "ConsultTable",
    component: "/list/table-list",
    locale: "menu.list.consult-table"
  },
  {
    id: 42,
    parentId: 1,
    title: "\u76D1\u63A7\u9875",
    component: "/dashboard/monitor",
    path: "/dashboard/monitor",
    name: "DashboardMonitor",
    keepAlive: true,
    locale: "menu.dashboard.monitor"
  },
  {
    id: 43,
    parentId: 1,
    title: "\u5DE5\u4F5C\u53F0",
    component: "/dashboard/workplace",
    path: "/dashboard/workplace",
    name: "DashboardWorkplace",
    keepAlive: true,
    locale: "menu.dashboard.workplace"
  },
  {
    id: 44,
    parentId: 26,
    path: "/list/crud-table",
    title: "\u589E\u5220\u6539\u67E5\u8868\u683C",
    name: "CrudTable",
    component: "/list/crud-table",
    locale: "menu.list.crud-table"
  },
  {
    id: 45,
    parentId: 9,
    path: "/menu/menu4",
    redirect: "/menu/menu4/menu1",
    title: "\u83DC\u53552-1",
    component: "RouteView",
    locale: "menu.menu.menu4"
  },
  {
    id: 46,
    parentId: 45,
    path: "/menu/menu4/menu1",
    component: "/menu/menu-2-1/menu1",
    title: "\u83DC\u53552-1-1",
    keepAlive: true,
    locale: "menu.menu4.menu1"
  },
  {
    id: 47,
    parentId: 45,
    path: "/menu/menu4/menu2",
    component: "/menu/menu-2-1/menu2",
    title: "\u83DC\u53552-1-2",
    keepAlive: true,
    locale: "menu.menu4.menu2"
  }
];
const accessMenuData = [
  {
    id: 18,
    parentId: 15,
    path: "/access/admin",
    title: "\u7BA1\u7406\u5458",
    name: "AccessAdmin",
    component: "/access/admin",
    locale: "menu.access.admin"
  }
];
const index = eventHandler((event) => {
  const token = getHeader(event, "token");
  const username = Buffer.from(token, "base64").toString("utf-8");
  return {
    code: 200,
    msg: "\u83B7\u53D6\u6210\u529F",
    data: [...menuData, ...username === "admin" ? accessMenuData : []]
  };
});

const index$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  accessMenuData: accessMenuData,
  default: index
});

const _id__get$6 = defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  const mockData = {
    "1": {
      id: "1",
      name: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      code: "241711",
      parentId: null,
      parentName: "\u4E2D\u56FD\u79D1\u5B66\u9662",
      isActive: true,
      order: 0,
      isIndependentTraining: true,
      isVirtual: false
    },
    "1-1": {
      id: "1-1",
      name: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      code: "241711001",
      parentId: "1",
      parentName: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      isActive: true,
      order: 1,
      isIndependentTraining: false,
      isVirtual: false
    }
  };
  return mockData[id || "1"] || mockData["1"];
});

const _id__get$7 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get$6
});

const tree = defineEventHandler(() => {
  return [
    {
      id: "1",
      name: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      code: "241711",
      parentId: null,
      parentName: "\u4E2D\u56FD\u79D1\u5B66\u9662",
      isActive: true,
      order: 0,
      isIndependentTraining: true,
      isVirtual: false,
      children: [
        {
          id: "1-1",
          name: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
          code: "241711001",
          parentId: "1",
          parentName: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
          isActive: true,
          order: 1,
          isIndependentTraining: false,
          isVirtual: false,
          children: [
            {
              id: "1-1-1",
              name: "\u515A\u7FA4\u529E\u516C\u5BA4",
              code: "241711001001",
              parentId: "1-1",
              parentName: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
              isActive: true,
              order: 1,
              isIndependentTraining: false,
              isVirtual: false
            }
          ]
        },
        {
          id: "1-2",
          name: "\u9AD8\u6027\u80FD\u8BA1\u7B97\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
          code: "241711002",
          parentId: "1",
          parentName: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
          isActive: true,
          order: 2,
          isIndependentTraining: false,
          isVirtual: false
        },
        {
          id: "1-3",
          name: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
          code: "241711003",
          parentId: "1",
          parentName: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
          isActive: true,
          order: 3,
          isIndependentTraining: false,
          isVirtual: false,
          children: [
            {
              id: "1-3-1",
              name: "\u5E7F\u5DDE\u4E2D\u5FC3",
              code: "241711003001",
              parentId: "1-3",
              parentName: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
              isActive: true,
              order: 1,
              isIndependentTraining: false,
              isVirtual: false
            },
            {
              id: "1-3-2",
              name: "\u57FA\u5730\u529E\u516C\u5BA4",
              code: "241711003002",
              parentId: "1-3",
              parentName: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
              isActive: true,
              order: 2,
              isIndependentTraining: false,
              isVirtual: false
            }
          ]
        }
      ]
    }
  ];
});

const tree$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: tree
});

const _id__get$4 = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const mockPersonnel = {
    id,
    userCode: "ceshi123456",
    userName: "\u674E\u6E05\u7167",
    organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
    organizationId: "1-1",
    isNaturalPerson: true,
    phone: "13812345678",
    email: "ceshizhanghao@qq.com",
    status: true
  };
  return {
    code: 200,
    message: "success",
    data: mockPersonnel
  };
});

const _id__get$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get$4
});

const status_put$2 = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  return {
    code: 200,
    message: body.status ? "\u542F\u7528\u6210\u529F" : "\u7981\u7528\u6210\u529F",
    data: {
      id,
      status: body.status
    }
  };
});

const status_put$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: status_put$2
});

const list_post$4 = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const mockPersonnelData = [
    {
      id: "1",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "",
      email: "ceshizhanghao@qq.com",
      status: true
    },
    {
      id: "2",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "",
      email: "ceshizhanghao@qq.com",
      status: false
    },
    {
      id: "3",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "13812345678",
      email: "ceshizhanghao@qq.com",
      status: true
    },
    {
      id: "4",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "13812345678",
      email: "ceshizhanghao@qq.com",
      status: true
    },
    {
      id: "5",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "13812345678",
      email: "ceshizhanghao@qq.com",
      status: true
    },
    {
      id: "6",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "",
      email: "ceshizhanghao@qq.com",
      status: true
    },
    {
      id: "7",
      userCode: "test789012",
      userName: "\u738B\u7EF4",
      organization: "\u9AD8\u6027\u80FD\u8BA1\u7B97\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-2",
      isNaturalPerson: true,
      phone: "13987654321",
      email: "wangwei@qq.com",
      status: true
    },
    {
      id: "8",
      userCode: "test345678",
      userName: "\u675C\u752B",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-3",
      isNaturalPerson: false,
      phone: "13765432109",
      email: "dufu@qq.com",
      status: true
    },
    {
      id: "9",
      userCode: "user111222",
      userName: "\u767D\u5C45\u6613",
      organization: "\u5E7F\u5DDE\u4E2D\u5FC3",
      organizationId: "1-3-1",
      isNaturalPerson: true,
      phone: "13654321098",
      email: "baijuyi@qq.com",
      status: false
    },
    {
      id: "10",
      userCode: "admin999888",
      userName: "\u674E\u767D",
      organization: "\u515A\u7FA4\u529E\u516C\u5BA4",
      organizationId: "1-1-1",
      isNaturalPerson: true,
      phone: "13543210987",
      email: "libai@qq.com",
      status: true
    }
  ];
  let filteredData = [...mockPersonnelData];
  if (body.organizationId) {
    filteredData = filteredData.filter((item) => item.organizationId === body.organizationId);
  }
  if (body.userCode) {
    filteredData = filteredData.filter(
      (item) => item.userCode.toLowerCase().includes(body.userCode.toLowerCase())
    );
  }
  if (body.userName) {
    filteredData = filteredData.filter(
      (item) => item.userName.includes(body.userName)
    );
  }
  if (body.organization) {
    filteredData = filteredData.filter(
      (item) => item.organization.includes(body.organization)
    );
  }
  const pageNum = body.pageNum || 1;
  const pageSize = body.pageSize || 10;
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  return {
    code: 200,
    message: "success",
    data: {
      list: paginatedData,
      total: filteredData.length
    }
  };
});

const list_post$5 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_post$4
});

const _id__get$2 = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const mockData = {
    id,
    userCode: "ceshi123456",
    userName: "\u674E\u6E05\u7167",
    organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
    roles: ["\u5B66\u5458"],
    roleIds: ["1"]
  };
  return {
    code: 200,
    message: "success",
    data: mockData
  };
});

const _id__get$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get$2
});

const batchDelete_post$2 = defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("\u6279\u91CF\u5220\u9664\u89D2\u8272\u5206\u914D:", body.ids);
  return {
    code: 200,
    message: "\u6279\u91CF\u5220\u9664\u6210\u529F",
    data: null
  };
});

const batchDelete_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: batchDelete_post$2
});

const create_post$2 = defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("\u521B\u5EFA\u89D2\u8272\u5206\u914D:", body);
  return {
    code: 200,
    message: "\u89D2\u8272\u5206\u914D\u521B\u5EFA\u6210\u529F",
    data: {
      id: Date.now().toString(),
      ...body
    }
  };
});

const create_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: create_post$2
});

const list_post$2 = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const mockData = [
    {
      id: "1",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    },
    {
      id: "2",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    },
    {
      id: "3",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    },
    {
      id: "4",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    },
    {
      id: "5",
      userCode: "user001",
      userName: "\u5F20\u4E09",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u7CFB\u7EDF\u7BA1\u7406\u5458", "\u9879\u76EE\u534F\u8C03\u5458"],
      roleIds: ["2", "4"]
    },
    {
      id: "6",
      userCode: "user002",
      userName: "\u738B\u82B3",
      organization: "\u9AD8\u6027\u80FD\u8BA1\u7B97\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u90E8\u95E8\u7BA1\u7406\u5458"],
      roleIds: ["3"]
    },
    {
      id: "7",
      userCode: "user003",
      userName: "\u8D75\u4E3D",
      organization: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      roles: ["\u5BA1\u6838\u5458", "\u5B66\u5458"],
      roleIds: ["5", "1"]
    },
    {
      id: "8",
      userCode: "user004",
      userName: "\u5B59\u6885",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u9879\u76EE\u7BA1\u7406\u5458"],
      roleIds: ["1"]
    },
    {
      id: "9",
      userCode: "user005",
      userName: "\u5468\u5F3A",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u90E8\u95E8\u7BA1\u7406\u5458", "\u5BA1\u6838\u5458"],
      roleIds: ["3", "5"]
    },
    {
      id: "10",
      userCode: "user006",
      userName: "\u5434\u9759",
      organization: "\u9AD8\u6027\u80FD\u8BA1\u7B97\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    }
  ];
  const additionalData = [];
  for (let i = 11; i <= 123; i++) {
    additionalData.push({
      id: String(i),
      userCode: `ceshi123456`,
      userName: "\u674E\u6E05\u7167",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    });
  }
  const allData = [...mockData, ...additionalData];
  let filteredData = [...allData];
  if (body.userName) {
    filteredData = filteredData.filter(
      (item) => item.userName.includes(body.userName)
    );
  }
  if (body.roleName) {
    filteredData = filteredData.filter(
      (item) => item.roles.some((role) => role.includes(body.roleName))
    );
  }
  const total = filteredData.length;
  const pageNum = body.pageNum || 1;
  const pageSize = body.pageSize || 10;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  return {
    code: 200,
    message: "success",
    data: {
      list: filteredData.slice(start, end),
      total
    }
  };
});

const list_post$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_post$2
});

const _id__delete = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  return {
    code: 200,
    message: "\u5220\u9664\u6210\u529F",
    data: { id }
  };
});

const _id__delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__delete
});

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const mockRole = {
    id,
    roleName: "\u9879\u76EE\u7BA1\u7406\u5458",
    roleCode: "ROLE_001",
    isVirtualManagerRole: false,
    managementScopeType: "\u672C\u5355\u4F4D\u53CA\u4E0B\u5C5E\u5355\u4F4D",
    managementScope: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
    createTime: "2025-07-02 12:12:12",
    remark: "-",
    status: true
  };
  return {
    code: 200,
    message: "success",
    data: mockRole
  };
});

const _id__get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__get
});

const _id__put = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  return {
    code: 200,
    message: "\u66F4\u65B0\u6210\u529F",
    data: {
      id,
      ...body
    }
  };
});

const _id__put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _id__put
});

const permissions_get = defineEventHandler(async (event) => {
  getRouterParam(event, "id");
  const mockPermissions = [
    "/dashboard",
    "/dashboard/analysis",
    "/system-management",
    "/system-management/organization-management",
    "/system-management/personnel-management"
  ];
  return {
    code: 200,
    message: "success",
    data: mockPermissions
  };
});

const permissions_get$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: permissions_get
});

const permissions_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  console.log("\u4FDD\u5B58\u89D2\u8272\u6743\u9650:", {
    roleId: id,
    permissions: body.permissions
  });
  return {
    code: 200,
    message: "\u6743\u9650\u4FDD\u5B58\u6210\u529F",
    data: null
  };
});

const permissions_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: permissions_post
});

const status_put = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  return {
    code: 200,
    message: "\u72B6\u6001\u66F4\u65B0\u6210\u529F",
    data: {
      id,
      status: body.status
    }
  };
});

const status_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: status_put
});

const batchDelete_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  return {
    code: 200,
    message: `\u6210\u529F\u5220\u9664 ${body.ids.length} \u4E2A\u89D2\u8272`,
    data: { ids: body.ids }
  };
});

const batchDelete_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: batchDelete_post
});

const create_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  return {
    code: 200,
    message: "\u521B\u5EFA\u6210\u529F",
    data: {
      id: Date.now().toString(),
      ...body,
      createTime: (/* @__PURE__ */ new Date()).toISOString(),
      status: body.status !== void 0 ? body.status : true
    }
  };
});

const create_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: create_post
});

const list_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const mockData = [
    {
      id: "1",
      roleName: "\u9879\u76EE\u7BA1\u7406\u5458",
      roleCode: "ROLE_001",
      isVirtualManagerRole: false,
      managementScopeType: "\u672C\u5355\u4F4D\u53CA\u4E0B\u5C5E\u5355\u4F4D",
      managementScope: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      createTime: "2025-07-02 12:12:12",
      remark: "-",
      status: true
    },
    {
      id: "2",
      roleName: "\u7CFB\u7EDF\u7BA1\u7406\u5458",
      roleCode: "ROLE_002",
      isVirtualManagerRole: false,
      managementScopeType: "\u6240\u6709\u5355\u4F4D",
      managementScope: "\u5168\u90E8",
      createTime: "2025-07-02 12:12:12",
      remark: "\u7CFB\u7EDF\u6700\u9AD8\u6743\u9650\u7BA1\u7406\u5458",
      status: true
    },
    {
      id: "3",
      roleName: "\u90E8\u95E8\u7BA1\u7406\u5458",
      roleCode: "ROLE_003",
      isVirtualManagerRole: false,
      managementScopeType: "\u672C\u5355\u4F4D",
      managementScope: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      createTime: "2025-07-02 12:12:12",
      remark: "\u8D1F\u8D23\u90E8\u95E8\u65E5\u5E38\u7BA1\u7406",
      status: true
    },
    {
      id: "4",
      roleName: "\u9879\u76EE\u534F\u8C03\u5458",
      roleCode: "ROLE_004",
      isVirtualManagerRole: true,
      managementScopeType: "\u672C\u5355\u4F4D\u53CA\u4E0B\u5C5E\u5355\u4F4D",
      managementScope: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      createTime: "2025-07-02 12:12:12",
      remark: "\u534F\u8C03\u9879\u76EE\u76F8\u5173\u4E8B\u52A1",
      status: false
    },
    {
      id: "5",
      roleName: "\u5BA1\u6838\u5458",
      roleCode: "ROLE_005",
      isVirtualManagerRole: false,
      managementScopeType: "\u6307\u5B9A\u5355\u4F4D",
      managementScope: "\u9AD8\u6027\u80FD\u8BA1\u7B97\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      createTime: "2025-07-02 12:12:12",
      remark: "\u8D1F\u8D23\u5BA1\u6838\u6D41\u7A0B",
      status: true
    }
  ];
  let filteredData = [...mockData];
  if (body.roleName) {
    filteredData = filteredData.filter(
      (item) => item.roleName.includes(body.roleName)
    );
  }
  const total = filteredData.length;
  const pageNum = body.pageNum || 1;
  const pageSize = body.pageSize || 10;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  return {
    code: 200,
    message: "success",
    data: {
      list: filteredData.slice(start, end),
      total
    }
  };
});

const list_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: list_post
});

const test_delete = eventHandler(() => {
  return {
    code: 200,
    msg: "delete"
  };
});

const test_delete$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: test_delete
});

const test_post = eventHandler(() => {
  return {
    code: 200,
    msg: "post"
  };
});

const test_post$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: test_post
});

const test_put = eventHandler(() => {
  return {
    code: 200,
    msg: "put"
  };
});

const test_put$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: test_put
});

const info = eventHandler((event) => {
  const token = getHeader(event, "token");
  if (!token) {
    return {
      code: 401,
      msg: "\u767B\u5F55\u5931\u6548"
    };
  }
  const username = Buffer.from(token, "base64").toString("utf-8");
  return {
    code: 200,
    msg: "\u83B7\u53D6\u6210\u529F",
    data: {
      id: 1,
      username,
      nickname: username === "admin" ? "\u7F51\u7EDC\u4E2D\u5FC3\u7BA1\u7406\u5458" : "\u666E\u901A\u7528\u6237",
      avatar: "https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png",
      roles: username === "admin" ? ["ADMIN"] : ["USER"]
    }
  };
});

const info$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: info
});
//# sourceMappingURL=index.mjs.map

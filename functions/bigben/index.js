var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb2, mod) => function __require() {
  return mod || (0, cb2[Object.keys(cb2)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* toIterator(parts, clone2 = true) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else if (ArrayBuffer.isView(part)) {
      if (clone2) {
        let position = part.byteOffset;
        const end = part.byteOffset + part.byteLength;
        while (position !== end) {
          const size = Math.min(end - position, POOL_SIZE);
          const chunk = part.buffer.slice(position, position + size);
          position += chunk.byteLength;
          yield new Uint8Array(chunk);
        }
      } else {
        yield part;
      }
    } else {
      let position = 0;
      while (position !== part.size) {
        const chunk = part.slice(position, Math.min(part.size, position + POOL_SIZE));
        const buffer = await chunk.arrayBuffer();
        position += buffer.byteLength;
        yield new Uint8Array(buffer);
      }
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name2, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name2}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name2, value] of form) {
    yield getHeader(boundary, name2, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name2, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name2, value));
    length += isBlob(value) ? value.size : Buffer.byteLength(String(value));
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = import_stream.default.Readable.from(body.stream());
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const error2 = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(error2);
        throw error2;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    const error_ = error2 instanceof FetchBaseError ? error2 : new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    throw error_;
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name2, value]) => {
    try {
      validateHeaderName(name2);
      validateHeaderValue(name2, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error2 = new AbortError("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (error2) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${error2.message}`, "system", error2));
      finalize();
    });
    fixResponseChunkedTransferBadEnding(request_, (error2) => {
      response.body.destroy(error2);
    });
    if (process.version < "v14") {
      request_.on("socket", (s2) => {
        let endedWithEventsCount;
        s2.prependListener("end", () => {
          endedWithEventsCount = s2._eventsCount;
        });
        s2.prependListener("close", (hadError) => {
          if (response && endedWithEventsCount < s2._eventsCount && !hadError) {
            const error2 = new Error("Premature close");
            error2.code = "ERR_STREAM_PREMATURE_CLOSE";
            response.body.emit("error", error2);
          }
        });
      });
    }
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              headers.set("Location", locationURL);
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
          default:
            return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
        }
      }
      if (signal) {
        response_.once("end", () => {
          signal.removeEventListener("abort", abortAndFinalize);
        });
      }
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), reject);
        raw.once("data", (chunk) => {
          body = (chunk[0] & 15) === 8 ? (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), reject) : (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), reject);
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), reject);
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
  const LAST_CHUNK = Buffer.from("0\r\n\r\n");
  let isChunkedTransfer = false;
  let properLastChunkReceived = false;
  let previousChunk;
  request.on("response", (response) => {
    const { headers } = response;
    isChunkedTransfer = headers["transfer-encoding"] === "chunked" && !headers["content-length"];
  });
  request.on("socket", (socket) => {
    const onSocketClose = () => {
      if (isChunkedTransfer && !properLastChunkReceived) {
        const error2 = new Error("Premature close");
        error2.code = "ERR_STREAM_PREMATURE_CLOSE";
        errorCallback(error2);
      }
    };
    socket.prependListener("close", onSocketClose);
    request.on("abort", () => {
      socket.removeListener("close", onSocketClose);
    });
    socket.on("data", (buf) => {
      properLastChunkReceived = Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;
      if (!properLastChunkReceived && previousChunk) {
        properLastChunkReceived = Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 && Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0;
      }
      previousChunk = buf;
    });
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, commonjsGlobal, src, dataUriToBuffer$1, ponyfill_es2018, POOL_SIZE$1, POOL_SIZE, _parts, _type, _size, _a, _Blob, Blob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ponyfill_es2018 = { exports: {} };
    (function(module2, exports) {
      (function(global2, factory) {
        factory(exports);
      })(commonjsGlobal, function(exports2) {
        const SymbolPolyfill = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol : (description) => `Symbol(${description})`;
        function noop2() {
          return void 0;
        }
        function getGlobals() {
          if (typeof self !== "undefined") {
            return self;
          } else if (typeof window !== "undefined") {
            return window;
          } else if (typeof commonjsGlobal !== "undefined") {
            return commonjsGlobal;
          }
          return void 0;
        }
        const globals = getGlobals();
        function typeIsObject(x2) {
          return typeof x2 === "object" && x2 !== null || typeof x2 === "function";
        }
        const rethrowAssertionErrorRejection = noop2;
        const originalPromise = Promise;
        const originalPromiseThen = Promise.prototype.then;
        const originalPromiseResolve = Promise.resolve.bind(originalPromise);
        const originalPromiseReject = Promise.reject.bind(originalPromise);
        function newPromise(executor) {
          return new originalPromise(executor);
        }
        function promiseResolvedWith(value) {
          return originalPromiseResolve(value);
        }
        function promiseRejectedWith(reason) {
          return originalPromiseReject(reason);
        }
        function PerformPromiseThen(promise, onFulfilled, onRejected) {
          return originalPromiseThen.call(promise, onFulfilled, onRejected);
        }
        function uponPromise(promise, onFulfilled, onRejected) {
          PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), void 0, rethrowAssertionErrorRejection);
        }
        function uponFulfillment(promise, onFulfilled) {
          uponPromise(promise, onFulfilled);
        }
        function uponRejection(promise, onRejected) {
          uponPromise(promise, void 0, onRejected);
        }
        function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
          return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
        }
        function setPromiseIsHandledToTrue(promise) {
          PerformPromiseThen(promise, void 0, rethrowAssertionErrorRejection);
        }
        const queueMicrotask = (() => {
          const globalQueueMicrotask = globals && globals.queueMicrotask;
          if (typeof globalQueueMicrotask === "function") {
            return globalQueueMicrotask;
          }
          const resolvedPromise = promiseResolvedWith(void 0);
          return (fn) => PerformPromiseThen(resolvedPromise, fn);
        })();
        function reflectCall(F2, V2, args) {
          if (typeof F2 !== "function") {
            throw new TypeError("Argument is not a function");
          }
          return Function.prototype.apply.call(F2, V2, args);
        }
        function promiseCall(F2, V2, args) {
          try {
            return promiseResolvedWith(reflectCall(F2, V2, args));
          } catch (value) {
            return promiseRejectedWith(value);
          }
        }
        const QUEUE_MAX_ARRAY_SIZE = 16384;
        class SimpleQueue {
          constructor() {
            this._cursor = 0;
            this._size = 0;
            this._front = {
              _elements: [],
              _next: void 0
            };
            this._back = this._front;
            this._cursor = 0;
            this._size = 0;
          }
          get length() {
            return this._size;
          }
          push(element) {
            const oldBack = this._back;
            let newBack = oldBack;
            if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
              newBack = {
                _elements: [],
                _next: void 0
              };
            }
            oldBack._elements.push(element);
            if (newBack !== oldBack) {
              this._back = newBack;
              oldBack._next = newBack;
            }
            ++this._size;
          }
          shift() {
            const oldFront = this._front;
            let newFront = oldFront;
            const oldCursor = this._cursor;
            let newCursor = oldCursor + 1;
            const elements = oldFront._elements;
            const element = elements[oldCursor];
            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
              newFront = oldFront._next;
              newCursor = 0;
            }
            --this._size;
            this._cursor = newCursor;
            if (oldFront !== newFront) {
              this._front = newFront;
            }
            elements[oldCursor] = void 0;
            return element;
          }
          forEach(callback) {
            let i = this._cursor;
            let node = this._front;
            let elements = node._elements;
            while (i !== elements.length || node._next !== void 0) {
              if (i === elements.length) {
                node = node._next;
                elements = node._elements;
                i = 0;
                if (elements.length === 0) {
                  break;
                }
              }
              callback(elements[i]);
              ++i;
            }
          }
          peek() {
            const front = this._front;
            const cursor = this._cursor;
            return front._elements[cursor];
          }
        }
        function ReadableStreamReaderGenericInitialize(reader, stream) {
          reader._ownerReadableStream = stream;
          stream._reader = reader;
          if (stream._state === "readable") {
            defaultReaderClosedPromiseInitialize(reader);
          } else if (stream._state === "closed") {
            defaultReaderClosedPromiseInitializeAsResolved(reader);
          } else {
            defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
          }
        }
        function ReadableStreamReaderGenericCancel(reader, reason) {
          const stream = reader._ownerReadableStream;
          return ReadableStreamCancel(stream, reason);
        }
        function ReadableStreamReaderGenericRelease(reader) {
          if (reader._ownerReadableStream._state === "readable") {
            defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          } else {
            defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
          }
          reader._ownerReadableStream._reader = void 0;
          reader._ownerReadableStream = void 0;
        }
        function readerLockException(name2) {
          return new TypeError("Cannot " + name2 + " a stream using a released reader");
        }
        function defaultReaderClosedPromiseInitialize(reader) {
          reader._closedPromise = newPromise((resolve2, reject) => {
            reader._closedPromise_resolve = resolve2;
            reader._closedPromise_reject = reject;
          });
        }
        function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseReject(reader, reason);
        }
        function defaultReaderClosedPromiseInitializeAsResolved(reader) {
          defaultReaderClosedPromiseInitialize(reader);
          defaultReaderClosedPromiseResolve(reader);
        }
        function defaultReaderClosedPromiseReject(reader, reason) {
          if (reader._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(reader._closedPromise);
          reader._closedPromise_reject(reason);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        function defaultReaderClosedPromiseResetToRejected(reader, reason) {
          defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
        }
        function defaultReaderClosedPromiseResolve(reader) {
          if (reader._closedPromise_resolve === void 0) {
            return;
          }
          reader._closedPromise_resolve(void 0);
          reader._closedPromise_resolve = void 0;
          reader._closedPromise_reject = void 0;
        }
        const AbortSteps = SymbolPolyfill("[[AbortSteps]]");
        const ErrorSteps = SymbolPolyfill("[[ErrorSteps]]");
        const CancelSteps = SymbolPolyfill("[[CancelSteps]]");
        const PullSteps = SymbolPolyfill("[[PullSteps]]");
        const NumberIsFinite = Number.isFinite || function(x2) {
          return typeof x2 === "number" && isFinite(x2);
        };
        const MathTrunc = Math.trunc || function(v2) {
          return v2 < 0 ? Math.ceil(v2) : Math.floor(v2);
        };
        function isDictionary(x2) {
          return typeof x2 === "object" || typeof x2 === "function";
        }
        function assertDictionary(obj, context) {
          if (obj !== void 0 && !isDictionary(obj)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertFunction(x2, context) {
          if (typeof x2 !== "function") {
            throw new TypeError(`${context} is not a function.`);
          }
        }
        function isObject2(x2) {
          return typeof x2 === "object" && x2 !== null || typeof x2 === "function";
        }
        function assertObject(x2, context) {
          if (!isObject2(x2)) {
            throw new TypeError(`${context} is not an object.`);
          }
        }
        function assertRequiredArgument(x2, position, context) {
          if (x2 === void 0) {
            throw new TypeError(`Parameter ${position} is required in '${context}'.`);
          }
        }
        function assertRequiredField(x2, field, context) {
          if (x2 === void 0) {
            throw new TypeError(`${field} is required in '${context}'.`);
          }
        }
        function convertUnrestrictedDouble(value) {
          return Number(value);
        }
        function censorNegativeZero(x2) {
          return x2 === 0 ? 0 : x2;
        }
        function integerPart(x2) {
          return censorNegativeZero(MathTrunc(x2));
        }
        function convertUnsignedLongLongWithEnforceRange(value, context) {
          const lowerBound = 0;
          const upperBound = Number.MAX_SAFE_INTEGER;
          let x2 = Number(value);
          x2 = censorNegativeZero(x2);
          if (!NumberIsFinite(x2)) {
            throw new TypeError(`${context} is not a finite number`);
          }
          x2 = integerPart(x2);
          if (x2 < lowerBound || x2 > upperBound) {
            throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
          }
          if (!NumberIsFinite(x2) || x2 === 0) {
            return 0;
          }
          return x2;
        }
        function assertReadableStream(x2, context) {
          if (!IsReadableStream(x2)) {
            throw new TypeError(`${context} is not a ReadableStream.`);
          }
        }
        function AcquireReadableStreamDefaultReader(stream) {
          return new ReadableStreamDefaultReader(stream);
        }
        function ReadableStreamAddReadRequest(stream, readRequest) {
          stream._reader._readRequests.push(readRequest);
        }
        function ReadableStreamFulfillReadRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readRequest = reader._readRequests.shift();
          if (done) {
            readRequest._closeSteps();
          } else {
            readRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadRequests(stream) {
          return stream._reader._readRequests.length;
        }
        function ReadableStreamHasDefaultReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamDefaultReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamDefaultReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamDefaultReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read() {
            if (!IsReadableStreamDefaultReader(this)) {
              return promiseRejectedWith(defaultReaderBrandCheckException("read"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: () => resolvePromise({ value: void 0, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamDefaultReaderRead(this, readRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamDefaultReader(this)) {
              throw defaultReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamDefaultReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultReader",
            configurable: true
          });
        }
        function IsReadableStreamDefaultReader(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_readRequests")) {
            return false;
          }
          return x2 instanceof ReadableStreamDefaultReader;
        }
        function ReadableStreamDefaultReaderRead(reader, readRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "closed") {
            readRequest._closeSteps();
          } else if (stream._state === "errored") {
            readRequest._errorSteps(stream._storedError);
          } else {
            stream._readableStreamController[PullSteps](readRequest);
          }
        }
        function defaultReaderBrandCheckException(name2) {
          return new TypeError(`ReadableStreamDefaultReader.prototype.${name2} can only be used on a ReadableStreamDefaultReader`);
        }
        const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
        }).prototype);
        class ReadableStreamAsyncIteratorImpl {
          constructor(reader, preventCancel) {
            this._ongoingPromise = void 0;
            this._isFinished = false;
            this._reader = reader;
            this._preventCancel = preventCancel;
          }
          next() {
            const nextSteps = () => this._nextSteps();
            this._ongoingPromise = this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) : nextSteps();
            return this._ongoingPromise;
          }
          return(value) {
            const returnSteps = () => this._returnSteps(value);
            return this._ongoingPromise ? transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) : returnSteps();
          }
          _nextSteps() {
            if (this._isFinished) {
              return Promise.resolve({ value: void 0, done: true });
            }
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("iterate"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readRequest = {
              _chunkSteps: (chunk) => {
                this._ongoingPromise = void 0;
                queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
              },
              _closeSteps: () => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                resolvePromise({ value: void 0, done: true });
              },
              _errorSteps: (reason) => {
                this._ongoingPromise = void 0;
                this._isFinished = true;
                ReadableStreamReaderGenericRelease(reader);
                rejectPromise(reason);
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promise;
          }
          _returnSteps(value) {
            if (this._isFinished) {
              return Promise.resolve({ value, done: true });
            }
            this._isFinished = true;
            const reader = this._reader;
            if (reader._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("finish iterating"));
            }
            if (!this._preventCancel) {
              const result = ReadableStreamReaderGenericCancel(reader, value);
              ReadableStreamReaderGenericRelease(reader);
              return transformPromiseWith(result, () => ({ value, done: true }));
            }
            ReadableStreamReaderGenericRelease(reader);
            return promiseResolvedWith({ value, done: true });
          }
        }
        const ReadableStreamAsyncIteratorPrototype = {
          next() {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("next"));
            }
            return this._asyncIteratorImpl.next();
          },
          return(value) {
            if (!IsReadableStreamAsyncIterator(this)) {
              return promiseRejectedWith(streamAsyncIteratorBrandCheckException("return"));
            }
            return this._asyncIteratorImpl.return(value);
          }
        };
        if (AsyncIteratorPrototype !== void 0) {
          Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
        }
        function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
          const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
          iterator._asyncIteratorImpl = impl;
          return iterator;
        }
        function IsReadableStreamAsyncIterator(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_asyncIteratorImpl")) {
            return false;
          }
          try {
            return x2._asyncIteratorImpl instanceof ReadableStreamAsyncIteratorImpl;
          } catch (_a3) {
            return false;
          }
        }
        function streamAsyncIteratorBrandCheckException(name2) {
          return new TypeError(`ReadableStreamAsyncIterator.${name2} can only be used on a ReadableSteamAsyncIterator`);
        }
        const NumberIsNaN = Number.isNaN || function(x2) {
          return x2 !== x2;
        };
        function CreateArrayFromList(elements) {
          return elements.slice();
        }
        function CopyDataBlockBytes(dest, destOffset, src2, srcOffset, n) {
          new Uint8Array(dest).set(new Uint8Array(src2, srcOffset, n), destOffset);
        }
        function TransferArrayBuffer(O2) {
          return O2;
        }
        function IsDetachedBuffer(O2) {
          return false;
        }
        function ArrayBufferSlice(buffer, begin, end) {
          if (buffer.slice) {
            return buffer.slice(begin, end);
          }
          const length = end - begin;
          const slice = new ArrayBuffer(length);
          CopyDataBlockBytes(slice, 0, buffer, begin, length);
          return slice;
        }
        function IsNonNegativeNumber(v2) {
          if (typeof v2 !== "number") {
            return false;
          }
          if (NumberIsNaN(v2)) {
            return false;
          }
          if (v2 < 0) {
            return false;
          }
          return true;
        }
        function CloneAsUint8Array(O2) {
          const buffer = ArrayBufferSlice(O2.buffer, O2.byteOffset, O2.byteOffset + O2.byteLength);
          return new Uint8Array(buffer);
        }
        function DequeueValue(container) {
          const pair = container._queue.shift();
          container._queueTotalSize -= pair.size;
          if (container._queueTotalSize < 0) {
            container._queueTotalSize = 0;
          }
          return pair.value;
        }
        function EnqueueValueWithSize(container, value, size) {
          if (!IsNonNegativeNumber(size) || size === Infinity) {
            throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
          }
          container._queue.push({ value, size });
          container._queueTotalSize += size;
        }
        function PeekQueueValue(container) {
          const pair = container._queue.peek();
          return pair.value;
        }
        function ResetQueue(container) {
          container._queue = new SimpleQueue();
          container._queueTotalSize = 0;
        }
        class ReadableStreamBYOBRequest {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get view() {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("view");
            }
            return this._view;
          }
          respond(bytesWritten) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respond");
            }
            assertRequiredArgument(bytesWritten, 1, "respond");
            bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, "First parameter");
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(this._view.buffer))
              ;
            ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
          }
          respondWithNewView(view) {
            if (!IsReadableStreamBYOBRequest(this)) {
              throw byobRequestBrandCheckException("respondWithNewView");
            }
            assertRequiredArgument(view, 1, "respondWithNewView");
            if (!ArrayBuffer.isView(view)) {
              throw new TypeError("You can only respond with array buffer views");
            }
            if (this._associatedReadableByteStreamController === void 0) {
              throw new TypeError("This BYOB request has been invalidated");
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
          }
        }
        Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
          respond: { enumerable: true },
          respondWithNewView: { enumerable: true },
          view: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBRequest",
            configurable: true
          });
        }
        class ReadableByteStreamController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get byobRequest() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("byobRequest");
            }
            return ReadableByteStreamControllerGetBYOBRequest(this);
          }
          get desiredSize() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("desiredSize");
            }
            return ReadableByteStreamControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("close");
            }
            if (this._closeRequested) {
              throw new TypeError("The stream has already been closed; do not close it again!");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
            }
            ReadableByteStreamControllerClose(this);
          }
          enqueue(chunk) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("enqueue");
            }
            assertRequiredArgument(chunk, 1, "enqueue");
            if (!ArrayBuffer.isView(chunk)) {
              throw new TypeError("chunk must be an array buffer view");
            }
            if (chunk.byteLength === 0) {
              throw new TypeError("chunk must have non-zero byteLength");
            }
            if (chunk.buffer.byteLength === 0) {
              throw new TypeError(`chunk's buffer must have non-zero byteLength`);
            }
            if (this._closeRequested) {
              throw new TypeError("stream is closed or draining");
            }
            const state = this._controlledReadableByteStream._state;
            if (state !== "readable") {
              throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
            }
            ReadableByteStreamControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableByteStreamController(this)) {
              throw byteStreamControllerBrandCheckException("error");
            }
            ReadableByteStreamControllerError(this, e);
          }
          [CancelSteps](reason) {
            ReadableByteStreamControllerClearPendingPullIntos(this);
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableByteStreamControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableByteStream;
            if (this._queueTotalSize > 0) {
              const entry = this._queue.shift();
              this._queueTotalSize -= entry.byteLength;
              ReadableByteStreamControllerHandleQueueDrain(this);
              const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
              readRequest._chunkSteps(view);
              return;
            }
            const autoAllocateChunkSize = this._autoAllocateChunkSize;
            if (autoAllocateChunkSize !== void 0) {
              let buffer;
              try {
                buffer = new ArrayBuffer(autoAllocateChunkSize);
              } catch (bufferE) {
                readRequest._errorSteps(bufferE);
                return;
              }
              const pullIntoDescriptor = {
                buffer,
                bufferByteLength: autoAllocateChunkSize,
                byteOffset: 0,
                byteLength: autoAllocateChunkSize,
                bytesFilled: 0,
                elementSize: 1,
                viewConstructor: Uint8Array,
                readerType: "default"
              };
              this._pendingPullIntos.push(pullIntoDescriptor);
            }
            ReadableStreamAddReadRequest(stream, readRequest);
            ReadableByteStreamControllerCallPullIfNeeded(this);
          }
        }
        Object.defineProperties(ReadableByteStreamController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          byobRequest: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableByteStreamController",
            configurable: true
          });
        }
        function IsReadableByteStreamController(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_controlledReadableByteStream")) {
            return false;
          }
          return x2 instanceof ReadableByteStreamController;
        }
        function IsReadableStreamBYOBRequest(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_associatedReadableByteStreamController")) {
            return false;
          }
          return x2 instanceof ReadableStreamBYOBRequest;
        }
        function ReadableByteStreamControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableByteStreamControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableByteStreamControllerError(controller, e);
          });
        }
        function ReadableByteStreamControllerClearPendingPullIntos(controller) {
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          controller._pendingPullIntos = new SimpleQueue();
        }
        function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
          let done = false;
          if (stream._state === "closed") {
            done = true;
          }
          const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
          if (pullIntoDescriptor.readerType === "default") {
            ReadableStreamFulfillReadRequest(stream, filledView, done);
          } else {
            ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
          }
        }
        function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
          const bytesFilled = pullIntoDescriptor.bytesFilled;
          const elementSize = pullIntoDescriptor.elementSize;
          return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
        }
        function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
          controller._queue.push({ buffer, byteOffset, byteLength });
          controller._queueTotalSize += byteLength;
        }
        function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
          const elementSize = pullIntoDescriptor.elementSize;
          const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
          const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
          const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
          const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
          let totalBytesToCopyRemaining = maxBytesToCopy;
          let ready = false;
          if (maxAlignedBytes > currentAlignedBytes) {
            totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
            ready = true;
          }
          const queue = controller._queue;
          while (totalBytesToCopyRemaining > 0) {
            const headOfQueue = queue.peek();
            const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
            const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
            if (headOfQueue.byteLength === bytesToCopy) {
              queue.shift();
            } else {
              headOfQueue.byteOffset += bytesToCopy;
              headOfQueue.byteLength -= bytesToCopy;
            }
            controller._queueTotalSize -= bytesToCopy;
            ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
            totalBytesToCopyRemaining -= bytesToCopy;
          }
          return ready;
        }
        function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
          pullIntoDescriptor.bytesFilled += size;
        }
        function ReadableByteStreamControllerHandleQueueDrain(controller) {
          if (controller._queueTotalSize === 0 && controller._closeRequested) {
            ReadableByteStreamControllerClearAlgorithms(controller);
            ReadableStreamClose(controller._controlledReadableByteStream);
          } else {
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }
        }
        function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
          if (controller._byobRequest === null) {
            return;
          }
          controller._byobRequest._associatedReadableByteStreamController = void 0;
          controller._byobRequest._view = null;
          controller._byobRequest = null;
        }
        function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
          while (controller._pendingPullIntos.length > 0) {
            if (controller._queueTotalSize === 0) {
              return;
            }
            const pullIntoDescriptor = controller._pendingPullIntos.peek();
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
          const stream = controller._controlledReadableByteStream;
          let elementSize = 1;
          if (view.constructor !== DataView) {
            elementSize = view.constructor.BYTES_PER_ELEMENT;
          }
          const ctor = view.constructor;
          const buffer = TransferArrayBuffer(view.buffer);
          const pullIntoDescriptor = {
            buffer,
            bufferByteLength: buffer.byteLength,
            byteOffset: view.byteOffset,
            byteLength: view.byteLength,
            bytesFilled: 0,
            elementSize,
            viewConstructor: ctor,
            readerType: "byob"
          };
          if (controller._pendingPullIntos.length > 0) {
            controller._pendingPullIntos.push(pullIntoDescriptor);
            ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
            return;
          }
          if (stream._state === "closed") {
            const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
            readIntoRequest._closeSteps(emptyView);
            return;
          }
          if (controller._queueTotalSize > 0) {
            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
              const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
              ReadableByteStreamControllerHandleQueueDrain(controller);
              readIntoRequest._chunkSteps(filledView);
              return;
            }
            if (controller._closeRequested) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              readIntoRequest._errorSteps(e);
              return;
            }
          }
          controller._pendingPullIntos.push(pullIntoDescriptor);
          ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
          const stream = controller._controlledReadableByteStream;
          if (ReadableStreamHasBYOBReader(stream)) {
            while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
              const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
              ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
            }
          }
        }
        function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
          ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
          if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
            return;
          }
          ReadableByteStreamControllerShiftPendingPullInto(controller);
          const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
          if (remainderSize > 0) {
            const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
            const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
          }
          pullIntoDescriptor.bytesFilled -= remainderSize;
          ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
          ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
        }
        function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            ReadableByteStreamControllerRespondInClosedState(controller);
          } else {
            ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerShiftPendingPullInto(controller) {
          const descriptor = controller._pendingPullIntos.shift();
          return descriptor;
        }
        function ReadableByteStreamControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return false;
          }
          if (controller._closeRequested) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableByteStreamControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
        }
        function ReadableByteStreamControllerClose(controller) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          if (controller._queueTotalSize > 0) {
            controller._closeRequested = true;
            return;
          }
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (firstPendingPullInto.bytesFilled > 0) {
              const e = new TypeError("Insufficient bytes to fill elements in the given buffer");
              ReadableByteStreamControllerError(controller, e);
              throw e;
            }
          }
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamClose(stream);
        }
        function ReadableByteStreamControllerEnqueue(controller, chunk) {
          const stream = controller._controlledReadableByteStream;
          if (controller._closeRequested || stream._state !== "readable") {
            return;
          }
          const buffer = chunk.buffer;
          const byteOffset = chunk.byteOffset;
          const byteLength = chunk.byteLength;
          const transferredBuffer = TransferArrayBuffer(buffer);
          if (controller._pendingPullIntos.length > 0) {
            const firstPendingPullInto = controller._pendingPullIntos.peek();
            if (IsDetachedBuffer(firstPendingPullInto.buffer))
              ;
            firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
          }
          ReadableByteStreamControllerInvalidateBYOBRequest(controller);
          if (ReadableStreamHasDefaultReader(stream)) {
            if (ReadableStreamGetNumReadRequests(stream) === 0) {
              ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            } else {
              const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
              ReadableStreamFulfillReadRequest(stream, transferredView, false);
            }
          } else if (ReadableStreamHasBYOBReader(stream)) {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
            ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
          } else {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
          }
          ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
        function ReadableByteStreamControllerError(controller, e) {
          const stream = controller._controlledReadableByteStream;
          if (stream._state !== "readable") {
            return;
          }
          ReadableByteStreamControllerClearPendingPullIntos(controller);
          ResetQueue(controller);
          ReadableByteStreamControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableByteStreamControllerGetBYOBRequest(controller) {
          if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
            const firstDescriptor = controller._pendingPullIntos.peek();
            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
            SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
            controller._byobRequest = byobRequest;
          }
          return controller._byobRequest;
        }
        function ReadableByteStreamControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableByteStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableByteStreamControllerRespond(controller, bytesWritten) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (bytesWritten !== 0) {
              throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
            }
          } else {
            if (bytesWritten === 0) {
              throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
            }
            if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
              throw new RangeError("bytesWritten out of range");
            }
          }
          firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
          ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
        }
        function ReadableByteStreamControllerRespondWithNewView(controller, view) {
          const firstDescriptor = controller._pendingPullIntos.peek();
          const state = controller._controlledReadableByteStream._state;
          if (state === "closed") {
            if (view.byteLength !== 0) {
              throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
            }
          } else {
            if (view.byteLength === 0) {
              throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
            }
          }
          if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
            throw new RangeError("The region specified by view does not match byobRequest");
          }
          if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
            throw new RangeError("The buffer of view has different capacity than byobRequest");
          }
          if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
            throw new RangeError("The region specified by view is larger than byobRequest");
          }
          firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
          ReadableByteStreamControllerRespondInternal(controller, view.byteLength);
        }
        function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
          controller._controlledReadableByteStream = stream;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._byobRequest = null;
          controller._queue = controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._closeRequested = false;
          controller._started = false;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          controller._autoAllocateChunkSize = autoAllocateChunkSize;
          controller._pendingPullIntos = new SimpleQueue();
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableByteStreamControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableByteStreamControllerError(controller, r);
          });
        }
        function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
          const controller = Object.create(ReadableByteStreamController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingByteSource.start !== void 0) {
            startAlgorithm = () => underlyingByteSource.start(controller);
          }
          if (underlyingByteSource.pull !== void 0) {
            pullAlgorithm = () => underlyingByteSource.pull(controller);
          }
          if (underlyingByteSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingByteSource.cancel(reason);
          }
          const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
          if (autoAllocateChunkSize === 0) {
            throw new TypeError("autoAllocateChunkSize must be greater than 0");
          }
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
        }
        function SetUpReadableStreamBYOBRequest(request, controller, view) {
          request._associatedReadableByteStreamController = controller;
          request._view = view;
        }
        function byobRequestBrandCheckException(name2) {
          return new TypeError(`ReadableStreamBYOBRequest.prototype.${name2} can only be used on a ReadableStreamBYOBRequest`);
        }
        function byteStreamControllerBrandCheckException(name2) {
          return new TypeError(`ReadableByteStreamController.prototype.${name2} can only be used on a ReadableByteStreamController`);
        }
        function AcquireReadableStreamBYOBReader(stream) {
          return new ReadableStreamBYOBReader(stream);
        }
        function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
          stream._reader._readIntoRequests.push(readIntoRequest);
        }
        function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
          const reader = stream._reader;
          const readIntoRequest = reader._readIntoRequests.shift();
          if (done) {
            readIntoRequest._closeSteps(chunk);
          } else {
            readIntoRequest._chunkSteps(chunk);
          }
        }
        function ReadableStreamGetNumReadIntoRequests(stream) {
          return stream._reader._readIntoRequests.length;
        }
        function ReadableStreamHasBYOBReader(stream) {
          const reader = stream._reader;
          if (reader === void 0) {
            return false;
          }
          if (!IsReadableStreamBYOBReader(reader)) {
            return false;
          }
          return true;
        }
        class ReadableStreamBYOBReader {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "ReadableStreamBYOBReader");
            assertReadableStream(stream, "First parameter");
            if (IsReadableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive reading by another reader");
            }
            if (!IsReadableByteStreamController(stream._readableStreamController)) {
              throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
            }
            ReadableStreamReaderGenericInitialize(this, stream);
            this._readIntoRequests = new SimpleQueue();
          }
          get closed() {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          cancel(reason = void 0) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("cancel"));
            }
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("cancel"));
            }
            return ReadableStreamReaderGenericCancel(this, reason);
          }
          read(view) {
            if (!IsReadableStreamBYOBReader(this)) {
              return promiseRejectedWith(byobReaderBrandCheckException("read"));
            }
            if (!ArrayBuffer.isView(view)) {
              return promiseRejectedWith(new TypeError("view must be an array buffer view"));
            }
            if (view.byteLength === 0) {
              return promiseRejectedWith(new TypeError("view must have non-zero byteLength"));
            }
            if (view.buffer.byteLength === 0) {
              return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
            }
            if (IsDetachedBuffer(view.buffer))
              ;
            if (this._ownerReadableStream === void 0) {
              return promiseRejectedWith(readerLockException("read from"));
            }
            let resolvePromise;
            let rejectPromise;
            const promise = newPromise((resolve2, reject) => {
              resolvePromise = resolve2;
              rejectPromise = reject;
            });
            const readIntoRequest = {
              _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
              _closeSteps: (chunk) => resolvePromise({ value: chunk, done: true }),
              _errorSteps: (e) => rejectPromise(e)
            };
            ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
            return promise;
          }
          releaseLock() {
            if (!IsReadableStreamBYOBReader(this)) {
              throw byobReaderBrandCheckException("releaseLock");
            }
            if (this._ownerReadableStream === void 0) {
              return;
            }
            if (this._readIntoRequests.length > 0) {
              throw new TypeError("Tried to release a reader lock when that reader has pending read() calls un-settled");
            }
            ReadableStreamReaderGenericRelease(this);
          }
        }
        Object.defineProperties(ReadableStreamBYOBReader.prototype, {
          cancel: { enumerable: true },
          read: { enumerable: true },
          releaseLock: { enumerable: true },
          closed: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamBYOBReader",
            configurable: true
          });
        }
        function IsReadableStreamBYOBReader(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_readIntoRequests")) {
            return false;
          }
          return x2 instanceof ReadableStreamBYOBReader;
        }
        function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
          const stream = reader._ownerReadableStream;
          stream._disturbed = true;
          if (stream._state === "errored") {
            readIntoRequest._errorSteps(stream._storedError);
          } else {
            ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
          }
        }
        function byobReaderBrandCheckException(name2) {
          return new TypeError(`ReadableStreamBYOBReader.prototype.${name2} can only be used on a ReadableStreamBYOBReader`);
        }
        function ExtractHighWaterMark(strategy, defaultHWM) {
          const { highWaterMark } = strategy;
          if (highWaterMark === void 0) {
            return defaultHWM;
          }
          if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
            throw new RangeError("Invalid highWaterMark");
          }
          return highWaterMark;
        }
        function ExtractSizeAlgorithm(strategy) {
          const { size } = strategy;
          if (!size) {
            return () => 1;
          }
          return size;
        }
        function convertQueuingStrategy(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          const size = init2 === null || init2 === void 0 ? void 0 : init2.size;
          return {
            highWaterMark: highWaterMark === void 0 ? void 0 : convertUnrestrictedDouble(highWaterMark),
            size: size === void 0 ? void 0 : convertQueuingStrategySize(size, `${context} has member 'size' that`)
          };
        }
        function convertQueuingStrategySize(fn, context) {
          assertFunction(fn, context);
          return (chunk) => convertUnrestrictedDouble(fn(chunk));
        }
        function convertUnderlyingSink(original, context) {
          assertDictionary(original, context);
          const abort = original === null || original === void 0 ? void 0 : original.abort;
          const close = original === null || original === void 0 ? void 0 : original.close;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          const write = original === null || original === void 0 ? void 0 : original.write;
          return {
            abort: abort === void 0 ? void 0 : convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
            close: close === void 0 ? void 0 : convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
            write: write === void 0 ? void 0 : convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
            type
          };
        }
        function convertUnderlyingSinkAbortCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSinkCloseCallback(fn, original, context) {
          assertFunction(fn, context);
          return () => promiseCall(fn, original, []);
        }
        function convertUnderlyingSinkStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertUnderlyingSinkWriteCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        function assertWritableStream(x2, context) {
          if (!IsWritableStream(x2)) {
            throw new TypeError(`${context} is not a WritableStream.`);
          }
        }
        function isAbortSignal2(value) {
          if (typeof value !== "object" || value === null) {
            return false;
          }
          try {
            return typeof value.aborted === "boolean";
          } catch (_a3) {
            return false;
          }
        }
        const supportsAbortController = typeof AbortController === "function";
        function createAbortController() {
          if (supportsAbortController) {
            return new AbortController();
          }
          return void 0;
        }
        class WritableStream {
          constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
            if (rawUnderlyingSink === void 0) {
              rawUnderlyingSink = null;
            } else {
              assertObject(rawUnderlyingSink, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, "First parameter");
            InitializeWritableStream(this);
            const type = underlyingSink.type;
            if (type !== void 0) {
              throw new RangeError("Invalid type is specified");
            }
            const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
            const highWaterMark = ExtractHighWaterMark(strategy, 1);
            SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
          }
          get locked() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("locked");
            }
            return IsWritableStreamLocked(this);
          }
          abort(reason = void 0) {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("abort"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot abort a stream that already has a writer"));
            }
            return WritableStreamAbort(this, reason);
          }
          close() {
            if (!IsWritableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$2("close"));
            }
            if (IsWritableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot close a stream that already has a writer"));
            }
            if (WritableStreamCloseQueuedOrInFlight(this)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamClose(this);
          }
          getWriter() {
            if (!IsWritableStream(this)) {
              throw streamBrandCheckException$2("getWriter");
            }
            return AcquireWritableStreamDefaultWriter(this);
          }
        }
        Object.defineProperties(WritableStream.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          getWriter: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStream",
            configurable: true
          });
        }
        function AcquireWritableStreamDefaultWriter(stream) {
          return new WritableStreamDefaultWriter(stream);
        }
        function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(WritableStream.prototype);
          InitializeWritableStream(stream);
          const controller = Object.create(WritableStreamDefaultController.prototype);
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function InitializeWritableStream(stream) {
          stream._state = "writable";
          stream._storedError = void 0;
          stream._writer = void 0;
          stream._writableStreamController = void 0;
          stream._writeRequests = new SimpleQueue();
          stream._inFlightWriteRequest = void 0;
          stream._closeRequest = void 0;
          stream._inFlightCloseRequest = void 0;
          stream._pendingAbortRequest = void 0;
          stream._backpressure = false;
        }
        function IsWritableStream(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_writableStreamController")) {
            return false;
          }
          return x2 instanceof WritableStream;
        }
        function IsWritableStreamLocked(stream) {
          if (stream._writer === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamAbort(stream, reason) {
          var _a3;
          if (stream._state === "closed" || stream._state === "errored") {
            return promiseResolvedWith(void 0);
          }
          stream._writableStreamController._abortReason = reason;
          (_a3 = stream._writableStreamController._abortController) === null || _a3 === void 0 ? void 0 : _a3.abort();
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseResolvedWith(void 0);
          }
          if (stream._pendingAbortRequest !== void 0) {
            return stream._pendingAbortRequest._promise;
          }
          let wasAlreadyErroring = false;
          if (state === "erroring") {
            wasAlreadyErroring = true;
            reason = void 0;
          }
          const promise = newPromise((resolve2, reject) => {
            stream._pendingAbortRequest = {
              _promise: void 0,
              _resolve: resolve2,
              _reject: reject,
              _reason: reason,
              _wasAlreadyErroring: wasAlreadyErroring
            };
          });
          stream._pendingAbortRequest._promise = promise;
          if (!wasAlreadyErroring) {
            WritableStreamStartErroring(stream, reason);
          }
          return promise;
        }
        function WritableStreamClose(stream) {
          const state = stream._state;
          if (state === "closed" || state === "errored") {
            return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
          }
          const promise = newPromise((resolve2, reject) => {
            const closeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._closeRequest = closeRequest;
          });
          const writer = stream._writer;
          if (writer !== void 0 && stream._backpressure && state === "writable") {
            defaultWriterReadyPromiseResolve(writer);
          }
          WritableStreamDefaultControllerClose(stream._writableStreamController);
          return promise;
        }
        function WritableStreamAddWriteRequest(stream) {
          const promise = newPromise((resolve2, reject) => {
            const writeRequest = {
              _resolve: resolve2,
              _reject: reject
            };
            stream._writeRequests.push(writeRequest);
          });
          return promise;
        }
        function WritableStreamDealWithRejection(stream, error2) {
          const state = stream._state;
          if (state === "writable") {
            WritableStreamStartErroring(stream, error2);
            return;
          }
          WritableStreamFinishErroring(stream);
        }
        function WritableStreamStartErroring(stream, reason) {
          const controller = stream._writableStreamController;
          stream._state = "erroring";
          stream._storedError = reason;
          const writer = stream._writer;
          if (writer !== void 0) {
            WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
          }
          if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
            WritableStreamFinishErroring(stream);
          }
        }
        function WritableStreamFinishErroring(stream) {
          stream._state = "errored";
          stream._writableStreamController[ErrorSteps]();
          const storedError = stream._storedError;
          stream._writeRequests.forEach((writeRequest) => {
            writeRequest._reject(storedError);
          });
          stream._writeRequests = new SimpleQueue();
          if (stream._pendingAbortRequest === void 0) {
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const abortRequest = stream._pendingAbortRequest;
          stream._pendingAbortRequest = void 0;
          if (abortRequest._wasAlreadyErroring) {
            abortRequest._reject(storedError);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
            return;
          }
          const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
          uponPromise(promise, () => {
            abortRequest._resolve();
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          }, (reason) => {
            abortRequest._reject(reason);
            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
          });
        }
        function WritableStreamFinishInFlightWrite(stream) {
          stream._inFlightWriteRequest._resolve(void 0);
          stream._inFlightWriteRequest = void 0;
        }
        function WritableStreamFinishInFlightWriteWithError(stream, error2) {
          stream._inFlightWriteRequest._reject(error2);
          stream._inFlightWriteRequest = void 0;
          WritableStreamDealWithRejection(stream, error2);
        }
        function WritableStreamFinishInFlightClose(stream) {
          stream._inFlightCloseRequest._resolve(void 0);
          stream._inFlightCloseRequest = void 0;
          const state = stream._state;
          if (state === "erroring") {
            stream._storedError = void 0;
            if (stream._pendingAbortRequest !== void 0) {
              stream._pendingAbortRequest._resolve();
              stream._pendingAbortRequest = void 0;
            }
          }
          stream._state = "closed";
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseResolve(writer);
          }
        }
        function WritableStreamFinishInFlightCloseWithError(stream, error2) {
          stream._inFlightCloseRequest._reject(error2);
          stream._inFlightCloseRequest = void 0;
          if (stream._pendingAbortRequest !== void 0) {
            stream._pendingAbortRequest._reject(error2);
            stream._pendingAbortRequest = void 0;
          }
          WritableStreamDealWithRejection(stream, error2);
        }
        function WritableStreamCloseQueuedOrInFlight(stream) {
          if (stream._closeRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamHasOperationMarkedInFlight(stream) {
          if (stream._inFlightWriteRequest === void 0 && stream._inFlightCloseRequest === void 0) {
            return false;
          }
          return true;
        }
        function WritableStreamMarkCloseRequestInFlight(stream) {
          stream._inFlightCloseRequest = stream._closeRequest;
          stream._closeRequest = void 0;
        }
        function WritableStreamMarkFirstWriteRequestInFlight(stream) {
          stream._inFlightWriteRequest = stream._writeRequests.shift();
        }
        function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
          if (stream._closeRequest !== void 0) {
            stream._closeRequest._reject(stream._storedError);
            stream._closeRequest = void 0;
          }
          const writer = stream._writer;
          if (writer !== void 0) {
            defaultWriterClosedPromiseReject(writer, stream._storedError);
          }
        }
        function WritableStreamUpdateBackpressure(stream, backpressure) {
          const writer = stream._writer;
          if (writer !== void 0 && backpressure !== stream._backpressure) {
            if (backpressure) {
              defaultWriterReadyPromiseReset(writer);
            } else {
              defaultWriterReadyPromiseResolve(writer);
            }
          }
          stream._backpressure = backpressure;
        }
        class WritableStreamDefaultWriter {
          constructor(stream) {
            assertRequiredArgument(stream, 1, "WritableStreamDefaultWriter");
            assertWritableStream(stream, "First parameter");
            if (IsWritableStreamLocked(stream)) {
              throw new TypeError("This stream has already been locked for exclusive writing by another writer");
            }
            this._ownerWritableStream = stream;
            stream._writer = this;
            const state = stream._state;
            if (state === "writable") {
              if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
                defaultWriterReadyPromiseInitialize(this);
              } else {
                defaultWriterReadyPromiseInitializeAsResolved(this);
              }
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "erroring") {
              defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
              defaultWriterClosedPromiseInitialize(this);
            } else if (state === "closed") {
              defaultWriterReadyPromiseInitializeAsResolved(this);
              defaultWriterClosedPromiseInitializeAsResolved(this);
            } else {
              const storedError = stream._storedError;
              defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
              defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
            }
          }
          get closed() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("closed"));
            }
            return this._closedPromise;
          }
          get desiredSize() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("desiredSize");
            }
            if (this._ownerWritableStream === void 0) {
              throw defaultWriterLockException("desiredSize");
            }
            return WritableStreamDefaultWriterGetDesiredSize(this);
          }
          get ready() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("ready"));
            }
            return this._readyPromise;
          }
          abort(reason = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("abort"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("abort"));
            }
            return WritableStreamDefaultWriterAbort(this, reason);
          }
          close() {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("close"));
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("close"));
            }
            if (WritableStreamCloseQueuedOrInFlight(stream)) {
              return promiseRejectedWith(new TypeError("Cannot close an already-closing stream"));
            }
            return WritableStreamDefaultWriterClose(this);
          }
          releaseLock() {
            if (!IsWritableStreamDefaultWriter(this)) {
              throw defaultWriterBrandCheckException("releaseLock");
            }
            const stream = this._ownerWritableStream;
            if (stream === void 0) {
              return;
            }
            WritableStreamDefaultWriterRelease(this);
          }
          write(chunk = void 0) {
            if (!IsWritableStreamDefaultWriter(this)) {
              return promiseRejectedWith(defaultWriterBrandCheckException("write"));
            }
            if (this._ownerWritableStream === void 0) {
              return promiseRejectedWith(defaultWriterLockException("write to"));
            }
            return WritableStreamDefaultWriterWrite(this, chunk);
          }
        }
        Object.defineProperties(WritableStreamDefaultWriter.prototype, {
          abort: { enumerable: true },
          close: { enumerable: true },
          releaseLock: { enumerable: true },
          write: { enumerable: true },
          closed: { enumerable: true },
          desiredSize: { enumerable: true },
          ready: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultWriter",
            configurable: true
          });
        }
        function IsWritableStreamDefaultWriter(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_ownerWritableStream")) {
            return false;
          }
          return x2 instanceof WritableStreamDefaultWriter;
        }
        function WritableStreamDefaultWriterAbort(writer, reason) {
          const stream = writer._ownerWritableStream;
          return WritableStreamAbort(stream, reason);
        }
        function WritableStreamDefaultWriterClose(writer) {
          const stream = writer._ownerWritableStream;
          return WritableStreamClose(stream);
        }
        function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          return WritableStreamDefaultWriterClose(writer);
        }
        function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error2) {
          if (writer._closedPromiseState === "pending") {
            defaultWriterClosedPromiseReject(writer, error2);
          } else {
            defaultWriterClosedPromiseResetToRejected(writer, error2);
          }
        }
        function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error2) {
          if (writer._readyPromiseState === "pending") {
            defaultWriterReadyPromiseReject(writer, error2);
          } else {
            defaultWriterReadyPromiseResetToRejected(writer, error2);
          }
        }
        function WritableStreamDefaultWriterGetDesiredSize(writer) {
          const stream = writer._ownerWritableStream;
          const state = stream._state;
          if (state === "errored" || state === "erroring") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
        }
        function WritableStreamDefaultWriterRelease(writer) {
          const stream = writer._ownerWritableStream;
          const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
          WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
          WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
          stream._writer = void 0;
          writer._ownerWritableStream = void 0;
        }
        function WritableStreamDefaultWriterWrite(writer, chunk) {
          const stream = writer._ownerWritableStream;
          const controller = stream._writableStreamController;
          const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
          if (stream !== writer._ownerWritableStream) {
            return promiseRejectedWith(defaultWriterLockException("write to"));
          }
          const state = stream._state;
          if (state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          if (WritableStreamCloseQueuedOrInFlight(stream) || state === "closed") {
            return promiseRejectedWith(new TypeError("The stream is closing or closed and cannot be written to"));
          }
          if (state === "erroring") {
            return promiseRejectedWith(stream._storedError);
          }
          const promise = WritableStreamAddWriteRequest(stream);
          WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
          return promise;
        }
        const closeSentinel = {};
        class WritableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get abortReason() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("abortReason");
            }
            return this._abortReason;
          }
          get signal() {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("signal");
            }
            if (this._abortController === void 0) {
              throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
            }
            return this._abortController.signal;
          }
          error(e = void 0) {
            if (!IsWritableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$2("error");
            }
            const state = this._controlledWritableStream._state;
            if (state !== "writable") {
              return;
            }
            WritableStreamDefaultControllerError(this, e);
          }
          [AbortSteps](reason) {
            const result = this._abortAlgorithm(reason);
            WritableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [ErrorSteps]() {
            ResetQueue(this);
          }
        }
        Object.defineProperties(WritableStreamDefaultController.prototype, {
          error: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "WritableStreamDefaultController",
            configurable: true
          });
        }
        function IsWritableStreamDefaultController(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_controlledWritableStream")) {
            return false;
          }
          return x2 instanceof WritableStreamDefaultController;
        }
        function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledWritableStream = stream;
          stream._writableStreamController = controller;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._abortReason = void 0;
          controller._abortController = createAbortController();
          controller._started = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._writeAlgorithm = writeAlgorithm;
          controller._closeAlgorithm = closeAlgorithm;
          controller._abortAlgorithm = abortAlgorithm;
          const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
          WritableStreamUpdateBackpressure(stream, backpressure);
          const startResult = startAlgorithm();
          const startPromise = promiseResolvedWith(startResult);
          uponPromise(startPromise, () => {
            controller._started = true;
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (r) => {
            controller._started = true;
            WritableStreamDealWithRejection(stream, r);
          });
        }
        function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(WritableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let writeAlgorithm = () => promiseResolvedWith(void 0);
          let closeAlgorithm = () => promiseResolvedWith(void 0);
          let abortAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSink.start !== void 0) {
            startAlgorithm = () => underlyingSink.start(controller);
          }
          if (underlyingSink.write !== void 0) {
            writeAlgorithm = (chunk) => underlyingSink.write(chunk, controller);
          }
          if (underlyingSink.close !== void 0) {
            closeAlgorithm = () => underlyingSink.close();
          }
          if (underlyingSink.abort !== void 0) {
            abortAlgorithm = (reason) => underlyingSink.abort(reason);
          }
          SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function WritableStreamDefaultControllerClearAlgorithms(controller) {
          controller._writeAlgorithm = void 0;
          controller._closeAlgorithm = void 0;
          controller._abortAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function WritableStreamDefaultControllerClose(controller) {
          EnqueueValueWithSize(controller, closeSentinel, 0);
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
          try {
            return controller._strategySizeAlgorithm(chunk);
          } catch (chunkSizeE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
            return 1;
          }
        }
        function WritableStreamDefaultControllerGetDesiredSize(controller) {
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
          try {
            EnqueueValueWithSize(controller, chunk, chunkSize);
          } catch (enqueueE) {
            WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
            return;
          }
          const stream = controller._controlledWritableStream;
          if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === "writable") {
            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
            WritableStreamUpdateBackpressure(stream, backpressure);
          }
          WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
        }
        function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
          const stream = controller._controlledWritableStream;
          if (!controller._started) {
            return;
          }
          if (stream._inFlightWriteRequest !== void 0) {
            return;
          }
          const state = stream._state;
          if (state === "erroring") {
            WritableStreamFinishErroring(stream);
            return;
          }
          if (controller._queue.length === 0) {
            return;
          }
          const value = PeekQueueValue(controller);
          if (value === closeSentinel) {
            WritableStreamDefaultControllerProcessClose(controller);
          } else {
            WritableStreamDefaultControllerProcessWrite(controller, value);
          }
        }
        function WritableStreamDefaultControllerErrorIfNeeded(controller, error2) {
          if (controller._controlledWritableStream._state === "writable") {
            WritableStreamDefaultControllerError(controller, error2);
          }
        }
        function WritableStreamDefaultControllerProcessClose(controller) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkCloseRequestInFlight(stream);
          DequeueValue(controller);
          const sinkClosePromise = controller._closeAlgorithm();
          WritableStreamDefaultControllerClearAlgorithms(controller);
          uponPromise(sinkClosePromise, () => {
            WritableStreamFinishInFlightClose(stream);
          }, (reason) => {
            WritableStreamFinishInFlightCloseWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
          const stream = controller._controlledWritableStream;
          WritableStreamMarkFirstWriteRequestInFlight(stream);
          const sinkWritePromise = controller._writeAlgorithm(chunk);
          uponPromise(sinkWritePromise, () => {
            WritableStreamFinishInFlightWrite(stream);
            const state = stream._state;
            DequeueValue(controller);
            if (!WritableStreamCloseQueuedOrInFlight(stream) && state === "writable") {
              const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
              WritableStreamUpdateBackpressure(stream, backpressure);
            }
            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
          }, (reason) => {
            if (stream._state === "writable") {
              WritableStreamDefaultControllerClearAlgorithms(controller);
            }
            WritableStreamFinishInFlightWriteWithError(stream, reason);
          });
        }
        function WritableStreamDefaultControllerGetBackpressure(controller) {
          const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
          return desiredSize <= 0;
        }
        function WritableStreamDefaultControllerError(controller, error2) {
          const stream = controller._controlledWritableStream;
          WritableStreamDefaultControllerClearAlgorithms(controller);
          WritableStreamStartErroring(stream, error2);
        }
        function streamBrandCheckException$2(name2) {
          return new TypeError(`WritableStream.prototype.${name2} can only be used on a WritableStream`);
        }
        function defaultControllerBrandCheckException$2(name2) {
          return new TypeError(`WritableStreamDefaultController.prototype.${name2} can only be used on a WritableStreamDefaultController`);
        }
        function defaultWriterBrandCheckException(name2) {
          return new TypeError(`WritableStreamDefaultWriter.prototype.${name2} can only be used on a WritableStreamDefaultWriter`);
        }
        function defaultWriterLockException(name2) {
          return new TypeError("Cannot " + name2 + " a stream using a released writer");
        }
        function defaultWriterClosedPromiseInitialize(writer) {
          writer._closedPromise = newPromise((resolve2, reject) => {
            writer._closedPromise_resolve = resolve2;
            writer._closedPromise_reject = reject;
            writer._closedPromiseState = "pending";
          });
        }
        function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseReject(writer, reason);
        }
        function defaultWriterClosedPromiseInitializeAsResolved(writer) {
          defaultWriterClosedPromiseInitialize(writer);
          defaultWriterClosedPromiseResolve(writer);
        }
        function defaultWriterClosedPromiseReject(writer, reason) {
          if (writer._closedPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._closedPromise);
          writer._closedPromise_reject(reason);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "rejected";
        }
        function defaultWriterClosedPromiseResetToRejected(writer, reason) {
          defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterClosedPromiseResolve(writer) {
          if (writer._closedPromise_resolve === void 0) {
            return;
          }
          writer._closedPromise_resolve(void 0);
          writer._closedPromise_resolve = void 0;
          writer._closedPromise_reject = void 0;
          writer._closedPromiseState = "resolved";
        }
        function defaultWriterReadyPromiseInitialize(writer) {
          writer._readyPromise = newPromise((resolve2, reject) => {
            writer._readyPromise_resolve = resolve2;
            writer._readyPromise_reject = reject;
          });
          writer._readyPromiseState = "pending";
        }
        function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseReject(writer, reason);
        }
        function defaultWriterReadyPromiseInitializeAsResolved(writer) {
          defaultWriterReadyPromiseInitialize(writer);
          defaultWriterReadyPromiseResolve(writer);
        }
        function defaultWriterReadyPromiseReject(writer, reason) {
          if (writer._readyPromise_reject === void 0) {
            return;
          }
          setPromiseIsHandledToTrue(writer._readyPromise);
          writer._readyPromise_reject(reason);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "rejected";
        }
        function defaultWriterReadyPromiseReset(writer) {
          defaultWriterReadyPromiseInitialize(writer);
        }
        function defaultWriterReadyPromiseResetToRejected(writer, reason) {
          defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
        }
        function defaultWriterReadyPromiseResolve(writer) {
          if (writer._readyPromise_resolve === void 0) {
            return;
          }
          writer._readyPromise_resolve(void 0);
          writer._readyPromise_resolve = void 0;
          writer._readyPromise_reject = void 0;
          writer._readyPromiseState = "fulfilled";
        }
        const NativeDOMException = typeof DOMException !== "undefined" ? DOMException : void 0;
        function isDOMExceptionConstructor(ctor) {
          if (!(typeof ctor === "function" || typeof ctor === "object")) {
            return false;
          }
          try {
            new ctor();
            return true;
          } catch (_a3) {
            return false;
          }
        }
        function createDOMExceptionPolyfill() {
          const ctor = function DOMException2(message, name2) {
            this.message = message || "";
            this.name = name2 || "Error";
            if (Error.captureStackTrace) {
              Error.captureStackTrace(this, this.constructor);
            }
          };
          ctor.prototype = Object.create(Error.prototype);
          Object.defineProperty(ctor.prototype, "constructor", { value: ctor, writable: true, configurable: true });
          return ctor;
        }
        const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();
        function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
          const reader = AcquireReadableStreamDefaultReader(source);
          const writer = AcquireWritableStreamDefaultWriter(dest);
          source._disturbed = true;
          let shuttingDown = false;
          let currentWrite = promiseResolvedWith(void 0);
          return newPromise((resolve2, reject) => {
            let abortAlgorithm;
            if (signal !== void 0) {
              abortAlgorithm = () => {
                const error2 = new DOMException$1("Aborted", "AbortError");
                const actions = [];
                if (!preventAbort) {
                  actions.push(() => {
                    if (dest._state === "writable") {
                      return WritableStreamAbort(dest, error2);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                if (!preventCancel) {
                  actions.push(() => {
                    if (source._state === "readable") {
                      return ReadableStreamCancel(source, error2);
                    }
                    return promiseResolvedWith(void 0);
                  });
                }
                shutdownWithAction(() => Promise.all(actions.map((action) => action())), true, error2);
              };
              if (signal.aborted) {
                abortAlgorithm();
                return;
              }
              signal.addEventListener("abort", abortAlgorithm);
            }
            function pipeLoop() {
              return newPromise((resolveLoop, rejectLoop) => {
                function next(done) {
                  if (done) {
                    resolveLoop();
                  } else {
                    PerformPromiseThen(pipeStep(), next, rejectLoop);
                  }
                }
                next(false);
              });
            }
            function pipeStep() {
              if (shuttingDown) {
                return promiseResolvedWith(true);
              }
              return PerformPromiseThen(writer._readyPromise, () => {
                return newPromise((resolveRead, rejectRead) => {
                  ReadableStreamDefaultReaderRead(reader, {
                    _chunkSteps: (chunk) => {
                      currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), void 0, noop2);
                      resolveRead(false);
                    },
                    _closeSteps: () => resolveRead(true),
                    _errorSteps: rejectRead
                  });
                });
              });
            }
            isOrBecomesErrored(source, reader._closedPromise, (storedError) => {
              if (!preventAbort) {
                shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesErrored(dest, writer._closedPromise, (storedError) => {
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
              } else {
                shutdown(true, storedError);
              }
            });
            isOrBecomesClosed(source, reader._closedPromise, () => {
              if (!preventClose) {
                shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
              } else {
                shutdown();
              }
            });
            if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === "closed") {
              const destClosed = new TypeError("the destination writable stream closed before all data could be piped to it");
              if (!preventCancel) {
                shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
              } else {
                shutdown(true, destClosed);
              }
            }
            setPromiseIsHandledToTrue(pipeLoop());
            function waitForWritesToFinish() {
              const oldCurrentWrite = currentWrite;
              return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : void 0);
            }
            function isOrBecomesErrored(stream, promise, action) {
              if (stream._state === "errored") {
                action(stream._storedError);
              } else {
                uponRejection(promise, action);
              }
            }
            function isOrBecomesClosed(stream, promise, action) {
              if (stream._state === "closed") {
                action();
              } else {
                uponFulfillment(promise, action);
              }
            }
            function shutdownWithAction(action, originalIsError, originalError) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), doTheRest);
              } else {
                doTheRest();
              }
              function doTheRest() {
                uponPromise(action(), () => finalize(originalIsError, originalError), (newError) => finalize(true, newError));
              }
            }
            function shutdown(isError, error2) {
              if (shuttingDown) {
                return;
              }
              shuttingDown = true;
              if (dest._state === "writable" && !WritableStreamCloseQueuedOrInFlight(dest)) {
                uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error2));
              } else {
                finalize(isError, error2);
              }
            }
            function finalize(isError, error2) {
              WritableStreamDefaultWriterRelease(writer);
              ReadableStreamReaderGenericRelease(reader);
              if (signal !== void 0) {
                signal.removeEventListener("abort", abortAlgorithm);
              }
              if (isError) {
                reject(error2);
              } else {
                resolve2(void 0);
              }
            }
          });
        }
        class ReadableStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("desiredSize");
            }
            return ReadableStreamDefaultControllerGetDesiredSize(this);
          }
          close() {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("close");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits close");
            }
            ReadableStreamDefaultControllerClose(this);
          }
          enqueue(chunk = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("enqueue");
            }
            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
              throw new TypeError("The stream is not in a state that permits enqueue");
            }
            return ReadableStreamDefaultControllerEnqueue(this, chunk);
          }
          error(e = void 0) {
            if (!IsReadableStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException$1("error");
            }
            ReadableStreamDefaultControllerError(this, e);
          }
          [CancelSteps](reason) {
            ResetQueue(this);
            const result = this._cancelAlgorithm(reason);
            ReadableStreamDefaultControllerClearAlgorithms(this);
            return result;
          }
          [PullSteps](readRequest) {
            const stream = this._controlledReadableStream;
            if (this._queue.length > 0) {
              const chunk = DequeueValue(this);
              if (this._closeRequested && this._queue.length === 0) {
                ReadableStreamDefaultControllerClearAlgorithms(this);
                ReadableStreamClose(stream);
              } else {
                ReadableStreamDefaultControllerCallPullIfNeeded(this);
              }
              readRequest._chunkSteps(chunk);
            } else {
              ReadableStreamAddReadRequest(stream, readRequest);
              ReadableStreamDefaultControllerCallPullIfNeeded(this);
            }
          }
        }
        Object.defineProperties(ReadableStreamDefaultController.prototype, {
          close: { enumerable: true },
          enqueue: { enumerable: true },
          error: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStreamDefaultController",
            configurable: true
          });
        }
        function IsReadableStreamDefaultController(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_controlledReadableStream")) {
            return false;
          }
          return x2 instanceof ReadableStreamDefaultController;
        }
        function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
          const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
          if (!shouldPull) {
            return;
          }
          if (controller._pulling) {
            controller._pullAgain = true;
            return;
          }
          controller._pulling = true;
          const pullPromise = controller._pullAlgorithm();
          uponPromise(pullPromise, () => {
            controller._pulling = false;
            if (controller._pullAgain) {
              controller._pullAgain = false;
              ReadableStreamDefaultControllerCallPullIfNeeded(controller);
            }
          }, (e) => {
            ReadableStreamDefaultControllerError(controller, e);
          });
        }
        function ReadableStreamDefaultControllerShouldCallPull(controller) {
          const stream = controller._controlledReadableStream;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return false;
          }
          if (!controller._started) {
            return false;
          }
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            return true;
          }
          const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
          if (desiredSize > 0) {
            return true;
          }
          return false;
        }
        function ReadableStreamDefaultControllerClearAlgorithms(controller) {
          controller._pullAlgorithm = void 0;
          controller._cancelAlgorithm = void 0;
          controller._strategySizeAlgorithm = void 0;
        }
        function ReadableStreamDefaultControllerClose(controller) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          controller._closeRequested = true;
          if (controller._queue.length === 0) {
            ReadableStreamDefaultControllerClearAlgorithms(controller);
            ReadableStreamClose(stream);
          }
        }
        function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
            return;
          }
          const stream = controller._controlledReadableStream;
          if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
            ReadableStreamFulfillReadRequest(stream, chunk, false);
          } else {
            let chunkSize;
            try {
              chunkSize = controller._strategySizeAlgorithm(chunk);
            } catch (chunkSizeE) {
              ReadableStreamDefaultControllerError(controller, chunkSizeE);
              throw chunkSizeE;
            }
            try {
              EnqueueValueWithSize(controller, chunk, chunkSize);
            } catch (enqueueE) {
              ReadableStreamDefaultControllerError(controller, enqueueE);
              throw enqueueE;
            }
          }
          ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }
        function ReadableStreamDefaultControllerError(controller, e) {
          const stream = controller._controlledReadableStream;
          if (stream._state !== "readable") {
            return;
          }
          ResetQueue(controller);
          ReadableStreamDefaultControllerClearAlgorithms(controller);
          ReadableStreamError(stream, e);
        }
        function ReadableStreamDefaultControllerGetDesiredSize(controller) {
          const state = controller._controlledReadableStream._state;
          if (state === "errored") {
            return null;
          }
          if (state === "closed") {
            return 0;
          }
          return controller._strategyHWM - controller._queueTotalSize;
        }
        function ReadableStreamDefaultControllerHasBackpressure(controller) {
          if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
            return false;
          }
          return true;
        }
        function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
          const state = controller._controlledReadableStream._state;
          if (!controller._closeRequested && state === "readable") {
            return true;
          }
          return false;
        }
        function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
          controller._controlledReadableStream = stream;
          controller._queue = void 0;
          controller._queueTotalSize = void 0;
          ResetQueue(controller);
          controller._started = false;
          controller._closeRequested = false;
          controller._pullAgain = false;
          controller._pulling = false;
          controller._strategySizeAlgorithm = sizeAlgorithm;
          controller._strategyHWM = highWaterMark;
          controller._pullAlgorithm = pullAlgorithm;
          controller._cancelAlgorithm = cancelAlgorithm;
          stream._readableStreamController = controller;
          const startResult = startAlgorithm();
          uponPromise(promiseResolvedWith(startResult), () => {
            controller._started = true;
            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
          }, (r) => {
            ReadableStreamDefaultControllerError(controller, r);
          });
        }
        function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          let startAlgorithm = () => void 0;
          let pullAlgorithm = () => promiseResolvedWith(void 0);
          let cancelAlgorithm = () => promiseResolvedWith(void 0);
          if (underlyingSource.start !== void 0) {
            startAlgorithm = () => underlyingSource.start(controller);
          }
          if (underlyingSource.pull !== void 0) {
            pullAlgorithm = () => underlyingSource.pull(controller);
          }
          if (underlyingSource.cancel !== void 0) {
            cancelAlgorithm = (reason) => underlyingSource.cancel(reason);
          }
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
        }
        function defaultControllerBrandCheckException$1(name2) {
          return new TypeError(`ReadableStreamDefaultController.prototype.${name2} can only be used on a ReadableStreamDefaultController`);
        }
        function ReadableStreamTee(stream, cloneForBranch2) {
          if (IsReadableByteStreamController(stream._readableStreamController)) {
            return ReadableByteStreamTee(stream);
          }
          return ReadableStreamDefaultTee(stream);
        }
        function ReadableStreamDefaultTee(stream, cloneForBranch2) {
          const reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function pullAlgorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  const chunk2 = chunk;
                  if (!canceled1) {
                    ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableStreamDefaultControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableStreamDefaultControllerClose(branch2._readableStreamController);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
          }
          branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
          branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
          uponRejection(reader._closedPromise, (r) => {
            ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
            ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
            if (!canceled1 || !canceled2) {
              resolveCancelPromise(void 0);
            }
          });
          return [branch1, branch2];
        }
        function ReadableByteStreamTee(stream) {
          let reader = AcquireReadableStreamDefaultReader(stream);
          let reading = false;
          let canceled1 = false;
          let canceled2 = false;
          let reason1;
          let reason2;
          let branch1;
          let branch2;
          let resolveCancelPromise;
          const cancelPromise = newPromise((resolve2) => {
            resolveCancelPromise = resolve2;
          });
          function forwardReaderError(thisReader) {
            uponRejection(thisReader._closedPromise, (r) => {
              if (thisReader !== reader) {
                return;
              }
              ReadableByteStreamControllerError(branch1._readableStreamController, r);
              ReadableByteStreamControllerError(branch2._readableStreamController, r);
              if (!canceled1 || !canceled2) {
                resolveCancelPromise(void 0);
              }
            });
          }
          function pullWithDefaultReader() {
            if (IsReadableStreamBYOBReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamDefaultReader(stream);
              forwardReaderError(reader);
            }
            const readRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const chunk1 = chunk;
                  let chunk2 = chunk;
                  if (!canceled1 && !canceled2) {
                    try {
                      chunk2 = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                  }
                  if (!canceled1) {
                    ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
                  }
                  if (!canceled2) {
                    ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
                  }
                });
              },
              _closeSteps: () => {
                reading = false;
                if (!canceled1) {
                  ReadableByteStreamControllerClose(branch1._readableStreamController);
                }
                if (!canceled2) {
                  ReadableByteStreamControllerClose(branch2._readableStreamController);
                }
                if (branch1._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
                }
                if (branch2._readableStreamController._pendingPullIntos.length > 0) {
                  ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
                }
                if (!canceled1 || !canceled2) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamDefaultReaderRead(reader, readRequest);
          }
          function pullWithBYOBReader(view, forBranch2) {
            if (IsReadableStreamDefaultReader(reader)) {
              ReadableStreamReaderGenericRelease(reader);
              reader = AcquireReadableStreamBYOBReader(stream);
              forwardReaderError(reader);
            }
            const byobBranch = forBranch2 ? branch2 : branch1;
            const otherBranch = forBranch2 ? branch1 : branch2;
            const readIntoRequest = {
              _chunkSteps: (chunk) => {
                queueMicrotask(() => {
                  reading = false;
                  const byobCanceled = forBranch2 ? canceled2 : canceled1;
                  const otherCanceled = forBranch2 ? canceled1 : canceled2;
                  if (!otherCanceled) {
                    let clonedChunk;
                    try {
                      clonedChunk = CloneAsUint8Array(chunk);
                    } catch (cloneE) {
                      ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                      ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                      resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                      return;
                    }
                    if (!byobCanceled) {
                      ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                    }
                    ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
                  } else if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                });
              },
              _closeSteps: (chunk) => {
                reading = false;
                const byobCanceled = forBranch2 ? canceled2 : canceled1;
                const otherCanceled = forBranch2 ? canceled1 : canceled2;
                if (!byobCanceled) {
                  ReadableByteStreamControllerClose(byobBranch._readableStreamController);
                }
                if (!otherCanceled) {
                  ReadableByteStreamControllerClose(otherBranch._readableStreamController);
                }
                if (chunk !== void 0) {
                  if (!byobCanceled) {
                    ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                  }
                  if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                    ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
                  }
                }
                if (!byobCanceled || !otherCanceled) {
                  resolveCancelPromise(void 0);
                }
              },
              _errorSteps: () => {
                reading = false;
              }
            };
            ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
          }
          function pull1Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, false);
            }
            return promiseResolvedWith(void 0);
          }
          function pull2Algorithm() {
            if (reading) {
              return promiseResolvedWith(void 0);
            }
            reading = true;
            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
            if (byobRequest === null) {
              pullWithDefaultReader();
            } else {
              pullWithBYOBReader(byobRequest._view, true);
            }
            return promiseResolvedWith(void 0);
          }
          function cancel1Algorithm(reason) {
            canceled1 = true;
            reason1 = reason;
            if (canceled2) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function cancel2Algorithm(reason) {
            canceled2 = true;
            reason2 = reason;
            if (canceled1) {
              const compositeReason = CreateArrayFromList([reason1, reason2]);
              const cancelResult = ReadableStreamCancel(stream, compositeReason);
              resolveCancelPromise(cancelResult);
            }
            return cancelPromise;
          }
          function startAlgorithm() {
            return;
          }
          branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
          branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
          forwardReaderError(reader);
          return [branch1, branch2];
        }
        function convertUnderlyingDefaultOrByteSource(source, context) {
          assertDictionary(source, context);
          const original = source;
          const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
          const cancel = original === null || original === void 0 ? void 0 : original.cancel;
          const pull = original === null || original === void 0 ? void 0 : original.pull;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const type = original === null || original === void 0 ? void 0 : original.type;
          return {
            autoAllocateChunkSize: autoAllocateChunkSize === void 0 ? void 0 : convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
            cancel: cancel === void 0 ? void 0 : convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
            pull: pull === void 0 ? void 0 : convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
            start: start === void 0 ? void 0 : convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
            type: type === void 0 ? void 0 : convertReadableStreamType(type, `${context} has member 'type' that`)
          };
        }
        function convertUnderlyingSourceCancelCallback(fn, original, context) {
          assertFunction(fn, context);
          return (reason) => promiseCall(fn, original, [reason]);
        }
        function convertUnderlyingSourcePullCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertUnderlyingSourceStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertReadableStreamType(type, context) {
          type = `${type}`;
          if (type !== "bytes") {
            throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
          }
          return type;
        }
        function convertReaderOptions(options2, context) {
          assertDictionary(options2, context);
          const mode = options2 === null || options2 === void 0 ? void 0 : options2.mode;
          return {
            mode: mode === void 0 ? void 0 : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
          };
        }
        function convertReadableStreamReaderMode(mode, context) {
          mode = `${mode}`;
          if (mode !== "byob") {
            throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
          }
          return mode;
        }
        function convertIteratorOptions(options2, context) {
          assertDictionary(options2, context);
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          return { preventCancel: Boolean(preventCancel) };
        }
        function convertPipeOptions(options2, context) {
          assertDictionary(options2, context);
          const preventAbort = options2 === null || options2 === void 0 ? void 0 : options2.preventAbort;
          const preventCancel = options2 === null || options2 === void 0 ? void 0 : options2.preventCancel;
          const preventClose = options2 === null || options2 === void 0 ? void 0 : options2.preventClose;
          const signal = options2 === null || options2 === void 0 ? void 0 : options2.signal;
          if (signal !== void 0) {
            assertAbortSignal(signal, `${context} has member 'signal' that`);
          }
          return {
            preventAbort: Boolean(preventAbort),
            preventCancel: Boolean(preventCancel),
            preventClose: Boolean(preventClose),
            signal
          };
        }
        function assertAbortSignal(signal, context) {
          if (!isAbortSignal2(signal)) {
            throw new TypeError(`${context} is not an AbortSignal.`);
          }
        }
        function convertReadableWritablePair(pair, context) {
          assertDictionary(pair, context);
          const readable = pair === null || pair === void 0 ? void 0 : pair.readable;
          assertRequiredField(readable, "readable", "ReadableWritablePair");
          assertReadableStream(readable, `${context} has member 'readable' that`);
          const writable2 = pair === null || pair === void 0 ? void 0 : pair.writable;
          assertRequiredField(writable2, "writable", "ReadableWritablePair");
          assertWritableStream(writable2, `${context} has member 'writable' that`);
          return { readable, writable: writable2 };
        }
        class ReadableStream2 {
          constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
            if (rawUnderlyingSource === void 0) {
              rawUnderlyingSource = null;
            } else {
              assertObject(rawUnderlyingSource, "First parameter");
            }
            const strategy = convertQueuingStrategy(rawStrategy, "Second parameter");
            const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, "First parameter");
            InitializeReadableStream(this);
            if (underlyingSource.type === "bytes") {
              if (strategy.size !== void 0) {
                throw new RangeError("The strategy for a byte stream cannot have a size function");
              }
              const highWaterMark = ExtractHighWaterMark(strategy, 0);
              SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
            } else {
              const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
              const highWaterMark = ExtractHighWaterMark(strategy, 1);
              SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
            }
          }
          get locked() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("locked");
            }
            return IsReadableStreamLocked(this);
          }
          cancel(reason = void 0) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("cancel"));
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("Cannot cancel a stream that already has a reader"));
            }
            return ReadableStreamCancel(this, reason);
          }
          getReader(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("getReader");
            }
            const options2 = convertReaderOptions(rawOptions, "First parameter");
            if (options2.mode === void 0) {
              return AcquireReadableStreamDefaultReader(this);
            }
            return AcquireReadableStreamBYOBReader(this);
          }
          pipeThrough(rawTransform, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("pipeThrough");
            }
            assertRequiredArgument(rawTransform, 1, "pipeThrough");
            const transform = convertReadableWritablePair(rawTransform, "First parameter");
            const options2 = convertPipeOptions(rawOptions, "Second parameter");
            if (IsReadableStreamLocked(this)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
            }
            if (IsWritableStreamLocked(transform.writable)) {
              throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
            }
            const promise = ReadableStreamPipeTo(this, transform.writable, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
            setPromiseIsHandledToTrue(promise);
            return transform.readable;
          }
          pipeTo(destination, rawOptions = {}) {
            if (!IsReadableStream(this)) {
              return promiseRejectedWith(streamBrandCheckException$1("pipeTo"));
            }
            if (destination === void 0) {
              return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
            }
            if (!IsWritableStream(destination)) {
              return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
            }
            let options2;
            try {
              options2 = convertPipeOptions(rawOptions, "Second parameter");
            } catch (e) {
              return promiseRejectedWith(e);
            }
            if (IsReadableStreamLocked(this)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream"));
            }
            if (IsWritableStreamLocked(destination)) {
              return promiseRejectedWith(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream"));
            }
            return ReadableStreamPipeTo(this, destination, options2.preventClose, options2.preventAbort, options2.preventCancel, options2.signal);
          }
          tee() {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("tee");
            }
            const branches = ReadableStreamTee(this);
            return CreateArrayFromList(branches);
          }
          values(rawOptions = void 0) {
            if (!IsReadableStream(this)) {
              throw streamBrandCheckException$1("values");
            }
            const options2 = convertIteratorOptions(rawOptions, "First parameter");
            return AcquireReadableStreamAsyncIterator(this, options2.preventCancel);
          }
        }
        Object.defineProperties(ReadableStream2.prototype, {
          cancel: { enumerable: true },
          getReader: { enumerable: true },
          pipeThrough: { enumerable: true },
          pipeTo: { enumerable: true },
          tee: { enumerable: true },
          values: { enumerable: true },
          locked: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.toStringTag, {
            value: "ReadableStream",
            configurable: true
          });
        }
        if (typeof SymbolPolyfill.asyncIterator === "symbol") {
          Object.defineProperty(ReadableStream2.prototype, SymbolPolyfill.asyncIterator, {
            value: ReadableStream2.prototype.values,
            writable: true,
            configurable: true
          });
        }
        function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableStreamDefaultController.prototype);
          SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
          return stream;
        }
        function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
          const stream = Object.create(ReadableStream2.prototype);
          InitializeReadableStream(stream);
          const controller = Object.create(ReadableByteStreamController.prototype);
          SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, void 0);
          return stream;
        }
        function InitializeReadableStream(stream) {
          stream._state = "readable";
          stream._reader = void 0;
          stream._storedError = void 0;
          stream._disturbed = false;
        }
        function IsReadableStream(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_readableStreamController")) {
            return false;
          }
          return x2 instanceof ReadableStream2;
        }
        function IsReadableStreamLocked(stream) {
          if (stream._reader === void 0) {
            return false;
          }
          return true;
        }
        function ReadableStreamCancel(stream, reason) {
          stream._disturbed = true;
          if (stream._state === "closed") {
            return promiseResolvedWith(void 0);
          }
          if (stream._state === "errored") {
            return promiseRejectedWith(stream._storedError);
          }
          ReadableStreamClose(stream);
          const reader = stream._reader;
          if (reader !== void 0 && IsReadableStreamBYOBReader(reader)) {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._closeSteps(void 0);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
          const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
          return transformPromiseWith(sourceCancelPromise, noop2);
        }
        function ReadableStreamClose(stream) {
          stream._state = "closed";
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseResolve(reader);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._closeSteps();
            });
            reader._readRequests = new SimpleQueue();
          }
        }
        function ReadableStreamError(stream, e) {
          stream._state = "errored";
          stream._storedError = e;
          const reader = stream._reader;
          if (reader === void 0) {
            return;
          }
          defaultReaderClosedPromiseReject(reader, e);
          if (IsReadableStreamDefaultReader(reader)) {
            reader._readRequests.forEach((readRequest) => {
              readRequest._errorSteps(e);
            });
            reader._readRequests = new SimpleQueue();
          } else {
            reader._readIntoRequests.forEach((readIntoRequest) => {
              readIntoRequest._errorSteps(e);
            });
            reader._readIntoRequests = new SimpleQueue();
          }
        }
        function streamBrandCheckException$1(name2) {
          return new TypeError(`ReadableStream.prototype.${name2} can only be used on a ReadableStream`);
        }
        function convertQueuingStrategyInit(init2, context) {
          assertDictionary(init2, context);
          const highWaterMark = init2 === null || init2 === void 0 ? void 0 : init2.highWaterMark;
          assertRequiredField(highWaterMark, "highWaterMark", "QueuingStrategyInit");
          return {
            highWaterMark: convertUnrestrictedDouble(highWaterMark)
          };
        }
        const byteLengthSizeFunction = (chunk) => {
          return chunk.byteLength;
        };
        Object.defineProperty(byteLengthSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class ByteLengthQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "ByteLengthQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._byteLengthQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("highWaterMark");
            }
            return this._byteLengthQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsByteLengthQueuingStrategy(this)) {
              throw byteLengthBrandCheckException("size");
            }
            return byteLengthSizeFunction;
          }
        }
        Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "ByteLengthQueuingStrategy",
            configurable: true
          });
        }
        function byteLengthBrandCheckException(name2) {
          return new TypeError(`ByteLengthQueuingStrategy.prototype.${name2} can only be used on a ByteLengthQueuingStrategy`);
        }
        function IsByteLengthQueuingStrategy(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_byteLengthQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x2 instanceof ByteLengthQueuingStrategy;
        }
        const countSizeFunction = () => {
          return 1;
        };
        Object.defineProperty(countSizeFunction, "name", {
          value: "size",
          configurable: true
        });
        class CountQueuingStrategy {
          constructor(options2) {
            assertRequiredArgument(options2, 1, "CountQueuingStrategy");
            options2 = convertQueuingStrategyInit(options2, "First parameter");
            this._countQueuingStrategyHighWaterMark = options2.highWaterMark;
          }
          get highWaterMark() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("highWaterMark");
            }
            return this._countQueuingStrategyHighWaterMark;
          }
          get size() {
            if (!IsCountQueuingStrategy(this)) {
              throw countBrandCheckException("size");
            }
            return countSizeFunction;
          }
        }
        Object.defineProperties(CountQueuingStrategy.prototype, {
          highWaterMark: { enumerable: true },
          size: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
            value: "CountQueuingStrategy",
            configurable: true
          });
        }
        function countBrandCheckException(name2) {
          return new TypeError(`CountQueuingStrategy.prototype.${name2} can only be used on a CountQueuingStrategy`);
        }
        function IsCountQueuingStrategy(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_countQueuingStrategyHighWaterMark")) {
            return false;
          }
          return x2 instanceof CountQueuingStrategy;
        }
        function convertTransformer(original, context) {
          assertDictionary(original, context);
          const flush = original === null || original === void 0 ? void 0 : original.flush;
          const readableType = original === null || original === void 0 ? void 0 : original.readableType;
          const start = original === null || original === void 0 ? void 0 : original.start;
          const transform = original === null || original === void 0 ? void 0 : original.transform;
          const writableType = original === null || original === void 0 ? void 0 : original.writableType;
          return {
            flush: flush === void 0 ? void 0 : convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
            readableType,
            start: start === void 0 ? void 0 : convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
            transform: transform === void 0 ? void 0 : convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
            writableType
          };
        }
        function convertTransformerFlushCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => promiseCall(fn, original, [controller]);
        }
        function convertTransformerStartCallback(fn, original, context) {
          assertFunction(fn, context);
          return (controller) => reflectCall(fn, original, [controller]);
        }
        function convertTransformerTransformCallback(fn, original, context) {
          assertFunction(fn, context);
          return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
        }
        class TransformStream {
          constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
            if (rawTransformer === void 0) {
              rawTransformer = null;
            }
            const writableStrategy = convertQueuingStrategy(rawWritableStrategy, "Second parameter");
            const readableStrategy = convertQueuingStrategy(rawReadableStrategy, "Third parameter");
            const transformer = convertTransformer(rawTransformer, "First parameter");
            if (transformer.readableType !== void 0) {
              throw new RangeError("Invalid readableType specified");
            }
            if (transformer.writableType !== void 0) {
              throw new RangeError("Invalid writableType specified");
            }
            const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
            const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
            const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
            const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
            let startPromise_resolve;
            const startPromise = newPromise((resolve2) => {
              startPromise_resolve = resolve2;
            });
            InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
            SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
            if (transformer.start !== void 0) {
              startPromise_resolve(transformer.start(this._transformStreamController));
            } else {
              startPromise_resolve(void 0);
            }
          }
          get readable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("readable");
            }
            return this._readable;
          }
          get writable() {
            if (!IsTransformStream(this)) {
              throw streamBrandCheckException("writable");
            }
            return this._writable;
          }
        }
        Object.defineProperties(TransformStream.prototype, {
          readable: { enumerable: true },
          writable: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStream",
            configurable: true
          });
        }
        function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
          function startAlgorithm() {
            return startPromise;
          }
          function writeAlgorithm(chunk) {
            return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
          }
          function abortAlgorithm(reason) {
            return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
          }
          function closeAlgorithm() {
            return TransformStreamDefaultSinkCloseAlgorithm(stream);
          }
          stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
          function pullAlgorithm() {
            return TransformStreamDefaultSourcePullAlgorithm(stream);
          }
          function cancelAlgorithm(reason) {
            TransformStreamErrorWritableAndUnblockWrite(stream, reason);
            return promiseResolvedWith(void 0);
          }
          stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
          stream._backpressure = void 0;
          stream._backpressureChangePromise = void 0;
          stream._backpressureChangePromise_resolve = void 0;
          TransformStreamSetBackpressure(stream, true);
          stream._transformStreamController = void 0;
        }
        function IsTransformStream(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_transformStreamController")) {
            return false;
          }
          return x2 instanceof TransformStream;
        }
        function TransformStreamError(stream, e) {
          ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
          TransformStreamErrorWritableAndUnblockWrite(stream, e);
        }
        function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
          TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
          WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
          if (stream._backpressure) {
            TransformStreamSetBackpressure(stream, false);
          }
        }
        function TransformStreamSetBackpressure(stream, backpressure) {
          if (stream._backpressureChangePromise !== void 0) {
            stream._backpressureChangePromise_resolve();
          }
          stream._backpressureChangePromise = newPromise((resolve2) => {
            stream._backpressureChangePromise_resolve = resolve2;
          });
          stream._backpressure = backpressure;
        }
        class TransformStreamDefaultController {
          constructor() {
            throw new TypeError("Illegal constructor");
          }
          get desiredSize() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("desiredSize");
            }
            const readableController = this._controlledTransformStream._readable._readableStreamController;
            return ReadableStreamDefaultControllerGetDesiredSize(readableController);
          }
          enqueue(chunk = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("enqueue");
            }
            TransformStreamDefaultControllerEnqueue(this, chunk);
          }
          error(reason = void 0) {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("error");
            }
            TransformStreamDefaultControllerError(this, reason);
          }
          terminate() {
            if (!IsTransformStreamDefaultController(this)) {
              throw defaultControllerBrandCheckException("terminate");
            }
            TransformStreamDefaultControllerTerminate(this);
          }
        }
        Object.defineProperties(TransformStreamDefaultController.prototype, {
          enqueue: { enumerable: true },
          error: { enumerable: true },
          terminate: { enumerable: true },
          desiredSize: { enumerable: true }
        });
        if (typeof SymbolPolyfill.toStringTag === "symbol") {
          Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
            value: "TransformStreamDefaultController",
            configurable: true
          });
        }
        function IsTransformStreamDefaultController(x2) {
          if (!typeIsObject(x2)) {
            return false;
          }
          if (!Object.prototype.hasOwnProperty.call(x2, "_controlledTransformStream")) {
            return false;
          }
          return x2 instanceof TransformStreamDefaultController;
        }
        function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
          controller._controlledTransformStream = stream;
          stream._transformStreamController = controller;
          controller._transformAlgorithm = transformAlgorithm;
          controller._flushAlgorithm = flushAlgorithm;
        }
        function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
          const controller = Object.create(TransformStreamDefaultController.prototype);
          let transformAlgorithm = (chunk) => {
            try {
              TransformStreamDefaultControllerEnqueue(controller, chunk);
              return promiseResolvedWith(void 0);
            } catch (transformResultE) {
              return promiseRejectedWith(transformResultE);
            }
          };
          let flushAlgorithm = () => promiseResolvedWith(void 0);
          if (transformer.transform !== void 0) {
            transformAlgorithm = (chunk) => transformer.transform(chunk, controller);
          }
          if (transformer.flush !== void 0) {
            flushAlgorithm = () => transformer.flush(controller);
          }
          SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
        }
        function TransformStreamDefaultControllerClearAlgorithms(controller) {
          controller._transformAlgorithm = void 0;
          controller._flushAlgorithm = void 0;
        }
        function TransformStreamDefaultControllerEnqueue(controller, chunk) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
            throw new TypeError("Readable side is not in a state that permits enqueue");
          }
          try {
            ReadableStreamDefaultControllerEnqueue(readableController, chunk);
          } catch (e) {
            TransformStreamErrorWritableAndUnblockWrite(stream, e);
            throw stream._readable._storedError;
          }
          const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
          if (backpressure !== stream._backpressure) {
            TransformStreamSetBackpressure(stream, true);
          }
        }
        function TransformStreamDefaultControllerError(controller, e) {
          TransformStreamError(controller._controlledTransformStream, e);
        }
        function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
          const transformPromise = controller._transformAlgorithm(chunk);
          return transformPromiseWith(transformPromise, void 0, (r) => {
            TransformStreamError(controller._controlledTransformStream, r);
            throw r;
          });
        }
        function TransformStreamDefaultControllerTerminate(controller) {
          const stream = controller._controlledTransformStream;
          const readableController = stream._readable._readableStreamController;
          ReadableStreamDefaultControllerClose(readableController);
          const error2 = new TypeError("TransformStream terminated");
          TransformStreamErrorWritableAndUnblockWrite(stream, error2);
        }
        function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
          const controller = stream._transformStreamController;
          if (stream._backpressure) {
            const backpressureChangePromise = stream._backpressureChangePromise;
            return transformPromiseWith(backpressureChangePromise, () => {
              const writable2 = stream._writable;
              const state = writable2._state;
              if (state === "erroring") {
                throw writable2._storedError;
              }
              return TransformStreamDefaultControllerPerformTransform(controller, chunk);
            });
          }
          return TransformStreamDefaultControllerPerformTransform(controller, chunk);
        }
        function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
          TransformStreamError(stream, reason);
          return promiseResolvedWith(void 0);
        }
        function TransformStreamDefaultSinkCloseAlgorithm(stream) {
          const readable = stream._readable;
          const controller = stream._transformStreamController;
          const flushPromise = controller._flushAlgorithm();
          TransformStreamDefaultControllerClearAlgorithms(controller);
          return transformPromiseWith(flushPromise, () => {
            if (readable._state === "errored") {
              throw readable._storedError;
            }
            ReadableStreamDefaultControllerClose(readable._readableStreamController);
          }, (r) => {
            TransformStreamError(stream, r);
            throw readable._storedError;
          });
        }
        function TransformStreamDefaultSourcePullAlgorithm(stream) {
          TransformStreamSetBackpressure(stream, false);
          return stream._backpressureChangePromise;
        }
        function defaultControllerBrandCheckException(name2) {
          return new TypeError(`TransformStreamDefaultController.prototype.${name2} can only be used on a TransformStreamDefaultController`);
        }
        function streamBrandCheckException(name2) {
          return new TypeError(`TransformStream.prototype.${name2} can only be used on a TransformStream`);
        }
        exports2.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
        exports2.CountQueuingStrategy = CountQueuingStrategy;
        exports2.ReadableByteStreamController = ReadableByteStreamController;
        exports2.ReadableStream = ReadableStream2;
        exports2.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
        exports2.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
        exports2.ReadableStreamDefaultController = ReadableStreamDefaultController;
        exports2.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
        exports2.TransformStream = TransformStream;
        exports2.TransformStreamDefaultController = TransformStreamDefaultController;
        exports2.WritableStream = WritableStream;
        exports2.WritableStreamDefaultController = WritableStreamDefaultController;
        exports2.WritableStreamDefaultWriter = WritableStreamDefaultWriter;
        Object.defineProperty(exports2, "__esModule", { value: true });
      });
    })(ponyfill_es2018, ponyfill_es2018.exports);
    POOL_SIZE$1 = 65536;
    if (!globalThis.ReadableStream) {
      try {
        const process2 = require("node:process");
        const { emitWarning } = process2;
        try {
          process2.emitWarning = () => {
          };
          Object.assign(globalThis, require("node:stream/web"));
          process2.emitWarning = emitWarning;
        } catch (error2) {
          process2.emitWarning = emitWarning;
          throw error2;
        }
      } catch (error2) {
        Object.assign(globalThis, ponyfill_es2018.exports);
      }
    }
    try {
      const { Blob: Blob2 } = require("buffer");
      if (Blob2 && !Blob2.prototype.stream) {
        Blob2.prototype.stream = function name2(params) {
          let position = 0;
          const blob = this;
          return new ReadableStream({
            type: "bytes",
            async pull(ctrl) {
              const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE$1));
              const buffer = await chunk.arrayBuffer();
              position += buffer.byteLength;
              ctrl.enqueue(new Uint8Array(buffer));
              if (position === blob.size) {
                ctrl.close();
              }
            }
          });
        };
      }
    } catch (error2) {
    }
    POOL_SIZE = 65536;
    _Blob = (_a = class {
      constructor(blobParts = [], options2 = {}) {
        __privateAdd(this, _parts, []);
        __privateAdd(this, _type, "");
        __privateAdd(this, _size, 0);
        if (typeof blobParts !== "object" || blobParts === null) {
          throw new TypeError("Failed to construct 'Blob': The provided value cannot be converted to a sequence.");
        }
        if (typeof blobParts[Symbol.iterator] !== "function") {
          throw new TypeError("Failed to construct 'Blob': The object must have a callable @@iterator property.");
        }
        if (typeof options2 !== "object" && typeof options2 !== "function") {
          throw new TypeError("Failed to construct 'Blob': parameter 2 cannot convert to dictionary.");
        }
        if (options2 === null)
          options2 = {};
        const encoder = new TextEncoder();
        for (const element of blobParts) {
          let part;
          if (ArrayBuffer.isView(element)) {
            part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength));
          } else if (element instanceof ArrayBuffer) {
            part = new Uint8Array(element.slice(0));
          } else if (element instanceof _a) {
            part = element;
          } else {
            part = encoder.encode(element);
          }
          __privateSet(this, _size, __privateGet(this, _size) + (ArrayBuffer.isView(part) ? part.byteLength : part.size));
          __privateGet(this, _parts).push(part);
        }
        const type = options2.type === void 0 ? "" : String(options2.type);
        __privateSet(this, _type, /^[\x20-\x7E]*$/.test(type) ? type : "");
      }
      get size() {
        return __privateGet(this, _size);
      }
      get type() {
        return __privateGet(this, _type);
      }
      async text() {
        const decoder = new TextDecoder();
        let str = "";
        for await (const part of toIterator(__privateGet(this, _parts), false)) {
          str += decoder.decode(part, { stream: true });
        }
        str += decoder.decode();
        return str;
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of toIterator(__privateGet(this, _parts), false)) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        const it2 = toIterator(__privateGet(this, _parts), true);
        return new globalThis.ReadableStream({
          type: "bytes",
          async pull(ctrl) {
            const chunk = await it2.next();
            chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value);
          },
          async cancel() {
            await it2.return();
          }
        });
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = __privateGet(this, _parts);
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          if (added >= span) {
            break;
          }
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            let chunk;
            if (ArrayBuffer.isView(part)) {
              chunk = part.subarray(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.byteLength;
            } else {
              chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
              added += chunk.size;
            }
            relativeEnd -= size2;
            blobParts.push(chunk);
            relativeStart = 0;
          }
        }
        const blob = new _a([], { type: String(type).toLowerCase() });
        __privateSet(blob, _size, span);
        __privateSet(blob, _parts, blobParts);
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.constructor === "function" && (typeof object.stream === "function" || typeof object.arrayBuffer === "function") && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    }, _parts = new WeakMap(), _type = new WeakMap(), _size = new WeakMap(), _a);
    Object.defineProperties(_Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    Blob = _Blob;
    Blob$1 = Blob;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && (object[NAME] === "AbortSignal" || object[NAME] === "EventTarget");
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (error_) => {
            const error2 = error_ instanceof FetchBaseError ? error_ : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, "system", error_);
            this[INTERNALS$2].error = error2;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct2 = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct2
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        import_stream.default.Readable.from(body.stream()).pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name2) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name2)) {
        const error2 = new TypeError(`Header name must be a valid HTTP token [${name2}]`);
        Object.defineProperty(error2, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw error2;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name2, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const error2 = new TypeError(`Invalid character in header content ["${name2}"]`);
        Object.defineProperty(error2, "code", { value: "ERR_INVALID_CHAR" });
        throw error2;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name2, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name2, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name2, value]) => {
          validateHeaderName(name2);
          validateHeaderValue(name2, String(value));
          return [String(name2).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p2, receiver) {
            switch (p2) {
              case "append":
              case "set":
                return (name2, value) => {
                  validateHeaderName(name2);
                  validateHeaderValue(name2, String(value));
                  return URLSearchParams.prototype[p2].call(target, String(name2).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name2) => {
                  validateHeaderName(name2);
                  return URLSearchParams.prototype[p2].call(target, String(name2).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p2, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name2) {
        const values = this.getAll(name2);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name2)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback, thisArg = void 0) {
        for (const name2 of this.keys()) {
          Reflect.apply(callback, thisArg, [this.get(name2), name2, this]);
        }
      }
      *values() {
        for (const name2 of this.keys()) {
          yield this.get(name2);
        }
      }
      *entries() {
        for (const name2 of this.keys()) {
          yield [name2, this.get(name2)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status != null ? options2.status : 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          type: "default",
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get type() {
        return this[INTERNALS$1].type;
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          type: this.type,
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      static error() {
        const response = new Response(null, { status: 0, statusText: "" });
        response[INTERNALS$1].type = "error";
        return response;
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      type: { enumerable: true },
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal != null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/svelte-adapter-firebase/src/files/shims.js
var init_shims = __esm({
  "node_modules/svelte-adapter-firebase/src/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports) {
    init_shims();
    "use strict";
    exports.parse = parse;
    exports.serialize = serialize;
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse(str, options2) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options2 || {};
      var pairs = str.split(pairSplitRegExp);
      var dec = opt.decode || decode;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var eq_idx = pair.indexOf("=");
        if (eq_idx < 0) {
          continue;
        }
        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();
        if (val[0] == '"') {
          val = val.slice(1, -1);
        }
        if (obj[key] == void 0) {
          obj[key] = tryDecode(val, dec);
        }
      }
      return obj;
    }
    function serialize(name2, val, options2) {
      var opt = options2 || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name2)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name2 + "=" + value;
      if (opt.maxAge != null) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== "function") {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + opt.expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// .svelte-kit/firebase/entry.js
__export(exports, {
  default: () => svelteKit
});
init_shims();

// .svelte-kit/output/server/app.js
var app_exports = {};
__export(app_exports, {
  init: () => init,
  render: () => render
});
init_shims();
var import_cookie = __toModule(require_cookie());

// node_modules/@lukeed/uuid/dist/index.mjs
init_shims();
var IDX = 256;
var HEX = [];
var BUFFER;
while (IDX--)
  HEX[IDX] = (IDX + 256).toString(16).substring(1);
function v4() {
  var i = 0, num, out = "";
  if (!BUFFER || IDX + 16 > 256) {
    BUFFER = Array(i = 256);
    while (i--)
      BUFFER[i] = 256 * Math.random() | 0;
    i = IDX = 0;
  }
  for (; i < 16; i++) {
    num = BUFFER[IDX + i];
    if (i == 6)
      out += HEX[num & 15 | 64];
    else if (i == 8)
      out += HEX[num & 63 | 128];
    else
      out += HEX[num];
    if (i & 1 && i > 1 && i < 11)
      out += "-";
  }
  IDX++;
  return out;
}

// .svelte-kit/output/server/app.js
var __accessCheck2 = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet2 = (obj, member, getter) => {
  __accessCheck2(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd2 = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet2 = (obj, member, value, setter) => {
  __accessCheck2(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error$1(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const params = route.params(match);
  const response = await handler(__spreadProps(__spreadValues({}, request), { params }));
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error$1(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error$1(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = __spreadProps(__spreadValues({}, headers), { "content-type": "application/json; charset=utf-8" });
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v2, i) {
          return i in thing ? stringify(v2) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name2, thing) {
      params_1.push(name2);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v2, i) {
            statements_1.push(name2 + "[" + i + "]=" + stringify(v2));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name2 + "." + Array.from(thing).map(function(v2) {
            return "add(" + stringify(v2) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name2 + "." + Array.from(thing).map(function(_a22) {
            var k2 = _a22[0], v2 = _a22[1];
            return "set(" + stringify(k2) + ", " + stringify(v2) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name2 + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name2 = "";
  do {
    name2 = chars[num % chars.length] + name2;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name2) ? name2 + "_" : name2;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var escape_json_string_in_html_dict = {
  '"': '\\"',
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
var escape_html_attr_dict = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page: page2
}) {
  const css2 = new Set(options2.entry.css);
  const js2 = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js2.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page: page2,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js2.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js2).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2 && page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${page2 && page2.path ? try_serialize(page2.path, (error3) => {
      throw new Error(`Failed to serialize page.path: ${error3.message}`);
    }) : null},
						query: new URLSearchParams(${page2 && page2.query ? s$1(page2.query.toString()) : ""}),
						params: ${page2 && page2.params ? try_serialize(page2.params, (error3) => {
      throw new Error(`Failed to serialize page.params: ${error3.message}`);
    }) : null}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name: name2, message, stack } = error2;
    serialized = try_serialize(__spreadProps(__spreadValues({}, error2), { name: name2, message, stack }));
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page2, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = __spreadValues({
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity
          }, opts);
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const prefix = options2.paths.assets || options2.paths.base;
        const filename = (resolved.startsWith(prefix) ? resolved.slice(prefix.length) : resolved).slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d) => d.file === filename || d.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page2.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = __spreadValues({}, opts.headers);
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = __spreadProps(__spreadValues({}, opts.headers), {
                cookie: request.headers.cookie
              });
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, _receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: __spreadValues({}, stuff)
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page: page2,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page: page2,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page: page2
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id2) => id2 ? options2.load_component(id2) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {}
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node(__spreadProps(__spreadValues({}, opts), {
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            }));
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j2 = i;
                while (!(node_loaded = branch[j2])) {
                  j2 -= 1;
                }
                try {
                  const error_loaded = await load_node(__spreadProps(__spreadValues({}, opts), {
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  }));
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j2 + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = __spreadValues(__spreadValues({}, stuff), loaded.loaded.stuff);
        }
      }
    }
  try {
    return with_cookies(await render_response(__spreadProps(__spreadValues({}, opts), {
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    })), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error(__spreadProps(__spreadValues({}, opts), {
      status: 500,
      error: error3
    })), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page: page2
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  constructor(map) {
    __privateAdd2(this, _map, void 0);
    __privateSet2(this, _map, map);
  }
  get(key) {
    const value = __privateGet2(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet2(this, _map).get(key);
  }
  has(key) {
    return __privateGet2(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet2(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet2(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet2(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet2(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name2, value] = raw_header.split(": ");
      name2 = name2.toLowerCase();
      headers[name2] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name3, value2] = raw_directive.split("=");
        directives[name3] = JSON.parse(value2);
      });
      if (name2 === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q2 = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q2 ? `?${q2}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = __spreadProps(__spreadValues({}, incoming), {
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  });
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {}
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function is_promise(value) {
  return value && typeof value === "object" && typeof value.then === "function";
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
Promise.resolve();
var escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name2) {
  if (!component || !component.$$render) {
    if (name2 === "svelte:component")
      name2 += " this={...}";
    throw new Error(`<${name2}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name2, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name2}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var css$8 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: null
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$8);
  {
    stores.page.set(page2);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
var base = "";
var assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var handle = async ({ request, resolve: resolve2 }) => {
  const cookies = import_cookie.default.parse(request.headers.cookie || "");
  request.locals.userid = cookies.userid || v4();
  if (request.query.has("_method")) {
    request.method = request.query.get("_method").toUpperCase();
  }
  const response = await resolve2(request);
  if (!cookies.userid) {
    response.headers["set-cookie"] = import_cookie.default.serialize("userid", request.locals.userid, {
      path: "/",
      httpOnly: true
    });
  }
  return response;
};
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  handle
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/home.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-d398bc7b.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-d398bc7b.js", assets + "/_app/chunks/vendor-f237ac7c.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id2) => assets + "/_app/" + entry_lookup[id2],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var empty = () => ({});
var manifest = {
  assets: [{ "file": "blogwebsite.png", "size": 16275, "type": "image/png" }, { "file": "github.png", "size": 3081, "type": "image/png" }, { "file": "home.png", "size": 1471, "type": "image/png" }, { "file": "insta.png", "size": 1941, "type": "image/png" }, { "file": "linkedin.png", "size": 1279, "type": "image/png" }, { "file": "marvelApp.png", "size": 1683087, "type": "image/png" }, { "file": "me.png", "size": 1768, "type": "image/png" }, { "file": "montagewebsite.png", "size": 314883, "type": "image/png" }, { "file": "myportfolio.png", "size": 19810, "type": "image/png" }, { "file": "photo.jpg", "size": 46855, "type": "image/jpeg" }, { "file": "rickApp.png", "size": 484029, "type": "image/png" }, { "file": "rickLoader.jpg", "size": 48477, "type": "image/jpeg" }, { "file": "rickLoader.png", "size": 380891, "type": "image/png" }, { "file": "solarApp.png", "size": 113588, "type": "image/png" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/projects\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/projects.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/projects.svelte": () => Promise.resolve().then(function() {
    return projects;
  }),
  "src/routes/about.svelte": () => Promise.resolve().then(function() {
    return about;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-3abdb070.js", "css": ["assets/pages/__layout.svelte-925f9166.css", "assets/Social-1e2ca325.css"], "js": ["pages/__layout.svelte-3abdb070.js", "chunks/vendor-f237ac7c.js", "chunks/Social-95ed3f59.js"], "styles": [] }, ".svelte-kit/build/components/error.svelte": { "entry": "error.svelte-ce011586.js", "css": [], "js": ["error.svelte-ce011586.js", "chunks/vendor-f237ac7c.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-88b812ed.js", "css": ["assets/pages/index.svelte-01e91ec6.css"], "js": ["pages/index.svelte-88b812ed.js", "chunks/vendor-f237ac7c.js"], "styles": [] }, "src/routes/projects.svelte": { "entry": "pages/projects.svelte-56d0ed59.js", "css": ["assets/pages/projects.svelte-8d4cd313.css"], "js": ["pages/projects.svelte-56d0ed59.js", "chunks/vendor-f237ac7c.js", "chunks/env-a13806e5.js"], "styles": [] }, "src/routes/about.svelte": { "entry": "pages/about.svelte-f4030636.js", "css": ["assets/pages/about.svelte-d8630838.css", "assets/Social-1e2ca325.css"], "js": ["pages/about.svelte-f4030636.js", "chunks/vendor-f237ac7c.js", "chunks/Social-95ed3f59.js", "chunks/env-a13806e5.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js: js2, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js2.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond(__spreadProps(__spreadValues({}, request), { host }), options, { prerender: prerender2 });
}
var browser$1 = false;
var dev = false;
var getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
var page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
var home = "https://firebasestorage.googleapis.com/v0/b/lofi-dreamer.appspot.com/o/home.png?alt=media&token=fa60f455-7ad0-4ba2-8751-c32befad412a";
var gitHub = "https://firebasestorage.googleapis.com/v0/b/lofi-dreamer.appspot.com/o/github.png?alt=media&token=339361c0-6ea0-4716-a460-d532aff93ee5";
var insta = "https://firebasestorage.googleapis.com/v0/b/lofi-dreamer.appspot.com/o/insta.png?alt=media&token=50823e00-6e65-4f57-bdc9-9f048ccccae9";
var linkedin = "https://firebasestorage.googleapis.com/v0/b/lofi-dreamer.appspot.com/o/linkedin.png?alt=media&token=1ea7ca7a-86e8-47fc-97a7-99343f610b2d";
var css$7 = {
  code: ".social-block.svelte-qlqy68{height:3em;display:flex;flex-direction:row}img.svelte-qlqy68{width:2.5em;height:2.5em;object-fit:contain}",
  map: null
};
var Social = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$7);
  return `<div class="${"social-block svelte-qlqy68"}"><a href="${"https://www.instagram.com/vika_lindeman_webdev"}"><img${add_attribute("src", insta, 0)} alt="${"Insta"}" class="${"svelte-qlqy68"}"></a>
    <a href="${"https://github.com/Ellinsa"}"><img${add_attribute("src", gitHub, 0)} alt="${"GitHub"}" class="${"svelte-qlqy68"}"></a>
    <a href="${"https://www.linkedin.com/in/toriatovawebdev/"}"><img${add_attribute("src", linkedin, 0)} alt="${"LinkedIn"}" class="${"svelte-qlqy68"}"></a>
</div>`;
});
var css$6 = {
  code: "header.svelte-gpku4u.svelte-gpku4u{display:flex;justify-content:space-between;height:4rem;align-items:center}.corner.svelte-gpku4u.svelte-gpku4u{width:3em;height:3em;display:flex;align-items:center;justify-content:center;width:fit-content;height:100%}nav.svelte-gpku4u.svelte-gpku4u{display:flex;justify-content:center;margin-left:9.9rem}ul.svelte-gpku4u.svelte-gpku4u{position:relative;padding:0;margin:0;height:3em;display:flex;justify-content:center;align-items:center;list-style:none;background:var(--background);background-size:contain}li.svelte-gpku4u.svelte-gpku4u{position:relative;height:100%}.active.svelte-gpku4u a.svelte-gpku4u{color:var(--accent-color)}img.svelte-gpku4u.svelte-gpku4u{width:2.5em;height:2.5em;object-fit:contain}nav.svelte-gpku4u a.svelte-gpku4u{display:flex;height:100%;align-items:center;padding:0 1em;color:var(--heading-color);font-weight:700;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;text-decoration:none;transition:color 0.2s linear}a.svelte-gpku4u.svelte-gpku4u:hover{color:var(--accent-color)}@media(max-width: 720px){nav.svelte-gpku4u.svelte-gpku4u{margin-left:0}.corner.social.svelte-gpku4u.svelte-gpku4u{display:none}}",
  map: null
};
var Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$result.css.add(css$6);
  $$unsubscribe_page();
  return `<header class="${"svelte-gpku4u"}"><div class="${"corner svelte-gpku4u"}"><div class="${"corner svelte-gpku4u"}"><a href="${"/"}" class="${"svelte-gpku4u"}"><img${add_attribute("src", home, 0)} alt="${"Home"}" class="${"svelte-gpku4u"}"></a></div></div>

	<nav class="${"svelte-gpku4u"}"><ul class="${"svelte-gpku4u"}"><li class="${["svelte-gpku4u", $page.path === "/about" ? "active" : ""].join(" ").trim()}"><a sveltekit:prefetch href="${"/about"}" class="${"svelte-gpku4u"}">About Me</a></li>
			<li class="${["svelte-gpku4u", $page.path === "/projects" ? "active" : ""].join(" ").trim()}"><a sveltekit:prefetch href="${"/projects"}" class="${"svelte-gpku4u"}">Projects</a></li></ul></nav>

	<div class="${"corner social svelte-gpku4u"}">${validate_component(Social, "Social").$$render($$result, {}, {}, {})}</div>
</header>`;
});
var css$5 = {
  code: "main.svelte-16jp10u.svelte-16jp10u{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem;width:100%;max-width:1500px;margin:0 auto;box-sizing:border-box}footer.svelte-16jp10u.svelte-16jp10u{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;opacity:0.1}footer.svelte-16jp10u a.svelte-16jp10u{font-weight:bold}@media(min-width: 480px){footer.svelte-16jp10u.svelte-16jp10u{padding:40px 0}}",
  map: null
};
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$5);
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

<main class="${"svelte-16jp10u"}">${slots.default ? slots.default({}) : ``}</main>

<footer class="${"svelte-16jp10u"}"><a href="${"https://icons8.com/icon/98083/3d"}" class="${"svelte-16jp10u"}">All icons by Icons8</a>
</footer>`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
function load({ error: error2, status }) {
  return { props: { error: error2, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error2 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  return `<h1>${escape(status)}</h1>

<pre>${escape(error2.message)}</pre>



${error2.frame ? `<pre>${escape(error2.frame)}</pre>` : ``}
${error2.stack ? `<pre>${escape(error2.stack)}</pre>` : ``}`;
});
var error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load
});
var css$4 = {
  code: "@import url('https://fonts.googleapis.com/css?family=Montserrat');section.svelte-v6dgnx{display:flex;flex-direction:column;justify-content:center;align-items:center;flex:1}.title.svelte-v6dgnx{background:url(https://media3.giphy.com/media/LUxTEh4UHV7DFgvVM3/giphy.gif?cid=790b7611cea78ada1c1b90d49f94344538cf0d30c74655da&rid=giphy.gif);background-size:contain;-webkit-background-clip:text;background-clip:text;color:transparent;text-transform:uppercase;font-size:6rem;line-height:1.1}@media(max-width: 720px){.title.svelte-v6dgnx{font-size:2rem}}",
  map: null
};
var prerender$2 = true;
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$4);
  return `${$$result.head += `${$$result.title = `<title>ToriaTova.Dev</title>`, ""}`, ""}

<section class="${"svelte-v6dgnx"}"><div><h1 class="${"title svelte-v6dgnx"}">Welcome to my portfolio!</h1></div>
</section>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  prerender: prerender$2
});
var css$3 = {
  code: ".card-wrapper.svelte-1izpd4p{margin:1rem;background-color:var(--pure-white);height:250px;width:300px;z-index:1;color:black;background-position:center;background-repeat:no-repeat;background-size:cover}.card-content.svelte-1izpd4p{background-color:#1b1922e7;color:bisque;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:4px;border:1px solid var(--accent-color);height:100%;width:100%}.action-buttons.svelte-1izpd4p{width:100%;display:flex;flex-wrap:wrap;flex-direction:row;justify-content:space-around}.card-wrapper{opacity:.9;transition:all .4s ;cursor:pointer;border-radius:4px}.card-wrapper:hover{opacity:1;transform:scale(1.07) }",
  map: null
};
var Project = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { project } = $$props;
  if ($$props.project === void 0 && $$bindings.project && project !== void 0)
    $$bindings.project(project);
  $$result.css.add(css$3);
  return `<div class="${"card-wrapper svelte-1izpd4p"}" style="${"background-image: url(" + escape(project.img) + ");"}"><div class="${["svelte-1izpd4p", ""].join(" ").trim()}">
		${``}</div></div>

 
`;
});
var css$2 = {
  code: ".loader.svelte-1k5cjbm{display:flex;flex-direction:column;height:300px;width:300px}img.svelte-1k5cjbm{border-radius:50%}",
  map: null
};
var Loader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$2);
  return `<div class="${"loader svelte-1k5cjbm"}"><img src="${"./rickLoader.jpg"}" alt="${"loader"}" class="${"svelte-1k5cjbm"}">
	<p>...hacking secret alien database</p></div>`;
});
var Deferred = class {
  constructor() {
    this.reject = () => {
    };
    this.resolve = () => {
    };
    this.promise = new Promise((resolve2, reject) => {
      this.resolve = resolve2;
      this.reject = reject;
    });
  }
  wrapCallback(callback) {
    return (error2, value) => {
      if (error2) {
        this.reject(error2);
      } else {
        this.resolve(value);
      }
      if (typeof callback === "function") {
        this.promise.catch(() => {
        });
        if (callback.length === 1) {
          callback(error2);
        } else {
          callback(error2, value);
        }
      }
    };
  }
};
function getUA() {
  if (typeof navigator !== "undefined" && typeof navigator["userAgent"] === "string") {
    return navigator["userAgent"];
  } else {
    return "";
  }
}
function isMobileCordova() {
  return typeof window !== "undefined" && !!(window["cordova"] || window["phonegap"] || window["PhoneGap"]) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA());
}
function isBrowserExtension() {
  const runtime = typeof chrome === "object" ? chrome.runtime : typeof browser === "object" ? browser.runtime : void 0;
  return typeof runtime === "object" && runtime.id !== void 0;
}
function isReactNative() {
  return typeof navigator === "object" && navigator["product"] === "ReactNative";
}
function isElectron() {
  return getUA().indexOf("Electron/") >= 0;
}
function isIE() {
  const ua2 = getUA();
  return ua2.indexOf("MSIE ") >= 0 || ua2.indexOf("Trident/") >= 0;
}
function isUWP() {
  return getUA().indexOf("MSAppHost/") >= 0;
}
var ERROR_NAME = "FirebaseError";
var FirebaseError = class extends Error {
  constructor(code, message, customData) {
    super(message);
    this.code = code;
    this.customData = customData;
    this.name = ERROR_NAME;
    Object.setPrototypeOf(this, FirebaseError.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorFactory.prototype.create);
    }
  }
};
var ErrorFactory = class {
  constructor(service, serviceName, errors) {
    this.service = service;
    this.serviceName = serviceName;
    this.errors = errors;
  }
  create(code, ...data) {
    const customData = data[0] || {};
    const fullCode = `${this.service}/${code}`;
    const template2 = this.errors[code];
    const message = template2 ? replaceTemplate(template2, customData) : "Error";
    const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
    const error2 = new FirebaseError(fullCode, fullMessage, customData);
    return error2;
  }
};
function replaceTemplate(template2, data) {
  return template2.replace(PATTERN, (_, key) => {
    const value = data[key];
    return value != null ? String(value) : `<${key}?>`;
  });
}
var PATTERN = /\{\$([^}]+)}/g;
function deepEqual(a, b) {
  if (a === b) {
    return true;
  }
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  for (const k2 of aKeys) {
    if (!bKeys.includes(k2)) {
      return false;
    }
    const aProp = a[k2];
    const bProp = b[k2];
    if (isObject(aProp) && isObject(bProp)) {
      if (!deepEqual(aProp, bProp)) {
        return false;
      }
    } else if (aProp !== bProp) {
      return false;
    }
  }
  for (const k2 of bKeys) {
    if (!aKeys.includes(k2)) {
      return false;
    }
  }
  return true;
}
function isObject(thing) {
  return thing !== null && typeof thing === "object";
}
function getModularInstance(service) {
  if (service && service._delegate) {
    return service._delegate;
  } else {
    return service;
  }
}
var Component = class {
  constructor(name2, instanceFactory, type) {
    this.name = name2;
    this.instanceFactory = instanceFactory;
    this.type = type;
    this.multipleInstances = false;
    this.serviceProps = {};
    this.instantiationMode = "LAZY";
    this.onInstanceCreated = null;
  }
  setInstantiationMode(mode) {
    this.instantiationMode = mode;
    return this;
  }
  setMultipleInstances(multipleInstances) {
    this.multipleInstances = multipleInstances;
    return this;
  }
  setServiceProps(props) {
    this.serviceProps = props;
    return this;
  }
  setInstanceCreatedCallback(callback) {
    this.onInstanceCreated = callback;
    return this;
  }
};
var DEFAULT_ENTRY_NAME$1 = "[DEFAULT]";
var Provider = class {
  constructor(name2, container) {
    this.name = name2;
    this.container = container;
    this.component = null;
    this.instances = new Map();
    this.instancesDeferred = new Map();
    this.instancesOptions = new Map();
    this.onInitCallbacks = new Map();
  }
  get(identifier) {
    const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
    if (!this.instancesDeferred.has(normalizedIdentifier)) {
      const deferred = new Deferred();
      this.instancesDeferred.set(normalizedIdentifier, deferred);
      if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
        try {
          const instance = this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier
          });
          if (instance) {
            deferred.resolve(instance);
          }
        } catch (e) {
        }
      }
    }
    return this.instancesDeferred.get(normalizedIdentifier).promise;
  }
  getImmediate(options2) {
    var _a22;
    const normalizedIdentifier = this.normalizeInstanceIdentifier(options2 === null || options2 === void 0 ? void 0 : options2.identifier);
    const optional = (_a22 = options2 === null || options2 === void 0 ? void 0 : options2.optional) !== null && _a22 !== void 0 ? _a22 : false;
    if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
      try {
        return this.getOrInitializeService({
          instanceIdentifier: normalizedIdentifier
        });
      } catch (e) {
        if (optional) {
          return null;
        } else {
          throw e;
        }
      }
    } else {
      if (optional) {
        return null;
      } else {
        throw Error(`Service ${this.name} is not available`);
      }
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(component) {
    if (component.name !== this.name) {
      throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
    }
    if (this.component) {
      throw Error(`Component for ${this.name} has already been provided`);
    }
    this.component = component;
    if (!this.shouldAutoInitialize()) {
      return;
    }
    if (isComponentEager(component)) {
      try {
        this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
      } catch (e) {
      }
    }
    for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
      const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
      try {
        const instance = this.getOrInitializeService({
          instanceIdentifier: normalizedIdentifier
        });
        instanceDeferred.resolve(instance);
      } catch (e) {
      }
    }
  }
  clearInstance(identifier = DEFAULT_ENTRY_NAME$1) {
    this.instancesDeferred.delete(identifier);
    this.instancesOptions.delete(identifier);
    this.instances.delete(identifier);
  }
  async delete() {
    const services = Array.from(this.instances.values());
    await Promise.all([
      ...services.filter((service) => "INTERNAL" in service).map((service) => service.INTERNAL.delete()),
      ...services.filter((service) => "_delete" in service).map((service) => service._delete())
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(identifier = DEFAULT_ENTRY_NAME$1) {
    return this.instances.has(identifier);
  }
  getOptions(identifier = DEFAULT_ENTRY_NAME$1) {
    return this.instancesOptions.get(identifier) || {};
  }
  initialize(opts = {}) {
    const { options: options2 = {} } = opts;
    const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
    if (this.isInitialized(normalizedIdentifier)) {
      throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
    }
    if (!this.isComponentSet()) {
      throw Error(`Component ${this.name} has not been registered yet`);
    }
    const instance = this.getOrInitializeService({
      instanceIdentifier: normalizedIdentifier,
      options: options2
    });
    for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
      const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
      if (normalizedIdentifier === normalizedDeferredIdentifier) {
        instanceDeferred.resolve(instance);
      }
    }
    return instance;
  }
  onInit(callback, identifier) {
    var _a22;
    const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
    const existingCallbacks = (_a22 = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a22 !== void 0 ? _a22 : new Set();
    existingCallbacks.add(callback);
    this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
    const existingInstance = this.instances.get(normalizedIdentifier);
    if (existingInstance) {
      callback(existingInstance, normalizedIdentifier);
    }
    return () => {
      existingCallbacks.delete(callback);
    };
  }
  invokeOnInitCallbacks(instance, identifier) {
    const callbacks = this.onInitCallbacks.get(identifier);
    if (!callbacks) {
      return;
    }
    for (const callback of callbacks) {
      try {
        callback(instance, identifier);
      } catch (_a22) {
      }
    }
  }
  getOrInitializeService({ instanceIdentifier, options: options2 = {} }) {
    let instance = this.instances.get(instanceIdentifier);
    if (!instance && this.component) {
      instance = this.component.instanceFactory(this.container, {
        instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
        options: options2
      });
      this.instances.set(instanceIdentifier, instance);
      this.instancesOptions.set(instanceIdentifier, options2);
      this.invokeOnInitCallbacks(instance, instanceIdentifier);
      if (this.component.onInstanceCreated) {
        try {
          this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
        } catch (_a22) {
        }
      }
    }
    return instance || null;
  }
  normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME$1) {
    if (this.component) {
      return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
    } else {
      return identifier;
    }
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== "EXPLICIT";
  }
};
function normalizeIdentifierForFactory(identifier) {
  return identifier === DEFAULT_ENTRY_NAME$1 ? void 0 : identifier;
}
function isComponentEager(component) {
  return component.instantiationMode === "EAGER";
}
var ComponentContainer = class {
  constructor(name2) {
    this.name = name2;
    this.providers = new Map();
  }
  addComponent(component) {
    const provider = this.getProvider(component.name);
    if (provider.isComponentSet()) {
      throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
    }
    provider.setComponent(component);
  }
  addOrOverwriteComponent(component) {
    const provider = this.getProvider(component.name);
    if (provider.isComponentSet()) {
      this.providers.delete(component.name);
    }
    this.addComponent(component);
  }
  getProvider(name2) {
    if (this.providers.has(name2)) {
      return this.providers.get(name2);
    }
    const provider = new Provider(name2, this);
    this.providers.set(name2, provider);
    return provider;
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
};
var LogLevel;
(function(LogLevel2) {
  LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
  LogLevel2[LogLevel2["VERBOSE"] = 1] = "VERBOSE";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
  LogLevel2[LogLevel2["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
var levelStringToEnum = {
  "debug": LogLevel.DEBUG,
  "verbose": LogLevel.VERBOSE,
  "info": LogLevel.INFO,
  "warn": LogLevel.WARN,
  "error": LogLevel.ERROR,
  "silent": LogLevel.SILENT
};
var defaultLogLevel = LogLevel.INFO;
var ConsoleMethod = {
  [LogLevel.DEBUG]: "log",
  [LogLevel.VERBOSE]: "log",
  [LogLevel.INFO]: "info",
  [LogLevel.WARN]: "warn",
  [LogLevel.ERROR]: "error"
};
var defaultLogHandler = (instance, logType, ...args) => {
  if (logType < instance.logLevel) {
    return;
  }
  const now = new Date().toISOString();
  const method = ConsoleMethod[logType];
  if (method) {
    console[method](`[${now}]  ${instance.name}:`, ...args);
  } else {
    throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
  }
};
var Logger = class {
  constructor(name2) {
    this.name = name2;
    this._logLevel = defaultLogLevel;
    this._logHandler = defaultLogHandler;
    this._userLogHandler = null;
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(val) {
    if (!(val in LogLevel)) {
      throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
    }
    this._logLevel = val;
  }
  setLogLevel(val) {
    this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(val) {
    if (typeof val !== "function") {
      throw new TypeError("Value assigned to `logHandler` must be a function");
    }
    this._logHandler = val;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(val) {
    this._userLogHandler = val;
  }
  debug(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
    this._logHandler(this, LogLevel.DEBUG, ...args);
  }
  log(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
    this._logHandler(this, LogLevel.VERBOSE, ...args);
  }
  info(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
    this._logHandler(this, LogLevel.INFO, ...args);
  }
  warn(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
    this._logHandler(this, LogLevel.WARN, ...args);
  }
  error(...args) {
    this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
    this._logHandler(this, LogLevel.ERROR, ...args);
  }
};
var PlatformLoggerServiceImpl = class {
  constructor(container) {
    this.container = container;
  }
  getPlatformInfoString() {
    const providers = this.container.getProviders();
    return providers.map((provider) => {
      if (isVersionServiceProvider(provider)) {
        const service = provider.getImmediate();
        return `${service.library}/${service.version}`;
      } else {
        return null;
      }
    }).filter((logString) => logString).join(" ");
  }
};
function isVersionServiceProvider(provider) {
  const component = provider.getComponent();
  return (component === null || component === void 0 ? void 0 : component.type) === "VERSION";
}
var name$o = "@firebase/app";
var version$1 = "0.7.6";
var logger = new Logger("@firebase/app");
var name$n = "@firebase/app-compat";
var name$m = "@firebase/analytics-compat";
var name$l = "@firebase/analytics";
var name$k = "@firebase/app-check-compat";
var name$j = "@firebase/app-check";
var name$i = "@firebase/auth";
var name$h = "@firebase/auth-compat";
var name$g = "@firebase/database";
var name$f = "@firebase/database-compat";
var name$e = "@firebase/functions";
var name$d = "@firebase/functions-compat";
var name$c = "@firebase/installations";
var name$b = "@firebase/installations-compat";
var name$a = "@firebase/messaging";
var name$9 = "@firebase/messaging-compat";
var name$8 = "@firebase/performance";
var name$7 = "@firebase/performance-compat";
var name$6 = "@firebase/remote-config";
var name$5 = "@firebase/remote-config-compat";
var name$4 = "@firebase/storage";
var name$3 = "@firebase/storage-compat";
var name$2 = "@firebase/firestore";
var name$1 = "@firebase/firestore-compat";
var name$p = "firebase";
var version$2 = "9.3.0";
var DEFAULT_ENTRY_NAME = "[DEFAULT]";
var PLATFORM_LOG_STRING = {
  [name$o]: "fire-core",
  [name$n]: "fire-core-compat",
  [name$l]: "fire-analytics",
  [name$m]: "fire-analytics-compat",
  [name$j]: "fire-app-check",
  [name$k]: "fire-app-check-compat",
  [name$i]: "fire-auth",
  [name$h]: "fire-auth-compat",
  [name$g]: "fire-rtdb",
  [name$f]: "fire-rtdb-compat",
  [name$e]: "fire-fn",
  [name$d]: "fire-fn-compat",
  [name$c]: "fire-iid",
  [name$b]: "fire-iid-compat",
  [name$a]: "fire-fcm",
  [name$9]: "fire-fcm-compat",
  [name$8]: "fire-perf",
  [name$7]: "fire-perf-compat",
  [name$6]: "fire-rc",
  [name$5]: "fire-rc-compat",
  [name$4]: "fire-gcs",
  [name$3]: "fire-gcs-compat",
  [name$2]: "fire-fst",
  [name$1]: "fire-fst-compat",
  "fire-js": "fire-js",
  [name$p]: "fire-js-all"
};
var _apps = new Map();
var _components = new Map();
function _addComponent(app2, component) {
  try {
    app2.container.addComponent(component);
  } catch (e) {
    logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app2.name}`, e);
  }
}
function _registerComponent(component) {
  const componentName = component.name;
  if (_components.has(componentName)) {
    logger.debug(`There were multiple attempts to register component ${componentName}.`);
    return false;
  }
  _components.set(componentName, component);
  for (const app2 of _apps.values()) {
    _addComponent(app2, component);
  }
  return true;
}
function _getProvider(app2, name2) {
  return app2.container.getProvider(name2);
}
var ERRORS = {
  ["no-app"]: "No Firebase App '{$appName}' has been created - call Firebase App.initializeApp()",
  ["bad-app-name"]: "Illegal App name: '{$appName}",
  ["duplicate-app"]: "Firebase App named '{$appName}' already exists with different options or config",
  ["app-deleted"]: "Firebase App named '{$appName}' already deleted",
  ["invalid-app-argument"]: "firebase.{$appName}() takes either no argument or a Firebase App instance.",
  ["invalid-log-argument"]: "First argument to `onLog` must be null or a function."
};
var ERROR_FACTORY = new ErrorFactory("app", "Firebase", ERRORS);
var FirebaseAppImpl = class {
  constructor(options2, config, container) {
    this._isDeleted = false;
    this._options = Object.assign({}, options2);
    this._config = Object.assign({}, config);
    this._name = config.name;
    this._automaticDataCollectionEnabled = config.automaticDataCollectionEnabled;
    this._container = container;
    this.container.addComponent(new Component("app", () => this, "PUBLIC"));
  }
  get automaticDataCollectionEnabled() {
    this.checkDestroyed();
    return this._automaticDataCollectionEnabled;
  }
  set automaticDataCollectionEnabled(val) {
    this.checkDestroyed();
    this._automaticDataCollectionEnabled = val;
  }
  get name() {
    this.checkDestroyed();
    return this._name;
  }
  get options() {
    this.checkDestroyed();
    return this._options;
  }
  get config() {
    this.checkDestroyed();
    return this._config;
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(val) {
    this._isDeleted = val;
  }
  checkDestroyed() {
    if (this.isDeleted) {
      throw ERROR_FACTORY.create("app-deleted", { appName: this._name });
    }
  }
};
var SDK_VERSION = version$2;
function initializeApp(options2, rawConfig = {}) {
  if (typeof rawConfig !== "object") {
    const name3 = rawConfig;
    rawConfig = { name: name3 };
  }
  const config = Object.assign({ name: DEFAULT_ENTRY_NAME, automaticDataCollectionEnabled: false }, rawConfig);
  const name2 = config.name;
  if (typeof name2 !== "string" || !name2) {
    throw ERROR_FACTORY.create("bad-app-name", {
      appName: String(name2)
    });
  }
  const existingApp = _apps.get(name2);
  if (existingApp) {
    if (deepEqual(options2, existingApp.options) && deepEqual(config, existingApp.config)) {
      return existingApp;
    } else {
      throw ERROR_FACTORY.create("duplicate-app", { appName: name2 });
    }
  }
  const container = new ComponentContainer(name2);
  for (const component of _components.values()) {
    container.addComponent(component);
  }
  const newApp = new FirebaseAppImpl(options2, config, container);
  _apps.set(name2, newApp);
  return newApp;
}
function getApp(name2 = DEFAULT_ENTRY_NAME) {
  const app2 = _apps.get(name2);
  if (!app2) {
    throw ERROR_FACTORY.create("no-app", { appName: name2 });
  }
  return app2;
}
function registerVersion(libraryKeyOrName, version2, variant) {
  var _a22;
  let library = (_a22 = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a22 !== void 0 ? _a22 : libraryKeyOrName;
  if (variant) {
    library += `-${variant}`;
  }
  const libraryMismatch = library.match(/\s|\//);
  const versionMismatch = version2.match(/\s|\//);
  if (libraryMismatch || versionMismatch) {
    const warning = [
      `Unable to register library "${library}" with version "${version2}":`
    ];
    if (libraryMismatch) {
      warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
    }
    if (libraryMismatch && versionMismatch) {
      warning.push("and");
    }
    if (versionMismatch) {
      warning.push(`version name "${version2}" contains illegal characters (whitespace or "/")`);
    }
    logger.warn(warning.join(" "));
    return;
  }
  _registerComponent(new Component(`${library}-version`, () => ({ library, version: version2 }), "VERSION"));
}
function registerCoreComponents(variant) {
  _registerComponent(new Component("platform-logger", (container) => new PlatformLoggerServiceImpl(container), "PRIVATE"));
  registerVersion(name$o, version$1, variant);
  registerVersion(name$o, version$1, "esm2017");
  registerVersion("fire-js", "");
}
registerCoreComponents("");
var name = "firebase";
var version = "9.3.0";
registerVersion(name, version, "app");
var commonjsGlobal2 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var k;
var goog = goog || {};
var l = commonjsGlobal2 || self;
function aa() {
}
function ba$1(a) {
  var b = typeof a;
  b = b != "object" ? b : a ? Array.isArray(a) ? "array" : b : "null";
  return b == "array" || b == "object" && typeof a.length == "number";
}
function p(a) {
  var b = typeof a;
  return b == "object" && a != null || b == "function";
}
function da$1(a) {
  return Object.prototype.hasOwnProperty.call(a, ea) && a[ea] || (a[ea] = ++fa$1);
}
var ea = "closure_uid_" + (1e9 * Math.random() >>> 0);
var fa$1 = 0;
function ha$1(a, b, c) {
  return a.call.apply(a.bind, arguments);
}
function ia$1(a, b, c) {
  if (!a)
    throw Error();
  if (2 < arguments.length) {
    var d = Array.prototype.slice.call(arguments, 2);
    return function() {
      var e = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(e, d);
      return a.apply(b, e);
    };
  }
  return function() {
    return a.apply(b, arguments);
  };
}
function q$1(a, b, c) {
  Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? q$1 = ha$1 : q$1 = ia$1;
  return q$1.apply(null, arguments);
}
function ja(a, b) {
  var c = Array.prototype.slice.call(arguments, 1);
  return function() {
    var d = c.slice();
    d.push.apply(d, arguments);
    return a.apply(this, d);
  };
}
function t(a, b) {
  function c() {
  }
  c.prototype = b.prototype;
  a.Z = b.prototype;
  a.prototype = new c();
  a.prototype.constructor = a;
  a.Vb = function(d, e, f) {
    for (var h = Array(arguments.length - 2), n = 2; n < arguments.length; n++)
      h[n - 2] = arguments[n];
    return b.prototype[e].apply(d, h);
  };
}
function v() {
  this.s = this.s;
  this.o = this.o;
}
var ka$1 = 0;
var la$1 = {};
v.prototype.s = false;
v.prototype.na = function() {
  if (!this.s && (this.s = true, this.M(), ka$1 != 0)) {
    var a = da$1(this);
    delete la$1[a];
  }
};
v.prototype.M = function() {
  if (this.o)
    for (; this.o.length; )
      this.o.shift()();
};
var ma$1 = Array.prototype.indexOf ? function(a, b) {
  return Array.prototype.indexOf.call(a, b, void 0);
} : function(a, b) {
  if (typeof a === "string")
    return typeof b !== "string" || b.length != 1 ? -1 : a.indexOf(b, 0);
  for (let c = 0; c < a.length; c++)
    if (c in a && a[c] === b)
      return c;
  return -1;
};
var na = Array.prototype.forEach ? function(a, b, c) {
  Array.prototype.forEach.call(a, b, c);
} : function(a, b, c) {
  const d = a.length, e = typeof a === "string" ? a.split("") : a;
  for (let f = 0; f < d; f++)
    f in e && b.call(c, e[f], f, a);
};
function oa(a) {
  a: {
    var b = pa$1;
    const c = a.length, d = typeof a === "string" ? a.split("") : a;
    for (let e = 0; e < c; e++)
      if (e in d && b.call(void 0, d[e], e, a)) {
        b = e;
        break a;
      }
    b = -1;
  }
  return 0 > b ? null : typeof a === "string" ? a.charAt(b) : a[b];
}
function qa(a) {
  return Array.prototype.concat.apply([], arguments);
}
function ra(a) {
  const b = a.length;
  if (0 < b) {
    const c = Array(b);
    for (let d = 0; d < b; d++)
      c[d] = a[d];
    return c;
  }
  return [];
}
function sa(a) {
  return /^[\s\xa0]*$/.test(a);
}
var ta = String.prototype.trim ? function(a) {
  return a.trim();
} : function(a) {
  return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1];
};
function w(a, b) {
  return a.indexOf(b) != -1;
}
function ua$1(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
var x$1;
a: {
  va = l.navigator;
  if (va) {
    wa = va.userAgent;
    if (wa) {
      x$1 = wa;
      break a;
    }
  }
  x$1 = "";
}
var va;
var wa;
function xa(a, b, c) {
  for (const d in a)
    b.call(c, a[d], d, a);
}
function ya(a) {
  const b = {};
  for (const c in a)
    b[c] = a[c];
  return b;
}
var za = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
function Aa$1(a, b) {
  let c, d;
  for (let e = 1; e < arguments.length; e++) {
    d = arguments[e];
    for (c in d)
      a[c] = d[c];
    for (let f = 0; f < za.length; f++)
      c = za[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c]);
  }
}
function Ca(a) {
  Ca[" "](a);
  return a;
}
Ca[" "] = aa;
function Fa$1(a) {
  var b = Ga;
  return Object.prototype.hasOwnProperty.call(b, 9) ? b[9] : b[9] = a(9);
}
var Ha = w(x$1, "Opera");
var y = w(x$1, "Trident") || w(x$1, "MSIE");
var Ia$1 = w(x$1, "Edge");
var Ja$1 = Ia$1 || y;
var Ka = w(x$1, "Gecko") && !(w(x$1.toLowerCase(), "webkit") && !w(x$1, "Edge")) && !(w(x$1, "Trident") || w(x$1, "MSIE")) && !w(x$1, "Edge");
var La = w(x$1.toLowerCase(), "webkit") && !w(x$1, "Edge");
function Ma$1() {
  var a = l.document;
  return a ? a.documentMode : void 0;
}
var Na;
a: {
  Oa$1 = "", Pa = function() {
    var a = x$1;
    if (Ka)
      return /rv:([^\);]+)(\)|;)/.exec(a);
    if (Ia$1)
      return /Edge\/([\d\.]+)/.exec(a);
    if (y)
      return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);
    if (La)
      return /WebKit\/(\S+)/.exec(a);
    if (Ha)
      return /(?:Version)[ \/]?(\S+)/.exec(a);
  }();
  Pa && (Oa$1 = Pa ? Pa[1] : "");
  if (y) {
    Qa = Ma$1();
    if (Qa != null && Qa > parseFloat(Oa$1)) {
      Na = String(Qa);
      break a;
    }
  }
  Na = Oa$1;
}
var Oa$1;
var Pa;
var Qa;
var Ga = {};
function Ra$1() {
  return Fa$1(function() {
    let a = 0;
    const b = ta(String(Na)).split("."), c = ta("9").split("."), d = Math.max(b.length, c.length);
    for (let h = 0; a == 0 && h < d; h++) {
      var e = b[h] || "", f = c[h] || "";
      do {
        e = /(\d*)(\D*)(.*)/.exec(e) || ["", "", "", ""];
        f = /(\d*)(\D*)(.*)/.exec(f) || ["", "", "", ""];
        if (e[0].length == 0 && f[0].length == 0)
          break;
        a = ua$1(e[1].length == 0 ? 0 : parseInt(e[1], 10), f[1].length == 0 ? 0 : parseInt(f[1], 10)) || ua$1(e[2].length == 0, f[2].length == 0) || ua$1(e[2], f[2]);
        e = e[3];
        f = f[3];
      } while (a == 0);
    }
    return 0 <= a;
  });
}
var Sa;
if (l.document && y) {
  Ta$1 = Ma$1();
  Sa = Ta$1 ? Ta$1 : parseInt(Na, 10) || void 0;
} else
  Sa = void 0;
var Ta$1;
var Ua = Sa;
var Va = function() {
  if (!l.addEventListener || !Object.defineProperty)
    return false;
  var a = false, b = Object.defineProperty({}, "passive", { get: function() {
    a = true;
  } });
  try {
    l.addEventListener("test", aa, b), l.removeEventListener("test", aa, b);
  } catch (c) {
  }
  return a;
}();
function z(a, b) {
  this.type = a;
  this.g = this.target = b;
  this.defaultPrevented = false;
}
z.prototype.h = function() {
  this.defaultPrevented = true;
};
function A(a, b) {
  z.call(this, a ? a.type : "");
  this.relatedTarget = this.g = this.target = null;
  this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0;
  this.key = "";
  this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = false;
  this.state = null;
  this.pointerId = 0;
  this.pointerType = "";
  this.i = null;
  if (a) {
    var c = this.type = a.type, d = a.changedTouches && a.changedTouches.length ? a.changedTouches[0] : null;
    this.target = a.target || a.srcElement;
    this.g = b;
    if (b = a.relatedTarget) {
      if (Ka) {
        a: {
          try {
            Ca(b.nodeName);
            var e = true;
            break a;
          } catch (f) {
          }
          e = false;
        }
        e || (b = null);
      }
    } else
      c == "mouseover" ? b = a.fromElement : c == "mouseout" && (b = a.toElement);
    this.relatedTarget = b;
    d ? (this.clientX = d.clientX !== void 0 ? d.clientX : d.pageX, this.clientY = d.clientY !== void 0 ? d.clientY : d.pageY, this.screenX = d.screenX || 0, this.screenY = d.screenY || 0) : (this.clientX = a.clientX !== void 0 ? a.clientX : a.pageX, this.clientY = a.clientY !== void 0 ? a.clientY : a.pageY, this.screenX = a.screenX || 0, this.screenY = a.screenY || 0);
    this.button = a.button;
    this.key = a.key || "";
    this.ctrlKey = a.ctrlKey;
    this.altKey = a.altKey;
    this.shiftKey = a.shiftKey;
    this.metaKey = a.metaKey;
    this.pointerId = a.pointerId || 0;
    this.pointerType = typeof a.pointerType === "string" ? a.pointerType : Wa[a.pointerType] || "";
    this.state = a.state;
    this.i = a;
    a.defaultPrevented && A.Z.h.call(this);
  }
}
t(A, z);
var Wa = { 2: "touch", 3: "pen", 4: "mouse" };
A.prototype.h = function() {
  A.Z.h.call(this);
  var a = this.i;
  a.preventDefault ? a.preventDefault() : a.returnValue = false;
};
var B$1 = "closure_listenable_" + (1e6 * Math.random() | 0);
var Xa$1 = 0;
function Ya(a, b, c, d, e) {
  this.listener = a;
  this.proxy = null;
  this.src = b;
  this.type = c;
  this.capture = !!d;
  this.ia = e;
  this.key = ++Xa$1;
  this.ca = this.fa = false;
}
function Za(a) {
  a.ca = true;
  a.listener = null;
  a.proxy = null;
  a.src = null;
  a.ia = null;
}
function $a(a) {
  this.src = a;
  this.g = {};
  this.h = 0;
}
$a.prototype.add = function(a, b, c, d, e) {
  var f = a.toString();
  a = this.g[f];
  a || (a = this.g[f] = [], this.h++);
  var h = ab(a, b, d, e);
  -1 < h ? (b = a[h], c || (b.fa = false)) : (b = new Ya(b, this.src, f, !!d, e), b.fa = c, a.push(b));
  return b;
};
function bb(a, b) {
  var c = b.type;
  if (c in a.g) {
    var d = a.g[c], e = ma$1(d, b), f;
    (f = 0 <= e) && Array.prototype.splice.call(d, e, 1);
    f && (Za(b), a.g[c].length == 0 && (delete a.g[c], a.h--));
  }
}
function ab(a, b, c, d) {
  for (var e = 0; e < a.length; ++e) {
    var f = a[e];
    if (!f.ca && f.listener == b && f.capture == !!c && f.ia == d)
      return e;
  }
  return -1;
}
var cb = "closure_lm_" + (1e6 * Math.random() | 0);
var db = {};
function fb(a, b, c, d, e) {
  if (d && d.once)
    return gb(a, b, c, d, e);
  if (Array.isArray(b)) {
    for (var f = 0; f < b.length; f++)
      fb(a, b[f], c, d, e);
    return null;
  }
  c = hb(c);
  return a && a[B$1] ? a.N(b, c, p(d) ? !!d.capture : !!d, e) : ib(a, b, c, false, d, e);
}
function ib(a, b, c, d, e, f) {
  if (!b)
    throw Error("Invalid event type");
  var h = p(e) ? !!e.capture : !!e, n = jb(a);
  n || (a[cb] = n = new $a(a));
  c = n.add(b, c, d, h, f);
  if (c.proxy)
    return c;
  d = kb();
  c.proxy = d;
  d.src = a;
  d.listener = c;
  if (a.addEventListener)
    Va || (e = h), e === void 0 && (e = false), a.addEventListener(b.toString(), d, e);
  else if (a.attachEvent)
    a.attachEvent(lb(b.toString()), d);
  else if (a.addListener && a.removeListener)
    a.addListener(d);
  else
    throw Error("addEventListener and attachEvent are unavailable.");
  return c;
}
function kb() {
  function a(c) {
    return b.call(a.src, a.listener, c);
  }
  var b = mb;
  return a;
}
function gb(a, b, c, d, e) {
  if (Array.isArray(b)) {
    for (var f = 0; f < b.length; f++)
      gb(a, b[f], c, d, e);
    return null;
  }
  c = hb(c);
  return a && a[B$1] ? a.O(b, c, p(d) ? !!d.capture : !!d, e) : ib(a, b, c, true, d, e);
}
function nb(a, b, c, d, e) {
  if (Array.isArray(b))
    for (var f = 0; f < b.length; f++)
      nb(a, b[f], c, d, e);
  else
    (d = p(d) ? !!d.capture : !!d, c = hb(c), a && a[B$1]) ? (a = a.i, b = String(b).toString(), b in a.g && (f = a.g[b], c = ab(f, c, d, e), -1 < c && (Za(f[c]), Array.prototype.splice.call(f, c, 1), f.length == 0 && (delete a.g[b], a.h--)))) : a && (a = jb(a)) && (b = a.g[b.toString()], a = -1, b && (a = ab(b, c, d, e)), (c = -1 < a ? b[a] : null) && ob(c));
}
function ob(a) {
  if (typeof a !== "number" && a && !a.ca) {
    var b = a.src;
    if (b && b[B$1])
      bb(b.i, a);
    else {
      var c = a.type, d = a.proxy;
      b.removeEventListener ? b.removeEventListener(c, d, a.capture) : b.detachEvent ? b.detachEvent(lb(c), d) : b.addListener && b.removeListener && b.removeListener(d);
      (c = jb(b)) ? (bb(c, a), c.h == 0 && (c.src = null, b[cb] = null)) : Za(a);
    }
  }
}
function lb(a) {
  return a in db ? db[a] : db[a] = "on" + a;
}
function mb(a, b) {
  if (a.ca)
    a = true;
  else {
    b = new A(b, this);
    var c = a.listener, d = a.ia || a.src;
    a.fa && ob(a);
    a = c.call(d, b);
  }
  return a;
}
function jb(a) {
  a = a[cb];
  return a instanceof $a ? a : null;
}
var pb = "__closure_events_fn_" + (1e9 * Math.random() >>> 0);
function hb(a) {
  if (typeof a === "function")
    return a;
  a[pb] || (a[pb] = function(b) {
    return a.handleEvent(b);
  });
  return a[pb];
}
function C$1() {
  v.call(this);
  this.i = new $a(this);
  this.P = this;
  this.I = null;
}
t(C$1, v);
C$1.prototype[B$1] = true;
C$1.prototype.removeEventListener = function(a, b, c, d) {
  nb(this, a, b, c, d);
};
function D$1(a, b) {
  var c, d = a.I;
  if (d)
    for (c = []; d; d = d.I)
      c.push(d);
  a = a.P;
  d = b.type || b;
  if (typeof b === "string")
    b = new z(b, a);
  else if (b instanceof z)
    b.target = b.target || a;
  else {
    var e = b;
    b = new z(d, a);
    Aa$1(b, e);
  }
  e = true;
  if (c)
    for (var f = c.length - 1; 0 <= f; f--) {
      var h = b.g = c[f];
      e = qb(h, d, true, b) && e;
    }
  h = b.g = a;
  e = qb(h, d, true, b) && e;
  e = qb(h, d, false, b) && e;
  if (c)
    for (f = 0; f < c.length; f++)
      h = b.g = c[f], e = qb(h, d, false, b) && e;
}
C$1.prototype.M = function() {
  C$1.Z.M.call(this);
  if (this.i) {
    var a = this.i, c;
    for (c in a.g) {
      for (var d = a.g[c], e = 0; e < d.length; e++)
        Za(d[e]);
      delete a.g[c];
      a.h--;
    }
  }
  this.I = null;
};
C$1.prototype.N = function(a, b, c, d) {
  return this.i.add(String(a), b, false, c, d);
};
C$1.prototype.O = function(a, b, c, d) {
  return this.i.add(String(a), b, true, c, d);
};
function qb(a, b, c, d) {
  b = a.i.g[String(b)];
  if (!b)
    return true;
  b = b.concat();
  for (var e = true, f = 0; f < b.length; ++f) {
    var h = b[f];
    if (h && !h.ca && h.capture == c) {
      var n = h.listener, u = h.ia || h.src;
      h.fa && bb(a.i, h);
      e = n.call(u, d) !== false && e;
    }
  }
  return e && !d.defaultPrevented;
}
var rb = l.JSON.stringify;
function sb() {
  var a = tb;
  let b = null;
  a.g && (b = a.g, a.g = a.g.next, a.g || (a.h = null), b.next = null);
  return b;
}
var ub = class {
  constructor() {
    this.h = this.g = null;
  }
  add(a, b) {
    const c = vb.get();
    c.set(a, b);
    this.h ? this.h.next = c : this.g = c;
    this.h = c;
  }
};
var vb = new class {
  constructor(a, b) {
    this.i = a;
    this.j = b;
    this.h = 0;
    this.g = null;
  }
  get() {
    let a;
    0 < this.h ? (this.h--, a = this.g, this.g = a.next, a.next = null) : a = this.i();
    return a;
  }
}(() => new wb(), (a) => a.reset());
var wb = class {
  constructor() {
    this.next = this.g = this.h = null;
  }
  set(a, b) {
    this.h = a;
    this.g = b;
    this.next = null;
  }
  reset() {
    this.next = this.g = this.h = null;
  }
};
function yb(a) {
  l.setTimeout(() => {
    throw a;
  }, 0);
}
function zb(a, b) {
  Ab || Bb();
  Cb || (Ab(), Cb = true);
  tb.add(a, b);
}
var Ab;
function Bb() {
  var a = l.Promise.resolve(void 0);
  Ab = function() {
    a.then(Db);
  };
}
var Cb = false;
var tb = new ub();
function Db() {
  for (var a; a = sb(); ) {
    try {
      a.h.call(a.g);
    } catch (c) {
      yb(c);
    }
    var b = vb;
    b.j(a);
    100 > b.h && (b.h++, a.next = b.g, b.g = a);
  }
  Cb = false;
}
function Eb(a, b) {
  C$1.call(this);
  this.h = a || 1;
  this.g = b || l;
  this.j = q$1(this.kb, this);
  this.l = Date.now();
}
t(Eb, C$1);
k = Eb.prototype;
k.da = false;
k.S = null;
k.kb = function() {
  if (this.da) {
    var a = Date.now() - this.l;
    0 < a && a < 0.8 * this.h ? this.S = this.g.setTimeout(this.j, this.h - a) : (this.S && (this.g.clearTimeout(this.S), this.S = null), D$1(this, "tick"), this.da && (Fb(this), this.start()));
  }
};
k.start = function() {
  this.da = true;
  this.S || (this.S = this.g.setTimeout(this.j, this.h), this.l = Date.now());
};
function Fb(a) {
  a.da = false;
  a.S && (a.g.clearTimeout(a.S), a.S = null);
}
k.M = function() {
  Eb.Z.M.call(this);
  Fb(this);
  delete this.g;
};
function Gb(a, b, c) {
  if (typeof a === "function")
    c && (a = q$1(a, c));
  else if (a && typeof a.handleEvent == "function")
    a = q$1(a.handleEvent, a);
  else
    throw Error("Invalid listener argument");
  return 2147483647 < Number(b) ? -1 : l.setTimeout(a, b || 0);
}
function Hb(a) {
  a.g = Gb(() => {
    a.g = null;
    a.i && (a.i = false, Hb(a));
  }, a.j);
  const b = a.h;
  a.h = null;
  a.m.apply(null, b);
}
var Ib = class extends v {
  constructor(a, b) {
    super();
    this.m = a;
    this.j = b;
    this.h = null;
    this.i = false;
    this.g = null;
  }
  l(a) {
    this.h = arguments;
    this.g ? this.i = true : Hb(this);
  }
  M() {
    super.M();
    this.g && (l.clearTimeout(this.g), this.g = null, this.i = false, this.h = null);
  }
};
function E(a) {
  v.call(this);
  this.h = a;
  this.g = {};
}
t(E, v);
var Jb = [];
function Kb(a, b, c, d) {
  Array.isArray(c) || (c && (Jb[0] = c.toString()), c = Jb);
  for (var e = 0; e < c.length; e++) {
    var f = fb(b, c[e], d || a.handleEvent, false, a.h || a);
    if (!f)
      break;
    a.g[f.key] = f;
  }
}
function Lb(a) {
  xa(a.g, function(b, c) {
    this.g.hasOwnProperty(c) && ob(b);
  }, a);
  a.g = {};
}
E.prototype.M = function() {
  E.Z.M.call(this);
  Lb(this);
};
E.prototype.handleEvent = function() {
  throw Error("EventHandler.handleEvent not implemented");
};
function Mb() {
  this.g = true;
}
Mb.prototype.Aa = function() {
  this.g = false;
};
function Nb(a, b, c, d, e, f) {
  a.info(function() {
    if (a.g)
      if (f) {
        var h = "";
        for (var n = f.split("&"), u = 0; u < n.length; u++) {
          var m = n[u].split("=");
          if (1 < m.length) {
            var r = m[0];
            m = m[1];
            var G2 = r.split("_");
            h = 2 <= G2.length && G2[1] == "type" ? h + (r + "=" + m + "&") : h + (r + "=redacted&");
          }
        }
      } else
        h = null;
    else
      h = f;
    return "XMLHTTP REQ (" + d + ") [attempt " + e + "]: " + b + "\n" + c + "\n" + h;
  });
}
function Ob(a, b, c, d, e, f, h) {
  a.info(function() {
    return "XMLHTTP RESP (" + d + ") [ attempt " + e + "]: " + b + "\n" + c + "\n" + f + " " + h;
  });
}
function F$1(a, b, c, d) {
  a.info(function() {
    return "XMLHTTP TEXT (" + b + "): " + Pb(a, c) + (d ? " " + d : "");
  });
}
function Qb(a, b) {
  a.info(function() {
    return "TIMEOUT: " + b;
  });
}
Mb.prototype.info = function() {
};
function Pb(a, b) {
  if (!a.g)
    return b;
  if (!b)
    return null;
  try {
    var c = JSON.parse(b);
    if (c) {
      for (a = 0; a < c.length; a++)
        if (Array.isArray(c[a])) {
          var d = c[a];
          if (!(2 > d.length)) {
            var e = d[1];
            if (Array.isArray(e) && !(1 > e.length)) {
              var f = e[0];
              if (f != "noop" && f != "stop" && f != "close")
                for (var h = 1; h < e.length; h++)
                  e[h] = "";
            }
          }
        }
    }
    return rb(c);
  } catch (n) {
    return b;
  }
}
var H$1 = {};
var Rb = null;
function Sb() {
  return Rb = Rb || new C$1();
}
H$1.Ma = "serverreachability";
function Tb(a) {
  z.call(this, H$1.Ma, a);
}
t(Tb, z);
function I(a) {
  const b = Sb();
  D$1(b, new Tb(b, a));
}
H$1.STAT_EVENT = "statevent";
function Ub(a, b) {
  z.call(this, H$1.STAT_EVENT, a);
  this.stat = b;
}
t(Ub, z);
function J$1(a) {
  const b = Sb();
  D$1(b, new Ub(b, a));
}
H$1.Na = "timingevent";
function Vb(a, b) {
  z.call(this, H$1.Na, a);
  this.size = b;
}
t(Vb, z);
function K$1(a, b) {
  if (typeof a !== "function")
    throw Error("Fn must not be null and must be a function");
  return l.setTimeout(function() {
    a();
  }, b);
}
var Wb = { NO_ERROR: 0, lb: 1, yb: 2, xb: 3, sb: 4, wb: 5, zb: 6, Ja: 7, TIMEOUT: 8, Cb: 9 };
var Xb = { qb: "complete", Mb: "success", Ka: "error", Ja: "abort", Eb: "ready", Fb: "readystatechange", TIMEOUT: "timeout", Ab: "incrementaldata", Db: "progress", tb: "downloadprogress", Ub: "uploadprogress" };
function Yb() {
}
Yb.prototype.h = null;
function Zb(a) {
  return a.h || (a.h = a.i());
}
function $b() {
}
var L$1 = { OPEN: "a", pb: "b", Ka: "c", Bb: "d" };
function ac$1() {
  z.call(this, "d");
}
t(ac$1, z);
function bc() {
  z.call(this, "c");
}
t(bc, z);
var cc$1;
function dc() {
}
t(dc, Yb);
dc.prototype.g = function() {
  return new XMLHttpRequest();
};
dc.prototype.i = function() {
  return {};
};
cc$1 = new dc();
function M$1(a, b, c, d) {
  this.l = a;
  this.j = b;
  this.m = c;
  this.X = d || 1;
  this.V = new E(this);
  this.P = ec$1;
  a = Ja$1 ? 125 : void 0;
  this.W = new Eb(a);
  this.H = null;
  this.i = false;
  this.s = this.A = this.v = this.K = this.F = this.Y = this.B = null;
  this.D = [];
  this.g = null;
  this.C = 0;
  this.o = this.u = null;
  this.N = -1;
  this.I = false;
  this.O = 0;
  this.L = null;
  this.aa = this.J = this.$ = this.U = false;
  this.h = new fc();
}
function fc() {
  this.i = null;
  this.g = "";
  this.h = false;
}
var ec$1 = 45e3;
var gc$1 = {};
var hc = {};
k = M$1.prototype;
k.setTimeout = function(a) {
  this.P = a;
};
function ic$1(a, b, c) {
  a.K = 1;
  a.v = jc$1(N$1(b));
  a.s = c;
  a.U = true;
  kc$1(a, null);
}
function kc$1(a, b) {
  a.F = Date.now();
  lc(a);
  a.A = N$1(a.v);
  var c = a.A, d = a.X;
  Array.isArray(d) || (d = [String(d)]);
  mc$1(c.h, "t", d);
  a.C = 0;
  c = a.l.H;
  a.h = new fc();
  a.g = nc$1(a.l, c ? b : null, !a.s);
  0 < a.O && (a.L = new Ib(q$1(a.Ia, a, a.g), a.O));
  Kb(a.V, a.g, "readystatechange", a.gb);
  b = a.H ? ya(a.H) : {};
  a.s ? (a.u || (a.u = "POST"), b["Content-Type"] = "application/x-www-form-urlencoded", a.g.ea(a.A, a.u, a.s, b)) : (a.u = "GET", a.g.ea(a.A, a.u, null, b));
  I(1);
  Nb(a.j, a.u, a.A, a.m, a.X, a.s);
}
k.gb = function(a) {
  a = a.target;
  const b = this.L;
  b && O$1(a) == 3 ? b.l() : this.Ia(a);
};
k.Ia = function(a) {
  try {
    if (a == this.g)
      a: {
        const r = O$1(this.g);
        var b = this.g.Da();
        const G2 = this.g.ba();
        if (!(3 > r) && (r != 3 || Ja$1 || this.g && (this.h.h || this.g.ga() || oc$1(this.g)))) {
          this.I || r != 4 || b == 7 || (b == 8 || 0 >= G2 ? I(3) : I(2));
          pc$1(this);
          var c = this.g.ba();
          this.N = c;
          b:
            if (qc(this)) {
              var d = oc$1(this.g);
              a = "";
              var e = d.length, f = O$1(this.g) == 4;
              if (!this.h.i) {
                if (typeof TextDecoder === "undefined") {
                  P(this);
                  rc(this);
                  var h = "";
                  break b;
                }
                this.h.i = new l.TextDecoder();
              }
              for (b = 0; b < e; b++)
                this.h.h = true, a += this.h.i.decode(d[b], { stream: f && b == e - 1 });
              d.splice(0, e);
              this.h.g += a;
              this.C = 0;
              h = this.h.g;
            } else
              h = this.g.ga();
          this.i = c == 200;
          Ob(this.j, this.u, this.A, this.m, this.X, r, c);
          if (this.i) {
            if (this.$ && !this.J) {
              b: {
                if (this.g) {
                  var n, u = this.g;
                  if ((n = u.g ? u.g.getResponseHeader("X-HTTP-Initial-Response") : null) && !sa(n)) {
                    var m = n;
                    break b;
                  }
                }
                m = null;
              }
              if (c = m)
                F$1(this.j, this.m, c, "Initial handshake response via X-HTTP-Initial-Response"), this.J = true, sc$1(this, c);
              else {
                this.i = false;
                this.o = 3;
                J$1(12);
                P(this);
                rc(this);
                break a;
              }
            }
            this.U ? (tc$1(this, r, h), Ja$1 && this.i && r == 3 && (Kb(this.V, this.W, "tick", this.fb), this.W.start())) : (F$1(this.j, this.m, h, null), sc$1(this, h));
            r == 4 && P(this);
            this.i && !this.I && (r == 4 ? uc(this.l, this) : (this.i = false, lc(this)));
          } else
            c == 400 && 0 < h.indexOf("Unknown SID") ? (this.o = 3, J$1(12)) : (this.o = 0, J$1(13)), P(this), rc(this);
        }
      }
  } catch (r) {
  } finally {
  }
};
function qc(a) {
  return a.g ? a.u == "GET" && a.K != 2 && a.l.Ba : false;
}
function tc$1(a, b, c) {
  let d = true, e;
  for (; !a.I && a.C < c.length; )
    if (e = vc(a, c), e == hc) {
      b == 4 && (a.o = 4, J$1(14), d = false);
      F$1(a.j, a.m, null, "[Incomplete Response]");
      break;
    } else if (e == gc$1) {
      a.o = 4;
      J$1(15);
      F$1(a.j, a.m, c, "[Invalid Chunk]");
      d = false;
      break;
    } else
      F$1(a.j, a.m, e, null), sc$1(a, e);
  qc(a) && e != hc && e != gc$1 && (a.h.g = "", a.C = 0);
  b != 4 || c.length != 0 || a.h.h || (a.o = 1, J$1(16), d = false);
  a.i = a.i && d;
  d ? 0 < c.length && !a.aa && (a.aa = true, b = a.l, b.g == a && b.$ && !b.L && (b.h.info("Great, no buffering proxy detected. Bytes received: " + c.length), wc$1(b), b.L = true, J$1(11))) : (F$1(a.j, a.m, c, "[Invalid Chunked Response]"), P(a), rc(a));
}
k.fb = function() {
  if (this.g) {
    var a = O$1(this.g), b = this.g.ga();
    this.C < b.length && (pc$1(this), tc$1(this, a, b), this.i && a != 4 && lc(this));
  }
};
function vc(a, b) {
  var c = a.C, d = b.indexOf("\n", c);
  if (d == -1)
    return hc;
  c = Number(b.substring(c, d));
  if (isNaN(c))
    return gc$1;
  d += 1;
  if (d + c > b.length)
    return hc;
  b = b.substr(d, c);
  a.C = d + c;
  return b;
}
k.cancel = function() {
  this.I = true;
  P(this);
};
function lc(a) {
  a.Y = Date.now() + a.P;
  xc(a, a.P);
}
function xc(a, b) {
  if (a.B != null)
    throw Error("WatchDog timer not null");
  a.B = K$1(q$1(a.eb, a), b);
}
function pc$1(a) {
  a.B && (l.clearTimeout(a.B), a.B = null);
}
k.eb = function() {
  this.B = null;
  const a = Date.now();
  0 <= a - this.Y ? (Qb(this.j, this.A), this.K != 2 && (I(3), J$1(17)), P(this), this.o = 2, rc(this)) : xc(this, this.Y - a);
};
function rc(a) {
  a.l.G == 0 || a.I || uc(a.l, a);
}
function P(a) {
  pc$1(a);
  var b = a.L;
  b && typeof b.na == "function" && b.na();
  a.L = null;
  Fb(a.W);
  Lb(a.V);
  a.g && (b = a.g, a.g = null, b.abort(), b.na());
}
function sc$1(a, b) {
  try {
    var c = a.l;
    if (c.G != 0 && (c.g == a || yc$1(c.i, a))) {
      if (c.I = a.N, !a.J && yc$1(c.i, a) && c.G == 3) {
        try {
          var d = c.Ca.g.parse(b);
        } catch (m) {
          d = null;
        }
        if (Array.isArray(d) && d.length == 3) {
          var e = d;
          if (e[0] == 0)
            a: {
              if (!c.u) {
                if (c.g)
                  if (c.g.F + 3e3 < a.F)
                    zc(c), Ac(c);
                  else
                    break a;
                Bc(c);
                J$1(18);
              }
            }
          else
            c.ta = e[1], 0 < c.ta - c.U && 37500 > e[2] && c.N && c.A == 0 && !c.v && (c.v = K$1(q$1(c.ab, c), 6e3));
          if (1 >= Cc$1(c.i) && c.ka) {
            try {
              c.ka();
            } catch (m) {
            }
            c.ka = void 0;
          }
        } else
          Q$1(c, 11);
      } else if ((a.J || c.g == a) && zc(c), !sa(b))
        for (e = c.Ca.g.parse(b), b = 0; b < e.length; b++) {
          let m = e[b];
          c.U = m[0];
          m = m[1];
          if (c.G == 2)
            if (m[0] == "c") {
              c.J = m[1];
              c.la = m[2];
              const r = m[3];
              r != null && (c.ma = r, c.h.info("VER=" + c.ma));
              const G2 = m[4];
              G2 != null && (c.za = G2, c.h.info("SVER=" + c.za));
              const Da2 = m[5];
              Da2 != null && typeof Da2 === "number" && 0 < Da2 && (d = 1.5 * Da2, c.K = d, c.h.info("backChannelRequestTimeoutMs_=" + d));
              d = c;
              const ca = a.g;
              if (ca) {
                const Ea = ca.g ? ca.g.getResponseHeader("X-Client-Wire-Protocol") : null;
                if (Ea) {
                  var f = d.i;
                  !f.g && (w(Ea, "spdy") || w(Ea, "quic") || w(Ea, "h2")) && (f.j = f.l, f.g = new Set(), f.h && (Dc(f, f.h), f.h = null));
                }
                if (d.D) {
                  const xb = ca.g ? ca.g.getResponseHeader("X-HTTP-Session-Id") : null;
                  xb && (d.sa = xb, R(d.F, d.D, xb));
                }
              }
              c.G = 3;
              c.j && c.j.xa();
              c.$ && (c.O = Date.now() - a.F, c.h.info("Handshake RTT: " + c.O + "ms"));
              d = c;
              var h = a;
              d.oa = Ec$1(d, d.H ? d.la : null, d.W);
              if (h.J) {
                Fc$1(d.i, h);
                var n = h, u = d.K;
                u && n.setTimeout(u);
                n.B && (pc$1(n), lc(n));
                d.g = h;
              } else
                Gc$1(d);
              0 < c.l.length && Hc(c);
            } else
              m[0] != "stop" && m[0] != "close" || Q$1(c, 7);
          else
            c.G == 3 && (m[0] == "stop" || m[0] == "close" ? m[0] == "stop" ? Q$1(c, 7) : Ic(c) : m[0] != "noop" && c.j && c.j.wa(m), c.A = 0);
        }
    }
    I(4);
  } catch (m) {
  }
}
function Jc(a) {
  if (a.R && typeof a.R == "function")
    return a.R();
  if (typeof a === "string")
    return a.split("");
  if (ba$1(a)) {
    for (var b = [], c = a.length, d = 0; d < c; d++)
      b.push(a[d]);
    return b;
  }
  b = [];
  c = 0;
  for (d in a)
    b[c++] = a[d];
  return b;
}
function Kc$1(a, b) {
  if (a.forEach && typeof a.forEach == "function")
    a.forEach(b, void 0);
  else if (ba$1(a) || typeof a === "string")
    na(a, b, void 0);
  else {
    if (a.T && typeof a.T == "function")
      var c = a.T();
    else if (a.R && typeof a.R == "function")
      c = void 0;
    else if (ba$1(a) || typeof a === "string") {
      c = [];
      for (var d = a.length, e = 0; e < d; e++)
        c.push(e);
    } else
      for (e in c = [], d = 0, a)
        c[d++] = e;
    d = Jc(a);
    e = d.length;
    for (var f = 0; f < e; f++)
      b.call(void 0, d[f], c && c[f], a);
  }
}
function S$1(a, b) {
  this.h = {};
  this.g = [];
  this.i = 0;
  var c = arguments.length;
  if (1 < c) {
    if (c % 2)
      throw Error("Uneven number of arguments");
    for (var d = 0; d < c; d += 2)
      this.set(arguments[d], arguments[d + 1]);
  } else if (a)
    if (a instanceof S$1)
      for (c = a.T(), d = 0; d < c.length; d++)
        this.set(c[d], a.get(c[d]));
    else
      for (d in a)
        this.set(d, a[d]);
}
k = S$1.prototype;
k.R = function() {
  Lc$1(this);
  for (var a = [], b = 0; b < this.g.length; b++)
    a.push(this.h[this.g[b]]);
  return a;
};
k.T = function() {
  Lc$1(this);
  return this.g.concat();
};
function Lc$1(a) {
  if (a.i != a.g.length) {
    for (var b = 0, c = 0; b < a.g.length; ) {
      var d = a.g[b];
      T(a.h, d) && (a.g[c++] = d);
      b++;
    }
    a.g.length = c;
  }
  if (a.i != a.g.length) {
    var e = {};
    for (c = b = 0; b < a.g.length; )
      d = a.g[b], T(e, d) || (a.g[c++] = d, e[d] = 1), b++;
    a.g.length = c;
  }
}
k.get = function(a, b) {
  return T(this.h, a) ? this.h[a] : b;
};
k.set = function(a, b) {
  T(this.h, a) || (this.i++, this.g.push(a));
  this.h[a] = b;
};
k.forEach = function(a, b) {
  for (var c = this.T(), d = 0; d < c.length; d++) {
    var e = c[d], f = this.get(e);
    a.call(b, f, e, this);
  }
};
function T(a, b) {
  return Object.prototype.hasOwnProperty.call(a, b);
}
var Mc = /^(?:([^:/?#.]+):)?(?:\/\/(?:([^\\/?#]*)@)?([^\\/?#]*?)(?::([0-9]+))?(?=[\\/?#]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;
function Nc(a, b) {
  if (a) {
    a = a.split("&");
    for (var c = 0; c < a.length; c++) {
      var d = a[c].indexOf("="), e = null;
      if (0 <= d) {
        var f = a[c].substring(0, d);
        e = a[c].substring(d + 1);
      } else
        f = a[c];
      b(f, e ? decodeURIComponent(e.replace(/\+/g, " ")) : "");
    }
  }
}
function U(a, b) {
  this.i = this.s = this.j = "";
  this.m = null;
  this.o = this.l = "";
  this.g = false;
  if (a instanceof U) {
    this.g = b !== void 0 ? b : a.g;
    Oc(this, a.j);
    this.s = a.s;
    Pc(this, a.i);
    Qc$1(this, a.m);
    this.l = a.l;
    b = a.h;
    var c = new Rc();
    c.i = b.i;
    b.g && (c.g = new S$1(b.g), c.h = b.h);
    Sc(this, c);
    this.o = a.o;
  } else
    a && (c = String(a).match(Mc)) ? (this.g = !!b, Oc(this, c[1] || "", true), this.s = Tc$1(c[2] || ""), Pc(this, c[3] || "", true), Qc$1(this, c[4]), this.l = Tc$1(c[5] || "", true), Sc(this, c[6] || "", true), this.o = Tc$1(c[7] || "")) : (this.g = !!b, this.h = new Rc(null, this.g));
}
U.prototype.toString = function() {
  var a = [], b = this.j;
  b && a.push(Uc(b, Vc, true), ":");
  var c = this.i;
  if (c || b == "file")
    a.push("//"), (b = this.s) && a.push(Uc(b, Vc, true), "@"), a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), c = this.m, c != null && a.push(":", String(c));
  if (c = this.l)
    this.i && c.charAt(0) != "/" && a.push("/"), a.push(Uc(c, c.charAt(0) == "/" ? Wc$1 : Xc$1, true));
  (c = this.h.toString()) && a.push("?", c);
  (c = this.o) && a.push("#", Uc(c, Yc));
  return a.join("");
};
function N$1(a) {
  return new U(a);
}
function Oc(a, b, c) {
  a.j = c ? Tc$1(b, true) : b;
  a.j && (a.j = a.j.replace(/:$/, ""));
}
function Pc(a, b, c) {
  a.i = c ? Tc$1(b, true) : b;
}
function Qc$1(a, b) {
  if (b) {
    b = Number(b);
    if (isNaN(b) || 0 > b)
      throw Error("Bad port number " + b);
    a.m = b;
  } else
    a.m = null;
}
function Sc(a, b, c) {
  b instanceof Rc ? (a.h = b, Zc(a.h, a.g)) : (c || (b = Uc(b, $c)), a.h = new Rc(b, a.g));
}
function R(a, b, c) {
  a.h.set(b, c);
}
function jc$1(a) {
  R(a, "zx", Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ Date.now()).toString(36));
  return a;
}
function ad(a) {
  return a instanceof U ? N$1(a) : new U(a, void 0);
}
function bd(a, b, c, d) {
  var e = new U(null, void 0);
  a && Oc(e, a);
  b && Pc(e, b);
  c && Qc$1(e, c);
  d && (e.l = d);
  return e;
}
function Tc$1(a, b) {
  return a ? b ? decodeURI(a.replace(/%25/g, "%2525")) : decodeURIComponent(a) : "";
}
function Uc(a, b, c) {
  return typeof a === "string" ? (a = encodeURI(a).replace(b, cd), c && (a = a.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), a) : null;
}
function cd(a) {
  a = a.charCodeAt(0);
  return "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16);
}
var Vc = /[#\/\?@]/g;
var Xc$1 = /[#\?:]/g;
var Wc$1 = /[#\?]/g;
var $c = /[#\?@]/g;
var Yc = /#/g;
function Rc(a, b) {
  this.h = this.g = null;
  this.i = a || null;
  this.j = !!b;
}
function V(a) {
  a.g || (a.g = new S$1(), a.h = 0, a.i && Nc(a.i, function(b, c) {
    a.add(decodeURIComponent(b.replace(/\+/g, " ")), c);
  }));
}
k = Rc.prototype;
k.add = function(a, b) {
  V(this);
  this.i = null;
  a = W$1(this, a);
  var c = this.g.get(a);
  c || this.g.set(a, c = []);
  c.push(b);
  this.h += 1;
  return this;
};
function dd(a, b) {
  V(a);
  b = W$1(a, b);
  T(a.g.h, b) && (a.i = null, a.h -= a.g.get(b).length, a = a.g, T(a.h, b) && (delete a.h[b], a.i--, a.g.length > 2 * a.i && Lc$1(a)));
}
function ed(a, b) {
  V(a);
  b = W$1(a, b);
  return T(a.g.h, b);
}
k.forEach = function(a, b) {
  V(this);
  this.g.forEach(function(c, d) {
    na(c, function(e) {
      a.call(b, e, d, this);
    }, this);
  }, this);
};
k.T = function() {
  V(this);
  for (var a = this.g.R(), b = this.g.T(), c = [], d = 0; d < b.length; d++)
    for (var e = a[d], f = 0; f < e.length; f++)
      c.push(b[d]);
  return c;
};
k.R = function(a) {
  V(this);
  var b = [];
  if (typeof a === "string")
    ed(this, a) && (b = qa(b, this.g.get(W$1(this, a))));
  else {
    a = this.g.R();
    for (var c = 0; c < a.length; c++)
      b = qa(b, a[c]);
  }
  return b;
};
k.set = function(a, b) {
  V(this);
  this.i = null;
  a = W$1(this, a);
  ed(this, a) && (this.h -= this.g.get(a).length);
  this.g.set(a, [b]);
  this.h += 1;
  return this;
};
k.get = function(a, b) {
  if (!a)
    return b;
  a = this.R(a);
  return 0 < a.length ? String(a[0]) : b;
};
function mc$1(a, b, c) {
  dd(a, b);
  0 < c.length && (a.i = null, a.g.set(W$1(a, b), ra(c)), a.h += c.length);
}
k.toString = function() {
  if (this.i)
    return this.i;
  if (!this.g)
    return "";
  for (var a = [], b = this.g.T(), c = 0; c < b.length; c++) {
    var d = b[c], e = encodeURIComponent(String(d));
    d = this.R(d);
    for (var f = 0; f < d.length; f++) {
      var h = e;
      d[f] !== "" && (h += "=" + encodeURIComponent(String(d[f])));
      a.push(h);
    }
  }
  return this.i = a.join("&");
};
function W$1(a, b) {
  b = String(b);
  a.j && (b = b.toLowerCase());
  return b;
}
function Zc(a, b) {
  b && !a.j && (V(a), a.i = null, a.g.forEach(function(c, d) {
    var e = d.toLowerCase();
    d != e && (dd(this, d), mc$1(this, e, c));
  }, a));
  a.j = b;
}
var fd = class {
  constructor(a, b) {
    this.h = a;
    this.g = b;
  }
};
function gd(a) {
  this.l = a || hd;
  l.PerformanceNavigationTiming ? (a = l.performance.getEntriesByType("navigation"), a = 0 < a.length && (a[0].nextHopProtocol == "hq" || a[0].nextHopProtocol == "h2")) : a = !!(l.g && l.g.Ea && l.g.Ea() && l.g.Ea().Zb);
  this.j = a ? this.l : 1;
  this.g = null;
  1 < this.j && (this.g = new Set());
  this.h = null;
  this.i = [];
}
var hd = 10;
function id(a) {
  return a.h ? true : a.g ? a.g.size >= a.j : false;
}
function Cc$1(a) {
  return a.h ? 1 : a.g ? a.g.size : 0;
}
function yc$1(a, b) {
  return a.h ? a.h == b : a.g ? a.g.has(b) : false;
}
function Dc(a, b) {
  a.g ? a.g.add(b) : a.h = b;
}
function Fc$1(a, b) {
  a.h && a.h == b ? a.h = null : a.g && a.g.has(b) && a.g.delete(b);
}
gd.prototype.cancel = function() {
  this.i = jd(this);
  if (this.h)
    this.h.cancel(), this.h = null;
  else if (this.g && this.g.size !== 0) {
    for (const a of this.g.values())
      a.cancel();
    this.g.clear();
  }
};
function jd(a) {
  if (a.h != null)
    return a.i.concat(a.h.D);
  if (a.g != null && a.g.size !== 0) {
    let b = a.i;
    for (const c of a.g.values())
      b = b.concat(c.D);
    return b;
  }
  return ra(a.i);
}
function kd() {
}
kd.prototype.stringify = function(a) {
  return l.JSON.stringify(a, void 0);
};
kd.prototype.parse = function(a) {
  return l.JSON.parse(a, void 0);
};
function ld() {
  this.g = new kd();
}
function md(a, b, c) {
  const d = c || "";
  try {
    Kc$1(a, function(e, f) {
      let h = e;
      p(e) && (h = rb(e));
      b.push(d + f + "=" + encodeURIComponent(h));
    });
  } catch (e) {
    throw b.push(d + "type=" + encodeURIComponent("_badmap")), e;
  }
}
function nd(a, b) {
  const c = new Mb();
  if (l.Image) {
    const d = new Image();
    d.onload = ja(od, c, d, "TestLoadImage: loaded", true, b);
    d.onerror = ja(od, c, d, "TestLoadImage: error", false, b);
    d.onabort = ja(od, c, d, "TestLoadImage: abort", false, b);
    d.ontimeout = ja(od, c, d, "TestLoadImage: timeout", false, b);
    l.setTimeout(function() {
      if (d.ontimeout)
        d.ontimeout();
    }, 1e4);
    d.src = a;
  } else
    b(false);
}
function od(a, b, c, d, e) {
  try {
    b.onload = null, b.onerror = null, b.onabort = null, b.ontimeout = null, e(d);
  } catch (f) {
  }
}
function pd(a) {
  this.l = a.$b || null;
  this.j = a.ib || false;
}
t(pd, Yb);
pd.prototype.g = function() {
  return new qd(this.l, this.j);
};
pd.prototype.i = function(a) {
  return function() {
    return a;
  };
}({});
function qd(a, b) {
  C$1.call(this);
  this.D = a;
  this.u = b;
  this.m = void 0;
  this.readyState = rd;
  this.status = 0;
  this.responseType = this.responseText = this.response = this.statusText = "";
  this.onreadystatechange = null;
  this.v = new Headers();
  this.h = null;
  this.C = "GET";
  this.B = "";
  this.g = false;
  this.A = this.j = this.l = null;
}
t(qd, C$1);
var rd = 0;
k = qd.prototype;
k.open = function(a, b) {
  if (this.readyState != rd)
    throw this.abort(), Error("Error reopening a connection");
  this.C = a;
  this.B = b;
  this.readyState = 1;
  sd(this);
};
k.send = function(a) {
  if (this.readyState != 1)
    throw this.abort(), Error("need to call open() first. ");
  this.g = true;
  const b = { headers: this.v, method: this.C, credentials: this.m, cache: void 0 };
  a && (b.body = a);
  (this.D || l).fetch(new Request(this.B, b)).then(this.Va.bind(this), this.ha.bind(this));
};
k.abort = function() {
  this.response = this.responseText = "";
  this.v = new Headers();
  this.status = 0;
  this.j && this.j.cancel("Request was aborted.");
  1 <= this.readyState && this.g && this.readyState != 4 && (this.g = false, td(this));
  this.readyState = rd;
};
k.Va = function(a) {
  if (this.g && (this.l = a, this.h || (this.status = this.l.status, this.statusText = this.l.statusText, this.h = a.headers, this.readyState = 2, sd(this)), this.g && (this.readyState = 3, sd(this), this.g)))
    if (this.responseType === "arraybuffer")
      a.arrayBuffer().then(this.Ta.bind(this), this.ha.bind(this));
    else if (typeof l.ReadableStream !== "undefined" && "body" in a) {
      this.j = a.body.getReader();
      if (this.u) {
        if (this.responseType)
          throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');
        this.response = [];
      } else
        this.response = this.responseText = "", this.A = new TextDecoder();
      ud(this);
    } else
      a.text().then(this.Ua.bind(this), this.ha.bind(this));
};
function ud(a) {
  a.j.read().then(a.Sa.bind(a)).catch(a.ha.bind(a));
}
k.Sa = function(a) {
  if (this.g) {
    if (this.u && a.value)
      this.response.push(a.value);
    else if (!this.u) {
      var b = a.value ? a.value : new Uint8Array(0);
      if (b = this.A.decode(b, { stream: !a.done }))
        this.response = this.responseText += b;
    }
    a.done ? td(this) : sd(this);
    this.readyState == 3 && ud(this);
  }
};
k.Ua = function(a) {
  this.g && (this.response = this.responseText = a, td(this));
};
k.Ta = function(a) {
  this.g && (this.response = a, td(this));
};
k.ha = function() {
  this.g && td(this);
};
function td(a) {
  a.readyState = 4;
  a.l = null;
  a.j = null;
  a.A = null;
  sd(a);
}
k.setRequestHeader = function(a, b) {
  this.v.append(a, b);
};
k.getResponseHeader = function(a) {
  return this.h ? this.h.get(a.toLowerCase()) || "" : "";
};
k.getAllResponseHeaders = function() {
  if (!this.h)
    return "";
  const a = [], b = this.h.entries();
  for (var c = b.next(); !c.done; )
    c = c.value, a.push(c[0] + ": " + c[1]), c = b.next();
  return a.join("\r\n");
};
function sd(a) {
  a.onreadystatechange && a.onreadystatechange.call(a);
}
Object.defineProperty(qd.prototype, "withCredentials", { get: function() {
  return this.m === "include";
}, set: function(a) {
  this.m = a ? "include" : "same-origin";
} });
var vd = l.JSON.parse;
function X$1(a) {
  C$1.call(this);
  this.headers = new S$1();
  this.u = a || null;
  this.h = false;
  this.C = this.g = null;
  this.H = "";
  this.m = 0;
  this.j = "";
  this.l = this.F = this.v = this.D = false;
  this.B = 0;
  this.A = null;
  this.J = wd;
  this.K = this.L = false;
}
t(X$1, C$1);
var wd = "";
var xd = /^https?$/i;
var yd = ["POST", "PUT"];
k = X$1.prototype;
k.ea = function(a, b, c, d) {
  if (this.g)
    throw Error("[goog.net.XhrIo] Object is active with another request=" + this.H + "; newUri=" + a);
  b = b ? b.toUpperCase() : "GET";
  this.H = a;
  this.j = "";
  this.m = 0;
  this.D = false;
  this.h = true;
  this.g = this.u ? this.u.g() : cc$1.g();
  this.C = this.u ? Zb(this.u) : Zb(cc$1);
  this.g.onreadystatechange = q$1(this.Fa, this);
  try {
    this.F = true, this.g.open(b, String(a), true), this.F = false;
  } catch (f) {
    zd(this, f);
    return;
  }
  a = c || "";
  const e = new S$1(this.headers);
  d && Kc$1(d, function(f, h) {
    e.set(h, f);
  });
  d = oa(e.T());
  c = l.FormData && a instanceof l.FormData;
  !(0 <= ma$1(yd, b)) || d || c || e.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
  e.forEach(function(f, h) {
    this.g.setRequestHeader(h, f);
  }, this);
  this.J && (this.g.responseType = this.J);
  "withCredentials" in this.g && this.g.withCredentials !== this.L && (this.g.withCredentials = this.L);
  try {
    Ad(this), 0 < this.B && ((this.K = Bd(this.g)) ? (this.g.timeout = this.B, this.g.ontimeout = q$1(this.pa, this)) : this.A = Gb(this.pa, this.B, this)), this.v = true, this.g.send(a), this.v = false;
  } catch (f) {
    zd(this, f);
  }
};
function Bd(a) {
  return y && Ra$1() && typeof a.timeout === "number" && a.ontimeout !== void 0;
}
function pa$1(a) {
  return a.toLowerCase() == "content-type";
}
k.pa = function() {
  typeof goog != "undefined" && this.g && (this.j = "Timed out after " + this.B + "ms, aborting", this.m = 8, D$1(this, "timeout"), this.abort(8));
};
function zd(a, b) {
  a.h = false;
  a.g && (a.l = true, a.g.abort(), a.l = false);
  a.j = b;
  a.m = 5;
  Cd(a);
  Dd(a);
}
function Cd(a) {
  a.D || (a.D = true, D$1(a, "complete"), D$1(a, "error"));
}
k.abort = function(a) {
  this.g && this.h && (this.h = false, this.l = true, this.g.abort(), this.l = false, this.m = a || 7, D$1(this, "complete"), D$1(this, "abort"), Dd(this));
};
k.M = function() {
  this.g && (this.h && (this.h = false, this.l = true, this.g.abort(), this.l = false), Dd(this, true));
  X$1.Z.M.call(this);
};
k.Fa = function() {
  this.s || (this.F || this.v || this.l ? Ed(this) : this.cb());
};
k.cb = function() {
  Ed(this);
};
function Ed(a) {
  if (a.h && typeof goog != "undefined" && (!a.C[1] || O$1(a) != 4 || a.ba() != 2)) {
    if (a.v && O$1(a) == 4)
      Gb(a.Fa, 0, a);
    else if (D$1(a, "readystatechange"), O$1(a) == 4) {
      a.h = false;
      try {
        const n = a.ba();
        a:
          switch (n) {
            case 200:
            case 201:
            case 202:
            case 204:
            case 206:
            case 304:
            case 1223:
              var b = true;
              break a;
            default:
              b = false;
          }
        var c;
        if (!(c = b)) {
          var d;
          if (d = n === 0) {
            var e = String(a.H).match(Mc)[1] || null;
            if (!e && l.self && l.self.location) {
              var f = l.self.location.protocol;
              e = f.substr(0, f.length - 1);
            }
            d = !xd.test(e ? e.toLowerCase() : "");
          }
          c = d;
        }
        if (c)
          D$1(a, "complete"), D$1(a, "success");
        else {
          a.m = 6;
          try {
            var h = 2 < O$1(a) ? a.g.statusText : "";
          } catch (u) {
            h = "";
          }
          a.j = h + " [" + a.ba() + "]";
          Cd(a);
        }
      } finally {
        Dd(a);
      }
    }
  }
}
function Dd(a, b) {
  if (a.g) {
    Ad(a);
    const c = a.g, d = a.C[0] ? aa : null;
    a.g = null;
    a.C = null;
    b || D$1(a, "ready");
    try {
      c.onreadystatechange = d;
    } catch (e) {
    }
  }
}
function Ad(a) {
  a.g && a.K && (a.g.ontimeout = null);
  a.A && (l.clearTimeout(a.A), a.A = null);
}
function O$1(a) {
  return a.g ? a.g.readyState : 0;
}
k.ba = function() {
  try {
    return 2 < O$1(this) ? this.g.status : -1;
  } catch (a) {
    return -1;
  }
};
k.ga = function() {
  try {
    return this.g ? this.g.responseText : "";
  } catch (a) {
    return "";
  }
};
k.Qa = function(a) {
  if (this.g) {
    var b = this.g.responseText;
    a && b.indexOf(a) == 0 && (b = b.substring(a.length));
    return vd(b);
  }
};
function oc$1(a) {
  try {
    if (!a.g)
      return null;
    if ("response" in a.g)
      return a.g.response;
    switch (a.J) {
      case wd:
      case "text":
        return a.g.responseText;
      case "arraybuffer":
        if ("mozResponseArrayBuffer" in a.g)
          return a.g.mozResponseArrayBuffer;
    }
    return null;
  } catch (b) {
    return null;
  }
}
k.Da = function() {
  return this.m;
};
k.La = function() {
  return typeof this.j === "string" ? this.j : String(this.j);
};
function Fd(a) {
  let b = "";
  xa(a, function(c, d) {
    b += d;
    b += ":";
    b += c;
    b += "\r\n";
  });
  return b;
}
function Gd(a, b, c) {
  a: {
    for (d in c) {
      var d = false;
      break a;
    }
    d = true;
  }
  d || (c = Fd(c), typeof a === "string" ? c != null && encodeURIComponent(String(c)) : R(a, b, c));
}
function Hd(a, b, c) {
  return c && c.internalChannelParams ? c.internalChannelParams[a] || b : b;
}
function Id(a) {
  this.za = 0;
  this.l = [];
  this.h = new Mb();
  this.la = this.oa = this.F = this.W = this.g = this.sa = this.D = this.aa = this.o = this.P = this.s = null;
  this.Za = this.V = 0;
  this.Xa = Hd("failFast", false, a);
  this.N = this.v = this.u = this.m = this.j = null;
  this.X = true;
  this.I = this.ta = this.U = -1;
  this.Y = this.A = this.C = 0;
  this.Pa = Hd("baseRetryDelayMs", 5e3, a);
  this.$a = Hd("retryDelaySeedMs", 1e4, a);
  this.Ya = Hd("forwardChannelMaxRetries", 2, a);
  this.ra = Hd("forwardChannelRequestTimeoutMs", 2e4, a);
  this.qa = a && a.xmlHttpFactory || void 0;
  this.Ba = a && a.Yb || false;
  this.K = void 0;
  this.H = a && a.supportsCrossDomainXhr || false;
  this.J = "";
  this.i = new gd(a && a.concurrentRequestLimit);
  this.Ca = new ld();
  this.ja = a && a.fastHandshake || false;
  this.Ra = a && a.Wb || false;
  a && a.Aa && this.h.Aa();
  a && a.forceLongPolling && (this.X = false);
  this.$ = !this.ja && this.X && a && a.detectBufferingProxy || false;
  this.ka = void 0;
  this.O = 0;
  this.L = false;
  this.B = null;
  this.Wa = !a || a.Xb !== false;
}
k = Id.prototype;
k.ma = 8;
k.G = 1;
function Ic(a) {
  Jd(a);
  if (a.G == 3) {
    var b = a.V++, c = N$1(a.F);
    R(c, "SID", a.J);
    R(c, "RID", b);
    R(c, "TYPE", "terminate");
    Kd(a, c);
    b = new M$1(a, a.h, b, void 0);
    b.K = 2;
    b.v = jc$1(N$1(c));
    c = false;
    l.navigator && l.navigator.sendBeacon && (c = l.navigator.sendBeacon(b.v.toString(), ""));
    !c && l.Image && (new Image().src = b.v, c = true);
    c || (b.g = nc$1(b.l, null), b.g.ea(b.v));
    b.F = Date.now();
    lc(b);
  }
  Ld(a);
}
k.hb = function(a) {
  try {
    this.h.info("Origin Trials invoked: " + a);
  } catch (b) {
  }
};
function Ac(a) {
  a.g && (wc$1(a), a.g.cancel(), a.g = null);
}
function Jd(a) {
  Ac(a);
  a.u && (l.clearTimeout(a.u), a.u = null);
  zc(a);
  a.i.cancel();
  a.m && (typeof a.m === "number" && l.clearTimeout(a.m), a.m = null);
}
function Md(a, b) {
  a.l.push(new fd(a.Za++, b));
  a.G == 3 && Hc(a);
}
function Hc(a) {
  id(a.i) || a.m || (a.m = true, zb(a.Ha, a), a.C = 0);
}
function Nd(a, b) {
  if (Cc$1(a.i) >= a.i.j - (a.m ? 1 : 0))
    return false;
  if (a.m)
    return a.l = b.D.concat(a.l), true;
  if (a.G == 1 || a.G == 2 || a.C >= (a.Xa ? 0 : a.Ya))
    return false;
  a.m = K$1(q$1(a.Ha, a, b), Od(a, a.C));
  a.C++;
  return true;
}
k.Ha = function(a) {
  if (this.m)
    if (this.m = null, this.G == 1) {
      if (!a) {
        this.V = Math.floor(1e5 * Math.random());
        a = this.V++;
        const e = new M$1(this, this.h, a, void 0);
        let f = this.s;
        this.P && (f ? (f = ya(f), Aa$1(f, this.P)) : f = this.P);
        this.o === null && (e.H = f);
        if (this.ja)
          a: {
            var b = 0;
            for (var c = 0; c < this.l.length; c++) {
              b: {
                var d = this.l[c];
                if ("__data__" in d.g && (d = d.g.__data__, typeof d === "string")) {
                  d = d.length;
                  break b;
                }
                d = void 0;
              }
              if (d === void 0)
                break;
              b += d;
              if (4096 < b) {
                b = c;
                break a;
              }
              if (b === 4096 || c === this.l.length - 1) {
                b = c + 1;
                break a;
              }
            }
            b = 1e3;
          }
        else
          b = 1e3;
        b = Pd(this, e, b);
        c = N$1(this.F);
        R(c, "RID", a);
        R(c, "CVER", 22);
        this.D && R(c, "X-HTTP-Session-Id", this.D);
        Kd(this, c);
        this.o && f && Gd(c, this.o, f);
        Dc(this.i, e);
        this.Ra && R(c, "TYPE", "init");
        this.ja ? (R(c, "$req", b), R(c, "SID", "null"), e.$ = true, ic$1(e, c, null)) : ic$1(e, c, b);
        this.G = 2;
      }
    } else
      this.G == 3 && (a ? Qd(this, a) : this.l.length == 0 || id(this.i) || Qd(this));
};
function Qd(a, b) {
  var c;
  b ? c = b.m : c = a.V++;
  const d = N$1(a.F);
  R(d, "SID", a.J);
  R(d, "RID", c);
  R(d, "AID", a.U);
  Kd(a, d);
  a.o && a.s && Gd(d, a.o, a.s);
  c = new M$1(a, a.h, c, a.C + 1);
  a.o === null && (c.H = a.s);
  b && (a.l = b.D.concat(a.l));
  b = Pd(a, c, 1e3);
  c.setTimeout(Math.round(0.5 * a.ra) + Math.round(0.5 * a.ra * Math.random()));
  Dc(a.i, c);
  ic$1(c, d, b);
}
function Kd(a, b) {
  a.j && Kc$1({}, function(c, d) {
    R(b, d, c);
  });
}
function Pd(a, b, c) {
  c = Math.min(a.l.length, c);
  var d = a.j ? q$1(a.j.Oa, a.j, a) : null;
  a: {
    var e = a.l;
    let f = -1;
    for (; ; ) {
      const h = ["count=" + c];
      f == -1 ? 0 < c ? (f = e[0].h, h.push("ofs=" + f)) : f = 0 : h.push("ofs=" + f);
      let n = true;
      for (let u = 0; u < c; u++) {
        let m = e[u].h;
        const r = e[u].g;
        m -= f;
        if (0 > m)
          f = Math.max(0, e[u].h - 100), n = false;
        else
          try {
            md(r, h, "req" + m + "_");
          } catch (G2) {
            d && d(r);
          }
      }
      if (n) {
        d = h.join("&");
        break a;
      }
    }
  }
  a = a.l.splice(0, c);
  b.D = a;
  return d;
}
function Gc$1(a) {
  a.g || a.u || (a.Y = 1, zb(a.Ga, a), a.A = 0);
}
function Bc(a) {
  if (a.g || a.u || 3 <= a.A)
    return false;
  a.Y++;
  a.u = K$1(q$1(a.Ga, a), Od(a, a.A));
  a.A++;
  return true;
}
k.Ga = function() {
  this.u = null;
  Rd(this);
  if (this.$ && !(this.L || this.g == null || 0 >= this.O)) {
    var a = 2 * this.O;
    this.h.info("BP detection timer enabled: " + a);
    this.B = K$1(q$1(this.bb, this), a);
  }
};
k.bb = function() {
  this.B && (this.B = null, this.h.info("BP detection timeout reached."), this.h.info("Buffering proxy detected and switch to long-polling!"), this.N = false, this.L = true, J$1(10), Ac(this), Rd(this));
};
function wc$1(a) {
  a.B != null && (l.clearTimeout(a.B), a.B = null);
}
function Rd(a) {
  a.g = new M$1(a, a.h, "rpc", a.Y);
  a.o === null && (a.g.H = a.s);
  a.g.O = 0;
  var b = N$1(a.oa);
  R(b, "RID", "rpc");
  R(b, "SID", a.J);
  R(b, "CI", a.N ? "0" : "1");
  R(b, "AID", a.U);
  Kd(a, b);
  R(b, "TYPE", "xmlhttp");
  a.o && a.s && Gd(b, a.o, a.s);
  a.K && a.g.setTimeout(a.K);
  var c = a.g;
  a = a.la;
  c.K = 1;
  c.v = jc$1(N$1(b));
  c.s = null;
  c.U = true;
  kc$1(c, a);
}
k.ab = function() {
  this.v != null && (this.v = null, Ac(this), Bc(this), J$1(19));
};
function zc(a) {
  a.v != null && (l.clearTimeout(a.v), a.v = null);
}
function uc(a, b) {
  var c = null;
  if (a.g == b) {
    zc(a);
    wc$1(a);
    a.g = null;
    var d = 2;
  } else if (yc$1(a.i, b))
    c = b.D, Fc$1(a.i, b), d = 1;
  else
    return;
  a.I = b.N;
  if (a.G != 0) {
    if (b.i)
      if (d == 1) {
        c = b.s ? b.s.length : 0;
        b = Date.now() - b.F;
        var e = a.C;
        d = Sb();
        D$1(d, new Vb(d, c, b, e));
        Hc(a);
      } else
        Gc$1(a);
    else if (e = b.o, e == 3 || e == 0 && 0 < a.I || !(d == 1 && Nd(a, b) || d == 2 && Bc(a)))
      switch (c && 0 < c.length && (b = a.i, b.i = b.i.concat(c)), e) {
        case 1:
          Q$1(a, 5);
          break;
        case 4:
          Q$1(a, 10);
          break;
        case 3:
          Q$1(a, 6);
          break;
        default:
          Q$1(a, 2);
      }
  }
}
function Od(a, b) {
  let c = a.Pa + Math.floor(Math.random() * a.$a);
  a.j || (c *= 2);
  return c * b;
}
function Q$1(a, b) {
  a.h.info("Error code " + b);
  if (b == 2) {
    var c = null;
    a.j && (c = null);
    var d = q$1(a.jb, a);
    c || (c = new U("//www.google.com/images/cleardot.gif"), l.location && l.location.protocol == "http" || Oc(c, "https"), jc$1(c));
    nd(c.toString(), d);
  } else
    J$1(2);
  a.G = 0;
  a.j && a.j.va(b);
  Ld(a);
  Jd(a);
}
k.jb = function(a) {
  a ? (this.h.info("Successfully pinged google.com"), J$1(2)) : (this.h.info("Failed to ping google.com"), J$1(1));
};
function Ld(a) {
  a.G = 0;
  a.I = -1;
  if (a.j) {
    if (jd(a.i).length != 0 || a.l.length != 0)
      a.i.i.length = 0, ra(a.l), a.l.length = 0;
    a.j.ua();
  }
}
function Ec$1(a, b, c) {
  let d = ad(c);
  if (d.i != "")
    b && Pc(d, b + "." + d.i), Qc$1(d, d.m);
  else {
    const e = l.location;
    d = bd(e.protocol, b ? b + "." + e.hostname : e.hostname, +e.port, c);
  }
  a.aa && xa(a.aa, function(e, f) {
    R(d, f, e);
  });
  b = a.D;
  c = a.sa;
  b && c && R(d, b, c);
  R(d, "VER", a.ma);
  Kd(a, d);
  return d;
}
function nc$1(a, b, c) {
  if (b && !a.H)
    throw Error("Can't create secondary domain capable XhrIo object.");
  b = c && a.Ba && !a.qa ? new X$1(new pd({ ib: true })) : new X$1(a.qa);
  b.L = a.H;
  return b;
}
function Sd() {
}
k = Sd.prototype;
k.xa = function() {
};
k.wa = function() {
};
k.va = function() {
};
k.ua = function() {
};
k.Oa = function() {
};
function Td() {
  if (y && !(10 <= Number(Ua)))
    throw Error("Environmental error: no available transport.");
}
Td.prototype.g = function(a, b) {
  return new Y$1(a, b);
};
function Y$1(a, b) {
  C$1.call(this);
  this.g = new Id(b);
  this.l = a;
  this.h = b && b.messageUrlParams || null;
  a = b && b.messageHeaders || null;
  b && b.clientProtocolHeaderRequired && (a ? a["X-Client-Protocol"] = "webchannel" : a = { "X-Client-Protocol": "webchannel" });
  this.g.s = a;
  a = b && b.initMessageHeaders || null;
  b && b.messageContentType && (a ? a["X-WebChannel-Content-Type"] = b.messageContentType : a = { "X-WebChannel-Content-Type": b.messageContentType });
  b && b.ya && (a ? a["X-WebChannel-Client-Profile"] = b.ya : a = { "X-WebChannel-Client-Profile": b.ya });
  this.g.P = a;
  (a = b && b.httpHeadersOverwriteParam) && !sa(a) && (this.g.o = a);
  this.A = b && b.supportsCrossDomainXhr || false;
  this.v = b && b.sendRawJson || false;
  (b = b && b.httpSessionIdParam) && !sa(b) && (this.g.D = b, a = this.h, a !== null && b in a && (a = this.h, b in a && delete a[b]));
  this.j = new Z$1(this);
}
t(Y$1, C$1);
Y$1.prototype.m = function() {
  this.g.j = this.j;
  this.A && (this.g.H = true);
  var a = this.g, b = this.l, c = this.h || void 0;
  a.Wa && (a.h.info("Origin Trials enabled."), zb(q$1(a.hb, a, b)));
  J$1(0);
  a.W = b;
  a.aa = c || {};
  a.N = a.X;
  a.F = Ec$1(a, null, a.W);
  Hc(a);
};
Y$1.prototype.close = function() {
  Ic(this.g);
};
Y$1.prototype.u = function(a) {
  if (typeof a === "string") {
    var b = {};
    b.__data__ = a;
    Md(this.g, b);
  } else
    this.v ? (b = {}, b.__data__ = rb(a), Md(this.g, b)) : Md(this.g, a);
};
Y$1.prototype.M = function() {
  this.g.j = null;
  delete this.j;
  Ic(this.g);
  delete this.g;
  Y$1.Z.M.call(this);
};
function Ud(a) {
  ac$1.call(this);
  var b = a.__sm__;
  if (b) {
    a: {
      for (const c in b) {
        a = c;
        break a;
      }
      a = void 0;
    }
    if (this.i = a)
      a = this.i, b = b !== null && a in b ? b[a] : void 0;
    this.data = b;
  } else
    this.data = a;
}
t(Ud, ac$1);
function Vd() {
  bc.call(this);
  this.status = 1;
}
t(Vd, bc);
function Z$1(a) {
  this.g = a;
}
t(Z$1, Sd);
Z$1.prototype.xa = function() {
  D$1(this.g, "a");
};
Z$1.prototype.wa = function(a) {
  D$1(this.g, new Ud(a));
};
Z$1.prototype.va = function(a) {
  D$1(this.g, new Vd(a));
};
Z$1.prototype.ua = function() {
  D$1(this.g, "b");
};
Td.prototype.createWebChannel = Td.prototype.g;
Y$1.prototype.send = Y$1.prototype.u;
Y$1.prototype.open = Y$1.prototype.m;
Y$1.prototype.close = Y$1.prototype.close;
Wb.NO_ERROR = 0;
Wb.TIMEOUT = 8;
Wb.HTTP_ERROR = 6;
Xb.COMPLETE = "complete";
$b.EventType = L$1;
L$1.OPEN = "a";
L$1.CLOSE = "b";
L$1.ERROR = "c";
L$1.MESSAGE = "d";
C$1.prototype.listen = C$1.prototype.N;
X$1.prototype.listenOnce = X$1.prototype.O;
X$1.prototype.getLastError = X$1.prototype.La;
X$1.prototype.getLastErrorCode = X$1.prototype.Da;
X$1.prototype.getStatus = X$1.prototype.ba;
X$1.prototype.getResponseJson = X$1.prototype.Qa;
X$1.prototype.getResponseText = X$1.prototype.ga;
X$1.prototype.send = X$1.prototype.ea;
var createWebChannelTransport = function() {
  return new Td();
};
var getStatEventTarget = function() {
  return Sb();
};
var ErrorCode = Wb;
var EventType = Xb;
var Event = H$1;
var Stat = { rb: 0, ub: 1, vb: 2, Ob: 3, Tb: 4, Qb: 5, Rb: 6, Pb: 7, Nb: 8, Sb: 9, PROXY: 10, NOPROXY: 11, Lb: 12, Hb: 13, Ib: 14, Gb: 15, Jb: 16, Kb: 17, nb: 18, mb: 19, ob: 20 };
var FetchXmlHttpFactory = pd;
var WebChannel = $b;
var XhrIo = X$1;
var S = "@firebase/firestore";
var D = class {
  constructor(t2) {
    this.uid = t2;
  }
  isAuthenticated() {
    return this.uid != null;
  }
  toKey() {
    return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
  }
  isEqual(t2) {
    return t2.uid === this.uid;
  }
};
D.UNAUTHENTICATED = new D(null), D.GOOGLE_CREDENTIALS = new D("google-credentials-uid"), D.FIRST_PARTY = new D("first-party-uid"), D.MOCK_USER = new D("mock-user");
var C = "9.3.0";
var N = new Logger("@firebase/firestore");
function x() {
  return N.logLevel;
}
function $(t2, ...e) {
  if (N.logLevel <= LogLevel.DEBUG) {
    const n = e.map(M);
    N.debug(`Firestore (${C}): ${t2}`, ...n);
  }
}
function O(t2, ...e) {
  if (N.logLevel <= LogLevel.ERROR) {
    const n = e.map(M);
    N.error(`Firestore (${C}): ${t2}`, ...n);
  }
}
function F(t2, ...e) {
  if (N.logLevel <= LogLevel.WARN) {
    const n = e.map(M);
    N.warn(`Firestore (${C}): ${t2}`, ...n);
  }
}
function M(t2) {
  if (typeof t2 == "string")
    return t2;
  try {
    return e = t2, JSON.stringify(e);
  } catch (e2) {
    return t2;
  }
  var e;
}
function L(t2 = "Unexpected state") {
  const e = `FIRESTORE (${C}) INTERNAL ASSERTION FAILED: ` + t2;
  throw O(e), new Error(e);
}
function B(t2, e) {
  t2 || L();
}
function q(t2, e) {
  return t2;
}
var K = {
  OK: "ok",
  CANCELLED: "cancelled",
  UNKNOWN: "unknown",
  INVALID_ARGUMENT: "invalid-argument",
  DEADLINE_EXCEEDED: "deadline-exceeded",
  NOT_FOUND: "not-found",
  ALREADY_EXISTS: "already-exists",
  PERMISSION_DENIED: "permission-denied",
  UNAUTHENTICATED: "unauthenticated",
  RESOURCE_EXHAUSTED: "resource-exhausted",
  FAILED_PRECONDITION: "failed-precondition",
  ABORTED: "aborted",
  OUT_OF_RANGE: "out-of-range",
  UNIMPLEMENTED: "unimplemented",
  INTERNAL: "internal",
  UNAVAILABLE: "unavailable",
  DATA_LOSS: "data-loss"
};
var j = class extends Error {
  constructor(t2, e) {
    super(e), this.code = t2, this.message = e, this.name = "FirebaseError", this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
  }
};
var Q = class {
  constructor() {
    this.promise = new Promise((t2, e) => {
      this.resolve = t2, this.reject = e;
    });
  }
};
var W = class {
  constructor(t2, e) {
    this.user = e, this.type = "OAuth", this.authHeaders = {}, this.authHeaders.Authorization = `Bearer ${t2}`;
  }
};
var G = class {
  getToken() {
    return Promise.resolve(null);
  }
  invalidateToken() {
  }
  start(t2, e) {
    t2.enqueueRetryable(() => e(D.UNAUTHENTICATED));
  }
  shutdown() {
  }
};
var H = class {
  constructor(t2) {
    this.t = t2, this.currentUser = D.UNAUTHENTICATED, this.i = 0, this.forceRefresh = false, this.auth = null;
  }
  start(t2, e) {
    let n = this.i;
    const s2 = (t3) => this.i !== n ? (n = this.i, e(t3)) : Promise.resolve();
    let i = new Q();
    this.o = () => {
      this.i++, this.currentUser = this.u(), i.resolve(), i = new Q(), t2.enqueueRetryable(() => s2(this.currentUser));
    };
    const r = () => {
      const e2 = i;
      t2.enqueueRetryable(async () => {
        await e2.promise, await s2(this.currentUser);
      });
    }, o = (t3) => {
      $("FirebaseCredentialsProvider", "Auth detected"), this.auth = t3, this.auth.addAuthTokenListener(this.o), r();
    };
    this.t.onInit((t3) => o(t3)), setTimeout(() => {
      if (!this.auth) {
        const t3 = this.t.getImmediate({
          optional: true
        });
        t3 ? o(t3) : ($("FirebaseCredentialsProvider", "Auth not yet detected"), i.resolve(), i = new Q());
      }
    }, 0), r();
  }
  getToken() {
    const t2 = this.i, e = this.forceRefresh;
    return this.forceRefresh = false, this.auth ? this.auth.getToken(e).then((e2) => this.i !== t2 ? ($("FirebaseCredentialsProvider", "getToken aborted due to token change."), this.getToken()) : e2 ? (B(typeof e2.accessToken == "string"), new W(e2.accessToken, this.currentUser)) : null) : Promise.resolve(null);
  }
  invalidateToken() {
    this.forceRefresh = true;
  }
  shutdown() {
    this.auth && this.auth.removeAuthTokenListener(this.o);
  }
  u() {
    const t2 = this.auth && this.auth.getUid();
    return B(t2 === null || typeof t2 == "string"), new D(t2);
  }
};
var J = class {
  constructor(t2, e, n) {
    this.h = t2, this.l = e, this.m = n, this.type = "FirstParty", this.user = D.FIRST_PARTY;
  }
  get authHeaders() {
    const t2 = {
      "X-Goog-AuthUser": this.l
    }, e = this.h.auth.getAuthHeaderValueForFirstParty([]);
    return e && (t2.Authorization = e), this.m && (t2["X-Goog-Iam-Authorization-Token"] = this.m), t2;
  }
};
var Y = class {
  constructor(t2, e, n) {
    this.h = t2, this.l = e, this.m = n;
  }
  getToken() {
    return Promise.resolve(new J(this.h, this.l, this.m));
  }
  start(t2, e) {
    t2.enqueueRetryable(() => e(D.FIRST_PARTY));
  }
  shutdown() {
  }
  invalidateToken() {
  }
};
var X = class {
  constructor(t2, e) {
    this.previousValue = t2, e && (e.sequenceNumberHandler = (t3) => this.g(t3), this.p = (t3) => e.writeSequenceNumber(t3));
  }
  g(t2) {
    return this.previousValue = Math.max(t2, this.previousValue), this.previousValue;
  }
  next() {
    const t2 = ++this.previousValue;
    return this.p && this.p(t2), t2;
  }
};
function Z(t2) {
  const e = typeof self != "undefined" && (self.crypto || self.msCrypto), n = new Uint8Array(t2);
  if (e && typeof e.getRandomValues == "function")
    e.getRandomValues(n);
  else
    for (let e2 = 0; e2 < t2; e2++)
      n[e2] = Math.floor(256 * Math.random());
  return n;
}
X.T = -1;
var tt = class {
  static I() {
    const t2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", e = Math.floor(256 / t2.length) * t2.length;
    let n = "";
    for (; n.length < 20; ) {
      const s2 = Z(40);
      for (let i = 0; i < s2.length; ++i)
        n.length < 20 && s2[i] < e && (n += t2.charAt(s2[i] % t2.length));
    }
    return n;
  }
};
function et(t2, e) {
  return t2 < e ? -1 : t2 > e ? 1 : 0;
}
function nt(t2, e, n) {
  return t2.length === e.length && t2.every((t3, s2) => n(t3, e[s2]));
}
var it = class {
  constructor(t2, e) {
    if (this.seconds = t2, this.nanoseconds = e, e < 0)
      throw new j(K.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
    if (e >= 1e9)
      throw new j(K.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + e);
    if (t2 < -62135596800)
      throw new j(K.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t2);
    if (t2 >= 253402300800)
      throw new j(K.INVALID_ARGUMENT, "Timestamp seconds out of range: " + t2);
  }
  static now() {
    return it.fromMillis(Date.now());
  }
  static fromDate(t2) {
    return it.fromMillis(t2.getTime());
  }
  static fromMillis(t2) {
    const e = Math.floor(t2 / 1e3), n = Math.floor(1e6 * (t2 - 1e3 * e));
    return new it(e, n);
  }
  toDate() {
    return new Date(this.toMillis());
  }
  toMillis() {
    return 1e3 * this.seconds + this.nanoseconds / 1e6;
  }
  _compareTo(t2) {
    return this.seconds === t2.seconds ? et(this.nanoseconds, t2.nanoseconds) : et(this.seconds, t2.seconds);
  }
  isEqual(t2) {
    return t2.seconds === this.seconds && t2.nanoseconds === this.nanoseconds;
  }
  toString() {
    return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
  }
  toJSON() {
    return {
      seconds: this.seconds,
      nanoseconds: this.nanoseconds
    };
  }
  valueOf() {
    const t2 = this.seconds - -62135596800;
    return String(t2).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
  }
};
var rt = class {
  constructor(t2) {
    this.timestamp = t2;
  }
  static fromTimestamp(t2) {
    return new rt(t2);
  }
  static min() {
    return new rt(new it(0, 0));
  }
  compareTo(t2) {
    return this.timestamp._compareTo(t2.timestamp);
  }
  isEqual(t2) {
    return this.timestamp.isEqual(t2.timestamp);
  }
  toMicroseconds() {
    return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
  }
  toString() {
    return "SnapshotVersion(" + this.timestamp.toString() + ")";
  }
  toTimestamp() {
    return this.timestamp;
  }
};
function ot(t2) {
  let e = 0;
  for (const n in t2)
    Object.prototype.hasOwnProperty.call(t2, n) && e++;
  return e;
}
function ct(t2, e) {
  for (const n in t2)
    Object.prototype.hasOwnProperty.call(t2, n) && e(n, t2[n]);
}
function at(t2) {
  for (const e in t2)
    if (Object.prototype.hasOwnProperty.call(t2, e))
      return false;
  return true;
}
var ut = class {
  constructor(t2, e, n) {
    e === void 0 ? e = 0 : e > t2.length && L(), n === void 0 ? n = t2.length - e : n > t2.length - e && L(), this.segments = t2, this.offset = e, this.len = n;
  }
  get length() {
    return this.len;
  }
  isEqual(t2) {
    return ut.comparator(this, t2) === 0;
  }
  child(t2) {
    const e = this.segments.slice(this.offset, this.limit());
    return t2 instanceof ut ? t2.forEach((t3) => {
      e.push(t3);
    }) : e.push(t2), this.construct(e);
  }
  limit() {
    return this.offset + this.length;
  }
  popFirst(t2) {
    return t2 = t2 === void 0 ? 1 : t2, this.construct(this.segments, this.offset + t2, this.length - t2);
  }
  popLast() {
    return this.construct(this.segments, this.offset, this.length - 1);
  }
  firstSegment() {
    return this.segments[this.offset];
  }
  lastSegment() {
    return this.get(this.length - 1);
  }
  get(t2) {
    return this.segments[this.offset + t2];
  }
  isEmpty() {
    return this.length === 0;
  }
  isPrefixOf(t2) {
    if (t2.length < this.length)
      return false;
    for (let e = 0; e < this.length; e++)
      if (this.get(e) !== t2.get(e))
        return false;
    return true;
  }
  isImmediateParentOf(t2) {
    if (this.length + 1 !== t2.length)
      return false;
    for (let e = 0; e < this.length; e++)
      if (this.get(e) !== t2.get(e))
        return false;
    return true;
  }
  forEach(t2) {
    for (let e = this.offset, n = this.limit(); e < n; e++)
      t2(this.segments[e]);
  }
  toArray() {
    return this.segments.slice(this.offset, this.limit());
  }
  static comparator(t2, e) {
    const n = Math.min(t2.length, e.length);
    for (let s2 = 0; s2 < n; s2++) {
      const n2 = t2.get(s2), i = e.get(s2);
      if (n2 < i)
        return -1;
      if (n2 > i)
        return 1;
    }
    return t2.length < e.length ? -1 : t2.length > e.length ? 1 : 0;
  }
};
var ht = class extends ut {
  construct(t2, e, n) {
    return new ht(t2, e, n);
  }
  canonicalString() {
    return this.toArray().join("/");
  }
  toString() {
    return this.canonicalString();
  }
  static fromString(...t2) {
    const e = [];
    for (const n of t2) {
      if (n.indexOf("//") >= 0)
        throw new j(K.INVALID_ARGUMENT, `Invalid segment (${n}). Paths must not contain // in them.`);
      e.push(...n.split("/").filter((t3) => t3.length > 0));
    }
    return new ht(e);
  }
  static emptyPath() {
    return new ht([]);
  }
};
var lt = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
var ft = class extends ut {
  construct(t2, e, n) {
    return new ft(t2, e, n);
  }
  static isValidIdentifier(t2) {
    return lt.test(t2);
  }
  canonicalString() {
    return this.toArray().map((t2) => (t2 = t2.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), ft.isValidIdentifier(t2) || (t2 = "`" + t2 + "`"), t2)).join(".");
  }
  toString() {
    return this.canonicalString();
  }
  isKeyField() {
    return this.length === 1 && this.get(0) === "__name__";
  }
  static keyField() {
    return new ft(["__name__"]);
  }
  static fromServerFormat(t2) {
    const e = [];
    let n = "", s2 = 0;
    const i = () => {
      if (n.length === 0)
        throw new j(K.INVALID_ARGUMENT, `Invalid field path (${t2}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
      e.push(n), n = "";
    };
    let r = false;
    for (; s2 < t2.length; ) {
      const e2 = t2[s2];
      if (e2 === "\\") {
        if (s2 + 1 === t2.length)
          throw new j(K.INVALID_ARGUMENT, "Path has trailing escape character: " + t2);
        const e3 = t2[s2 + 1];
        if (e3 !== "\\" && e3 !== "." && e3 !== "`")
          throw new j(K.INVALID_ARGUMENT, "Path has invalid escape sequence: " + t2);
        n += e3, s2 += 2;
      } else
        e2 === "`" ? (r = !r, s2++) : e2 !== "." || r ? (n += e2, s2++) : (i(), s2++);
    }
    if (i(), r)
      throw new j(K.INVALID_ARGUMENT, "Unterminated ` in path: " + t2);
    return new ft(e);
  }
  static emptyPath() {
    return new ft([]);
  }
};
var _t = class {
  constructor(t2) {
    this.binaryString = t2;
  }
  static fromBase64String(t2) {
    const e = atob(t2);
    return new _t(e);
  }
  static fromUint8Array(t2) {
    const e = function(t3) {
      let e2 = "";
      for (let n = 0; n < t3.length; ++n)
        e2 += String.fromCharCode(t3[n]);
      return e2;
    }(t2);
    return new _t(e);
  }
  toBase64() {
    return t2 = this.binaryString, btoa(t2);
    var t2;
  }
  toUint8Array() {
    return function(t2) {
      const e = new Uint8Array(t2.length);
      for (let n = 0; n < t2.length; n++)
        e[n] = t2.charCodeAt(n);
      return e;
    }(this.binaryString);
  }
  approximateByteSize() {
    return 2 * this.binaryString.length;
  }
  compareTo(t2) {
    return et(this.binaryString, t2.binaryString);
  }
  isEqual(t2) {
    return this.binaryString === t2.binaryString;
  }
};
_t.EMPTY_BYTE_STRING = new _t("");
var mt = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function gt(t2) {
  if (B(!!t2), typeof t2 == "string") {
    let e = 0;
    const n = mt.exec(t2);
    if (B(!!n), n[1]) {
      let t3 = n[1];
      t3 = (t3 + "000000000").substr(0, 9), e = Number(t3);
    }
    const s2 = new Date(t2);
    return {
      seconds: Math.floor(s2.getTime() / 1e3),
      nanos: e
    };
  }
  return {
    seconds: yt(t2.seconds),
    nanos: yt(t2.nanos)
  };
}
function yt(t2) {
  return typeof t2 == "number" ? t2 : typeof t2 == "string" ? Number(t2) : 0;
}
function pt(t2) {
  return typeof t2 == "string" ? _t.fromBase64String(t2) : _t.fromUint8Array(t2);
}
function Tt(t2) {
  var e, n;
  return ((n = (((e = t2 == null ? void 0 : t2.mapValue) === null || e === void 0 ? void 0 : e.fields) || {}).__type__) === null || n === void 0 ? void 0 : n.stringValue) === "server_timestamp";
}
function Et(t2) {
  const e = t2.mapValue.fields.__previous_value__;
  return Tt(e) ? Et(e) : e;
}
function It(t2) {
  const e = gt(t2.mapValue.fields.__local_write_time__.timestampValue);
  return new it(e.seconds, e.nanos);
}
function At(t2) {
  return t2 == null;
}
function Rt(t2) {
  return t2 === 0 && 1 / t2 == -1 / 0;
}
var Pt = class {
  constructor(t2) {
    this.path = t2;
  }
  static fromPath(t2) {
    return new Pt(ht.fromString(t2));
  }
  static fromName(t2) {
    return new Pt(ht.fromString(t2).popFirst(5));
  }
  hasCollectionId(t2) {
    return this.path.length >= 2 && this.path.get(this.path.length - 2) === t2;
  }
  isEqual(t2) {
    return t2 !== null && ht.comparator(this.path, t2.path) === 0;
  }
  toString() {
    return this.path.toString();
  }
  static comparator(t2, e) {
    return ht.comparator(t2.path, e.path);
  }
  static isDocumentKey(t2) {
    return t2.length % 2 == 0;
  }
  static fromSegments(t2) {
    return new Pt(new ht(t2.slice()));
  }
};
function vt(t2) {
  return "nullValue" in t2 ? 0 : "booleanValue" in t2 ? 1 : "integerValue" in t2 || "doubleValue" in t2 ? 2 : "timestampValue" in t2 ? 3 : "stringValue" in t2 ? 5 : "bytesValue" in t2 ? 6 : "referenceValue" in t2 ? 7 : "geoPointValue" in t2 ? 8 : "arrayValue" in t2 ? 9 : "mapValue" in t2 ? Tt(t2) ? 4 : 10 : L();
}
function Vt(t2, e) {
  const n = vt(t2);
  if (n !== vt(e))
    return false;
  switch (n) {
    case 0:
      return true;
    case 1:
      return t2.booleanValue === e.booleanValue;
    case 4:
      return It(t2).isEqual(It(e));
    case 3:
      return function(t3, e2) {
        if (typeof t3.timestampValue == "string" && typeof e2.timestampValue == "string" && t3.timestampValue.length === e2.timestampValue.length)
          return t3.timestampValue === e2.timestampValue;
        const n2 = gt(t3.timestampValue), s2 = gt(e2.timestampValue);
        return n2.seconds === s2.seconds && n2.nanos === s2.nanos;
      }(t2, e);
    case 5:
      return t2.stringValue === e.stringValue;
    case 6:
      return function(t3, e2) {
        return pt(t3.bytesValue).isEqual(pt(e2.bytesValue));
      }(t2, e);
    case 7:
      return t2.referenceValue === e.referenceValue;
    case 8:
      return function(t3, e2) {
        return yt(t3.geoPointValue.latitude) === yt(e2.geoPointValue.latitude) && yt(t3.geoPointValue.longitude) === yt(e2.geoPointValue.longitude);
      }(t2, e);
    case 2:
      return function(t3, e2) {
        if ("integerValue" in t3 && "integerValue" in e2)
          return yt(t3.integerValue) === yt(e2.integerValue);
        if ("doubleValue" in t3 && "doubleValue" in e2) {
          const n2 = yt(t3.doubleValue), s2 = yt(e2.doubleValue);
          return n2 === s2 ? Rt(n2) === Rt(s2) : isNaN(n2) && isNaN(s2);
        }
        return false;
      }(t2, e);
    case 9:
      return nt(t2.arrayValue.values || [], e.arrayValue.values || [], Vt);
    case 10:
      return function(t3, e2) {
        const n2 = t3.mapValue.fields || {}, s2 = e2.mapValue.fields || {};
        if (ot(n2) !== ot(s2))
          return false;
        for (const t4 in n2)
          if (n2.hasOwnProperty(t4) && (s2[t4] === void 0 || !Vt(n2[t4], s2[t4])))
            return false;
        return true;
      }(t2, e);
    default:
      return L();
  }
}
function St(t2, e) {
  return (t2.values || []).find((t3) => Vt(t3, e)) !== void 0;
}
function Dt(t2, e) {
  const n = vt(t2), s2 = vt(e);
  if (n !== s2)
    return et(n, s2);
  switch (n) {
    case 0:
      return 0;
    case 1:
      return et(t2.booleanValue, e.booleanValue);
    case 2:
      return function(t3, e2) {
        const n2 = yt(t3.integerValue || t3.doubleValue), s3 = yt(e2.integerValue || e2.doubleValue);
        return n2 < s3 ? -1 : n2 > s3 ? 1 : n2 === s3 ? 0 : isNaN(n2) ? isNaN(s3) ? 0 : -1 : 1;
      }(t2, e);
    case 3:
      return Ct(t2.timestampValue, e.timestampValue);
    case 4:
      return Ct(It(t2), It(e));
    case 5:
      return et(t2.stringValue, e.stringValue);
    case 6:
      return function(t3, e2) {
        const n2 = pt(t3), s3 = pt(e2);
        return n2.compareTo(s3);
      }(t2.bytesValue, e.bytesValue);
    case 7:
      return function(t3, e2) {
        const n2 = t3.split("/"), s3 = e2.split("/");
        for (let t4 = 0; t4 < n2.length && t4 < s3.length; t4++) {
          const e3 = et(n2[t4], s3[t4]);
          if (e3 !== 0)
            return e3;
        }
        return et(n2.length, s3.length);
      }(t2.referenceValue, e.referenceValue);
    case 8:
      return function(t3, e2) {
        const n2 = et(yt(t3.latitude), yt(e2.latitude));
        if (n2 !== 0)
          return n2;
        return et(yt(t3.longitude), yt(e2.longitude));
      }(t2.geoPointValue, e.geoPointValue);
    case 9:
      return function(t3, e2) {
        const n2 = t3.values || [], s3 = e2.values || [];
        for (let t4 = 0; t4 < n2.length && t4 < s3.length; ++t4) {
          const e3 = Dt(n2[t4], s3[t4]);
          if (e3)
            return e3;
        }
        return et(n2.length, s3.length);
      }(t2.arrayValue, e.arrayValue);
    case 10:
      return function(t3, e2) {
        const n2 = t3.fields || {}, s3 = Object.keys(n2), i = e2.fields || {}, r = Object.keys(i);
        s3.sort(), r.sort();
        for (let t4 = 0; t4 < s3.length && t4 < r.length; ++t4) {
          const e3 = et(s3[t4], r[t4]);
          if (e3 !== 0)
            return e3;
          const o = Dt(n2[s3[t4]], i[r[t4]]);
          if (o !== 0)
            return o;
        }
        return et(s3.length, r.length);
      }(t2.mapValue, e.mapValue);
    default:
      throw L();
  }
}
function Ct(t2, e) {
  if (typeof t2 == "string" && typeof e == "string" && t2.length === e.length)
    return et(t2, e);
  const n = gt(t2), s2 = gt(e), i = et(n.seconds, s2.seconds);
  return i !== 0 ? i : et(n.nanos, s2.nanos);
}
function Nt(t2) {
  return xt(t2);
}
function xt(t2) {
  return "nullValue" in t2 ? "null" : "booleanValue" in t2 ? "" + t2.booleanValue : "integerValue" in t2 ? "" + t2.integerValue : "doubleValue" in t2 ? "" + t2.doubleValue : "timestampValue" in t2 ? function(t3) {
    const e2 = gt(t3);
    return `time(${e2.seconds},${e2.nanos})`;
  }(t2.timestampValue) : "stringValue" in t2 ? t2.stringValue : "bytesValue" in t2 ? pt(t2.bytesValue).toBase64() : "referenceValue" in t2 ? (n = t2.referenceValue, Pt.fromName(n).toString()) : "geoPointValue" in t2 ? `geo(${(e = t2.geoPointValue).latitude},${e.longitude})` : "arrayValue" in t2 ? function(t3) {
    let e2 = "[", n2 = true;
    for (const s2 of t3.values || [])
      n2 ? n2 = false : e2 += ",", e2 += xt(s2);
    return e2 + "]";
  }(t2.arrayValue) : "mapValue" in t2 ? function(t3) {
    const e2 = Object.keys(t3.fields || {}).sort();
    let n2 = "{", s2 = true;
    for (const i of e2)
      s2 ? s2 = false : n2 += ",", n2 += `${i}:${xt(t3.fields[i])}`;
    return n2 + "}";
  }(t2.mapValue) : L();
  var e, n;
}
function $t(t2) {
  return !!t2 && "integerValue" in t2;
}
function Ot(t2) {
  return !!t2 && "arrayValue" in t2;
}
function Ft(t2) {
  return !!t2 && "nullValue" in t2;
}
function Mt(t2) {
  return !!t2 && "doubleValue" in t2 && isNaN(Number(t2.doubleValue));
}
function Lt(t2) {
  return !!t2 && "mapValue" in t2;
}
function Bt(t2) {
  if (t2.geoPointValue)
    return {
      geoPointValue: Object.assign({}, t2.geoPointValue)
    };
  if (t2.timestampValue && typeof t2.timestampValue == "object")
    return {
      timestampValue: Object.assign({}, t2.timestampValue)
    };
  if (t2.mapValue) {
    const e = {
      mapValue: {
        fields: {}
      }
    };
    return ct(t2.mapValue.fields, (t3, n) => e.mapValue.fields[t3] = Bt(n)), e;
  }
  if (t2.arrayValue) {
    const e = {
      arrayValue: {
        values: []
      }
    };
    for (let n = 0; n < (t2.arrayValue.values || []).length; ++n)
      e.arrayValue.values[n] = Bt(t2.arrayValue.values[n]);
    return e;
  }
  return Object.assign({}, t2);
}
var Ut = class {
  constructor(t2) {
    this.value = t2;
  }
  static empty() {
    return new Ut({
      mapValue: {}
    });
  }
  field(t2) {
    if (t2.isEmpty())
      return this.value;
    {
      let e = this.value;
      for (let n = 0; n < t2.length - 1; ++n)
        if (e = (e.mapValue.fields || {})[t2.get(n)], !Lt(e))
          return null;
      return e = (e.mapValue.fields || {})[t2.lastSegment()], e || null;
    }
  }
  set(t2, e) {
    this.getFieldsMap(t2.popLast())[t2.lastSegment()] = Bt(e);
  }
  setAll(t2) {
    let e = ft.emptyPath(), n = {}, s2 = [];
    t2.forEach((t3, i2) => {
      if (!e.isImmediateParentOf(i2)) {
        const t4 = this.getFieldsMap(e);
        this.applyChanges(t4, n, s2), n = {}, s2 = [], e = i2.popLast();
      }
      t3 ? n[i2.lastSegment()] = Bt(t3) : s2.push(i2.lastSegment());
    });
    const i = this.getFieldsMap(e);
    this.applyChanges(i, n, s2);
  }
  delete(t2) {
    const e = this.field(t2.popLast());
    Lt(e) && e.mapValue.fields && delete e.mapValue.fields[t2.lastSegment()];
  }
  isEqual(t2) {
    return Vt(this.value, t2.value);
  }
  getFieldsMap(t2) {
    let e = this.value;
    e.mapValue.fields || (e.mapValue = {
      fields: {}
    });
    for (let n = 0; n < t2.length; ++n) {
      let s2 = e.mapValue.fields[t2.get(n)];
      Lt(s2) && s2.mapValue.fields || (s2 = {
        mapValue: {
          fields: {}
        }
      }, e.mapValue.fields[t2.get(n)] = s2), e = s2;
    }
    return e.mapValue.fields;
  }
  applyChanges(t2, e, n) {
    ct(e, (e2, n2) => t2[e2] = n2);
    for (const e2 of n)
      delete t2[e2];
  }
  clone() {
    return new Ut(Bt(this.value));
  }
};
var Kt = class {
  constructor(t2, e, n, s2, i) {
    this.key = t2, this.documentType = e, this.version = n, this.data = s2, this.documentState = i;
  }
  static newInvalidDocument(t2) {
    return new Kt(t2, 0, rt.min(), Ut.empty(), 0);
  }
  static newFoundDocument(t2, e, n) {
    return new Kt(t2, 1, e, n, 0);
  }
  static newNoDocument(t2, e) {
    return new Kt(t2, 2, e, Ut.empty(), 0);
  }
  static newUnknownDocument(t2, e) {
    return new Kt(t2, 3, e, Ut.empty(), 2);
  }
  convertToFoundDocument(t2, e) {
    return this.version = t2, this.documentType = 1, this.data = e, this.documentState = 0, this;
  }
  convertToNoDocument(t2) {
    return this.version = t2, this.documentType = 2, this.data = Ut.empty(), this.documentState = 0, this;
  }
  convertToUnknownDocument(t2) {
    return this.version = t2, this.documentType = 3, this.data = Ut.empty(), this.documentState = 2, this;
  }
  setHasCommittedMutations() {
    return this.documentState = 2, this;
  }
  setHasLocalMutations() {
    return this.documentState = 1, this;
  }
  get hasLocalMutations() {
    return this.documentState === 1;
  }
  get hasCommittedMutations() {
    return this.documentState === 2;
  }
  get hasPendingWrites() {
    return this.hasLocalMutations || this.hasCommittedMutations;
  }
  isValidDocument() {
    return this.documentType !== 0;
  }
  isFoundDocument() {
    return this.documentType === 1;
  }
  isNoDocument() {
    return this.documentType === 2;
  }
  isUnknownDocument() {
    return this.documentType === 3;
  }
  isEqual(t2) {
    return t2 instanceof Kt && this.key.isEqual(t2.key) && this.version.isEqual(t2.version) && this.documentType === t2.documentType && this.documentState === t2.documentState && this.data.isEqual(t2.data);
  }
  clone() {
    return new Kt(this.key, this.documentType, this.version, this.data.clone(), this.documentState);
  }
  toString() {
    return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
  }
};
var jt = class {
  constructor(t2, e = null, n = [], s2 = [], i = null, r = null, o = null) {
    this.path = t2, this.collectionGroup = e, this.orderBy = n, this.filters = s2, this.limit = i, this.startAt = r, this.endAt = o, this.A = null;
  }
};
function Qt(t2, e = null, n = [], s2 = [], i = null, r = null, o = null) {
  return new jt(t2, e, n, s2, i, r, o);
}
function Wt(t2) {
  const e = q(t2);
  if (e.A === null) {
    let t3 = e.path.canonicalString();
    e.collectionGroup !== null && (t3 += "|cg:" + e.collectionGroup), t3 += "|f:", t3 += e.filters.map((t4) => Yt(t4)).join(","), t3 += "|ob:", t3 += e.orderBy.map((t4) => function(t5) {
      return t5.field.canonicalString() + t5.dir;
    }(t4)).join(","), At(e.limit) || (t3 += "|l:", t3 += e.limit), e.startAt && (t3 += "|lb:", t3 += ce(e.startAt)), e.endAt && (t3 += "|ub:", t3 += ce(e.endAt)), e.A = t3;
  }
  return e.A;
}
function Gt(t2) {
  let e = t2.path.canonicalString();
  return t2.collectionGroup !== null && (e += " collectionGroup=" + t2.collectionGroup), t2.filters.length > 0 && (e += `, filters: [${t2.filters.map((t3) => {
    return `${(e2 = t3).field.canonicalString()} ${e2.op} ${Nt(e2.value)}`;
    var e2;
  }).join(", ")}]`), At(t2.limit) || (e += ", limit: " + t2.limit), t2.orderBy.length > 0 && (e += `, orderBy: [${t2.orderBy.map((t3) => function(t4) {
    return `${t4.field.canonicalString()} (${t4.dir})`;
  }(t3)).join(", ")}]`), t2.startAt && (e += ", startAt: " + ce(t2.startAt)), t2.endAt && (e += ", endAt: " + ce(t2.endAt)), `Target(${e})`;
}
function zt(t2, e) {
  if (t2.limit !== e.limit)
    return false;
  if (t2.orderBy.length !== e.orderBy.length)
    return false;
  for (let n2 = 0; n2 < t2.orderBy.length; n2++)
    if (!ue(t2.orderBy[n2], e.orderBy[n2]))
      return false;
  if (t2.filters.length !== e.filters.length)
    return false;
  for (let i = 0; i < t2.filters.length; i++)
    if (n = t2.filters[i], s2 = e.filters[i], n.op !== s2.op || !n.field.isEqual(s2.field) || !Vt(n.value, s2.value))
      return false;
  var n, s2;
  return t2.collectionGroup === e.collectionGroup && (!!t2.path.isEqual(e.path) && (!!le(t2.startAt, e.startAt) && le(t2.endAt, e.endAt)));
}
function Ht(t2) {
  return Pt.isDocumentKey(t2.path) && t2.collectionGroup === null && t2.filters.length === 0;
}
var Jt = class extends class {
} {
  constructor(t2, e, n) {
    super(), this.field = t2, this.op = e, this.value = n;
  }
  static create(t2, e, n) {
    return t2.isKeyField() ? e === "in" || e === "not-in" ? this.R(t2, e, n) : new Xt(t2, e, n) : e === "array-contains" ? new ne(t2, n) : e === "in" ? new se(t2, n) : e === "not-in" ? new ie(t2, n) : e === "array-contains-any" ? new re(t2, n) : new Jt(t2, e, n);
  }
  static R(t2, e, n) {
    return e === "in" ? new Zt(t2, n) : new te(t2, n);
  }
  matches(t2) {
    const e = t2.data.field(this.field);
    return this.op === "!=" ? e !== null && this.P(Dt(e, this.value)) : e !== null && vt(this.value) === vt(e) && this.P(Dt(e, this.value));
  }
  P(t2) {
    switch (this.op) {
      case "<":
        return t2 < 0;
      case "<=":
        return t2 <= 0;
      case "==":
        return t2 === 0;
      case "!=":
        return t2 !== 0;
      case ">":
        return t2 > 0;
      case ">=":
        return t2 >= 0;
      default:
        return L();
    }
  }
  v() {
    return ["<", "<=", ">", ">=", "!=", "not-in"].indexOf(this.op) >= 0;
  }
};
function Yt(t2) {
  return t2.field.canonicalString() + t2.op.toString() + Nt(t2.value);
}
var Xt = class extends Jt {
  constructor(t2, e, n) {
    super(t2, e, n), this.key = Pt.fromName(n.referenceValue);
  }
  matches(t2) {
    const e = Pt.comparator(t2.key, this.key);
    return this.P(e);
  }
};
var Zt = class extends Jt {
  constructor(t2, e) {
    super(t2, "in", e), this.keys = ee("in", e);
  }
  matches(t2) {
    return this.keys.some((e) => e.isEqual(t2.key));
  }
};
var te = class extends Jt {
  constructor(t2, e) {
    super(t2, "not-in", e), this.keys = ee("not-in", e);
  }
  matches(t2) {
    return !this.keys.some((e) => e.isEqual(t2.key));
  }
};
function ee(t2, e) {
  var n;
  return (((n = e.arrayValue) === null || n === void 0 ? void 0 : n.values) || []).map((t3) => Pt.fromName(t3.referenceValue));
}
var ne = class extends Jt {
  constructor(t2, e) {
    super(t2, "array-contains", e);
  }
  matches(t2) {
    const e = t2.data.field(this.field);
    return Ot(e) && St(e.arrayValue, this.value);
  }
};
var se = class extends Jt {
  constructor(t2, e) {
    super(t2, "in", e);
  }
  matches(t2) {
    const e = t2.data.field(this.field);
    return e !== null && St(this.value.arrayValue, e);
  }
};
var ie = class extends Jt {
  constructor(t2, e) {
    super(t2, "not-in", e);
  }
  matches(t2) {
    if (St(this.value.arrayValue, {
      nullValue: "NULL_VALUE"
    }))
      return false;
    const e = t2.data.field(this.field);
    return e !== null && !St(this.value.arrayValue, e);
  }
};
var re = class extends Jt {
  constructor(t2, e) {
    super(t2, "array-contains-any", e);
  }
  matches(t2) {
    const e = t2.data.field(this.field);
    return !(!Ot(e) || !e.arrayValue.values) && e.arrayValue.values.some((t3) => St(this.value.arrayValue, t3));
  }
};
var oe = class {
  constructor(t2, e) {
    this.position = t2, this.before = e;
  }
};
function ce(t2) {
  return `${t2.before ? "b" : "a"}:${t2.position.map((t3) => Nt(t3)).join(",")}`;
}
var ae = class {
  constructor(t2, e = "asc") {
    this.field = t2, this.dir = e;
  }
};
function ue(t2, e) {
  return t2.dir === e.dir && t2.field.isEqual(e.field);
}
function he(t2, e, n) {
  let s2 = 0;
  for (let i = 0; i < t2.position.length; i++) {
    const r = e[i], o = t2.position[i];
    if (r.field.isKeyField())
      s2 = Pt.comparator(Pt.fromName(o.referenceValue), n.key);
    else {
      s2 = Dt(o, n.data.field(r.field));
    }
    if (r.dir === "desc" && (s2 *= -1), s2 !== 0)
      break;
  }
  return t2.before ? s2 <= 0 : s2 < 0;
}
function le(t2, e) {
  if (t2 === null)
    return e === null;
  if (e === null)
    return false;
  if (t2.before !== e.before || t2.position.length !== e.position.length)
    return false;
  for (let n = 0; n < t2.position.length; n++) {
    if (!Vt(t2.position[n], e.position[n]))
      return false;
  }
  return true;
}
var fe = class {
  constructor(t2, e = null, n = [], s2 = [], i = null, r = "F", o = null, c = null) {
    this.path = t2, this.collectionGroup = e, this.explicitOrderBy = n, this.filters = s2, this.limit = i, this.limitType = r, this.startAt = o, this.endAt = c, this.V = null, this.S = null, this.startAt, this.endAt;
  }
};
function de(t2, e, n, s2, i, r, o, c) {
  return new fe(t2, e, n, s2, i, r, o, c);
}
function we(t2) {
  return new fe(t2);
}
function _e(t2) {
  return !At(t2.limit) && t2.limitType === "F";
}
function me(t2) {
  return !At(t2.limit) && t2.limitType === "L";
}
function ge(t2) {
  return t2.explicitOrderBy.length > 0 ? t2.explicitOrderBy[0].field : null;
}
function ye(t2) {
  for (const e of t2.filters)
    if (e.v())
      return e.field;
  return null;
}
function pe(t2) {
  return t2.collectionGroup !== null;
}
function Te(t2) {
  const e = q(t2);
  if (e.V === null) {
    e.V = [];
    const t3 = ye(e), n = ge(e);
    if (t3 !== null && n === null)
      t3.isKeyField() || e.V.push(new ae(t3)), e.V.push(new ae(ft.keyField(), "asc"));
    else {
      let t4 = false;
      for (const n2 of e.explicitOrderBy)
        e.V.push(n2), n2.field.isKeyField() && (t4 = true);
      if (!t4) {
        const t5 = e.explicitOrderBy.length > 0 ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir : "asc";
        e.V.push(new ae(ft.keyField(), t5));
      }
    }
  }
  return e.V;
}
function Ee(t2) {
  const e = q(t2);
  if (!e.S)
    if (e.limitType === "F")
      e.S = Qt(e.path, e.collectionGroup, Te(e), e.filters, e.limit, e.startAt, e.endAt);
    else {
      const t3 = [];
      for (const n2 of Te(e)) {
        const e2 = n2.dir === "desc" ? "asc" : "desc";
        t3.push(new ae(n2.field, e2));
      }
      const n = e.endAt ? new oe(e.endAt.position, !e.endAt.before) : null, s2 = e.startAt ? new oe(e.startAt.position, !e.startAt.before) : null;
      e.S = Qt(e.path, e.collectionGroup, t3, e.filters, e.limit, n, s2);
    }
  return e.S;
}
function Ie(t2, e, n) {
  return new fe(t2.path, t2.collectionGroup, t2.explicitOrderBy.slice(), t2.filters.slice(), e, n, t2.startAt, t2.endAt);
}
function Ae(t2, e) {
  return zt(Ee(t2), Ee(e)) && t2.limitType === e.limitType;
}
function Re(t2) {
  return `${Wt(Ee(t2))}|lt:${t2.limitType}`;
}
function be(t2) {
  return `Query(target=${Gt(Ee(t2))}; limitType=${t2.limitType})`;
}
function Pe(t2, e) {
  return e.isFoundDocument() && function(t3, e2) {
    const n = e2.key.path;
    return t3.collectionGroup !== null ? e2.key.hasCollectionId(t3.collectionGroup) && t3.path.isPrefixOf(n) : Pt.isDocumentKey(t3.path) ? t3.path.isEqual(n) : t3.path.isImmediateParentOf(n);
  }(t2, e) && function(t3, e2) {
    for (const n of t3.explicitOrderBy)
      if (!n.field.isKeyField() && e2.data.field(n.field) === null)
        return false;
    return true;
  }(t2, e) && function(t3, e2) {
    for (const n of t3.filters)
      if (!n.matches(e2))
        return false;
    return true;
  }(t2, e) && function(t3, e2) {
    if (t3.startAt && !he(t3.startAt, Te(t3), e2))
      return false;
    if (t3.endAt && he(t3.endAt, Te(t3), e2))
      return false;
    return true;
  }(t2, e);
}
function ve(t2) {
  return (e, n) => {
    let s2 = false;
    for (const i of Te(t2)) {
      const t3 = Ve(i, e, n);
      if (t3 !== 0)
        return t3;
      s2 = s2 || i.field.isKeyField();
    }
    return 0;
  };
}
function Ve(t2, e, n) {
  const s2 = t2.field.isKeyField() ? Pt.comparator(e.key, n.key) : function(t3, e2, n2) {
    const s3 = e2.data.field(t3), i = n2.data.field(t3);
    return s3 !== null && i !== null ? Dt(s3, i) : L();
  }(t2.field, e, n);
  switch (t2.dir) {
    case "asc":
      return s2;
    case "desc":
      return -1 * s2;
    default:
      return L();
  }
}
function Se(t2, e) {
  if (t2.D) {
    if (isNaN(e))
      return {
        doubleValue: "NaN"
      };
    if (e === 1 / 0)
      return {
        doubleValue: "Infinity"
      };
    if (e === -1 / 0)
      return {
        doubleValue: "-Infinity"
      };
  }
  return {
    doubleValue: Rt(e) ? "-0" : e
  };
}
function De(t2) {
  return {
    integerValue: "" + t2
  };
}
var Ne = class {
  constructor() {
    this._ = void 0;
  }
};
function xe(t2, e, n) {
  return t2 instanceof Oe ? function(t3, e2) {
    const n2 = {
      fields: {
        __type__: {
          stringValue: "server_timestamp"
        },
        __local_write_time__: {
          timestampValue: {
            seconds: t3.seconds,
            nanos: t3.nanoseconds
          }
        }
      }
    };
    return e2 && (n2.fields.__previous_value__ = e2), {
      mapValue: n2
    };
  }(n, e) : t2 instanceof Fe ? Me(t2, e) : t2 instanceof Le ? Be(t2, e) : function(t3, e2) {
    const n2 = $e(t3, e2), s2 = qe(n2) + qe(t3.C);
    return $t(n2) && $t(t3.C) ? De(s2) : Se(t3.N, s2);
  }(t2, e);
}
function ke(t2, e, n) {
  return t2 instanceof Fe ? Me(t2, e) : t2 instanceof Le ? Be(t2, e) : n;
}
function $e(t2, e) {
  return t2 instanceof Ue ? $t(n = e) || function(t3) {
    return !!t3 && "doubleValue" in t3;
  }(n) ? e : {
    integerValue: 0
  } : null;
  var n;
}
var Oe = class extends Ne {
};
var Fe = class extends Ne {
  constructor(t2) {
    super(), this.elements = t2;
  }
};
function Me(t2, e) {
  const n = Ke(e);
  for (const e2 of t2.elements)
    n.some((t3) => Vt(t3, e2)) || n.push(e2);
  return {
    arrayValue: {
      values: n
    }
  };
}
var Le = class extends Ne {
  constructor(t2) {
    super(), this.elements = t2;
  }
};
function Be(t2, e) {
  let n = Ke(e);
  for (const e2 of t2.elements)
    n = n.filter((t3) => !Vt(t3, e2));
  return {
    arrayValue: {
      values: n
    }
  };
}
var Ue = class extends Ne {
  constructor(t2, e) {
    super(), this.N = t2, this.C = e;
  }
};
function qe(t2) {
  return yt(t2.integerValue || t2.doubleValue);
}
function Ke(t2) {
  return Ot(t2) && t2.arrayValue.values ? t2.arrayValue.values.slice() : [];
}
function Qe(t2, e) {
  return t2.field.isEqual(e.field) && function(t3, e2) {
    return t3 instanceof Fe && e2 instanceof Fe || t3 instanceof Le && e2 instanceof Le ? nt(t3.elements, e2.elements, Vt) : t3 instanceof Ue && e2 instanceof Ue ? Vt(t3.C, e2.C) : t3 instanceof Oe && e2 instanceof Oe;
  }(t2.transform, e.transform);
}
function ze(t2, e) {
  return t2.updateTime !== void 0 ? e.isFoundDocument() && e.version.isEqual(t2.updateTime) : t2.exists === void 0 || t2.exists === e.isFoundDocument();
}
var He = class {
};
function Je(t2, e, n) {
  t2 instanceof en ? function(t3, e2, n2) {
    const s2 = t3.value.clone(), i = rn(t3.fieldTransforms, e2, n2.transformResults);
    s2.setAll(i), e2.convertToFoundDocument(n2.version, s2).setHasCommittedMutations();
  }(t2, e, n) : t2 instanceof nn ? function(t3, e2, n2) {
    if (!ze(t3.precondition, e2))
      return void e2.convertToUnknownDocument(n2.version);
    const s2 = rn(t3.fieldTransforms, e2, n2.transformResults), i = e2.data;
    i.setAll(sn(t3)), i.setAll(s2), e2.convertToFoundDocument(n2.version, i).setHasCommittedMutations();
  }(t2, e, n) : function(t3, e2, n2) {
    e2.convertToNoDocument(n2.version).setHasCommittedMutations();
  }(0, e, n);
}
function Ye(t2, e, n) {
  t2 instanceof en ? function(t3, e2, n2) {
    if (!ze(t3.precondition, e2))
      return;
    const s2 = t3.value.clone(), i = on(t3.fieldTransforms, n2, e2);
    s2.setAll(i), e2.convertToFoundDocument(tn(e2), s2).setHasLocalMutations();
  }(t2, e, n) : t2 instanceof nn ? function(t3, e2, n2) {
    if (!ze(t3.precondition, e2))
      return;
    const s2 = on(t3.fieldTransforms, n2, e2), i = e2.data;
    i.setAll(sn(t3)), i.setAll(s2), e2.convertToFoundDocument(tn(e2), i).setHasLocalMutations();
  }(t2, e, n) : function(t3, e2) {
    ze(t3.precondition, e2) && e2.convertToNoDocument(rt.min());
  }(t2, e);
}
function Ze(t2, e) {
  return t2.type === e.type && (!!t2.key.isEqual(e.key) && (!!t2.precondition.isEqual(e.precondition) && (!!function(t3, e2) {
    return t3 === void 0 && e2 === void 0 || !(!t3 || !e2) && nt(t3, e2, (t4, e3) => Qe(t4, e3));
  }(t2.fieldTransforms, e.fieldTransforms) && (t2.type === 0 ? t2.value.isEqual(e.value) : t2.type !== 1 || t2.data.isEqual(e.data) && t2.fieldMask.isEqual(e.fieldMask)))));
}
function tn(t2) {
  return t2.isFoundDocument() ? t2.version : rt.min();
}
var en = class extends He {
  constructor(t2, e, n, s2 = []) {
    super(), this.key = t2, this.value = e, this.precondition = n, this.fieldTransforms = s2, this.type = 0;
  }
};
var nn = class extends He {
  constructor(t2, e, n, s2, i = []) {
    super(), this.key = t2, this.data = e, this.fieldMask = n, this.precondition = s2, this.fieldTransforms = i, this.type = 1;
  }
};
function sn(t2) {
  const e = new Map();
  return t2.fieldMask.fields.forEach((n) => {
    if (!n.isEmpty()) {
      const s2 = t2.data.field(n);
      e.set(n, s2);
    }
  }), e;
}
function rn(t2, e, n) {
  const s2 = new Map();
  B(t2.length === n.length);
  for (let i = 0; i < n.length; i++) {
    const r = t2[i], o = r.transform, c = e.data.field(r.field);
    s2.set(r.field, ke(o, c, n[i]));
  }
  return s2;
}
function on(t2, e, n) {
  const s2 = new Map();
  for (const i of t2) {
    const t3 = i.transform, r = n.data.field(i.field);
    s2.set(i.field, xe(t3, r, e));
  }
  return s2;
}
var un = class {
  constructor(t2) {
    this.count = t2;
  }
};
var hn;
var ln;
function dn(t2) {
  if (t2 === void 0)
    return O("GRPC error has no .code"), K.UNKNOWN;
  switch (t2) {
    case hn.OK:
      return K.OK;
    case hn.CANCELLED:
      return K.CANCELLED;
    case hn.UNKNOWN:
      return K.UNKNOWN;
    case hn.DEADLINE_EXCEEDED:
      return K.DEADLINE_EXCEEDED;
    case hn.RESOURCE_EXHAUSTED:
      return K.RESOURCE_EXHAUSTED;
    case hn.INTERNAL:
      return K.INTERNAL;
    case hn.UNAVAILABLE:
      return K.UNAVAILABLE;
    case hn.UNAUTHENTICATED:
      return K.UNAUTHENTICATED;
    case hn.INVALID_ARGUMENT:
      return K.INVALID_ARGUMENT;
    case hn.NOT_FOUND:
      return K.NOT_FOUND;
    case hn.ALREADY_EXISTS:
      return K.ALREADY_EXISTS;
    case hn.PERMISSION_DENIED:
      return K.PERMISSION_DENIED;
    case hn.FAILED_PRECONDITION:
      return K.FAILED_PRECONDITION;
    case hn.ABORTED:
      return K.ABORTED;
    case hn.OUT_OF_RANGE:
      return K.OUT_OF_RANGE;
    case hn.UNIMPLEMENTED:
      return K.UNIMPLEMENTED;
    case hn.DATA_LOSS:
      return K.DATA_LOSS;
    default:
      return L();
  }
}
(ln = hn || (hn = {}))[ln.OK = 0] = "OK", ln[ln.CANCELLED = 1] = "CANCELLED", ln[ln.UNKNOWN = 2] = "UNKNOWN", ln[ln.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", ln[ln.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", ln[ln.NOT_FOUND = 5] = "NOT_FOUND", ln[ln.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", ln[ln.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", ln[ln.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", ln[ln.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", ln[ln.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", ln[ln.ABORTED = 10] = "ABORTED", ln[ln.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", ln[ln.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", ln[ln.INTERNAL = 13] = "INTERNAL", ln[ln.UNAVAILABLE = 14] = "UNAVAILABLE", ln[ln.DATA_LOSS = 15] = "DATA_LOSS";
var wn = class {
  constructor(t2, e) {
    this.comparator = t2, this.root = e || mn.EMPTY;
  }
  insert(t2, e) {
    return new wn(this.comparator, this.root.insert(t2, e, this.comparator).copy(null, null, mn.BLACK, null, null));
  }
  remove(t2) {
    return new wn(this.comparator, this.root.remove(t2, this.comparator).copy(null, null, mn.BLACK, null, null));
  }
  get(t2) {
    let e = this.root;
    for (; !e.isEmpty(); ) {
      const n = this.comparator(t2, e.key);
      if (n === 0)
        return e.value;
      n < 0 ? e = e.left : n > 0 && (e = e.right);
    }
    return null;
  }
  indexOf(t2) {
    let e = 0, n = this.root;
    for (; !n.isEmpty(); ) {
      const s2 = this.comparator(t2, n.key);
      if (s2 === 0)
        return e + n.left.size;
      s2 < 0 ? n = n.left : (e += n.left.size + 1, n = n.right);
    }
    return -1;
  }
  isEmpty() {
    return this.root.isEmpty();
  }
  get size() {
    return this.root.size;
  }
  minKey() {
    return this.root.minKey();
  }
  maxKey() {
    return this.root.maxKey();
  }
  inorderTraversal(t2) {
    return this.root.inorderTraversal(t2);
  }
  forEach(t2) {
    this.inorderTraversal((e, n) => (t2(e, n), false));
  }
  toString() {
    const t2 = [];
    return this.inorderTraversal((e, n) => (t2.push(`${e}:${n}`), false)), `{${t2.join(", ")}}`;
  }
  reverseTraversal(t2) {
    return this.root.reverseTraversal(t2);
  }
  getIterator() {
    return new _n(this.root, null, this.comparator, false);
  }
  getIteratorFrom(t2) {
    return new _n(this.root, t2, this.comparator, false);
  }
  getReverseIterator() {
    return new _n(this.root, null, this.comparator, true);
  }
  getReverseIteratorFrom(t2) {
    return new _n(this.root, t2, this.comparator, true);
  }
};
var _n = class {
  constructor(t2, e, n, s2) {
    this.isReverse = s2, this.nodeStack = [];
    let i = 1;
    for (; !t2.isEmpty(); )
      if (i = e ? n(t2.key, e) : 1, s2 && (i *= -1), i < 0)
        t2 = this.isReverse ? t2.left : t2.right;
      else {
        if (i === 0) {
          this.nodeStack.push(t2);
          break;
        }
        this.nodeStack.push(t2), t2 = this.isReverse ? t2.right : t2.left;
      }
  }
  getNext() {
    let t2 = this.nodeStack.pop();
    const e = {
      key: t2.key,
      value: t2.value
    };
    if (this.isReverse)
      for (t2 = t2.left; !t2.isEmpty(); )
        this.nodeStack.push(t2), t2 = t2.right;
    else
      for (t2 = t2.right; !t2.isEmpty(); )
        this.nodeStack.push(t2), t2 = t2.left;
    return e;
  }
  hasNext() {
    return this.nodeStack.length > 0;
  }
  peek() {
    if (this.nodeStack.length === 0)
      return null;
    const t2 = this.nodeStack[this.nodeStack.length - 1];
    return {
      key: t2.key,
      value: t2.value
    };
  }
};
var mn = class {
  constructor(t2, e, n, s2, i) {
    this.key = t2, this.value = e, this.color = n != null ? n : mn.RED, this.left = s2 != null ? s2 : mn.EMPTY, this.right = i != null ? i : mn.EMPTY, this.size = this.left.size + 1 + this.right.size;
  }
  copy(t2, e, n, s2, i) {
    return new mn(t2 != null ? t2 : this.key, e != null ? e : this.value, n != null ? n : this.color, s2 != null ? s2 : this.left, i != null ? i : this.right);
  }
  isEmpty() {
    return false;
  }
  inorderTraversal(t2) {
    return this.left.inorderTraversal(t2) || t2(this.key, this.value) || this.right.inorderTraversal(t2);
  }
  reverseTraversal(t2) {
    return this.right.reverseTraversal(t2) || t2(this.key, this.value) || this.left.reverseTraversal(t2);
  }
  min() {
    return this.left.isEmpty() ? this : this.left.min();
  }
  minKey() {
    return this.min().key;
  }
  maxKey() {
    return this.right.isEmpty() ? this.key : this.right.maxKey();
  }
  insert(t2, e, n) {
    let s2 = this;
    const i = n(t2, s2.key);
    return s2 = i < 0 ? s2.copy(null, null, null, s2.left.insert(t2, e, n), null) : i === 0 ? s2.copy(null, e, null, null, null) : s2.copy(null, null, null, null, s2.right.insert(t2, e, n)), s2.fixUp();
  }
  removeMin() {
    if (this.left.isEmpty())
      return mn.EMPTY;
    let t2 = this;
    return t2.left.isRed() || t2.left.left.isRed() || (t2 = t2.moveRedLeft()), t2 = t2.copy(null, null, null, t2.left.removeMin(), null), t2.fixUp();
  }
  remove(t2, e) {
    let n, s2 = this;
    if (e(t2, s2.key) < 0)
      s2.left.isEmpty() || s2.left.isRed() || s2.left.left.isRed() || (s2 = s2.moveRedLeft()), s2 = s2.copy(null, null, null, s2.left.remove(t2, e), null);
    else {
      if (s2.left.isRed() && (s2 = s2.rotateRight()), s2.right.isEmpty() || s2.right.isRed() || s2.right.left.isRed() || (s2 = s2.moveRedRight()), e(t2, s2.key) === 0) {
        if (s2.right.isEmpty())
          return mn.EMPTY;
        n = s2.right.min(), s2 = s2.copy(n.key, n.value, null, null, s2.right.removeMin());
      }
      s2 = s2.copy(null, null, null, null, s2.right.remove(t2, e));
    }
    return s2.fixUp();
  }
  isRed() {
    return this.color;
  }
  fixUp() {
    let t2 = this;
    return t2.right.isRed() && !t2.left.isRed() && (t2 = t2.rotateLeft()), t2.left.isRed() && t2.left.left.isRed() && (t2 = t2.rotateRight()), t2.left.isRed() && t2.right.isRed() && (t2 = t2.colorFlip()), t2;
  }
  moveRedLeft() {
    let t2 = this.colorFlip();
    return t2.right.left.isRed() && (t2 = t2.copy(null, null, null, null, t2.right.rotateRight()), t2 = t2.rotateLeft(), t2 = t2.colorFlip()), t2;
  }
  moveRedRight() {
    let t2 = this.colorFlip();
    return t2.left.left.isRed() && (t2 = t2.rotateRight(), t2 = t2.colorFlip()), t2;
  }
  rotateLeft() {
    const t2 = this.copy(null, null, mn.RED, null, this.right.left);
    return this.right.copy(null, null, this.color, t2, null);
  }
  rotateRight() {
    const t2 = this.copy(null, null, mn.RED, this.left.right, null);
    return this.left.copy(null, null, this.color, null, t2);
  }
  colorFlip() {
    const t2 = this.left.copy(null, null, !this.left.color, null, null), e = this.right.copy(null, null, !this.right.color, null, null);
    return this.copy(null, null, !this.color, t2, e);
  }
  checkMaxDepth() {
    const t2 = this.check();
    return Math.pow(2, t2) <= this.size + 1;
  }
  check() {
    if (this.isRed() && this.left.isRed())
      throw L();
    if (this.right.isRed())
      throw L();
    const t2 = this.left.check();
    if (t2 !== this.right.check())
      throw L();
    return t2 + (this.isRed() ? 0 : 1);
  }
};
mn.EMPTY = null, mn.RED = true, mn.BLACK = false;
mn.EMPTY = new class {
  constructor() {
    this.size = 0;
  }
  get key() {
    throw L();
  }
  get value() {
    throw L();
  }
  get color() {
    throw L();
  }
  get left() {
    throw L();
  }
  get right() {
    throw L();
  }
  copy(t2, e, n, s2, i) {
    return this;
  }
  insert(t2, e, n) {
    return new mn(t2, e);
  }
  remove(t2, e) {
    return this;
  }
  isEmpty() {
    return true;
  }
  inorderTraversal(t2) {
    return false;
  }
  reverseTraversal(t2) {
    return false;
  }
  minKey() {
    return null;
  }
  maxKey() {
    return null;
  }
  isRed() {
    return false;
  }
  checkMaxDepth() {
    return true;
  }
  check() {
    return 0;
  }
}();
var gn = class {
  constructor(t2) {
    this.comparator = t2, this.data = new wn(this.comparator);
  }
  has(t2) {
    return this.data.get(t2) !== null;
  }
  first() {
    return this.data.minKey();
  }
  last() {
    return this.data.maxKey();
  }
  get size() {
    return this.data.size;
  }
  indexOf(t2) {
    return this.data.indexOf(t2);
  }
  forEach(t2) {
    this.data.inorderTraversal((e, n) => (t2(e), false));
  }
  forEachInRange(t2, e) {
    const n = this.data.getIteratorFrom(t2[0]);
    for (; n.hasNext(); ) {
      const s2 = n.getNext();
      if (this.comparator(s2.key, t2[1]) >= 0)
        return;
      e(s2.key);
    }
  }
  forEachWhile(t2, e) {
    let n;
    for (n = e !== void 0 ? this.data.getIteratorFrom(e) : this.data.getIterator(); n.hasNext(); ) {
      if (!t2(n.getNext().key))
        return;
    }
  }
  firstAfterOrEqual(t2) {
    const e = this.data.getIteratorFrom(t2);
    return e.hasNext() ? e.getNext().key : null;
  }
  getIterator() {
    return new yn(this.data.getIterator());
  }
  getIteratorFrom(t2) {
    return new yn(this.data.getIteratorFrom(t2));
  }
  add(t2) {
    return this.copy(this.data.remove(t2).insert(t2, true));
  }
  delete(t2) {
    return this.has(t2) ? this.copy(this.data.remove(t2)) : this;
  }
  isEmpty() {
    return this.data.isEmpty();
  }
  unionWith(t2) {
    let e = this;
    return e.size < t2.size && (e = t2, t2 = this), t2.forEach((t3) => {
      e = e.add(t3);
    }), e;
  }
  isEqual(t2) {
    if (!(t2 instanceof gn))
      return false;
    if (this.size !== t2.size)
      return false;
    const e = this.data.getIterator(), n = t2.data.getIterator();
    for (; e.hasNext(); ) {
      const t3 = e.getNext().key, s2 = n.getNext().key;
      if (this.comparator(t3, s2) !== 0)
        return false;
    }
    return true;
  }
  toArray() {
    const t2 = [];
    return this.forEach((e) => {
      t2.push(e);
    }), t2;
  }
  toString() {
    const t2 = [];
    return this.forEach((e) => t2.push(e)), "SortedSet(" + t2.toString() + ")";
  }
  copy(t2) {
    const e = new gn(this.comparator);
    return e.data = t2, e;
  }
};
var yn = class {
  constructor(t2) {
    this.iter = t2;
  }
  getNext() {
    return this.iter.getNext().key;
  }
  hasNext() {
    return this.iter.hasNext();
  }
};
var pn = new wn(Pt.comparator);
function Tn() {
  return pn;
}
var En = new wn(Pt.comparator);
function In() {
  return En;
}
new wn(Pt.comparator);
var bn = new gn(Pt.comparator);
function Pn(...t2) {
  let e = bn;
  for (const n of t2)
    e = e.add(n);
  return e;
}
var vn = new gn(et);
function Vn() {
  return vn;
}
var Sn = class {
  constructor(t2, e, n, s2, i) {
    this.snapshotVersion = t2, this.targetChanges = e, this.targetMismatches = n, this.documentUpdates = s2, this.resolvedLimboDocuments = i;
  }
  static createSynthesizedRemoteEventForCurrentChange(t2, e) {
    const n = new Map();
    return n.set(t2, Dn.createSynthesizedTargetChangeForCurrentChange(t2, e)), new Sn(rt.min(), n, Vn(), Tn(), Pn());
  }
};
var Dn = class {
  constructor(t2, e, n, s2, i) {
    this.resumeToken = t2, this.current = e, this.addedDocuments = n, this.modifiedDocuments = s2, this.removedDocuments = i;
  }
  static createSynthesizedTargetChangeForCurrentChange(t2, e) {
    return new Dn(_t.EMPTY_BYTE_STRING, e, Pn(), Pn(), Pn());
  }
};
var Cn = class {
  constructor(t2, e, n, s2) {
    this.k = t2, this.removedTargetIds = e, this.key = n, this.$ = s2;
  }
};
var Nn = class {
  constructor(t2, e) {
    this.targetId = t2, this.O = e;
  }
};
var xn = class {
  constructor(t2, e, n = _t.EMPTY_BYTE_STRING, s2 = null) {
    this.state = t2, this.targetIds = e, this.resumeToken = n, this.cause = s2;
  }
};
var kn = class {
  constructor() {
    this.F = 0, this.M = Fn(), this.L = _t.EMPTY_BYTE_STRING, this.B = false, this.U = true;
  }
  get current() {
    return this.B;
  }
  get resumeToken() {
    return this.L;
  }
  get q() {
    return this.F !== 0;
  }
  get K() {
    return this.U;
  }
  j(t2) {
    t2.approximateByteSize() > 0 && (this.U = true, this.L = t2);
  }
  W() {
    let t2 = Pn(), e = Pn(), n = Pn();
    return this.M.forEach((s2, i) => {
      switch (i) {
        case 0:
          t2 = t2.add(s2);
          break;
        case 2:
          e = e.add(s2);
          break;
        case 1:
          n = n.add(s2);
          break;
        default:
          L();
      }
    }), new Dn(this.L, this.B, t2, e, n);
  }
  G() {
    this.U = false, this.M = Fn();
  }
  H(t2, e) {
    this.U = true, this.M = this.M.insert(t2, e);
  }
  J(t2) {
    this.U = true, this.M = this.M.remove(t2);
  }
  Y() {
    this.F += 1;
  }
  X() {
    this.F -= 1;
  }
  Z() {
    this.U = true, this.B = true;
  }
};
var $n = class {
  constructor(t2) {
    this.tt = t2, this.et = new Map(), this.nt = Tn(), this.st = On(), this.it = new gn(et);
  }
  rt(t2) {
    for (const e of t2.k)
      t2.$ && t2.$.isFoundDocument() ? this.ot(e, t2.$) : this.ct(e, t2.key, t2.$);
    for (const e of t2.removedTargetIds)
      this.ct(e, t2.key, t2.$);
  }
  at(t2) {
    this.forEachTarget(t2, (e) => {
      const n = this.ut(e);
      switch (t2.state) {
        case 0:
          this.ht(e) && n.j(t2.resumeToken);
          break;
        case 1:
          n.X(), n.q || n.G(), n.j(t2.resumeToken);
          break;
        case 2:
          n.X(), n.q || this.removeTarget(e);
          break;
        case 3:
          this.ht(e) && (n.Z(), n.j(t2.resumeToken));
          break;
        case 4:
          this.ht(e) && (this.lt(e), n.j(t2.resumeToken));
          break;
        default:
          L();
      }
    });
  }
  forEachTarget(t2, e) {
    t2.targetIds.length > 0 ? t2.targetIds.forEach(e) : this.et.forEach((t3, n) => {
      this.ht(n) && e(n);
    });
  }
  ft(t2) {
    const e = t2.targetId, n = t2.O.count, s2 = this.dt(e);
    if (s2) {
      const t3 = s2.target;
      if (Ht(t3))
        if (n === 0) {
          const n2 = new Pt(t3.path);
          this.ct(e, n2, Kt.newNoDocument(n2, rt.min()));
        } else
          B(n === 1);
      else {
        this.wt(e) !== n && (this.lt(e), this.it = this.it.add(e));
      }
    }
  }
  _t(t2) {
    const e = new Map();
    this.et.forEach((n2, s3) => {
      const i = this.dt(s3);
      if (i) {
        if (n2.current && Ht(i.target)) {
          const e2 = new Pt(i.target.path);
          this.nt.get(e2) !== null || this.gt(s3, e2) || this.ct(s3, e2, Kt.newNoDocument(e2, t2));
        }
        n2.K && (e.set(s3, n2.W()), n2.G());
      }
    });
    let n = Pn();
    this.st.forEach((t3, e2) => {
      let s3 = true;
      e2.forEachWhile((t4) => {
        const e3 = this.dt(t4);
        return !e3 || e3.purpose === 2 || (s3 = false, false);
      }), s3 && (n = n.add(t3));
    });
    const s2 = new Sn(t2, e, this.it, this.nt, n);
    return this.nt = Tn(), this.st = On(), this.it = new gn(et), s2;
  }
  ot(t2, e) {
    if (!this.ht(t2))
      return;
    const n = this.gt(t2, e.key) ? 2 : 0;
    this.ut(t2).H(e.key, n), this.nt = this.nt.insert(e.key, e), this.st = this.st.insert(e.key, this.yt(e.key).add(t2));
  }
  ct(t2, e, n) {
    if (!this.ht(t2))
      return;
    const s2 = this.ut(t2);
    this.gt(t2, e) ? s2.H(e, 1) : s2.J(e), this.st = this.st.insert(e, this.yt(e).delete(t2)), n && (this.nt = this.nt.insert(e, n));
  }
  removeTarget(t2) {
    this.et.delete(t2);
  }
  wt(t2) {
    const e = this.ut(t2).W();
    return this.tt.getRemoteKeysForTarget(t2).size + e.addedDocuments.size - e.removedDocuments.size;
  }
  Y(t2) {
    this.ut(t2).Y();
  }
  ut(t2) {
    let e = this.et.get(t2);
    return e || (e = new kn(), this.et.set(t2, e)), e;
  }
  yt(t2) {
    let e = this.st.get(t2);
    return e || (e = new gn(et), this.st = this.st.insert(t2, e)), e;
  }
  ht(t2) {
    const e = this.dt(t2) !== null;
    return e || $("WatchChangeAggregator", "Detected inactive target", t2), e;
  }
  dt(t2) {
    const e = this.et.get(t2);
    return e && e.q ? null : this.tt.Tt(t2);
  }
  lt(t2) {
    this.et.set(t2, new kn());
    this.tt.getRemoteKeysForTarget(t2).forEach((e) => {
      this.ct(t2, e, null);
    });
  }
  gt(t2, e) {
    return this.tt.getRemoteKeysForTarget(t2).has(e);
  }
};
function On() {
  return new wn(Pt.comparator);
}
function Fn() {
  return new wn(Pt.comparator);
}
var Mn = (() => {
  const t2 = {
    asc: "ASCENDING",
    desc: "DESCENDING"
  };
  return t2;
})();
var Ln = (() => {
  const t2 = {
    "<": "LESS_THAN",
    "<=": "LESS_THAN_OR_EQUAL",
    ">": "GREATER_THAN",
    ">=": "GREATER_THAN_OR_EQUAL",
    "==": "EQUAL",
    "!=": "NOT_EQUAL",
    "array-contains": "ARRAY_CONTAINS",
    in: "IN",
    "not-in": "NOT_IN",
    "array-contains-any": "ARRAY_CONTAINS_ANY"
  };
  return t2;
})();
var Bn = class {
  constructor(t2, e) {
    this.databaseId = t2, this.D = e;
  }
};
function Un(t2, e) {
  if (t2.D) {
    return `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z`;
  }
  return {
    seconds: "" + e.seconds,
    nanos: e.nanoseconds
  };
}
function qn(t2, e) {
  return t2.D ? e.toBase64() : e.toUint8Array();
}
function jn(t2) {
  return B(!!t2), rt.fromTimestamp(function(t3) {
    const e = gt(t3);
    return new it(e.seconds, e.nanos);
  }(t2));
}
function Qn(t2, e) {
  return function(t3) {
    return new ht(["projects", t3.projectId, "databases", t3.database]);
  }(t2).child("documents").child(e).canonicalString();
}
function Wn(t2) {
  const e = ht.fromString(t2);
  return B(Ts(e)), e;
}
function zn(t2, e) {
  const n = Wn(e);
  if (n.get(1) !== t2.databaseId.projectId)
    throw new j(K.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + n.get(1) + " vs " + t2.databaseId.projectId);
  if (n.get(3) !== t2.databaseId.database)
    throw new j(K.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + n.get(3) + " vs " + t2.databaseId.database);
  return new Pt(Xn(n));
}
function Hn(t2, e) {
  return Qn(t2.databaseId, e);
}
function Jn(t2) {
  const e = Wn(t2);
  return e.length === 4 ? ht.emptyPath() : Xn(e);
}
function Yn(t2) {
  return new ht(["projects", t2.databaseId.projectId, "databases", t2.databaseId.database]).canonicalString();
}
function Xn(t2) {
  return B(t2.length > 4 && t2.get(4) === "documents"), t2.popFirst(5);
}
function ns(t2, e) {
  let n;
  if ("targetChange" in e) {
    e.targetChange;
    const s2 = function(t3) {
      return t3 === "NO_CHANGE" ? 0 : t3 === "ADD" ? 1 : t3 === "REMOVE" ? 2 : t3 === "CURRENT" ? 3 : t3 === "RESET" ? 4 : L();
    }(e.targetChange.targetChangeType || "NO_CHANGE"), i = e.targetChange.targetIds || [], r = function(t3, e2) {
      return t3.D ? (B(e2 === void 0 || typeof e2 == "string"), _t.fromBase64String(e2 || "")) : (B(e2 === void 0 || e2 instanceof Uint8Array), _t.fromUint8Array(e2 || new Uint8Array()));
    }(t2, e.targetChange.resumeToken), o = e.targetChange.cause, c = o && function(t3) {
      const e2 = t3.code === void 0 ? K.UNKNOWN : dn(t3.code);
      return new j(e2, t3.message || "");
    }(o);
    n = new xn(s2, i, r, c || null);
  } else if ("documentChange" in e) {
    e.documentChange;
    const s2 = e.documentChange;
    s2.document, s2.document.name, s2.document.updateTime;
    const i = zn(t2, s2.document.name), r = jn(s2.document.updateTime), o = new Ut({
      mapValue: {
        fields: s2.document.fields
      }
    }), c = Kt.newFoundDocument(i, r, o), a = s2.targetIds || [], u = s2.removedTargetIds || [];
    n = new Cn(a, u, c.key, c);
  } else if ("documentDelete" in e) {
    e.documentDelete;
    const s2 = e.documentDelete;
    s2.document;
    const i = zn(t2, s2.document), r = s2.readTime ? jn(s2.readTime) : rt.min(), o = Kt.newNoDocument(i, r), c = s2.removedTargetIds || [];
    n = new Cn([], c, o.key, o);
  } else if ("documentRemove" in e) {
    e.documentRemove;
    const s2 = e.documentRemove;
    s2.document;
    const i = zn(t2, s2.document), r = s2.removedTargetIds || [];
    n = new Cn([], r, i, null);
  } else {
    if (!("filter" in e))
      return L();
    {
      e.filter;
      const t3 = e.filter;
      t3.targetId;
      const s2 = t3.count || 0, i = new un(s2), r = t3.targetId;
      n = new Nn(r, i);
    }
  }
  return n;
}
function os(t2, e) {
  return {
    documents: [Hn(t2, e.path)]
  };
}
function cs(t2, e) {
  const n = {
    structuredQuery: {}
  }, s2 = e.path;
  e.collectionGroup !== null ? (n.parent = Hn(t2, s2), n.structuredQuery.from = [{
    collectionId: e.collectionGroup,
    allDescendants: true
  }]) : (n.parent = Hn(t2, s2.popLast()), n.structuredQuery.from = [{
    collectionId: s2.lastSegment()
  }]);
  const i = function(t3) {
    if (t3.length === 0)
      return;
    const e2 = t3.map((t4) => function(t5) {
      if (t5.op === "==") {
        if (Mt(t5.value))
          return {
            unaryFilter: {
              field: _s(t5.field),
              op: "IS_NAN"
            }
          };
        if (Ft(t5.value))
          return {
            unaryFilter: {
              field: _s(t5.field),
              op: "IS_NULL"
            }
          };
      } else if (t5.op === "!=") {
        if (Mt(t5.value))
          return {
            unaryFilter: {
              field: _s(t5.field),
              op: "IS_NOT_NAN"
            }
          };
        if (Ft(t5.value))
          return {
            unaryFilter: {
              field: _s(t5.field),
              op: "IS_NOT_NULL"
            }
          };
      }
      return {
        fieldFilter: {
          field: _s(t5.field),
          op: ws(t5.op),
          value: t5.value
        }
      };
    }(t4));
    if (e2.length === 1)
      return e2[0];
    return {
      compositeFilter: {
        op: "AND",
        filters: e2
      }
    };
  }(e.filters);
  i && (n.structuredQuery.where = i);
  const r = function(t3) {
    if (t3.length === 0)
      return;
    return t3.map((t4) => function(t5) {
      return {
        field: _s(t5.field),
        direction: ds(t5.dir)
      };
    }(t4));
  }(e.orderBy);
  r && (n.structuredQuery.orderBy = r);
  const o = function(t3, e2) {
    return t3.D || At(e2) ? e2 : {
      value: e2
    };
  }(t2, e.limit);
  return o !== null && (n.structuredQuery.limit = o), e.startAt && (n.structuredQuery.startAt = ls(e.startAt)), e.endAt && (n.structuredQuery.endAt = ls(e.endAt)), n;
}
function as(t2) {
  let e = Jn(t2.parent);
  const n = t2.structuredQuery, s2 = n.from ? n.from.length : 0;
  let i = null;
  if (s2 > 0) {
    B(s2 === 1);
    const t3 = n.from[0];
    t3.allDescendants ? i = t3.collectionId : e = e.child(t3.collectionId);
  }
  let r = [];
  n.where && (r = hs(n.where));
  let o = [];
  n.orderBy && (o = n.orderBy.map((t3) => function(t4) {
    return new ae(ms(t4.field), function(t5) {
      switch (t5) {
        case "ASCENDING":
          return "asc";
        case "DESCENDING":
          return "desc";
        default:
          return;
      }
    }(t4.direction));
  }(t3)));
  let c = null;
  n.limit && (c = function(t3) {
    let e2;
    return e2 = typeof t3 == "object" ? t3.value : t3, At(e2) ? null : e2;
  }(n.limit));
  let a = null;
  n.startAt && (a = fs(n.startAt));
  let u = null;
  return n.endAt && (u = fs(n.endAt)), de(e, i, o, r, c, "F", a, u);
}
function us(t2, e) {
  const n = function(t3, e2) {
    switch (e2) {
      case 0:
        return null;
      case 1:
        return "existence-filter-mismatch";
      case 2:
        return "limbo-document";
      default:
        return L();
    }
  }(0, e.purpose);
  return n == null ? null : {
    "goog-listen-tags": n
  };
}
function hs(t2) {
  return t2 ? t2.unaryFilter !== void 0 ? [ys(t2)] : t2.fieldFilter !== void 0 ? [gs(t2)] : t2.compositeFilter !== void 0 ? t2.compositeFilter.filters.map((t3) => hs(t3)).reduce((t3, e) => t3.concat(e)) : L() : [];
}
function ls(t2) {
  return {
    before: t2.before,
    values: t2.position
  };
}
function fs(t2) {
  const e = !!t2.before, n = t2.values || [];
  return new oe(n, e);
}
function ds(t2) {
  return Mn[t2];
}
function ws(t2) {
  return Ln[t2];
}
function _s(t2) {
  return {
    fieldPath: t2.canonicalString()
  };
}
function ms(t2) {
  return ft.fromServerFormat(t2.fieldPath);
}
function gs(t2) {
  return Jt.create(ms(t2.fieldFilter.field), function(t3) {
    switch (t3) {
      case "EQUAL":
        return "==";
      case "NOT_EQUAL":
        return "!=";
      case "GREATER_THAN":
        return ">";
      case "GREATER_THAN_OR_EQUAL":
        return ">=";
      case "LESS_THAN":
        return "<";
      case "LESS_THAN_OR_EQUAL":
        return "<=";
      case "ARRAY_CONTAINS":
        return "array-contains";
      case "IN":
        return "in";
      case "NOT_IN":
        return "not-in";
      case "ARRAY_CONTAINS_ANY":
        return "array-contains-any";
      default:
        return L();
    }
  }(t2.fieldFilter.op), t2.fieldFilter.value);
}
function ys(t2) {
  switch (t2.unaryFilter.op) {
    case "IS_NAN":
      const e = ms(t2.unaryFilter.field);
      return Jt.create(e, "==", {
        doubleValue: NaN
      });
    case "IS_NULL":
      const n = ms(t2.unaryFilter.field);
      return Jt.create(n, "==", {
        nullValue: "NULL_VALUE"
      });
    case "IS_NOT_NAN":
      const s2 = ms(t2.unaryFilter.field);
      return Jt.create(s2, "!=", {
        doubleValue: NaN
      });
    case "IS_NOT_NULL":
      const i = ms(t2.unaryFilter.field);
      return Jt.create(i, "!=", {
        nullValue: "NULL_VALUE"
      });
    default:
      return L();
  }
}
function Ts(t2) {
  return t2.length >= 4 && t2.get(0) === "projects" && t2.get(2) === "databases";
}
var qs = "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";
var Ks = class {
  constructor() {
    this.onCommittedListeners = [];
  }
  addOnCommittedListener(t2) {
    this.onCommittedListeners.push(t2);
  }
  raiseOnCommittedEvent() {
    this.onCommittedListeners.forEach((t2) => t2());
  }
};
var js = class {
  constructor(t2) {
    this.nextCallback = null, this.catchCallback = null, this.result = void 0, this.error = void 0, this.isDone = false, this.callbackAttached = false, t2((t3) => {
      this.isDone = true, this.result = t3, this.nextCallback && this.nextCallback(t3);
    }, (t3) => {
      this.isDone = true, this.error = t3, this.catchCallback && this.catchCallback(t3);
    });
  }
  catch(t2) {
    return this.next(void 0, t2);
  }
  next(t2, e) {
    return this.callbackAttached && L(), this.callbackAttached = true, this.isDone ? this.error ? this.wrapFailure(e, this.error) : this.wrapSuccess(t2, this.result) : new js((n, s2) => {
      this.nextCallback = (e2) => {
        this.wrapSuccess(t2, e2).next(n, s2);
      }, this.catchCallback = (t3) => {
        this.wrapFailure(e, t3).next(n, s2);
      };
    });
  }
  toPromise() {
    return new Promise((t2, e) => {
      this.next(t2, e);
    });
  }
  wrapUserFunction(t2) {
    try {
      const e = t2();
      return e instanceof js ? e : js.resolve(e);
    } catch (t3) {
      return js.reject(t3);
    }
  }
  wrapSuccess(t2, e) {
    return t2 ? this.wrapUserFunction(() => t2(e)) : js.resolve(e);
  }
  wrapFailure(t2, e) {
    return t2 ? this.wrapUserFunction(() => t2(e)) : js.reject(e);
  }
  static resolve(t2) {
    return new js((e, n) => {
      e(t2);
    });
  }
  static reject(t2) {
    return new js((e, n) => {
      n(t2);
    });
  }
  static waitFor(t2) {
    return new js((e, n) => {
      let s2 = 0, i = 0, r = false;
      t2.forEach((t3) => {
        ++s2, t3.next(() => {
          ++i, r && i === s2 && e();
        }, (t4) => n(t4));
      }), r = true, i === s2 && e();
    });
  }
  static or(t2) {
    let e = js.resolve(false);
    for (const n of t2)
      e = e.next((t3) => t3 ? js.resolve(t3) : n());
    return e;
  }
  static forEach(t2, e) {
    const n = [];
    return t2.forEach((t3, s2) => {
      n.push(e.call(this, t3, s2));
    }), this.waitFor(n);
  }
};
function Hs(t2) {
  return t2.name === "IndexedDbTransactionError";
}
var ni = class {
  constructor(t2, e, n, s2) {
    this.batchId = t2, this.localWriteTime = e, this.baseMutations = n, this.mutations = s2;
  }
  applyToRemoteDocument(t2, e) {
    const n = e.mutationResults;
    for (let e2 = 0; e2 < this.mutations.length; e2++) {
      const s2 = this.mutations[e2];
      if (s2.key.isEqual(t2.key)) {
        Je(s2, t2, n[e2]);
      }
    }
  }
  applyToLocalView(t2) {
    for (const e of this.baseMutations)
      e.key.isEqual(t2.key) && Ye(e, t2, this.localWriteTime);
    for (const e of this.mutations)
      e.key.isEqual(t2.key) && Ye(e, t2, this.localWriteTime);
  }
  applyToLocalDocumentSet(t2) {
    this.mutations.forEach((e) => {
      const n = t2.get(e.key), s2 = n;
      this.applyToLocalView(s2), n.isValidDocument() || s2.convertToNoDocument(rt.min());
    });
  }
  keys() {
    return this.mutations.reduce((t2, e) => t2.add(e.key), Pn());
  }
  isEqual(t2) {
    return this.batchId === t2.batchId && nt(this.mutations, t2.mutations, (t3, e) => Ze(t3, e)) && nt(this.baseMutations, t2.baseMutations, (t3, e) => Ze(t3, e));
  }
};
var ii = class {
  constructor(t2, e, n, s2, i = rt.min(), r = rt.min(), o = _t.EMPTY_BYTE_STRING) {
    this.target = t2, this.targetId = e, this.purpose = n, this.sequenceNumber = s2, this.snapshotVersion = i, this.lastLimboFreeSnapshotVersion = r, this.resumeToken = o;
  }
  withSequenceNumber(t2) {
    return new ii(this.target, this.targetId, this.purpose, t2, this.snapshotVersion, this.lastLimboFreeSnapshotVersion, this.resumeToken);
  }
  withResumeToken(t2, e) {
    return new ii(this.target, this.targetId, this.purpose, this.sequenceNumber, e, this.lastLimboFreeSnapshotVersion, t2);
  }
  withLastLimboFreeSnapshotVersion(t2) {
    return new ii(this.target, this.targetId, this.purpose, this.sequenceNumber, this.snapshotVersion, t2, this.resumeToken);
  }
};
var ri = class {
  constructor(t2) {
    this.Wt = t2;
  }
};
function _i(t2) {
  const e = as({
    parent: t2.parent,
    structuredQuery: t2.structuredQuery
  });
  return t2.limitType === "LAST" ? Ie(e, e.limit, "L") : e;
}
var pi = class {
  constructor() {
    this.Gt = new Ti();
  }
  addToCollectionParentIndex(t2, e) {
    return this.Gt.add(e), js.resolve();
  }
  getCollectionParents(t2, e) {
    return js.resolve(this.Gt.getEntries(e));
  }
};
var Ti = class {
  constructor() {
    this.index = {};
  }
  add(t2) {
    const e = t2.lastSegment(), n = t2.popLast(), s2 = this.index[e] || new gn(ht.comparator), i = !s2.has(n);
    return this.index[e] = s2.add(n), i;
  }
  has(t2) {
    const e = t2.lastSegment(), n = t2.popLast(), s2 = this.index[e];
    return s2 && s2.has(n);
  }
  getEntries(t2) {
    return (this.index[t2] || new gn(ht.comparator)).toArray();
  }
};
var Ni = class {
  constructor(t2) {
    this.ne = t2;
  }
  next() {
    return this.ne += 2, this.ne;
  }
  static se() {
    return new Ni(0);
  }
  static ie() {
    return new Ni(-1);
  }
};
async function Fi(t2) {
  if (t2.code !== K.FAILED_PRECONDITION || t2.message !== qs)
    throw t2;
  $("LocalStore", "Unexpectedly lost primary lease");
}
var ji = class {
  constructor(t2, e) {
    this.mapKeyFn = t2, this.equalsFn = e, this.inner = {};
  }
  get(t2) {
    const e = this.mapKeyFn(t2), n = this.inner[e];
    if (n !== void 0) {
      for (const [e2, s2] of n)
        if (this.equalsFn(e2, t2))
          return s2;
    }
  }
  has(t2) {
    return this.get(t2) !== void 0;
  }
  set(t2, e) {
    const n = this.mapKeyFn(t2), s2 = this.inner[n];
    if (s2 !== void 0) {
      for (let n2 = 0; n2 < s2.length; n2++)
        if (this.equalsFn(s2[n2][0], t2))
          return void (s2[n2] = [t2, e]);
      s2.push([t2, e]);
    } else
      this.inner[n] = [[t2, e]];
  }
  delete(t2) {
    const e = this.mapKeyFn(t2), n = this.inner[e];
    if (n === void 0)
      return false;
    for (let s2 = 0; s2 < n.length; s2++)
      if (this.equalsFn(n[s2][0], t2))
        return n.length === 1 ? delete this.inner[e] : n.splice(s2, 1), true;
    return false;
  }
  forEach(t2) {
    ct(this.inner, (e, n) => {
      for (const [e2, s2] of n)
        t2(e2, s2);
    });
  }
  isEmpty() {
    return at(this.inner);
  }
};
var Qi = class {
  constructor() {
    this.changes = new ji((t2) => t2.toString(), (t2, e) => t2.isEqual(e)), this.changesApplied = false;
  }
  getReadTime(t2) {
    const e = this.changes.get(t2);
    return e ? e.readTime : rt.min();
  }
  addEntry(t2, e) {
    this.assertNotApplied(), this.changes.set(t2.key, {
      document: t2,
      readTime: e
    });
  }
  removeEntry(t2, e = null) {
    this.assertNotApplied(), this.changes.set(t2, {
      document: Kt.newInvalidDocument(t2),
      readTime: e
    });
  }
  getEntry(t2, e) {
    this.assertNotApplied();
    const n = this.changes.get(e);
    return n !== void 0 ? js.resolve(n.document) : this.getFromCache(t2, e);
  }
  getEntries(t2, e) {
    return this.getAllFromCache(t2, e);
  }
  apply(t2) {
    return this.assertNotApplied(), this.changesApplied = true, this.applyChanges(t2);
  }
  assertNotApplied() {
  }
};
var rr = class {
  constructor(t2, e, n) {
    this.He = t2, this.In = e, this.Ht = n;
  }
  An(t2, e) {
    return this.In.getAllMutationBatchesAffectingDocumentKey(t2, e).next((n) => this.Rn(t2, e, n));
  }
  Rn(t2, e, n) {
    return this.He.getEntry(t2, e).next((t3) => {
      for (const e2 of n)
        e2.applyToLocalView(t3);
      return t3;
    });
  }
  bn(t2, e) {
    t2.forEach((t3, n) => {
      for (const t4 of e)
        t4.applyToLocalView(n);
    });
  }
  Pn(t2, e) {
    return this.He.getEntries(t2, e).next((e2) => this.vn(t2, e2).next(() => e2));
  }
  vn(t2, e) {
    return this.In.getAllMutationBatchesAffectingDocumentKeys(t2, e).next((t3) => this.bn(e, t3));
  }
  getDocumentsMatchingQuery(t2, e, n) {
    return function(t3) {
      return Pt.isDocumentKey(t3.path) && t3.collectionGroup === null && t3.filters.length === 0;
    }(e) ? this.Vn(t2, e.path) : pe(e) ? this.Sn(t2, e, n) : this.Dn(t2, e, n);
  }
  Vn(t2, e) {
    return this.An(t2, new Pt(e)).next((t3) => {
      let e2 = In();
      return t3.isFoundDocument() && (e2 = e2.insert(t3.key, t3)), e2;
    });
  }
  Sn(t2, e, n) {
    const s2 = e.collectionGroup;
    let i = In();
    return this.Ht.getCollectionParents(t2, s2).next((r) => js.forEach(r, (r2) => {
      const o = function(t3, e2) {
        return new fe(e2, null, t3.explicitOrderBy.slice(), t3.filters.slice(), t3.limit, t3.limitType, t3.startAt, t3.endAt);
      }(e, r2.child(s2));
      return this.Dn(t2, o, n).next((t3) => {
        t3.forEach((t4, e2) => {
          i = i.insert(t4, e2);
        });
      });
    }).next(() => i));
  }
  Dn(t2, e, n) {
    let s2, i;
    return this.He.getDocumentsMatchingQuery(t2, e, n).next((n2) => (s2 = n2, this.In.getAllMutationBatchesAffectingQuery(t2, e))).next((e2) => (i = e2, this.Cn(t2, i, s2).next((t3) => {
      s2 = t3;
      for (const t4 of i)
        for (const e3 of t4.mutations) {
          const n2 = e3.key;
          let i2 = s2.get(n2);
          i2 == null && (i2 = Kt.newInvalidDocument(n2), s2 = s2.insert(n2, i2)), Ye(e3, i2, t4.localWriteTime), i2.isFoundDocument() || (s2 = s2.remove(n2));
        }
    }))).next(() => (s2.forEach((t3, n2) => {
      Pe(e, n2) || (s2 = s2.remove(t3));
    }), s2));
  }
  Cn(t2, e, n) {
    let s2 = Pn();
    for (const t3 of e)
      for (const e2 of t3.mutations)
        e2 instanceof nn && n.get(e2.key) === null && (s2 = s2.add(e2.key));
    let i = n;
    return this.He.getEntries(t2, s2).next((t3) => (t3.forEach((t4, e2) => {
      e2.isFoundDocument() && (i = i.insert(t4, e2));
    }), i));
  }
};
var or = class {
  constructor(t2, e, n, s2) {
    this.targetId = t2, this.fromCache = e, this.Nn = n, this.xn = s2;
  }
  static kn(t2, e) {
    let n = Pn(), s2 = Pn();
    for (const t3 of e.docChanges)
      switch (t3.type) {
        case 0:
          n = n.add(t3.doc.key);
          break;
        case 1:
          s2 = s2.add(t3.doc.key);
      }
    return new or(t2, e.fromCache, n, s2);
  }
};
var cr = class {
  $n(t2) {
    this.On = t2;
  }
  getDocumentsMatchingQuery(t2, e, n, s2) {
    return function(t3) {
      return t3.filters.length === 0 && t3.limit === null && t3.startAt == null && t3.endAt == null && (t3.explicitOrderBy.length === 0 || t3.explicitOrderBy.length === 1 && t3.explicitOrderBy[0].field.isKeyField());
    }(e) || n.isEqual(rt.min()) ? this.Fn(t2, e) : this.On.Pn(t2, s2).next((i) => {
      const r = this.Mn(e, i);
      return (_e(e) || me(e)) && this.Ln(e.limitType, r, s2, n) ? this.Fn(t2, e) : (x() <= LogLevel.DEBUG && $("QueryEngine", "Re-using previous result from %s to execute query: %s", n.toString(), be(e)), this.On.getDocumentsMatchingQuery(t2, e, n).next((t3) => (r.forEach((e2) => {
        t3 = t3.insert(e2.key, e2);
      }), t3)));
    });
  }
  Mn(t2, e) {
    let n = new gn(ve(t2));
    return e.forEach((e2, s2) => {
      Pe(t2, s2) && (n = n.add(s2));
    }), n;
  }
  Ln(t2, e, n, s2) {
    if (n.size !== e.size)
      return true;
    const i = t2 === "F" ? e.last() : e.first();
    return !!i && (i.hasPendingWrites || i.version.compareTo(s2) > 0);
  }
  Fn(t2, e) {
    return x() <= LogLevel.DEBUG && $("QueryEngine", "Using full collection scan to execute query:", be(e)), this.On.getDocumentsMatchingQuery(t2, e, rt.min());
  }
};
var ar = class {
  constructor(t2, e, n, s2) {
    this.persistence = t2, this.Bn = e, this.N = s2, this.Un = new wn(et), this.qn = new ji((t3) => Wt(t3), zt), this.Kn = rt.min(), this.In = t2.getMutationQueue(n), this.jn = t2.getRemoteDocumentCache(), this.ze = t2.getTargetCache(), this.Qn = new rr(this.jn, this.In, this.persistence.getIndexManager()), this.Je = t2.getBundleCache(), this.Bn.$n(this.Qn);
  }
  collectGarbage(t2) {
    return this.persistence.runTransaction("Collect garbage", "readwrite-primary", (e) => t2.collect(e, this.Un));
  }
};
function ur(t2, e, n, s2) {
  return new ar(t2, e, n, s2);
}
async function hr(t2, e) {
  const n = q(t2);
  let s2 = n.In, i = n.Qn;
  const r = await n.persistence.runTransaction("Handle user change", "readonly", (t3) => {
    let r2;
    return n.In.getAllMutationBatches(t3).next((o) => (r2 = o, s2 = n.persistence.getMutationQueue(e), i = new rr(n.jn, s2, n.persistence.getIndexManager()), s2.getAllMutationBatches(t3))).next((e2) => {
      const n2 = [], s3 = [];
      let o = Pn();
      for (const t4 of r2) {
        n2.push(t4.batchId);
        for (const e3 of t4.mutations)
          o = o.add(e3.key);
      }
      for (const t4 of e2) {
        s3.push(t4.batchId);
        for (const e3 of t4.mutations)
          o = o.add(e3.key);
      }
      return i.Pn(t3, o).next((t4) => ({
        Wn: t4,
        removedBatchIds: n2,
        addedBatchIds: s3
      }));
    });
  });
  return n.In = s2, n.Qn = i, n.Bn.$n(n.Qn), r;
}
function fr(t2) {
  const e = q(t2);
  return e.persistence.runTransaction("Get last remote snapshot version", "readonly", (t3) => e.ze.getLastRemoteSnapshotVersion(t3));
}
function dr(t2, e) {
  const n = q(t2), s2 = e.snapshotVersion;
  let i = n.Un;
  return n.persistence.runTransaction("Apply remote event", "readwrite-primary", (t3) => {
    const r = n.jn.newChangeBuffer({
      trackRemovals: true
    });
    i = n.Un;
    const o = [];
    e.targetChanges.forEach((e2, r2) => {
      const c2 = i.get(r2);
      if (!c2)
        return;
      o.push(n.ze.removeMatchingKeys(t3, e2.removedDocuments, r2).next(() => n.ze.addMatchingKeys(t3, e2.addedDocuments, r2)));
      const a = e2.resumeToken;
      if (a.approximateByteSize() > 0) {
        const u = c2.withResumeToken(a, s2).withSequenceNumber(t3.currentSequenceNumber);
        i = i.insert(r2, u), function(t4, e3, n2) {
          if (B(e3.resumeToken.approximateByteSize() > 0), t4.resumeToken.approximateByteSize() === 0)
            return true;
          if (e3.snapshotVersion.toMicroseconds() - t4.snapshotVersion.toMicroseconds() >= 3e8)
            return true;
          return n2.addedDocuments.size + n2.modifiedDocuments.size + n2.removedDocuments.size > 0;
        }(c2, u, e2) && o.push(n.ze.updateTargetData(t3, u));
      }
    });
    let c = Tn();
    if (e.documentUpdates.forEach((s3, i2) => {
      e.resolvedLimboDocuments.has(s3) && o.push(n.persistence.referenceDelegate.updateLimboDocument(t3, s3));
    }), o.push(wr(t3, r, e.documentUpdates, s2, void 0).next((t4) => {
      c = t4;
    })), !s2.isEqual(rt.min())) {
      const e2 = n.ze.getLastRemoteSnapshotVersion(t3).next((e3) => n.ze.setTargetsMetadata(t3, t3.currentSequenceNumber, s2));
      o.push(e2);
    }
    return js.waitFor(o).next(() => r.apply(t3)).next(() => n.Qn.vn(t3, c)).next(() => c);
  }).then((t3) => (n.Un = i, t3));
}
function wr(t2, e, n, s2, i) {
  let r = Pn();
  return n.forEach((t3) => r = r.add(t3)), e.getEntries(t2, r).next((t3) => {
    let r2 = Tn();
    return n.forEach((n2, o) => {
      const c = t3.get(n2), a = (i == null ? void 0 : i.get(n2)) || s2;
      o.isNoDocument() && o.version.isEqual(rt.min()) ? (e.removeEntry(n2, a), r2 = r2.insert(n2, o)) : !c.isValidDocument() || o.version.compareTo(c.version) > 0 || o.version.compareTo(c.version) === 0 && c.hasPendingWrites ? (e.addEntry(o, a), r2 = r2.insert(n2, o)) : $("LocalStore", "Ignoring outdated watch update for ", n2, ". Current version:", c.version, " Watch version:", o.version);
    }), r2;
  });
}
function mr(t2, e) {
  const n = q(t2);
  return n.persistence.runTransaction("Allocate target", "readwrite", (t3) => {
    let s2;
    return n.ze.getTargetData(t3, e).next((i) => i ? (s2 = i, js.resolve(s2)) : n.ze.allocateTargetId(t3).next((i2) => (s2 = new ii(e, i2, 0, t3.currentSequenceNumber), n.ze.addTargetData(t3, s2).next(() => s2))));
  }).then((t3) => {
    const s2 = n.Un.get(t3.targetId);
    return (s2 === null || t3.snapshotVersion.compareTo(s2.snapshotVersion) > 0) && (n.Un = n.Un.insert(t3.targetId, t3), n.qn.set(e, t3.targetId)), t3;
  });
}
async function gr(t2, e, n) {
  const s2 = q(t2), i = s2.Un.get(e), r = n ? "readwrite" : "readwrite-primary";
  try {
    n || await s2.persistence.runTransaction("Release target", r, (t3) => s2.persistence.referenceDelegate.removeTarget(t3, i));
  } catch (t3) {
    if (!Hs(t3))
      throw t3;
    $("LocalStore", `Failed to update sequence numbers for target ${e}: ${t3}`);
  }
  s2.Un = s2.Un.remove(e), s2.qn.delete(i.target);
}
function yr(t2, e, n) {
  const s2 = q(t2);
  let i = rt.min(), r = Pn();
  return s2.persistence.runTransaction("Execute query", "readonly", (t3) => function(t4, e2, n2) {
    const s3 = q(t4), i2 = s3.qn.get(n2);
    return i2 !== void 0 ? js.resolve(s3.Un.get(i2)) : s3.ze.getTargetData(e2, n2);
  }(s2, t3, Ee(e)).next((e2) => {
    if (e2)
      return i = e2.lastLimboFreeSnapshotVersion, s2.ze.getMatchingKeysForTargetId(t3, e2.targetId).next((t4) => {
        r = t4;
      });
  }).next(() => s2.Bn.getDocumentsMatchingQuery(t3, e, n ? i : rt.min(), n ? r : Pn())).next((t4) => ({
    documents: t4,
    Gn: r
  })));
}
var Rr = class {
  constructor(t2) {
    this.N = t2, this.Yn = new Map(), this.Xn = new Map();
  }
  getBundleMetadata(t2, e) {
    return js.resolve(this.Yn.get(e));
  }
  saveBundleMetadata(t2, e) {
    var n;
    return this.Yn.set(e.id, {
      id: (n = e).id,
      version: n.version,
      createTime: jn(n.createTime)
    }), js.resolve();
  }
  getNamedQuery(t2, e) {
    return js.resolve(this.Xn.get(e));
  }
  saveNamedQuery(t2, e) {
    return this.Xn.set(e.name, function(t3) {
      return {
        name: t3.name,
        query: _i(t3.bundledQuery),
        readTime: jn(t3.readTime)
      };
    }(e)), js.resolve();
  }
};
var br = class {
  constructor() {
    this.Zn = new gn(Pr.ts), this.es = new gn(Pr.ns);
  }
  isEmpty() {
    return this.Zn.isEmpty();
  }
  addReference(t2, e) {
    const n = new Pr(t2, e);
    this.Zn = this.Zn.add(n), this.es = this.es.add(n);
  }
  ss(t2, e) {
    t2.forEach((t3) => this.addReference(t3, e));
  }
  removeReference(t2, e) {
    this.rs(new Pr(t2, e));
  }
  os(t2, e) {
    t2.forEach((t3) => this.removeReference(t3, e));
  }
  cs(t2) {
    const e = new Pt(new ht([])), n = new Pr(e, t2), s2 = new Pr(e, t2 + 1), i = [];
    return this.es.forEachInRange([n, s2], (t3) => {
      this.rs(t3), i.push(t3.key);
    }), i;
  }
  us() {
    this.Zn.forEach((t2) => this.rs(t2));
  }
  rs(t2) {
    this.Zn = this.Zn.delete(t2), this.es = this.es.delete(t2);
  }
  hs(t2) {
    const e = new Pt(new ht([])), n = new Pr(e, t2), s2 = new Pr(e, t2 + 1);
    let i = Pn();
    return this.es.forEachInRange([n, s2], (t3) => {
      i = i.add(t3.key);
    }), i;
  }
  containsKey(t2) {
    const e = new Pr(t2, 0), n = this.Zn.firstAfterOrEqual(e);
    return n !== null && t2.isEqual(n.key);
  }
};
var Pr = class {
  constructor(t2, e) {
    this.key = t2, this.ls = e;
  }
  static ts(t2, e) {
    return Pt.comparator(t2.key, e.key) || et(t2.ls, e.ls);
  }
  static ns(t2, e) {
    return et(t2.ls, e.ls) || Pt.comparator(t2.key, e.key);
  }
};
var vr = class {
  constructor(t2, e) {
    this.Ht = t2, this.referenceDelegate = e, this.In = [], this.fs = 1, this.ds = new gn(Pr.ts);
  }
  checkEmpty(t2) {
    return js.resolve(this.In.length === 0);
  }
  addMutationBatch(t2, e, n, s2) {
    const i = this.fs;
    this.fs++, this.In.length > 0 && this.In[this.In.length - 1];
    const r = new ni(i, e, n, s2);
    this.In.push(r);
    for (const e2 of s2)
      this.ds = this.ds.add(new Pr(e2.key, i)), this.Ht.addToCollectionParentIndex(t2, e2.key.path.popLast());
    return js.resolve(r);
  }
  lookupMutationBatch(t2, e) {
    return js.resolve(this.ws(e));
  }
  getNextMutationBatchAfterBatchId(t2, e) {
    const n = e + 1, s2 = this._s(n), i = s2 < 0 ? 0 : s2;
    return js.resolve(this.In.length > i ? this.In[i] : null);
  }
  getHighestUnacknowledgedBatchId() {
    return js.resolve(this.In.length === 0 ? -1 : this.fs - 1);
  }
  getAllMutationBatches(t2) {
    return js.resolve(this.In.slice());
  }
  getAllMutationBatchesAffectingDocumentKey(t2, e) {
    const n = new Pr(e, 0), s2 = new Pr(e, Number.POSITIVE_INFINITY), i = [];
    return this.ds.forEachInRange([n, s2], (t3) => {
      const e2 = this.ws(t3.ls);
      i.push(e2);
    }), js.resolve(i);
  }
  getAllMutationBatchesAffectingDocumentKeys(t2, e) {
    let n = new gn(et);
    return e.forEach((t3) => {
      const e2 = new Pr(t3, 0), s2 = new Pr(t3, Number.POSITIVE_INFINITY);
      this.ds.forEachInRange([e2, s2], (t4) => {
        n = n.add(t4.ls);
      });
    }), js.resolve(this.gs(n));
  }
  getAllMutationBatchesAffectingQuery(t2, e) {
    const n = e.path, s2 = n.length + 1;
    let i = n;
    Pt.isDocumentKey(i) || (i = i.child(""));
    const r = new Pr(new Pt(i), 0);
    let o = new gn(et);
    return this.ds.forEachWhile((t3) => {
      const e2 = t3.key.path;
      return !!n.isPrefixOf(e2) && (e2.length === s2 && (o = o.add(t3.ls)), true);
    }, r), js.resolve(this.gs(o));
  }
  gs(t2) {
    const e = [];
    return t2.forEach((t3) => {
      const n = this.ws(t3);
      n !== null && e.push(n);
    }), e;
  }
  removeMutationBatch(t2, e) {
    B(this.ys(e.batchId, "removed") === 0), this.In.shift();
    let n = this.ds;
    return js.forEach(e.mutations, (s2) => {
      const i = new Pr(s2.key, e.batchId);
      return n = n.delete(i), this.referenceDelegate.markPotentiallyOrphaned(t2, s2.key);
    }).next(() => {
      this.ds = n;
    });
  }
  te(t2) {
  }
  containsKey(t2, e) {
    const n = new Pr(e, 0), s2 = this.ds.firstAfterOrEqual(n);
    return js.resolve(e.isEqual(s2 && s2.key));
  }
  performConsistencyCheck(t2) {
    return this.In.length, js.resolve();
  }
  ys(t2, e) {
    return this._s(t2);
  }
  _s(t2) {
    if (this.In.length === 0)
      return 0;
    return t2 - this.In[0].batchId;
  }
  ws(t2) {
    const e = this._s(t2);
    if (e < 0 || e >= this.In.length)
      return null;
    return this.In[e];
  }
};
var Vr = class {
  constructor(t2, e) {
    this.Ht = t2, this.ps = e, this.docs = new wn(Pt.comparator), this.size = 0;
  }
  addEntry(t2, e, n) {
    const s2 = e.key, i = this.docs.get(s2), r = i ? i.size : 0, o = this.ps(e);
    return this.docs = this.docs.insert(s2, {
      document: e.clone(),
      size: o,
      readTime: n
    }), this.size += o - r, this.Ht.addToCollectionParentIndex(t2, s2.path.popLast());
  }
  removeEntry(t2) {
    const e = this.docs.get(t2);
    e && (this.docs = this.docs.remove(t2), this.size -= e.size);
  }
  getEntry(t2, e) {
    const n = this.docs.get(e);
    return js.resolve(n ? n.document.clone() : Kt.newInvalidDocument(e));
  }
  getEntries(t2, e) {
    let n = Tn();
    return e.forEach((t3) => {
      const e2 = this.docs.get(t3);
      n = n.insert(t3, e2 ? e2.document.clone() : Kt.newInvalidDocument(t3));
    }), js.resolve(n);
  }
  getDocumentsMatchingQuery(t2, e, n) {
    let s2 = Tn();
    const i = new Pt(e.path.child("")), r = this.docs.getIteratorFrom(i);
    for (; r.hasNext(); ) {
      const { key: t3, value: { document: i2, readTime: o } } = r.getNext();
      if (!e.path.isPrefixOf(t3.path))
        break;
      o.compareTo(n) <= 0 || Pe(e, i2) && (s2 = s2.insert(i2.key, i2.clone()));
    }
    return js.resolve(s2);
  }
  Ts(t2, e) {
    return js.forEach(this.docs, (t3) => e(t3));
  }
  newChangeBuffer(t2) {
    return new Sr(this);
  }
  getSize(t2) {
    return js.resolve(this.size);
  }
};
var Sr = class extends Qi {
  constructor(t2) {
    super(), this.Se = t2;
  }
  applyChanges(t2) {
    const e = [];
    return this.changes.forEach((n, s2) => {
      s2.document.isValidDocument() ? e.push(this.Se.addEntry(t2, s2.document, this.getReadTime(n))) : this.Se.removeEntry(n);
    }), js.waitFor(e);
  }
  getFromCache(t2, e) {
    return this.Se.getEntry(t2, e);
  }
  getAllFromCache(t2, e) {
    return this.Se.getEntries(t2, e);
  }
};
var Dr = class {
  constructor(t2) {
    this.persistence = t2, this.Es = new ji((t3) => Wt(t3), zt), this.lastRemoteSnapshotVersion = rt.min(), this.highestTargetId = 0, this.Is = 0, this.As = new br(), this.targetCount = 0, this.Rs = Ni.se();
  }
  forEachTarget(t2, e) {
    return this.Es.forEach((t3, n) => e(n)), js.resolve();
  }
  getLastRemoteSnapshotVersion(t2) {
    return js.resolve(this.lastRemoteSnapshotVersion);
  }
  getHighestSequenceNumber(t2) {
    return js.resolve(this.Is);
  }
  allocateTargetId(t2) {
    return this.highestTargetId = this.Rs.next(), js.resolve(this.highestTargetId);
  }
  setTargetsMetadata(t2, e, n) {
    return n && (this.lastRemoteSnapshotVersion = n), e > this.Is && (this.Is = e), js.resolve();
  }
  ce(t2) {
    this.Es.set(t2.target, t2);
    const e = t2.targetId;
    e > this.highestTargetId && (this.Rs = new Ni(e), this.highestTargetId = e), t2.sequenceNumber > this.Is && (this.Is = t2.sequenceNumber);
  }
  addTargetData(t2, e) {
    return this.ce(e), this.targetCount += 1, js.resolve();
  }
  updateTargetData(t2, e) {
    return this.ce(e), js.resolve();
  }
  removeTargetData(t2, e) {
    return this.Es.delete(e.target), this.As.cs(e.targetId), this.targetCount -= 1, js.resolve();
  }
  removeTargets(t2, e, n) {
    let s2 = 0;
    const i = [];
    return this.Es.forEach((r, o) => {
      o.sequenceNumber <= e && n.get(o.targetId) === null && (this.Es.delete(r), i.push(this.removeMatchingKeysForTargetId(t2, o.targetId)), s2++);
    }), js.waitFor(i).next(() => s2);
  }
  getTargetCount(t2) {
    return js.resolve(this.targetCount);
  }
  getTargetData(t2, e) {
    const n = this.Es.get(e) || null;
    return js.resolve(n);
  }
  addMatchingKeys(t2, e, n) {
    return this.As.ss(e, n), js.resolve();
  }
  removeMatchingKeys(t2, e, n) {
    this.As.os(e, n);
    const s2 = this.persistence.referenceDelegate, i = [];
    return s2 && e.forEach((e2) => {
      i.push(s2.markPotentiallyOrphaned(t2, e2));
    }), js.waitFor(i);
  }
  removeMatchingKeysForTargetId(t2, e) {
    return this.As.cs(e), js.resolve();
  }
  getMatchingKeysForTargetId(t2, e) {
    const n = this.As.hs(e);
    return js.resolve(n);
  }
  containsKey(t2, e) {
    return js.resolve(this.As.containsKey(e));
  }
};
var Cr = class {
  constructor(t2, e) {
    this.bs = {}, this.Le = new X(0), this.Be = false, this.Be = true, this.referenceDelegate = t2(this), this.ze = new Dr(this);
    this.Ht = new pi(), this.He = function(t3, e2) {
      return new Vr(t3, e2);
    }(this.Ht, (t3) => this.referenceDelegate.Ps(t3)), this.N = new ri(e), this.Je = new Rr(this.N);
  }
  start() {
    return Promise.resolve();
  }
  shutdown() {
    return this.Be = false, Promise.resolve();
  }
  get started() {
    return this.Be;
  }
  setDatabaseDeletedListener() {
  }
  setNetworkEnabled() {
  }
  getIndexManager() {
    return this.Ht;
  }
  getMutationQueue(t2) {
    let e = this.bs[t2.toKey()];
    return e || (e = new vr(this.Ht, this.referenceDelegate), this.bs[t2.toKey()] = e), e;
  }
  getTargetCache() {
    return this.ze;
  }
  getRemoteDocumentCache() {
    return this.He;
  }
  getBundleCache() {
    return this.Je;
  }
  runTransaction(t2, e, n) {
    $("MemoryPersistence", "Starting transaction:", t2);
    const s2 = new Nr(this.Le.next());
    return this.referenceDelegate.vs(), n(s2).next((t3) => this.referenceDelegate.Vs(s2).next(() => t3)).toPromise().then((t3) => (s2.raiseOnCommittedEvent(), t3));
  }
  Ss(t2, e) {
    return js.or(Object.values(this.bs).map((n) => () => n.containsKey(t2, e)));
  }
};
var Nr = class extends Ks {
  constructor(t2) {
    super(), this.currentSequenceNumber = t2;
  }
};
var xr = class {
  constructor(t2) {
    this.persistence = t2, this.Ds = new br(), this.Cs = null;
  }
  static Ns(t2) {
    return new xr(t2);
  }
  get xs() {
    if (this.Cs)
      return this.Cs;
    throw L();
  }
  addReference(t2, e, n) {
    return this.Ds.addReference(n, e), this.xs.delete(n.toString()), js.resolve();
  }
  removeReference(t2, e, n) {
    return this.Ds.removeReference(n, e), this.xs.add(n.toString()), js.resolve();
  }
  markPotentiallyOrphaned(t2, e) {
    return this.xs.add(e.toString()), js.resolve();
  }
  removeTarget(t2, e) {
    this.Ds.cs(e.targetId).forEach((t3) => this.xs.add(t3.toString()));
    const n = this.persistence.getTargetCache();
    return n.getMatchingKeysForTargetId(t2, e.targetId).next((t3) => {
      t3.forEach((t4) => this.xs.add(t4.toString()));
    }).next(() => n.removeTargetData(t2, e));
  }
  vs() {
    this.Cs = new Set();
  }
  Vs(t2) {
    const e = this.persistence.getRemoteDocumentCache().newChangeBuffer();
    return js.forEach(this.xs, (n) => {
      const s2 = Pt.fromPath(n);
      return this.ks(t2, s2).next((t3) => {
        t3 || e.removeEntry(s2);
      });
    }).next(() => (this.Cs = null, e.apply(t2)));
  }
  updateLimboDocument(t2, e) {
    return this.ks(t2, e).next((t3) => {
      t3 ? this.xs.delete(e.toString()) : this.xs.add(e.toString());
    });
  }
  Ps(t2) {
    return 0;
  }
  ks(t2, e) {
    return js.or([() => js.resolve(this.Ds.containsKey(e)), () => this.persistence.getTargetCache().containsKey(t2, e), () => this.persistence.Ss(t2, e)]);
  }
};
var Ur = class {
  constructor() {
    this.activeTargetIds = Vn();
  }
  Fs(t2) {
    this.activeTargetIds = this.activeTargetIds.add(t2);
  }
  Ms(t2) {
    this.activeTargetIds = this.activeTargetIds.delete(t2);
  }
  Os() {
    const t2 = {
      activeTargetIds: this.activeTargetIds.toArray(),
      updateTimeMs: Date.now()
    };
    return JSON.stringify(t2);
  }
};
var Kr = class {
  constructor() {
    this.yi = new Ur(), this.pi = {}, this.onlineStateHandler = null, this.sequenceNumberHandler = null;
  }
  addPendingMutation(t2) {
  }
  updateMutationState(t2, e, n) {
  }
  addLocalQueryTarget(t2) {
    return this.yi.Fs(t2), this.pi[t2] || "not-current";
  }
  updateQueryState(t2, e, n) {
    this.pi[t2] = e;
  }
  removeLocalQueryTarget(t2) {
    this.yi.Ms(t2);
  }
  isLocalQueryTarget(t2) {
    return this.yi.activeTargetIds.has(t2);
  }
  clearQueryState(t2) {
    delete this.pi[t2];
  }
  getAllActiveQueryTargets() {
    return this.yi.activeTargetIds;
  }
  isActiveQueryTarget(t2) {
    return this.yi.activeTargetIds.has(t2);
  }
  start() {
    return this.yi = new Ur(), Promise.resolve();
  }
  handleUserChange(t2, e, n) {
  }
  setOnlineState(t2) {
  }
  shutdown() {
  }
  writeSequenceNumber(t2) {
  }
  notifyBundleLoaded() {
  }
};
var jr = class {
  Ti(t2) {
  }
  shutdown() {
  }
};
var Qr = class {
  constructor() {
    this.Ei = () => this.Ii(), this.Ai = () => this.Ri(), this.bi = [], this.Pi();
  }
  Ti(t2) {
    this.bi.push(t2);
  }
  shutdown() {
    window.removeEventListener("online", this.Ei), window.removeEventListener("offline", this.Ai);
  }
  Pi() {
    window.addEventListener("online", this.Ei), window.addEventListener("offline", this.Ai);
  }
  Ii() {
    $("ConnectivityMonitor", "Network connectivity changed: AVAILABLE");
    for (const t2 of this.bi)
      t2(0);
  }
  Ri() {
    $("ConnectivityMonitor", "Network connectivity changed: UNAVAILABLE");
    for (const t2 of this.bi)
      t2(1);
  }
  static bt() {
    return typeof window != "undefined" && window.addEventListener !== void 0 && window.removeEventListener !== void 0;
  }
};
var Wr = {
  BatchGetDocuments: "batchGet",
  Commit: "commit",
  RunQuery: "runQuery"
};
var Gr = class {
  constructor(t2) {
    this.vi = t2.vi, this.Vi = t2.Vi;
  }
  Si(t2) {
    this.Di = t2;
  }
  Ci(t2) {
    this.Ni = t2;
  }
  onMessage(t2) {
    this.xi = t2;
  }
  close() {
    this.Vi();
  }
  send(t2) {
    this.vi(t2);
  }
  ki() {
    this.Di();
  }
  $i(t2) {
    this.Ni(t2);
  }
  Oi(t2) {
    this.xi(t2);
  }
};
var zr = class extends class {
  constructor(t2) {
    this.databaseInfo = t2, this.databaseId = t2.databaseId;
    const e = t2.ssl ? "https" : "http";
    this.Fi = e + "://" + t2.host, this.Mi = "projects/" + this.databaseId.projectId + "/databases/" + this.databaseId.database + "/documents";
  }
  Li(t2, e, n, s2) {
    const i = this.Bi(t2, e);
    $("RestConnection", "Sending: ", i, n);
    const r = {};
    return this.Ui(r, s2), this.qi(t2, i, r, n).then((t3) => ($("RestConnection", "Received: ", t3), t3), (e2) => {
      throw F("RestConnection", `${t2} failed with error: `, e2, "url: ", i, "request:", n), e2;
    });
  }
  Ki(t2, e, n, s2) {
    return this.Li(t2, e, n, s2);
  }
  Ui(t2, e) {
    if (t2["X-Goog-Api-Client"] = "gl-js/ fire/" + C, t2["Content-Type"] = "text/plain", this.databaseInfo.appId && (t2["X-Firebase-GMPID"] = this.databaseInfo.appId), e)
      for (const n in e.authHeaders)
        e.authHeaders.hasOwnProperty(n) && (t2[n] = e.authHeaders[n]);
  }
  Bi(t2, e) {
    const n = Wr[t2];
    return `${this.Fi}/v1/${e}:${n}`;
  }
} {
  constructor(t2) {
    super(t2), this.forceLongPolling = t2.forceLongPolling, this.autoDetectLongPolling = t2.autoDetectLongPolling, this.useFetchStreams = t2.useFetchStreams;
  }
  qi(t2, e, n, s2) {
    return new Promise((i, r) => {
      const o = new XhrIo();
      o.listenOnce(EventType.COMPLETE, () => {
        try {
          switch (o.getLastErrorCode()) {
            case ErrorCode.NO_ERROR:
              const e2 = o.getResponseJson();
              $("Connection", "XHR received:", JSON.stringify(e2)), i(e2);
              break;
            case ErrorCode.TIMEOUT:
              $("Connection", 'RPC "' + t2 + '" timed out'), r(new j(K.DEADLINE_EXCEEDED, "Request time out"));
              break;
            case ErrorCode.HTTP_ERROR:
              const n2 = o.getStatus();
              if ($("Connection", 'RPC "' + t2 + '" failed with status:', n2, "response text:", o.getResponseText()), n2 > 0) {
                const t3 = o.getResponseJson().error;
                if (t3 && t3.status && t3.message) {
                  const e3 = function(t4) {
                    const e4 = t4.toLowerCase().replace(/_/g, "-");
                    return Object.values(K).indexOf(e4) >= 0 ? e4 : K.UNKNOWN;
                  }(t3.status);
                  r(new j(e3, t3.message));
                } else
                  r(new j(K.UNKNOWN, "Server responded with status " + o.getStatus()));
              } else
                r(new j(K.UNAVAILABLE, "Connection failed."));
              break;
            default:
              L();
          }
        } finally {
          $("Connection", 'RPC "' + t2 + '" completed.');
        }
      });
      const c = JSON.stringify(s2);
      o.send(e, "POST", c, n, 15);
    });
  }
  ji(t2, e) {
    const n = [this.Fi, "/", "google.firestore.v1.Firestore", "/", t2, "/channel"], s2 = createWebChannelTransport(), i = getStatEventTarget(), r = {
      httpSessionIdParam: "gsessionid",
      initMessageHeaders: {},
      messageUrlParams: {
        database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`
      },
      sendRawJson: true,
      supportsCrossDomainXhr: true,
      internalChannelParams: {
        forwardChannelRequestTimeoutMs: 6e5
      },
      forceLongPolling: this.forceLongPolling,
      detectBufferingProxy: this.autoDetectLongPolling
    };
    this.useFetchStreams && (r.xmlHttpFactory = new FetchXmlHttpFactory({})), this.Ui(r.initMessageHeaders, e), isMobileCordova() || isReactNative() || isElectron() || isIE() || isUWP() || isBrowserExtension() || (r.httpHeadersOverwriteParam = "$httpHeaders");
    const o = n.join("");
    $("Connection", "Creating WebChannel: " + o, r);
    const c = s2.createWebChannel(o, r);
    let a = false, u = false;
    const h = new Gr({
      vi: (t3) => {
        u ? $("Connection", "Not sending because WebChannel is closed:", t3) : (a || ($("Connection", "Opening WebChannel transport."), c.open(), a = true), $("Connection", "WebChannel sending:", t3), c.send(t3));
      },
      Vi: () => c.close()
    }), g = (t3, e2, n2) => {
      t3.listen(e2, (t4) => {
        try {
          n2(t4);
        } catch (t5) {
          setTimeout(() => {
            throw t5;
          }, 0);
        }
      });
    };
    return g(c, WebChannel.EventType.OPEN, () => {
      u || $("Connection", "WebChannel transport opened.");
    }), g(c, WebChannel.EventType.CLOSE, () => {
      u || (u = true, $("Connection", "WebChannel transport closed"), h.$i());
    }), g(c, WebChannel.EventType.ERROR, (t3) => {
      u || (u = true, F("Connection", "WebChannel transport errored:", t3), h.$i(new j(K.UNAVAILABLE, "The operation could not be completed")));
    }), g(c, WebChannel.EventType.MESSAGE, (t3) => {
      var e2;
      if (!u) {
        const n2 = t3.data[0];
        B(!!n2);
        const s3 = n2, i2 = s3.error || ((e2 = s3[0]) === null || e2 === void 0 ? void 0 : e2.error);
        if (i2) {
          $("Connection", "WebChannel received error:", i2);
          const t4 = i2.status;
          let e3 = function(t5) {
            const e4 = hn[t5];
            if (e4 !== void 0)
              return dn(e4);
          }(t4), n3 = i2.message;
          e3 === void 0 && (e3 = K.INTERNAL, n3 = "Unknown error status: " + t4 + " with message " + i2.message), u = true, h.$i(new j(e3, n3)), c.close();
        } else
          $("Connection", "WebChannel received:", n2), h.Oi(n2);
      }
    }), g(i, Event.STAT_EVENT, (t3) => {
      t3.stat === Stat.PROXY ? $("Connection", "Detected buffering proxy") : t3.stat === Stat.NOPROXY && $("Connection", "Detected no buffering proxy");
    }), setTimeout(() => {
      h.ki();
    }, 0), h;
  }
};
function Jr() {
  return typeof document != "undefined" ? document : null;
}
function Yr(t2) {
  return new Bn(t2, true);
}
var Xr = class {
  constructor(t2, e, n = 1e3, s2 = 1.5, i = 6e4) {
    this.Oe = t2, this.timerId = e, this.Qi = n, this.Wi = s2, this.Gi = i, this.zi = 0, this.Hi = null, this.Ji = Date.now(), this.reset();
  }
  reset() {
    this.zi = 0;
  }
  Yi() {
    this.zi = this.Gi;
  }
  Xi(t2) {
    this.cancel();
    const e = Math.floor(this.zi + this.Zi()), n = Math.max(0, Date.now() - this.Ji), s2 = Math.max(0, e - n);
    s2 > 0 && $("ExponentialBackoff", `Backing off for ${s2} ms (base delay: ${this.zi} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`), this.Hi = this.Oe.enqueueAfterDelay(this.timerId, s2, () => (this.Ji = Date.now(), t2())), this.zi *= this.Wi, this.zi < this.Qi && (this.zi = this.Qi), this.zi > this.Gi && (this.zi = this.Gi);
  }
  tr() {
    this.Hi !== null && (this.Hi.skipDelay(), this.Hi = null);
  }
  cancel() {
    this.Hi !== null && (this.Hi.cancel(), this.Hi = null);
  }
  Zi() {
    return (Math.random() - 0.5) * this.zi;
  }
};
var Zr = class {
  constructor(t2, e, n, s2, i, r, o) {
    this.Oe = t2, this.er = n, this.nr = s2, this.sr = i, this.credentialsProvider = r, this.listener = o, this.state = 0, this.ir = 0, this.rr = null, this.cr = null, this.stream = null, this.ar = new Xr(t2, e);
  }
  ur() {
    return this.state === 1 || this.state === 5 || this.hr();
  }
  hr() {
    return this.state === 2 || this.state === 3;
  }
  start() {
    this.state !== 4 ? this.auth() : this.lr();
  }
  async stop() {
    this.ur() && await this.close(0);
  }
  dr() {
    this.state = 0, this.ar.reset();
  }
  wr() {
    this.hr() && this.rr === null && (this.rr = this.Oe.enqueueAfterDelay(this.er, 6e4, () => this._r()));
  }
  mr(t2) {
    this.gr(), this.stream.send(t2);
  }
  async _r() {
    if (this.hr())
      return this.close(0);
  }
  gr() {
    this.rr && (this.rr.cancel(), this.rr = null);
  }
  yr() {
    this.cr && (this.cr.cancel(), this.cr = null);
  }
  async close(t2, e) {
    this.gr(), this.yr(), this.ar.cancel(), this.ir++, t2 !== 4 ? this.ar.reset() : e && e.code === K.RESOURCE_EXHAUSTED ? (O(e.toString()), O("Using maximum backoff delay to prevent overloading the backend."), this.ar.Yi()) : e && e.code === K.UNAUTHENTICATED && this.state !== 3 && this.credentialsProvider.invalidateToken(), this.stream !== null && (this.pr(), this.stream.close(), this.stream = null), this.state = t2, await this.listener.Ci(e);
  }
  pr() {
  }
  auth() {
    this.state = 1;
    const t2 = this.Tr(this.ir), e = this.ir;
    this.credentialsProvider.getToken().then((t3) => {
      this.ir === e && this.Er(t3);
    }, (e2) => {
      t2(() => {
        const t3 = new j(K.UNKNOWN, "Fetching auth token failed: " + e2.message);
        return this.Ir(t3);
      });
    });
  }
  Er(t2) {
    const e = this.Tr(this.ir);
    this.stream = this.Ar(t2), this.stream.Si(() => {
      e(() => (this.state = 2, this.cr = this.Oe.enqueueAfterDelay(this.nr, 1e4, () => (this.hr() && (this.state = 3), Promise.resolve())), this.listener.Si()));
    }), this.stream.Ci((t3) => {
      e(() => this.Ir(t3));
    }), this.stream.onMessage((t3) => {
      e(() => this.onMessage(t3));
    });
  }
  lr() {
    this.state = 5, this.ar.Xi(async () => {
      this.state = 0, this.start();
    });
  }
  Ir(t2) {
    return $("PersistentStream", `close with error: ${t2}`), this.stream = null, this.close(4, t2);
  }
  Tr(t2) {
    return (e) => {
      this.Oe.enqueueAndForget(() => this.ir === t2 ? e() : ($("PersistentStream", "stream callback skipped by getCloseGuardedDispatcher."), Promise.resolve()));
    };
  }
};
var to = class extends Zr {
  constructor(t2, e, n, s2, i) {
    super(t2, "listen_stream_connection_backoff", "listen_stream_idle", "health_check_timeout", e, n, i), this.N = s2;
  }
  Ar(t2) {
    return this.sr.ji("Listen", t2);
  }
  onMessage(t2) {
    this.ar.reset();
    const e = ns(this.N, t2), n = function(t3) {
      if (!("targetChange" in t3))
        return rt.min();
      const e2 = t3.targetChange;
      return e2.targetIds && e2.targetIds.length ? rt.min() : e2.readTime ? jn(e2.readTime) : rt.min();
    }(t2);
    return this.listener.Rr(e, n);
  }
  br(t2) {
    const e = {};
    e.database = Yn(this.N), e.addTarget = function(t3, e2) {
      let n2;
      const s2 = e2.target;
      return n2 = Ht(s2) ? {
        documents: os(t3, s2)
      } : {
        query: cs(t3, s2)
      }, n2.targetId = e2.targetId, e2.resumeToken.approximateByteSize() > 0 ? n2.resumeToken = qn(t3, e2.resumeToken) : e2.snapshotVersion.compareTo(rt.min()) > 0 && (n2.readTime = Un(t3, e2.snapshotVersion.toTimestamp())), n2;
    }(this.N, t2);
    const n = us(this.N, t2);
    n && (e.labels = n), this.mr(e);
  }
  Pr(t2) {
    const e = {};
    e.database = Yn(this.N), e.removeTarget = t2, this.mr(e);
  }
};
var no = class extends class {
} {
  constructor(t2, e, n) {
    super(), this.credentials = t2, this.sr = e, this.N = n, this.kr = false;
  }
  $r() {
    if (this.kr)
      throw new j(K.FAILED_PRECONDITION, "The client has already been terminated.");
  }
  Li(t2, e, n) {
    return this.$r(), this.credentials.getToken().then((s2) => this.sr.Li(t2, e, n, s2)).catch((t3) => {
      throw t3.name === "FirebaseError" ? (t3.code === K.UNAUTHENTICATED && this.credentials.invalidateToken(), t3) : new j(K.UNKNOWN, t3.toString());
    });
  }
  Ki(t2, e, n) {
    return this.$r(), this.credentials.getToken().then((s2) => this.sr.Ki(t2, e, n, s2)).catch((t3) => {
      throw t3.name === "FirebaseError" ? (t3.code === K.UNAUTHENTICATED && this.credentials.invalidateToken(), t3) : new j(K.UNKNOWN, t3.toString());
    });
  }
  terminate() {
    this.kr = true;
  }
};
var so = class {
  constructor(t2, e) {
    this.asyncQueue = t2, this.onlineStateHandler = e, this.state = "Unknown", this.Or = 0, this.Fr = null, this.Mr = true;
  }
  Lr() {
    this.Or === 0 && (this.Br("Unknown"), this.Fr = this.asyncQueue.enqueueAfterDelay("online_state_timeout", 1e4, () => (this.Fr = null, this.Ur("Backend didn't respond within 10 seconds."), this.Br("Offline"), Promise.resolve())));
  }
  qr(t2) {
    this.state === "Online" ? this.Br("Unknown") : (this.Or++, this.Or >= 1 && (this.Kr(), this.Ur(`Connection failed 1 times. Most recent error: ${t2.toString()}`), this.Br("Offline")));
  }
  set(t2) {
    this.Kr(), this.Or = 0, t2 === "Online" && (this.Mr = false), this.Br(t2);
  }
  Br(t2) {
    t2 !== this.state && (this.state = t2, this.onlineStateHandler(t2));
  }
  Ur(t2) {
    const e = `Could not reach Cloud Firestore backend. ${t2}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
    this.Mr ? (O(e), this.Mr = false) : $("OnlineStateTracker", e);
  }
  Kr() {
    this.Fr !== null && (this.Fr.cancel(), this.Fr = null);
  }
};
var io = class {
  constructor(t2, e, n, s2, i) {
    this.localStore = t2, this.datastore = e, this.asyncQueue = n, this.remoteSyncer = {}, this.jr = [], this.Qr = new Map(), this.Wr = new Set(), this.Gr = [], this.zr = i, this.zr.Ti((t3) => {
      n.enqueueAndForget(async () => {
        wo(this) && ($("RemoteStore", "Restarting streams for network reachability change."), await async function(t4) {
          const e2 = q(t4);
          e2.Wr.add(4), await oo(e2), e2.Hr.set("Unknown"), e2.Wr.delete(4), await ro(e2);
        }(this));
      });
    }), this.Hr = new so(n, s2);
  }
};
async function ro(t2) {
  if (wo(t2))
    for (const e of t2.Gr)
      await e(true);
}
async function oo(t2) {
  for (const e of t2.Gr)
    await e(false);
}
function co(t2, e) {
  const n = q(t2);
  n.Qr.has(e.targetId) || (n.Qr.set(e.targetId, e), fo(n) ? lo(n) : Co(n).hr() && uo(n, e));
}
function ao(t2, e) {
  const n = q(t2), s2 = Co(n);
  n.Qr.delete(e), s2.hr() && ho(n, e), n.Qr.size === 0 && (s2.hr() ? s2.wr() : wo(n) && n.Hr.set("Unknown"));
}
function uo(t2, e) {
  t2.Jr.Y(e.targetId), Co(t2).br(e);
}
function ho(t2, e) {
  t2.Jr.Y(e), Co(t2).Pr(e);
}
function lo(t2) {
  t2.Jr = new $n({
    getRemoteKeysForTarget: (e) => t2.remoteSyncer.getRemoteKeysForTarget(e),
    Tt: (e) => t2.Qr.get(e) || null
  }), Co(t2).start(), t2.Hr.Lr();
}
function fo(t2) {
  return wo(t2) && !Co(t2).ur() && t2.Qr.size > 0;
}
function wo(t2) {
  return q(t2).Wr.size === 0;
}
function _o(t2) {
  t2.Jr = void 0;
}
async function mo(t2) {
  t2.Qr.forEach((e, n) => {
    uo(t2, e);
  });
}
async function go(t2, e) {
  _o(t2), fo(t2) ? (t2.Hr.qr(e), lo(t2)) : t2.Hr.set("Unknown");
}
async function yo(t2, e, n) {
  if (t2.Hr.set("Online"), e instanceof xn && e.state === 2 && e.cause)
    try {
      await async function(t3, e2) {
        const n2 = e2.cause;
        for (const s2 of e2.targetIds)
          t3.Qr.has(s2) && (await t3.remoteSyncer.rejectListen(s2, n2), t3.Qr.delete(s2), t3.Jr.removeTarget(s2));
      }(t2, e);
    } catch (n2) {
      $("RemoteStore", "Failed to remove targets %s: %s ", e.targetIds.join(","), n2), await po(t2, n2);
    }
  else if (e instanceof Cn ? t2.Jr.rt(e) : e instanceof Nn ? t2.Jr.ft(e) : t2.Jr.at(e), !n.isEqual(rt.min()))
    try {
      const e2 = await fr(t2.localStore);
      n.compareTo(e2) >= 0 && await function(t3, e3) {
        const n2 = t3.Jr._t(e3);
        return n2.targetChanges.forEach((n3, s2) => {
          if (n3.resumeToken.approximateByteSize() > 0) {
            const i = t3.Qr.get(s2);
            i && t3.Qr.set(s2, i.withResumeToken(n3.resumeToken, e3));
          }
        }), n2.targetMismatches.forEach((e4) => {
          const n3 = t3.Qr.get(e4);
          if (!n3)
            return;
          t3.Qr.set(e4, n3.withResumeToken(_t.EMPTY_BYTE_STRING, n3.snapshotVersion)), ho(t3, e4);
          const s2 = new ii(n3.target, e4, 1, n3.sequenceNumber);
          uo(t3, s2);
        }), t3.remoteSyncer.applyRemoteEvent(n2);
      }(t2, n);
    } catch (e2) {
      $("RemoteStore", "Failed to raise snapshot:", e2), await po(t2, e2);
    }
}
async function po(t2, e, n) {
  if (!Hs(e))
    throw e;
  t2.Wr.add(1), await oo(t2), t2.Hr.set("Offline"), n || (n = () => fr(t2.localStore)), t2.asyncQueue.enqueueRetryable(async () => {
    $("RemoteStore", "Retrying IndexedDB access"), await n(), t2.Wr.delete(1), await ro(t2);
  });
}
async function Do(t2, e) {
  const n = q(t2);
  e ? (n.Wr.delete(2), await ro(n)) : e || (n.Wr.add(2), await oo(n), n.Hr.set("Unknown"));
}
function Co(t2) {
  return t2.Yr || (t2.Yr = function(t3, e, n) {
    const s2 = q(t3);
    return s2.$r(), new to(e, s2.sr, s2.credentials, s2.N, n);
  }(t2.datastore, t2.asyncQueue, {
    Si: mo.bind(null, t2),
    Ci: go.bind(null, t2),
    Rr: yo.bind(null, t2)
  }), t2.Gr.push(async (e) => {
    e ? (t2.Yr.dr(), fo(t2) ? lo(t2) : t2.Hr.set("Unknown")) : (await t2.Yr.stop(), _o(t2));
  })), t2.Yr;
}
var xo = class {
  constructor(t2, e, n, s2, i) {
    this.asyncQueue = t2, this.timerId = e, this.targetTimeMs = n, this.op = s2, this.removalCallback = i, this.deferred = new Q(), this.then = this.deferred.promise.then.bind(this.deferred.promise), this.deferred.promise.catch((t3) => {
    });
  }
  static createAndSchedule(t2, e, n, s2, i) {
    const r = Date.now() + n, o = new xo(t2, e, r, s2, i);
    return o.start(n), o;
  }
  start(t2) {
    this.timerHandle = setTimeout(() => this.handleDelayElapsed(), t2);
  }
  skipDelay() {
    return this.handleDelayElapsed();
  }
  cancel(t2) {
    this.timerHandle !== null && (this.clearTimeout(), this.deferred.reject(new j(K.CANCELLED, "Operation cancelled" + (t2 ? ": " + t2 : ""))));
  }
  handleDelayElapsed() {
    this.asyncQueue.enqueueAndForget(() => this.timerHandle !== null ? (this.clearTimeout(), this.op().then((t2) => this.deferred.resolve(t2))) : Promise.resolve());
  }
  clearTimeout() {
    this.timerHandle !== null && (this.removalCallback(this), clearTimeout(this.timerHandle), this.timerHandle = null);
  }
};
function ko(t2, e) {
  if (O("AsyncQueue", `${e}: ${t2}`), Hs(t2))
    return new j(K.UNAVAILABLE, `${e}: ${t2}`);
  throw t2;
}
var $o = class {
  constructor(t2) {
    this.comparator = t2 ? (e, n) => t2(e, n) || Pt.comparator(e.key, n.key) : (t3, e) => Pt.comparator(t3.key, e.key), this.keyedMap = In(), this.sortedSet = new wn(this.comparator);
  }
  static emptySet(t2) {
    return new $o(t2.comparator);
  }
  has(t2) {
    return this.keyedMap.get(t2) != null;
  }
  get(t2) {
    return this.keyedMap.get(t2);
  }
  first() {
    return this.sortedSet.minKey();
  }
  last() {
    return this.sortedSet.maxKey();
  }
  isEmpty() {
    return this.sortedSet.isEmpty();
  }
  indexOf(t2) {
    const e = this.keyedMap.get(t2);
    return e ? this.sortedSet.indexOf(e) : -1;
  }
  get size() {
    return this.sortedSet.size;
  }
  forEach(t2) {
    this.sortedSet.inorderTraversal((e, n) => (t2(e), false));
  }
  add(t2) {
    const e = this.delete(t2.key);
    return e.copy(e.keyedMap.insert(t2.key, t2), e.sortedSet.insert(t2, null));
  }
  delete(t2) {
    const e = this.get(t2);
    return e ? this.copy(this.keyedMap.remove(t2), this.sortedSet.remove(e)) : this;
  }
  isEqual(t2) {
    if (!(t2 instanceof $o))
      return false;
    if (this.size !== t2.size)
      return false;
    const e = this.sortedSet.getIterator(), n = t2.sortedSet.getIterator();
    for (; e.hasNext(); ) {
      const t3 = e.getNext().key, s2 = n.getNext().key;
      if (!t3.isEqual(s2))
        return false;
    }
    return true;
  }
  toString() {
    const t2 = [];
    return this.forEach((e) => {
      t2.push(e.toString());
    }), t2.length === 0 ? "DocumentSet ()" : "DocumentSet (\n  " + t2.join("  \n") + "\n)";
  }
  copy(t2, e) {
    const n = new $o();
    return n.comparator = this.comparator, n.keyedMap = t2, n.sortedSet = e, n;
  }
};
var Oo = class {
  constructor() {
    this.Zr = new wn(Pt.comparator);
  }
  track(t2) {
    const e = t2.doc.key, n = this.Zr.get(e);
    n ? t2.type !== 0 && n.type === 3 ? this.Zr = this.Zr.insert(e, t2) : t2.type === 3 && n.type !== 1 ? this.Zr = this.Zr.insert(e, {
      type: n.type,
      doc: t2.doc
    }) : t2.type === 2 && n.type === 2 ? this.Zr = this.Zr.insert(e, {
      type: 2,
      doc: t2.doc
    }) : t2.type === 2 && n.type === 0 ? this.Zr = this.Zr.insert(e, {
      type: 0,
      doc: t2.doc
    }) : t2.type === 1 && n.type === 0 ? this.Zr = this.Zr.remove(e) : t2.type === 1 && n.type === 2 ? this.Zr = this.Zr.insert(e, {
      type: 1,
      doc: n.doc
    }) : t2.type === 0 && n.type === 1 ? this.Zr = this.Zr.insert(e, {
      type: 2,
      doc: t2.doc
    }) : L() : this.Zr = this.Zr.insert(e, t2);
  }
  eo() {
    const t2 = [];
    return this.Zr.inorderTraversal((e, n) => {
      t2.push(n);
    }), t2;
  }
};
var Fo = class {
  constructor(t2, e, n, s2, i, r, o, c) {
    this.query = t2, this.docs = e, this.oldDocs = n, this.docChanges = s2, this.mutatedKeys = i, this.fromCache = r, this.syncStateChanged = o, this.excludesMetadataChanges = c;
  }
  static fromInitialDocuments(t2, e, n, s2) {
    const i = [];
    return e.forEach((t3) => {
      i.push({
        type: 0,
        doc: t3
      });
    }), new Fo(t2, e, $o.emptySet(e), i, n, s2, true, false);
  }
  get hasPendingWrites() {
    return !this.mutatedKeys.isEmpty();
  }
  isEqual(t2) {
    if (!(this.fromCache === t2.fromCache && this.syncStateChanged === t2.syncStateChanged && this.mutatedKeys.isEqual(t2.mutatedKeys) && Ae(this.query, t2.query) && this.docs.isEqual(t2.docs) && this.oldDocs.isEqual(t2.oldDocs)))
      return false;
    const e = this.docChanges, n = t2.docChanges;
    if (e.length !== n.length)
      return false;
    for (let t3 = 0; t3 < e.length; t3++)
      if (e[t3].type !== n[t3].type || !e[t3].doc.isEqual(n[t3].doc))
        return false;
    return true;
  }
};
var Mo = class {
  constructor() {
    this.no = void 0, this.listeners = [];
  }
};
var Lo = class {
  constructor() {
    this.queries = new ji((t2) => Re(t2), Ae), this.onlineState = "Unknown", this.so = new Set();
  }
};
async function Bo(t2, e) {
  const n = q(t2), s2 = e.query;
  let i = false, r = n.queries.get(s2);
  if (r || (i = true, r = new Mo()), i)
    try {
      r.no = await n.onListen(s2);
    } catch (t3) {
      const n2 = ko(t3, `Initialization of query '${be(e.query)}' failed`);
      return void e.onError(n2);
    }
  if (n.queries.set(s2, r), r.listeners.push(e), e.io(n.onlineState), r.no) {
    e.ro(r.no) && jo(n);
  }
}
async function Uo(t2, e) {
  const n = q(t2), s2 = e.query;
  let i = false;
  const r = n.queries.get(s2);
  if (r) {
    const t3 = r.listeners.indexOf(e);
    t3 >= 0 && (r.listeners.splice(t3, 1), i = r.listeners.length === 0);
  }
  if (i)
    return n.queries.delete(s2), n.onUnlisten(s2);
}
function qo(t2, e) {
  const n = q(t2);
  let s2 = false;
  for (const t3 of e) {
    const e2 = t3.query, i = n.queries.get(e2);
    if (i) {
      for (const e3 of i.listeners)
        e3.ro(t3) && (s2 = true);
      i.no = t3;
    }
  }
  s2 && jo(n);
}
function Ko(t2, e, n) {
  const s2 = q(t2), i = s2.queries.get(e);
  if (i)
    for (const t3 of i.listeners)
      t3.onError(n);
  s2.queries.delete(e);
}
function jo(t2) {
  t2.so.forEach((t3) => {
    t3.next();
  });
}
var Qo = class {
  constructor(t2, e, n) {
    this.query = t2, this.oo = e, this.co = false, this.ao = null, this.onlineState = "Unknown", this.options = n || {};
  }
  ro(t2) {
    if (!this.options.includeMetadataChanges) {
      const e2 = [];
      for (const n of t2.docChanges)
        n.type !== 3 && e2.push(n);
      t2 = new Fo(t2.query, t2.docs, t2.oldDocs, e2, t2.mutatedKeys, t2.fromCache, t2.syncStateChanged, true);
    }
    let e = false;
    return this.co ? this.uo(t2) && (this.oo.next(t2), e = true) : this.ho(t2, this.onlineState) && (this.lo(t2), e = true), this.ao = t2, e;
  }
  onError(t2) {
    this.oo.error(t2);
  }
  io(t2) {
    this.onlineState = t2;
    let e = false;
    return this.ao && !this.co && this.ho(this.ao, t2) && (this.lo(this.ao), e = true), e;
  }
  ho(t2, e) {
    if (!t2.fromCache)
      return true;
    const n = e !== "Offline";
    return (!this.options.fo || !n) && (!t2.docs.isEmpty() || e === "Offline");
  }
  uo(t2) {
    if (t2.docChanges.length > 0)
      return true;
    const e = this.ao && this.ao.hasPendingWrites !== t2.hasPendingWrites;
    return !(!t2.syncStateChanged && !e) && this.options.includeMetadataChanges === true;
  }
  lo(t2) {
    t2 = Fo.fromInitialDocuments(t2.query, t2.docs, t2.mutatedKeys, t2.fromCache), this.co = true, this.oo.next(t2);
  }
};
var Jo = class {
  constructor(t2) {
    this.key = t2;
  }
};
var Yo = class {
  constructor(t2) {
    this.key = t2;
  }
};
var Xo = class {
  constructor(t2, e) {
    this.query = t2, this.po = e, this.To = null, this.current = false, this.Eo = Pn(), this.mutatedKeys = Pn(), this.Io = ve(t2), this.Ao = new $o(this.Io);
  }
  get Ro() {
    return this.po;
  }
  bo(t2, e) {
    const n = e ? e.Po : new Oo(), s2 = e ? e.Ao : this.Ao;
    let i = e ? e.mutatedKeys : this.mutatedKeys, r = s2, o = false;
    const c = _e(this.query) && s2.size === this.query.limit ? s2.last() : null, a = me(this.query) && s2.size === this.query.limit ? s2.first() : null;
    if (t2.inorderTraversal((t3, e2) => {
      const u = s2.get(t3), h = Pe(this.query, e2) ? e2 : null, l2 = !!u && this.mutatedKeys.has(u.key), f = !!h && (h.hasLocalMutations || this.mutatedKeys.has(h.key) && h.hasCommittedMutations);
      let d = false;
      if (u && h) {
        u.data.isEqual(h.data) ? l2 !== f && (n.track({
          type: 3,
          doc: h
        }), d = true) : this.vo(u, h) || (n.track({
          type: 2,
          doc: h
        }), d = true, (c && this.Io(h, c) > 0 || a && this.Io(h, a) < 0) && (o = true));
      } else
        !u && h ? (n.track({
          type: 0,
          doc: h
        }), d = true) : u && !h && (n.track({
          type: 1,
          doc: u
        }), d = true, (c || a) && (o = true));
      d && (h ? (r = r.add(h), i = f ? i.add(t3) : i.delete(t3)) : (r = r.delete(t3), i = i.delete(t3)));
    }), _e(this.query) || me(this.query))
      for (; r.size > this.query.limit; ) {
        const t3 = _e(this.query) ? r.last() : r.first();
        r = r.delete(t3.key), i = i.delete(t3.key), n.track({
          type: 1,
          doc: t3
        });
      }
    return {
      Ao: r,
      Po: n,
      Ln: o,
      mutatedKeys: i
    };
  }
  vo(t2, e) {
    return t2.hasLocalMutations && e.hasCommittedMutations && !e.hasLocalMutations;
  }
  applyChanges(t2, e, n) {
    const s2 = this.Ao;
    this.Ao = t2.Ao, this.mutatedKeys = t2.mutatedKeys;
    const i = t2.Po.eo();
    i.sort((t3, e2) => function(t4, e3) {
      const n2 = (t5) => {
        switch (t5) {
          case 0:
            return 1;
          case 2:
          case 3:
            return 2;
          case 1:
            return 0;
          default:
            return L();
        }
      };
      return n2(t4) - n2(e3);
    }(t3.type, e2.type) || this.Io(t3.doc, e2.doc)), this.Vo(n);
    const r = e ? this.So() : [], o = this.Eo.size === 0 && this.current ? 1 : 0, c = o !== this.To;
    if (this.To = o, i.length !== 0 || c) {
      return {
        snapshot: new Fo(this.query, t2.Ao, s2, i, t2.mutatedKeys, o === 0, c, false),
        Do: r
      };
    }
    return {
      Do: r
    };
  }
  io(t2) {
    return this.current && t2 === "Offline" ? (this.current = false, this.applyChanges({
      Ao: this.Ao,
      Po: new Oo(),
      mutatedKeys: this.mutatedKeys,
      Ln: false
    }, false)) : {
      Do: []
    };
  }
  Co(t2) {
    return !this.po.has(t2) && (!!this.Ao.has(t2) && !this.Ao.get(t2).hasLocalMutations);
  }
  Vo(t2) {
    t2 && (t2.addedDocuments.forEach((t3) => this.po = this.po.add(t3)), t2.modifiedDocuments.forEach((t3) => {
    }), t2.removedDocuments.forEach((t3) => this.po = this.po.delete(t3)), this.current = t2.current);
  }
  So() {
    if (!this.current)
      return [];
    const t2 = this.Eo;
    this.Eo = Pn(), this.Ao.forEach((t3) => {
      this.Co(t3.key) && (this.Eo = this.Eo.add(t3.key));
    });
    const e = [];
    return t2.forEach((t3) => {
      this.Eo.has(t3) || e.push(new Yo(t3));
    }), this.Eo.forEach((n) => {
      t2.has(n) || e.push(new Jo(n));
    }), e;
  }
  No(t2) {
    this.po = t2.Gn, this.Eo = Pn();
    const e = this.bo(t2.documents);
    return this.applyChanges(e, true);
  }
  xo() {
    return Fo.fromInitialDocuments(this.query, this.Ao, this.mutatedKeys, this.To === 0);
  }
};
var Zo = class {
  constructor(t2, e, n) {
    this.query = t2, this.targetId = e, this.view = n;
  }
};
var tc = class {
  constructor(t2) {
    this.key = t2, this.ko = false;
  }
};
var ec = class {
  constructor(t2, e, n, s2, i, r) {
    this.localStore = t2, this.remoteStore = e, this.eventManager = n, this.sharedClientState = s2, this.currentUser = i, this.maxConcurrentLimboResolutions = r, this.$o = {}, this.Oo = new ji((t3) => Re(t3), Ae), this.Fo = new Map(), this.Mo = new Set(), this.Lo = new wn(Pt.comparator), this.Bo = new Map(), this.Uo = new br(), this.qo = {}, this.Ko = new Map(), this.jo = Ni.ie(), this.onlineState = "Unknown", this.Qo = void 0;
  }
  get isPrimaryClient() {
    return this.Qo === true;
  }
};
async function nc(t2, e) {
  const n = Cc(t2);
  let s2, i;
  const r = n.Oo.get(e);
  if (r)
    s2 = r.targetId, n.sharedClientState.addLocalQueryTarget(s2), i = r.view.xo();
  else {
    const t3 = await mr(n.localStore, Ee(e)), r2 = n.sharedClientState.addLocalQueryTarget(t3.targetId);
    s2 = t3.targetId, i = await sc(n, e, s2, r2 === "current"), n.isPrimaryClient && co(n.remoteStore, t3);
  }
  return i;
}
async function sc(t2, e, n, s2) {
  t2.Wo = (e2, n2, s3) => async function(t3, e3, n3, s4) {
    let i2 = e3.view.bo(n3);
    i2.Ln && (i2 = await yr(t3.localStore, e3.query, false).then(({ documents: t4 }) => e3.view.bo(t4, i2)));
    const r2 = s4 && s4.targetChanges.get(e3.targetId), o2 = e3.view.applyChanges(i2, t3.isPrimaryClient, r2);
    return mc(t3, e3.targetId, o2.Do), o2.snapshot;
  }(t2, e2, n2, s3);
  const i = await yr(t2.localStore, e, true), r = new Xo(e, i.Gn), o = r.bo(i.documents), c = Dn.createSynthesizedTargetChangeForCurrentChange(n, s2 && t2.onlineState !== "Offline"), a = r.applyChanges(o, t2.isPrimaryClient, c);
  mc(t2, n, a.Do);
  const u = new Zo(e, n, r);
  return t2.Oo.set(e, u), t2.Fo.has(n) ? t2.Fo.get(n).push(e) : t2.Fo.set(n, [e]), a.snapshot;
}
async function ic(t2, e) {
  const n = q(t2), s2 = n.Oo.get(e), i = n.Fo.get(s2.targetId);
  if (i.length > 1)
    return n.Fo.set(s2.targetId, i.filter((t3) => !Ae(t3, e))), void n.Oo.delete(e);
  if (n.isPrimaryClient) {
    n.sharedClientState.removeLocalQueryTarget(s2.targetId);
    n.sharedClientState.isActiveQueryTarget(s2.targetId) || await gr(n.localStore, s2.targetId, false).then(() => {
      n.sharedClientState.clearQueryState(s2.targetId), ao(n.remoteStore, s2.targetId), wc(n, s2.targetId);
    }).catch(Fi);
  } else
    wc(n, s2.targetId), await gr(n.localStore, s2.targetId, true);
}
async function oc(t2, e) {
  const n = q(t2);
  try {
    const t3 = await dr(n.localStore, e);
    e.targetChanges.forEach((t4, e2) => {
      const s2 = n.Bo.get(e2);
      s2 && (B(t4.addedDocuments.size + t4.modifiedDocuments.size + t4.removedDocuments.size <= 1), t4.addedDocuments.size > 0 ? s2.ko = true : t4.modifiedDocuments.size > 0 ? B(s2.ko) : t4.removedDocuments.size > 0 && (B(s2.ko), s2.ko = false));
    }), await pc(n, t3, e);
  } catch (t3) {
    await Fi(t3);
  }
}
function cc(t2, e, n) {
  const s2 = q(t2);
  if (s2.isPrimaryClient && n === 0 || !s2.isPrimaryClient && n === 1) {
    const t3 = [];
    s2.Oo.forEach((n2, s3) => {
      const i = s3.view.io(e);
      i.snapshot && t3.push(i.snapshot);
    }), function(t4, e2) {
      const n2 = q(t4);
      n2.onlineState = e2;
      let s3 = false;
      n2.queries.forEach((t5, n3) => {
        for (const t6 of n3.listeners)
          t6.io(e2) && (s3 = true);
      }), s3 && jo(n2);
    }(s2.eventManager, e), t3.length && s2.$o.Rr(t3), s2.onlineState = e, s2.isPrimaryClient && s2.sharedClientState.setOnlineState(e);
  }
}
async function ac(t2, e, n) {
  const s2 = q(t2);
  s2.sharedClientState.updateQueryState(e, "rejected", n);
  const i = s2.Bo.get(e), r = i && i.key;
  if (r) {
    let t3 = new wn(Pt.comparator);
    t3 = t3.insert(r, Kt.newNoDocument(r, rt.min()));
    const n2 = Pn().add(r), i2 = new Sn(rt.min(), new Map(), new gn(et), t3, n2);
    await oc(s2, i2), s2.Lo = s2.Lo.remove(r), s2.Bo.delete(e), yc(s2);
  } else
    await gr(s2.localStore, e, false).then(() => wc(s2, e, n)).catch(Fi);
}
function wc(t2, e, n = null) {
  t2.sharedClientState.removeLocalQueryTarget(e);
  for (const s2 of t2.Fo.get(e))
    t2.Oo.delete(s2), n && t2.$o.Go(s2, n);
  if (t2.Fo.delete(e), t2.isPrimaryClient) {
    t2.Uo.cs(e).forEach((e2) => {
      t2.Uo.containsKey(e2) || _c(t2, e2);
    });
  }
}
function _c(t2, e) {
  t2.Mo.delete(e.path.canonicalString());
  const n = t2.Lo.get(e);
  n !== null && (ao(t2.remoteStore, n), t2.Lo = t2.Lo.remove(e), t2.Bo.delete(n), yc(t2));
}
function mc(t2, e, n) {
  for (const s2 of n)
    if (s2 instanceof Jo)
      t2.Uo.addReference(s2.key, e), gc(t2, s2);
    else if (s2 instanceof Yo) {
      $("SyncEngine", "Document no longer in limbo: " + s2.key), t2.Uo.removeReference(s2.key, e);
      t2.Uo.containsKey(s2.key) || _c(t2, s2.key);
    } else
      L();
}
function gc(t2, e) {
  const n = e.key, s2 = n.path.canonicalString();
  t2.Lo.get(n) || t2.Mo.has(s2) || ($("SyncEngine", "New document in limbo: " + n), t2.Mo.add(s2), yc(t2));
}
function yc(t2) {
  for (; t2.Mo.size > 0 && t2.Lo.size < t2.maxConcurrentLimboResolutions; ) {
    const e = t2.Mo.values().next().value;
    t2.Mo.delete(e);
    const n = new Pt(ht.fromString(e)), s2 = t2.jo.next();
    t2.Bo.set(s2, new tc(n)), t2.Lo = t2.Lo.insert(n, s2), co(t2.remoteStore, new ii(Ee(we(n.path)), s2, 2, X.T));
  }
}
async function pc(t2, e, n) {
  const s2 = q(t2), i = [], r = [], o = [];
  s2.Oo.isEmpty() || (s2.Oo.forEach((t3, c) => {
    o.push(s2.Wo(c, e, n).then((t4) => {
      if (t4) {
        s2.isPrimaryClient && s2.sharedClientState.updateQueryState(c.targetId, t4.fromCache ? "not-current" : "current"), i.push(t4);
        const e2 = or.kn(c.targetId, t4);
        r.push(e2);
      }
    }));
  }), await Promise.all(o), s2.$o.Rr(i), await async function(t3, e2) {
    const n2 = q(t3);
    try {
      await n2.persistence.runTransaction("notifyLocalViewChanges", "readwrite", (t4) => js.forEach(e2, (e3) => js.forEach(e3.Nn, (s3) => n2.persistence.referenceDelegate.addReference(t4, e3.targetId, s3)).next(() => js.forEach(e3.xn, (s3) => n2.persistence.referenceDelegate.removeReference(t4, e3.targetId, s3)))));
    } catch (t4) {
      if (!Hs(t4))
        throw t4;
      $("LocalStore", "Failed to update sequence numbers: " + t4);
    }
    for (const t4 of e2) {
      const e3 = t4.targetId;
      if (!t4.fromCache) {
        const t5 = n2.Un.get(e3), s3 = t5.snapshotVersion, i2 = t5.withLastLimboFreeSnapshotVersion(s3);
        n2.Un = n2.Un.insert(e3, i2);
      }
    }
  }(s2.localStore, r));
}
async function Tc(t2, e) {
  const n = q(t2);
  if (!n.currentUser.isEqual(e)) {
    $("SyncEngine", "User change. New user:", e.toKey());
    const t3 = await hr(n.localStore, e);
    n.currentUser = e, function(t4, e2) {
      t4.Ko.forEach((t5) => {
        t5.forEach((t6) => {
          t6.reject(new j(K.CANCELLED, e2));
        });
      }), t4.Ko.clear();
    }(n, "'waitForPendingWrites' promise is rejected due to a user change."), n.sharedClientState.handleUserChange(e, t3.removedBatchIds, t3.addedBatchIds), await pc(n, t3.Wn);
  }
}
function Ec(t2, e) {
  const n = q(t2), s2 = n.Bo.get(e);
  if (s2 && s2.ko)
    return Pn().add(s2.key);
  {
    let t3 = Pn();
    const s3 = n.Fo.get(e);
    if (!s3)
      return t3;
    for (const e2 of s3) {
      const s4 = n.Oo.get(e2);
      t3 = t3.unionWith(s4.view.Ro);
    }
    return t3;
  }
}
function Cc(t2) {
  const e = q(t2);
  return e.remoteStore.remoteSyncer.applyRemoteEvent = oc.bind(null, e), e.remoteStore.remoteSyncer.getRemoteKeysForTarget = Ec.bind(null, e), e.remoteStore.remoteSyncer.rejectListen = ac.bind(null, e), e.$o.Rr = qo.bind(null, e.eventManager), e.$o.Go = Ko.bind(null, e.eventManager), e;
}
var kc = class {
  constructor() {
    this.synchronizeTabs = false;
  }
  async initialize(t2) {
    this.N = Yr(t2.databaseInfo.databaseId), this.sharedClientState = this.Ho(t2), this.persistence = this.Jo(t2), await this.persistence.start(), this.gcScheduler = this.Yo(t2), this.localStore = this.Xo(t2);
  }
  Yo(t2) {
    return null;
  }
  Xo(t2) {
    return ur(this.persistence, new cr(), t2.initialUser, this.N);
  }
  Jo(t2) {
    return new Cr(xr.Ns, this.N);
  }
  Ho(t2) {
    return new Kr();
  }
  async terminate() {
    this.gcScheduler && this.gcScheduler.stop(), await this.sharedClientState.shutdown(), await this.persistence.shutdown();
  }
};
var Fc = class {
  async initialize(t2, e) {
    this.localStore || (this.localStore = t2.localStore, this.sharedClientState = t2.sharedClientState, this.datastore = this.createDatastore(e), this.remoteStore = this.createRemoteStore(e), this.eventManager = this.createEventManager(e), this.syncEngine = this.createSyncEngine(e, !t2.synchronizeTabs), this.sharedClientState.onlineStateHandler = (t3) => cc(this.syncEngine, t3, 1), this.remoteStore.remoteSyncer.handleCredentialChange = Tc.bind(null, this.syncEngine), await Do(this.remoteStore, this.syncEngine.isPrimaryClient));
  }
  createEventManager(t2) {
    return new Lo();
  }
  createDatastore(t2) {
    const e = Yr(t2.databaseInfo.databaseId), n = (s2 = t2.databaseInfo, new zr(s2));
    var s2;
    return function(t3, e2, n2) {
      return new no(t3, e2, n2);
    }(t2.credentials, n, e);
  }
  createRemoteStore(t2) {
    return e = this.localStore, n = this.datastore, s2 = t2.asyncQueue, i = (t3) => cc(this.syncEngine, t3, 0), r = Qr.bt() ? new Qr() : new jr(), new io(e, n, s2, i, r);
    var e, n, s2, i, r;
  }
  createSyncEngine(t2, e) {
    return function(t3, e2, n, s2, i, r, o) {
      const c = new ec(t3, e2, n, s2, i, r);
      return o && (c.Qo = true), c;
    }(this.localStore, this.remoteStore, this.eventManager, this.sharedClientState, t2.initialUser, t2.maxConcurrentLimboResolutions, e);
  }
  terminate() {
    return async function(t2) {
      const e = q(t2);
      $("RemoteStore", "RemoteStore shutting down."), e.Wr.add(5), await oo(e), e.zr.shutdown(), e.Hr.set("Unknown");
    }(this.remoteStore);
  }
};
var Lc = class {
  constructor(t2) {
    this.observer = t2, this.muted = false;
  }
  next(t2) {
    this.observer.next && this.tc(this.observer.next, t2);
  }
  error(t2) {
    this.observer.error ? this.tc(this.observer.error, t2) : console.error("Uncaught Error in snapshot listener:", t2);
  }
  ec() {
    this.muted = true;
  }
  tc(t2, e) {
    this.muted || setTimeout(() => {
      this.muted || t2(e);
    }, 0);
  }
};
var Kc = class {
  constructor(t2, e, n) {
    this.credentials = t2, this.asyncQueue = e, this.databaseInfo = n, this.user = D.UNAUTHENTICATED, this.clientId = tt.I(), this.credentialListener = () => Promise.resolve(), this.credentials.start(e, async (t3) => {
      $("FirestoreClient", "Received user=", t3.uid), await this.credentialListener(t3), this.user = t3;
    });
  }
  async getConfiguration() {
    return {
      asyncQueue: this.asyncQueue,
      databaseInfo: this.databaseInfo,
      clientId: this.clientId,
      credentials: this.credentials,
      initialUser: this.user,
      maxConcurrentLimboResolutions: 100
    };
  }
  setCredentialChangeListener(t2) {
    this.credentialListener = t2;
  }
  verifyNotTerminated() {
    if (this.asyncQueue.isShuttingDown)
      throw new j(K.FAILED_PRECONDITION, "The client has already been terminated.");
  }
  terminate() {
    this.asyncQueue.enterRestrictedMode();
    const t2 = new Q();
    return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async () => {
      try {
        this.onlineComponents && await this.onlineComponents.terminate(), this.offlineComponents && await this.offlineComponents.terminate(), this.credentials.shutdown(), t2.resolve();
      } catch (e) {
        const n = ko(e, "Failed to shutdown persistence");
        t2.reject(n);
      }
    }), t2.promise;
  }
};
async function jc(t2, e) {
  t2.asyncQueue.verifyOperationInProgress(), $("FirestoreClient", "Initializing OfflineComponentProvider");
  const n = await t2.getConfiguration();
  await e.initialize(n);
  let s2 = n.initialUser;
  t2.setCredentialChangeListener(async (t3) => {
    s2.isEqual(t3) || (await hr(e.localStore, t3), s2 = t3);
  }), e.persistence.setDatabaseDeletedListener(() => t2.terminate()), t2.offlineComponents = e;
}
async function Qc(t2, e) {
  t2.asyncQueue.verifyOperationInProgress();
  const n = await Wc(t2);
  $("FirestoreClient", "Initializing OnlineComponentProvider");
  const s2 = await t2.getConfiguration();
  await e.initialize(n, s2), t2.setCredentialChangeListener((t3) => async function(t4, e2) {
    const n2 = q(t4);
    n2.asyncQueue.verifyOperationInProgress(), $("RemoteStore", "RemoteStore received new credentials");
    const s3 = wo(n2);
    n2.Wr.add(3), await oo(n2), s3 && n2.Hr.set("Unknown"), await n2.remoteSyncer.handleCredentialChange(e2), n2.Wr.delete(3), await ro(n2);
  }(e.remoteStore, t3)), t2.onlineComponents = e;
}
async function Wc(t2) {
  return t2.offlineComponents || ($("FirestoreClient", "Using default OfflineComponentProvider"), await jc(t2, new kc())), t2.offlineComponents;
}
async function Gc(t2) {
  return t2.onlineComponents || ($("FirestoreClient", "Using default OnlineComponentProvider"), await Qc(t2, new Fc())), t2.onlineComponents;
}
async function Xc(t2) {
  const e = await Gc(t2), n = e.eventManager;
  return n.onListen = nc.bind(null, e.syncEngine), n.onUnlisten = ic.bind(null, e.syncEngine), n;
}
function ia(t2, e, n = {}) {
  const s2 = new Q();
  return t2.asyncQueue.enqueueAndForget(async () => function(t3, e2, n2, s3, i) {
    const r = new Lc({
      next: (n3) => {
        e2.enqueueAndForget(() => Uo(t3, o)), n3.fromCache && s3.source === "server" ? i.reject(new j(K.UNAVAILABLE, 'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')) : i.resolve(n3);
      },
      error: (t4) => i.reject(t4)
    }), o = new Qo(n2, r, {
      includeMetadataChanges: true,
      fo: true
    });
    return Bo(t3, o);
  }(await Xc(t2), t2.asyncQueue, e, n, s2)), s2.promise;
}
var ua = class {
  constructor(t2, e, n, s2, i, r, o, c) {
    this.databaseId = t2, this.appId = e, this.persistenceKey = n, this.host = s2, this.ssl = i, this.forceLongPolling = r, this.autoDetectLongPolling = o, this.useFetchStreams = c;
  }
};
var ha = class {
  constructor(t2, e) {
    this.projectId = t2, this.database = e || "(default)";
  }
  get isDefaultDatabase() {
    return this.database === "(default)";
  }
  isEqual(t2) {
    return t2 instanceof ha && t2.projectId === this.projectId && t2.database === this.database;
  }
};
var la = new Map();
function fa(t2, e, n) {
  if (!n)
    throw new j(K.INVALID_ARGUMENT, `Function ${t2}() cannot be called with an empty ${e}.`);
}
function da(t2, e, n, s2) {
  if (e === true && s2 === true)
    throw new j(K.INVALID_ARGUMENT, `${t2} and ${n} cannot be used together.`);
}
function _a2(t2) {
  if (Pt.isDocumentKey(t2))
    throw new j(K.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${t2} has ${t2.length}.`);
}
function ma(t2) {
  if (t2 === void 0)
    return "undefined";
  if (t2 === null)
    return "null";
  if (typeof t2 == "string")
    return t2.length > 20 && (t2 = `${t2.substring(0, 20)}...`), JSON.stringify(t2);
  if (typeof t2 == "number" || typeof t2 == "boolean")
    return "" + t2;
  if (typeof t2 == "object") {
    if (t2 instanceof Array)
      return "an array";
    {
      const e = function(t3) {
        if (t3.constructor)
          return t3.constructor.name;
        return null;
      }(t2);
      return e ? `a custom ${e} object` : "an object";
    }
  }
  return typeof t2 == "function" ? "a function" : L();
}
function ga(t2, e) {
  if ("_delegate" in t2 && (t2 = t2._delegate), !(t2 instanceof e)) {
    if (e.name === t2.constructor.name)
      throw new j(K.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
    {
      const n = ma(t2);
      throw new j(K.INVALID_ARGUMENT, `Expected type '${e.name}', but it was: ${n}`);
    }
  }
  return t2;
}
var pa = class {
  constructor(t2) {
    var e;
    if (t2.host === void 0) {
      if (t2.ssl !== void 0)
        throw new j(K.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
      this.host = "firestore.googleapis.com", this.ssl = true;
    } else
      this.host = t2.host, this.ssl = (e = t2.ssl) === null || e === void 0 || e;
    if (this.credentials = t2.credentials, this.ignoreUndefinedProperties = !!t2.ignoreUndefinedProperties, t2.cacheSizeBytes === void 0)
      this.cacheSizeBytes = 41943040;
    else {
      if (t2.cacheSizeBytes !== -1 && t2.cacheSizeBytes < 1048576)
        throw new j(K.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
      this.cacheSizeBytes = t2.cacheSizeBytes;
    }
    this.experimentalForceLongPolling = !!t2.experimentalForceLongPolling, this.experimentalAutoDetectLongPolling = !!t2.experimentalAutoDetectLongPolling, this.useFetchStreams = !!t2.useFetchStreams, da("experimentalForceLongPolling", t2.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", t2.experimentalAutoDetectLongPolling);
  }
  isEqual(t2) {
    return this.host === t2.host && this.ssl === t2.ssl && this.credentials === t2.credentials && this.cacheSizeBytes === t2.cacheSizeBytes && this.experimentalForceLongPolling === t2.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === t2.experimentalAutoDetectLongPolling && this.ignoreUndefinedProperties === t2.ignoreUndefinedProperties && this.useFetchStreams === t2.useFetchStreams;
  }
};
var Ta = class {
  constructor(t2, e) {
    this._credentials = e, this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new pa({}), this._settingsFrozen = false, t2 instanceof ha ? this._databaseId = t2 : (this._app = t2, this._databaseId = function(t3) {
      if (!Object.prototype.hasOwnProperty.apply(t3.options, ["projectId"]))
        throw new j(K.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
      return new ha(t3.options.projectId);
    }(t2));
  }
  get app() {
    if (!this._app)
      throw new j(K.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
    return this._app;
  }
  get _initialized() {
    return this._settingsFrozen;
  }
  get _terminated() {
    return this._terminateTask !== void 0;
  }
  _setSettings(t2) {
    if (this._settingsFrozen)
      throw new j(K.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
    this._settings = new pa(t2), t2.credentials !== void 0 && (this._credentials = function(t3) {
      if (!t3)
        return new G();
      switch (t3.type) {
        case "gapi":
          const e = t3.client;
          return B(!(typeof e != "object" || e === null || !e.auth || !e.auth.getAuthHeaderValueForFirstParty)), new Y(e, t3.sessionIndex || "0", t3.iamToken || null);
        case "provider":
          return t3.client;
        default:
          throw new j(K.INVALID_ARGUMENT, "makeCredentialsProvider failed due to invalid credential type");
      }
    }(t2.credentials));
  }
  _getSettings() {
    return this._settings;
  }
  _freezeSettings() {
    return this._settingsFrozen = true, this._settings;
  }
  _delete() {
    return this._terminateTask || (this._terminateTask = this._terminate()), this._terminateTask;
  }
  toJSON() {
    return {
      app: this._app,
      databaseId: this._databaseId,
      settings: this._settings
    };
  }
  _terminate() {
    return function(t2) {
      const e = la.get(t2);
      e && ($("ComponentProvider", "Removing Datastore"), la.delete(t2), e.terminate());
    }(this), Promise.resolve();
  }
};
var Ia = class {
  constructor(t2, e, n) {
    this.converter = e, this._key = n, this.type = "document", this.firestore = t2;
  }
  get _path() {
    return this._key.path;
  }
  get id() {
    return this._key.path.lastSegment();
  }
  get path() {
    return this._key.path.canonicalString();
  }
  get parent() {
    return new Ra(this.firestore, this.converter, this._key.path.popLast());
  }
  withConverter(t2) {
    return new Ia(this.firestore, t2, this._key);
  }
};
var Aa = class {
  constructor(t2, e, n) {
    this.converter = e, this._query = n, this.type = "query", this.firestore = t2;
  }
  withConverter(t2) {
    return new Aa(this.firestore, t2, this._query);
  }
};
var Ra = class extends Aa {
  constructor(t2, e, n) {
    super(t2, e, we(n)), this._path = n, this.type = "collection";
  }
  get id() {
    return this._query.path.lastSegment();
  }
  get path() {
    return this._query.path.canonicalString();
  }
  get parent() {
    const t2 = this._path.popLast();
    return t2.isEmpty() ? null : new Ia(this.firestore, null, new Pt(t2));
  }
  withConverter(t2) {
    return new Ra(this.firestore, t2, this._path);
  }
};
function ba(t2, e, ...n) {
  if (t2 = getModularInstance(t2), fa("collection", "path", e), t2 instanceof Ta) {
    const s2 = ht.fromString(e, ...n);
    return _a2(s2), new Ra(t2, null, s2);
  }
  {
    if (!(t2 instanceof Ia || t2 instanceof Ra))
      throw new j(K.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const s2 = t2._path.child(ht.fromString(e, ...n));
    return _a2(s2), new Ra(t2.firestore, null, s2);
  }
}
var Da = class {
  constructor() {
    this._c = Promise.resolve(), this.mc = [], this.gc = false, this.yc = [], this.Tc = null, this.Ec = false, this.Ic = false, this.Ac = [], this.ar = new Xr(this, "async_queue_retry"), this.Rc = () => {
      const t3 = Jr();
      t3 && $("AsyncQueue", "Visibility state changed to " + t3.visibilityState), this.ar.tr();
    };
    const t2 = Jr();
    t2 && typeof t2.addEventListener == "function" && t2.addEventListener("visibilitychange", this.Rc);
  }
  get isShuttingDown() {
    return this.gc;
  }
  enqueueAndForget(t2) {
    this.enqueue(t2);
  }
  enqueueAndForgetEvenWhileRestricted(t2) {
    this.bc(), this.Pc(t2);
  }
  enterRestrictedMode(t2) {
    if (!this.gc) {
      this.gc = true, this.Ic = t2 || false;
      const e = Jr();
      e && typeof e.removeEventListener == "function" && e.removeEventListener("visibilitychange", this.Rc);
    }
  }
  enqueue(t2) {
    if (this.bc(), this.gc)
      return new Promise(() => {
      });
    const e = new Q();
    return this.Pc(() => this.gc && this.Ic ? Promise.resolve() : (t2().then(e.resolve, e.reject), e.promise)).then(() => e.promise);
  }
  enqueueRetryable(t2) {
    this.enqueueAndForget(() => (this.mc.push(t2), this.vc()));
  }
  async vc() {
    if (this.mc.length !== 0) {
      try {
        await this.mc[0](), this.mc.shift(), this.ar.reset();
      } catch (t2) {
        if (!Hs(t2))
          throw t2;
        $("AsyncQueue", "Operation failed with retryable error: " + t2);
      }
      this.mc.length > 0 && this.ar.Xi(() => this.vc());
    }
  }
  Pc(t2) {
    const e = this._c.then(() => (this.Ec = true, t2().catch((t3) => {
      this.Tc = t3, this.Ec = false;
      const e2 = function(t4) {
        let e3 = t4.message || "";
        t4.stack && (e3 = t4.stack.includes(t4.message) ? t4.stack : t4.message + "\n" + t4.stack);
        return e3;
      }(t3);
      throw O("INTERNAL UNHANDLED ERROR: ", e2), t3;
    }).then((t3) => (this.Ec = false, t3))));
    return this._c = e, e;
  }
  enqueueAfterDelay(t2, e, n) {
    this.bc(), this.Ac.indexOf(t2) > -1 && (e = 0);
    const s2 = xo.createAndSchedule(this, t2, e, n, (t3) => this.Vc(t3));
    return this.yc.push(s2), s2;
  }
  bc() {
    this.Tc && L();
  }
  verifyOperationInProgress() {
  }
  async Sc() {
    let t2;
    do {
      t2 = this._c, await t2;
    } while (t2 !== this._c);
  }
  Dc(t2) {
    for (const e of this.yc)
      if (e.timerId === t2)
        return true;
    return false;
  }
  Cc(t2) {
    return this.Sc().then(() => {
      this.yc.sort((t3, e) => t3.targetTimeMs - e.targetTimeMs);
      for (const e of this.yc)
        if (e.skipDelay(), t2 !== "all" && e.timerId === t2)
          break;
      return this.Sc();
    });
  }
  Nc(t2) {
    this.Ac.push(t2);
  }
  Vc(t2) {
    const e = this.yc.indexOf(t2);
    this.yc.splice(e, 1);
  }
};
var ka = class extends Ta {
  constructor(t2, e) {
    super(t2, e), this.type = "firestore", this._queue = new Da(), this._persistenceKey = "name" in t2 ? t2.name : "[DEFAULT]";
  }
  _terminate() {
    return this._firestoreClient || Ma(this), this._firestoreClient.terminate();
  }
};
function Oa(e = getApp()) {
  return _getProvider(e, "firestore").getImmediate();
}
function Fa(t2) {
  return t2._firestoreClient || Ma(t2), t2._firestoreClient.verifyNotTerminated(), t2._firestoreClient;
}
function Ma(t2) {
  var e;
  const n = t2._freezeSettings(), s2 = function(t3, e2, n2, s3) {
    return new ua(t3, e2, n2, s3.host, s3.ssl, s3.experimentalForceLongPolling, s3.experimentalAutoDetectLongPolling, s3.useFetchStreams);
  }(t2._databaseId, ((e = t2._app) === null || e === void 0 ? void 0 : e.options.appId) || "", t2._persistenceKey, n);
  t2._firestoreClient = new Kc(t2._credentials, t2._queue, s2);
}
var Ja = class {
  constructor(...t2) {
    for (let e = 0; e < t2.length; ++e)
      if (t2[e].length === 0)
        throw new j(K.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
    this._internalPath = new ft(t2);
  }
  isEqual(t2) {
    return this._internalPath.isEqual(t2._internalPath);
  }
};
var Xa = class {
  constructor(t2) {
    this._byteString = t2;
  }
  static fromBase64String(t2) {
    try {
      return new Xa(_t.fromBase64String(t2));
    } catch (t3) {
      throw new j(K.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + t3);
    }
  }
  static fromUint8Array(t2) {
    return new Xa(_t.fromUint8Array(t2));
  }
  toBase64() {
    return this._byteString.toBase64();
  }
  toUint8Array() {
    return this._byteString.toUint8Array();
  }
  toString() {
    return "Bytes(base64: " + this.toBase64() + ")";
  }
  isEqual(t2) {
    return this._byteString.isEqual(t2._byteString);
  }
};
var tu = class {
  constructor(t2, e) {
    if (!isFinite(t2) || t2 < -90 || t2 > 90)
      throw new j(K.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + t2);
    if (!isFinite(e) || e < -180 || e > 180)
      throw new j(K.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + e);
    this._lat = t2, this._long = e;
  }
  get latitude() {
    return this._lat;
  }
  get longitude() {
    return this._long;
  }
  isEqual(t2) {
    return this._lat === t2._lat && this._long === t2._long;
  }
  toJSON() {
    return {
      latitude: this._lat,
      longitude: this._long
    };
  }
  _compareTo(t2) {
    return et(this._lat, t2._lat) || et(this._long, t2._long);
  }
};
var Au = new RegExp("[~\\*/\\[\\]]");
function Ru(t2, e, n) {
  if (e.search(Au) >= 0)
    throw bu(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`, t2, false, void 0, n);
  try {
    return new Ja(...e.split("."))._internalPath;
  } catch (s2) {
    throw bu(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`, t2, false, void 0, n);
  }
}
function bu(t2, e, n, s2, i) {
  const r = s2 && !s2.isEmpty(), o = i !== void 0;
  let c = `Function ${e}() called with invalid data`;
  n && (c += " (via `toFirestore()`)"), c += ". ";
  let a = "";
  return (r || o) && (a += " (found", r && (a += ` in field ${s2}`), o && (a += ` in document ${i}`), a += ")"), new j(K.INVALID_ARGUMENT, c + t2 + a);
}
var vu = class {
  constructor(t2, e, n, s2, i) {
    this._firestore = t2, this._userDataWriter = e, this._key = n, this._document = s2, this._converter = i;
  }
  get id() {
    return this._key.path.lastSegment();
  }
  get ref() {
    return new Ia(this._firestore, this._converter, this._key);
  }
  exists() {
    return this._document !== null;
  }
  data() {
    if (this._document) {
      if (this._converter) {
        const t2 = new Vu(this._firestore, this._userDataWriter, this._key, this._document, null);
        return this._converter.fromFirestore(t2);
      }
      return this._userDataWriter.convertValue(this._document.data.value);
    }
  }
  get(t2) {
    if (this._document) {
      const e = this._document.data.field(Su("DocumentSnapshot.get", t2));
      if (e !== null)
        return this._userDataWriter.convertValue(e);
    }
  }
};
var Vu = class extends vu {
  data() {
    return super.data();
  }
};
function Su(t2, e) {
  return typeof e == "string" ? Ru(t2, e) : e instanceof Ja ? e._internalPath : e._delegate._internalPath;
}
var Du = class {
  constructor(t2, e) {
    this.hasPendingWrites = t2, this.fromCache = e;
  }
  isEqual(t2) {
    return this.hasPendingWrites === t2.hasPendingWrites && this.fromCache === t2.fromCache;
  }
};
var Cu = class extends vu {
  constructor(t2, e, n, s2, i, r) {
    super(t2, e, n, s2, r), this._firestore = t2, this._firestoreImpl = t2, this.metadata = i;
  }
  exists() {
    return super.exists();
  }
  data(t2 = {}) {
    if (this._document) {
      if (this._converter) {
        const e = new Nu(this._firestore, this._userDataWriter, this._key, this._document, this.metadata, null);
        return this._converter.fromFirestore(e, t2);
      }
      return this._userDataWriter.convertValue(this._document.data.value, t2.serverTimestamps);
    }
  }
  get(t2, e = {}) {
    if (this._document) {
      const n = this._document.data.field(Su("DocumentSnapshot.get", t2));
      if (n !== null)
        return this._userDataWriter.convertValue(n, e.serverTimestamps);
    }
  }
};
var Nu = class extends Cu {
  data(t2 = {}) {
    return super.data(t2);
  }
};
var xu = class {
  constructor(t2, e, n, s2) {
    this._firestore = t2, this._userDataWriter = e, this._snapshot = s2, this.metadata = new Du(s2.hasPendingWrites, s2.fromCache), this.query = n;
  }
  get docs() {
    const t2 = [];
    return this.forEach((e) => t2.push(e)), t2;
  }
  get size() {
    return this._snapshot.docs.size;
  }
  get empty() {
    return this.size === 0;
  }
  forEach(t2, e) {
    this._snapshot.docs.forEach((n) => {
      t2.call(e, new Nu(this._firestore, this._userDataWriter, n.key, n, new Du(this._snapshot.mutatedKeys.has(n.key), this._snapshot.fromCache), this.query.converter));
    });
  }
  docChanges(t2 = {}) {
    const e = !!t2.includeMetadataChanges;
    if (e && this._snapshot.excludesMetadataChanges)
      throw new j(K.INVALID_ARGUMENT, "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");
    return this._cachedChanges && this._cachedChangesIncludeMetadataChanges === e || (this._cachedChanges = function(t3, e2) {
      if (t3._snapshot.oldDocs.isEmpty()) {
        let e3 = 0;
        return t3._snapshot.docChanges.map((n) => ({
          type: "added",
          doc: new Nu(t3._firestore, t3._userDataWriter, n.doc.key, n.doc, new Du(t3._snapshot.mutatedKeys.has(n.doc.key), t3._snapshot.fromCache), t3.query.converter),
          oldIndex: -1,
          newIndex: e3++
        }));
      }
      {
        let n = t3._snapshot.oldDocs;
        return t3._snapshot.docChanges.filter((t4) => e2 || t4.type !== 3).map((e3) => {
          const s2 = new Nu(t3._firestore, t3._userDataWriter, e3.doc.key, e3.doc, new Du(t3._snapshot.mutatedKeys.has(e3.doc.key), t3._snapshot.fromCache), t3.query.converter);
          let i = -1, r = -1;
          return e3.type !== 0 && (i = n.indexOf(e3.doc.key), n = n.delete(e3.doc.key)), e3.type !== 1 && (n = n.add(e3.doc), r = n.indexOf(e3.doc.key)), {
            type: ku(e3.type),
            doc: s2,
            oldIndex: i,
            newIndex: r
          };
        });
      }
    }(this, e), this._cachedChangesIncludeMetadataChanges = e), this._cachedChanges;
  }
};
function ku(t2) {
  switch (t2) {
    case 0:
      return "added";
    case 2:
    case 3:
      return "modified";
    case 1:
      return "removed";
    default:
      return L();
  }
}
function Ou(t2) {
  if (me(t2) && t2.explicitOrderBy.length === 0)
    throw new j(K.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
}
var nh = class {
  convertValue(t2, e = "none") {
    switch (vt(t2)) {
      case 0:
        return null;
      case 1:
        return t2.booleanValue;
      case 2:
        return yt(t2.integerValue || t2.doubleValue);
      case 3:
        return this.convertTimestamp(t2.timestampValue);
      case 4:
        return this.convertServerTimestamp(t2, e);
      case 5:
        return t2.stringValue;
      case 6:
        return this.convertBytes(pt(t2.bytesValue));
      case 7:
        return this.convertReference(t2.referenceValue);
      case 8:
        return this.convertGeoPoint(t2.geoPointValue);
      case 9:
        return this.convertArray(t2.arrayValue, e);
      case 10:
        return this.convertObject(t2.mapValue, e);
      default:
        throw L();
    }
  }
  convertObject(t2, e) {
    const n = {};
    return ct(t2.fields, (t3, s2) => {
      n[t3] = this.convertValue(s2, e);
    }), n;
  }
  convertGeoPoint(t2) {
    return new tu(yt(t2.latitude), yt(t2.longitude));
  }
  convertArray(t2, e) {
    return (t2.values || []).map((t3) => this.convertValue(t3, e));
  }
  convertServerTimestamp(t2, e) {
    switch (e) {
      case "previous":
        const n = Et(t2);
        return n == null ? null : this.convertValue(n, e);
      case "estimate":
        return this.convertTimestamp(It(t2));
      default:
        return null;
    }
  }
  convertTimestamp(t2) {
    const e = gt(t2);
    return new it(e.seconds, e.nanos);
  }
  convertDocumentKey(t2, e) {
    const n = ht.fromString(t2);
    B(Ts(n));
    const s2 = new ha(n.get(1), n.get(3)), i = new Pt(n.popFirst(5));
    return s2.isEqual(e) || O(`Document ${i} contains a document reference within a different database (${s2.projectId}/${s2.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`), i;
  }
};
var ah = class extends nh {
  constructor(t2) {
    super(), this.firestore = t2;
  }
  convertBytes(t2) {
    return new Xa(t2);
  }
  convertReference(t2) {
    const e = this.convertDocumentKey(t2, this.firestore._databaseId);
    return new Ia(this.firestore, null, e);
  }
};
function lh(t2) {
  t2 = ga(t2, Aa);
  const e = ga(t2.firestore, ka), n = Fa(e), s2 = new ah(e);
  return Ou(t2._query), ia(n, t2._query).then((n2) => new xu(e, s2, t2, n2));
}
!function(t2, e = true) {
  !function(t3) {
    C = t3;
  }(SDK_VERSION), _registerComponent(new Component("firestore", (t3, { options: n }) => {
    const s2 = t3.getProvider("app").getImmediate(), i = new ka(s2, new H(t3.getProvider("auth-internal")));
    return n = Object.assign({
      useFetchStreams: e
    }, n), i._setSettings(n), i;
  }, "PUBLIC")), registerVersion(S, "3.2.1", t2), registerVersion(S, "3.2.1", "esm2017");
}();
var firebaseConfig = {
  apiKey: "AIzaSyBqTaftXlXfLlG7kJ4VFgYmP1Ec82QiQlU",
  authDomain: "lofi-dreamer.firebaseapp.com",
  databaseURL: "https://lofi-dreamer-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lofi-dreamer",
  storageBucket: "lofi-dreamer.appspot.com",
  messagingSenderId: "78257460945",
  appId: "1:78257460945:web:1c6621041fb9b786da17f0",
  measurementId: "G-8W0XQ4ZKM0"
};
initializeApp(firebaseConfig);
var firestore = Oa();
var queryForDocuments = async () => {
  let data = [];
  const querySnapshot = await lh(ba(firestore, "projects"));
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
};
var css$1 = {
  code: ".content.svelte-1gbavg9{width:100%;color:white;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;align-items:center;text-align:center}",
  map: null
};
var hydrate$1 = dev;
var router$1 = browser$1;
var prerender$1 = true;
var Projects = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `${$$result.head += `${$$result.title = `<title>Projects</title>`, ""}`, ""}

<div class="${"content svelte-1gbavg9"}">${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return `
	${validate_component(Loader, "Loader").$$render($$result, {}, {}, {})}
	`;
    }
    return function(projects2) {
      return `
		${each(projects2, (project) => `${validate_component(Project, "Project").$$render($$result, { project }, {}, {})}`)}
	`;
    }(__value);
  }(queryForDocuments())}
</div>`;
});
var projects = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Projects,
  hydrate: hydrate$1,
  router: router$1,
  prerender: prerender$1
});
var css = {
  code: ".content.svelte-1woc8oq.svelte-1woc8oq{font-family:Poppins, sans-serif;font-size:1.2rem;box-sizing:border-box;max-width:var(--column-width);text-align:initial;margin:1rem}.skills.svelte-1woc8oq.svelte-1woc8oq{text-align:initial;margin:0px}.skills.svelte-1woc8oq h2.svelte-1woc8oq{color:rgb(107, 164, 238);font-size:1.5rem;margin:0px}.skills.svelte-1woc8oq p.svelte-1woc8oq{margin:5px 0px}.about.svelte-1woc8oq.svelte-1woc8oq{display:flex;flex-direction:row;align-items:center;font-size:1.75rem}.photo.svelte-1woc8oq.svelte-1woc8oq{height:300px;width:300px;border-radius:10px;margin-right:1.5rem}.react.svelte-1woc8oq.svelte-1woc8oq{color:rgb(97, 218, 251)}.svelte.svelte-1woc8oq.svelte-1woc8oq{color:rgb(255, 62, 0)}@media(max-width: 720px){.photo.svelte-1woc8oq.svelte-1woc8oq{height:200px;width:200px;border-radius:10px;margin:0px}.content.svelte-1woc8oq.svelte-1woc8oq{text-align:center}.skills.svelte-1woc8oq.svelte-1woc8oq{margin-bottom:1rem}.about.svelte-1woc8oq.svelte-1woc8oq{flex-direction:column;align-items:center;font-size:1.2rem}.about-social.svelte-1woc8oq.svelte-1woc8oq{display:flex;flex:row;align-items:center;justify-content:center}}@media(min-width: 720px){.about-social.svelte-1woc8oq.svelte-1woc8oq{display:none}}",
  map: null
};
var hydrate = dev;
var router = browser$1;
var prerender = true;
var About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `${$$result.head += `${$$result.title = `<title>About Me</title>`, ""}`, ""}

<div class="${"content svelte-1woc8oq"}"><div class="${"about svelte-1woc8oq"}"><img src="${"./photo.jpg"}" alt="${"Me"}" class="${"photo  svelte-1woc8oq"}">
		<p>Hi, my name is Viktoria and I am a frontend web developer with two years of experience with an emphasis on <span class="${"react  svelte-1woc8oq"}">React</span> and <span class="${"svelte  svelte-1woc8oq"}">Svelte</span>. 
			I also have basic knowledge of Node.js, Vue and C#</p></div>
	<div class="${"skills  svelte-1woc8oq"}"><h2 class="${" svelte-1woc8oq"}">Skills:</h2> <p class="${" svelte-1woc8oq"}">HTML / CSS / SCSS / Javascript / Typescript / React / Material UI/ Next/ Firebase/ Svelte / Tailwind / Git</p></div>
	<div class="${"about-social svelte-1woc8oq"}">${validate_component(Social, "Social").$$render($$result, {}, {}, {})}</div>
</div>`;
});
var about = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": About,
  hydrate,
  router,
  prerender
});

// .svelte-kit/firebase/firebase-to-svelte-kit.js
init_shims();
function toSvelteKitRequest(request) {
  const host = `${request.headers["x-forwarded-proto"]}://${request.headers.host}`;
  const { pathname, searchParams: searchParameters } = new URL(request.url || "", host);
  return {
    method: request.method,
    headers: toSvelteKitHeaders(request.headers),
    rawBody: request.rawBody ? request.rawBody : null,
    host,
    path: pathname,
    query: searchParameters
  };
}
function toSvelteKitHeaders(headers) {
  const finalHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    finalHeaders[key] = Array.isArray(value) ? value.join(",") : value;
  }
  return finalHeaders;
}

// .svelte-kit/firebase/entry.js
var app = app_exports;
app.init();
async function svelteKit(request, response) {
  const rendered = await app.render(toSvelteKitRequest(request));
  return rendered ? response.writeHead(rendered.status, rendered.headers).end(rendered.body) : response.writeHead(404, "Not Found").end();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
/*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

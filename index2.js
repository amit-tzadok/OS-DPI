const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["node.browser.js","index.js","index.css","node2.browser.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload, c as commonjsGlobal } from './index.js';

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (typeof state === "function" ? receiver !== state || true : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return state.set(receiver, value), value;
}
function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f)
        throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function isAbortError(err) {
    return (typeof err === 'object' &&
        err !== null &&
        // Spec-compliant fetch implementations
        (('name' in err && err.name === 'AbortError') ||
            // Expo fetch
            ('message' in err && String(err.message).includes('FetchRequestCanceledException'))));
}
const castToError = (err) => {
    if (err instanceof Error)
        return err;
    if (typeof err === 'object' && err !== null) {
        try {
            const tag = Object.prototype.toString.call(err);
            // cross-realm errors (e.g. undici's abort `DOMException` under jest) fail `instanceof Error`
            if (tag === '[object Error]' || tag === '[object DOMException]') {
                // @ts-ignore - not all envs have native support for cause yet
                const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
                if (err.stack)
                    error.stack = err.stack;
                // @ts-ignore - not all envs have native support for cause yet
                if (err.cause && !error.cause)
                    error.cause = err.cause;
                if (err.name)
                    error.name = err.name;
                return error;
            }
        }
        catch { }
        try {
            return new Error(JSON.stringify(err));
        }
        catch { }
    }
    return new Error(err);
};

var AnthropicError = /* @__PURE__ */ (() => {
    class AnthropicError extends Error {
    }
    return AnthropicError;
})();
class APIError extends AnthropicError {
    constructor(status, error, message, headers, type) {
        super(`${APIError.makeMessage(status, error, message)}`);
        this.status = status;
        this.headers = headers;
        this.requestID = headers?.get('request-id');
        this.workspaceID = headers?.get('anthropic-workspace-id');
        this.error = error;
        this.type = type ?? null;
    }
    static makeMessage(status, error, message) {
        const msg = error?.message ?
            typeof error.message === 'string' ?
                error.message
                : JSON.stringify(error.message)
            : error ? JSON.stringify(error)
                : message;
        if (status && msg) {
            return `${status} ${msg}`;
        }
        if (status) {
            return `${status} status code (no body)`;
        }
        if (msg) {
            return msg;
        }
        return '(no status code or body)';
    }
    static generate(status, errorResponse, message, headers) {
        if (!status || !headers) {
            return new APIConnectionError({ message, cause: castToError(errorResponse) });
        }
        const error = errorResponse;
        const type = error?.['error']?.['type'];
        if (status === 400) {
            return new BadRequestError(status, error, message, headers, type);
        }
        if (status === 401) {
            return new AuthenticationError(status, error, message, headers, type);
        }
        if (status === 403) {
            return new PermissionDeniedError(status, error, message, headers, type);
        }
        if (status === 404) {
            return new NotFoundError(status, error, message, headers, type);
        }
        if (status === 409) {
            return new ConflictError(status, error, message, headers, type);
        }
        if (status === 422) {
            return new UnprocessableEntityError(status, error, message, headers, type);
        }
        if (status === 429) {
            return new RateLimitError(status, error, message, headers, type);
        }
        if (status >= 500) {
            return new InternalServerError(status, error, message, headers, type);
        }
        return new APIError(status, error, message, headers, type);
    }
}
class APIUserAbortError extends APIError {
    constructor({ message } = {}) {
        super(undefined, undefined, message || 'Request was aborted.', undefined);
    }
}
class APIConnectionError extends APIError {
    constructor({ message, cause }) {
        super(undefined, undefined, message || 'Connection error.', undefined);
        // in some environments the 'cause' property is already declared
        // @ts-ignore
        if (cause)
            this.cause = cause;
    }
}
class APIConnectionTimeoutError extends APIConnectionError {
    constructor({ message } = {}) {
        super({ message: message ?? 'Request timed out.' });
    }
}
/**
 * An error that opts into the SDK's retry policy: throw it (e.g. from
 * middleware) to have the attempt retried.
 *
 * Note that the request will only be retried when `maxRetries` has not been exhausted.
 */
class RetryableError extends AnthropicError {
    constructor(message, { cause } = {}) {
        super(message ?? 'Retryable error.');
        // in some environments the 'cause' property is already declared
        // @ts-ignore
        if (cause !== undefined)
            this.cause = cause;
    }
}
class BadRequestError extends APIError {
}
class AuthenticationError extends APIError {
}
class PermissionDeniedError extends APIError {
}
class NotFoundError extends APIError {
}
class ConflictError extends APIError {
}
class UnprocessableEntityError extends APIError {
}
class RateLimitError extends APIError {
}
class InternalServerError extends APIError {
}

// https://url.spec.whatwg.org/#url-scheme-string
const startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
const isAbsoluteURL = (url) => {
    return startsWithSchemeRegexp.test(url);
};
let isArray = (val) => ((isArray = Array.isArray), isArray(val));
let isReadonlyArray = isArray;
/** Returns an object if the given value isn't an object, otherwise returns as-is */
function maybeObj(x) {
    if (typeof x !== 'object') {
        return {};
    }
    return x ?? {};
}
// https://stackoverflow.com/a/34491287
function isEmptyObj(obj) {
    if (!obj)
        return true;
    for (const _k in obj)
        return false;
    return true;
}
// https://eslint.org/docs/latest/rules/no-prototype-builtins
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
function isObj(obj) {
    return obj != null && typeof obj === 'object' && !Array.isArray(obj);
}
const validatePositiveInteger = (name, n) => {
    if (typeof n !== 'number' || !Number.isInteger(n)) {
        throw new AnthropicError(`${name} must be an integer`);
    }
    if (n < 0) {
        throw new AnthropicError(`${name} must be a positive integer`);
    }
    return n;
};
const safeJSON = (text) => {
    try {
        return JSON.parse(text);
    }
    catch (err) {
        return undefined;
    }
};
/**
 * Compile-time exhaustiveness check: passing a value here only type-checks once every
 * member of its union has been handled. Does nothing at runtime, so unknown values from a
 * newer API version fall through instead of throwing.
 */
function checkNever(_value) { }

/**
 * Resolve after `ms`, or immediately when `signal` aborts.
 *
 * When a `signal` is passed the abort listener is always removed so repeated
 * calls do not accumulate listeners on a long-lived signal. Resolves (rather
 * than rejects) on abort — callers treat abort as "wake up early," not as a
 * failure; callers that want to unwind should check the signal themselves.
 */
const sleep = (ms, signal) => new Promise((resolve) => {
    if (signal?.aborted)
        return resolve();
    const onAbort = () => {
        clearTimeout(timer);
        resolve();
    };
    const timer = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
    }, ms);
    // `{ once: true }` auto-removes the listener if abort fires first,
    // so we only need an explicit remove on the timer-wins path above.
    signal?.addEventListener('abort', onAbort, { once: true });
});

const VERSION = '0.133.0'; // x-release-please-version

const isRunningInBrowser = () => {
    return (
    // @ts-ignore
    typeof window !== 'undefined' &&
        // @ts-ignore
        typeof window.document !== 'undefined' &&
        // @ts-ignore
        typeof navigator !== 'undefined');
};
/**
 * Note this does not detect 'browser'; for that, use getBrowserInfo().
 */
function getDetectedPlatform() {
    if (typeof Deno !== 'undefined' && Deno.build != null) {
        return 'deno';
    }
    if (typeof EdgeRuntime !== 'undefined') {
        return 'edge';
    }
    if (Object.prototype.toString.call(typeof globalThis.process !== 'undefined' ? globalThis.process : 0) === '[object process]') {
        return 'node';
    }
    return 'unknown';
}
const getPlatformProperties = () => {
    const detectedPlatform = getDetectedPlatform();
    if (detectedPlatform === 'deno') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': VERSION,
            'X-Stainless-OS': normalizePlatform(Deno.build.os),
            'X-Stainless-Arch': normalizeArch(Deno.build.arch),
            'X-Stainless-Runtime': 'deno',
            'X-Stainless-Runtime-Version': typeof Deno.version === 'string' ? Deno.version : Deno.version?.deno ?? 'unknown',
        };
    }
    if (typeof EdgeRuntime !== 'undefined') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': VERSION,
            'X-Stainless-OS': 'Unknown',
            'X-Stainless-Arch': `other:${EdgeRuntime}`,
            'X-Stainless-Runtime': 'edge',
            'X-Stainless-Runtime-Version': globalThis.process?.version ?? 'unknown',
        };
    }
    // Check if Node.js
    if (detectedPlatform === 'node') {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': VERSION,
            'X-Stainless-OS': normalizePlatform(globalThis.process.platform ?? 'unknown'),
            'X-Stainless-Arch': normalizeArch(globalThis.process.arch ?? 'unknown'),
            'X-Stainless-Runtime': 'node',
            'X-Stainless-Runtime-Version': globalThis.process.version ?? 'unknown',
        };
    }
    const browserInfo = getBrowserInfo();
    if (browserInfo) {
        return {
            'X-Stainless-Lang': 'js',
            'X-Stainless-Package-Version': VERSION,
            'X-Stainless-OS': 'Unknown',
            'X-Stainless-Arch': 'unknown',
            'X-Stainless-Runtime': `browser:${browserInfo.browser}`,
            'X-Stainless-Runtime-Version': browserInfo.version,
        };
    }
    // TODO add support for Cloudflare workers, etc.
    return {
        'X-Stainless-Lang': 'js',
        'X-Stainless-Package-Version': VERSION,
        'X-Stainless-OS': 'Unknown',
        'X-Stainless-Arch': 'unknown',
        'X-Stainless-Runtime': 'unknown',
        'X-Stainless-Runtime-Version': 'unknown',
    };
};
// Note: modified from https://github.com/JS-DevTools/host-environment/blob/b1ab79ecde37db5d6e163c050e54fe7d287d7c92/src/isomorphic.browser.ts
function getBrowserInfo() {
    if (typeof navigator === 'undefined' || !navigator) {
        return null;
    }
    // NOTE: The order matters here!
    const browserPatterns = [
        { key: 'edge', pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'ie', pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'ie', pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'chrome', pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'firefox', pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
        { key: 'safari', pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ },
    ];
    // Find the FIRST matching browser
    for (const { key, pattern } of browserPatterns) {
        const match = pattern.exec(navigator.userAgent);
        if (match) {
            const major = match[1] || 0;
            const minor = match[2] || 0;
            const patch = match[3] || 0;
            return { browser: key, version: `${major}.${minor}.${patch}` };
        }
    }
    return null;
}
const normalizeArch = (arch) => {
    // Node docs:
    // - https://nodejs.org/api/process.html#processarch
    // Deno docs:
    // - https://doc.deno.land/deno/stable/~/Deno.build
    if (arch === 'x32')
        return 'x32';
    if (arch === 'x86_64' || arch === 'x64')
        return 'x64';
    if (arch === 'arm')
        return 'arm';
    if (arch === 'aarch64' || arch === 'arm64')
        return 'arm64';
    if (arch)
        return `other:${arch}`;
    return 'unknown';
};
const normalizePlatform = (platform) => {
    // Node platforms:
    // - https://nodejs.org/api/process.html#processplatform
    // Deno platforms:
    // - https://doc.deno.land/deno/stable/~/Deno.build
    // - https://github.com/denoland/deno/issues/14799
    platform = platform.toLowerCase();
    // NOTE: this iOS check is untested and may not work
    // Node does not work natively on IOS, there is a fork at
    // https://github.com/nodejs-mobile/nodejs-mobile
    // however it is unknown at the time of writing how to detect if it is running
    if (platform.includes('ios'))
        return 'iOS';
    if (platform === 'android')
        return 'Android';
    if (platform === 'darwin')
        return 'MacOS';
    if (platform === 'win32')
        return 'Windows';
    if (platform === 'freebsd')
        return 'FreeBSD';
    if (platform === 'openbsd')
        return 'OpenBSD';
    if (platform === 'linux')
        return 'Linux';
    if (platform)
        return `Other:${platform}`;
    return 'Unknown';
};
let _platformHeaders;
const getPlatformHeaders = () => {
    return (_platformHeaders ?? (_platformHeaders = getPlatformProperties()));
};

/**
 * Tracks the removal of the per-request abort listener that
 * `fetchWithTimeout` attaches to a caller-provided signal, so the listener's
 * lifetime matches the request instead of the signal.
 *
 * Without removal, a long-lived signal (e.g. one AbortController reused for
 * a whole session) accumulates one `{ once: true }` listener plus its bound
 * AbortController per HTTP attempt until the signal fires or is collected,
 * and Node warns at the 11th listener. The listener must survive until the
 * response body is settled - removing it when fetch resolves (headers) would
 * break aborting an in-flight body read - so the code that finishes the body
 * (response parsing, stream teardown, retry/error handling) calls
 * `releaseRequestSignal` with the request's controller.
 */
const cleanups = new WeakMap();
const registry = typeof globalThis.FinalizationRegistry === 'function' ?
    new globalThis.FinalizationRegistry((controller) => releaseRequestSignal(controller))
    : null;
// Module-scope factory so the cleanup closure captures exactly the signal and
// the listener - built at the `fetchWithTimeout` call site it would share that
// scope's context and retain the request body for as long as the cleanup is
// held (same reason `_makeAbort` exists in client.ts).
function makeCleanup(signal, listener) {
    return () => signal.removeEventListener('abort', listener);
}
function registerRequestSignalCleanup(controller, signal, listener) {
    cleanups.set(controller, makeCleanup(signal, listener));
}
// The registered target is the response BODY, not the Response: a caller can
// keep a reader on the body and drop the Response wrapper (`.asResponse()`),
// and the listener must survive for as long as anything can still read - the
// body is what a live read keeps alive.
function armAbandonmentBackstop(body, controller) {
    if (cleanups.has(controller))
        registry?.register(body, controller, controller);
}
function releaseRequestSignal(controller) {
    const cleanup = cleanups.get(controller);
    if (cleanup) {
        cleanups.delete(controller);
        registry?.unregister(controller);
        cleanup();
    }
}

function getDefaultFetch() {
    if (typeof fetch !== 'undefined') {
        return fetch;
    }
    throw new Error('`fetch` is not defined as a global; Either pass `fetch` to the client, `new Anthropic({ fetch })` or polyfill the global, `globalThis.fetch = fetch`');
}
function makeReadableStream(...args) {
    const ReadableStream = globalThis.ReadableStream;
    if (typeof ReadableStream === 'undefined') {
        // Note: All of the platforms / runtimes we officially support already define
        // `ReadableStream` as a global, so this should only ever be hit on unsupported runtimes.
        throw new Error('`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`');
    }
    return new ReadableStream(...args);
}
function ReadableStreamFrom(iterable) {
    let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
    return makeReadableStream({
        start() { },
        async pull(controller) {
            const { done, value } = await iter.next();
            if (done) {
                controller.close();
            }
            else {
                controller.enqueue(value);
            }
        },
        async cancel() {
            await iter.return?.();
        },
    });
}
/**
 * Most browsers don't yet have async iterable support for ReadableStream,
 * and Node has a very different way of reading bytes from its "ReadableStream".
 *
 * This polyfill was pulled from https://github.com/MattiasBuelens/web-streams-polyfill/pull/122#issuecomment-1627354490
 */
function ReadableStreamToAsyncIterable(stream) {
    if (stream[Symbol.asyncIterator])
        return stream;
    const reader = stream.getReader();
    return {
        async next() {
            try {
                const result = await reader.read();
                if (result?.done)
                    reader.releaseLock(); // release lock when stream becomes closed
                return result;
            }
            catch (e) {
                reader.releaseLock(); // release lock when stream becomes errored
                throw e;
            }
        },
        async return() {
            const cancelPromise = reader.cancel();
            reader.releaseLock();
            await cancelPromise;
            return { done: true, value: undefined };
        },
        [Symbol.asyncIterator]() {
            return this;
        },
    };
}
/**
 * Cancels a ReadableStream we don't need to consume.
 * See https://undici.nodejs.org/#/?id=garbage-collection
 */
async function CancelReadableStream(stream) {
    if (stream === null || typeof stream !== 'object')
        return;
    if (stream[Symbol.asyncIterator]) {
        await stream[Symbol.asyncIterator]().return?.();
        return;
    }
    const reader = stream.getReader();
    const cancelPromise = reader.cancel();
    reader.releaseLock();
    await cancelPromise;
}

/**
 * Tracks which fallback a sequence of requests is pinned to.
 *
 * Create one (`new BetaFallbackState()`) and pass it via the `fallbackState`
 * request option on every request that should share the pin — the turns of one
 * conversation, or any wider scope the stickiness should apply to;
 * `betaRefusalFallbackMiddleware` mutates it in place when a model refuses.
 */
const FallbackEncoder = ({ headers, body }) => {
    return {
        bodyHeaders: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    };
};

const default_format = 'RFC3986';
const default_formatter = (v) => String(v);
const formatters = {
    RFC1738: (v) => String(v).replace(/%20/g, '+'),
    RFC3986: default_formatter,
};
const RFC1738 = 'RFC1738';

let has = (obj, key) => ((has = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty)),
    has(obj, key));
const hex_table = /* @__PURE__ */ (() => {
    const array = [];
    for (let i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }
    return array;
})();
const limit = 1024;
const encode$1 = (str, _defaultEncoder, charset, _kind, format) => {
    // This code was originally written by Brian White for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }
    let string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    }
    else if (typeof str !== 'string') {
        string = String(str);
    }
    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }
    let out = '';
    for (let j = 0; j < string.length; j += limit) {
        const segment = string.length >= limit ? string.slice(j, j + limit) : string;
        const arr = [];
        for (let i = 0; i < segment.length; ++i) {
            let c = segment.charCodeAt(i);
            if (c === 0x2d || // -
                c === 0x2e || // .
                c === 0x5f || // _
                c === 0x7e || // ~
                (c >= 0x30 && c <= 0x39) || // 0-9
                (c >= 0x41 && c <= 0x5a) || // a-z
                (c >= 0x61 && c <= 0x7a) || // A-Z
                (format === RFC1738 && (c === 0x28 || c === 0x29)) // ( )
            ) {
                arr[arr.length] = segment.charAt(i);
                continue;
            }
            if (c < 0x80) {
                arr[arr.length] = hex_table[c];
                continue;
            }
            if (c < 0x800) {
                arr[arr.length] = hex_table[0xc0 | (c >> 6)] + hex_table[0x80 | (c & 0x3f)];
                continue;
            }
            if (c < 0xd800 || c >= 0xe000) {
                arr[arr.length] =
                    hex_table[0xe0 | (c >> 12)] + hex_table[0x80 | ((c >> 6) & 0x3f)] + hex_table[0x80 | (c & 0x3f)];
                continue;
            }
            i += 1;
            c = 0x10000 + (((c & 0x3ff) << 10) | (segment.charCodeAt(i) & 0x3ff));
            arr[arr.length] =
                hex_table[0xf0 | (c >> 18)] +
                    hex_table[0x80 | ((c >> 12) & 0x3f)] +
                    hex_table[0x80 | ((c >> 6) & 0x3f)] +
                    hex_table[0x80 | (c & 0x3f)];
        }
        out += arr.join('');
    }
    return out;
};
function is_buffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
function maybe_map(val, fn) {
    if (isArray(val)) {
        const mapped = [];
        for (let i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
}

const array_prefix_generators = {
    brackets(prefix) {
        return String(prefix) + '[]';
    },
    comma: 'comma',
    indices(prefix, key) {
        return String(prefix) + '[' + key + ']';
    },
    repeat(prefix) {
        return String(prefix);
    },
};
const push_to_array = function (arr, value_or_array) {
    Array.prototype.push.apply(arr, isArray(value_or_array) ? value_or_array : [value_or_array]);
};
let toISOString;
const defaults = {
    addQueryPrefix: false,
    allowDots: false,
    allowEmptyArrays: false,
    arrayFormat: 'indices',
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encodeDotInKeys: false,
    encoder: encode$1,
    encodeValuesOnly: false,
    format: default_format,
    formatter: default_formatter,
    /** @deprecated */
    indices: false,
    serializeDate(date) {
        return (toISOString ?? (toISOString = Function.prototype.call.bind(Date.prototype.toISOString)))(date);
    },
    skipNulls: false,
    strictNullHandling: false,
};
function is_non_nullish_primitive(v) {
    return (typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean' ||
        typeof v === 'symbol' ||
        typeof v === 'bigint');
}
const sentinel = {};
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
    let obj = object;
    let tmp_sc = sideChannel;
    let step = 0;
    let find_flag = false;
    while ((tmp_sc = tmp_sc.get(sentinel)) !== void undefined && !find_flag) {
        // Where object last appeared in the ref tree
        const pos = tmp_sc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
            }
            else {
                find_flag = true; // Break while
            }
        }
        if (typeof tmp_sc.get(sentinel) === 'undefined') {
            step = 0;
        }
    }
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    }
    else if (obj instanceof Date) {
        obj = serializeDate?.(obj);
    }
    else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = maybe_map(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate?.(value);
            }
            return value;
        });
    }
    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ?
                // @ts-expect-error
                encoder(prefix, defaults.encoder, charset, 'key', format)
                : prefix;
        }
        obj = '';
    }
    if (is_non_nullish_primitive(obj) || is_buffer(obj)) {
        if (encoder) {
            const key_value = encodeValuesOnly ? prefix
                // @ts-expect-error
                : encoder(prefix, defaults.encoder, charset, 'key', format);
            return [
                formatter?.(key_value) +
                    '=' +
                    // @ts-expect-error
                    formatter?.(encoder(obj, defaults.encoder, charset, 'value', format)),
            ];
        }
        return [formatter?.(prefix) + '=' + formatter?.(String(obj))];
    }
    const values = [];
    if (typeof obj === 'undefined') {
        return values;
    }
    let obj_keys;
    if (generateArrayPrefix === 'comma' && isArray(obj)) {
        // we need to join elements in
        if (encodeValuesOnly && encoder) {
            // @ts-expect-error values only
            obj = maybe_map(obj, encoder);
        }
        obj_keys = [{ value: obj.length > 0 ? obj.join(',') || null : void undefined }];
    }
    else if (isArray(filter)) {
        obj_keys = filter;
    }
    else {
        const keys = Object.keys(obj);
        obj_keys = sort ? keys.sort(sort) : keys;
    }
    const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, '%2E') : String(prefix);
    const adjusted_prefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encoded_prefix + '[]' : encoded_prefix;
    if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
        return adjusted_prefix + '[]';
    }
    for (let j = 0; j < obj_keys.length; ++j) {
        const key = obj_keys[j];
        const value = 
        // @ts-ignore
        typeof key === 'object' && typeof key.value !== 'undefined' ? key.value : obj[key];
        if (skipNulls && value === null) {
            continue;
        }
        // @ts-ignore
        const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, '%2E') : key;
        const key_prefix = isArray(obj) ?
            typeof generateArrayPrefix === 'function' ?
                generateArrayPrefix(adjusted_prefix, encoded_key)
                : adjusted_prefix
            : adjusted_prefix + (allowDots ? '.' + encoded_key : '[' + encoded_key + ']');
        sideChannel.set(object, step);
        const valueSideChannel = new WeakMap();
        valueSideChannel.set(sentinel, sideChannel);
        push_to_array(values, inner_stringify(value, key_prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, 
        // @ts-ignore
        generateArrayPrefix === 'comma' && encodeValuesOnly && isArray(obj) ? null : encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
    }
    return values;
}
function normalize_stringify_options(opts = defaults) {
    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }
    if (typeof opts.encodeDotInKeys !== 'undefined' && typeof opts.encodeDotInKeys !== 'boolean') {
        throw new TypeError('`encodeDotInKeys` option can only be `true` or `false`, when provided');
    }
    if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }
    const charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    let format = default_format;
    if (typeof opts.format !== 'undefined') {
        if (!has(formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    const formatter = formatters[format];
    let filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }
    let arrayFormat;
    if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
        arrayFormat = opts.arrayFormat;
    }
    else if ('indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    }
    else {
        arrayFormat = defaults.arrayFormat;
    }
    if ('commaRoundTrip' in opts && typeof opts.commaRoundTrip !== 'boolean') {
        throw new TypeError('`commaRoundTrip` must be a boolean, or absent');
    }
    const allowDots = typeof opts.allowDots === 'undefined' ?
        !!opts.encodeDotInKeys === true ?
            true
            : defaults.allowDots
        : !!opts.allowDots;
    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        // @ts-ignore
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        arrayFormat: arrayFormat,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        commaRoundTrip: !!opts.commaRoundTrip,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encodeDotInKeys: typeof opts.encodeDotInKeys === 'boolean' ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        // @ts-ignore
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling,
    };
}
function stringify(object, opts = {}) {
    let obj = object;
    const options = normalize_stringify_options(opts);
    let obj_keys;
    let filter;
    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    }
    else if (isArray(options.filter)) {
        filter = options.filter;
        obj_keys = filter;
    }
    const keys = [];
    if (typeof obj !== 'object' || obj === null) {
        return '';
    }
    const generateArrayPrefix = array_prefix_generators[options.arrayFormat];
    const commaRoundTrip = generateArrayPrefix === 'comma' && options.commaRoundTrip;
    if (!obj_keys) {
        obj_keys = Object.keys(obj);
    }
    if (options.sort) {
        obj_keys.sort(options.sort);
    }
    const sideChannel = new WeakMap();
    for (let i = 0; i < obj_keys.length; ++i) {
        const key = obj_keys[i];
        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        push_to_array(keys, inner_stringify(obj[key], key, 
        // @ts-expect-error
        generateArrayPrefix, commaRoundTrip, options.allowEmptyArrays, options.strictNullHandling, options.skipNulls, options.encodeDotInKeys, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.format, options.formatter, options.encodeValuesOnly, options.charset, sideChannel));
    }
    const joined = keys.join(options.delimiter);
    let prefix = options.addQueryPrefix === true ? '?' : '';
    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        }
        else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }
    return joined.length > 0 ? prefix + joined : '';
}

function stringifyQuery(query) {
    return stringify(query, { arrayFormat: 'brackets' });
}

const GRANT_TYPE_JWT_BEARER = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const GRANT_TYPE_REFRESH_TOKEN = 'refresh_token';
const TOKEN_ENDPOINT = '/v1/oauth/token';
/**
 * `anthropic-beta` value required on authenticated API requests using an
 * OAuth bearer token, and on `refresh_token` grants against the token endpoint.
 */
const OAUTH_API_BETA_HEADER = 'oauth-2025-04-20';
/**
 * `anthropic-beta` value required on jwt-bearer exchanges against the token
 * endpoint. It routes the request to the federation service; it must NOT be
 * sent on `refresh_token` grants, which are handled by a different backend.
 */
const FEDERATION_BETA_HEADER = 'oidc-federation-2026-04-01';
const ADVISORY_REFRESH_THRESHOLD_IN_SECONDS = 120;
const MANDATORY_REFRESH_THRESHOLD_IN_SECONDS = 30;
const ADVISORY_REFRESH_BACKOFF_IN_SECONDS = 5;
const MAX_TOKEN_RESPONSE_BYTES = 1 << 20;
/**
 * Rejects base URLs that would cause a JWT assertion or refresh token to be
 * sent over cleartext HTTP. Loopback hosts are allowed for local development.
 */
function requireSecureTokenEndpoint(baseURL) {
    if (!baseURL)
        return;
    let u;
    try {
        u = new URL(baseURL);
    }
    catch (err) {
        throw new WorkloadIdentityError(`Invalid token endpoint base URL "${baseURL}": ${err}`);
    }
    if (u.protocol === 'https:')
        return;
    // WHATWG URL.hostname returns bracketed IPv6 ("[::1]"); Go's net/url strips them.
    const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (u.protocol === 'http:' && (host === 'localhost' || host === '127.0.0.1' || host === '::1')) {
        return;
    }
    throw new WorkloadIdentityError(`Refusing to send credential over non-https token endpoint "${baseURL}"`);
}
/**
 * Reads the response body as text, parses it as a token-endpoint JSON
 * response, validates `access_token` is present, and rejects a non-Bearer
 * `token_type` when one is provided. Reads at most
 * {@link MAX_TOKEN_RESPONSE_BYTES} from the body stream.
 */
async function parseTokenResponse(resp, requestId) {
    const text = await readLimitedText(resp);
    let data;
    try {
        data = JSON.parse(text);
    }
    catch {
        throw new WorkloadIdentityError(`Token endpoint returned non-JSON response (status ${resp.status})`, resp.status, redactSensitive(text), requestId);
    }
    if (!data.access_token) {
        throw new WorkloadIdentityError(`Token endpoint response missing access_token: ${JSON.stringify(redactSensitive(data))}`, resp.status, redactSensitive(data), requestId);
    }
    if (data.token_type && data.token_type.toLowerCase() !== 'bearer') {
        throw new WorkloadIdentityError(`Token endpoint response: unsupported token_type "${data.token_type}" (want Bearer)`, resp.status, redactSensitive(data), requestId);
    }
    return data;
}
const MAX_ERROR_BODY_CHARS = 2000;
// RFC 6749 §5.2 standard error-response fields. Anything else in a token
// endpoint error body is potentially echoed input (assertion, refresh_token,
// access_token, …) and is dropped rather than allowlisted-with-exceptions.
const SAFE_ERROR_KEYS = new Set(['error', 'error_description', 'error_uri']);
/**
 * Returns a redacted copy of a token-endpoint error body for safe inclusion
 * in an exception. Strings are truncated; objects keep only the RFC 6749
 * §5.2 error fields.
 */
function redactSensitive(body) {
    if (body == null)
        return body;
    if (typeof body === 'string') {
        let parsed;
        try {
            parsed = JSON.parse(body);
        }
        catch {
            if (body.length <= MAX_ERROR_BODY_CHARS)
                return body;
            return body.slice(0, MAX_ERROR_BODY_CHARS) + `... <${body.length - MAX_ERROR_BODY_CHARS} more chars>`;
        }
        return JSON.stringify(redactSensitive(parsed));
    }
    if (typeof body === 'object' && !Array.isArray(body)) {
        const out = {};
        for (const [k, v] of Object.entries(body)) {
            if (SAFE_ERROR_KEYS.has(k))
                out[k] = v;
        }
        return out;
    }
    return null;
}
/**
 * Best-effort safety check on a credentials file before reading it.
 *
 * On POSIX: resolves symlinks (so containerized deployments that mount the
 * credential as a symlink to a tmpfs-backed file keep working), then rejects
 * the resolved target if it is group- or world- readable or writable. A uid
 * mismatch on the resolved target is surfaced via `onWarn` since
 * root-written/app-read is common in init-container setups. No-op on Windows.
 */
async function checkCredentialsFileSafety(path, onWarn = (m) => console.warn(`anthropic-sdk: ${m}`)) {
    if (typeof process === 'undefined' || process.platform === 'win32')
        return;
    const { fs } = await __vitePreload(async () => { const { fs } = await import('./node.browser.js');return { fs }},true?__vite__mapDeps([0,1,2]):void 0);
    let resolved = path;
    let st;
    try {
        resolved = await fs.promises.realpath(path);
        st = await fs.promises.stat(resolved);
    }
    catch {
        return; // ENOENT etc — let the subsequent read surface a precise error
    }
    const mode = st.mode & 0o777;
    // 0o022 = group/world write; 0o044 = group/world read.
    if (mode & 0o022) {
        throw new WorkloadIdentityError(`Credentials file at ${resolved} is group/world-writable (mode 0o${mode.toString(8)}); ` +
            `this allows other local users to plant tokens. Run \`chmod 600 ${resolved}\`.`);
    }
    if (mode & 0o044) {
        throw new WorkloadIdentityError(`Credentials file at ${resolved} is group/world-readable (mode 0o${mode.toString(8)}); ` +
            `run \`chmod 600 ${resolved}\` before retrying.`);
    }
    if (typeof process.getuid === 'function' && st.uid !== process.getuid()) {
        onWarn(`credentials file at ${resolved} is owned by uid ${st.uid} (current process uid ${process.getuid()}); ` + `verify this is intentional.`);
    }
}
/**
 * Atomically writes JSON to `targetPath` via a `.tmp` sibling + rename,
 * with fsync on the file and (best-effort) on the parent directory.
 * Creates the parent directory with mode 0700 and the file with mode 0600.
 */
async function writeCredentialsFileAtomic(targetPath, data) {
    const { fs, path } = await __vitePreload(async () => { const { fs, path } = await import('./node.browser.js');return { fs, path }},true?__vite__mapDeps([0,1,2]):void 0);
    const dir = path.dirname(targetPath);
    await fs.promises.mkdir(dir, { recursive: true, mode: 0o700 });
    // Unique temp name avoids two concurrent writers (different processes or
    // SDK instances) racing on the same '.tmp' sibling and corrupting each
    // other's bytes mid-write before the rename.
    const tmpPath = `${targetPath}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
    try {
        const fh = await fs.promises.open(tmpPath, 'w', 0o600);
        try {
            await fh.writeFile(JSON.stringify(data, null, 2));
            await fh.sync();
        }
        finally {
            await fh.close();
        }
        await fs.promises.rename(tmpPath, targetPath);
    }
    catch (err) {
        // Don't leak the temp file if anything between create and rename failed.
        await fs.promises.unlink(tmpPath).catch(() => { });
        throw err;
    }
    // fsync the parent directory so the rename survives a crash.
    try {
        const dirFh = await fs.promises.open(dir, 'r');
        try {
            await dirFh.sync();
        }
        finally {
            await dirFh.close();
        }
    }
    catch {
        // Directory fsync is best-effort (unsupported on some platforms, e.g. Windows).
    }
}
async function readLimitedText(resp) {
    if (!resp.body) {
        return '';
    }
    const reader = resp.body.getReader();
    const chunks = [];
    let received = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done)
            break;
        if (received + value.length > MAX_TOKEN_RESPONSE_BYTES) {
            const remaining = MAX_TOKEN_RESPONSE_BYTES - received;
            if (remaining > 0)
                chunks.push(value.subarray(0, remaining));
            await reader.cancel();
            break;
        }
        chunks.push(value);
        received += value.length;
    }
    let merged;
    if (chunks.length === 1) {
        merged = chunks[0];
    }
    else {
        merged = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
        let offset = 0;
        for (const c of chunks) {
            merged.set(c, offset);
            offset += c.length;
        }
    }
    return new TextDecoder('utf-8').decode(merged);
}
class WorkloadIdentityError extends AnthropicError {
    constructor(message, statusCode = null, body = null, requestId = null) {
        super(message);
        this.statusCode = statusCode;
        this.body = body;
        this.requestId = requestId;
    }
}

/** Current time as unix epoch seconds. */
function nowAsSeconds() {
    return Math.floor(Date.now() / 1000);
}

/**
 * Wraps an {@link AccessTokenProvider} with two-tier proactive refresh
 * and concurrent deduplication.
 *
 * Refresh policy on each {@link getToken} call:
 *
 * - No cached token → call provider (blocking), cache, return.
 * - Cached with `expiresAt == null` → return cached forever.
 * - More than 120s remaining → return cached.
 * - 30–120s remaining (advisory window) → return stale token immediately,
 *   kick off background refresh. On failure, log and keep stale.
 * - Less than 30s remaining or expired (mandatory) → block and refresh.
 *   On failure, throw.
 *
 * Concurrent mandatory callers coalesce into a single provider call.
 */
class TokenCache {
    constructor(provider, onAdvisoryRefreshError) {
        this.cached = null;
        this.pendingRefresh = null;
        this.nextForce = false;
        this.lastAdvisoryError = 0;
        this.provider = provider;
        this.onAdvisoryRefreshError = onAdvisoryRefreshError;
    }
    async getToken() {
        const force = this.nextForce;
        this.nextForce = false;
        const cached = this.cached;
        if (force || cached == null) {
            const token = await this.refresh(force);
            return token.token;
        }
        if (cached.expiresAt == null) {
            return cached.token;
        }
        const remaining = cached.expiresAt - nowAsSeconds();
        if (remaining > ADVISORY_REFRESH_THRESHOLD_IN_SECONDS) {
            return cached.token;
        }
        if (remaining > MANDATORY_REFRESH_THRESHOLD_IN_SECONDS) {
            this.backgroundRefresh();
            return cached.token;
        }
        const token = await this.refresh();
        return token.token;
    }
    /**
     * Clears the cached token and marks the next {@link getToken} as a forced
     * refresh, so the underlying provider bypasses any on-disk freshness check.
     * Called after a 401 — the server has just told us the token is bad even
     * if its `expires_at` still looks fresh.
     */
    invalidate() {
        this.cached = null;
        this.nextForce = true;
    }
    /**
     * Mandatory refresh. Joins any in-flight refresh unless forced — a forced
     * refresh must not coalesce into a non-forced one that may re-serve the
     * same stale disk token.
     */
    refresh(force = false) {
        if (this.pendingRefresh && !force) {
            return this.pendingRefresh;
        }
        return this.doRefresh(force);
    }
    /**
     * Advisory background refresh. Shares the same in-flight promise as
     * mandatory refreshes for deduplication, but swallows errors so the
     * stale cached token keeps being served. Backs off for
     * {@link ADVISORY_REFRESH_BACKOFF_IN_SECONDS} after a failure so an
     * outage during the advisory window doesn't hammer the token endpoint.
     */
    backgroundRefresh() {
        if (this.pendingRefresh) {
            return;
        }
        if (nowAsSeconds() - this.lastAdvisoryError < ADVISORY_REFRESH_BACKOFF_IN_SECONDS) {
            return;
        }
        this.doRefresh().catch((err) => {
            this.lastAdvisoryError = nowAsSeconds();
            // Advisory failure: keep serving the stale cached token, but surface
            // the error to the caller-provided hook so it can be logged.
            this.onAdvisoryRefreshError?.(err);
        });
    }
    /**
     * Core refresh. Sets {@link pendingRefresh} so concurrent callers
     * (both advisory and mandatory) coalesce into a single provider call.
     */
    doRefresh(force = false) {
        this.pendingRefresh = this.provider(force ? { forceRefresh: true } : undefined).then((token) => {
            this.cached = token;
            this.pendingRefresh = null;
            return token;
        }, (err) => {
            this.pendingRefresh = null;
            throw err;
        });
        return this.pendingRefresh;
    }
}

var define_globalThis_process_env_default = {};
const readEnv = (env) => {
  if (typeof globalThis.process !== "undefined") {
    return define_globalThis_process_env_default?.[env]?.trim() || void 0;
  }
  if (typeof globalThis.Deno !== "undefined") {
    return globalThis.Deno.env?.get?.(env)?.trim() || void 0;
  }
  return void 0;
};

function concatBytes(buffers) {
    let length = 0;
    for (const buffer of buffers) {
        length += buffer.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const buffer of buffers) {
        output.set(buffer, index);
        index += buffer.length;
    }
    return output;
}
let encodeUTF8_;
function encodeUTF8(str) {
    let encoder;
    return (encodeUTF8_ ??
        ((encoder = new globalThis.TextEncoder()), (encodeUTF8_ = encoder.encode.bind(encoder))))(str);
}
let decodeUTF8_;
function decodeUTF8(bytes) {
    let decoder;
    return (decodeUTF8_ ??
        ((decoder = new globalThis.TextDecoder()), (decodeUTF8_ = decoder.decode.bind(decoder))))(bytes);
}

const fromBase64 = (str) => {
    if (typeof globalThis.Buffer !== 'undefined') {
        const buf = globalThis.Buffer.from(str, 'base64');
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    if (typeof atob !== 'undefined') {
        const bstr = atob(str);
        const buf = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) {
            buf[i] = bstr.charCodeAt(i);
        }
        return buf;
    }
    throw new AnthropicError('Cannot decode base64 string; Expected `Buffer` or `atob` to be defined');
};

const defaultLogLevel = "warn";
const levelNumbers = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
};
const parseLogLevel = (maybeLevel, sourceName, logger) => {
  if (!maybeLevel) {
    return void 0;
  }
  if (hasOwn(levelNumbers, maybeLevel)) {
    return maybeLevel;
  }
  logger.warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
  return void 0;
};
function noop() {
}
function makeLogFn(fnLevel, logger, logLevel) {
  if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
    return noop;
  } else {
    return logger[fnLevel].bind(logger);
  }
}
const noopLogger = {
  error: noop,
  warn: noop,
  info: noop,
  debug: noop
};
let cachedLoggers = /* @__PURE__ */ new WeakMap();
function filterLogger(logger, logLevel) {
  const cachedLogger = cachedLoggers.get(logger);
  if (cachedLogger && cachedLogger[0] === logLevel) {
    return cachedLogger[1];
  }
  const levelLogger = {
    error: makeLogFn("error", logger, logLevel),
    warn: makeLogFn("warn", logger, logLevel),
    info: makeLogFn("info", logger, logLevel),
    debug: makeLogFn("debug", logger, logLevel)
  };
  cachedLoggers.set(logger, [logLevel, levelLogger]);
  return levelLogger;
}
function loggerFor(client) {
  const logger = client.logger;
  const logLevel = client.logLevel ?? "off";
  if (!logger) {
    return noopLogger;
  }
  return filterLogger(logger, logLevel);
}
let lastEnvLevel;
let cachedDefaultLogger;
function defaultLogger() {
  const envLevel = readEnv("ANTHROPIC_LOG");
  if (!cachedDefaultLogger || envLevel !== lastEnvLevel) {
    lastEnvLevel = envLevel;
    cachedDefaultLogger = filterLogger(console, parseLogLevel(envLevel, "process.env['ANTHROPIC_LOG']", filterLogger(console, defaultLogLevel)) ?? defaultLogLevel);
  }
  return cachedDefaultLogger;
}
function debugLogRequestDetails(logger, message, details) {
  if (logger.debug === noop) {
    return;
  }
  logger.debug(message, formatRequestDetails(details));
}
const formatRequestDetails = (details) => {
  if (details.options) {
    details.options = { ...details.options };
    delete details.options["headers"];
  }
  if (details.headers) {
    details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [
      name,
      name.toLowerCase() === "authorization" || name.toLowerCase() === "api-key" || name.toLowerCase() === "x-api-key" || name.toLowerCase() === "cookie" || name.toLowerCase() === "set-cookie" ? "***" : value
    ]));
  }
  if ("retryOfRequestLogID" in details) {
    if (details.retryOfRequestLogID) {
      details.retryOf = details.retryOfRequestLogID;
    }
    delete details.retryOfRequestLogID;
  }
  return details;
};

/**
 * https://stackoverflow.com/a/2117523
 */
let uuid4 = function () {
    const { crypto } = globalThis;
    if (crypto?.randomUUID) {
        uuid4 = crypto.randomUUID.bind(crypto);
        return crypto.randomUUID();
    }
    const u8 = new Uint8Array(1);
    const randomByte = crypto ? () => crypto.getRandomValues(u8)[0] : () => (Math.random() * 0xff) & 0xff;
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (+c ^ (randomByte() & (15 >> (+c / 4)))).toString(16));
};

/** Current schema version written to `credentials/<profile>.json`. Absent on read ⇒ "1.0". */
const CREDENTIALS_FILE_VERSION = '1.0';
const PROFILE_NAME_PATTERN = /^[A-Za-z0-9_.-]+$/;
function validateProfileName(name) {
    if (!name) {
        throw new Error('profile name is empty');
    }
    if (name === '.' || name === '..') {
        throw new Error(`profile name "${name}" is not allowed`);
    }
    if (name.includes('/') || name.includes('\\')) {
        throw new Error(`profile name "${name}" must not contain path separators`);
    }
    if (!PROFILE_NAME_PATTERN.test(name)) {
        throw new Error(`profile name "${name}" contains disallowed characters (allowed: letters, digits, '_', '.', '-')`);
    }
}
/**
 * Same as {@link loadConfig}, but also reports whether the config was loaded
 * from a profile file on disk (`fromFile: true`) or synthesized entirely from
 * environment variables (`fromFile: false`).
 */
const loadConfigWithSource = async (profile) => {
    var _a, _b;
    const rootConfigPath = await getRootConfigPath();
    if (rootConfigPath === null) {
        return null;
    }
    const profileName = profile ?? (await getActiveProfileName());
    if (profileName === null) {
        return null;
    }
    validateProfileName(profileName);
    const { fs, path } = await __vitePreload(async () => { const { fs, path } = await import('./node.browser.js');return { fs, path }},true?__vite__mapDeps([0,1,2]):void 0);
    const configPath = path.join(rootConfigPath, 'configs', `${profileName}.json`);
    let configRaw;
    try {
        configRaw = await fs.promises.readFile(configPath, 'utf-8');
    }
    catch (err) {
        if (err?.code !== 'ENOENT') {
            throw new Error(`failed to read config file ${configPath}: ${err}`);
        }
        configRaw = null;
    }
    if (configRaw === null) {
        const organizationId = readEnv('ANTHROPIC_ORGANIZATION_ID');
        const identityTokenFile = readEnv('ANTHROPIC_IDENTITY_TOKEN_FILE');
        const federationRuleId = readEnv('ANTHROPIC_FEDERATION_RULE_ID');
        if (federationRuleId && organizationId) {
            return {
                fromFile: false,
                config: {
                    organization_id: organizationId,
                    // A defaulted-but-empty CI variable (`ANTHROPIC_WORKSPACE_ID=""`) is
                    // treated as unset — readEnv coerces empty to undefined, and the body
                    // builder's truthy check skips it — so `"workspace_id": ""` never goes
                    // on the wire.
                    workspace_id: readEnv('ANTHROPIC_WORKSPACE_ID'),
                    base_url: readEnv('ANTHROPIC_BASE_URL'),
                    authentication: {
                        type: 'oidc_federation',
                        federation_rule_id: federationRuleId,
                        service_account_id: readEnv('ANTHROPIC_SERVICE_ACCOUNT_ID'),
                        identity_token: identityTokenFile ? { source: 'file', path: identityTokenFile } : undefined,
                        scope: readEnv('ANTHROPIC_SCOPE'),
                    },
                },
            };
        }
        return null;
    }
    let config;
    try {
        config = JSON.parse(configRaw);
    }
    catch (err) {
        throw new Error(`failed to parse config file ${configPath}: ${err}`);
    }
    if (!config.authentication) {
        throw new Error(`config file ${configPath} is missing "authentication"`);
    }
    const authType = config.authentication.type;
    if (authType !== 'oidc_federation' && authType !== 'user_oauth') {
        throw new Error(`authentication.type "${authType}" is not a known authentication type`);
    }
    // File values are authoritative; env vars only fill fields the file left unset.
    config.organization_id ?? (config.organization_id = readEnv('ANTHROPIC_ORGANIZATION_ID'));
    config.workspace_id ?? (config.workspace_id = readEnv('ANTHROPIC_WORKSPACE_ID'));
    config.base_url ?? (config.base_url = readEnv('ANTHROPIC_BASE_URL'));
    (_a = config.authentication).scope ?? (_a.scope = readEnv('ANTHROPIC_SCOPE'));
    if (config.authentication.type === 'oidc_federation') {
        if (!config.authentication.identity_token) {
            const identityTokenFile = readEnv('ANTHROPIC_IDENTITY_TOKEN_FILE');
            if (identityTokenFile) {
                config.authentication.identity_token = {
                    source: 'file',
                    path: identityTokenFile,
                };
            }
        }
        // Unlike siblings using `??= readEnv()` (which leaves `undefined`), coerce
        // to '' so the type stays `string` (always set). The downstream required
        // check in credential-chain rejects empty, so semantics match but types are
        // cleaner.
        if (!config.authentication.federation_rule_id) {
            config.authentication.federation_rule_id = readEnv('ANTHROPIC_FEDERATION_RULE_ID') ?? '';
        }
        (_b = config.authentication).service_account_id ?? (_b.service_account_id = readEnv('ANTHROPIC_SERVICE_ACCOUNT_ID'));
    }
    return { config, fromFile: true };
};
/**
 * Resolves the credentials file path for the given config.
 *
 * Uses `authentication.credentials_path` from the config if set, otherwise
 * falls back to `<config_dir>/credentials/<profile>.json`.
 *
 * Returns `null` when running in a browser or the path cannot be resolved.
 */
const getCredentialsPath = async (config, profile) => {
    if (config?.authentication.credentials_path) {
        return config.authentication.credentials_path;
    }
    const rootConfigPath = await getRootConfigPath();
    if (!rootConfigPath) {
        return null;
    }
    const profileName = profile ?? (await getActiveProfileName());
    if (!profileName) {
        return null;
    }
    validateProfileName(profileName);
    const { path } = await __vitePreload(async () => { const { path } = await import('./node.browser.js');return { path }},true?__vite__mapDeps([0,1,2]):void 0);
    return path.join(rootConfigPath, 'credentials', `${profileName}.json`);
};
const getRootConfigPath = async () => {
    if (!supportsLocalConfigFiles()) {
        return null;
    }
    const { path } = await __vitePreload(async () => { const { path } = await import('./node.browser.js');return { path }},true?__vite__mapDeps([0,1,2]):void 0);
    // ANTHROPIC_CONFIG_DIR is treated as a trusted path: it is set by the
    // process operator, not by remote input, so it is not validated.
    const configDir = readEnv('ANTHROPIC_CONFIG_DIR');
    if (configDir) {
        return configDir;
    }
    const os = getPlatformHeaders()['X-Stainless-OS'];
    if (os === 'Windows') {
        const appData = readEnv('APPDATA');
        if (appData) {
            return path.join(appData, 'Anthropic');
        }
        const userProfile = readEnv('USERPROFILE');
        if (userProfile) {
            return path.join(userProfile, 'AppData', 'Roaming', 'Anthropic');
        }
        // No usable Windows config root — return null so callers fall through to
        // "no config available" rather than silently writing under C:\.
        return null;
    }
    const xdgConfigHome = readEnv('XDG_CONFIG_HOME');
    if (xdgConfigHome) {
        return path.join(xdgConfigHome, 'anthropic');
    }
    const home = readEnv('HOME');
    if (home) {
        return path.join(home, '.config', 'anthropic');
    }
    return null;
};
const supportsLocalConfigFiles = () => {
    const runtime = getPlatformHeaders()['X-Stainless-Runtime'];
    return runtime === 'node' || runtime === 'deno';
};
const getActiveProfileName = async () => {
    const rootConfigPath = await getRootConfigPath();
    if (!rootConfigPath) {
        return null;
    }
    const profileName = readEnv('ANTHROPIC_PROFILE');
    if (profileName) {
        return profileName;
    }
    const { fs, path } = await __vitePreload(async () => { const { fs, path } = await import('./node.browser.js');return { fs, path }},true?__vite__mapDeps([0,1,2]):void 0);
    const filePath = path.join(rootConfigPath, 'active_config');
    try {
        return (await fs.promises.readFile(filePath, 'utf-8')).trim() || 'default';
    }
    catch (err) {
        if (err?.code !== 'ENOENT') {
            throw new Error(`failed to read ${filePath}: ${err}`);
        }
        return 'default';
    }
};

/**
 * Reads a JWT from a file on every call. Supports automatic rotation
 * (e.g. Kubernetes projected service-account tokens).
 */
function identityTokenFromFile(path) {
    if (!path) {
        throw new AnthropicError('Identity token file path is empty');
    }
    return async () => {
        const { fs } = await __vitePreload(async () => { const { fs } = await import('./node.browser.js');return { fs }},true?__vite__mapDeps([0,1,2]):void 0);
        let content;
        try {
            content = await fs.promises.readFile(path, 'utf-8');
        }
        catch (err) {
            throw new AnthropicError(`Failed to read identity token file at ${path}: ${err}`);
        }
        const token = content.trim();
        if (!token) {
            throw new AnthropicError(`Identity token file at ${path} is empty`);
        }
        return token;
    };
}
/**
 * Wraps a static JWT string as an {@link IdentityTokenProvider}.
 */
function identityTokenFromValue(token) {
    if (!token) {
        throw new AnthropicError('Identity token value is empty');
    }
    return () => token;
}

/**
 * Exchanges an external OIDC JWT for an Anthropic access token via the
 * RFC 7523 jwt-bearer grant.
 *
 * Each invocation performs a fresh token exchange. Wrap in a
 * {@link TokenCache} to avoid exchanging on every request.
 *
 * Federation grants do not return a refresh token — callers re-exchange
 * their assertion on expiry.
 */
function oidcFederationProvider(config) {
    return async () => {
        requireSecureTokenEndpoint(config.baseURL);
        const jwt = await config.identityTokenProvider();
        // The token endpoint enforces a 16 KiB assertion limit; surface a clear
        // client-side error so misconfigured projected-token sources are
        // diagnosable without a server round-trip.
        if (jwt.length > 16 * 1024) {
            throw new WorkloadIdentityError(`Identity token is ${Math.ceil(jwt.length / 1024)} KiB, exceeds the 16 KiB assertion limit`);
        }
        const body = {
            grant_type: GRANT_TYPE_JWT_BEARER,
            assertion: jwt,
            federation_rule_id: config.federationRuleId,
            organization_id: config.organizationId,
        };
        if (config.serviceAccountId) {
            body['service_account_id'] = config.serviceAccountId;
        }
        if (config.workspaceId) {
            body['workspace_id'] = config.workspaceId;
        }
        const url = `${config.baseURL}${TOKEN_ENDPOINT}`;
        let resp;
        try {
            resp = await config.fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-beta': `${OAUTH_API_BETA_HEADER},${FEDERATION_BETA_HEADER}`,
                    'User-Agent': config.userAgent || `anthropic-sdk-typescript/${VERSION} oidcFederationProvider`,
                },
                body: JSON.stringify(body),
            });
        }
        catch (err) {
            throw new WorkloadIdentityError(`Failed to reach token endpoint ${url}: ${err}`);
        }
        const requestId = resp.headers.get('Request-Id');
        if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            const redacted = redactSensitive(text);
            // A 401 is hard to debug from the status code alone, so surface
            // guidance: check the federation rule, optionally set a workspace ID
            // (the most common fix when no workspaceId is configured), and point at
            // the Workload identity page in Claude Console for the server-side
            // authentication event log. Other statuses (5xx, 400, ...) get no hint.
            let hint = '';
            if (resp.status === 401) {
                const hintMiddle = config.workspaceId ? '' : ("If your federation rule is scoped to multiple workspaces, set the ANTHROPIC_WORKSPACE_ID environment variable, the 'workspace_id' config key, or the `workspaceId` option. ");
                hint = ` Ensure your federation rule matches your identity token. ${hintMiddle}View your authentication events in the Workload identity page of Claude Console for more details.`;
            }
            throw new WorkloadIdentityError(`Token exchange failed with status ${resp.status}${requestId ? ` (request-id ${requestId})` : ''}: ${redacted}${hint}`, resp.status, redacted, requestId);
        }
        const data = await parseTokenResponse(resp, requestId);
        const expiresIn = Number(data.expires_in);
        if (!Number.isFinite(expiresIn)) {
            throw new WorkloadIdentityError(`Token endpoint response missing required fields: ${JSON.stringify(redactSensitive(data))}`, resp.status, redactSensitive(data), requestId);
        }
        return {
            token: data.access_token,
            expiresAt: nowAsSeconds() + expiresIn,
        };
    };
}

/**
 * Reads a user-oauth credential file. Returns the cached access token while
 * fresh; on expiry performs a `refresh_token` grant and writes the new
 * tokens back to the credentials file (atomic replace, fsync'd).
 *
 * If `clientId` is empty, the access token is treated as static — the
 * credentials file is read on every call but no refresh is attempted, and
 * an expired token without a `refresh_token` raises.
 */
function userOAuthProvider(config) {
    return async (opts) => {
        const { fs } = await __vitePreload(async () => { const { fs } = await import('./node.browser.js');return { fs }},true?__vite__mapDeps([0,1,2]):void 0);
        await checkCredentialsFileSafety(config.credentialsPath, config.onSafetyWarning);
        let raw;
        try {
            raw = await fs.promises.readFile(config.credentialsPath, 'utf-8');
        }
        catch (err) {
            throw new WorkloadIdentityError(`Credentials file not found at ${config.credentialsPath}: ${err}`);
        }
        let creds;
        try {
            creds = JSON.parse(raw);
        }
        catch (err) {
            throw new WorkloadIdentityError(`Credentials file at ${config.credentialsPath} is not valid JSON: ${err}`);
        }
        const accessToken = creds.access_token;
        if (!accessToken) {
            throw new WorkloadIdentityError(`Credentials file at ${config.credentialsPath} must include 'access_token'`);
        }
        // Return cached token if still fresh (or no expiry info), unless the
        // caller is forcing a refresh after a 401 — then go straight to refresh
        // even if the file's expires_at still looks valid.
        const expiresAt = creds.expires_at;
        if (!opts?.forceRefresh &&
            (expiresAt == null || nowAsSeconds() < expiresAt - MANDATORY_REFRESH_THRESHOLD_IN_SECONDS)) {
            return { token: accessToken, expiresAt: expiresAt ?? null };
        }
        const refreshToken = creds.refresh_token;
        if (!config.clientId || !refreshToken) {
            throw new WorkloadIdentityError(`Access token at ${config.credentialsPath} has expired and no refresh is available ` +
                `(client_id ${config.clientId ? 'set' : 'empty'}, refresh_token ${refreshToken ? 'set' : 'empty'})`);
        }
        requireSecureTokenEndpoint(config.baseURL);
        const body = {
            grant_type: GRANT_TYPE_REFRESH_TOKEN,
            refresh_token: refreshToken,
            client_id: config.clientId,
        };
        const url = `${config.baseURL}${TOKEN_ENDPOINT}`;
        let resp;
        try {
            resp = await config.fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-beta': OAUTH_API_BETA_HEADER,
                    'User-Agent': config.userAgent || `anthropic-sdk-typescript/${VERSION} userOAuthProvider`,
                },
                body: JSON.stringify(body),
            });
        }
        catch (err) {
            throw new WorkloadIdentityError(`User OAuth refresh failed to reach token endpoint: ${err}`);
        }
        const requestId = resp.headers.get('Request-Id');
        if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            throw new WorkloadIdentityError(`User OAuth refresh failed (HTTP ${resp.status}): ${redactSensitive(text)}`, resp.status, redactSensitive(text), requestId);
        }
        const data = await parseTokenResponse(resp, requestId);
        const expiresIn = Number(data.expires_in);
        if (!Number.isFinite(expiresIn)) {
            throw new WorkloadIdentityError(`User OAuth refresh response missing or invalid expires_in: ${JSON.stringify(redactSensitive(data))}`, resp.status, redactSensitive(data), requestId);
        }
        const newExpiresAt = nowAsSeconds() + expiresIn;
        const newRefreshToken = data.refresh_token || refreshToken;
        await writeCredentialsFileAtomic(config.credentialsPath, {
            ...creds,
            version: CREDENTIALS_FILE_VERSION,
            type: 'oauth_token',
            access_token: data.access_token,
            expires_at: newExpiresAt,
            refresh_token: newRefreshToken,
        });
        return { token: data.access_token, expiresAt: newExpiresAt };
    };
}

function resolveCredentialsFromConfig(config, options) {
    const credentialsPath = config.authentication.credentials_path ?? null;
    const effectiveBaseURL = (config.base_url || options.baseURL).replace(/\/+$/, '');
    const provider = buildProvider(config, credentialsPath, effectiveBaseURL, options);
    const extraHeaders = {};
    // For federation profiles workspace_id is sent in the jwt-bearer exchange
    // body, not as a request header (the minted token is already
    // workspace-scoped, so the header would be ignored).
    if (config.workspace_id && config.authentication.type === 'user_oauth') {
        extraHeaders['anthropic-workspace-id'] = config.workspace_id;
    }
    // Surface the profile's own base_url (not the options.baseURL fallback) so
    // the client can adopt it for outbound API requests when the caller didn't
    // pin one explicitly. Echoing options.baseURL back would defeat precedence.
    return { provider, extraHeaders, baseURL: config.base_url || undefined };
}
/**
 * Resolves a {@link CredentialResult} from the environment. Returns `null`
 * when no credentials can be resolved.
 *
 * Resolution order:
 *
 *   1. Config file for the active profile (or the explicit `profile` argument)
 *      → dispatch on `authentication.type` (`oidc_federation`, `user_oauth`)
 *   2. Environment variables `ANTHROPIC_FEDERATION_RULE_ID` +
 *      `ANTHROPIC_ORGANIZATION_ID` (+ identity token) → OIDC federation
 *   3. Nothing matches → `null`
 *
 * Passing `profile` selects `<config_dir>/configs/<profile>.json` directly,
 * skipping `ANTHROPIC_PROFILE` / `active_config` resolution.
 */
async function defaultCredentials(options, profile) {
    const loaded = await loadConfigWithSource(profile);
    if (!loaded) {
        return null;
    }
    const { config, fromFile } = loaded;
    // For file-loaded configs, default credentials_path to the per-profile
    // location so user_oauth and federation caching work. Shallow-clone first
    // so callers that retain a reference to the loaded config don't observe the
    // patched-in default.
    //
    // Env-only credentials (no profile file on disk) skip the disk cache —
    // matching the other SDKs. A disk cache keyed by profile path would
    // re-serve a stale token after a change to ANTHROPIC_WORKSPACE_ID (or
    // ANTHROPIC_ORGANIZATION_ID / ANTHROPIC_FEDERATION_RULE_ID) until the
    // cached token expired, so the env-only chain stays in-memory only.
    const withPath = config.authentication.credentials_path || !fromFile ?
        config
        : {
            ...config,
            authentication: {
                ...config.authentication,
                credentials_path: (await getCredentialsPath(config, profile)) ?? undefined,
            },
        };
    return resolveCredentialsFromConfig(withPath, options);
}
function buildProvider(config, credentialsPath, baseURL, options) {
    switch (config.authentication.type) {
        case 'oidc_federation': {
            const auth = config.authentication;
            const identityProvider = resolveIdentityTokenProvider(auth);
            if (!identityProvider) {
                throw new WorkloadIdentityError('oidc_federation config requires an identity token (set authentication.identity_token, ' +
                    'ANTHROPIC_IDENTITY_TOKEN_FILE, or ANTHROPIC_IDENTITY_TOKEN)');
            }
            if (!auth.federation_rule_id) {
                throw new WorkloadIdentityError("oidc_federation config requires 'federation_rule_id'. Set it in authentication.federation_rule_id in your profile, or via ANTHROPIC_FEDERATION_RULE_ID (profile takes precedence).");
            }
            if (!config.organization_id) {
                throw new WorkloadIdentityError('oidc_federation config requires organization_id (set ANTHROPIC_ORGANIZATION_ID or config.organization_id)');
            }
            const exchange = oidcFederationProvider({
                identityTokenProvider: identityProvider,
                federationRuleId: auth.federation_rule_id,
                organizationId: config.organization_id,
                serviceAccountId: auth.service_account_id,
                workspaceId: config.workspace_id,
                baseURL,
                fetch: options.fetch,
                userAgent: options.userAgent,
            });
            // If there's a credentials file path, wrap the exchange with file caching
            // (check file for fresh token before exchanging, write back after).
            if (credentialsPath) {
                return cachedExchangeProvider(exchange, credentialsPath, options.onCacheWriteError, options.onSafetyWarning);
            }
            return exchange;
        }
        case 'user_oauth': {
            if (!credentialsPath) {
                throw new WorkloadIdentityError('user_oauth config requires authentication.credentials_path ' +
                    '(or load via a profile so it defaults to <config_dir>/credentials/<profile>.json)');
            }
            return userOAuthProvider({
                credentialsPath,
                clientId: config.authentication.client_id,
                baseURL,
                fetch: options.fetch,
                userAgent: options.userAgent,
                onSafetyWarning: options.onSafetyWarning,
            });
        }
        default: {
            const t = config.authentication.type;
            throw new WorkloadIdentityError(`authentication.type "${t}" is not a known authentication type`);
        }
    }
}
/**
 * Resolves the identity token provider from config fields or environment variables.
 *
 * Resolution order:
 *   1. `identity_token.path` from the config (source: "file")
 *   2. `ANTHROPIC_IDENTITY_TOKEN_FILE` env var
 *   3. `ANTHROPIC_IDENTITY_TOKEN` env var (static value)
 */
function resolveIdentityTokenProvider(auth) {
    if (auth.identity_token) {
        // Cast needed to stringify an unknown source value for the error message:
        // the on-disk JSON may contain a source this SDK version doesn't know about.
        const source = auth.identity_token.source;
        if (source !== 'file') {
            throw new WorkloadIdentityError(`identity_token.source "${source}" is not supported by this SDK version (only "file")`);
        }
        if (!auth.identity_token.path) {
            throw new WorkloadIdentityError(`identity_token.source "file" requires a non-empty path`);
        }
        return identityTokenFromFile(auth.identity_token.path);
    }
    const tokenFile = readEnv('ANTHROPIC_IDENTITY_TOKEN_FILE');
    if (tokenFile) {
        return identityTokenFromFile(tokenFile);
    }
    const tokenValue = readEnv('ANTHROPIC_IDENTITY_TOKEN');
    if (tokenValue) {
        return identityTokenFromValue(tokenValue);
    }
    return null;
}
/**
 * Wraps a federation exchange provider with credential file caching.
 * Checks the file for a fresh token before exchanging, and writes the
 * result back after a successful exchange (best-effort, atomic replace).
 *
 * Note: this is not cross-process serialized — two SDK instances that
 * miss the cache simultaneously will both perform a full exchange and
 * the last writer wins. That is acceptable: federation exchanges are
 * idempotent and the cache is an optimization, not a correctness gate.
 */
function cachedExchangeProvider(exchange, credentialsPath, onCacheWriteError, onSafetyWarning) {
    return async (opts) => {
        const { fs } = await __vitePreload(async () => { const { fs } = await import('./node.browser.js');return { fs }},true?__vite__mapDeps([0,1,2]):void 0);
        await checkCredentialsFileSafety(credentialsPath, onSafetyWarning);
        // Try cached credentials file
        let existing;
        try {
            const raw = await fs.promises.readFile(credentialsPath, 'utf-8');
            existing = JSON.parse(raw);
            const token = existing?.['access_token'];
            if (token && !opts?.forceRefresh) {
                const expiresAt = existing?.['expires_at'];
                if (expiresAt == null || nowAsSeconds() < expiresAt - MANDATORY_REFRESH_THRESHOLD_IN_SECONDS) {
                    return { token, expiresAt: expiresAt ?? null };
                }
            }
        }
        catch (err) {
            // ENOENT or invalid-JSON → no usable cache, exchange fresh. Other
            // errors (EACCES, EISDIR, …) indicate a broken cache path; surface to
            // the optional hook so they're at least debuggable, then proceed.
            const code = err?.code;
            if (code !== 'ENOENT' && !(err instanceof SyntaxError)) {
                onCacheWriteError?.(err);
            }
        }
        // Exchange for a new token
        const result = await exchange(opts);
        // Write cache back (best-effort). Preserve any unknown keys from the
        // existing file (notably refresh_token, in the unlikely case this path
        // is shared with a user_oauth profile) so the federation cache writer
        // doesn't clobber material it didn't own.
        try {
            await writeCredentialsFileAtomic(credentialsPath, {
                ...(existing ?? {}),
                version: CREDENTIALS_FILE_VERSION,
                type: 'oauth_token',
                access_token: result.token,
                expires_at: result.expiresAt,
            });
        }
        catch (err) {
            // Best-effort caching: surface to the optional hook but never fail
            // the exchange itself.
            onCacheWriteError?.(err);
        }
        return result;
    };
}

var _LineDecoder_buffer, _LineDecoder_carriageReturnIndex;
/**
 * A re-implementation of httpx's `LineDecoder` in Python that handles incrementally
 * reading lines from text.
 *
 * https://github.com/encode/httpx/blob/920333ea98118e9cf617f246905d7b202510941c/httpx/_decoders.py#L258
 */
var LineDecoder = /* @__PURE__ */ (() => {
    /**
     * A re-implementation of httpx's `LineDecoder` in Python that handles incrementally
     * reading lines from text.
     *
     * https://github.com/encode/httpx/blob/920333ea98118e9cf617f246905d7b202510941c/httpx/_decoders.py#L258
     */
    class LineDecoder {
        constructor() {
            _LineDecoder_buffer.set(this, void 0);
            _LineDecoder_carriageReturnIndex.set(this, void 0);
            __classPrivateFieldSet(this, _LineDecoder_buffer, new Uint8Array());
            __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null);
        }
        decode(chunk) {
            if (chunk == null) {
                return [];
            }
            const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk)
                : typeof chunk === 'string' ? encodeUTF8(chunk)
                    : chunk;
            __classPrivateFieldSet(this, _LineDecoder_buffer, concatBytes([__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), binaryChunk]));
            const lines = [];
            let patternIndex;
            while ((patternIndex = findNewlineIndex(__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
                if (patternIndex.carriage && __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") == null) {
                    // skip until we either get a corresponding `\n`, a new `\r` or nothing
                    __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, patternIndex.index);
                    continue;
                }
                // we got double \r or \rtext\n
                if (__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") != null &&
                    (patternIndex.index !== __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
                    lines.push(decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
                    __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f")));
                    __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null);
                    continue;
                }
                const endIndex = __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
                const line = decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, endIndex));
                lines.push(line);
                __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(patternIndex.index));
                __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null);
            }
            return lines;
        }
        flush() {
            if (!__classPrivateFieldGet(this, _LineDecoder_buffer, "f").length) {
                return [];
            }
            return this.decode('\n');
        }
    }
    _LineDecoder_buffer = new WeakMap(), _LineDecoder_carriageReturnIndex = new WeakMap();
    // prettier-ignore
    LineDecoder.NEWLINE_CHARS = new Set(['\n', '\r']);
    LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
    return LineDecoder;
})();
/**
 * This function searches the buffer for the end patterns, (\r or \n)
 * and returns an object with the index preceding the matched newline and the
 * index after the newline char. `null` is returned if no new line is found.
 *
 * ```ts
 * findNewLineIndex('abc\ndef') -> { preceding: 2, index: 3 }
 * ```
 */
function findNewlineIndex(buffer, startIndex) {
    const newline = 0x0a; // \n
    const carriage = 0x0d; // \r
    for (let i = startIndex ?? 0; i < buffer.length; i++) {
        if (buffer[i] === newline) {
            return { preceding: i, index: i + 1, carriage: false };
        }
        if (buffer[i] === carriage) {
            return { preceding: i, index: i + 1, carriage: true };
        }
    }
    return null;
}

var _Stream_client;
var Stream = /* @__PURE__ */ (() => {
    class Stream {
        constructor(iterator, controller, client) {
            this.iterator = iterator;
            _Stream_client.set(this, void 0);
            this.controller = controller;
            __classPrivateFieldSet(this, _Stream_client, client);
        }
        /**
         * Iterate the raw Server-Sent Events from `response` — `{event, data, raw}`
         * objects, before any JSON parsing or event-name filtering.
         *
         * This reads `response.body` directly (not a clone), so the response is
         * consumed. Use this in middleware that fully replaces the stream body; for
         * read-only observation of parsed events, use `ctx.parse()` instead.
         */
        static rawEvents(response, controller = new AbortController()) {
            return _iterSSEMessages(response, controller);
        }
        static fromSSEResponse(response, controller, client) {
            let consumed = false;
            const logger = client ? loggerFor(client) : console;
            async function* iterator() {
                if (consumed) {
                    throw new AnthropicError('Cannot iterate over a consumed stream, use `.tee()` to split the stream.');
                }
                consumed = true;
                let done = false;
                try {
                    for await (const sse of _iterSSEMessages(response, controller)) {
                        if (sse.event === 'completion') {
                            try {
                                yield JSON.parse(sse.data);
                            }
                            catch (e) {
                                logger.error(`Could not parse message into JSON:`, sse.data);
                                logger.error(`From chunk:`, sse.raw);
                                throw e;
                            }
                        }
                        if (sse.event === 'message_start' ||
                            sse.event === 'message_delta' ||
                            sse.event === 'message_stop' ||
                            sse.event === 'content_block_start' ||
                            sse.event === 'content_block_delta' ||
                            sse.event === 'content_block_stop' ||
                            sse.event === 'message' ||
                            sse.event === 'user.message' ||
                            sse.event === 'user.interrupt' ||
                            sse.event === 'user.tool_confirmation' ||
                            sse.event === 'user.custom_tool_result' ||
                            sse.event === 'user.tool_result' ||
                            sse.event === 'agent.message' ||
                            sse.event === 'agent.thinking' ||
                            sse.event === 'agent.tool_use' ||
                            sse.event === 'agent.tool_result' ||
                            sse.event === 'agent.mcp_tool_use' ||
                            sse.event === 'agent.mcp_tool_result' ||
                            sse.event === 'agent.custom_tool_use' ||
                            sse.event === 'agent.thread_context_compacted' ||
                            sse.event === 'session.status_running' ||
                            sse.event === 'session.status_idle' ||
                            sse.event === 'session.status_rescheduled' ||
                            sse.event === 'session.status_terminated' ||
                            sse.event === 'session.error' ||
                            sse.event === 'session.deleted' ||
                            sse.event === 'session.updated' ||
                            sse.event === 'span.model_request_start' ||
                            sse.event === 'span.model_request_end' ||
                            sse.event === 'span.outcome_evaluation_start' ||
                            sse.event === 'span.outcome_evaluation_ongoing' ||
                            sse.event === 'span.outcome_evaluation_end' ||
                            sse.event === 'user.define_outcome' ||
                            sse.event === 'agent.thread_message_received' ||
                            sse.event === 'agent.thread_message_sent' ||
                            sse.event === 'agent.session_thread_message_received' ||
                            sse.event === 'agent.session_thread_message_sent' ||
                            sse.event === 'session.thread_created' ||
                            sse.event === 'session.thread_status_created' ||
                            sse.event === 'session.thread_status_running' ||
                            sse.event === 'session.thread_status_idle' ||
                            sse.event === 'session.thread_status_rescheduled' ||
                            sse.event === 'session.thread_status_terminated' ||
                            sse.event === 'event_start' ||
                            sse.event === 'event_delta' ||
                            sse.event === 'system.message' ||
                            sse.event === 'workflow_run.created' ||
                            sse.event === 'workflow_run.status_running' ||
                            sse.event === 'workflow_run.status_idle' ||
                            sse.event === 'workflow_run.status_ended' ||
                            sse.event === 'workflow_run.error' ||
                            sse.event === 'workflow_run.phase_started' ||
                            sse.event === 'workflow_run.phase_ended') {
                            try {
                                yield JSON.parse(sse.data);
                            }
                            catch (e) {
                                logger.error(`Could not parse message into JSON:`, sse.data);
                                logger.error(`From chunk:`, sse.raw);
                                throw e;
                            }
                        }
                        if (sse.event === 'ping') {
                            continue;
                        }
                        if (sse.event === 'error') {
                            const body = safeJSON(sse.data) ?? sse.data;
                            const type = body?.error?.type;
                            throw new APIError(undefined, body, undefined, response.headers, type);
                        }
                    }
                    done = true;
                }
                catch (e) {
                    // If the user calls `stream.controller.abort()`, we should exit without throwing.
                    if (isAbortError(e))
                        return;
                    throw e;
                }
                finally {
                    // If the user `break`s, abort the ongoing request.
                    if (!done)
                        controller.abort();
                    releaseRequestSignal(controller);
                }
            }
            return new Stream(iterator, controller, client);
        }
        /**
         * Generates a Stream from a newline-separated ReadableStream
         * where each item is a JSON value.
         */
        static fromReadableStream(readableStream, controller, client) {
            let consumed = false;
            async function* iterLines() {
                const lineDecoder = new LineDecoder();
                const iter = ReadableStreamToAsyncIterable(readableStream);
                for await (const chunk of iter) {
                    for (const line of lineDecoder.decode(chunk)) {
                        yield line;
                    }
                }
                for (const line of lineDecoder.flush()) {
                    yield line;
                }
            }
            async function* iterator() {
                if (consumed) {
                    throw new AnthropicError('Cannot iterate over a consumed stream, use `.tee()` to split the stream.');
                }
                consumed = true;
                let done = false;
                try {
                    for await (const line of iterLines()) {
                        if (done)
                            continue;
                        if (line)
                            yield JSON.parse(line);
                    }
                    done = true;
                }
                catch (e) {
                    // If the user calls `stream.controller.abort()`, we should exit without throwing.
                    if (isAbortError(e))
                        return;
                    throw e;
                }
                finally {
                    // If the user `break`s, abort the ongoing request.
                    if (!done)
                        controller.abort();
                    releaseRequestSignal(controller);
                }
            }
            return new Stream(iterator, controller, client);
        }
        [(_Stream_client = new WeakMap(), Symbol.asyncIterator)]() {
            return this.iterator();
        }
        /**
         * Splits the stream into two streams which can be
         * independently read from at different speeds.
         */
        tee() {
            const left = [];
            const right = [];
            const iterator = this.iterator();
            const teeIterator = (queue) => {
                return {
                    next: () => {
                        if (queue.length === 0) {
                            const result = iterator.next();
                            left.push(result);
                            right.push(result);
                        }
                        return queue.shift();
                    },
                };
            };
            return [
                new Stream(() => teeIterator(left), this.controller, __classPrivateFieldGet(this, _Stream_client, "f")),
                new Stream(() => teeIterator(right), this.controller, __classPrivateFieldGet(this, _Stream_client, "f")),
            ];
        }
        /**
         * Converts this stream to a newline-separated ReadableStream of
         * JSON stringified values in the stream
         * which can be turned back into a Stream with `Stream.fromReadableStream()`.
         */
        toReadableStream() {
            const self = this;
            let iter;
            return makeReadableStream({
                async start() {
                    iter = self[Symbol.asyncIterator]();
                },
                async pull(ctrl) {
                    try {
                        const { value, done } = await iter.next();
                        if (done)
                            return ctrl.close();
                        const bytes = encodeUTF8(JSON.stringify(value) + '\n');
                        ctrl.enqueue(bytes);
                    }
                    catch (err) {
                        ctrl.error(err);
                    }
                },
                async cancel() {
                    await iter.return?.();
                },
            });
        }
    }
    return Stream;
})();
async function* _iterSSEMessages(response, controller) {
    if (!response.body) {
        controller.abort();
        if (typeof globalThis.navigator !== 'undefined' &&
            globalThis.navigator.product === 'ReactNative') {
            throw new AnthropicError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
        }
        throw new AnthropicError(`Attempted to iterate over a response with no body`);
    }
    const sseDecoder = new SSEDecoder();
    const lineDecoder = new LineDecoder();
    const iter = ReadableStreamToAsyncIterable(response.body);
    for await (const chunk of iter) {
        for (const line of lineDecoder.decode(chunk)) {
            const sse = sseDecoder.decode(line);
            if (sse)
                yield sse;
        }
    }
    for (const line of lineDecoder.flush()) {
        const sse = sseDecoder.decode(line);
        if (sse)
            yield sse;
    }
}
class SSEDecoder {
    constructor() {
        this.event = null;
        this.data = [];
        this.chunks = [];
    }
    decode(line) {
        if (line.endsWith('\r')) {
            line = line.substring(0, line.length - 1);
        }
        if (!line) {
            // empty line and we didn't previously encounter any messages
            if (!this.event && !this.data.length)
                return null;
            const sse = {
                event: this.event,
                data: this.data.join('\n'),
                raw: this.chunks,
            };
            this.event = null;
            this.data = [];
            this.chunks = [];
            return sse;
        }
        this.chunks.push(line);
        if (line.startsWith(':')) {
            return null;
        }
        let [fieldname, _, value] = partition(line, ':');
        if (value.startsWith(' ')) {
            value = value.substring(1);
        }
        if (fieldname === 'event') {
            this.event = value;
        }
        else if (fieldname === 'data') {
            this.data.push(value);
        }
        return null;
    }
}
function partition(str, delimiter) {
    const index = str.indexOf(delimiter);
    if (index !== -1) {
        return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
    }
    return [str, '', ''];
}

async function defaultParseResponse(client, props) {
    const { response, requestLogID, retryOfRequestLogID, startTime } = props;
    const body = await (async () => {
        if (props.options.stream) {
            loggerFor(client).debug('response', response.status, response.url, response.headers, response.body);
            // Note: there is an invariant here that isn't represented in the type system
            // that if you set `stream: true` the response type must also be `Stream<T>`
            return Stream.fromSSEResponse(response, props.controller, client);
        }
        // fetch refuses to read the body when the status code is 204.
        if (response.status === 204) {
            return null;
        }
        if (props.options.__binaryResponse) {
            return response;
        }
        const contentType = response.headers.get('content-type');
        const mediaType = contentType?.split(';')[0]?.trim();
        const isJSON = mediaType?.includes('application/json') || mediaType?.endsWith('+json');
        if (isJSON) {
            const contentLength = response.headers.get('content-length');
            if (contentLength === '0') {
                // if there is no content we can't do anything
                return undefined;
            }
            const json = await response.json();
            return addResponseIDs(json, response);
        }
        const text = await response.text();
        return text;
    })().finally(() => {
        // The body is settled (or parsing threw), so the caller-signal abort
        // listener has nothing left to cancel. Streams release in their own
        // teardown; a raw Response (`__binaryResponse`) keeps the listener so
        // aborting an in-flight download still works.
        if (!props.options.stream && !props.options.__binaryResponse) {
            releaseRequestSignal(props.controller);
        }
    });
    debugLogRequestDetails(loggerFor(client), `[${requestLogID}] response parsed`, {
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        body,
        durationMs: Date.now() - startTime,
    });
    return body;
}
function addResponseIDs(value, response) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return value;
    }
    return Object.defineProperties(value, {
        _request_id: { value: response.headers.get('request-id'), enumerable: false },
        _workspace_id: { value: response.headers.get('anthropic-workspace-id'), enumerable: false },
    });
}

/**
 * Errors thrown by the underlying `fetch`, as opposed to by a middleware.
 *
 * Tracked so the client can apply its connection-error retry policy to
 * transport failures while letting errors thrown by middleware propagate to
 * the caller untouched.
 */
const fetchOriginErrors = new WeakSet();
/** Whether `err` was thrown by the underlying `fetch` rather than by a middleware. */
function isFetchOriginError(err) {
    return typeof err === 'object' && err !== null && fetchOriginErrors.has(err);
}
/**
 * Whether an error thrown by middleware should stay on the SDK's
 * connection-error retry policy: fetch-origin, abort, `APIConnectionError`, or
 * `RetryableError` — checked through the error's `cause` chain.
 */
function isRetryableError(err) {
    const seen = new Set(); // guard against `cause` cycles
    while (typeof err === 'object' && err !== null && !seen.has(err)) {
        seen.add(err);
        if (isFetchOriginError(err) ||
            isAbortError(err) ||
            err instanceof APIConnectionError ||
            err instanceof RetryableError) {
            return true;
        }
        err = err.cause;
    }
    return false;
}
/**
 * Wraps `fetchFn` so each call runs through `middleware`, keeping the same
 * call signature as `fetch` itself.
 *
 * With no middleware, calls are passed straight through to `fetchFn`.
 * Otherwise the arguments are normalized into an {@link APIRequest} (headers
 * coerced to a `Headers` instance, URL stringified) before entering the
 * chain. The chain is composed per call, so mutations of a `middleware`
 * array are picked up by later requests.
 *
 * `options` — the SDK request options behind this call, when there are any —
 * is surfaced to middleware as `ctx.options` and drives `ctx.parse`.
 *
 * `client` supplies `ctx.logger` (the client's level-filtered logger);
 * without it, `ctx.logger` falls back to the client defaults: `console`,
 * filtered to `ANTHROPIC_LOG` or `'warn'`.
 */
function wrapFetchWithMiddleware(fetchFn, middleware, options, client) {
    return async (url, init = {}) => {
        if (middleware.length === 0) {
            // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
            return fetchFn.call(undefined, url, init);
        }
        const headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers);
        const response = await applyMiddleware(fetchFn, middleware, options, client)({
            ...init,
            headers,
            url: typeof url === 'string' ? url
                : url instanceof URL ? url.href
                    : url.url,
        });
        // Catch a footgun before the client tries to read the body itself and
        // fails with a confusing low-level stream error.
        if (response.bodyUsed || response.body?.locked) {
            throw new AnthropicError('middleware consumed the response body; use response.clone() to inspect it, ' +
                'or return new Response(body, response) to consume and replace it');
        }
        return response;
    };
}
/**
 * Creates the {@link MiddlewareContext} shared by every middleware in one chain.
 */
function createMiddlewareContext(options, client) {
    // Keyed on the Response so each `next()` call's response (e.g. with custom
    // retries, or a middleware swapping in a replacement) parses independently,
    // while several middleware parsing the same response share a single read.
    const cache = new WeakMap();
    return {
        options,
        // Resolved per chain, so changes to the client's `logLevel`/`logger`
        // apply to subsequent requests.
        logger: client ? loggerFor(client) : defaultLogger(),
        parse(response) {
            // Streams are single-consumer, so caching one would hand later callers
            // an already-consumed stream; every call gets a fresh clone-backed one.
            if (options?.stream && response.ok) {
                return parseMiddlewareResponse(response, options, client);
            }
            let parsed = cache.get(response);
            if (!parsed) {
                parsed = parseMiddlewareResponse(response, options, client);
                cache.set(response, parsed);
            }
            return parsed;
        },
    };
}
/**
 * Mirrors the client's own response parsing (`defaultParseResponse` in
 * `internal/parse.ts`), reading through a clone so the body stays available
 * to the rest of the chain and the client itself.
 */
async function parseMiddlewareResponse(response, options, client) {
    if (response.bodyUsed || response.body?.locked) {
        throw new AnthropicError('cannot ctx.parse() a response whose body was already consumed; ' +
            'call ctx.parse() instead of reading the body, or read via response.clone()');
    }
    // Error responses parse as JSON/text below — the SDK only stream-parses
    // successful responses, and middleware typically wants the error body.
    if (options?.stream && response.ok) {
        // A fresh controller rather than the request's own: aborting (or
        // `break`ing out of) the middleware's stream must not cancel the
        // in-flight request the client is still reading.
        return Stream.fromSSEResponse(response.clone(), new AbortController(), client);
    }
    // fetch refuses to read the body when the status code is 204.
    if (response.status === 204) {
        return null;
    }
    if (options?.__binaryResponse) {
        return response;
    }
    const contentType = response.headers.get('content-type');
    const mediaType = contentType?.split(';')[0]?.trim();
    const isJSON = mediaType?.includes('application/json') || mediaType?.endsWith('+json');
    if (isJSON) {
        if (response.headers.get('content-length') === '0') {
            // if there is no content we can't do anything
            return undefined;
        }
        return addResponseIDs(await response.clone().json(), response);
    }
    return await response.clone().text();
}
/**
 * Composes `middleware` around `fetchFn` and returns the entry point of the chain.
 */
function applyMiddleware(fetchFn, middleware, options, client) {
    // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
    let next = async ({ url, ...init }) => {
        try {
            return await fetchFn.call(undefined, url, init);
        }
        catch (err) {
            // Brand the error as fetch-origin, normalizing with `castToError` first since a
            // WeakSet can't hold primitives and the brand must be on the same object the
            // client's own `castToError` will later pass through.
            const error = castToError(err);
            fetchOriginErrors.add(error);
            throw error;
        }
    };
    const ctx = createMiddlewareContext(options, client);
    for (let i = middleware.length - 1; i >= 0; i--) {
        const mw = middleware[i];
        const nextInner = next;
        next = async (request) => mw(request, nextInner, ctx);
    }
    return next;
}

var _APIPromise_client;
/**
 * A subclass of `Promise` providing additional helper methods
 * for interacting with the SDK.
 */
var APIPromise = /* @__PURE__ */ (() => {
    /**
     * A subclass of `Promise` providing additional helper methods
     * for interacting with the SDK.
     */
    class APIPromise extends Promise {
        constructor(client, responsePromise, parseResponse = defaultParseResponse) {
            super((resolve) => {
                // this is maybe a bit weird but this has to be a no-op to not implicitly
                // parse the response body; instead .then, .catch, .finally are overridden
                // to parse the response
                resolve(null);
            });
            this.responsePromise = responsePromise;
            this.parseResponse = parseResponse;
            _APIPromise_client.set(this, void 0);
            __classPrivateFieldSet(this, _APIPromise_client, client);
        }
        _thenUnwrap(transform) {
            return new APIPromise(__classPrivateFieldGet(this, _APIPromise_client, "f"), this.responsePromise, async (client, props) => addResponseIDs(transform(await this.parseResponse(client, props), props), props.response));
        }
        /**
         * Gets the raw `Response` instance instead of parsing the response
         * data.
         *
         * If you want to parse the response body but still get the `Response`
         * instance, you can use {@link withResponse()}.
         *
         * 👋 Getting the wrong TypeScript type for `Response`?
         * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
         * to your `tsconfig.json`.
         */
        asResponse() {
            return this.responsePromise.then((p) => p.response);
        }
        /**
         * Gets the parsed response data, the raw `Response` instance and the ID of the request,
         * returned via the `request-id` header which is useful for debugging requests and resporting
         * issues to Anthropic.
         *
         * If you just want to get the raw `Response` instance without parsing it,
         * you can use {@link asResponse()}.
         *
         * 👋 Getting the wrong TypeScript type for `Response`?
         * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
         * to your `tsconfig.json`.
         */
        async withResponse() {
            const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
            return {
                data,
                response,
                request_id: response.headers.get('request-id'),
                workspace_id: response.headers.get('anthropic-workspace-id'),
            };
        }
        parse() {
            if (!this.parsedPromise) {
                this.parsedPromise = this.responsePromise.then((data) => this.parseResponse(__classPrivateFieldGet(this, _APIPromise_client, "f"), data));
            }
            return this.parsedPromise;
        }
        then(onfulfilled, onrejected) {
            return this.parse().then(onfulfilled, onrejected);
        }
        catch(onrejected) {
            return this.parse().catch(onrejected);
        }
        finally(onfinally) {
            return this.parse().finally(onfinally);
        }
    }
    _APIPromise_client = new WeakMap();
    return APIPromise;
})();

var _AbstractPage_client;
var AbstractPage = /* @__PURE__ */ (() => {
    class AbstractPage {
        constructor(client, response, body, options) {
            _AbstractPage_client.set(this, void 0);
            __classPrivateFieldSet(this, _AbstractPage_client, client);
            this.options = options;
            this.response = response;
            this.body = body;
        }
        hasNextPage() {
            const items = this.getPaginatedItems();
            if (!items.length)
                return false;
            return this.nextPageRequestOptions() != null;
        }
        async getNextPage() {
            const nextOptions = this.nextPageRequestOptions();
            if (!nextOptions) {
                throw new AnthropicError('No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.');
            }
            return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
        }
        async *iterPages() {
            let page = this;
            yield page;
            while (page.hasNextPage()) {
                page = await page.getNextPage();
                yield page;
            }
        }
        async *[(_AbstractPage_client = new WeakMap(), Symbol.asyncIterator)]() {
            for await (const page of this.iterPages()) {
                for (const item of page.getPaginatedItems()) {
                    yield item;
                }
            }
        }
    }
    return AbstractPage;
})();
/**
 * This subclass of Promise will resolve to an instantiated Page once the request completes.
 *
 * It also implements AsyncIterable to allow auto-paginating iteration on an unawaited list call, eg:
 *
 *    for await (const item of client.items.list()) {
 *      console.log(item)
 *    }
 */
var PagePromise = /* @__PURE__ */ (() => {
    /**
     * This subclass of Promise will resolve to an instantiated Page once the request completes.
     *
     * It also implements AsyncIterable to allow auto-paginating iteration on an unawaited list call, eg:
     *
     *    for await (const item of client.items.list()) {
     *      console.log(item)
     *    }
     */
    class PagePromise extends APIPromise {
        constructor(client, request, Page) {
            super(client, request, async (client, props) => new Page(client, props.response, await defaultParseResponse(client, props), props.options));
        }
        /**
         * Allow auto-paginating iteration on an unawaited list call, eg:
         *
         *    for await (const item of client.items.list()) {
         *      console.log(item)
         *    }
         */
        async *[Symbol.asyncIterator]() {
            const page = await this;
            for await (const item of page) {
                yield item;
            }
        }
    }
    return PagePromise;
})();
class Page extends AbstractPage {
    constructor(client, response, body, options) {
        super(client, response, body, options);
        this.data = body.data || [];
        this.has_more = body.has_more || false;
        this.first_id = body.first_id || null;
        this.last_id = body.last_id || null;
    }
    getPaginatedItems() {
        return this.data ?? [];
    }
    hasNextPage() {
        if (this.has_more === false) {
            return false;
        }
        return super.hasNextPage();
    }
    nextPageRequestOptions() {
        if (this.options.query?.['before_id']) {
            // in reverse
            const first_id = this.first_id;
            if (!first_id) {
                return null;
            }
            return {
                ...this.options,
                query: {
                    ...maybeObj(this.options.query),
                    before_id: first_id,
                },
            };
        }
        const cursor = this.last_id;
        if (!cursor) {
            return null;
        }
        return {
            ...this.options,
            query: {
                ...maybeObj(this.options.query),
                after_id: cursor,
            },
        };
    }
}
class PageCursor extends AbstractPage {
    constructor(client, response, body, options) {
        super(client, response, body, options);
        this.data = body.data || [];
        this.next_page = body.next_page || null;
    }
    getPaginatedItems() {
        return this.data ?? [];
    }
    hasNextPage() {
        return this.nextPageRequestOptions() != null;
    }
    nextPageRequestOptions() {
        const cursor = this.next_page;
        if (!cursor) {
            return null;
        }
        return {
            ...this.options,
            query: {
                ...maybeObj(this.options.query),
                page: cursor,
            },
        };
    }
}
class BidirectionalPageCursor extends AbstractPage {
    constructor(client, response, body, options) {
        super(client, response, body, options);
        this.data = body.data || [];
        this.next_page = body.next_page || null;
        this.prev_page = body.prev_page || null;
    }
    getPaginatedItems() {
        return this.data ?? [];
    }
    hasNextPage() {
        return this.nextPageRequestOptions() != null;
    }
    nextPageRequestOptions() {
        const cursor = this.next_page;
        if (!cursor) {
            return null;
        }
        return {
            ...this.options,
            query: {
                ...maybeObj(this.options.query),
                page: cursor,
            },
        };
    }
}

const checkFileSupport = () => {
    if (typeof File === 'undefined') {
        const { process } = globalThis;
        const isOldNode = typeof process?.versions?.node === 'string' && parseInt(process.versions.node.split('.')) < 20;
        throw new Error('`File` is not defined as a global, which is required for file uploads.' +
            (isOldNode ?
                " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`."
                : ''));
    }
};
/**
 * Construct a `File` instance. This is used to ensure a helpful error is thrown
 * for environments that don't define a global `File` yet.
 */
function makeFile(fileBits, fileName, options) {
    checkFileSupport();
    return new File(fileBits, fileName ?? '', options);
}
function getName(value, stripPath) {
    const val = (typeof value === 'object' &&
        value !== null &&
        (('name' in value && value.name && String(value.name)) ||
            ('url' in value && value.url && String(value.url)) ||
            ('filename' in value && value.filename && String(value.filename)) ||
            ('path' in value && value.path && String(value.path)))) ||
        '';
    return stripPath ? val.split(/[\\/]/).pop() || undefined : val;
}
const isAsyncIterable = (value) => value != null && typeof value === 'object' && typeof value[Symbol.asyncIterator] === 'function';
const multipartFormRequestOptions = async (opts, fetch, stripFilenames = true) => {
    return { ...opts, body: await createForm(opts.body, fetch, stripFilenames) };
};
const supportsFormDataMap = /* @__PURE__ */ new WeakMap();
/**
 * node-fetch doesn't support the global FormData object in recent node versions. Instead of sending
 * properly-encoded form data, it just stringifies the object, resulting in a request body of "[object FormData]".
 * This function detects if the fetch function provided supports the global FormData object to avoid
 * confusing error messages later on.
 */
function supportsFormData(fetchObject) {
    const fetch = typeof fetchObject === 'function' ? fetchObject : fetchObject.fetch;
    const cached = supportsFormDataMap.get(fetch);
    if (cached)
        return cached;
    const promise = (async () => {
        try {
            const FetchResponse = ('Response' in fetch ?
                fetch.Response
                : (await fetch('data:,')).constructor);
            const data = new FormData();
            if (data.toString() === (await new FetchResponse(data).text())) {
                return false;
            }
            return true;
        }
        catch {
            // avoid false negatives
            return true;
        }
    })();
    supportsFormDataMap.set(fetch, promise);
    return promise;
}
const createForm = async (body, fetch, stripFilenames = true) => {
    if (!(await supportsFormData(fetch))) {
        throw new TypeError('The provided fetch function does not support file uploads with the current global FormData class.');
    }
    const form = new FormData();
    await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value, stripFilenames)));
    return form;
};
const addFormValue = async (form, key, value, stripFilenames) => {
    if (value === undefined)
        return;
    if (value == null) {
        throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
    }
    // TODO: make nested formats configurable
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        form.append(key, String(value));
    }
    else if (value instanceof Response) {
        let options = {};
        const contentType = value.headers.get('Content-Type');
        if (contentType) {
            options = { type: contentType };
        }
        form.append(key, makeFile([await value.blob()], getName(value, stripFilenames), options));
    }
    else if (isAsyncIterable(value)) {
        form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value, stripFilenames)));
    }
    else if (value instanceof Blob) {
        // A File's name is one the caller chose, so it is sent as is; any other Blob's name is a path.
        const isFile = typeof File !== 'undefined' && value instanceof File;
        const name = isFile ? value.name : getName(value, stripFilenames);
        form.append(key, makeFile([value], name, { type: value.type }));
    }
    else if (Array.isArray(value)) {
        await Promise.all(value.map((entry) => addFormValue(form, key + '[]', entry, stripFilenames)));
    }
    else if (typeof value.then === 'function') {
        throw new TypeError(`Received a Promise for "${key}"; await it first, e.g. \`await toFile(...)\``);
    }
    else if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
        throw new TypeError(`Received ${value.constructor.name} for "${key}"; to upload raw bytes, wrap them with \`await toFile(bytes, 'filename')\``);
    }
    else if (typeof value === 'object') {
        await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop, stripFilenames)));
    }
    else {
        throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
    }
};

/**
 * This check adds the arrayBuffer() method type because it is available and used at runtime
 */
const isBlobLike = (value) => value != null &&
    typeof value === 'object' &&
    typeof value.size === 'number' &&
    typeof value.type === 'string' &&
    typeof value.text === 'function' &&
    typeof value.slice === 'function' &&
    typeof value.arrayBuffer === 'function';
/**
 * This check adds the arrayBuffer() method type because it is available and used at runtime
 */
const isFileLike = (value) => value != null &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    typeof value.lastModified === 'number' &&
    isBlobLike(value);
const isResponseLike = (value) => value != null &&
    typeof value === 'object' &&
    typeof value.url === 'string' &&
    typeof value.blob === 'function';
/**
 * Helper for creating a {@link File} to pass to an SDK upload method from a variety of different data formats
 * @param value the raw content of the file. Can be an {@link Uploadable}, BlobLikePart, or AsyncIterable of BlobLikeParts
 * @param {string=} name the name of the file. If omitted, toFile will try to determine a file name from bits if possible
 * @param {Object=} options additional properties
 * @param {string=} options.type the MIME type of the content
 * @param {number=} options.lastModified the last modified timestamp
 * @returns a {@link File} with the given properties
 */
async function toFile(value, name, options) {
    checkFileSupport();
    // If it's a promise, resolve it.
    value = await value;
    name || (name = value instanceof File ? value.name : getName(value, true));
    // If we've been given a `File` we don't need to do anything if the name / options
    // have not been customised.
    if (isFileLike(value)) {
        if (value instanceof File && name == null && options == null) {
            return value;
        }
        return makeFile([await value.arrayBuffer()], name ?? value.name, {
            type: value.type,
            lastModified: value.lastModified,
            ...options,
        });
    }
    if (isResponseLike(value)) {
        const blob = await value.blob();
        name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
        return makeFile(await getBytes(blob), name, options);
    }
    const parts = await getBytes(value);
    if (!options?.type) {
        const type = parts.find((part) => typeof part === 'object' && 'type' in part && part.type);
        if (typeof type === 'string') {
            options = { ...options, type };
        }
    }
    return makeFile(parts, name, options);
}
async function getBytes(value) {
    let parts = [];
    if (typeof value === 'string' ||
        ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
        value instanceof ArrayBuffer) {
        parts.push(value);
    }
    else if (isBlobLike(value)) {
        parts.push(value instanceof Blob ? value : await value.arrayBuffer());
    }
    else if (isAsyncIterable(value) // includes Readable, ReadableStream, etc.
    ) {
        for await (const chunk of value) {
            parts.push(...(await getBytes(chunk))); // TODO, consider validating?
        }
    }
    else {
        const constructor = value?.constructor?.name;
        throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ''}${propsForError(value)}`);
    }
    return parts;
}
function propsForError(value) {
    if (typeof value !== 'object' || value === null)
        return '';
    const props = Object.getOwnPropertyNames(value);
    return `; props: [${props.map((p) => `"${p}"`).join(', ')}]`;
}

class APIResource {
    constructor(client) {
        this._client = client;
    }
}

const brand_privateNullableHeaders = Symbol.for('brand.privateNullableHeaders');
function* iterateHeaders(headers) {
    if (!headers)
        return;
    if (brand_privateNullableHeaders in headers) {
        const { values, nulls } = headers;
        yield* values.entries();
        for (const name of nulls) {
            yield [name, null];
        }
        return;
    }
    let shouldClear = false;
    let iter;
    if (headers instanceof Headers) {
        iter = headers.entries();
    }
    else if (isReadonlyArray(headers)) {
        iter = headers;
    }
    else {
        shouldClear = true;
        iter = Object.entries(headers ?? {});
    }
    for (let row of iter) {
        const name = row[0];
        if (typeof name !== 'string')
            throw new TypeError('expected header name to be a string');
        const values = isReadonlyArray(row[1]) ? row[1] : [row[1]];
        let didClear = false;
        for (const value of values) {
            if (value === undefined)
                continue;
            // Objects keys always overwrite older headers, they never append.
            // Yield the clear sentinel before adding the new values, so the
            // consumer can tell this synthetic "clear-before-set" apart from a
            // user's explicit `null` (= remove).
            if (shouldClear && !didClear) {
                didClear = true;
                yield [name, clearSentinel];
            }
            yield [name, value];
        }
    }
}
/** Distinguishes iterateHeaders' synthetic clear-before-set from a user `null`. */
const clearSentinel = Symbol('clear');
/**
 * Headers whose values accumulate across {@link buildHeaders} sources instead
 * of the later source's value replacing the earlier one. Values are
 * comma-appended (deduplicated, order-preserving) into a single header line.
 */
const APPEND_HEADERS = new Set(['x-stainless-helper']);
const appendHeaderValue = (existing, addition) => {
    const tokens = existing ?
        existing
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
    for (const tok of addition.split(',').map((t) => t.trim())) {
        if (tok && !tokens.includes(tok))
            tokens.push(tok);
    }
    return tokens.join(', ');
};
const buildHeaders = (newHeaders) => {
    const targetHeaders = new Headers();
    const nullHeaders = new Set();
    for (const headers of newHeaders) {
        const seenHeaders = new Set();
        for (const [name, value] of iterateHeaders(headers)) {
            const lowerName = name.toLowerCase();
            if (APPEND_HEADERS.has(lowerName)) {
                // Accumulating headers ignore the synthetic clear-before-set; an
                // explicit `null` (any source shape) is honored as removal.
                if (value === clearSentinel)
                    continue;
                if (value === null) {
                    targetHeaders.delete(name);
                    nullHeaders.add(lowerName);
                }
                else {
                    targetHeaders.set(name, appendHeaderValue(targetHeaders.get(name), value));
                    nullHeaders.delete(lowerName);
                }
                continue;
            }
            if (value === clearSentinel || !seenHeaders.has(lowerName)) {
                targetHeaders.delete(name);
                seenHeaders.add(lowerName);
                if (value === clearSentinel)
                    continue;
            }
            if (value === null) {
                targetHeaders.delete(name);
                nullHeaders.add(lowerName);
            }
            else {
                targetHeaders.append(name, value);
                nullHeaders.delete(lowerName);
            }
        }
    }
    return { [brand_privateNullableHeaders]: true, values: targetHeaders, nulls: nullHeaders };
};

/**
 * Single source of truth for the `x-stainless-helper` telemetry header — the
 * key, the closed value vocabulary, and per-object helper tagging. The
 * append-don't-clobber merge for the header itself lives in
 * {@link import('../internal/headers').buildHeaders} via `APPEND_HEADERS`.
 */
/**
 * Telemetry header naming the SDK helper(s) a request came from. Always this
 * lowercase form; `buildHeaders` matches it case-insensitively for its append
 * semantics, but a single canonical casing keeps every call site greppable.
 */
const STAINLESS_HELPER_HEADER = 'x-stainless-helper';
/** Telemetry header naming the SDK method (e.g. `stream`) in use. */
const STAINLESS_HELPER_METHOD_HEADER = 'x-stainless-helper-method';
/**
 * The `{ 'x-stainless-helper': value }` header dict, for passing into
 * `buildHeaders` (which comma-appends `x-stainless-helper` across sources)
 * or as `defaultHeaders`/per-request `headers`.
 */
function helperHeader(value) {
    return { [STAINLESS_HELPER_HEADER]: value };
}
/**
 * Symbol used to mark objects created by SDK helpers for tracking.
 * The value is the helper name (e.g., 'mcpTool', 'betaZodTool').
 */
const SDK_HELPER_SYMBOL = Symbol('anthropic.sdk.stainlessHelper');
function wasCreatedByStainlessHelper(value) {
    return typeof value === 'object' && value !== null && SDK_HELPER_SYMBOL in value;
}
/**
 * Collects helper names from tools and messages arrays, including tools that a
 * `tool_addition` block in a message defines by value.
 * Returns a deduplicated array of helper names found.
 */
function collectStainlessHelpers(tools, messages) {
    const helpers = new Set();
    // Collect from tools
    if (tools) {
        for (const tool of tools) {
            if (wasCreatedByStainlessHelper(tool)) {
                helpers.add(tool[SDK_HELPER_SYMBOL]);
            }
        }
    }
    // Collect from messages and their content blocks
    if (messages) {
        for (const message of messages) {
            if (wasCreatedByStainlessHelper(message)) {
                helpers.add(message[SDK_HELPER_SYMBOL]);
            }
            const content = message.content;
            if (Array.isArray(content)) {
                for (const block of content) {
                    if (wasCreatedByStainlessHelper(block)) {
                        helpers.add(block[SDK_HELPER_SYMBOL]);
                    }
                    const definition = block?.tool?.definition;
                    if (wasCreatedByStainlessHelper(definition)) {
                        helpers.add(definition[SDK_HELPER_SYMBOL]);
                    }
                }
            }
        }
    }
    return Array.from(helpers);
}
/**
 * Builds x-stainless-helper header value from tools and messages.
 * Returns an empty object if no helpers are found.
 */
function stainlessHelperHeader(tools, messages) {
    const helpers = collectStainlessHelpers(tools, messages);
    if (helpers.length === 0)
        return {};
    return { [STAINLESS_HELPER_HEADER]: helpers.join(', ') };
}
/**
 * Builds x-stainless-helper header value from a file object.
 * Returns an empty object if the file is not marked with a helper.
 */
function stainlessHelperHeaderFromFile(file) {
    if (wasCreatedByStainlessHelper(file)) {
        return { [STAINLESS_HELPER_HEADER]: file[SDK_HELPER_SYMBOL] };
    }
    return {};
}

function getOutputFormat$1(params) {
    return params?.output_config?.format;
}
function maybeParseMessage(message, params, opts) {
    const outputFormat = getOutputFormat$1(params);
    if (!params || !('parse' in (outputFormat ?? {}))) {
        return {
            ...message,
            content: message.content.map((block) => {
                if (block.type === 'text') {
                    const parsedBlock = Object.defineProperty({ ...block }, 'parsed_output', {
                        value: null,
                        enumerable: false,
                    });
                    return parsedBlock;
                }
                return block;
            }),
            parsed_output: null,
        };
    }
    return parseMessage(message, params);
}
function parseMessage(message, params, opts) {
    let firstParsedOutput = null;
    const content = message.content.map((block) => {
        if (block.type === 'text') {
            const parsedOutput = parseOutputFormat(params, block.text);
            if (firstParsedOutput === null) {
                firstParsedOutput = parsedOutput;
            }
            const parsedBlock = Object.defineProperty({ ...block }, 'parsed_output', {
                value: parsedOutput,
                enumerable: false,
            });
            return parsedBlock;
        }
        return block;
    });
    return {
        ...message,
        content,
        parsed_output: firstParsedOutput,
    };
}
function parseOutputFormat(params, content) {
    const outputFormat = getOutputFormat$1(params);
    if (outputFormat?.type !== 'json_schema') {
        return null;
    }
    try {
        if ('parse' in outputFormat) {
            return outputFormat.parse(content);
        }
        return JSON.parse(content);
    }
    catch (error) {
        throw new AnthropicError(`Failed to parse structured output: ${error}`);
    }
}

const tokenize = (input) => {
    let current = 0;
    let tokens = [];
    while (current < input.length) {
        let char = input[current];
        if (char === '\\') {
            current++;
            continue;
        }
        if (char === '{') {
            tokens.push({
                type: 'brace',
                value: '{',
            });
            current++;
            continue;
        }
        if (char === '}') {
            tokens.push({
                type: 'brace',
                value: '}',
            });
            current++;
            continue;
        }
        if (char === '[') {
            tokens.push({
                type: 'paren',
                value: '[',
            });
            current++;
            continue;
        }
        if (char === ']') {
            tokens.push({
                type: 'paren',
                value: ']',
            });
            current++;
            continue;
        }
        if (char === ':') {
            tokens.push({
                type: 'separator',
                value: ':',
            });
            current++;
            continue;
        }
        if (char === ',') {
            tokens.push({
                type: 'delimiter',
                value: ',',
            });
            current++;
            continue;
        }
        if (char === '"') {
            // a `"` closes the string only after an even number of backslashes; escapes are kept verbatim
            const start = current + 1;
            let end = start;
            let danglingQuote = false;
            while (true) {
                end = input.indexOf('"', end);
                if (end === -1) {
                    danglingQuote = true;
                    break;
                }
                let backslashes = 0;
                let i = end - 1;
                while (i >= start && input[i] === '\\') {
                    backslashes++;
                    i--;
                }
                if (backslashes % 2 === 0)
                    break;
                end++;
            }
            if (danglingQuote) {
                current = input.length;
            }
            else {
                tokens.push({
                    type: 'string',
                    value: input.slice(start, end),
                });
                current = end + 1;
            }
            continue;
        }
        let WHITESPACE = /\s/;
        if (char && WHITESPACE.test(char)) {
            current++;
            continue;
        }
        let NUMBERS = /[0-9]/;
        if ((char && NUMBERS.test(char)) || char === '-' || char === '.') {
            let value = '';
            if (char === '-') {
                value += char;
                char = input[++current];
            }
            while (char &&
                (NUMBERS.test(char) ||
                    char === '.' ||
                    // exponent marker, e.g. `1e10` or `1.5E-9`
                    char === 'e' ||
                    char === 'E' ||
                    // exponent sign, only valid immediately after the exponent marker
                    ((char === '-' || char === '+') &&
                        (value[value.length - 1] === 'e' || value[value.length - 1] === 'E')))) {
                value += char;
                char = input[++current];
            }
            tokens.push({
                type: 'number',
                value,
                unterminated: current === input.length,
            });
            continue;
        }
        let LETTERS = /[a-z]/i;
        if (char && LETTERS.test(char)) {
            let value = '';
            while (char && LETTERS.test(char)) {
                if (current === input.length) {
                    break;
                }
                value += char;
                char = input[++current];
            }
            if (value == 'true' || value == 'false' || value === 'null') {
                tokens.push({
                    type: 'name',
                    value,
                });
            }
            else {
                // unknown token, e.g. `nul` which isn't quite `null`
                current++;
                continue;
            }
            continue;
        }
        current++;
    }
    return tokens;
}, strip = (tokens) => {
    let open = [];
    for (const token of tokens) {
        if (token.type === 'brace' || token.type === 'paren') {
            if (token.value === '{' || token.value === '[') {
                open.push(token.value);
            }
            else {
                open.pop();
            }
        }
    }
    // brackets are never stripped, so this holds for every token looked at below
    let innermostOpenBracket = open[open.length - 1];
    let length = tokens.length;
    let JSON_NUMBER = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][-+]?[0-9]+)?$/;
    while (length > 0) {
        let lastToken = tokens[length - 1];
        switch (lastToken.type) {
            case 'separator':
                length--;
                continue;
            case 'number':
                // more digits may follow a number that runs to the end of the input, and one that
                // something else cuts short, e.g. `1.` or `1e-`, will never be a number
                if (lastToken.unterminated || !JSON_NUMBER.test(lastToken.value)) {
                    length--;
                    continue;
                }
                break;
            case 'string':
                // in an object this is a key without a value yet, in an array it is a complete item
                let tokenBeforeTheLastToken = tokens[length - 2];
                if (innermostOpenBracket === '{' &&
                    (tokenBeforeTheLastToken?.type === 'delimiter' ||
                        (tokenBeforeTheLastToken?.type === 'brace' && tokenBeforeTheLastToken.value === '{'))) {
                    length--;
                    continue;
                }
                break;
            case 'delimiter':
                // whatever precedes a comma is complete
                length--;
                break;
        }
        break;
    }
    return tokens.slice(0, length);
}, unstrip = (tokens) => {
    let tail = [];
    tokens.map((token) => {
        if (token.type === 'brace') {
            if (token.value === '{') {
                tail.push('}');
            }
            else {
                tail.splice(tail.lastIndexOf('}'), 1);
            }
        }
        if (token.type === 'paren') {
            if (token.value === '[') {
                tail.push(']');
            }
            else {
                tail.splice(tail.lastIndexOf(']'), 1);
            }
        }
    });
    if (tail.length > 0) {
        tail.reverse().map((item) => {
            if (item === '}') {
                tokens.push({
                    type: 'brace',
                    value: '}',
                });
            }
            else if (item === ']') {
                tokens.push({
                    type: 'paren',
                    value: ']',
                });
            }
        });
    }
    return tokens;
}, generate = (tokens) => {
    let output = '';
    tokens.map((token) => {
        switch (token.type) {
            case 'string':
                output += '"' + token.value + '"';
                break;
            default:
                output += token.value;
                break;
        }
    });
    return output;
}, partialParse = (input) => JSON.parse(generate(unstrip(strip(tokenize(input)))));

const JSON_BUF_PROPERTY = '__json_buf';
/**
 * Copies a tool-use block with an updated `__json_buf`, installing `.input` as
 * a memoized getter so the partial-JSON parse happens on first read instead of
 * on every delta.
 */
function withLazyInput(prev, jsonBuf) {
    const next = {};
    for (const key of Object.keys(prev)) {
        if (key !== 'input')
            next[key] = prev[key];
    }
    Object.defineProperty(next, JSON_BUF_PROPERTY, { value: jsonBuf, enumerable: false, writable: true });
    let input;
    let parsed = false;
    Object.defineProperty(next, 'input', {
        enumerable: true,
        configurable: true,
        get() {
            if (!parsed) {
                input = jsonBuf ? partialParse(jsonBuf) : {};
                parsed = true;
            }
            return input;
        },
    });
    return next;
}

var _MessageStream_instances, _MessageStream_currentMessageSnapshot, _MessageStream_params, _MessageStream_connectedPromise, _MessageStream_resolveConnectedPromise, _MessageStream_rejectConnectedPromise, _MessageStream_endPromise, _MessageStream_resolveEndPromise, _MessageStream_rejectEndPromise, _MessageStream_listeners, _MessageStream_ended, _MessageStream_errored, _MessageStream_aborted, _MessageStream_catchingPromiseCreated, _MessageStream_response, _MessageStream_request_id, _MessageStream_workspace_id, _MessageStream_logger, _MessageStream_getFinalMessage, _MessageStream_getFinalText, _MessageStream_handleError, _MessageStream_beginRequest, _MessageStream_addStreamEvent, _MessageStream_endRequest, _MessageStream_accumulateMessage;
function tracksToolInput$1(content) {
    return content.type === 'tool_use' || content.type === 'server_tool_use';
}
var MessageStream = /* @__PURE__ */ (() => {
    class MessageStream {
        constructor(params, opts) {
            _MessageStream_instances.add(this);
            this.messages = [];
            this.receivedMessages = [];
            _MessageStream_currentMessageSnapshot.set(this, void 0);
            _MessageStream_params.set(this, null);
            this.controller = new AbortController();
            _MessageStream_connectedPromise.set(this, void 0);
            _MessageStream_resolveConnectedPromise.set(this, () => { });
            _MessageStream_rejectConnectedPromise.set(this, () => { });
            _MessageStream_endPromise.set(this, void 0);
            _MessageStream_resolveEndPromise.set(this, () => { });
            _MessageStream_rejectEndPromise.set(this, () => { });
            _MessageStream_listeners.set(this, {});
            _MessageStream_ended.set(this, false);
            _MessageStream_errored.set(this, false);
            _MessageStream_aborted.set(this, false);
            _MessageStream_catchingPromiseCreated.set(this, false);
            _MessageStream_response.set(this, void 0);
            _MessageStream_request_id.set(this, void 0);
            _MessageStream_workspace_id.set(this, void 0);
            _MessageStream_logger.set(this, void 0);
            _MessageStream_handleError.set(this, (error) => {
                __classPrivateFieldSet(this, _MessageStream_errored, true);
                if (isAbortError(error)) {
                    error = new APIUserAbortError();
                }
                if (error instanceof APIUserAbortError) {
                    __classPrivateFieldSet(this, _MessageStream_aborted, true);
                    return this._emit('abort', error);
                }
                if (error instanceof AnthropicError) {
                    return this._emit('error', error);
                }
                if (error instanceof Error) {
                    const anthropicError = new AnthropicError(error.message);
                    // @ts-ignore
                    anthropicError.cause = error;
                    return this._emit('error', anthropicError);
                }
                return this._emit('error', new AnthropicError(String(error)));
            });
            __classPrivateFieldSet(this, _MessageStream_connectedPromise, new Promise((resolve, reject) => {
                __classPrivateFieldSet(this, _MessageStream_resolveConnectedPromise, resolve, "f");
                __classPrivateFieldSet(this, _MessageStream_rejectConnectedPromise, reject, "f");
            }));
            __classPrivateFieldSet(this, _MessageStream_endPromise, new Promise((resolve, reject) => {
                __classPrivateFieldSet(this, _MessageStream_resolveEndPromise, resolve, "f");
                __classPrivateFieldSet(this, _MessageStream_rejectEndPromise, reject, "f");
            }));
            // Don't let these promises cause unhandled rejection errors.
            // we will manually cause an unhandled rejection error later
            // if the user hasn't registered any error listener or called
            // any promise-returning method.
            __classPrivateFieldGet(this, _MessageStream_connectedPromise, "f").catch(() => { });
            __classPrivateFieldGet(this, _MessageStream_endPromise, "f").catch(() => { });
            __classPrivateFieldSet(this, _MessageStream_params, params);
            __classPrivateFieldSet(this, _MessageStream_logger, opts?.logger ?? console);
        }
        get response() {
            return __classPrivateFieldGet(this, _MessageStream_response, "f");
        }
        get request_id() {
            return __classPrivateFieldGet(this, _MessageStream_request_id, "f");
        }
        get workspace_id() {
            return __classPrivateFieldGet(this, _MessageStream_workspace_id, "f");
        }
        /**
         * Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
         * returned vie the `request-id` header which is useful for debugging requests and resporting
         * issues to Anthropic.
         *
         * This is the same as the `APIPromise.withResponse()` method.
         *
         * This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
         * as no `Response` is available.
         */
        async withResponse() {
            __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true);
            const response = await __classPrivateFieldGet(this, _MessageStream_connectedPromise, "f");
            if (!response) {
                throw new Error('Could not resolve a `Response` object');
            }
            return {
                data: this,
                response,
                request_id: response.headers.get('request-id'),
                workspace_id: response.headers.get('anthropic-workspace-id'),
            };
        }
        /**
         * Intended for use on the frontend, consuming a stream produced with
         * `.toReadableStream()` on the backend.
         *
         * Note that messages sent to the model do not appear in `.on('message')`
         * in this context.
         */
        static fromReadableStream(stream) {
            const runner = new MessageStream(null);
            runner._run(() => runner._fromReadableStream(stream));
            return runner;
        }
        static createMessage(messages, params, options, { logger } = {}) {
            const runner = new MessageStream(params, { logger });
            for (const message of params.messages) {
                runner._addMessageParam(message);
            }
            __classPrivateFieldSet(runner, _MessageStream_params, { ...params, stream: true });
            runner._run(() => runner._createMessage(messages, { ...params, stream: true }, { ...options, headers: { ...options?.headers, [STAINLESS_HELPER_METHOD_HEADER]: 'stream' } }));
            return runner;
        }
        _run(executor) {
            executor().then(() => {
                this._emitFinal();
                this._emit('end');
            }, __classPrivateFieldGet(this, _MessageStream_handleError, "f"));
        }
        _addMessageParam(message) {
            this.messages.push(message);
        }
        _addMessage(message, emit = true) {
            this.receivedMessages.push(message);
            if (emit) {
                this._emit('message', message);
            }
        }
        async _createMessage(messages, params, options) {
            const signal = options?.signal;
            let abortHandler;
            if (signal) {
                if (signal.aborted)
                    this.controller.abort();
                abortHandler = this.controller.abort.bind(this.controller);
                signal.addEventListener('abort', abortHandler);
            }
            try {
                __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
                const { response, data: stream } = await messages
                    .create({ ...params, stream: true }, { ...options, signal: this.controller.signal })
                    .withResponse();
                this._connected(response);
                for await (const event of stream) {
                    __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
                }
                if (stream.controller.signal?.aborted) {
                    throw new APIUserAbortError();
                }
                __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
            }
            finally {
                if (signal && abortHandler) {
                    signal.removeEventListener('abort', abortHandler);
                }
            }
        }
        _connected(response) {
            if (this.ended)
                return;
            __classPrivateFieldSet(this, _MessageStream_response, response);
            __classPrivateFieldSet(this, _MessageStream_request_id, response?.headers.get('request-id'));
            __classPrivateFieldSet(this, _MessageStream_workspace_id, response?.headers.get('anthropic-workspace-id'));
            __classPrivateFieldGet(this, _MessageStream_resolveConnectedPromise, "f").call(this, response);
            this._emit('connect');
        }
        get ended() {
            return __classPrivateFieldGet(this, _MessageStream_ended, "f");
        }
        get errored() {
            return __classPrivateFieldGet(this, _MessageStream_errored, "f");
        }
        get aborted() {
            return __classPrivateFieldGet(this, _MessageStream_aborted, "f");
        }
        abort() {
            this.controller.abort();
        }
        /**
         * Adds the listener function to the end of the listeners array for the event.
         * No checks are made to see if the listener has already been added. Multiple calls passing
         * the same combination of event and listener will result in the listener being added, and
         * called, multiple times.
         * @returns this MessageStream, so that calls can be chained
         */
        on(event, listener) {
            const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = []);
            listeners.push({ listener });
            return this;
        }
        /**
         * Removes the specified listener from the listener array for the event.
         * off() will remove, at most, one instance of a listener from the listener array. If any single
         * listener has been added multiple times to the listener array for the specified event, then
         * off() must be called multiple times to remove each instance.
         * @returns this MessageStream, so that calls can be chained
         */
        off(event, listener) {
            const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event];
            if (!listeners)
                return this;
            const index = listeners.findIndex((l) => l.listener === listener);
            if (index >= 0)
                listeners.splice(index, 1);
            return this;
        }
        /**
         * Adds a one-time listener function for the event. The next time the event is triggered,
         * this listener is removed and then invoked.
         * @returns this MessageStream, so that calls can be chained
         */
        once(event, listener) {
            const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = []);
            listeners.push({ listener, once: true });
            return this;
        }
        /**
         * This is similar to `.once()`, but returns a Promise that resolves the next time
         * the event is triggered, instead of calling a listener callback.
         * @returns a Promise that resolves the next time given event is triggered,
         * or rejects if an error is emitted.  (If you request the 'error' event,
         * returns a promise that resolves with the error).
         *
         * Example:
         *
         *   const message = await stream.emitted('message') // rejects if the stream errors
         */
        emitted(event) {
            return new Promise((resolve, reject) => {
                __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true);
                if (event !== 'error')
                    this.once('error', reject);
                this.once(event, resolve);
            });
        }
        async done() {
            __classPrivateFieldSet(this, _MessageStream_catchingPromiseCreated, true);
            await __classPrivateFieldGet(this, _MessageStream_endPromise, "f");
        }
        get currentMessage() {
            return __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
        }
        /**
         * @returns a promise that resolves with the the final assistant Message response,
         * or rejects if an error occurred or the stream ended prematurely without producing a Message.
         * If structured outputs were used, this will be a ParsedMessage with a `parsed_output` field.
         */
        async finalMessage() {
            await this.done();
            return __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this);
        }
        /**
         * @returns a promise that resolves with the the final assistant Message's text response, concatenated
         * together if there are more than one text blocks.
         * Rejects if an error occurred or the stream ended prematurely without producing a Message.
         */
        async finalText() {
            await this.done();
            return __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalText).call(this);
        }
        _emit(event, ...args) {
            // make sure we don't emit any MessageStreamEvents after end
            if (__classPrivateFieldGet(this, _MessageStream_ended, "f"))
                return;
            if (event === 'end') {
                __classPrivateFieldSet(this, _MessageStream_ended, true);
                __classPrivateFieldGet(this, _MessageStream_resolveEndPromise, "f").call(this);
            }
            const listeners = __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event];
            if (listeners) {
                __classPrivateFieldGet(this, _MessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
                listeners.forEach(({ listener }) => listener(...args));
            }
            if (event === 'abort') {
                const error = args[0];
                if (!__classPrivateFieldGet(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                    Promise.reject(error);
                }
                __classPrivateFieldGet(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
                __classPrivateFieldGet(this, _MessageStream_rejectEndPromise, "f").call(this, error);
                this._emit('end');
                return;
            }
            if (event === 'error') {
                // NOTE: _emit('error', error) should only be called from #handleError().
                const error = args[0];
                if (!__classPrivateFieldGet(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                    // Trigger an unhandled rejection if the user hasn't registered any error handlers.
                    // If you are seeing stack traces here, make sure to handle errors via either:
                    // - runner.on('error', () => ...)
                    // - await runner.done()
                    // - await runner.final...()
                    // - etc.
                    Promise.reject(error);
                }
                __classPrivateFieldGet(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
                __classPrivateFieldGet(this, _MessageStream_rejectEndPromise, "f").call(this, error);
                this._emit('end');
            }
        }
        _emitFinal() {
            const finalMessage = this.receivedMessages.at(-1);
            if (finalMessage) {
                this._emit('finalMessage', __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this));
            }
        }
        async _fromReadableStream(readableStream, options) {
            const signal = options?.signal;
            let abortHandler;
            if (signal) {
                if (signal.aborted)
                    this.controller.abort();
                abortHandler = this.controller.abort.bind(this.controller);
                signal.addEventListener('abort', abortHandler);
            }
            try {
                __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
                this._connected(null);
                const stream = Stream.fromReadableStream(readableStream, this.controller);
                for await (const event of stream) {
                    __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
                }
                if (stream.controller.signal?.aborted) {
                    throw new APIUserAbortError();
                }
                __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
            }
            finally {
                if (signal && abortHandler) {
                    signal.removeEventListener('abort', abortHandler);
                }
            }
        }
        [(_MessageStream_currentMessageSnapshot = new WeakMap(), _MessageStream_params = new WeakMap(), _MessageStream_connectedPromise = new WeakMap(), _MessageStream_resolveConnectedPromise = new WeakMap(), _MessageStream_rejectConnectedPromise = new WeakMap(), _MessageStream_endPromise = new WeakMap(), _MessageStream_resolveEndPromise = new WeakMap(), _MessageStream_rejectEndPromise = new WeakMap(), _MessageStream_listeners = new WeakMap(), _MessageStream_ended = new WeakMap(), _MessageStream_errored = new WeakMap(), _MessageStream_aborted = new WeakMap(), _MessageStream_catchingPromiseCreated = new WeakMap(), _MessageStream_response = new WeakMap(), _MessageStream_request_id = new WeakMap(), _MessageStream_workspace_id = new WeakMap(), _MessageStream_logger = new WeakMap(), _MessageStream_handleError = new WeakMap(), _MessageStream_instances = new WeakSet(), _MessageStream_getFinalMessage = function _MessageStream_getFinalMessage() {
            if (this.receivedMessages.length === 0) {
                throw new AnthropicError('stream ended without producing a Message with role=assistant');
            }
            return this.receivedMessages.at(-1);
        }, _MessageStream_getFinalText = function _MessageStream_getFinalText() {
            if (this.receivedMessages.length === 0) {
                throw new AnthropicError('stream ended without producing a Message with role=assistant');
            }
            const textBlocks = this.receivedMessages
                .at(-1)
                .content.filter((block) => block.type === 'text')
                .map((block) => block.text);
            if (textBlocks.length === 0) {
                throw new AnthropicError('stream ended without producing a content block with type=text');
            }
            return textBlocks.join(' ');
        }, _MessageStream_beginRequest = function _MessageStream_beginRequest() {
            if (this.ended)
                return;
            __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, undefined);
        }, _MessageStream_addStreamEvent = function _MessageStream_addStreamEvent(event) {
            if (this.ended)
                return;
            const messageSnapshot = __classPrivateFieldGet(this, _MessageStream_instances, "m", _MessageStream_accumulateMessage).call(this, event);
            this._emit('streamEvent', event, messageSnapshot);
            switch (event.type) {
                case 'content_block_delta': {
                    const content = messageSnapshot.content.at(-1);
                    switch (event.delta.type) {
                        case 'text_delta': {
                            if (content.type === 'text') {
                                this._emit('text', event.delta.text, content.text || '');
                            }
                            break;
                        }
                        case 'citations_delta': {
                            if (content.type === 'text') {
                                this._emit('citation', event.delta.citation, content.citations ?? []);
                            }
                            break;
                        }
                        case 'input_json_delta': {
                            if (tracksToolInput$1(content) && __classPrivateFieldGet(this, _MessageStream_listeners, "f").inputJson?.length) {
                                this._emit('inputJson', event.delta.partial_json, content.input);
                            }
                            break;
                        }
                        case 'thinking_delta': {
                            if (content.type === 'thinking') {
                                this._emit('thinking', event.delta.thinking, content.thinking);
                            }
                            break;
                        }
                        case 'signature_delta': {
                            if (content.type === 'thinking') {
                                this._emit('signature', content.signature);
                            }
                            break;
                        }
                        default:
                            checkNever(event.delta);
                    }
                    break;
                }
                case 'message_stop': {
                    this._addMessageParam(messageSnapshot);
                    this._addMessage(maybeParseMessage(messageSnapshot, __classPrivateFieldGet(this, _MessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _MessageStream_logger, "f") }), true);
                    break;
                }
                case 'content_block_stop': {
                    this._emit('contentBlock', messageSnapshot.content.at(-1));
                    break;
                }
                case 'message_start': {
                    __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, messageSnapshot);
                    break;
                }
            }
        }, _MessageStream_endRequest = function _MessageStream_endRequest() {
            if (this.ended) {
                throw new AnthropicError(`stream has ended, this shouldn't happen`);
            }
            const snapshot = __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
            if (!snapshot) {
                throw new AnthropicError(`request ended without sending any chunks`);
            }
            __classPrivateFieldSet(this, _MessageStream_currentMessageSnapshot, undefined);
            return maybeParseMessage(snapshot, __classPrivateFieldGet(this, _MessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _MessageStream_logger, "f") });
        }, _MessageStream_accumulateMessage = function _MessageStream_accumulateMessage(event) {
            let snapshot = __classPrivateFieldGet(this, _MessageStream_currentMessageSnapshot, "f");
            if (event.type === 'message_start') {
                if (snapshot) {
                    throw new AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
                }
                return event.message;
            }
            if (!snapshot) {
                throw new AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
            }
            switch (event.type) {
                case 'message_stop':
                    return snapshot;
                case 'message_delta':
                    snapshot.stop_reason = event.delta.stop_reason;
                    snapshot.stop_sequence = event.delta.stop_sequence;
                    snapshot.stop_details = event.delta.stop_details;
                    snapshot.usage.output_tokens = event.usage.output_tokens;
                    if (event.delta.container != null) {
                        snapshot.container = event.delta.container;
                    }
                    // The remaining usage counters are cumulative whole-message totals that are
                    // omitted when they don't apply, so overwrite when present and never add.
                    if (event.usage.input_tokens != null) {
                        snapshot.usage.input_tokens = event.usage.input_tokens;
                    }
                    if (event.usage.cache_creation_input_tokens != null) {
                        snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
                    }
                    if (event.usage.cache_read_input_tokens != null) {
                        snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
                    }
                    if (event.usage.server_tool_use != null) {
                        snapshot.usage.server_tool_use = event.usage.server_tool_use;
                    }
                    if (event.usage.output_tokens_details != null) {
                        snapshot.usage.output_tokens_details = event.usage.output_tokens_details;
                    }
                    return snapshot;
                case 'content_block_start':
                    snapshot.content.push({ ...event.content_block });
                    return snapshot;
                case 'content_block_delta': {
                    const snapshotContent = snapshot.content.at(event.index);
                    switch (event.delta.type) {
                        case 'text_delta': {
                            if (snapshotContent?.type === 'text') {
                                snapshot.content[event.index] = {
                                    ...snapshotContent,
                                    text: (snapshotContent.text || '') + event.delta.text,
                                };
                            }
                            break;
                        }
                        case 'citations_delta': {
                            if (snapshotContent?.type === 'text') {
                                snapshot.content[event.index] = {
                                    ...snapshotContent,
                                    citations: [...(snapshotContent.citations ?? []), event.delta.citation],
                                };
                            }
                            break;
                        }
                        case 'input_json_delta': {
                            if (snapshotContent && tracksToolInput$1(snapshotContent)) {
                                const jsonBuf = (snapshotContent[JSON_BUF_PROPERTY] || '') + event.delta.partial_json;
                                snapshot.content[event.index] = withLazyInput(snapshotContent, jsonBuf);
                            }
                            break;
                        }
                        case 'thinking_delta': {
                            if (snapshotContent?.type === 'thinking') {
                                snapshot.content[event.index] = {
                                    ...snapshotContent,
                                    thinking: snapshotContent.thinking + event.delta.thinking,
                                };
                            }
                            break;
                        }
                        case 'signature_delta': {
                            if (snapshotContent?.type === 'thinking') {
                                snapshot.content[event.index] = {
                                    ...snapshotContent,
                                    signature: event.delta.signature,
                                };
                            }
                            break;
                        }
                        default:
                            checkNever(event.delta);
                    }
                    return snapshot;
                }
                case 'content_block_stop': {
                    const snapshotContent = snapshot.content.at(event.index);
                    if (snapshotContent && tracksToolInput$1(snapshotContent) && JSON_BUF_PROPERTY in snapshotContent) {
                        Object.defineProperty(snapshotContent, 'input', {
                            value: snapshotContent.input,
                            enumerable: true,
                            configurable: true,
                            writable: true,
                        });
                    }
                    return snapshot;
                }
            }
        }, Symbol.asyncIterator)]() {
            const pushQueue = [];
            const readQueue = [];
            let done = false;
            this.on('streamEvent', (event) => {
                const reader = readQueue.shift();
                if (reader) {
                    reader.resolve(event);
                }
                else {
                    pushQueue.push(event);
                }
            });
            this.on('end', () => {
                done = true;
                for (const reader of readQueue) {
                    reader.resolve(undefined);
                }
                readQueue.length = 0;
            });
            this.on('abort', (err) => {
                done = true;
                for (const reader of readQueue) {
                    reader.reject(err);
                }
                readQueue.length = 0;
            });
            this.on('error', (err) => {
                done = true;
                for (const reader of readQueue) {
                    reader.reject(err);
                }
                readQueue.length = 0;
            });
            return {
                next: async () => {
                    if (!pushQueue.length) {
                        if (done) {
                            return { value: undefined, done: true };
                        }
                        return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk) => (chunk ? { value: chunk, done: false } : { value: undefined, done: true }));
                    }
                    const chunk = pushQueue.shift();
                    return { value: chunk, done: false };
                },
                return: async () => {
                    this.abort();
                    return { value: undefined, done: true };
                },
            };
        }
        toReadableStream() {
            const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
            return stream.toReadableStream();
        }
    }
    return MessageStream;
})();

var _JSONLDecoder_consumed;
var JSONLDecoder = /* @__PURE__ */ (() => {
    class JSONLDecoder {
        constructor(iterator, controller) {
            this.iterator = iterator;
            _JSONLDecoder_consumed.set(this, false);
            this.controller = controller;
        }
        async *decoder() {
            if (__classPrivateFieldGet(this, _JSONLDecoder_consumed, "f")) {
                throw new AnthropicError('Cannot iterate over a consumed stream.');
            }
            __classPrivateFieldSet(this, _JSONLDecoder_consumed, true);
            const lineDecoder = new LineDecoder();
            for await (const chunk of this.iterator) {
                for (const line of lineDecoder.decode(chunk)) {
                    yield JSON.parse(line);
                }
            }
            for (const line of lineDecoder.flush()) {
                yield JSON.parse(line);
            }
        }
        [(_JSONLDecoder_consumed = new WeakMap(), Symbol.asyncIterator)]() {
            return this.decoder();
        }
        static fromResponse(response, controller) {
            if (!response.body) {
                controller.abort();
                if (typeof globalThis.navigator !== 'undefined' &&
                    globalThis.navigator.product === 'ReactNative') {
                    throw new AnthropicError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
                }
                throw new AnthropicError(`Attempted to iterate over a response with no body`);
            }
            return new JSONLDecoder(ReadableStreamToAsyncIterable(response.body), controller);
        }
    }
    return JSONLDecoder;
})();

/**
 * Percent-encode everything that isn't safe to have in a path without encoding safe chars.
 *
 * Taken from https://datatracker.ietf.org/doc/html/rfc3986#section-3.3:
 * > unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"
 * > sub-delims  = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
 * > pchar       = unreserved / pct-encoded / sub-delims / ":" / "@"
 */
function encodeURIPath(str) {
    return str.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
const EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
const createPathTagFunction = (pathEncoder = encodeURIPath) => function path(statics, ...params) {
    // If there are no params, no processing is needed.
    if (statics.length === 1)
        return statics[0];
    let postPath = false;
    const invalidSegments = [];
    const path = statics.reduce((previousValue, currentValue, index) => {
        if (/[?#]/.test(currentValue)) {
            postPath = true;
        }
        const value = params[index];
        let encoded = (postPath ? encodeURIComponent : pathEncoder)('' + value);
        if (index !== params.length &&
            (value == null ||
                (typeof value === 'object' &&
                    // handle values from other realms
                    value.toString ===
                        Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)
                            ?.toString))) {
            encoded = value + '';
            invalidSegments.push({
                start: previousValue.length + currentValue.length,
                length: encoded.length,
                error: `Value of type ${Object.prototype.toString
                    .call(value)
                    .slice(8, -1)} is not a valid path parameter`,
            });
        }
        if (!postPath && encoded === '') {
            invalidSegments.push({
                start: previousValue.length + currentValue.length,
                length: 0,
                error: 'Value "" can\'t be safely passed as a path parameter',
            });
        }
        return previousValue + currentValue + (index === params.length ? '' : encoded);
    }, '');
    const pathOnly = path.split(/[?#]/, 1)[0];
    const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
    let match;
    // Find all invalid segments
    while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) {
        invalidSegments.push({
            start: match.index,
            length: match[0].length,
            error: `Value "${match[0]}" can\'t be safely passed as a path parameter`,
        });
    }
    invalidSegments.sort((a, b) => a.start - b.start);
    if (invalidSegments.length > 0) {
        const marks = [];
        for (const segment of invalidSegments) {
            for (let i = segment.start; i < segment.start + Math.max(1, segment.length); i++) {
                marks[i] = '^';
            }
        }
        const underline = Array.from(marks, (mark) => mark ?? ' ').join('');
        throw new AnthropicError(`Path parameters result in path with invalid segments:\n${invalidSegments
            .map((e) => e.error)
            .join('\n')}\n${path}\n${underline}`);
    }
    return path;
};
/**
 * URI-encodes path params and ensures that none before any ? or # is empty and none introduces an unsafe /./ or /../ path segment.
 */
const path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);

let Batches$1 = class Batches extends APIResource {
    /**
     * Send a batch of Message creation requests.
     *
     * The Message Batches API can be used to process multiple Messages API requests at
     * once. Once a Message Batch is created, it begins processing immediately. Batches
     * can take up to 24 hours to complete.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatch = await client.messages.batches.create({
     *   requests: [
     *     {
     *       custom_id: 'my-custom-id-1',
     *       params: {
     *         max_tokens: 1024,
     *         messages: [
     *           { content: 'Hello, world', role: 'user' },
     *         ],
     *         model: 'claude-opus-5',
     *       },
     *     },
     *   ],
     * });
     * ```
     */
    create(params, options) {
        const { user_profile_id, workspace_id, ...body } = params;
        return this._client.post('/v1/messages/batches', {
            body,
            ...options,
            headers: buildHeaders([
                {
                    ...(user_profile_id != null ? { 'anthropic-user-profile-id': user_profile_id } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * This endpoint is idempotent and can be used to poll for Message Batch
     * completion. To access the results of a Message Batch, make a request to the
     * `results_url` field in the response.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatch = await client.messages.batches.retrieve(
     *   'message_batch_id',
     * );
     * ```
     */
    retrieve(messageBatchID, params = {}, options) {
        const { workspace_id } = params ?? {};
        return this._client.get(path `/v1/messages/batches/${messageBatchID}`, {
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * List all Message Batches within a Workspace. Most recently created batches are
     * returned first.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const messageBatch of client.messages.batches.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { workspace_id, ...query } = params ?? {};
        return this._client.getAPIList('/v1/messages/batches', (Page), {
            query,
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete a Message Batch.
     *
     * Message Batches can only be deleted once they've finished processing. If you'd
     * like to delete an in-progress batch, you must first cancel it.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const deletedMessageBatch =
     *   await client.messages.batches.delete('message_batch_id');
     * ```
     */
    delete(messageBatchID, params = {}, options) {
        const { workspace_id } = params ?? {};
        return this._client.delete(path `/v1/messages/batches/${messageBatchID}`, {
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * Batches may be canceled any time before processing ends. Once cancellation is
     * initiated, the batch enters a `canceling` state, at which time the system may
     * complete any in-progress, non-interruptible requests before finalizing
     * cancellation.
     *
     * The number of canceled requests is specified in `request_counts`. To determine
     * which requests were canceled, check the individual results within the batch.
     * Note that cancellation may not result in any canceled requests if they were
     * non-interruptible.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatch = await client.messages.batches.cancel(
     *   'message_batch_id',
     * );
     * ```
     */
    cancel(messageBatchID, params = {}, options) {
        const { workspace_id } = params ?? {};
        return this._client.post(path `/v1/messages/batches/${messageBatchID}/cancel`, {
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * Streams the results of a Message Batch as a `.jsonl` file.
     *
     * Each line in the file is a JSON object containing the result of a single request
     * in the Message Batch. Results are not guaranteed to be in the same order as
     * requests. Use the `custom_id` field to match results to requests.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const messageBatchIndividualResponse =
     *   await client.messages.batches.results('message_batch_id');
     * ```
     */
    async results(messageBatchID, params = {}, options) {
        const batch = await this.retrieve(messageBatchID, params, options);
        if (!batch.results_url) {
            throw new AnthropicError(`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
        }
        const { workspace_id } = params ?? {};
        return this._client
            .get(batch.results_url, {
            ...options,
            headers: buildHeaders([
                {
                    Accept: 'application/binary',
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
            stream: true,
            __binaryResponse: true,
        })
            ._thenUnwrap((_, props) => JSONLDecoder.fromResponse(props.response, props.controller));
    }
};

// File containing shared constants
/**
 * Model-specific timeout constraints for non-streaming requests
 */
const MODEL_NONSTREAMING_TOKENS = {
    'claude-opus-4@20250514': 8192,
    'anthropic.claude-opus-4-1-20250805-v1:0': 8192,
    'claude-opus-4-1@20250805': 8192,
};

var Messages$1 = /* @__PURE__ */ (() => {
    class Messages extends APIResource {
        constructor() {
            super(...arguments);
            this.batches = new Batches$1(this._client);
        }
        create(params, options) {
            const { user_profile_id, workspace_id, ...body } = params;
            if (body.model in DEPRECATED_MODELS$1) {
                console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS$1[body.model]}\nPlease migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
            }
            if (MODELS_TO_WARN_WITH_THINKING_ENABLED$1.includes(body.model) &&
                body.thinking &&
                body.thinking.type === 'enabled') {
                console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
            }
            let timeout = options?.timeout ?? this._client._options.timeout;
            if (!body.stream && timeout == null) {
                const maxNonstreamingTokens = MODEL_NONSTREAMING_TOKENS[body.model] ?? undefined;
                timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
            }
            // Collect helper info from tools and messages
            const helperHeader = stainlessHelperHeader(body.tools, body.messages);
            return this._client.post('/v1/messages', {
                body,
                timeout: timeout ?? 600000,
                ...options,
                headers: buildHeaders([
                    {
                        ...(user_profile_id != null ? { 'anthropic-user-profile-id': user_profile_id } : undefined),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    helperHeader,
                    options?.headers,
                ]),
                stream: params.stream ?? false,
            });
        }
        /**
         * Send a structured list of input messages with text and/or image content, along with an expected `output_config.format` and
         * the response will be automatically parsed and available in the `parsed_output` property of the message.
         *
         * @example
         * ```ts
         * const message = await client.messages.parse({
         *   model: 'claude-sonnet-5-5',
         *   max_tokens: 1024,
         *   messages: [{ role: 'user', content: 'What is 2+2?' }],
         *   output_config: {
         *     format: zodOutputFormat(z.object({ answer: z.number() })),
         *   },
         * });
         *
         * console.log(message.parsed_output?.answer); // 4
         * ```
         */
        parse(params, options) {
            return this.create(params, options).then((message) => parseMessage(message, params, { logger: this._client.logger ?? console }));
        }
        /**
         * Create a Message stream.
         *
         * If `output_config.format` is provided with a parseable format (like `zodOutputFormat()`),
         * the final message will include a `parsed_output` property with the parsed content.
         *
         * @example
         * ```ts
         * const stream = client.messages.stream({
         *   model: 'claude-sonnet-5-5',
         *   max_tokens: 1024,
         *   messages: [{ role: 'user', content: 'What is 2+2?' }],
         *   output_config: {
         *     format: zodOutputFormat(z.object({ answer: z.number() })),
         *   },
         * });
         *
         * const message = await stream.finalMessage();
         * console.log(message.parsed_output?.answer); // 4
         * ```
         */
        stream(body, options) {
            return MessageStream.createMessage(this, body, options, { logger: this._client.logger ?? console });
        }
        /**
         * Count the number of tokens in a Message.
         *
         * The Token Count API can be used to count the number of tokens in a Message,
         * including tools, images, and documents, without creating it.
         *
         * Learn more about token counting in our
         * [user guide](https://platform.claude.com/docs/en/build-with-claude/token-counting)
         *
         * @example
         * ```ts
         * const messageTokensCount =
         *   await client.messages.countTokens({
         *     messages: [{ content: 'Hello, world', role: 'user' }],
         *     model: 'claude-opus-5',
         *   });
         * ```
         */
        countTokens(params, options) {
            const { user_profile_id, workspace_id, ...body } = params;
            return this._client.post('/v1/messages/count_tokens', {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        ...(user_profile_id != null ? { 'anthropic-user-profile-id': user_profile_id } : undefined),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
    }
    Messages.Batches = Batches$1;
    return Messages;
})();
const DEPRECATED_MODELS$1 = {
    'claude-sonnet-4-5': 'November 30th, 2026',
    'claude-sonnet-4-5-20250929': 'November 30th, 2026',
};
const MODELS_TO_WARN_WITH_THINKING_ENABLED$1 = ['claude-mythos-preview', 'claude-opus-4-6'];

class DeploymentRuns extends APIResource {
    /**
     * Get Deployment Run
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeploymentRun =
     *   await client.beta.deploymentRuns.retrieve(
     *     'deployment_run_id',
     *   );
     * ```
     */
    retrieve(deploymentRunID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.get(path `/v1/deployment_runs/${deploymentRunID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List Deployment Runs
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsDeploymentRun of client.beta.deploymentRuns.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList('/v1/deployment_runs?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
}

class Deployments extends APIResource {
    /**
     * Create Deployment
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeployment =
     *   await client.beta.deployments.create({
     *     agent: 'string',
     *     environment_id: 'x',
     *     initial_events: [
     *       {
     *         content: [
     *           {
     *             text: 'Where is my order #1234?',
     *             type: 'text',
     *           },
     *         ],
     *         type: 'user.message',
     *       },
     *     ],
     *     name: 'x',
     *   });
     * ```
     */
    create(params, options) {
        const { betas, workspace_id, ...body } = params;
        return this._client.post('/v1/deployments?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Get Deployment
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeployment =
     *   await client.beta.deployments.retrieve(
     *     'depl_011CZkZcDH3vPqd7xnEfwTai',
     *   );
     * ```
     */
    retrieve(deploymentID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.get(path `/v1/deployments/${deploymentID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Update Deployment
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeployment =
     *   await client.beta.deployments.update(
     *     'depl_011CZkZcDH3vPqd7xnEfwTai',
     *   );
     * ```
     */
    update(deploymentID, params, options) {
        const { betas, workspace_id, ...body } = params;
        return this._client.post(path `/v1/deployments/${deploymentID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List Deployments
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsDeployment of client.beta.deployments.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList('/v1/deployments?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Archive Deployment
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeployment =
     *   await client.beta.deployments.archive(
     *     'depl_011CZkZcDH3vPqd7xnEfwTai',
     *   );
     * ```
     */
    archive(deploymentID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.post(path `/v1/deployments/${deploymentID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Pause Deployment
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeployment =
     *   await client.beta.deployments.pause(
     *     'depl_011CZkZcDH3vPqd7xnEfwTai',
     *   );
     * ```
     */
    pause(deploymentID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.post(path `/v1/deployments/${deploymentID}/pause?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Run Deployment Now
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeploymentRun =
     *   await client.beta.deployments.run(
     *     'depl_011CZkZcDH3vPqd7xnEfwTai',
     *   );
     * ```
     */
    run(deploymentID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.post(path `/v1/deployments/${deploymentID}/run?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Unpause Deployment
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeployment =
     *   await client.beta.deployments.unpause(
     *     'depl_011CZkZcDH3vPqd7xnEfwTai',
     *   );
     * ```
     */
    unpause(deploymentID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.post(path `/v1/deployments/${deploymentID}/unpause?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
}

class Dreams extends APIResource {
    /**
     * Start an asynchronous job that uses past sessions to produce a reorganized
     * version of a memory store and get back the dream to poll for the result.
     *
     * By default the dream writes its result to a new memory store and doesn't change
     * the input memory store. The response has `status` set to `pending` and an empty
     * `outputs` array. Poll the dream until `status` is `completed`, `failed`, or
     * `canceled`.
     *
     * See the
     * [Dreams guide](https://platform.claude.com/docs/en/managed-agents/dreams#create-a-dream)
     * to learn more about creating dreams.
     *
     * @example
     * ```ts
     * const betaDream = await client.beta.dreams.create({
     *   inputs: [{ memory_store_id: 'x', type: 'memory_store' }],
     *   model: 'string',
     * });
     * ```
     */
    create(params, options) {
        const { betas, workspace_id, ...body } = params;
        return this._client.post('/v1/dreams?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'dreaming-2026-04-21'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Get a dream by ID to check its status, output memory store, and token usage.
     *
     * Archived dreams are returned too.
     *
     * See the
     * [Dreams guide](https://platform.claude.com/docs/en/managed-agents/dreams#track-progress)
     * for how to poll a dream and what each status means.
     *
     * @example
     * ```ts
     * const betaDream = await client.beta.dreams.retrieve(
     *   'dream_id',
     * );
     * ```
     */
    retrieve(dreamID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.get(path `/v1/dreams/${dreamID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'dreaming-2026-04-21'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List the dreams in the workspace, newest first.
     *
     * Archived dreams are left out unless `include_archived` is `true`.
     *
     * See the
     * [Dreams guide](https://platform.claude.com/docs/en/managed-agents/dreams#list-dreams)
     * for how to page through dreams.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaDream of client.beta.dreams.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList('/v1/dreams?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'dreaming-2026-04-21'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Hide a `completed`, `failed`, or `canceled` dream from the default list of
     * dreams.
     *
     * Archiving a `pending` or `running` dream returns a 400 error, so cancel it
     * first. Archiving an archived dream returns it unchanged. An archived dream can
     * still be fetched by ID. Archiving can't be undone.
     *
     * See the
     * [Dreams guide](https://platform.claude.com/docs/en/managed-agents/dreams#archive-a-dream)
     * to learn more about archiving dreams.
     *
     * @example
     * ```ts
     * const betaDream = await client.beta.dreams.archive(
     *   'dream_id',
     * );
     * ```
     */
    archive(dreamID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.post(path `/v1/dreams/${dreamID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'dreaming-2026-04-21'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Stop a `pending` or `running` dream.
     *
     * The response shows `status` as `canceled`, unless the dream reached `completed`
     * or `failed` first. `usage` can keep changing after the response. Canceling a
     * `canceled` dream returns it unchanged. Canceling a `completed` or `failed` dream
     * returns a 400 error.
     *
     * See the
     * [Dreams guide](https://platform.claude.com/docs/en/managed-agents/dreams#cancel-a-dream)
     * to learn more about canceling dreams.
     *
     * @example
     * ```ts
     * const betaDream = await client.beta.dreams.cancel(
     *   'dream_id',
     * );
     * ```
     */
    cancel(dreamID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.post(path `/v1/dreams/${dreamID}/cancel?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'dreaming-2026-04-21'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
}

let Files$1 = class Files extends APIResource {
    /**
     * List Files
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaFileMetadata of client.beta.files.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList('/v1/files?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete File
     *
     * @example
     * ```ts
     * const betaDeletedFile = await client.beta.files.delete(
     *   'file_id',
     * );
     * ```
     */
    delete(fileID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.delete(path `/v1/files/${fileID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Download File
     *
     * @example
     * ```ts
     * const response = await client.beta.files.download(
     *   'file_id',
     * );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    download(fileID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.get(path `/v1/files/${fileID}/content?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    Accept: 'application/binary',
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
            __binaryResponse: true,
        });
    }
    /**
     * Get File Metadata
     *
     * @example
     * ```ts
     * const betaFileMetadata =
     *   await client.beta.files.retrieveMetadata('file_id');
     * ```
     */
    retrieveMetadata(fileID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.get(path `/v1/files/${fileID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Upload File
     *
     * @example
     * ```ts
     * const betaFileMetadata = await client.beta.files.upload({
     *   file: fs.createReadStream('path/to/file'),
     * });
     * ```
     */
    upload(params, options) {
        const { betas, workspace_id, ...body } = params;
        return this._client.post('/v1/files?beta=true', multipartFormRequestOptions({
            body,
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                stainlessHelperHeaderFromFile(body.file),
                options?.headers,
            ]),
        }, this._client));
    }
};

let Models$1 = class Models extends APIResource {
    /**
     * Get a specific model.
     *
     * The Models API response can be used to determine information about a specific
     * model or resolve a model alias to a model ID.
     *
     * @example
     * ```ts
     * const betaModelInfo = await client.beta.models.retrieve(
     *   'model_id',
     * );
     * ```
     */
    retrieve(modelID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.get(path `/v1/models/${modelID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List available models.
     *
     * The Models API response can be used to determine which models are available for
     * use in the API. More recently released models are listed first.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaModelInfo of client.beta.models.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList('/v1/models?beta=true', (Page), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
};

class UserProfiles extends APIResource {
    /**
     * Create User Profile
     *
     * @example
     * ```ts
     * const betaUserProfile =
     *   await client.beta.userProfiles.create();
     * ```
     */
    create(params, options) {
        const { betas, workspace_id, ...body } = params;
        return this._client.post('/v1/user_profiles?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'user-profiles-2026-08-18'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Get User Profile
     *
     * @example
     * ```ts
     * const betaUserProfile =
     *   await client.beta.userProfiles.retrieve(
     *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
     *   );
     * ```
     */
    retrieve(userProfileID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.get(path `/v1/user_profiles/${userProfileID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'user-profiles-2026-08-18'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Update User Profile
     *
     * @example
     * ```ts
     * const betaUserProfile =
     *   await client.beta.userProfiles.update(
     *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
     *   );
     * ```
     */
    update(userProfileID, params, options) {
        const { betas, workspace_id, ...body } = params;
        return this._client.post(path `/v1/user_profiles/${userProfileID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'user-profiles-2026-08-18'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List User Profiles
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaUserProfile of client.beta.userProfiles.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList('/v1/user_profiles?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'user-profiles-2026-08-18'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Create Enrollment URL
     *
     * @example
     * ```ts
     * const betaUserProfileEnrollmentURL =
     *   await client.beta.userProfiles.createEnrollmentURL(
     *     'uprof_011CZkZCu8hGbp5mYRQgUmz9',
     *   );
     * ```
     */
    createEnrollmentURL(userProfileID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.post(path `/v1/user_profiles/${userProfileID}/enrollment_url?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'user-profiles-2026-08-18'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
}

var dist = {};

var base64$1 = {};

// Copyright (C) 2016 Dmitry Chestnykh
// MIT License. See LICENSE file for details.
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(base64$1, "__esModule", { value: true });
/**
 * Package base64 implements Base64 encoding and decoding.
 */
// Invalid character used in decoding to indicate
// that the character to decode is out of range of
// alphabet and cannot be decoded.
var INVALID_BYTE = 256;
/**
 * Implements standard Base64 encoding.
 *
 * Operates in constant time.
 */
var Coder = /** @class */ (function () {
    // TODO(dchest): methods to encode chunk-by-chunk.
    function Coder(_paddingCharacter) {
        if (_paddingCharacter === void 0) { _paddingCharacter = "="; }
        this._paddingCharacter = _paddingCharacter;
    }
    Coder.prototype.encodedLength = function (length) {
        if (!this._paddingCharacter) {
            return (length * 8 + 5) / 6 | 0;
        }
        return (length + 2) / 3 * 4 | 0;
    };
    Coder.prototype.encode = function (data) {
        var out = "";
        var i = 0;
        for (; i < data.length - 2; i += 3) {
            var c = (data[i] << 16) | (data[i + 1] << 8) | (data[i + 2]);
            out += this._encodeByte((c >>> 3 * 6) & 63);
            out += this._encodeByte((c >>> 2 * 6) & 63);
            out += this._encodeByte((c >>> 1 * 6) & 63);
            out += this._encodeByte((c >>> 0 * 6) & 63);
        }
        var left = data.length - i;
        if (left > 0) {
            var c = (data[i] << 16) | (left === 2 ? data[i + 1] << 8 : 0);
            out += this._encodeByte((c >>> 3 * 6) & 63);
            out += this._encodeByte((c >>> 2 * 6) & 63);
            if (left === 2) {
                out += this._encodeByte((c >>> 1 * 6) & 63);
            }
            else {
                out += this._paddingCharacter || "";
            }
            out += this._paddingCharacter || "";
        }
        return out;
    };
    Coder.prototype.maxDecodedLength = function (length) {
        if (!this._paddingCharacter) {
            return (length * 6 + 7) / 8 | 0;
        }
        return length / 4 * 3 | 0;
    };
    Coder.prototype.decodedLength = function (s) {
        return this.maxDecodedLength(s.length - this._getPaddingLength(s));
    };
    Coder.prototype.decode = function (s) {
        if (s.length === 0) {
            return new Uint8Array(0);
        }
        var paddingLength = this._getPaddingLength(s);
        var length = s.length - paddingLength;
        var out = new Uint8Array(this.maxDecodedLength(length));
        var op = 0;
        var i = 0;
        var haveBad = 0;
        var v0 = 0, v1 = 0, v2 = 0, v3 = 0;
        for (; i < length - 4; i += 4) {
            v0 = this._decodeChar(s.charCodeAt(i + 0));
            v1 = this._decodeChar(s.charCodeAt(i + 1));
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            v3 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = (v0 << 2) | (v1 >>> 4);
            out[op++] = (v1 << 4) | (v2 >>> 2);
            out[op++] = (v2 << 6) | v3;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v1 & INVALID_BYTE;
            haveBad |= v2 & INVALID_BYTE;
            haveBad |= v3 & INVALID_BYTE;
        }
        if (i < length - 1) {
            v0 = this._decodeChar(s.charCodeAt(i));
            v1 = this._decodeChar(s.charCodeAt(i + 1));
            out[op++] = (v0 << 2) | (v1 >>> 4);
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v1 & INVALID_BYTE;
        }
        if (i < length - 2) {
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            out[op++] = (v1 << 4) | (v2 >>> 2);
            haveBad |= v2 & INVALID_BYTE;
        }
        if (i < length - 3) {
            v3 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = (v2 << 6) | v3;
            haveBad |= v3 & INVALID_BYTE;
        }
        if (haveBad !== 0) {
            throw new Error("Base64Coder: incorrect characters for decoding");
        }
        return out;
    };
    // Standard encoding have the following encoded/decoded ranges,
    // which we need to convert between.
    //
    // ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789  +   /
    // Index:   0 - 25                    26 - 51              52 - 61   62  63
    // ASCII:  65 - 90                    97 - 122             48 - 57   43  47
    //
    // Encode 6 bits in b into a new character.
    Coder.prototype._encodeByte = function (b) {
        // Encoding uses constant time operations as follows:
        //
        // 1. Define comparison of A with B using (A - B) >>> 8:
        //          if A > B, then result is positive integer
        //          if A <= B, then result is 0
        //
        // 2. Define selection of C or 0 using bitwise AND: X & C:
        //          if X == 0, then result is 0
        //          if X != 0, then result is C
        //
        // 3. Start with the smallest comparison (b >= 0), which is always
        //    true, so set the result to the starting ASCII value (65).
        //
        // 4. Continue comparing b to higher ASCII values, and selecting
        //    zero if comparison isn't true, otherwise selecting a value
        //    to add to result, which:
        //
        //          a) undoes the previous addition
        //          b) provides new value to add
        //
        var result = b;
        // b >= 0
        result += 65;
        // b > 25
        result += ((25 - b) >>> 8) & ((0 - 65) - 26 + 97);
        // b > 51
        result += ((51 - b) >>> 8) & ((26 - 97) - 52 + 48);
        // b > 61
        result += ((61 - b) >>> 8) & ((52 - 48) - 62 + 43);
        // b > 62
        result += ((62 - b) >>> 8) & ((62 - 43) - 63 + 47);
        return String.fromCharCode(result);
    };
    // Decode a character code into a byte.
    // Must return 256 if character is out of alphabet range.
    Coder.prototype._decodeChar = function (c) {
        // Decoding works similar to encoding: using the same comparison
        // function, but now it works on ranges: result is always incremented
        // by value, but this value becomes zero if the range is not
        // satisfied.
        //
        // Decoding starts with invalid value, 256, which is then
        // subtracted when the range is satisfied. If none of the ranges
        // apply, the function returns 256, which is then checked by
        // the caller to throw error.
        var result = INVALID_BYTE; // start with invalid character
        // c == 43 (c > 42 and c < 44)
        result += (((42 - c) & (c - 44)) >>> 8) & (-INVALID_BYTE + c - 43 + 62);
        // c == 47 (c > 46 and c < 48)
        result += (((46 - c) & (c - 48)) >>> 8) & (-INVALID_BYTE + c - 47 + 63);
        // c > 47 and c < 58
        result += (((47 - c) & (c - 58)) >>> 8) & (-INVALID_BYTE + c - 48 + 52);
        // c > 64 and c < 91
        result += (((64 - c) & (c - 91)) >>> 8) & (-INVALID_BYTE + c - 65 + 0);
        // c > 96 and c < 123
        result += (((96 - c) & (c - 123)) >>> 8) & (-INVALID_BYTE + c - 97 + 26);
        return result;
    };
    Coder.prototype._getPaddingLength = function (s) {
        var paddingLength = 0;
        if (this._paddingCharacter) {
            for (var i = s.length - 1; i >= 0; i--) {
                if (s[i] !== this._paddingCharacter) {
                    break;
                }
                paddingLength++;
            }
            if (s.length < 4 || paddingLength > 2) {
                throw new Error("Base64Coder: incorrect padding");
            }
        }
        return paddingLength;
    };
    return Coder;
}());
base64$1.Coder = Coder;
var stdCoder = new Coder();
function encode(data) {
    return stdCoder.encode(data);
}
base64$1.encode = encode;
function decode(s) {
    return stdCoder.decode(s);
}
base64$1.decode = decode;
/**
 * Implements URL-safe Base64 encoding.
 * (Same as Base64, but '+' is replaced with '-', and '/' with '_').
 *
 * Operates in constant time.
 */
var URLSafeCoder = /** @class */ (function (_super) {
    __extends(URLSafeCoder, _super);
    function URLSafeCoder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // URL-safe encoding have the following encoded/decoded ranges:
    //
    // ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789  -   _
    // Index:   0 - 25                    26 - 51              52 - 61   62  63
    // ASCII:  65 - 90                    97 - 122             48 - 57   45  95
    //
    URLSafeCoder.prototype._encodeByte = function (b) {
        var result = b;
        // b >= 0
        result += 65;
        // b > 25
        result += ((25 - b) >>> 8) & ((0 - 65) - 26 + 97);
        // b > 51
        result += ((51 - b) >>> 8) & ((26 - 97) - 52 + 48);
        // b > 61
        result += ((61 - b) >>> 8) & ((52 - 48) - 62 + 45);
        // b > 62
        result += ((62 - b) >>> 8) & ((62 - 45) - 63 + 95);
        return String.fromCharCode(result);
    };
    URLSafeCoder.prototype._decodeChar = function (c) {
        var result = INVALID_BYTE;
        // c == 45 (c > 44 and c < 46)
        result += (((44 - c) & (c - 46)) >>> 8) & (-INVALID_BYTE + c - 45 + 62);
        // c == 95 (c > 94 and c < 96)
        result += (((94 - c) & (c - 96)) >>> 8) & (-INVALID_BYTE + c - 95 + 63);
        // c > 47 and c < 58
        result += (((47 - c) & (c - 58)) >>> 8) & (-INVALID_BYTE + c - 48 + 52);
        // c > 64 and c < 91
        result += (((64 - c) & (c - 91)) >>> 8) & (-INVALID_BYTE + c - 65 + 0);
        // c > 96 and c < 123
        result += (((96 - c) & (c - 123)) >>> 8) & (-INVALID_BYTE + c - 97 + 26);
        return result;
    };
    return URLSafeCoder;
}(Coder));
base64$1.URLSafeCoder = URLSafeCoder;
var urlSafeCoder = new URLSafeCoder();
function encodeURLSafe(data) {
    return urlSafeCoder.encode(data);
}
base64$1.encodeURLSafe = encodeURLSafe;
function decodeURLSafe(s) {
    return urlSafeCoder.decode(s);
}
base64$1.decodeURLSafe = decodeURLSafe;
base64$1.encodedLength = function (length) {
    return stdCoder.encodedLength(length);
};
base64$1.maxDecodedLength = function (length) {
    return stdCoder.maxDecodedLength(length);
};
base64$1.decodedLength = function (s) {
    return stdCoder.decodedLength(s);
};

var sha256$1 = {exports: {}};

(function (module) {
	(function (root, factory) {
	    // Hack to make all exports of this module sha256 function object properties.
	    var exports = {};
	    factory(exports);
	    var sha256 = exports["default"];
	    for (var k in exports) {
	        sha256[k] = exports[k];
	    }
	        
	    {
	        module.exports = sha256;
	    }
	})(commonjsGlobal, function(exports) {
	exports.__esModule = true;
	// SHA-256 (+ HMAC and PBKDF2) for JavaScript.
	//
	// Written in 2014-2016 by Dmitry Chestnykh.
	// Public domain, no warranty.
	//
	// Functions (accept and return Uint8Arrays):
	//
	//   sha256(message) -> hash
	//   sha256.hmac(key, message) -> mac
	//   sha256.pbkdf2(password, salt, rounds, dkLen) -> dk
	//
	//  Classes:
	//
	//   new sha256.Hash()
	//   new sha256.HMAC(key)
	//
	exports.digestLength = 32;
	exports.blockSize = 64;
	// SHA-256 constants
	var K = new Uint32Array([
	    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b,
	    0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
	    0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7,
	    0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
	    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152,
	    0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
	    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
	    0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
	    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
	    0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
	    0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f,
	    0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
	    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
	]);
	function hashBlocks(w, v, p, pos, len) {
	    var a, b, c, d, e, f, g, h, u, i, j, t1, t2;
	    while (len >= 64) {
	        a = v[0];
	        b = v[1];
	        c = v[2];
	        d = v[3];
	        e = v[4];
	        f = v[5];
	        g = v[6];
	        h = v[7];
	        for (i = 0; i < 16; i++) {
	            j = pos + i * 4;
	            w[i] = (((p[j] & 0xff) << 24) | ((p[j + 1] & 0xff) << 16) |
	                ((p[j + 2] & 0xff) << 8) | (p[j + 3] & 0xff));
	        }
	        for (i = 16; i < 64; i++) {
	            u = w[i - 2];
	            t1 = (u >>> 17 | u << (32 - 17)) ^ (u >>> 19 | u << (32 - 19)) ^ (u >>> 10);
	            u = w[i - 15];
	            t2 = (u >>> 7 | u << (32 - 7)) ^ (u >>> 18 | u << (32 - 18)) ^ (u >>> 3);
	            w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
	        }
	        for (i = 0; i < 64; i++) {
	            t1 = (((((e >>> 6 | e << (32 - 6)) ^ (e >>> 11 | e << (32 - 11)) ^
	                (e >>> 25 | e << (32 - 25))) + ((e & f) ^ (~e & g))) | 0) +
	                ((h + ((K[i] + w[i]) | 0)) | 0)) | 0;
	            t2 = (((a >>> 2 | a << (32 - 2)) ^ (a >>> 13 | a << (32 - 13)) ^
	                (a >>> 22 | a << (32 - 22))) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
	            h = g;
	            g = f;
	            f = e;
	            e = (d + t1) | 0;
	            d = c;
	            c = b;
	            b = a;
	            a = (t1 + t2) | 0;
	        }
	        v[0] += a;
	        v[1] += b;
	        v[2] += c;
	        v[3] += d;
	        v[4] += e;
	        v[5] += f;
	        v[6] += g;
	        v[7] += h;
	        pos += 64;
	        len -= 64;
	    }
	    return pos;
	}
	// Hash implements SHA256 hash algorithm.
	var Hash = /** @class */ (function () {
	    function Hash() {
	        this.digestLength = exports.digestLength;
	        this.blockSize = exports.blockSize;
	        // Note: Int32Array is used instead of Uint32Array for performance reasons.
	        this.state = new Int32Array(8); // hash state
	        this.temp = new Int32Array(64); // temporary state
	        this.buffer = new Uint8Array(128); // buffer for data to hash
	        this.bufferLength = 0; // number of bytes in buffer
	        this.bytesHashed = 0; // number of total bytes hashed
	        this.finished = false; // indicates whether the hash was finalized
	        this.reset();
	    }
	    // Resets hash state making it possible
	    // to re-use this instance to hash other data.
	    Hash.prototype.reset = function () {
	        this.state[0] = 0x6a09e667;
	        this.state[1] = 0xbb67ae85;
	        this.state[2] = 0x3c6ef372;
	        this.state[3] = 0xa54ff53a;
	        this.state[4] = 0x510e527f;
	        this.state[5] = 0x9b05688c;
	        this.state[6] = 0x1f83d9ab;
	        this.state[7] = 0x5be0cd19;
	        this.bufferLength = 0;
	        this.bytesHashed = 0;
	        this.finished = false;
	        return this;
	    };
	    // Cleans internal buffers and re-initializes hash state.
	    Hash.prototype.clean = function () {
	        for (var i = 0; i < this.buffer.length; i++) {
	            this.buffer[i] = 0;
	        }
	        for (var i = 0; i < this.temp.length; i++) {
	            this.temp[i] = 0;
	        }
	        this.reset();
	    };
	    // Updates hash state with the given data.
	    //
	    // Optionally, length of the data can be specified to hash
	    // fewer bytes than data.length.
	    //
	    // Throws error when trying to update already finalized hash:
	    // instance must be reset to use it again.
	    Hash.prototype.update = function (data, dataLength) {
	        if (dataLength === void 0) { dataLength = data.length; }
	        if (this.finished) {
	            throw new Error("SHA256: can't update because hash was finished.");
	        }
	        var dataPos = 0;
	        this.bytesHashed += dataLength;
	        if (this.bufferLength > 0) {
	            while (this.bufferLength < 64 && dataLength > 0) {
	                this.buffer[this.bufferLength++] = data[dataPos++];
	                dataLength--;
	            }
	            if (this.bufferLength === 64) {
	                hashBlocks(this.temp, this.state, this.buffer, 0, 64);
	                this.bufferLength = 0;
	            }
	        }
	        if (dataLength >= 64) {
	            dataPos = hashBlocks(this.temp, this.state, data, dataPos, dataLength);
	            dataLength %= 64;
	        }
	        while (dataLength > 0) {
	            this.buffer[this.bufferLength++] = data[dataPos++];
	            dataLength--;
	        }
	        return this;
	    };
	    // Finalizes hash state and puts hash into out.
	    //
	    // If hash was already finalized, puts the same value.
	    Hash.prototype.finish = function (out) {
	        if (!this.finished) {
	            var bytesHashed = this.bytesHashed;
	            var left = this.bufferLength;
	            var bitLenHi = (bytesHashed / 0x20000000) | 0;
	            var bitLenLo = bytesHashed << 3;
	            var padLength = (bytesHashed % 64 < 56) ? 64 : 128;
	            this.buffer[left] = 0x80;
	            for (var i = left + 1; i < padLength - 8; i++) {
	                this.buffer[i] = 0;
	            }
	            this.buffer[padLength - 8] = (bitLenHi >>> 24) & 0xff;
	            this.buffer[padLength - 7] = (bitLenHi >>> 16) & 0xff;
	            this.buffer[padLength - 6] = (bitLenHi >>> 8) & 0xff;
	            this.buffer[padLength - 5] = (bitLenHi >>> 0) & 0xff;
	            this.buffer[padLength - 4] = (bitLenLo >>> 24) & 0xff;
	            this.buffer[padLength - 3] = (bitLenLo >>> 16) & 0xff;
	            this.buffer[padLength - 2] = (bitLenLo >>> 8) & 0xff;
	            this.buffer[padLength - 1] = (bitLenLo >>> 0) & 0xff;
	            hashBlocks(this.temp, this.state, this.buffer, 0, padLength);
	            this.finished = true;
	        }
	        for (var i = 0; i < 8; i++) {
	            out[i * 4 + 0] = (this.state[i] >>> 24) & 0xff;
	            out[i * 4 + 1] = (this.state[i] >>> 16) & 0xff;
	            out[i * 4 + 2] = (this.state[i] >>> 8) & 0xff;
	            out[i * 4 + 3] = (this.state[i] >>> 0) & 0xff;
	        }
	        return this;
	    };
	    // Returns the final hash digest.
	    Hash.prototype.digest = function () {
	        var out = new Uint8Array(this.digestLength);
	        this.finish(out);
	        return out;
	    };
	    // Internal function for use in HMAC for optimization.
	    Hash.prototype._saveState = function (out) {
	        for (var i = 0; i < this.state.length; i++) {
	            out[i] = this.state[i];
	        }
	    };
	    // Internal function for use in HMAC for optimization.
	    Hash.prototype._restoreState = function (from, bytesHashed) {
	        for (var i = 0; i < this.state.length; i++) {
	            this.state[i] = from[i];
	        }
	        this.bytesHashed = bytesHashed;
	        this.finished = false;
	        this.bufferLength = 0;
	    };
	    return Hash;
	}());
	exports.Hash = Hash;
	// HMAC implements HMAC-SHA256 message authentication algorithm.
	var HMAC = /** @class */ (function () {
	    function HMAC(key) {
	        this.inner = new Hash();
	        this.outer = new Hash();
	        this.blockSize = this.inner.blockSize;
	        this.digestLength = this.inner.digestLength;
	        var pad = new Uint8Array(this.blockSize);
	        if (key.length > this.blockSize) {
	            (new Hash()).update(key).finish(pad).clean();
	        }
	        else {
	            for (var i = 0; i < key.length; i++) {
	                pad[i] = key[i];
	            }
	        }
	        for (var i = 0; i < pad.length; i++) {
	            pad[i] ^= 0x36;
	        }
	        this.inner.update(pad);
	        for (var i = 0; i < pad.length; i++) {
	            pad[i] ^= 0x36 ^ 0x5c;
	        }
	        this.outer.update(pad);
	        this.istate = new Uint32Array(8);
	        this.ostate = new Uint32Array(8);
	        this.inner._saveState(this.istate);
	        this.outer._saveState(this.ostate);
	        for (var i = 0; i < pad.length; i++) {
	            pad[i] = 0;
	        }
	    }
	    // Returns HMAC state to the state initialized with key
	    // to make it possible to run HMAC over the other data with the same
	    // key without creating a new instance.
	    HMAC.prototype.reset = function () {
	        this.inner._restoreState(this.istate, this.inner.blockSize);
	        this.outer._restoreState(this.ostate, this.outer.blockSize);
	        return this;
	    };
	    // Cleans HMAC state.
	    HMAC.prototype.clean = function () {
	        for (var i = 0; i < this.istate.length; i++) {
	            this.ostate[i] = this.istate[i] = 0;
	        }
	        this.inner.clean();
	        this.outer.clean();
	    };
	    // Updates state with provided data.
	    HMAC.prototype.update = function (data) {
	        this.inner.update(data);
	        return this;
	    };
	    // Finalizes HMAC and puts the result in out.
	    HMAC.prototype.finish = function (out) {
	        if (this.outer.finished) {
	            this.outer.finish(out);
	        }
	        else {
	            this.inner.finish(out);
	            this.outer.update(out, this.digestLength).finish(out);
	        }
	        return this;
	    };
	    // Returns message authentication code.
	    HMAC.prototype.digest = function () {
	        var out = new Uint8Array(this.digestLength);
	        this.finish(out);
	        return out;
	    };
	    return HMAC;
	}());
	exports.HMAC = HMAC;
	// Returns SHA256 hash of data.
	function hash(data) {
	    var h = (new Hash()).update(data);
	    var digest = h.digest();
	    h.clean();
	    return digest;
	}
	exports.hash = hash;
	// Function hash is both available as module.hash and as default export.
	exports["default"] = hash;
	// Returns HMAC-SHA256 of data under the key.
	function hmac(key, data) {
	    var h = (new HMAC(key)).update(data);
	    var digest = h.digest();
	    h.clean();
	    return digest;
	}
	exports.hmac = hmac;
	// Fills hkdf buffer like this:
	// T(1) = HMAC-Hash(PRK, T(0) | info | 0x01)
	function fillBuffer(buffer, hmac, info, counter) {
	    // Counter is a byte value: check if it overflowed.
	    var num = counter[0];
	    if (num === 0) {
	        throw new Error("hkdf: cannot expand more");
	    }
	    // Prepare HMAC instance for new data with old key.
	    hmac.reset();
	    // Hash in previous output if it was generated
	    // (i.e. counter is greater than 1).
	    if (num > 1) {
	        hmac.update(buffer);
	    }
	    // Hash in info if it exists.
	    if (info) {
	        hmac.update(info);
	    }
	    // Hash in the counter.
	    hmac.update(counter);
	    // Output result to buffer and clean HMAC instance.
	    hmac.finish(buffer);
	    // Increment counter inside typed array, this works properly.
	    counter[0]++;
	}
	var hkdfSalt = new Uint8Array(exports.digestLength); // Filled with zeroes.
	function hkdf(key, salt, info, length) {
	    if (salt === void 0) { salt = hkdfSalt; }
	    if (length === void 0) { length = 32; }
	    var counter = new Uint8Array([1]);
	    // HKDF-Extract uses salt as HMAC key, and key as data.
	    var okm = hmac(salt, key);
	    // Initialize HMAC for expanding with extracted key.
	    // Ensure no collisions with `hmac` function.
	    var hmac_ = new HMAC(okm);
	    // Allocate buffer.
	    var buffer = new Uint8Array(hmac_.digestLength);
	    var bufpos = buffer.length;
	    var out = new Uint8Array(length);
	    for (var i = 0; i < length; i++) {
	        if (bufpos === buffer.length) {
	            fillBuffer(buffer, hmac_, info, counter);
	            bufpos = 0;
	        }
	        out[i] = buffer[bufpos++];
	    }
	    hmac_.clean();
	    buffer.fill(0);
	    counter.fill(0);
	    return out;
	}
	exports.hkdf = hkdf;
	// Derives a key from password and salt using PBKDF2-HMAC-SHA256
	// with the given number of iterations.
	//
	// The number of bytes returned is equal to dkLen.
	//
	// (For better security, avoid dkLen greater than hash length - 32 bytes).
	function pbkdf2(password, salt, iterations, dkLen) {
	    var prf = new HMAC(password);
	    var len = prf.digestLength;
	    var ctr = new Uint8Array(4);
	    var t = new Uint8Array(len);
	    var u = new Uint8Array(len);
	    var dk = new Uint8Array(dkLen);
	    for (var i = 0; i * len < dkLen; i++) {
	        var c = i + 1;
	        ctr[0] = (c >>> 24) & 0xff;
	        ctr[1] = (c >>> 16) & 0xff;
	        ctr[2] = (c >>> 8) & 0xff;
	        ctr[3] = (c >>> 0) & 0xff;
	        prf.reset();
	        prf.update(salt);
	        prf.update(ctr);
	        prf.finish(u);
	        for (var j = 0; j < len; j++) {
	            t[j] = u[j];
	        }
	        for (var j = 2; j <= iterations; j++) {
	            prf.reset();
	            prf.update(u).finish(u);
	            for (var k = 0; k < len; k++) {
	                t[k] ^= u[k];
	            }
	        }
	        for (var j = 0; j < len && i * len + j < dkLen; j++) {
	            dk[i * len + j] = t[j];
	        }
	    }
	    for (var i = 0; i < len; i++) {
	        t[i] = u[i] = 0;
	    }
	    for (var i = 0; i < 4; i++) {
	        ctr[i] = 0;
	    }
	    prf.clean();
	    return dk;
	}
	exports.pbkdf2 = pbkdf2;
	}); 
} (sha256$1));

var sha256Exports = sha256$1.exports;

var timing_safe_equal = {};

Object.defineProperty(timing_safe_equal, "__esModule", { value: true });
timing_safe_equal.timingSafeEqual = timingSafeEqual;
function assert(expr, msg = "") {
    if (!expr) {
        throw new Error(msg);
    }
}
function timingSafeEqual(a, b) {
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    if (!(a instanceof DataView)) {
        a = new DataView(ArrayBuffer.isView(a) ? a.buffer : a);
    }
    if (!(b instanceof DataView)) {
        b = new DataView(ArrayBuffer.isView(b) ? b.buffer : b);
    }
    assert(a instanceof DataView);
    assert(b instanceof DataView);
    const length = a.byteLength;
    let out = 0;
    let i = -1;
    while (++i < length) {
        out |= a.getUint8(i) ^ b.getUint8(i);
    }
    return out === 0;
}

Object.defineProperty(dist, "__esModule", { value: true });
var Webhook_1 = dist.Webhook = dist.WebhookVerificationError = void 0;
const base64 = base64$1;
const sha256 = sha256Exports;
const timing_safe_equal_1 = timing_safe_equal;
const WEBHOOK_TOLERANCE_IN_SECONDS = 5 * 60;
class ExtendableError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, ExtendableError.prototype);
        this.name = "ExtendableError";
        this.stack = new Error(message).stack;
    }
}
class WebhookVerificationError extends ExtendableError {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, WebhookVerificationError.prototype);
        this.name = "WebhookVerificationError";
    }
}
dist.WebhookVerificationError = WebhookVerificationError;
class Webhook {
    constructor(secret, options) {
        if ((options === null || options === void 0 ? void 0 : options.format) === "raw") {
            if (secret instanceof Uint8Array) {
                this.key = secret;
            }
            else {
                this.key = Uint8Array.from(secret, (c) => c.charCodeAt(0));
            }
        }
        else {
            if (typeof secret !== "string") {
                throw new Error("Expected secret to be of type string");
            }
            if (secret.startsWith(Webhook.prefix)) {
                secret = secret.substring(Webhook.prefix.length);
            }
            this.key = base64.decode(secret);
        }
        if (this.key.length === 0) {
            throw new Error("Secret can't be empty.");
        }
    }
    verify(payload, headers, options) {
        var _a;
        const jsonParse = (_a = options === null || options === void 0 ? void 0 : options.jsonParse) !== null && _a !== void 0 ? _a : true;
        const normalizedHeaders = {};
        for (const key of Object.keys(headers)) {
            normalizedHeaders[key.toLowerCase()] = headers[key];
        }
        const msgId = normalizedHeaders["webhook-id"];
        const msgSignature = normalizedHeaders["webhook-signature"];
        const msgTimestamp = normalizedHeaders["webhook-timestamp"];
        if (!msgSignature || !msgId || !msgTimestamp) {
            throw new WebhookVerificationError("Missing required headers");
        }
        const timestamp = this.verifyTimestamp(msgTimestamp);
        const computedSignature = this.sign(msgId, timestamp, payload);
        const expectedSignature = computedSignature.split(",")[1];
        const passedSignatures = msgSignature.split(" ");
        const encoder = new globalThis.TextEncoder();
        for (const versionedSignature of passedSignatures) {
            const [version, signature] = versionedSignature.split(",");
            if (version !== "v1") {
                continue;
            }
            if ((0, timing_safe_equal_1.timingSafeEqual)(encoder.encode(signature), encoder.encode(expectedSignature))) {
                const payloadString = payload.toString();
                if (payloadString === "") {
                    return undefined;
                }
                if (jsonParse) {
                    return JSON.parse(payloadString);
                }
                else {
                    return undefined;
                }
            }
        }
        throw new WebhookVerificationError("No matching signature found");
    }
    sign(msgId, timestamp, payload) {
        if (typeof payload === "string") ;
        else if (payload.constructor.name === "Buffer") {
            payload = payload.toString();
        }
        else {
            throw new Error("Expected payload to be of type string or Buffer.");
        }
        const encoder = new TextEncoder();
        const timestampNumber = Math.floor(timestamp.getTime() / 1000);
        const toSign = encoder.encode(`${msgId}.${timestampNumber}.${payload}`);
        const expectedSignature = base64.encode(sha256.hmac(this.key, toSign));
        return `v1,${expectedSignature}`;
    }
    verifyTimestamp(timestampHeader) {
        const now = Math.floor(Date.now() / 1000);
        const timestamp = parseInt(timestampHeader, 10);
        if (Number.isNaN(timestamp)) {
            throw new WebhookVerificationError("Invalid Signature Headers");
        }
        if (now - timestamp > WEBHOOK_TOLERANCE_IN_SECONDS) {
            throw new WebhookVerificationError("Message timestamp too old");
        }
        if (timestamp > now + WEBHOOK_TOLERANCE_IN_SECONDS) {
            throw new WebhookVerificationError("Message timestamp too new");
        }
        return new Date(timestamp * 1000);
    }
}
Webhook_1 = dist.Webhook = Webhook;
Webhook.prefix = "whsec_";

class Webhooks extends APIResource {
    /**
     * Parses a webhook payload into an event without verifying its signature. Prefer
     * `unwrap()` unless you have already verified the signature yourself.
     */
    parseUnverified(body) {
        return JSON.parse(body);
    }
    /**
     * Verifies the webhook signature from the `webhook-id`, `webhook-timestamp` and
     * `webhook-signature` headers using your webhook signing key, then parses the
     * payload into an event. Fails if the signature is missing or invalid.
     */
    unwrap(body, options) {
        const headers = options?.headers;
        if (headers == null)
            throw new Error('Webhook headers are required in order to verify the signature');
        const keyStr = options.key === undefined ? this._client.webhookKey : options.key;
        if (!keyStr)
            throw new Error('Webhook key must not be null or empty in order to unwrap');
        const wh = new Webhook_1(keyStr);
        wh.verify(body, headers);
        return JSON.parse(body);
    }
}

let Versions$3 = class Versions extends APIResource {
    /**
     * List Agent Versions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsAgent of client.beta.agents.versions.list(
     *   'agent_011CZkYpogX7uDKUyvBTophP',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(agentID, params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/agents/${agentID}/versions?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
};

var Agents = /* @__PURE__ */ (() => {
    class Agents extends APIResource {
        constructor() {
            super(...arguments);
            this.versions = new Versions$3(this._client);
        }
        /**
         * Create Agent
         *
         * @example
         * ```ts
         * const betaManagedAgentsAgent =
         *   await client.beta.agents.create({
         *     model: 'claude-opus-5',
         *     name: 'My First Agent',
         *   });
         * ```
         */
        create(params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post('/v1/agents?beta=true', {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Get Agent
         *
         * @example
         * ```ts
         * const betaManagedAgentsAgent =
         *   await client.beta.agents.retrieve(
         *     'agent_011CZkYpogX7uDKUyvBTophP',
         *   );
         * ```
         */
        retrieve(agentID, params = {}, options) {
            const { betas, workspace_id, ...query } = params ?? {};
            return this._client.get(path `/v1/agents/${agentID}?beta=true`, {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Update Agent
         *
         * @example
         * ```ts
         * const betaManagedAgentsAgent =
         *   await client.beta.agents.update(
         *     'agent_011CZkYpogX7uDKUyvBTophP',
         *     { description: 'updated' },
         *   );
         * ```
         */
        update(agentID, params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post(path `/v1/agents/${agentID}?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * List Agents
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaManagedAgentsAgent of client.beta.agents.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { betas, workspace_id, ...query } = params ?? {};
            return this._client.getAPIList('/v1/agents?beta=true', (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Archive Agent
         *
         * @example
         * ```ts
         * const betaManagedAgentsAgent =
         *   await client.beta.agents.archive(
         *     'agent_011CZkYpogX7uDKUyvBTophP',
         *   );
         * ```
         */
        archive(agentID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.post(path `/v1/agents/${agentID}/archive?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
    }
    Agents.Versions = Versions$3;
    return Agents;
})();

/**
 * Chain an external {@link AbortSignal} into a local {@link AbortController}:
 * the controller aborts whenever `external` aborts (synchronously if it is
 * already aborted).
 *
 * Returns a cleanup function that detaches the listener. Callers MUST invoke it
 * on their normal teardown path — `{ once: true }` only removes the listener if
 * abort actually fires, so a long-lived `external` signal (e.g. a daemon-wide
 * signal reused across many short-lived controllers) would otherwise leak one
 * listener per controller.
 */
function linkAbort(external, controller) {
    if (!external)
        return () => { };
    if (external.aborted) {
        controller.abort();
        return () => { };
    }
    const onAbort = () => controller.abort();
    external.addEventListener('abort', onAbort);
    return () => external.removeEventListener('abort', onAbort);
}

/** True when `e` is an {@link APIError} whose HTTP status equals `code`. */
function isStatus(e, code) {
    return e instanceof APIError && e.status === code;
}
/** True when `e` is an {@link APIError} with a 4xx status. */
function is4xx(e) {
    return e instanceof APIError && typeof e.status === 'number' && e.status >= 400 && e.status < 500;
}
/**
 * True for a 4xx that the core client's retry policy would *not* retry, i.e. a
 * permanent client error. 408 (request timeout), 409 (lock timeout) and 429
 * (rate limit) are retryable for the base client (`Anthropic.shouldRetry`), so
 * they are not treated as fatal here — keeping helper retry behaviour aligned
 * with the rest of the SDK.
 */
function isFatal4xx(e) {
    return is4xx(e) && !isStatus(e, 408) && !isStatus(e, 409) && !isStatus(e, 429);
}
/** Exponential backoff: `baseMs * 2 ** attempt`, clamped to `capMs`. */
function backoff$1(attempt, baseMs, capMs) {
    return Math.min(baseMs * 2 ** attempt, capMs);
}
/** Uniform random delay in the half-open interval `[lowMs, highMs)`. */
function jitter(lowMs, highMs) {
    return lowMs + Math.random() * (highMs - lowMs);
}
/**
 * Trim up to 25% off `ms` at random so a fleet of clients backing off after a
 * shared outage does not retry in lockstep — mirrors the jitter the core client
 * applies to its own retry timeout.
 */
function applyJitter(ms) {
    return ms * (1 - Math.random() * 0.25);
}

/**
 * Return a `withOptions()` clone of `client` set up for use *by* one of the
 * runner helpers: authenticated with `authToken` as Bearer credentials, with
 * the parent's `X-Api-Key` cleared, and tagged with the helper's
 * `x-stainless-helper` value on every outgoing request.
 *
 * The returned sub-client inherits the parent's full configuration
 * (`baseURL`, `timeout`, `maxRetries`, `fetch`, `fetchOptions`, custom
 * `defaultHeaders`, `defaultQuery`). Overrides applied:
 *
 * - `authToken: authToken` — the new credential.
 * - `apiKey: null` — the parent's `X-Api-Key` is cleared. `withOptions`
 *   inherits the parent's `apiKey` by default; without this, both
 *   `X-Api-Key` *and* `Authorization: Bearer …` would land on the wire.
 *   `client.ts` only triggers the env-var fallback when `apiKey === undefined`,
 *   so explicit `null` is honored.
 * - `credentials: undefined` — opts the clone out of any inherited
 *   credentials/config/profile so the explicit bearer is the unambiguous auth.
 * - `baseURL: client.baseURL` — pins the parent's resolved host (auth override otherwise resets it).
 * - `defaultHeaders` is rebuilt as `parent._authState.extraHeaders ⊕ parent.defaultHeaders ⊕
 *   {'x-stainless-helper': helper}`. `withOptions` *replaces* (does not
 *   merge) `defaultHeaders`, so we merge here so any custom headers the
 *   caller set on the parent client survive on the sub-client.
 */
function copyClientForHelper(client, { authToken, helper }) {
    if (!authToken) {
        throw new AnthropicError(`copyClientForHelper: expected a non-empty authToken but received ${JSON.stringify(authToken)}`);
    }
    const internal = client;
    const parentDefaults = internal._options.defaultHeaders;
    // Carry the parent's credential/profile headers; strip the auth ones (we re-auth below).
    const parentAuthExtraHeaders = internal._authState?.extraHeaders;
    const inheritedAuthExtraHeaders = parentAuthExtraHeaders ?
        Object.fromEntries(Object.entries(parentAuthExtraHeaders).filter(([name]) => {
            const lower = name.toLowerCase();
            return lower !== 'authorization' && lower !== 'x-api-key';
        }))
        : undefined;
    const defaultHeaders = buildHeaders([
        inheritedAuthExtraHeaders,
        parentDefaults,
        { [STAINLESS_HELPER_HEADER]: helper },
    ]);
    return client.withOptions({
        apiKey: null,
        authToken,
        baseURL: client.baseURL,
        credentials: undefined,
        defaultHeaders,
    });
}

var _WorkPoller_runnerClient, _WorkPoller_consumed, _WorkPoller_controller, _WorkPoller_detachExternal, _WorkPoller_autoStop, _WorkPoller_drain, _WorkPoller_blockMs, _WorkPoller_reclaimOlderThanMs, _WorkPoller_requestOpts, _IdleLog_log, _IdleLog_environmentId, _IdleLog_idleSince, _IdleLog_lastReport;
// API caps block_ms at 999; rely on client-side jitter between empty polls.
const POLL_BLOCK_MS = 999;
const POLL_BACKOFF_BASE_MS = 1000;
const POLL_BACKOFF_CAP_MS = 60000;
const IDLE_REPORT_INTERVAL_MS = 300000;
/**
 * Async-iterable that long-polls a self-hosted environment for work, ack's
 * each item, yields the {@link BetaSelfHostedWork} item, and posts `stop` after
 * the consumer's loop body returns (or when the consumer `break`s).
 *
 * A yielded item may carry a per-item `secret` payload (populated only by the
 * poll response); the poller passes it through untouched — consumers such as
 * {@link EnvironmentWorker} extract the sessions token it carries and prefer
 * that over the environment key for the item's downstream calls. Treat it as
 * opaque and never log it.
 *
 * @example
 * ```ts
 * for await (const work of client.beta.environments.work.poller({
 *   environmentId,
 *   environmentKey,
 * })) {
 *   // ...service the work...
 * }
 * ```
 */
var WorkPoller = /* @__PURE__ */ (() => {
    /**
     * Async-iterable that long-polls a self-hosted environment for work, ack's
     * each item, yields the {@link BetaSelfHostedWork} item, and posts `stop` after
     * the consumer's loop body returns (or when the consumer `break`s).
     *
     * A yielded item may carry a per-item `secret` payload (populated only by the
     * poll response); the poller passes it through untouched — consumers such as
     * {@link EnvironmentWorker} extract the sessions token it carries and prefer
     * that over the environment key for the item's downstream calls. Treat it as
     * opaque and never log it.
     *
     * @example
     * ```ts
     * for await (const work of client.beta.environments.work.poller({
     *   environmentId,
     *   environmentKey,
     * })) {
     *   // ...service the work...
     * }
     * ```
     */
    class WorkPoller {
        constructor(opts) {
            // Sub-client scoped to the environment key. Every poll / ack / stop call
            // is routed through this so the parent's `X-Api-Key` never lands on the
            // wire alongside the bearer credential. The helper-telemetry header is
            // attached as a default on this client; per-call plumbing is unnecessary.
            _WorkPoller_runnerClient.set(this, void 0);
            _WorkPoller_consumed.set(this, false);
            _WorkPoller_controller.set(this, void 0);
            _WorkPoller_detachExternal.set(this, void 0);
            _WorkPoller_autoStop.set(this, void 0);
            _WorkPoller_drain.set(this, void 0);
            _WorkPoller_blockMs.set(this, void 0);
            _WorkPoller_reclaimOlderThanMs.set(this, void 0);
            _WorkPoller_requestOpts.set(this, void 0);
            this.client = opts.client;
            this.environmentId = opts.environmentId;
            this.environmentKey = opts.environmentKey;
            this.workerId = opts.workerId ?? defaultWorkerId();
            __classPrivateFieldSet(this, _WorkPoller_runnerClient, copyClientForHelper(opts.client, {
                authToken: opts.environmentKey,
                helper: 'environments-work-poller',
            }));
            __classPrivateFieldSet(this, _WorkPoller_autoStop, opts.autoStop ?? true);
            __classPrivateFieldSet(this, _WorkPoller_drain, opts.drain ?? false);
            // `undefined` => default to the API cap; an explicit `null` => omit
            // `block_ms` for a non-blocking poll.
            __classPrivateFieldSet(this, _WorkPoller_blockMs, opts.blockMs === undefined ? POLL_BLOCK_MS : opts.blockMs);
            __classPrivateFieldSet(this, _WorkPoller_reclaimOlderThanMs, opts.reclaimOlderThanMs ?? null);
            __classPrivateFieldSet(this, _WorkPoller_requestOpts, opts.requestOptions);
            __classPrivateFieldSet(this, _WorkPoller_controller, new AbortController());
            __classPrivateFieldSet(this, _WorkPoller_detachExternal, linkAbort(opts.signal, __classPrivateFieldGet(this, _WorkPoller_controller, "f")));
        }
        /** Read-only view of this iterator's abort signal. */
        get signal() {
            return __classPrivateFieldGet(this, _WorkPoller_controller, "f").signal;
        }
        /** Abort the iterator. The current `for await` will exit cleanly. */
        abort() {
            __classPrivateFieldGet(this, _WorkPoller_controller, "f").abort();
        }
        async *[(_WorkPoller_runnerClient = new WeakMap(), _WorkPoller_consumed = new WeakMap(), _WorkPoller_controller = new WeakMap(), _WorkPoller_detachExternal = new WeakMap(), _WorkPoller_autoStop = new WeakMap(), _WorkPoller_drain = new WeakMap(), _WorkPoller_blockMs = new WeakMap(), _WorkPoller_reclaimOlderThanMs = new WeakMap(), _WorkPoller_requestOpts = new WeakMap(), Symbol.asyncIterator)]() {
            if (__classPrivateFieldGet(this, _WorkPoller_consumed, "f")) {
                throw new AnthropicError('Cannot iterate over a consumed WorkPoller');
            }
            __classPrivateFieldSet(this, _WorkPoller_consumed, true);
            const log = loggerFor(this.client);
            log.info('poller starting', {
                component: 'work-poller',
                environment_id: this.environmentId,
            });
            const idle = new IdleLog(log, this.environmentId);
            try {
                let attempt = 0;
                while (!__classPrivateFieldGet(this, _WorkPoller_controller, "f").signal.aborted) {
                    let work;
                    try {
                        work = await __classPrivateFieldGet(this, _WorkPoller_runnerClient, "f").beta.environments.work.poll(this.environmentId, {
                            'Anthropic-Worker-ID': this.workerId,
                            ...(__classPrivateFieldGet(this, _WorkPoller_blockMs, "f") !== null ? { block_ms: __classPrivateFieldGet(this, _WorkPoller_blockMs, "f") } : {}),
                            ...(__classPrivateFieldGet(this, _WorkPoller_reclaimOlderThanMs, "f") !== null ?
                                { reclaim_older_than_ms: __classPrivateFieldGet(this, _WorkPoller_reclaimOlderThanMs, "f") }
                                : {}),
                        }, { headers: buildHeaders([__classPrivateFieldGet(this, _WorkPoller_requestOpts, "f")?.headers]), signal: __classPrivateFieldGet(this, _WorkPoller_controller, "f").signal });
                    }
                    catch (e) {
                        if (__classPrivateFieldGet(this, _WorkPoller_controller, "f").signal.aborted)
                            return;
                        // A bad environment key / missing environment never recovers — surface
                        // it instead of spinning forever at the backoff cap.
                        if (isFatal4xx(e)) {
                            log.error('poll failed permanently, stopping poller', { error: String(e) });
                            throw e;
                        }
                        // Jittered exponential backoff so a fleet of pollers doesn't retry in
                        // lockstep after a shared outage.
                        const wait = applyJitter(backoff(attempt));
                        log.warn('poll failed, backing off', { error: String(e), backoff_ms: wait });
                        attempt++;
                        await sleep(wait, __classPrivateFieldGet(this, _WorkPoller_controller, "f").signal);
                        continue;
                    }
                    attempt = 0;
                    if (work == null) {
                        // Queue empty: either return now (drain) or wait and poll again.
                        if (__classPrivateFieldGet(this, _WorkPoller_drain, "f"))
                            return;
                        idle.onEmptyPoll();
                        await sleep(jitter(1000, 3000), __classPrivateFieldGet(this, _WorkPoller_controller, "f").signal);
                        continue;
                    }
                    idle.onClaim();
                    log.info('claimed work', {
                        component: 'work-poller',
                        environment_id: this.environmentId,
                        work_id: work.id,
                        work_type: work.data.type,
                    });
                    try {
                        await __classPrivateFieldGet(this, _WorkPoller_runnerClient, "f").beta.environments.work.ack(work.id, { environment_id: work.environment_id }, { headers: buildHeaders([__classPrivateFieldGet(this, _WorkPoller_requestOpts, "f")?.headers]), signal: __classPrivateFieldGet(this, _WorkPoller_controller, "f").signal });
                    }
                    catch (e) {
                        log.error('ack failed', { work_id: work.id, error: String(e) });
                        continue;
                    }
                    try {
                        yield work;
                    }
                    finally {
                        // Post-handler stop. Runs whether the consumer body returned
                        // normally, threw, or `break`d out of the loop — unless the consumer
                        // owns the stop itself (`autoStop: false`).
                        if (__classPrivateFieldGet(this, _WorkPoller_autoStop, "f")) {
                            try {
                                await __classPrivateFieldGet(this, _WorkPoller_runnerClient, "f").beta.environments.work.stop(work.id, { environment_id: work.environment_id }, { headers: buildHeaders([__classPrivateFieldGet(this, _WorkPoller_requestOpts, "f")?.headers]) });
                            }
                            catch (e) {
                                if (!isStatus(e, 409))
                                    log.warn('stop failed', { work_id: work.id, error: String(e) });
                            }
                        }
                    }
                }
            }
            finally {
                // Detach from the external signal so the consumer can drop their
                // signal reference without leaking this iterator instance.
                __classPrivateFieldGet(this, _WorkPoller_detachExternal, "f").call(this);
            }
        }
    }
    return WorkPoller;
})();
/** Exponential poll backoff: 1s, 2s, 4s … clamped to a 60s cap. */
function backoff(attempt) {
    return backoff$1(attempt, POLL_BACKOFF_BASE_MS, POLL_BACKOFF_CAP_MS);
}
var IdleLog = /* @__PURE__ */ (() => {
    /**
     * Keeps an idle poll loop visible in the logs without an INFO line per poll:
     * the first empty poll after start-up or after a claim logs at INFO and later
     * ones at DEBUG, with an INFO reminder every `IDLE_REPORT_INTERVAL_MS` while
     * the loop stays idle.
     */
    class IdleLog {
        constructor(log, environmentId) {
            _IdleLog_log.set(this, void 0);
            _IdleLog_environmentId.set(this, void 0);
            _IdleLog_idleSince.set(this, void 0);
            _IdleLog_lastReport.set(this, 0);
            __classPrivateFieldSet(this, _IdleLog_log, log);
            __classPrivateFieldSet(this, _IdleLog_environmentId, environmentId);
        }
        onEmptyPoll() {
            const now = Date.now();
            const fields = { component: 'work-poller', environment_id: __classPrivateFieldGet(this, _IdleLog_environmentId, "f") };
            if (__classPrivateFieldGet(this, _IdleLog_idleSince, "f") === undefined) {
                __classPrivateFieldSet(this, _IdleLog_idleSince, __classPrivateFieldSet(this, _IdleLog_lastReport, now, "f"));
                __classPrivateFieldGet(this, _IdleLog_log, "f").info('idle; polling for work', fields);
            }
            else if (now - __classPrivateFieldGet(this, _IdleLog_lastReport, "f") >= IDLE_REPORT_INTERVAL_MS) {
                __classPrivateFieldSet(this, _IdleLog_lastReport, now);
                __classPrivateFieldGet(this, _IdleLog_log, "f").info(`still polling; idle for ${Math.round((now - __classPrivateFieldGet(this, _IdleLog_idleSince, "f")) / 1000)}s`, fields);
            }
            else {
                __classPrivateFieldGet(this, _IdleLog_log, "f").debug('poll returned no work', fields);
            }
        }
        onClaim() {
            __classPrivateFieldSet(this, _IdleLog_idleSince, undefined);
        }
    }
    _IdleLog_log = new WeakMap(), _IdleLog_environmentId = new WeakMap(), _IdleLog_idleSince = new WeakMap(), _IdleLog_lastReport = new WeakMap();
    return IdleLog;
})();
function defaultWorkerId() {
    // The API documents the worker id as a *unique* identifier for Redis consumer
    // groups, so the fallback must be unique even when several pollers share a
    // host. Prefix with the hostname when one is exposed for readability, but rely
    // on the uuid for uniqueness.
    const env = globalThis.process?.env;
    const host = env?.['HOSTNAME'];
    return host ? `${host}-${uuid4()}` : uuid4();
}

var _AsyncQueue_items, _AsyncQueue_waiters, _AsyncQueue_closed;
/**
 * Single-consumer async queue that bridges background producers to an
 * `AsyncIterator`-style reader. Producers `push()` items; the consumer awaits
 * `next()`. `close()` is idempotent and wakes any pending `next()` with
 * `done: true`. `tryShift()` synchronously drains remaining items after
 * iteration has been signalled to stop.
 */
var AsyncQueue = /* @__PURE__ */ (() => {
    /**
     * Single-consumer async queue that bridges background producers to an
     * `AsyncIterator`-style reader. Producers `push()` items; the consumer awaits
     * `next()`. `close()` is idempotent and wakes any pending `next()` with
     * `done: true`. `tryShift()` synchronously drains remaining items after
     * iteration has been signalled to stop.
     */
    class AsyncQueue {
        constructor() {
            _AsyncQueue_items.set(this, []);
            _AsyncQueue_waiters.set(this, []);
            _AsyncQueue_closed.set(this, false);
        }
        /** Enqueue an item, or hand it directly to a waiting reader. Returns `false` once closed. */
        push(item) {
            if (__classPrivateFieldGet(this, _AsyncQueue_closed, "f"))
                return false;
            const w = __classPrivateFieldGet(this, _AsyncQueue_waiters, "f").shift();
            if (w)
                w({ done: false, value: item });
            else
                __classPrivateFieldGet(this, _AsyncQueue_items, "f").push(item);
            return true;
        }
        /** Mark the queue done. Idempotent; wakes every pending reader with `done: true`. */
        close() {
            if (__classPrivateFieldGet(this, _AsyncQueue_closed, "f"))
                return;
            __classPrivateFieldSet(this, _AsyncQueue_closed, true);
            while (__classPrivateFieldGet(this, _AsyncQueue_waiters, "f").length > 0) {
                const w = __classPrivateFieldGet(this, _AsyncQueue_waiters, "f").shift();
                w({ done: true, value: undefined });
            }
        }
        /**
         * Resolve with the next item, or `done: true` once the queue is closed and
         * drained. When `signal` is supplied, aborting it resolves a pending read
         * with `done: true` (cancellation is pushed down here rather than handled by
         * an outer `Promise.race`).
         */
        next(signal) {
            if (__classPrivateFieldGet(this, _AsyncQueue_items, "f").length > 0) {
                return Promise.resolve({ done: false, value: __classPrivateFieldGet(this, _AsyncQueue_items, "f").shift() });
            }
            if (__classPrivateFieldGet(this, _AsyncQueue_closed, "f") || signal?.aborted) {
                return Promise.resolve({ done: true, value: undefined });
            }
            return new Promise((resolve) => {
                const waiter = (r) => {
                    signal?.removeEventListener('abort', onAbort);
                    resolve(r);
                };
                const onAbort = () => {
                    const idx = __classPrivateFieldGet(this, _AsyncQueue_waiters, "f").indexOf(waiter);
                    if (idx >= 0)
                        __classPrivateFieldGet(this, _AsyncQueue_waiters, "f").splice(idx, 1);
                    resolve({ done: true, value: undefined });
                };
                __classPrivateFieldGet(this, _AsyncQueue_waiters, "f").push(waiter);
                signal?.addEventListener('abort', onAbort, { once: true });
            });
        }
        /** Synchronously remove and return the next buffered item, or `undefined` if empty. */
        tryShift() {
            return __classPrivateFieldGet(this, _AsyncQueue_items, "f").shift();
        }
    }
    _AsyncQueue_items = new WeakMap(), _AsyncQueue_waiters = new WeakMap(), _AsyncQueue_closed = new WeakMap();
    return AsyncQueue;
})();

/**
 * An error that can be thrown from a tool's `run` method to return structured
 * content blocks as the error result, rather than just a string message.
 *
 * When the ToolRunner catches this error, it will use the `content` property
 * as the tool result with `is_error: true`.
 *
 * @example
 * ```ts
 * const tool = {
 *   name: 'my_tool',
 *   run: async (input) => {
 *     if (somethingWentWrong) {
 *       throw new ToolError([
 *         { type: 'text', text: 'Error details here' },
 *         { type: 'image', source: { type: 'base64', data: '...', media_type: 'image/png' } },
 *       ]);
 *     }
 *     return 'success';
 *   },
 * };
 * ```
 */
var ToolError = /* @__PURE__ */ (() => {
    /**
     * An error that can be thrown from a tool's `run` method to return structured
     * content blocks as the error result, rather than just a string message.
     *
     * When the ToolRunner catches this error, it will use the `content` property
     * as the tool result with `is_error: true`.
     *
     * @example
     * ```ts
     * const tool = {
     *   name: 'my_tool',
     *   run: async (input) => {
     *     if (somethingWentWrong) {
     *       throw new ToolError([
     *         { type: 'text', text: 'Error details here' },
     *         { type: 'image', source: { type: 'base64', data: '...', media_type: 'image/png' } },
     *       ]);
     *     }
     *     return 'success';
     *   },
     * };
     * ```
     */
    class ToolError extends Error {
        constructor(content) {
            const message = typeof content === 'string' ? content : (content
                .map((block) => {
                if (block.type === 'text')
                    return block.text;
                return `[${block.type}]`;
            })
                .join(' '));
            super(message);
            this.name = 'ToolError';
            this.content = content;
        }
    }
    return ToolError;
})();

/**
 * C0 and C1 controls, the line separators and the bidi controls: anything that would break or reorder the one line a
 * page- or model-supplied value goes into.
 */
const LINE_UNSAFE = '\\x00-\\x1f\\x7f-\\x9f\\u061c\\u200e\\u200f\\u2028\\u2029\\u202a-\\u202e\\u2066-\\u2069';
const CONTROL_RE = /* @__PURE__ */ (() => new RegExp(`[${LINE_UNSAFE}]+`, 'g'))();
// An unpaired surrogate cannot be encoded as UTF-8: in a page-chosen string it would fail every request for as long
// as the driver keeps reporting it. Folded to U+FFFD wherever page text is normalised (with the `u` flag the class
// matches a surrogate only when it stands alone).
const LONE_SURROGATE_RE = /[\uD800-\uDFFF]/gu;
/** `text` with each unpaired surrogate replaced by U+FFFD, so it can be sent. */
function wellFormed(text) {
    return text.replace(LONE_SURROGATE_RE, '\uFFFD');
}
/**
 * The API's limit for a text field of the block, for a URL, and the most of an exception's text an `is_error` result
 * holds.
 */
const FIELD_MAX = 4096;
const LOG_MAX = 200;
/**
 * A page- or model-supplied text on one line the model or an operator reads: a tab's title, a download's
 * error, a field of a member's confirmation line. Line breaks, control and bidi characters are folded to
 * spaces, a lone surrogate to U+FFFD, the ends trimmed, and the whole cut to `limit`.
 */
function oneLine(text, limit = FIELD_MAX) {
    return cutPoints(wellFormed(text).replace(CONTROL_RE, ' ').trim(), limit);
}
/** A model- or page-supplied name for a log record or an SDK-written error text: `oneLine`, cut short. @internal */
function logSafe(name) {
    return oneLine(name, LOG_MAX);
}
/**
 * A model-chosen name as it is echoed inside single quotes in a text the model reads: one line, cut short, and without
 * the quotes and runs of spaces that could make it read as part of the text around it.
 * @internal
 */
function quotedName(name) {
    return logSafe(name).replace(/[' ]+/g, ' ').trim();
}
/** `Error: <message>` for a thrown value other than a `ToolError`: an `Error`'s message, else it as a string. */
function thrownErrorText(e) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`;
}
/**
 * A caught exception's text as the `is_error` result the model reads (the same `Error: <message>` a failing function
 * tool produces), made well-formed and cut to the field limit: a driver's exception can embed a page-sized payload.
 */
function errorText(error) {
    return cutPoints(wellFormed(thrownErrorText(error)), FIELD_MAX);
}
/**
 * The first `limit` code points of `text`: a cut by UTF-16 units could split a surrogate pair, and a lone surrogate
 * fails the request.
 */
function cutPoints(text, limit) {
    if (text.length <= limit)
        return text; // no more UTF-16 units than the limit: no more code points either
    let end = 0;
    let points = 0;
    for (const ch of text) {
        if (points === limit)
            break;
        points += 1;
        end += ch.length;
    }
    return text.slice(0, end);
}
/**
 * The text blocks of a `ToolError`'s content. Deliberate, like the empty-content placeholder: the API accepts only
 * text on an is_error result and answers anything else with a 400 that ends the run, so an image a member attached to
 * its refusal is dropped here rather than ending the whole loop. The refusal's text still reaches the model.
 */
function errorTextContent(content) {
    // The API rejects an `is_error` result whose content is empty or holds a non-text block. Empty text blocks are
    // dropped too, so an error with no text left gets the placeholder from `toolsetResultBlock`.
    if (typeof content === 'string')
        return wellFormed(content);
    return content
        .filter((block) => block.type === 'text' && block.text !== '')
        .map((block) => ({ ...block, text: wellFormed(block.text) }));
}

/**
 * The name the model calls a tool by: `mcp_server_name` for MCP toolsets, `type` for nameless server
 * toolsets (browser/computer), `name` for everything else.
 */
function toolName(tool) {
    return ('name' in tool ? tool.name
        : 'mcp_server_name' in tool ? tool.mcp_server_name
            : tool.type);
}
/** Tool-result content for a thrown value: a {@link ToolError}'s own content, otherwise `Error: <message>`. */
function toolErrorContent(e) {
    return e instanceof ToolError ? e.content : thrownErrorText(e);
}
/** Parse the input, run the tool, and turn anything thrown into an error result. */
async function runRunnableTool(tool, rawInput, context) {
    try {
        const input = tool.parse ? tool.parse(rawInput) : rawInput;
        const content = await tool.run(input, context);
        return { content, isError: false };
    }
    catch (e) {
        return { content: toolErrorContent(e), isError: true };
    }
}

var _IdleClock_maxIdleMs, _IdleClock_onExpire, _IdleClock_blockers, _IdleClock_armPending, _IdleClock_timer, _SessionToolRunner_instances, _SessionToolRunner_consumed, _SessionToolRunner_controller, _SessionToolRunner_detachExternal, _SessionToolRunner_requestOpts, _SessionToolRunner_toolByName, _SessionToolRunner_logger, _SessionToolRunner_seen, _SessionToolRunner_answered, _SessionToolRunner_confirmationVerdicts, _SessionToolRunner_awaitingConfirmation, _SessionToolRunner_results, _SessionToolRunner_inFlightCount, _SessionToolRunner_sendRetryWindowMs, _SessionToolRunner_onIdle, _SessionToolRunner_idleClock, _SessionToolRunner_requestOptions, _SessionToolRunner_streamLoop, _SessionToolRunner_reconcile, _SessionToolRunner_ingestHistory, _SessionToolRunner_handleStreamEvent, _SessionToolRunner_routeToolEvent, _SessionToolRunner_noteConfirmation, _SessionToolRunner_applyVerdict, _SessionToolRunner_surfaceCall, _SessionToolRunner_execute, _SessionToolRunner_sendResult, _SessionToolRunner_drain;
const STREAM_BACKOFF_START_MS = 500;
const STREAM_BACKOFF_CAP_MS = 10000;
const TOOL_TIMEOUT_MS = 120000;
const DRAIN_TIMEOUT_MS = 30000;
const SEND_BACKOFF_START_MS = 1000;
const SEND_BACKOFF_CAP_MS = 30000;
/**
 * How long a transiently failing tool-result send keeps retrying when the
 * runner is used on its own: the server's default work-item lease TTL.
 * `EnvironmentWorker` overrides it with the live TTL from each lease heartbeat
 * (`_setSendRetryWindow`), so a send is only abandoned once the lease can no
 * longer be ours.
 */
const SEND_RETRY_WINDOW_MS = 5 * 60000;
/** Default {@link SessionToolRunnerOptions.maxIdleMs}: 60 seconds. */
const DEFAULT_MAX_IDLE_MS = 60000;
/**
 * Whether `ev` is a `session.status_idle` whose turn is over. Only
 * `requires_action` leaves the turn open: the session resumes once a client
 * resolves the events it names. Every other stop reason ends the turn, including
 * one newer than this SDK's types.
 */
function endsTurn(ev) {
    if (ev.type !== 'session.status_idle')
        return false;
    return ev.stop_reason?.type !== 'requires_action';
}
var IdleClock = /* @__PURE__ */ (() => {
    /**
     * The `maxIdleMs` stop-countdown, including its deferral. {@link noteEvent}
     * arms on an idle that ends the turn and disarms on anything else. Gated tool
     * work registered via {@link block} — a call held for user confirmation, or a
     * user-approved call still dispatching — keeps
     * {@link arm} pending until {@link unblock} retires the last blocker, at which
     * point the countdown starts. Event-driven — there is no polling watchdog.
     */
    class IdleClock {
        constructor(maxIdleMs, onExpire) {
            _IdleClock_maxIdleMs.set(this, void 0);
            _IdleClock_onExpire.set(this, void 0);
            _IdleClock_blockers.set(this, new Set());
            // Set when arm() found blockers outstanding; the unblock that retires the
            // last blocker applies it. Cleared by any disarm.
            _IdleClock_armPending.set(this, false);
            _IdleClock_timer.set(this, void 0);
            __classPrivateFieldSet(this, _IdleClock_maxIdleMs, maxIdleMs);
            __classPrivateFieldSet(this, _IdleClock_onExpire, onExpire);
        }
        /**
         * Arm on an idle that ends the turn; disarm otherwise. `user.tool_confirmation`
         * is neutral: it signals neither agent activity nor an idle, and its effect
         * on the clock flows through {@link block} / {@link unblock} instead —
         * disarming here would discard the pending arm the verdict is about to
         * settle.
         */
        noteEvent(ev) {
            if (ev.type === 'user.tool_confirmation')
                return;
            if (endsTurn(ev))
                this.arm();
            else
                this.disarm();
        }
        /** Register gated work that must resolve before an idle countdown starts. */
        block(toolUseId) {
            __classPrivateFieldGet(this, _IdleClock_blockers, "f").add(toolUseId);
            if (__classPrivateFieldGet(this, _IdleClock_timer, "f") !== undefined) {
                // Defensive: every caller disarms first (any event that routes a tool
                // call is itself a disarming event), but a countdown running when gated
                // work appears is stale evidence — the session is not idly waiting to
                // stop. Convert it into a pending arm rather than let it fire over the
                // gated call.
                __classPrivateFieldSet(this, _IdleClock_armPending, true);
                clearTimeout(__classPrivateFieldGet(this, _IdleClock_timer, "f"));
                __classPrivateFieldSet(this, _IdleClock_timer, undefined);
            }
        }
        /**
         * Retire gated work (a no-op for ids never blocked); applies a pending arm —
         * with a fresh full `maxIdleMs` window — once the last blocker retires.
         */
        unblock(toolUseId) {
            __classPrivateFieldGet(this, _IdleClock_blockers, "f").delete(toolUseId);
            if (__classPrivateFieldGet(this, _IdleClock_blockers, "f").size === 0 && __classPrivateFieldGet(this, _IdleClock_armPending, "f"))
                this.arm();
        }
        /**
         * (Re)start the idle countdown — or, while blockers are outstanding, hold
         * the arm pending instead. Stopping then would drop a held call when its
         * verdict later arrives, or cut the runner off before a released call's
         * result can drive the next turn.
         */
        arm() {
            if (__classPrivateFieldGet(this, _IdleClock_maxIdleMs, "f") <= 0)
                return;
            if (__classPrivateFieldGet(this, _IdleClock_blockers, "f").size > 0) {
                __classPrivateFieldSet(this, _IdleClock_armPending, true);
                return;
            }
            __classPrivateFieldSet(this, _IdleClock_armPending, false);
            if (__classPrivateFieldGet(this, _IdleClock_timer, "f") !== undefined)
                clearTimeout(__classPrivateFieldGet(this, _IdleClock_timer, "f"));
            __classPrivateFieldSet(this, _IdleClock_timer, setTimeout(__classPrivateFieldGet(this, _IdleClock_onExpire, "f"), __classPrivateFieldGet(this, _IdleClock_maxIdleMs, "f")));
        }
        /**
         * Cancel the idle countdown and any pending arm. Blockers persist — they
         * track real outstanding work, retired only by {@link unblock}.
         */
        disarm() {
            __classPrivateFieldSet(this, _IdleClock_armPending, false);
            if (__classPrivateFieldGet(this, _IdleClock_timer, "f") !== undefined) {
                clearTimeout(__classPrivateFieldGet(this, _IdleClock_timer, "f"));
                __classPrivateFieldSet(this, _IdleClock_timer, undefined);
            }
        }
    }
    _IdleClock_maxIdleMs = new WeakMap(), _IdleClock_onExpire = new WeakMap(), _IdleClock_blockers = new WeakMap(), _IdleClock_armPending = new WeakMap(), _IdleClock_timer = new WeakMap();
    return IdleClock;
})();
/**
 * The sessions-side counterpart to `client.beta.messages.toolRunner`: an
 * async-iterable that attaches to a managed-agents session, executes every
 * incoming `agent.tool_use` and `agent.custom_tool_use` event against a local
 * tool registry, posts the matching result back (`user.tool_result` for the
 * former, `user.custom_tool_result` for the latter), and yields one
 * {@link DispatchedToolCall} per completed call. Server-side `agent.mcp_tool_use`
 * calls are not dispatched. Internally drives event-stream reconnect and result
 * posting.
 *
 * A call the server gated with `evaluated_permission: "ask"` (the `always_ask`
 * policy — or any value this SDK doesn't recognize, which fails closed) is held
 * until its `user.tool_confirmation` arrives: only an explicit `allow` runs it;
 * `deny` — or any verdict this SDK doesn't recognize, failing closed — is never
 * executed and posts nothing (the denial resolves the call server-side), but is
 * still yielded (`confirmation="deny"`, `posted=false`, `result=undefined`) so
 * the consumer can observe it. A held call — and a user-approved one still
 * dispatching — defers the `maxIdleMs` countdown, so an idle observed in the
 * meantime cannot stop the runner: it waits until the verdict arrives, the
 * session terminates, or the abort signal fires — pass
 * `AbortSignal.timeout(...)` for a wall-clock bound.
 *
 * Iteration ends when the session terminates (`session.status_terminated` /
 * `session.deleted`), when the consumer `break`s out of the loop or aborts the
 * supplied signal, or — once the session has gone idle with any `stop_reason.type`
 * but `"requires_action"` — when `maxIdleMs` elapses with no new event (any
 * new event resets that countdown; it re-arms on the next such idle;
 * `maxIdleMs <= 0` disables it). The `finally` branch drains any in-flight
 * tool calls and runs each tool's `close()` cleanup hook. It does *not* touch
 * the work-item lease — wrap it in an `EnvironmentWorker` if you need
 * heartbeating / force-stop.
 *
 * @example
 * ```ts
 * import { betaAgentToolset20260401 } from '@anthropic-ai/sdk/tools/agent-toolset/node';
 *
 * for await (const call of client.beta.sessions.events.toolRunner(work.data.id, {
 *   tools: [...betaAgentToolset20260401({ workdir }), myTool],
 * })) {
 *   console.log(`${call.name} -> ${call.isError ? 'error' : 'ok'}`);
 * }
 * ```
 */
var SessionToolRunner = /* @__PURE__ */ (() => {
    /**
     * The sessions-side counterpart to `client.beta.messages.toolRunner`: an
     * async-iterable that attaches to a managed-agents session, executes every
     * incoming `agent.tool_use` and `agent.custom_tool_use` event against a local
     * tool registry, posts the matching result back (`user.tool_result` for the
     * former, `user.custom_tool_result` for the latter), and yields one
     * {@link DispatchedToolCall} per completed call. Server-side `agent.mcp_tool_use`
     * calls are not dispatched. Internally drives event-stream reconnect and result
     * posting.
     *
     * A call the server gated with `evaluated_permission: "ask"` (the `always_ask`
     * policy — or any value this SDK doesn't recognize, which fails closed) is held
     * until its `user.tool_confirmation` arrives: only an explicit `allow` runs it;
     * `deny` — or any verdict this SDK doesn't recognize, failing closed — is never
     * executed and posts nothing (the denial resolves the call server-side), but is
     * still yielded (`confirmation="deny"`, `posted=false`, `result=undefined`) so
     * the consumer can observe it. A held call — and a user-approved one still
     * dispatching — defers the `maxIdleMs` countdown, so an idle observed in the
     * meantime cannot stop the runner: it waits until the verdict arrives, the
     * session terminates, or the abort signal fires — pass
     * `AbortSignal.timeout(...)` for a wall-clock bound.
     *
     * Iteration ends when the session terminates (`session.status_terminated` /
     * `session.deleted`), when the consumer `break`s out of the loop or aborts the
     * supplied signal, or — once the session has gone idle with any `stop_reason.type`
     * but `"requires_action"` — when `maxIdleMs` elapses with no new event (any
     * new event resets that countdown; it re-arms on the next such idle;
     * `maxIdleMs <= 0` disables it). The `finally` branch drains any in-flight
     * tool calls and runs each tool's `close()` cleanup hook. It does *not* touch
     * the work-item lease — wrap it in an `EnvironmentWorker` if you need
     * heartbeating / force-stop.
     *
     * @example
     * ```ts
     * import { betaAgentToolset20260401 } from '@anthropic-ai/sdk/tools/agent-toolset/node';
     *
     * for await (const call of client.beta.sessions.events.toolRunner(work.data.id, {
     *   tools: [...betaAgentToolset20260401({ workdir }), myTool],
     * })) {
     *   console.log(`${call.name} -> ${call.isError ? 'error' : 'ok'}`);
     * }
     * ```
     */
    class SessionToolRunner {
        constructor(sessionId, opts) {
            _SessionToolRunner_instances.add(this);
            _SessionToolRunner_consumed.set(this, false);
            _SessionToolRunner_controller.set(this, void 0);
            _SessionToolRunner_detachExternal.set(this, void 0);
            _SessionToolRunner_requestOpts.set(this, void 0);
            _SessionToolRunner_toolByName.set(this, void 0);
            _SessionToolRunner_logger.set(this, void 0);
            _SessionToolRunner_seen.set(this, new Set());
            _SessionToolRunner_answered.set(this, new Set());
            // Confirmation gating (`always_ask` tools): `#confirmationVerdicts` records
            // every `user.tool_confirmation` verdict by `tool_use_id`;
            // `#awaitingConfirmation` holds the tool-call events whose
            // `evaluated_permission` is `ask` and whose verdict has not arrived —
            // released (or resolved as denied) by `#noteConfirmation` / the next
            // reconcile pass. Like `#seen` and `#answered`, `#confirmationVerdicts` is
            // per-session O(tool calls): recorded verdicts persist for the life of the run.
            _SessionToolRunner_confirmationVerdicts.set(this, new Map());
            _SessionToolRunner_awaitingConfirmation.set(this, new Map());
            _SessionToolRunner_results.set(this, new AsyncQueue());
            _SessionToolRunner_inFlightCount.set(this, 0);
            _SessionToolRunner_sendRetryWindowMs.set(this, SEND_RETRY_WINDOW_MS);
            _SessionToolRunner_onIdle.set(this, null);
            _SessionToolRunner_idleClock.set(this, void 0);
            this.client = opts.client;
            this.sessionId = sessionId;
            this.tools = opts.tools;
            this.maxIdleMs = opts.maxIdleMs ?? DEFAULT_MAX_IDLE_MS;
            __classPrivateFieldSet(this, _SessionToolRunner_logger, loggerFor(opts.client));
            __classPrivateFieldSet(this, _SessionToolRunner_toolByName, new Map(opts.tools.map((t) => [toolName(t), t])));
            __classPrivateFieldSet(this, _SessionToolRunner_controller, new AbortController());
            __classPrivateFieldSet(this, _SessionToolRunner_detachExternal, linkAbort(opts.signal, __classPrivateFieldGet(this, _SessionToolRunner_controller, "f")));
            __classPrivateFieldSet(this, _SessionToolRunner_requestOpts, opts.requestOptions);
            __classPrivateFieldSet(this, _SessionToolRunner_idleClock, new IdleClock(this.maxIdleMs, () => {
                __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").info('session idle after its turn ended; stopping', {
                    component: 'session-tool-runner',
                    session_id: this.sessionId,
                    max_idle_ms: this.maxIdleMs,
                });
                __classPrivateFieldGet(this, _SessionToolRunner_controller, "f").abort();
            }));
        }
        /** Read-only view of this runner's abort signal. */
        get signal() {
            return __classPrivateFieldGet(this, _SessionToolRunner_controller, "f").signal;
        }
        /** Abort the runner. Background tasks will wind down and `for await` will exit cleanly. */
        abort() {
            __classPrivateFieldGet(this, _SessionToolRunner_controller, "f").abort();
        }
        /**
         * @internal
         * `EnvironmentWorker` keeps this equal to the lease TTL each heartbeat
         * reports; applies to a send already retrying.
         */
        _setSendRetryWindow(ms) {
            __classPrivateFieldSet(this, _SessionToolRunner_sendRetryWindowMs, ms);
        }
        async *[(_SessionToolRunner_consumed = new WeakMap(), _SessionToolRunner_controller = new WeakMap(), _SessionToolRunner_detachExternal = new WeakMap(), _SessionToolRunner_requestOpts = new WeakMap(), _SessionToolRunner_toolByName = new WeakMap(), _SessionToolRunner_logger = new WeakMap(), _SessionToolRunner_seen = new WeakMap(), _SessionToolRunner_answered = new WeakMap(), _SessionToolRunner_confirmationVerdicts = new WeakMap(), _SessionToolRunner_awaitingConfirmation = new WeakMap(), _SessionToolRunner_results = new WeakMap(), _SessionToolRunner_inFlightCount = new WeakMap(), _SessionToolRunner_sendRetryWindowMs = new WeakMap(), _SessionToolRunner_onIdle = new WeakMap(), _SessionToolRunner_idleClock = new WeakMap(), _SessionToolRunner_instances = new WeakSet(), Symbol.asyncIterator)]() {
            if (__classPrivateFieldGet(this, _SessionToolRunner_consumed, "f")) {
                throw new AnthropicError('Cannot iterate over a consumed SessionToolRunner');
            }
            __classPrivateFieldSet(this, _SessionToolRunner_consumed, true);
            __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").info('session tool runner starting', {
                component: 'session-tool-runner',
                session_id: this.sessionId,
            });
            // The one background promise: drives the event stream and dispatches tools.
            // Its `.catch` aborts the controller so the main loop unwinds.
            const streamPromise = __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_streamLoop).call(this).catch((e) => {
                if (!__classPrivateFieldGet(this, _SessionToolRunner_controller, "f").signal.aborted) {
                    __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").error('stream loop failed', { error: String(e) });
                }
                __classPrivateFieldGet(this, _SessionToolRunner_controller, "f").abort();
            });
            try {
                // Phase 1: yield results as they arrive. `next(signal)` resolves
                // `done: true` when the controller aborts — cancellation is handled in
                // the queue read, no outer `Promise.race` needed.
                while (true) {
                    const next = await __classPrivateFieldGet(this, _SessionToolRunner_results, "f").next(__classPrivateFieldGet(this, _SessionToolRunner_controller, "f").signal);
                    if (next.done)
                        break;
                    yield next.value;
                }
                // Phase 2: let the stream loop settle (and push any final results), then
                // drain whatever is still queued before closing.
                await streamPromise;
                let pending;
                while ((pending = __classPrivateFieldGet(this, _SessionToolRunner_results, "f").tryShift()) !== undefined) {
                    yield pending;
                }
            }
            finally {
                __classPrivateFieldGet(this, _SessionToolRunner_controller, "f").abort();
                __classPrivateFieldGet(this, _SessionToolRunner_idleClock, "f").disarm();
                // Re-await defensively in case the consumer broke out of phase 1 before
                // phase 2 ran — a no-op if it already settled.
                await streamPromise;
                try {
                    await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_drain).call(this);
                }
                catch (e) {
                    __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").warn('drain failed', { error: String(e) });
                }
                __classPrivateFieldGet(this, _SessionToolRunner_results, "f").close();
                for (const t of this.tools) {
                    try {
                        // `close` is typed `() => Promisable<void>`, so a single `await`
                        // covers both the sync and async return.
                        await t.close?.();
                    }
                    catch (e) {
                        __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").warn('tool.close failed', { tool: toolName(t), error: String(e) });
                    }
                }
                // Detach from the external signal so the consumer can drop their signal
                // reference without leaking this iterator instance.
                __classPrivateFieldGet(this, _SessionToolRunner_detachExternal, "f").call(this);
            }
        }
    }
    _SessionToolRunner_requestOptions = function _SessionToolRunner_requestOptions() {
        return {
            ...__classPrivateFieldGet(this, _SessionToolRunner_requestOpts, "f"),
            headers: buildHeaders([helperHeader('session-tool-runner'), __classPrivateFieldGet(this, _SessionToolRunner_requestOpts, "f")?.headers]),
            signal: __classPrivateFieldGet(this, _SessionToolRunner_controller, "f").signal,
        };
    }, _SessionToolRunner_streamLoop = 
    // ===== event stream =====
    async function _SessionToolRunner_streamLoop() {
        const ctrl = __classPrivateFieldGet(this, _SessionToolRunner_controller, "f");
        let backoff = STREAM_BACKOFF_START_MS;
        while (!ctrl.signal.aborted) {
            try {
                // Establish the event stream *before* reconciling history, so an event
                // emitted in the gap between listing and attaching is buffered on the
                // stream rather than lost. `seen`/`answered` dedup any event that shows
                // up both in the reconcile pass and on the live stream.
                const stream = await this.client.beta.sessions.events.stream(this.sessionId, {}, __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_requestOptions).call(this));
                await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_reconcile).call(this);
                for await (const ev of stream) {
                    backoff = STREAM_BACKOFF_START_MS;
                    if (await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_handleStreamEvent).call(this, ev))
                        return;
                }
            }
            catch (e) {
                // An abort throws to unwind the caller (the iterator's `streamPromise`
                // `.catch`) rather than returning early and letting it carry on.
                ctrl.signal.throwIfAborted();
                if (isFatal4xx(e)) {
                    __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").error('permanent stream failure, shutting down', { error: String(e) });
                    ctrl.abort();
                    throw e;
                }
                __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").warn('stream disconnected, reconnecting', {
                    error: String(e),
                    backoff_ms: backoff,
                });
            }
            ctrl.signal.throwIfAborted();
            await sleep(backoff, ctrl.signal);
            backoff = Math.min(backoff * 2, STREAM_BACKOFF_CAP_MS);
        }
    }, _SessionToolRunner_reconcile = 
    /**
     * Read full history before dispatching so a `tool_use` whose result appears
     * later in the same history is not re-executed. Runs after the live stream is
     * already attached (see {@link SessionToolRunner.#streamLoop}).
     */
    async function _SessionToolRunner_reconcile() {
        const ctrl = __classPrivateFieldGet(this, _SessionToolRunner_controller, "f");
        const pending = [];
        let lastEndedTurn = false;
        try {
            for await (const ev of this.client.beta.sessions.events.list(this.sessionId, { limit: 1000 }, __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_requestOptions).call(this))) {
                __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_ingestHistory).call(this, ev, pending);
                // Neutral here as in `IdleClock.noteEvent`: a verdict is neither agent
                // activity nor an idle.
                if (ev.type !== 'user.tool_confirmation')
                    lastEndedTurn = endsTurn(ev);
            }
        }
        catch (e) {
            // An abort throws to unwind the caller; a real list failure is
            // non-fatal — undo the speculative `seen` entries and let `#streamLoop`
            // carry on with the live stream.
            ctrl.signal.throwIfAborted();
            __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").warn('reconcile list failed', { error: String(e) });
            // If list itself failed, undo the speculative `seen` entries so the next
            // reconcile pass (or the live stream) can pick them up. Leave the idle
            // timer untouched — the history we read may be incomplete.
            for (const ev of pending)
                __classPrivateFieldGet(this, _SessionToolRunner_seen, "f").delete(ev.id);
            return;
        }
        const unanswered = pending.filter((ev) => !__classPrivateFieldGet(this, _SessionToolRunner_answered, "f").has(ev.id));
        // Disarm before routing: `#execute` runs inline here, so a timer left armed
        // from before the reconnect could fire over an in-flight tool.
        __classPrivateFieldGet(this, _SessionToolRunner_idleClock, "f").disarm();
        for (const ev of unanswered)
            await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_routeToolEvent).call(this, ev);
        // A held call's verdict is normally applied by the routing pass above; if
        // its tool_use fell outside the listed window the pass never saw it, so
        // apply the verdict to the held copy here.
        for (const held of [...__classPrivateFieldGet(this, _SessionToolRunner_awaitingConfirmation, "f").values()]) {
            const verdict = __classPrivateFieldGet(this, _SessionToolRunner_confirmationVerdicts, "f").get(held.id);
            if (verdict !== undefined)
                await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_applyVerdict).call(this, held, verdict);
        }
        // Routing resolves denied calls in place (marking them answered) and holds
        // ask-gated calls for their `user.tool_confirmation`. If the most recent
        // event in history ends the turn and no tool work is outstanding,
        // the session is done — arm the idle clock so the runner stops even if that
        // idle arrived during a disconnect. A held call is not outstanding
        // here: it blocks the clock, so this arm stays pending until the verdict
        // (and, for an allow, the dispatch it releases) resolves it.
        const outstanding = unanswered.filter((ev) => !__classPrivateFieldGet(this, _SessionToolRunner_answered, "f").has(ev.id) && !__classPrivateFieldGet(this, _SessionToolRunner_awaitingConfirmation, "f").has(ev.id));
        if (lastEndedTurn && outstanding.length === 0)
            __classPrivateFieldGet(this, _SessionToolRunner_idleClock, "f").arm();
        else
            __classPrivateFieldGet(this, _SessionToolRunner_idleClock, "f").disarm();
    }, _SessionToolRunner_ingestHistory = function _SessionToolRunner_ingestHistory(ev, pending) {
        if (ev.type === 'agent.tool_use' || ev.type === 'agent.custom_tool_use') {
            // Mark the event seen so a replay on the live stream is not dispatched
            // twice, but decide whether it still needs executing from `answered`, not
            // `seen`: a call whose result post failed is seen-but-unanswered, and must
            // be retried on the next reconcile pass rather than silently dropped.
            __classPrivateFieldGet(this, _SessionToolRunner_seen, "f").add(ev.id);
            if (!__classPrivateFieldGet(this, _SessionToolRunner_answered, "f").has(ev.id))
                pending.push(ev);
        }
        else if (ev.type === 'user.tool_result') {
            __classPrivateFieldGet(this, _SessionToolRunner_answered, "f").add(ev.tool_use_id);
        }
        else if (ev.type === 'user.custom_tool_result') {
            __classPrivateFieldGet(this, _SessionToolRunner_answered, "f").add(ev.custom_tool_use_id);
        }
        else if (ev.type === 'user.tool_confirmation') {
            // Record the verdict only, before the pending pass, so a call whose
            // confirmation appears later in the same history routes with its verdict
            // already known. Releasing a held call here as well would dispatch it a
            // second time when the routing pass reaches its tool_use event.
            if (!__classPrivateFieldGet(this, _SessionToolRunner_answered, "f").has(ev.tool_use_id))
                __classPrivateFieldGet(this, _SessionToolRunner_confirmationVerdicts, "f").set(ev.tool_use_id, ev.result);
        }
    }, _SessionToolRunner_handleStreamEvent = 
    /** Returns true when the runner should exit. */
    async function _SessionToolRunner_handleStreamEvent(ev) {
        __classPrivateFieldGet(this, _SessionToolRunner_idleClock, "f").noteEvent(ev);
        switch (ev.type) {
            case 'agent.tool_use':
            case 'agent.custom_tool_use':
                if (!__classPrivateFieldGet(this, _SessionToolRunner_seen, "f").has(ev.id)) {
                    __classPrivateFieldGet(this, _SessionToolRunner_seen, "f").add(ev.id);
                    await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_routeToolEvent).call(this, ev);
                }
                return false;
            case 'user.tool_confirmation':
                await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_noteConfirmation).call(this, ev);
                return false;
            case 'user.tool_result':
                __classPrivateFieldGet(this, _SessionToolRunner_answered, "f").add(ev.tool_use_id);
                return false;
            case 'user.custom_tool_result':
                __classPrivateFieldGet(this, _SessionToolRunner_answered, "f").add(ev.custom_tool_use_id);
                return false;
            case 'session.status_terminated':
            case 'session.deleted':
                __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").info('session terminated', {
                    component: 'session-tool-runner',
                    session_id: this.sessionId,
                });
                __classPrivateFieldGet(this, _SessionToolRunner_controller, "f").abort();
                return true;
            default:
                return false;
        }
    }, _SessionToolRunner_routeToolEvent = 
    // ===== confirmation gating (always_ask tools) =====
    /**
     * Dispatch `ev`, honoring its evaluated permission. A call the server gated
     * (`evaluated_permission == "ask"`) is held until its `user.tool_confirmation`
     * arrives. Fails closed: only an explicit `allow` verdict releases a gated
     * call; a server-side `deny` overrides any recorded verdict; an unrecognized
     * permission is held like `ask` and an unrecognized verdict is denied.
     */
    async function _SessionToolRunner_routeToolEvent(ev) {
        // `getattr`-style read: today only `agent.tool_use` carries
        // `evaluated_permission`, but if it ever lands on `agent.custom_tool_use`
        // the gate must keep failing closed rather than dispatch by event type.
        const permission = ev.evaluated_permission;
        // A server-side `deny` overrides any (stray) recorded verdict.
        const verdict = permission === 'deny' ? 'deny' : __classPrivateFieldGet(this, _SessionToolRunner_confirmationVerdicts, "f").get(ev.id);
        if (verdict === undefined) {
            if (permission === undefined || permission === 'allow') {
                await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_execute).call(this, ev, undefined);
            }
            else if (!__classPrivateFieldGet(this, _SessionToolRunner_awaitingConfirmation, "f").has(ev.id)) {
                // "ask" — or a permission this SDK does not recognize, which must not
                // dispatch unconfirmed — waits for the user's verdict. (Already-held: a
                // reconcile after reconnect re-routes the call; keep the existing hold.)
                __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").info('tool call awaiting confirmation; holding', {
                    component: 'session-tool-runner',
                    session_id: this.sessionId,
                    tool: ev.name,
                    tool_use_id: ev.id,
                });
                __classPrivateFieldGet(this, _SessionToolRunner_awaitingConfirmation, "f").set(ev.id, ev);
                __classPrivateFieldGet(this, _SessionToolRunner_idleClock, "f").block(ev.id);
            }
            return;
        }
        await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_applyVerdict).call(this, ev, verdict);
    }, _SessionToolRunner_noteConfirmation = 
    /** Record an allow/deny verdict and release the held call it gates, if any. */
    async function _SessionToolRunner_noteConfirmation(ev) {
        __classPrivateFieldGet(this, _SessionToolRunner_confirmationVerdicts, "f").set(ev.tool_use_id, ev.result);
        const held = __classPrivateFieldGet(this, _SessionToolRunner_awaitingConfirmation, "f").get(ev.tool_use_id);
        // Nothing held: the verdict gates a call this runner has not seen yet (or
        // one it never gates, e.g. an `agent.mcp_tool_use`). Keeping it in
        // `#confirmationVerdicts` lets a later route of that call resolve instantly.
        if (held === undefined)
            return;
        await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_applyVerdict).call(this, held, ev.result);
    }, _SessionToolRunner_applyVerdict = 
    /**
     * Dispatch or resolve a gated call according to its verdict.
     *
     * The idle-clock blocker accounting lives here: a denial retires the held
     * call's blocker, while an allow keeps one on the call — taking it now if the
     * verdict was already known when the call was routed, so it was never held —
     * until `#execute` has finished with it. The countdown must not run over
     * gated work that is still in flight.
     */
    async function _SessionToolRunner_applyVerdict(ev, verdict) {
        const wasHeld = __classPrivateFieldGet(this, _SessionToolRunner_awaitingConfirmation, "f").delete(ev.id);
        if (verdict === 'allow') {
            __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").info('tool call confirmed', {
                component: 'session-tool-runner',
                session_id: this.sessionId,
                tool: ev.name,
                tool_use_id: ev.id,
            });
            if (!wasHeld)
                __classPrivateFieldGet(this, _SessionToolRunner_idleClock, "f").block(ev.id);
            try {
                await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_execute).call(this, ev, 'allow');
            }
            finally {
                // The approved call is fully disposed of (executed, or moot because it
                // was answered elsewhere) — the sole place an allow's blocker retires.
                __classPrivateFieldGet(this, _SessionToolRunner_idleClock, "f").unblock(ev.id);
            }
            return;
        }
        // "deny" — or any value other than an explicit "allow" (fail closed). The
        // denial resolves the call server-side, so mark it answered and yield it
        // (nothing ran, nothing posted).
        if (wasHeld)
            __classPrivateFieldGet(this, _SessionToolRunner_idleClock, "f").unblock(ev.id);
        __classPrivateFieldGet(this, _SessionToolRunner_answered, "f").add(ev.id);
        __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").info('tool call denied; not executing', {
            component: 'session-tool-runner',
            session_id: this.sessionId,
            tool: ev.name,
            tool_use_id: ev.id,
        });
        __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_surfaceCall).call(this, {
            event: ev,
            toolUseId: ev.id,
            name: ev.name,
            isError: false,
            posted: false,
            confirmation: 'deny',
        });
    }, _SessionToolRunner_surfaceCall = function _SessionToolRunner_surfaceCall(call) {
        __classPrivateFieldGet(this, _SessionToolRunner_results, "f").push(call);
    }, _SessionToolRunner_execute = 
    // ===== tool execution =====
    async function _SessionToolRunner_execute(ev, confirmation) {
        var _a, _b;
        if (__classPrivateFieldGet(this, _SessionToolRunner_answered, "f").has(ev.id))
            return;
        __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").info('executing tool', {
            component: 'session-tool-runner',
            session_id: this.sessionId,
            tool: ev.name,
            tool_use_id: ev.id,
        });
        __classPrivateFieldSet(this, _SessionToolRunner_inFlightCount, (_a = __classPrivateFieldGet(this, _SessionToolRunner_inFlightCount, "f"), _a++, _a));
        try {
            const tool = __classPrivateFieldGet(this, _SessionToolRunner_toolByName, "f").get(ev.name);
            if (!tool) {
                // Skip (split-client partial fulfilment): a name this runner
                // is not registered for belongs to the other client servicing this
                // session (typically the customer's app backend handling custom tools).
                // Post NO result, do not mark it answered, and leave the tool_use_id
                // pending for its owner — claiming it would corrupt the conversation.
                // Still yield the call so the consumer can observe the unowned
                // dispatch; nothing was sent, so `posted`/`isError` stay false and no
                // `result` event is populated. The id stays unanswered, so reconcile
                // keeps it out of the idle/end-turn accounting and re-surfaces it after
                // a reconnect until its owner answers it.
                __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").info('tool not owned by this runner; leaving the tool_use_id pending for its owner', {
                    component: 'session-tool-runner',
                    session_id: this.sessionId,
                    tool: ev.name,
                    tool_use_id: ev.id,
                });
                // The approval kept the idle countdown pending on this call. Drop it
                // instead of starting it: the owner still has to answer.
                if (confirmation === 'allow')
                    __classPrivateFieldGet(this, _SessionToolRunner_idleClock, "f").disarm();
                __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_surfaceCall).call(this, {
                    event: ev,
                    toolUseId: ev.id,
                    name: ev.name,
                    isError: false,
                    posted: false,
                    confirmation,
                });
                return;
            }
            let content;
            let isError;
            // Per-tool controller: aborts on the runner's own signal *or* the
            // per-tool timeout, so an in-flight tool stops promptly when the runner
            // is aborted instead of running until the timeout.
            const toolCtrl = new AbortController();
            const detachTool = linkAbort(__classPrivateFieldGet(this, _SessionToolRunner_controller, "f").signal, toolCtrl);
            const timer = setTimeout(() => toolCtrl.abort(), TOOL_TIMEOUT_MS);
            try {
                // Pass the source `agent.tool_use` / `agent.custom_tool_use` event
                // straight through as the run context's `toolUse` — it is a union
                // member of `BetaToolUse`, no Messages-block adapter needed.
                const outcome = await runRunnableTool(tool, ev.input, {
                    toolUse: ev,
                    toolUseBlock: ev,
                    signal: toolCtrl.signal,
                });
                content = outcome.content;
                isError = outcome.isError;
            }
            finally {
                clearTimeout(timer);
                detachTool();
            }
            // Answer with the result event that matches the call kind: a
            // `user.tool_result` for an `agent.tool_use`, a `user.custom_tool_result`
            // for an `agent.custom_tool_use`. Posting the wrong one leaves the call
            // unanswered and the session stuck.
            const result = buildResultEvent(ev, isError, toSessionContent(content));
            const posted = await __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_sendResult).call(this, result, ev.id);
            __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_surfaceCall).call(this, {
                event: ev,
                result,
                toolUseId: ev.id,
                name: ev.name,
                isError,
                posted,
                confirmation,
            });
        }
        finally {
            __classPrivateFieldSet(this, _SessionToolRunner_inFlightCount, (_b = __classPrivateFieldGet(this, _SessionToolRunner_inFlightCount, "f"), _b--, _b));
            if (__classPrivateFieldGet(this, _SessionToolRunner_inFlightCount, "f") === 0)
                __classPrivateFieldGet(this, _SessionToolRunner_onIdle, "f")?.call(this);
        }
    }, _SessionToolRunner_sendResult = async function _SessionToolRunner_sendResult(result, toolUseId) {
        const ctrl = __classPrivateFieldGet(this, _SessionToolRunner_controller, "f");
        const start = Date.now();
        let lastErr;
        let attempt = 0;
        while (true) {
            attempt++;
            // An abort throws to unwind the caller rather than returning a
            // `posted: false` result the iterator would carry on past.
            ctrl.signal.throwIfAborted();
            try {
                await this.client.beta.sessions.events.send(this.sessionId, { events: [result] }, __classPrivateFieldGet(this, _SessionToolRunner_instances, "m", _SessionToolRunner_requestOptions).call(this));
                __classPrivateFieldGet(this, _SessionToolRunner_answered, "f").add(toolUseId);
                return true;
            }
            catch (e) {
                lastErr = e;
                // Only short-circuit on a permanent 4xx; 408/409/429 deserve the
                // remaining retries (aligned with the core client's retry policy).
                if (isFatal4xx(e))
                    break;
                const remainingMs = __classPrivateFieldGet(this, _SessionToolRunner_sendRetryWindowMs, "f") - (Date.now() - start);
                if (remainingMs <= 0)
                    break;
                const waitMs = Math.min(applyJitter(backoff$1(attempt - 1, SEND_BACKOFF_START_MS, SEND_BACKOFF_CAP_MS)), remainingMs);
                __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").warn('tool result send failed; retrying', {
                    tool_use_id: toolUseId,
                    attempt,
                    backoff_ms: waitMs,
                    error: String(e),
                });
                await sleep(waitMs, ctrl.signal);
            }
        }
        __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").error('failed to send tool result', {
            tool_use_id: toolUseId,
            attempts: attempt,
            error: String(lastErr),
        });
        return false;
    }, _SessionToolRunner_drain = 
    /** Wait (bounded) for in-flight tool executions to finish during teardown. */
    async function _SessionToolRunner_drain() {
        if (__classPrivateFieldGet(this, _SessionToolRunner_inFlightCount, "f") === 0)
            return;
        await Promise.race([new Promise((r) => (__classPrivateFieldSet(this, _SessionToolRunner_onIdle, r))), sleep(DRAIN_TIMEOUT_MS)]);
        __classPrivateFieldSet(this, _SessionToolRunner_onIdle, null);
        if (__classPrivateFieldGet(this, _SessionToolRunner_inFlightCount, "f") > 0) {
            __classPrivateFieldGet(this, _SessionToolRunner_logger, "f").warn('drain timeout exceeded');
        }
    };
    return SessionToolRunner;
})();
/**
 * Build the result event that answers `ev`: a `user.tool_result` for a builtin
 * `agent.tool_use`, a `user.custom_tool_result` for a custom
 * `agent.custom_tool_use`. The two `(use, result)` pairs are distinct API event
 * types and must be matched exactly — a `user.tool_result` does not answer a
 * custom tool call.
 */
function buildResultEvent(ev, isError, content) {
    if (ev.type === 'agent.custom_tool_use') {
        return { type: 'user.custom_tool_result', custom_tool_use_id: ev.id, is_error: isError, content };
    }
    return { type: 'user.tool_result', tool_use_id: ev.id, is_error: isError, content };
}
// The Messages-API tool-result block union is wider than the Sessions-API
// tool_result content union; pass through text/image/document and stringify
// anything else so a BetaRunnableTool authored for toolRunner still works here.
function toSessionContent(content) {
    if (typeof content === 'string')
        return [{ type: 'text', text: content || '(no output)' }];
    const out = content.map((b) => {
        if (b.type === 'text')
            return { type: 'text', text: b.text || '(no output)' };
        if (b.type === 'image' || b.type === 'document')
            return b;
        if (b.type === 'search_result') {
            // The Messages `search_result` block param maps field-for-field onto the
            // Sessions `BetaManagedAgentsSearchResultBlock`; map it explicitly rather
            // than letting it fall through to the JSON.stringify branch (which would
            // bury a structured result inside a text block). `citations` is required
            // on the Sessions side and optional on the Messages side — default the
            // flag to `false` when the producer left it unset.
            return {
                type: 'search_result',
                source: b.source,
                title: b.title,
                content: b.content.map((c) => ({ type: 'text', text: c.text })),
                citations: { enabled: b.citations?.enabled ?? false },
            };
        }
        return { type: 'text', text: JSON.stringify(b) };
    });
    return out.length > 0 ? out : [{ type: 'text', text: '(no output)' }];
}

/**
 * The memory sync cadence, split out of `memories.ts` so runtime-agnostic
 * callers (the environment worker) can validate an interval up front without
 * reaching into the Node-only toolset module.
 */
/**
 * How often (milliseconds) the worker syncs the session's memory stores back
 * while the session runs. Checked after each dispatched tool call.
 */
const DEFAULT_MEMORY_SYNC_INTERVAL_MS = 15000;
/**
 * The shortest sync interval accepted. Each sync lists every attached store,
 * so anything tighter mostly spends requests rediscovering that nothing
 * changed.
 */
const MIN_MEMORY_SYNC_INTERVAL_MS = 5000;
/** Throw unless `ms` is a usable sync interval. `option` names it in the message. */
function checkMemorySyncInterval(ms, option) {
    if (!(ms >= MIN_MEMORY_SYNC_INTERVAL_MS)) {
        throw new AnthropicError(`${option} must be at least ${MIN_MEMORY_SYNC_INTERVAL_MS}ms (got ${ms}); ` +
            'to run without memory sync, pass `memorySyncIntervalMs: null` to the worker instead');
    }
}

var _EnvironmentWorker_instances, _EnvironmentWorker_signal, _EnvironmentWorker_handleItem, _Lease_ctrl, _Lease_endReason;
const HEARTBEAT_DEFAULT_MS = 30000;
const HEARTBEAT_TTL_DEFAULT_MS = 90000;
const NO_HEARTBEAT_SENTINEL = 'NO_HEARTBEAT';
/** True when the session has at least one memory store attached. */
function hasMemoryStore(session) {
    return session.resources.some((r) => r.type === 'memory_store');
}
/**
 * Extract the per-item sessions token from a work item's `secret` payload.
 *
 * The `secret` the poll response populates is not itself a credential: it is a
 * URL-safe base64 JSON payload matching {@link BetaWorkSecret} — the
 * `sessions_token` (the bearer for this item's work lifecycle and
 * session-level calls) plus fields this worker does not consume. Returns the
 * sessions token, or `null` (meaning: fall back to the environment key) when
 * the payload is missing, doesn't decode, or carries no token. Never log the
 * payload or anything extracted from it.
 */
function sessionsTokenFromSecret(secret) {
    if (!secret)
        return null;
    let parsed;
    try {
        // The payload may arrive URL-safe and without base64 padding; normalize
        // both before decoding.
        const normalized = secret.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
        parsed = JSON.parse(decodeUTF8(fromBase64(padded)));
    }
    catch {
        return null;
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
        return null;
    // The payload is untrusted input, so the token is still checked at runtime
    // rather than trusted to match the schema.
    const token = parsed.sessions_token;
    return typeof token === 'string' && token !== '' ? token : null;
}
/**
 * The self-hosted environment runner, composed from the control-plane
 * {@link WorkPoller} and the per-session {@link SessionToolRunner}.
 *
 * For each claimed `session` work item it: builds the per-session
 * {@link AgentToolContext}, downloads the session agent's skills
 * (`setupSkills`), then runs a {@link SessionToolRunner} for the session
 * while heartbeating the work-item lease on the same event loop; on exit it
 * force-stops the work item (unless the lease was lost, in which case the item
 * is left to whoever holds it now), cleans up the downloaded skills, and loops
 * to the next one. The lease heartbeat reports `state === "stopping"` / a lost
 * lease back into the run by aborting the session runner.
 *
 * The `environmentKey` is the worker's standing credential. When a claimed
 * work item carries a per-item `secret` (a short-lived payload the poll
 * response may populate), the sessions token extracted from it is preferred
 * over the environment key for that item's heartbeat / force-stop /
 * skill-download / session calls; polling itself always uses the environment
 * key, and items without a usable secret fall back to it entirely.
 *
 * Use {@link EnvironmentWorker.handleItem} if you already hold a claimed work
 * item (e.g. a `worker poll --on-work` script handed one to a fresh process) and
 * just want the per-item flow without the poll loop — with no arguments it reads
 * the `ANTHROPIC_*` env vars that command sets.
 *
 * Construct it via `client.beta.environments.work.worker({ ... })` (or
 * `new EnvironmentWorker({ client, ... })` directly).
 *
 * @example
 * ```ts
 * // Long-running daemon: poll for work, serve each session, loop.
 * await client.beta.environments.work
 *   .worker({ environmentId, environmentKey, workdir: '/workspace' })
 *   .run(AbortSignal.timeout(60 * 60_000));
 *
 * // Already-claimed item (e.g. inside `ant worker poll --on-work ...`):
 * await client.beta.environments.work.worker({ workdir: '/workspace' }).handleItem();
 * ```
 */
var EnvironmentWorker = /* @__PURE__ */ (() => {
    /**
     * The self-hosted environment runner, composed from the control-plane
     * {@link WorkPoller} and the per-session {@link SessionToolRunner}.
     *
     * For each claimed `session` work item it: builds the per-session
     * {@link AgentToolContext}, downloads the session agent's skills
     * (`setupSkills`), then runs a {@link SessionToolRunner} for the session
     * while heartbeating the work-item lease on the same event loop; on exit it
     * force-stops the work item (unless the lease was lost, in which case the item
     * is left to whoever holds it now), cleans up the downloaded skills, and loops
     * to the next one. The lease heartbeat reports `state === "stopping"` / a lost
     * lease back into the run by aborting the session runner.
     *
     * The `environmentKey` is the worker's standing credential. When a claimed
     * work item carries a per-item `secret` (a short-lived payload the poll
     * response may populate), the sessions token extracted from it is preferred
     * over the environment key for that item's heartbeat / force-stop /
     * skill-download / session calls; polling itself always uses the environment
     * key, and items without a usable secret fall back to it entirely.
     *
     * Use {@link EnvironmentWorker.handleItem} if you already hold a claimed work
     * item (e.g. a `worker poll --on-work` script handed one to a fresh process) and
     * just want the per-item flow without the poll loop — with no arguments it reads
     * the `ANTHROPIC_*` env vars that command sets.
     *
     * Construct it via `client.beta.environments.work.worker({ ... })` (or
     * `new EnvironmentWorker({ client, ... })` directly).
     *
     * @example
     * ```ts
     * // Long-running daemon: poll for work, serve each session, loop.
     * await client.beta.environments.work
     *   .worker({ environmentId, environmentKey, workdir: '/workspace' })
     *   .run(AbortSignal.timeout(60 * 60_000));
     *
     * // Already-claimed item (e.g. inside `ant worker poll --on-work ...`):
     * await client.beta.environments.work.worker({ workdir: '/workspace' }).handleItem();
     * ```
     */
    class EnvironmentWorker {
        constructor(opts) {
            _EnvironmentWorker_instances.add(this);
            _EnvironmentWorker_signal.set(this, void 0);
            if (opts.unrestrictedPaths !== undefined) {
                throw new AnthropicError('The `unrestrictedPaths` option you passed to EnvironmentWorker (or ' +
                    'client.beta.environments.work.worker()) is no longer supported. ' +
                    "The worker's file tools (read, write, edit, glob, grep) are now always confined to `workdir` " +
                    "plus the session's memory folders. Remove `unrestrictedPaths` from your options; to let the " +
                    'file tools reach any other directory, add it to `AgentToolContext.allowedRoots` from a ' +
                    '`tools` factory.');
            }
            this.client = opts.client;
            this.environmentId = opts.environmentId;
            this.environmentKey = opts.environmentKey;
            this.tools = opts.tools;
            this.workdir = opts.workdir ?? process.cwd();
            this.maxFileBytes = opts.maxFileBytes;
            this.maxIdleMs = opts.maxIdleMs;
            if (opts.memorySyncIntervalMs != null) {
                checkMemorySyncInterval(opts.memorySyncIntervalMs, 'memorySyncIntervalMs');
            }
            this.memorySyncIntervalMs = opts.memorySyncIntervalMs;
            this.memorySyncDeletions = opts.memorySyncDeletions ?? 'enabled';
            this.workerId = opts.workerId;
            this.requestOptions = opts.requestOptions;
            __classPrivateFieldSet(this, _EnvironmentWorker_signal, opts.signal);
        }
        /**
         * Poll the environment and service each claimed session until the supplied
         * signal (or the one passed to the constructor) aborts. Throws if
         * `environmentId` / `environmentKey` were not provided to the constructor.
         */
        async run(signal) {
            const { environmentId, environmentKey } = this;
            if (environmentId === undefined || environmentKey === undefined) {
                throw new AnthropicError('EnvironmentWorker.run: environmentId and environmentKey are required to poll for work');
            }
            const externalSignal = signal ?? __classPrivateFieldGet(this, _EnvironmentWorker_signal, "f");
            const poller = new WorkPoller({
                client: this.client,
                environmentId,
                environmentKey,
                ...(this.workerId !== undefined ? { workerId: this.workerId } : {}),
                ...(externalSignal ? { signal: externalSignal } : {}),
                ...(this.requestOptions !== undefined ? { requestOptions: this.requestOptions } : {}),
                // The per-item handler stops or releases every work item on exit; let it
                // be the single owner of `work.stop` rather than double-posting from the
                // poller.
                autoStop: false,
            });
            for await (const work of poller) {
                try {
                    await __classPrivateFieldGet(this, _EnvironmentWorker_instances, "m", _EnvironmentWorker_handleItem).call(this, work, environmentKey, poller.signal);
                }
                catch (e) {
                    // One bad item fails that item, not the worker: the handler's teardown
                    // already stopped or released it, so the next poll claims the next
                    // item. A store directory left behind by a killed worker would
                    // otherwise crashloop this process forever.
                    if (poller.signal?.aborted)
                        throw e;
                    loggerFor(this.client).error('work item failed', { work_id: work.id, error: String(e) });
                }
            }
        }
        /**
         * Service a single, already-claimed work item without the poll loop: build the
         * per-session {@link AgentToolContext} (workdir from this worker's options),
         * download the session agent's skills (`setupSkills`), run a
         * {@link SessionToolRunner} for the session while heartbeating the work-item
         * lease, and force-stop the work item on exit (whether the runner finishes
         * normally, throws, or the control plane signals shutdown). The one
         * exception is a lost lease: the item then belongs to the queue or another
         * worker and is left alone.
         *
         * Use this when something else does the claiming — e.g. a `worker poll
         * --on-work` script that hands an already-claimed item to a fresh process. The
         * work id / environment id / session id each fall back to `ANTHROPIC_WORK_ID` /
         * `ANTHROPIC_ENVIRONMENT_ID` / `ANTHROPIC_SESSION_ID` (the env vars that
         * command sets) when not passed; the environment key resolves from this
         * option, then the worker's own `environmentKey`, then
         * `ANTHROPIC_ENVIRONMENT_KEY`, and is needed only when the work item's
         * `secret` yields no sessions token — a host that receives only the
         * per-item secret runs without ever holding the key. With no arguments
         * inside that command it just works. Throws a clear error naming the first
         * required value still missing after resolution, and — rather than ever
         * running unauthenticated — when neither a sessions token nor an
         * environment key resolved. Throws `SessionMemoryError` when the
         * session has memory stores attached but they cannot be mounted — the work
         * item carried no sessions token (unless `memorySyncIntervalMs` turned
         * memory off), or a store failed to download.
         *
         * `workSecret` is the work item's per-item `secret` payload from the poll
         * response, falling back to `ANTHROPIC_WORK_SECRET`; unlike the others it is
         * optional — when present, the sessions token extracted from it is preferred
         * as the Bearer credential for this item's heartbeat / force-stop / session
         * calls; when absent (or undecodable) those calls use the environment key.
         */
        async handleItem(opts) {
            const workId = opts?.workId ?? readEnv('ANTHROPIC_WORK_ID');
            const environmentId = opts?.environmentId ?? readEnv('ANTHROPIC_ENVIRONMENT_ID');
            const sessionId = opts?.sessionId ?? readEnv('ANTHROPIC_SESSION_ID');
            // Trailing `|| undefined` / `||` between fallbacks so an empty value reads
            // as absent (matching how `readEnv` treats empty values).
            const environmentKey = (opts?.environmentKey ?? this.environmentKey ?? readEnv('ANTHROPIC_ENVIRONMENT_KEY')) || undefined;
            const workSecret = opts?.workSecret || readEnv('ANTHROPIC_WORK_SECRET') || null;
            if (!workId) {
                throw new AnthropicError('handleItem: workId is required — pass it or set ANTHROPIC_WORK_ID');
            }
            if (!environmentId) {
                throw new AnthropicError('handleItem: environmentId is required — pass it or set ANTHROPIC_ENVIRONMENT_ID');
            }
            if (!sessionId) {
                throw new AnthropicError('handleItem: sessionId is required — pass it or set ANTHROPIC_SESSION_ID');
            }
            if (!environmentKey && !workSecret) {
                throw new AnthropicError('handleItem: environmentKey is required when there is no work secret — pass it, construct the worker with it, or set ANTHROPIC_ENVIRONMENT_KEY');
            }
            const work = {
                id: workId,
                environment_id: environmentId,
                secret: workSecret,
                data: { type: 'session', id: sessionId },
            };
            await __classPrivateFieldGet(this, _EnvironmentWorker_instances, "m", _EnvironmentWorker_handleItem).call(this, work, environmentKey, opts?.signal ?? __classPrivateFieldGet(this, _EnvironmentWorker_signal, "f"));
        }
    }
    _EnvironmentWorker_signal = new WeakMap(), _EnvironmentWorker_instances = new WeakSet(), _EnvironmentWorker_handleItem = 
    /**
     * The per-item body shared by {@link EnvironmentWorker.run}'s poll loop and
     * {@link EnvironmentWorker.handleItem}: run a {@link SessionToolRunner} for the
     * work item's session while heartbeating its lease, force-stopping on exit
     * unless the lease was lost. Non-session work items are ignored.
     *
     * When the poll response carried a per-item `secret` (a short-lived payload
     * scoped to this work item), the sessions token extracted from it is
     * preferred over `environmentKey` as the Bearer credential for those
     * per-item calls; a missing/undecodable secret falls back to
     * `environmentKey` unchanged.
     */
    async function _EnvironmentWorker_handleItem(work, environmentKey, externalSignal) {
        const log = loggerFor(this.client);
        // The per-item credential: the sessions token carried inside the work
        // item's secret payload when the server issued one, otherwise the
        // environment key. Never log this value.
        const sessionsToken = sessionsTokenFromSecret(work.secret);
        const itemCredential = sessionsToken ?? environmentKey;
        if (itemCredential === undefined) {
            throw new AnthropicError('handleItem: the work item carried a secret payload but no sessions token could be extracted, ' +
                'and there is no environment key to fall back to; the poller must issue a secret whose ' +
                'payload carries `sessions_token`, or provide the environment key (pass it, construct the ' +
                'worker with it, or set ANTHROPIC_ENVIRONMENT_KEY)');
        }
        if (work.secret && sessionsToken === null) {
            log.warn('work item carried a secret payload but no sessions token could be extracted; ' +
                'falling back to the environment key', { work_id: work.id });
        }
        // Every per-session call — the SessionToolRunner event stream/list/send, the
        // lease heartbeat, the skill download, and the work force-stop —
        // authenticates with the per-item credential. Scope a client to it once and
        // thread that through. `copyClientForHelper` also clears the parent's
        // `apiKey`, so the sub-client emits *only* the bearer credential on the
        // wire (a plain `withOptions({authToken})` would leave `X-Api-Key` set as
        // well).
        const sessionClient = copyClientForHelper(this.client, {
            authToken: itemCredential,
            helper: 'environments-worker',
        });
        // The poller runs with `autoStop: false`, so the per-item handler is the
        // single owner of `work.stop` for every claimed item.
        const sessionId = work.data.id;
        // A per-session controller: aborts when the supplied signal aborts, when the
        // session runner finishes, or when the lease heartbeat says to stop.
        const ctrl = new AbortController();
        const detachExternal = linkAbort(externalSignal, ctrl);
        const lease = new Lease(ctrl);
        // Lazily load the Node-only toolset module — see the import note at the top.
        const agentToolset = await __vitePreload(() => import('./node2.browser.js'),true?__vite__mapDeps([3,1,2]):void 0);
        // Start the lease heartbeat BEFORE the session fetch and the skill /
        // memory downloads: those can take longer than the lease TTL, and an
        // unheartbeated lease lapsing mid-download would let another worker
        // reclaim the item and serve the same session (split-brain).
        //
        // Each heartbeat reports the lease TTL the server is enforcing; it becomes
        // the runner's tool-result send retry window so a send keeps retrying
        // exactly as long as the lease could still be live. The runner is only
        // built after the downloads, so hold the latest TTL until then.
        let leaseTtlMs;
        let runner;
        const heartbeatPromise = heartbeatLoop(sessionClient, work, lease, log, this.requestOptions, (ttlMs) => {
            leaseTtlMs = ttlMs;
            runner?._setSendRetryWindow(ttlMs);
        }).catch((e) => {
            if (!ctrl.signal.aborted)
                log.error('heartbeat loop failed', { work_id: work.id, error: String(e) });
            ctrl.abort();
        });
        let cleanupSkills = async () => { };
        let stores;
        let cleanEnd = false;
        try {
            if (work.data.type !== 'session') {
                log.debug('skipping non-session work item', { work_id: work.id, type: work.data.type });
                return;
            }
            // One session fetch, shared by the skills download and the memory-store
            // download — two fetches could disagree about the attached resources.
            // A failed fetch fails the work item (the teardown below still stops
            // or releases it).
            const session = await sessionClient.beta.sessions.retrieve(sessionId);
            // Only with the session in hand can we tell one that simply has no
            // memory from one whose memory we cannot mount. Turning memory off
            // with the interval knob is a deliberate opt-out and stays quiet.
            if (sessionsToken === null && this.memorySyncIntervalMs !== null && hasMemoryStore(session)) {
                throw new agentToolset.SessionMemoryError(`cannot mount the session's memories: the work item carried no sessions token ` +
                    `(work_id=${work.id}, session_id=${sessionId}); ` +
                    'the memory endpoints reject the environment key, so the poller must issue a per-item ' +
                    '`secret` carrying `sessions_token`, or set `memorySyncIntervalMs: null` to run without memory');
            }
            const ctx = {
                workdir: this.workdir,
                // The scoped sub-client, not the parent: the skill download
                // `setupSkills` performs for this session rides the same per-item
                // credential as every other per-item call.
                client: sessionClient,
                session,
                ...(this.maxFileBytes !== undefined ? { maxFileBytes: this.maxFileBytes } : {}),
            };
            try {
                cleanupSkills = await agentToolset.setupSkills(ctx);
            }
            catch (e) {
                log.warn('skill setup failed', { session_id: sessionId, work_id: work.id, error: String(e) });
            }
            // Memory stores: the memory_stores endpoints accept the per-item sessions
            // token but reject the environment key, so download and sync only run when
            // the item carried a usable secret (and the interval is set).
            // `sessionClient` is already scoped to that token then, so the memory
            // calls ride the same sub-client. A store that cannot be materialised
            // throws `SessionMemoryError` out of `download` and fails the item.
            if (sessionsToken !== null && this.memorySyncIntervalMs !== null) {
                stores = new agentToolset.SessionMemoryStores(sessionClient, {
                    workdir: this.workdir,
                    ...(this.memorySyncIntervalMs !== undefined ? { syncIntervalMs: this.memorySyncIntervalMs } : {}),
                    syncDeletions: this.memorySyncDeletions,
                });
                await stores.download(session);
                // A store mounted outside the workdir must stay reachable by the file
                // tools; read-only stores still refuse writes.
                ctx.allowedRoots = stores.roots;
                ctx.readOnlyRoots = stores.readOnlyRoots;
            }
            else {
                log.debug('memory stores disabled for this item', { work_id: work.id });
            }
            const tools = typeof this.tools === 'function' ?
                this.tools(ctx)
                : this.tools ?? agentToolset.betaAgentToolset20260401(ctx);
            runner = new SessionToolRunner(sessionId, {
                client: sessionClient,
                tools,
                ...(this.maxIdleMs !== undefined ? { maxIdleMs: this.maxIdleMs } : {}),
                ...(this.requestOptions !== undefined ? { requestOptions: this.requestOptions } : {}),
                signal: ctrl.signal,
            });
            if (leaseTtlMs !== undefined)
                runner._setSendRetryWindow(leaseTtlMs);
            for await (const _ of runner) {
                // Drive the runner to completion; per-call observability is not part
                // of this composition's surface — use `SessionToolRunner` directly
                // (via `client.beta.sessions.events.toolRunner`) if you want it.
                if (stores)
                    await stores.syncIfDue();
            }
            // Only a clean stream end earns the last full sync; it runs in the
            // teardown below.
            cleanEnd = !ctrl.signal.aborted;
        }
        finally {
            // The heartbeat keeps the lease alive until this teardown is done.
            try {
                // cleanupSkills first, so its failure cannot skip the memory flush.
                await cleanupSkills().catch((e) => {
                    log.warn('skill cleanup failed', { session_id: sessionId, work_id: work.id, error: String(e) });
                });
            }
            finally {
                if (stores) {
                    const boundMs = agentToolset.MEMORY_FLUSH_TIMEOUT_MS;
                    if (cleanEnd) {
                        const finishCutOff = await withTimeout(stores.finish(), boundMs);
                        if (finishCutOff) {
                            log.warn(`final memory sync cut off after ${boundMs}ms; the flush that follows still uploads changed files`, { session_id: sessionId, work_id: work.id });
                        }
                    }
                    // Also after finish(): it swallows its own failures, and a
                    // clean flush is a no-op.
                    const flushBound = new AbortController();
                    const flushCutOff = await withTimeout(stores.flushWrites(flushBound.signal), boundMs);
                    if (flushCutOff) {
                        flushBound.abort();
                        log.warn(`memory flush cut off after ${boundMs}ms; changed files it had not uploaded yet are not saved`, { session_id: sessionId, work_id: work.id });
                    }
                    await stores.dispose().catch((e) => {
                        log.warn('memory store cleanup failed', {
                            session_id: sessionId,
                            work_id: work.id,
                            error: String(e),
                        });
                    });
                }
            }
            lease.finish('runner_done');
            detachExternal();
            await heartbeatPromise;
            // Stop only an item this worker still holds — after a lost lease it
            // belongs to the queue or another worker.
            if (lease.lost) {
                log.info('lease lost; released without stopping it', { session_id: sessionId, work_id: work.id });
            }
            else {
                await forceStop(sessionClient, work, log, this.requestOptions);
            }
        }
    };
    return EnvironmentWorker;
})();
/**
 * Resolve when `p` settles or `ms` elapses — `true` when `ms` elapsed
 * first. A timed-out `p` keeps running — JS cannot cancel a promise.
 */
async function withTimeout(p, ms) {
    let timer;
    try {
        return await Promise.race([
            p.then(() => false, () => false),
            new Promise((resolve) => {
                timer = setTimeout(() => resolve(true), ms);
            }),
        ]);
    }
    finally {
        if (timer !== undefined)
            clearTimeout(timer);
    }
}
/** Force-stop a claimed work item, swallowing the 409 that means it's already stopped. */
async function forceStop(client, work, log, requestOptions) {
    try {
        await client.beta.environments.work.stop(work.id, { environment_id: work.environment_id, force: true }, 
        // Caller's headers pass through; the helper-tag header is on the scoped
        // sub-client's default_headers via copyClientForHelper, so no per-call
        // re-stamping needed.
        { ...requestOptions, headers: buildHeaders([requestOptions?.headers]) });
    }
    catch (e) {
        if (!isStatus(e, 409)) {
            log.error('force-stop on exit failed', { work_id: work.id, error: String(e) });
        }
    }
}
var Lease = /* @__PURE__ */ (() => {
    /**
     * This worker's view of one work-item lease: the per-item abort signal plus
     * why heartbeating ended. The first recorded reason wins, so a run aborted
     * *because* the lease was lost still reads as lost afterwards; an abort with
     * no recorded reason (the external signal) is not lost.
     */
    class Lease {
        constructor(ctrl) {
            _Lease_ctrl.set(this, void 0);
            _Lease_endReason.set(this, void 0);
            __classPrivateFieldSet(this, _Lease_ctrl, ctrl);
        }
        get signal() {
            return __classPrivateFieldGet(this, _Lease_ctrl, "f").signal;
        }
        finish(reason) {
            __classPrivateFieldSet(this, _Lease_endReason, __classPrivateFieldGet(this, _Lease_endReason, "f") ?? reason);
            __classPrivateFieldGet(this, _Lease_ctrl, "f").abort();
        }
        /** True once the item belongs to the queue or another worker. */
        get lost() {
            return __classPrivateFieldGet(this, _Lease_endReason, "f") === 'lease_lost' || __classPrivateFieldGet(this, _Lease_endReason, "f") === 'assumed_lost';
        }
    }
    _Lease_ctrl = new WeakMap(), _Lease_endReason = new WeakMap();
    return Lease;
})();
/** The server's view of the lease carried by a 412 heartbeat response, or empty if absent. */
function serverLeaseState(e) {
    let node = e instanceof APIError ? e.error : undefined;
    for (const key of ['error', 'details', 'current_state']) {
        if (!isObj(node))
            return {};
        node = node[key];
    }
    return isObj(node) ? node : {};
}
/**
 * Keep the work-item lease alive while a session is being served. Runs until
 * `lease` ends, and ends it itself when the control plane reports the work is
 * `stopping`/`stopped` or no longer extends the lease, when a heartbeat is
 * rejected (a 412 means the lease already belongs to someone else), or when no
 * heartbeat has succeeded for longer than the lease ttl (the lease is assumed
 * lost, so two runners don't end up serving the same work). Each heartbeat
 * call is cut off after the current beat interval so a hung request cannot
 * outlive the lease it is meant to renew.
 */
async function heartbeatLoop(client, work, lease, logger, requestOptions, 
/** Called with the server-reported lease TTL after every successful beat. */
onLeaseTtl) {
    let intervalMs = HEARTBEAT_DEFAULT_MS;
    let ttlMs = HEARTBEAT_TTL_DEFAULT_MS;
    let lastSuccessMs = Date.now();
    let last = NO_HEARTBEAT_SENTINEL;
    const beat = async () => {
        // Not the request `timeout` option: the core client retries timeouts, so
        // it would not bound the call as a whole.
        const beatCtrl = new AbortController();
        const detach = linkAbort(lease.signal, beatCtrl);
        const cutoff = setTimeout(() => beatCtrl.abort(), intervalMs);
        try {
            const resp = await client.beta.environments.work.heartbeat(work.id, { environment_id: work.environment_id, expected_last_heartbeat: last }, { ...requestOptions, headers: buildHeaders([requestOptions?.headers]), signal: beatCtrl.signal });
            lastSuccessMs = Date.now();
            last = resp.last_heartbeat;
            if (resp.ttl_seconds > 0) {
                ttlMs = resp.ttl_seconds * 1000;
                intervalMs = Math.max(1000, Math.min(ttlMs / 2, HEARTBEAT_DEFAULT_MS));
                onLeaseTtl?.(ttlMs);
            }
            if (resp.state === 'stopping' || resp.state === 'stopped') {
                logger.info('heartbeat signals shutdown', { work_id: work.id, state: resp.state });
                lease.finish('control_plane_stop');
            }
            if (!resp.lease_extended) {
                logger.warn('lease not extended, shutting down', { work_id: work.id });
                lease.finish('control_plane_stop');
            }
        }
        catch (e) {
            // An abort throws to unwind the caller (the `heartbeatLoop(...).catch`
            // in `#handleItem`) rather than returning early.
            lease.signal.throwIfAborted();
            if (isStatus(e, 412)) {
                const server = serverLeaseState(e);
                logger.error('lease lost: heartbeat precondition failed', {
                    work_id: work.id,
                    server_state: server['state'],
                    server_ttl_seconds: server['ttl_seconds'],
                    server_last_heartbeat: server['last_heartbeat'],
                });
                lease.finish('lease_lost');
                return;
            }
            if (isFatal4xx(e)) {
                logger.error('permanent heartbeat failure', { work_id: work.id, error: String(e) });
                lease.finish('heartbeat_rejected');
                throw e;
            }
            if (Date.now() - lastSuccessMs > ttlMs) {
                logger.error('lease assumed lost: no successful heartbeat in ttl', {
                    work_id: work.id,
                    ttl_ms: ttlMs,
                    error: String(e),
                });
                lease.finish('assumed_lost');
                return;
            }
            logger.warn('transient heartbeat failure', { work_id: work.id, error: String(e) });
        }
        finally {
            clearTimeout(cutoff);
            detach();
        }
    };
    await beat();
    while (!lease.signal.aborted) {
        await sleep(intervalMs, lease.signal);
        lease.signal.throwIfAborted();
        await beat();
    }
}

var Work = /* @__PURE__ */ (() => {
    class Work extends APIResource {
        /**
         * Note: these endpoints are called automatically by the pre-built environment
         * worker provided in the SDKs and CLI, for orchestrating sessions with self-hosted
         * sandbox environments. They are included here as a reference; you do not need to
         * invoke them directly.
         *
         * Retrieve detailed information about a specific work item.
         *
         * @example
         * ```ts
         * const betaSelfHostedWork =
         *   await client.beta.environments.work.retrieve('work_id', {
         *     environment_id: 'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *   });
         * ```
         */
        retrieve(workID, params, options) {
            const { environment_id, betas, workspace_id } = params;
            return this._client.get(path `/v1/environments/${environment_id}/work/${workID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Note: these endpoints are called automatically by the pre-built environment
         * worker provided in the SDKs and CLI, for orchestrating sessions with self-hosted
         * sandbox environments. They are included here as a reference; you do not need to
         * invoke them directly.
         *
         * Update work item metadata with merge semantics.
         *
         * @example
         * ```ts
         * const betaSelfHostedWork =
         *   await client.beta.environments.work.update('work_id', {
         *     environment_id: 'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *     metadata: { foo: 'string' },
         *   });
         * ```
         */
        update(workID, params, options) {
            const { environment_id, betas, workspace_id, ...body } = params;
            return this._client.post(path `/v1/environments/${environment_id}/work/${workID}?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Note: these endpoints are called automatically by the pre-built environment
         * worker provided in the SDKs and CLI, for orchestrating sessions with self-hosted
         * sandbox environments. They are included here as a reference; you do not need to
         * invoke them directly.
         *
         * List work items in an environment.
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaSelfHostedWork of client.beta.environments.work.list(
         *   'env_011CZkZ9X2dpNyB7HsEFoRfW',
         * )) {
         *   // ...
         * }
         * ```
         */
        list(environmentID, params = {}, options) {
            const { betas, ...query } = params ?? {};
            return this._client.getAPIList(path `/v1/environments/${environmentID}/work?beta=true`, (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                    options?.headers,
                ]),
            });
        }
        /**
         * Note: these endpoints are called automatically by the pre-built environment
         * worker provided in the SDKs and CLI, for orchestrating sessions with self-hosted
         * sandbox environments. They are included here as a reference; you do not need to
         * invoke them directly.
         *
         * Acknowledge receipt of a work item, transitioning it from 'queued' to 'starting'
         * and removing it from the queue.
         *
         * @example
         * ```ts
         * const betaSelfHostedWork =
         *   await client.beta.environments.work.ack('work_id', {
         *     environment_id: 'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *   });
         * ```
         */
        ack(workID, params, options) {
            const { environment_id, betas } = params;
            return this._client.post(path `/v1/environments/${environment_id}/work/${workID}/ack?beta=true`, {
                ...options,
                headers: buildHeaders([
                    { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                    options?.headers,
                ]),
            });
        }
        /**
         * Note: these endpoints are called automatically by the pre-built environment
         * worker provided in the SDKs and CLI, for orchestrating sessions with self-hosted
         * sandbox environments. They are included here as a reference; you do not need to
         * invoke them directly.
         *
         * Record a heartbeat for a work item to maintain the lease.
         *
         * @example
         * ```ts
         * const betaSelfHostedWorkHeartbeatResponse =
         *   await client.beta.environments.work.heartbeat('work_id', {
         *     environment_id: 'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *   });
         * ```
         */
        heartbeat(workID, params, options) {
            const { environment_id, desired_ttl_seconds, expected_last_heartbeat, betas } = params;
            return this._client.post(path `/v1/environments/${environment_id}/work/${workID}/heartbeat?beta=true`, {
                query: { desired_ttl_seconds, expected_last_heartbeat },
                ...options,
                headers: buildHeaders([
                    { 'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString() },
                    options?.headers,
                ]),
            });
        }
        /**
         * Note: these endpoints are called automatically by the pre-built environment
         * worker provided in the SDKs and CLI, for orchestrating sessions with self-hosted
         * sandbox environments. They are included here as a reference; you do not need to
         * invoke them directly.
         *
         * Long poll for work items in the queue.
         *
         * @example
         * ```ts
         * const betaSelfHostedWork =
         *   await client.beta.environments.work.poll(
         *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *   );
         * ```
         */
        poll(environmentID, params = {}, options) {
            const { betas, 'Anthropic-Worker-ID': anthropicWorkerID, ...query } = params ?? {};
            return this._client.get(path `/v1/environments/${environmentID}/work/poll?beta=true`, {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(anthropicWorkerID != null ? { 'Anthropic-Worker-ID': anthropicWorkerID } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Get statistics about the work queue for an environment.
         *
         * @example
         * ```ts
         * const betaSelfHostedWorkQueueStats =
         *   await client.beta.environments.work.stats(
         *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *   );
         * ```
         */
        stats(environmentID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.get(path `/v1/environments/${environmentID}/work/stats?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Note: these endpoints are called automatically by the pre-built environment
         * worker provided in the SDKs and CLI, for orchestrating sessions with self-hosted
         * sandbox environments. They are included here as a reference; you do not need to
         * invoke them directly.
         *
         * Stop a work item, initiating graceful or forced shutdown.
         *
         * @example
         * ```ts
         * const betaSelfHostedWork =
         *   await client.beta.environments.work.stop('work_id', {
         *     environment_id: 'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *   });
         * ```
         */
        stop(workID, params, options) {
            const { environment_id, betas, workspace_id, ...body } = params;
            return this._client.post(path `/v1/environments/${environment_id}/work/${workID}/stop?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Continuously claim work from a self-hosted environment, ack each item,
         * and yield it. Posts `stop` automatically when the consumer's loop body
         * returns or when iteration ends.
         *
         * @example
         * ```ts
         * for await (const work of client.beta.environments.work.poller({
         *   environmentId,
         *   environmentKey,
         * })) {
         *   if (work.data.type !== 'session') continue;
         *   // ...service the work...
         * }
         * ```
         */
        poller(opts) {
            return new WorkPoller({ ...opts, client: this._client });
        }
        worker(opts) {
            return new EnvironmentWorker({ ...opts, client: this._client });
        }
    }
    Work.WorkPoller = WorkPoller;
    Work.EnvironmentWorker = EnvironmentWorker;
    return Work;
})();

var Environments = /* @__PURE__ */ (() => {
    class Environments extends APIResource {
        constructor() {
            super(...arguments);
            this.work = new Work(this._client);
        }
        /**
         * Create a new environment with the specified configuration.
         *
         * @example
         * ```ts
         * const betaEnvironment =
         *   await client.beta.environments.create({
         *     name: 'python-data-analysis',
         *   });
         * ```
         */
        create(params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post('/v1/environments?beta=true', {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Retrieve a specific environment by ID.
         *
         * @example
         * ```ts
         * const betaEnvironment =
         *   await client.beta.environments.retrieve(
         *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *   );
         * ```
         */
        retrieve(environmentID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.get(path `/v1/environments/${environmentID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Update an existing environment's configuration.
         *
         * @example
         * ```ts
         * const betaEnvironment =
         *   await client.beta.environments.update(
         *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *   );
         * ```
         */
        update(environmentID, params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post(path `/v1/environments/${environmentID}?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * List environments with pagination support.
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaEnvironment of client.beta.environments.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { betas, workspace_id, ...query } = params ?? {};
            return this._client.getAPIList('/v1/environments?beta=true', (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Delete an environment by ID. Returns a confirmation of the deletion.
         *
         * @example
         * ```ts
         * const betaEnvironmentDeleteResponse =
         *   await client.beta.environments.delete(
         *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *   );
         * ```
         */
        delete(environmentID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.delete(path `/v1/environments/${environmentID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Archive an environment by ID. Archived environments cannot be used to create new
         * sessions.
         *
         * @example
         * ```ts
         * const betaEnvironment =
         *   await client.beta.environments.archive(
         *     'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *   );
         * ```
         */
        archive(environmentID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.post(path `/v1/environments/${environmentID}/archive?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
    }
    Environments.Work = Work;
    return Environments;
})();

class Memories extends APIResource {
    /**
     * Create a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemory =
     *   await client.beta.memoryStores.memories.create(
     *     'memory_store_id',
     *     { content: 'content', path: 'xx' },
     *   );
     * ```
     */
    create(memoryStoreID, params, options) {
        const { view, betas, workspace_id, ...body } = params;
        return this._client.post(path `/v1/memory_stores/${memoryStoreID}/memories?beta=true`, {
            query: { view },
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Retrieve a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemory =
     *   await client.beta.memoryStores.memories.retrieve(
     *     'memory_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */
    retrieve(memoryID, params, options) {
        const { memory_store_id, betas, workspace_id, ...query } = params;
        return this._client.get(path `/v1/memory_stores/${memory_store_id}/memories/${memoryID}?beta=true`, {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Update a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemory =
     *   await client.beta.memoryStores.memories.update(
     *     'memory_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */
    update(memoryID, params, options) {
        const { memory_store_id, view, betas, workspace_id, ...body } = params;
        return this._client.post(path `/v1/memory_stores/${memory_store_id}/memories/${memoryID}?beta=true`, {
            query: { view },
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List memories
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsMemoryListItem of client.beta.memoryStores.memories.list(
     *   'memory_store_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(memoryStoreID, params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/memory_stores/${memoryStoreID}/memories?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete a memory
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedMemory =
     *   await client.beta.memoryStores.memories.delete(
     *     'memory_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */
    delete(memoryID, params, options) {
        const { memory_store_id, expected_content_sha256, betas, workspace_id } = params;
        return this._client.delete(path `/v1/memory_stores/${memory_store_id}/memories/${memoryID}?beta=true`, {
            query: { expected_content_sha256 },
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
}

class MemoryVersions extends APIResource {
    /**
     * Retrieve a memory version
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryVersion =
     *   await client.beta.memoryStores.memoryVersions.retrieve(
     *     'memory_version_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */
    retrieve(memoryVersionID, params, options) {
        const { memory_store_id, betas, workspace_id, ...query } = params;
        return this._client.get(path `/v1/memory_stores/${memory_store_id}/memory_versions/${memoryVersionID}?beta=true`, {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List memory versions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsMemoryVersion of client.beta.memoryStores.memoryVersions.list(
     *   'memory_store_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(memoryStoreID, params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/memory_stores/${memoryStoreID}/memory_versions?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Redact a memory version
     *
     * @example
     * ```ts
     * const betaManagedAgentsMemoryVersion =
     *   await client.beta.memoryStores.memoryVersions.redact(
     *     'memory_version_id',
     *     { memory_store_id: 'memory_store_id' },
     *   );
     * ```
     */
    redact(memoryVersionID, params, options) {
        const { memory_store_id, betas, workspace_id } = params;
        return this._client.post(path `/v1/memory_stores/${memory_store_id}/memory_versions/${memoryVersionID}/redact?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
}

var MemoryStores = /* @__PURE__ */ (() => {
    class MemoryStores extends APIResource {
        constructor() {
            super(...arguments);
            this.memories = new Memories(this._client);
            this.memoryVersions = new MemoryVersions(this._client);
        }
        /**
         * Create a memory store
         *
         * @example
         * ```ts
         * const betaManagedAgentsMemoryStore =
         *   await client.beta.memoryStores.create({ name: 'x' });
         * ```
         */
        create(params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post('/v1/memory_stores?beta=true', {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Retrieve a memory store
         *
         * @example
         * ```ts
         * const betaManagedAgentsMemoryStore =
         *   await client.beta.memoryStores.retrieve(
         *     'memory_store_id',
         *   );
         * ```
         */
        retrieve(memoryStoreID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.get(path `/v1/memory_stores/${memoryStoreID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Update a memory store
         *
         * @example
         * ```ts
         * const betaManagedAgentsMemoryStore =
         *   await client.beta.memoryStores.update('memory_store_id');
         * ```
         */
        update(memoryStoreID, params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post(path `/v1/memory_stores/${memoryStoreID}?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * List memory stores
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaManagedAgentsMemoryStore of client.beta.memoryStores.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { betas, workspace_id, ...query } = params ?? {};
            return this._client.getAPIList('/v1/memory_stores?beta=true', (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Delete a memory store
         *
         * @example
         * ```ts
         * const betaManagedAgentsDeletedMemoryStore =
         *   await client.beta.memoryStores.delete('memory_store_id');
         * ```
         */
        delete(memoryStoreID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.delete(path `/v1/memory_stores/${memoryStoreID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Archive a memory store
         *
         * @example
         * ```ts
         * const betaManagedAgentsMemoryStore =
         *   await client.beta.memoryStores.archive('memory_store_id');
         * ```
         */
        archive(memoryStoreID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.post(path `/v1/memory_stores/${memoryStoreID}/archive?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'agent-memory-2026-07-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
    }
    MemoryStores.Memories = Memories;
    MemoryStores.MemoryVersions = MemoryVersions;
    return MemoryStores;
})();

class Batches extends APIResource {
    /**
     * Send a batch of Message creation requests.
     *
     * The Message Batches API can be used to process multiple Messages API requests at
     * once. Once a Message Batch is created, it begins processing immediately. Batches
     * can take up to 24 hours to complete.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatch =
     *   await client.beta.messages.batches.create({
     *     requests: [
     *       {
     *         custom_id: 'my-custom-id-1',
     *         params: {
     *           max_tokens: 1024,
     *           messages: [
     *             { content: 'Hello, world', role: 'user' },
     *           ],
     *           model: 'claude-opus-5',
     *         },
     *       },
     *     ],
     *   });
     * ```
     */
    create(params, options) {
        const { betas, user_profile_id, workspace_id, ...body } = params;
        return this._client.post('/v1/messages/batches?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString(),
                    ...(user_profile_id != null ? { 'anthropic-user-profile-id': user_profile_id } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * This endpoint is idempotent and can be used to poll for Message Batch
     * completion. To access the results of a Message Batch, make a request to the
     * `results_url` field in the response.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatch =
     *   await client.beta.messages.batches.retrieve(
     *     'message_batch_id',
     *   );
     * ```
     */
    retrieve(messageBatchID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.get(path `/v1/messages/batches/${messageBatchID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List all Message Batches within a Workspace. Most recently created batches are
     * returned first.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaMessageBatch of client.beta.messages.batches.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList('/v1/messages/batches?beta=true', (Page), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete a Message Batch.
     *
     * Message Batches can only be deleted once they've finished processing. If you'd
     * like to delete an in-progress batch, you must first cancel it.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaDeletedMessageBatch =
     *   await client.beta.messages.batches.delete(
     *     'message_batch_id',
     *   );
     * ```
     */
    delete(messageBatchID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.delete(path `/v1/messages/batches/${messageBatchID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Batches may be canceled any time before processing ends. Once cancellation is
     * initiated, the batch enters a `canceling` state, at which time the system may
     * complete any in-progress, non-interruptible requests before finalizing
     * cancellation.
     *
     * The number of canceled requests is specified in `request_counts`. To determine
     * which requests were canceled, check the individual results within the batch.
     * Note that cancellation may not result in any canceled requests if they were
     * non-interruptible.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatch =
     *   await client.beta.messages.batches.cancel(
     *     'message_batch_id',
     *   );
     * ```
     */
    cancel(messageBatchID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.post(path `/v1/messages/batches/${messageBatchID}/cancel?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Streams the results of a Message Batch as a `.jsonl` file.
     *
     * Each line in the file is a JSON object containing the result of a single request
     * in the Message Batch. Results are not guaranteed to be in the same order as
     * requests. Use the `custom_id` field to match results to requests.
     *
     * Learn more about the Message Batches API in our
     * [user guide](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
     *
     * @example
     * ```ts
     * const betaMessageBatchIndividualResponse =
     *   await client.beta.messages.batches.results(
     *     'message_batch_id',
     *   );
     * ```
     */
    async results(messageBatchID, params = {}, options) {
        const batch = await this.retrieve(messageBatchID, params, options);
        if (!batch.results_url) {
            throw new AnthropicError(`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
        }
        const { betas, workspace_id } = params ?? {};
        return this._client
            .get(batch.results_url, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'message-batches-2024-09-24'].toString(),
                    Accept: 'application/binary',
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
            stream: true,
            __binaryResponse: true,
        })
            ._thenUnwrap((_, props) => JSONLDecoder.fromResponse(props.response, props.controller));
    }
}

function getOutputFormat(params) {
    // Prefer output_format (deprecated) over output_config.format for backward compatibility
    return params?.output_format ?? params?.output_config?.format;
}
function maybeParseBetaMessage(message, params, opts) {
    const outputFormat = getOutputFormat(params);
    if (!params || !('parse' in (outputFormat ?? {}))) {
        return {
            ...message,
            content: message.content.map((block) => {
                if (block.type === 'text') {
                    const parsedBlock = Object.defineProperty({ ...block }, 'parsed_output', {
                        value: null,
                        enumerable: false,
                    });
                    return Object.defineProperty(parsedBlock, 'parsed', {
                        get() {
                            opts.logger.warn('The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.');
                            return null;
                        },
                        enumerable: false,
                    });
                }
                return block;
            }),
            parsed_output: null,
        };
    }
    return parseBetaMessage(message, params, opts);
}
function parseBetaMessage(message, params, opts) {
    let firstParsedOutput = null;
    const content = message.content.map((block) => {
        if (block.type === 'text') {
            const parsedOutput = parseBetaOutputFormat(params, block.text);
            if (firstParsedOutput === null) {
                firstParsedOutput = parsedOutput;
            }
            const parsedBlock = Object.defineProperty({ ...block }, 'parsed_output', {
                value: parsedOutput,
                enumerable: false,
            });
            return Object.defineProperty(parsedBlock, 'parsed', {
                get() {
                    opts.logger.warn('The `parsed` property on `text` blocks is deprecated, please use `parsed_output` instead.');
                    return parsedOutput;
                },
                enumerable: false,
            });
        }
        return block;
    });
    return {
        ...message,
        content,
        parsed_output: firstParsedOutput,
    };
}
function parseBetaOutputFormat(params, content) {
    const outputFormat = getOutputFormat(params);
    if (outputFormat?.type !== 'json_schema') {
        return null;
    }
    try {
        if ('parse' in outputFormat) {
            return outputFormat.parse(content);
        }
        return JSON.parse(content);
    }
    catch (error) {
        throw new AnthropicError(`Failed to parse structured output: ${error}`);
    }
}

var _BetaMessageStream_instances, _BetaMessageStream_currentMessageSnapshot, _BetaMessageStream_params, _BetaMessageStream_connectedPromise, _BetaMessageStream_resolveConnectedPromise, _BetaMessageStream_rejectConnectedPromise, _BetaMessageStream_endPromise, _BetaMessageStream_resolveEndPromise, _BetaMessageStream_rejectEndPromise, _BetaMessageStream_listeners, _BetaMessageStream_ended, _BetaMessageStream_errored, _BetaMessageStream_aborted, _BetaMessageStream_catchingPromiseCreated, _BetaMessageStream_response, _BetaMessageStream_request_id, _BetaMessageStream_workspace_id, _BetaMessageStream_logger, _BetaMessageStream_getFinalMessage, _BetaMessageStream_getFinalText, _BetaMessageStream_handleError, _BetaMessageStream_beginRequest, _BetaMessageStream_addStreamEvent, _BetaMessageStream_endRequest, _BetaMessageStream_accumulateMessage, _BetaMessageStream_toolInputParseError;
function tracksToolInput(content) {
    return content.type === 'tool_use' || content.type === 'server_tool_use' || content.type === 'mcp_tool_use';
}
var BetaMessageStream = /* @__PURE__ */ (() => {
    class BetaMessageStream {
        constructor(params, opts) {
            _BetaMessageStream_instances.add(this);
            this.messages = [];
            this.receivedMessages = [];
            _BetaMessageStream_currentMessageSnapshot.set(this, void 0);
            _BetaMessageStream_params.set(this, null);
            this.controller = new AbortController();
            _BetaMessageStream_connectedPromise.set(this, void 0);
            _BetaMessageStream_resolveConnectedPromise.set(this, () => { });
            _BetaMessageStream_rejectConnectedPromise.set(this, () => { });
            _BetaMessageStream_endPromise.set(this, void 0);
            _BetaMessageStream_resolveEndPromise.set(this, () => { });
            _BetaMessageStream_rejectEndPromise.set(this, () => { });
            _BetaMessageStream_listeners.set(this, {});
            _BetaMessageStream_ended.set(this, false);
            _BetaMessageStream_errored.set(this, false);
            _BetaMessageStream_aborted.set(this, false);
            _BetaMessageStream_catchingPromiseCreated.set(this, false);
            _BetaMessageStream_response.set(this, void 0);
            _BetaMessageStream_request_id.set(this, void 0);
            _BetaMessageStream_workspace_id.set(this, void 0);
            _BetaMessageStream_logger.set(this, void 0);
            _BetaMessageStream_handleError.set(this, (error) => {
                __classPrivateFieldSet(this, _BetaMessageStream_errored, true);
                if (isAbortError(error)) {
                    error = new APIUserAbortError();
                }
                if (error instanceof APIUserAbortError) {
                    __classPrivateFieldSet(this, _BetaMessageStream_aborted, true);
                    return this._emit('abort', error);
                }
                if (error instanceof AnthropicError) {
                    return this._emit('error', error);
                }
                if (error instanceof Error) {
                    const anthropicError = new AnthropicError(error.message);
                    // @ts-ignore
                    anthropicError.cause = error;
                    return this._emit('error', anthropicError);
                }
                return this._emit('error', new AnthropicError(String(error)));
            });
            __classPrivateFieldSet(this, _BetaMessageStream_connectedPromise, new Promise((resolve, reject) => {
                __classPrivateFieldSet(this, _BetaMessageStream_resolveConnectedPromise, resolve, "f");
                __classPrivateFieldSet(this, _BetaMessageStream_rejectConnectedPromise, reject, "f");
            }));
            __classPrivateFieldSet(this, _BetaMessageStream_endPromise, new Promise((resolve, reject) => {
                __classPrivateFieldSet(this, _BetaMessageStream_resolveEndPromise, resolve, "f");
                __classPrivateFieldSet(this, _BetaMessageStream_rejectEndPromise, reject, "f");
            }));
            // Don't let these promises cause unhandled rejection errors.
            // we will manually cause an unhandled rejection error later
            // if the user hasn't registered any error listener or called
            // any promise-returning method.
            __classPrivateFieldGet(this, _BetaMessageStream_connectedPromise, "f").catch(() => { });
            __classPrivateFieldGet(this, _BetaMessageStream_endPromise, "f").catch(() => { });
            __classPrivateFieldSet(this, _BetaMessageStream_params, params);
            __classPrivateFieldSet(this, _BetaMessageStream_logger, opts?.logger ?? console);
        }
        get response() {
            return __classPrivateFieldGet(this, _BetaMessageStream_response, "f");
        }
        get request_id() {
            return __classPrivateFieldGet(this, _BetaMessageStream_request_id, "f");
        }
        get workspace_id() {
            return __classPrivateFieldGet(this, _BetaMessageStream_workspace_id, "f");
        }
        /**
         * Returns the `MessageStream` data, the raw `Response` instance and the ID of the request,
         * returned vie the `request-id` header which is useful for debugging requests and resporting
         * issues to Anthropic.
         *
         * This is the same as the `APIPromise.withResponse()` method.
         *
         * This method will raise an error if you created the stream using `MessageStream.fromReadableStream`
         * as no `Response` is available.
         */
        async withResponse() {
            __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true);
            const response = await __classPrivateFieldGet(this, _BetaMessageStream_connectedPromise, "f");
            if (!response) {
                throw new Error('Could not resolve a `Response` object');
            }
            return {
                data: this,
                response,
                request_id: response.headers.get('request-id'),
                workspace_id: response.headers.get('anthropic-workspace-id'),
            };
        }
        /**
         * Intended for use on the frontend, consuming a stream produced with
         * `.toReadableStream()` on the backend.
         *
         * Note that messages sent to the model do not appear in `.on('message')`
         * in this context.
         */
        static fromReadableStream(stream) {
            const runner = new BetaMessageStream(null);
            runner._run(() => runner._fromReadableStream(stream));
            return runner;
        }
        static createMessage(messages, params, options, { logger } = {}) {
            const runner = new BetaMessageStream(params, { logger });
            for (const message of params.messages) {
                runner._addMessageParam(message);
            }
            __classPrivateFieldSet(runner, _BetaMessageStream_params, { ...params, stream: true });
            runner._run(() => runner._createMessage(messages, { ...params, stream: true }, { ...options, headers: { ...options?.headers, [STAINLESS_HELPER_METHOD_HEADER]: 'stream' } }));
            return runner;
        }
        _run(executor) {
            executor().then(() => {
                this._emitFinal();
                this._emit('end');
            }, __classPrivateFieldGet(this, _BetaMessageStream_handleError, "f"));
        }
        _addMessageParam(message) {
            this.messages.push(message);
        }
        _addMessage(message, emit = true) {
            this.receivedMessages.push(message);
            if (emit) {
                this._emit('message', message);
            }
        }
        async _createMessage(messages, params, options) {
            const signal = options?.signal;
            let abortHandler;
            if (signal) {
                if (signal.aborted)
                    this.controller.abort();
                abortHandler = this.controller.abort.bind(this.controller);
                signal.addEventListener('abort', abortHandler);
            }
            try {
                __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
                const { response, data: stream } = await messages
                    .create({ ...params, stream: true }, { ...options, signal: this.controller.signal })
                    .withResponse();
                this._connected(response);
                for await (const event of stream) {
                    __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
                }
                if (stream.controller.signal?.aborted) {
                    throw new APIUserAbortError();
                }
                __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
            }
            finally {
                if (signal && abortHandler) {
                    signal.removeEventListener('abort', abortHandler);
                }
            }
        }
        _connected(response) {
            if (this.ended)
                return;
            __classPrivateFieldSet(this, _BetaMessageStream_response, response);
            __classPrivateFieldSet(this, _BetaMessageStream_request_id, response?.headers.get('request-id'));
            __classPrivateFieldSet(this, _BetaMessageStream_workspace_id, response?.headers.get('anthropic-workspace-id'));
            __classPrivateFieldGet(this, _BetaMessageStream_resolveConnectedPromise, "f").call(this, response);
            this._emit('connect');
        }
        get ended() {
            return __classPrivateFieldGet(this, _BetaMessageStream_ended, "f");
        }
        get errored() {
            return __classPrivateFieldGet(this, _BetaMessageStream_errored, "f");
        }
        get aborted() {
            return __classPrivateFieldGet(this, _BetaMessageStream_aborted, "f");
        }
        abort() {
            this.controller.abort();
        }
        /**
         * Adds the listener function to the end of the listeners array for the event.
         * No checks are made to see if the listener has already been added. Multiple calls passing
         * the same combination of event and listener will result in the listener being added, and
         * called, multiple times.
         * @returns this MessageStream, so that calls can be chained
         */
        on(event, listener) {
            const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = []);
            listeners.push({ listener });
            return this;
        }
        /**
         * Removes the specified listener from the listener array for the event.
         * off() will remove, at most, one instance of a listener from the listener array. If any single
         * listener has been added multiple times to the listener array for the specified event, then
         * off() must be called multiple times to remove each instance.
         * @returns this MessageStream, so that calls can be chained
         */
        off(event, listener) {
            const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event];
            if (!listeners)
                return this;
            const index = listeners.findIndex((l) => l.listener === listener);
            if (index >= 0)
                listeners.splice(index, 1);
            return this;
        }
        /**
         * Adds a one-time listener function for the event. The next time the event is triggered,
         * this listener is removed and then invoked.
         * @returns this MessageStream, so that calls can be chained
         */
        once(event, listener) {
            const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = []);
            listeners.push({ listener, once: true });
            return this;
        }
        /**
         * This is similar to `.once()`, but returns a Promise that resolves the next time
         * the event is triggered, instead of calling a listener callback.
         * @returns a Promise that resolves the next time given event is triggered,
         * or rejects if an error is emitted.  (If you request the 'error' event,
         * returns a promise that resolves with the error).
         *
         * Example:
         *
         *   const message = await stream.emitted('message') // rejects if the stream errors
         */
        emitted(event) {
            return new Promise((resolve, reject) => {
                __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true);
                if (event !== 'error')
                    this.once('error', reject);
                this.once(event, resolve);
            });
        }
        async done() {
            __classPrivateFieldSet(this, _BetaMessageStream_catchingPromiseCreated, true);
            await __classPrivateFieldGet(this, _BetaMessageStream_endPromise, "f");
        }
        get currentMessage() {
            return __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
        }
        /**
         * @returns a promise that resolves with the the final assistant Message response,
         * or rejects if an error occurred or the stream ended prematurely without producing a Message.
         * If structured outputs were used, this will be a ParsedMessage with a `parsed` field.
         */
        async finalMessage() {
            await this.done();
            return __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this);
        }
        /**
         * @returns a promise that resolves with the the final assistant Message's text response, concatenated
         * together if there are more than one text blocks.
         * Rejects if an error occurred or the stream ended prematurely without producing a Message.
         */
        async finalText() {
            await this.done();
            return __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalText).call(this);
        }
        _emit(event, ...args) {
            // make sure we don't emit any MessageStreamEvents after end
            if (__classPrivateFieldGet(this, _BetaMessageStream_ended, "f"))
                return;
            if (event === 'end') {
                __classPrivateFieldSet(this, _BetaMessageStream_ended, true);
                __classPrivateFieldGet(this, _BetaMessageStream_resolveEndPromise, "f").call(this);
            }
            const listeners = __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event];
            if (listeners) {
                __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
                listeners.forEach(({ listener }) => listener(...args));
            }
            if (event === 'abort') {
                const error = args[0];
                if (!__classPrivateFieldGet(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                    Promise.reject(error);
                }
                __classPrivateFieldGet(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
                __classPrivateFieldGet(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
                this._emit('end');
                return;
            }
            if (event === 'error') {
                // NOTE: _emit('error', error) should only be called from #handleError().
                const error = args[0];
                if (!__classPrivateFieldGet(this, _BetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
                    // Trigger an unhandled rejection if the user hasn't registered any error handlers.
                    // If you are seeing stack traces here, make sure to handle errors via either:
                    // - runner.on('error', () => ...)
                    // - await runner.done()
                    // - await runner.final...()
                    // - etc.
                    Promise.reject(error);
                }
                __classPrivateFieldGet(this, _BetaMessageStream_rejectConnectedPromise, "f").call(this, error);
                __classPrivateFieldGet(this, _BetaMessageStream_rejectEndPromise, "f").call(this, error);
                this._emit('end');
            }
        }
        _emitFinal() {
            const finalMessage = this.receivedMessages.at(-1);
            if (finalMessage) {
                this._emit('finalMessage', __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_getFinalMessage).call(this));
            }
        }
        async _fromReadableStream(readableStream, options) {
            const signal = options?.signal;
            let abortHandler;
            if (signal) {
                if (signal.aborted)
                    this.controller.abort();
                abortHandler = this.controller.abort.bind(this.controller);
                signal.addEventListener('abort', abortHandler);
            }
            try {
                __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_beginRequest).call(this);
                this._connected(null);
                const stream = Stream.fromReadableStream(readableStream, this.controller);
                for await (const event of stream) {
                    __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_addStreamEvent).call(this, event);
                }
                if (stream.controller.signal?.aborted) {
                    throw new APIUserAbortError();
                }
                __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_endRequest).call(this);
            }
            finally {
                if (signal && abortHandler) {
                    signal.removeEventListener('abort', abortHandler);
                }
            }
        }
        [(_BetaMessageStream_currentMessageSnapshot = new WeakMap(), _BetaMessageStream_params = new WeakMap(), _BetaMessageStream_connectedPromise = new WeakMap(), _BetaMessageStream_resolveConnectedPromise = new WeakMap(), _BetaMessageStream_rejectConnectedPromise = new WeakMap(), _BetaMessageStream_endPromise = new WeakMap(), _BetaMessageStream_resolveEndPromise = new WeakMap(), _BetaMessageStream_rejectEndPromise = new WeakMap(), _BetaMessageStream_listeners = new WeakMap(), _BetaMessageStream_ended = new WeakMap(), _BetaMessageStream_errored = new WeakMap(), _BetaMessageStream_aborted = new WeakMap(), _BetaMessageStream_catchingPromiseCreated = new WeakMap(), _BetaMessageStream_response = new WeakMap(), _BetaMessageStream_request_id = new WeakMap(), _BetaMessageStream_workspace_id = new WeakMap(), _BetaMessageStream_logger = new WeakMap(), _BetaMessageStream_handleError = new WeakMap(), _BetaMessageStream_instances = new WeakSet(), _BetaMessageStream_getFinalMessage = function _BetaMessageStream_getFinalMessage() {
            if (this.receivedMessages.length === 0) {
                throw new AnthropicError('stream ended without producing a Message with role=assistant');
            }
            return this.receivedMessages.at(-1);
        }, _BetaMessageStream_getFinalText = function _BetaMessageStream_getFinalText() {
            if (this.receivedMessages.length === 0) {
                throw new AnthropicError('stream ended without producing a Message with role=assistant');
            }
            const textBlocks = this.receivedMessages
                .at(-1)
                .content.filter((block) => block.type === 'text')
                .map((block) => block.text);
            if (textBlocks.length === 0) {
                throw new AnthropicError('stream ended without producing a content block with type=text');
            }
            return textBlocks.join(' ');
        }, _BetaMessageStream_beginRequest = function _BetaMessageStream_beginRequest() {
            if (this.ended)
                return;
            __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, undefined);
        }, _BetaMessageStream_addStreamEvent = function _BetaMessageStream_addStreamEvent(event) {
            if (this.ended)
                return;
            const messageSnapshot = __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_accumulateMessage).call(this, event);
            this._emit('streamEvent', event, messageSnapshot);
            switch (event.type) {
                case 'content_block_delta': {
                    const content = messageSnapshot.content.at(-1);
                    switch (event.delta.type) {
                        case 'text_delta': {
                            if (content.type === 'text') {
                                this._emit('text', event.delta.text, content.text || '');
                            }
                            break;
                        }
                        case 'citations_delta': {
                            if (content.type === 'text') {
                                this._emit('citation', event.delta.citation, content.citations ?? []);
                            }
                            break;
                        }
                        case 'input_json_delta': {
                            if (tracksToolInput(content) && __classPrivateFieldGet(this, _BetaMessageStream_listeners, "f").inputJson?.length) {
                                let jsonSnapshot;
                                try {
                                    jsonSnapshot = content.input;
                                }
                                catch (err) {
                                    __classPrivateFieldGet(this, _BetaMessageStream_handleError, "f").call(this, __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_toolInputParseError).call(this, content, err));
                                    break;
                                }
                                this._emit('inputJson', event.delta.partial_json, jsonSnapshot);
                            }
                            break;
                        }
                        case 'thinking_delta': {
                            if (content.type === 'thinking') {
                                this._emit('thinking', event.delta.thinking, content.thinking);
                            }
                            break;
                        }
                        case 'signature_delta': {
                            if (content.type === 'thinking') {
                                this._emit('signature', content.signature);
                            }
                            break;
                        }
                        case 'compaction_delta': {
                            if (content.type === 'compaction' && content.content) {
                                this._emit('compaction', content.content);
                            }
                            break;
                        }
                        default:
                            checkNever(event.delta);
                    }
                    break;
                }
                case 'message_stop': {
                    // Assertion needed until the generated request and response types of `tool_listing` agree.
                    this._addMessageParam(messageSnapshot);
                    this._addMessage(maybeParseBetaMessage(messageSnapshot, __classPrivateFieldGet(this, _BetaMessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _BetaMessageStream_logger, "f") }), true);
                    break;
                }
                case 'content_block_stop': {
                    this._emit('contentBlock', messageSnapshot.content.at(-1));
                    break;
                }
                case 'message_start': {
                    __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, messageSnapshot);
                    break;
                }
            }
        }, _BetaMessageStream_endRequest = function _BetaMessageStream_endRequest() {
            if (this.ended) {
                throw new AnthropicError(`stream has ended, this shouldn't happen`);
            }
            const snapshot = __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
            if (!snapshot) {
                throw new AnthropicError(`request ended without sending any chunks`);
            }
            __classPrivateFieldSet(this, _BetaMessageStream_currentMessageSnapshot, undefined);
            return maybeParseBetaMessage(snapshot, __classPrivateFieldGet(this, _BetaMessageStream_params, "f"), { logger: __classPrivateFieldGet(this, _BetaMessageStream_logger, "f") });
        }, _BetaMessageStream_accumulateMessage = function _BetaMessageStream_accumulateMessage(event) {
            let snapshot = __classPrivateFieldGet(this, _BetaMessageStream_currentMessageSnapshot, "f");
            if (event.type === 'message_start') {
                if (snapshot) {
                    throw new AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
                }
                return event.message;
            }
            if (!snapshot) {
                throw new AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
            }
            switch (event.type) {
                case 'message_stop':
                    return snapshot;
                case 'message_delta':
                    snapshot.stop_reason = event.delta.stop_reason;
                    snapshot.stop_sequence = event.delta.stop_sequence;
                    snapshot.stop_details = event.delta.stop_details;
                    snapshot.usage.output_tokens = event.usage.output_tokens;
                    if (event.delta.container != null) {
                        snapshot.container = event.delta.container;
                    }
                    if (event.context_management != null) {
                        snapshot.context_management = event.context_management;
                    }
                    if (event.input_transformations != null) {
                        snapshot.input_transformations = event.input_transformations;
                    }
                    // The remaining usage counters are cumulative whole-message totals that are
                    // omitted when they don't apply, so overwrite when present and never add.
                    if (event.usage.input_tokens != null) {
                        snapshot.usage.input_tokens = event.usage.input_tokens;
                    }
                    if (event.usage.cache_creation_input_tokens != null) {
                        snapshot.usage.cache_creation_input_tokens = event.usage.cache_creation_input_tokens;
                    }
                    if (event.usage.cache_read_input_tokens != null) {
                        snapshot.usage.cache_read_input_tokens = event.usage.cache_read_input_tokens;
                    }
                    if (event.usage.server_tool_use != null) {
                        snapshot.usage.server_tool_use = event.usage.server_tool_use;
                    }
                    if (event.usage.iterations != null) {
                        snapshot.usage.iterations = event.usage.iterations;
                    }
                    if (event.usage.fallback_credit != null) {
                        snapshot.usage.fallback_credit = event.usage.fallback_credit;
                    }
                    if (event.usage.output_tokens_details != null) {
                        snapshot.usage.output_tokens_details = event.usage.output_tokens_details;
                    }
                    return snapshot;
                case 'content_block_start':
                    snapshot.content.push(event.content_block);
                    if (event.content_block.type === 'fallback') {
                        // the final hop's fallback block names the model that served the response —
                        // keeps the snapshot consistent with the relabeled non-streaming message
                        snapshot.model = event.content_block.to.model;
                    }
                    return snapshot;
                case 'content_block_delta': {
                    const snapshotContent = snapshot.content.at(event.index);
                    switch (event.delta.type) {
                        case 'text_delta': {
                            if (snapshotContent?.type === 'text') {
                                snapshot.content[event.index] = {
                                    ...snapshotContent,
                                    text: (snapshotContent.text || '') + event.delta.text,
                                };
                            }
                            break;
                        }
                        case 'citations_delta': {
                            if (snapshotContent?.type === 'text') {
                                snapshot.content[event.index] = {
                                    ...snapshotContent,
                                    citations: [...(snapshotContent.citations ?? []), event.delta.citation],
                                };
                            }
                            break;
                        }
                        case 'input_json_delta': {
                            if (snapshotContent && tracksToolInput(snapshotContent)) {
                                const jsonBuf = (snapshotContent[JSON_BUF_PROPERTY] || '') + event.delta.partial_json;
                                snapshot.content[event.index] = withLazyInput(snapshotContent, jsonBuf);
                            }
                            break;
                        }
                        case 'thinking_delta': {
                            if (snapshotContent?.type === 'thinking') {
                                snapshot.content[event.index] = {
                                    ...snapshotContent,
                                    thinking: snapshotContent.thinking + event.delta.thinking,
                                };
                            }
                            break;
                        }
                        case 'signature_delta': {
                            if (snapshotContent?.type === 'thinking') {
                                snapshot.content[event.index] = {
                                    ...snapshotContent,
                                    signature: event.delta.signature,
                                };
                            }
                            break;
                        }
                        case 'compaction_delta': {
                            if (snapshotContent?.type === 'compaction') {
                                // The delta carries the block's final value (null content = failed compaction), so assign.
                                const block = { ...snapshotContent, content: event.delta.content };
                                // beta-gated key: only copy it when the server sent it
                                if ('encrypted_content' in event.delta) {
                                    block.encrypted_content = event.delta.encrypted_content;
                                }
                                snapshot.content[event.index] = block;
                            }
                            break;
                        }
                        default:
                            checkNever(event.delta);
                    }
                    return snapshot;
                }
                case 'content_block_stop': {
                    const snapshotContent = snapshot.content.at(event.index);
                    if (snapshotContent && tracksToolInput(snapshotContent) && JSON_BUF_PROPERTY in snapshotContent) {
                        let input;
                        try {
                            input = snapshotContent.input;
                        }
                        catch (err) {
                            input = {};
                            __classPrivateFieldGet(this, _BetaMessageStream_handleError, "f").call(this, __classPrivateFieldGet(this, _BetaMessageStream_instances, "m", _BetaMessageStream_toolInputParseError).call(this, snapshotContent, err));
                        }
                        Object.defineProperty(snapshotContent, 'input', {
                            value: input,
                            enumerable: true,
                            configurable: true,
                            writable: true,
                        });
                    }
                    return snapshot;
                }
            }
        }, _BetaMessageStream_toolInputParseError = function _BetaMessageStream_toolInputParseError(block, err) {
            const jsonBuf = block[JSON_BUF_PROPERTY];
            return new AnthropicError(`Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${err}. JSON: ${jsonBuf}`);
        }, Symbol.asyncIterator)]() {
            const pushQueue = [];
            const readQueue = [];
            let done = false;
            this.on('streamEvent', (event) => {
                const reader = readQueue.shift();
                if (reader) {
                    reader.resolve(event);
                }
                else {
                    pushQueue.push(event);
                }
            });
            this.on('end', () => {
                done = true;
                for (const reader of readQueue) {
                    reader.resolve(undefined);
                }
                readQueue.length = 0;
            });
            this.on('abort', (err) => {
                done = true;
                for (const reader of readQueue) {
                    reader.reject(err);
                }
                readQueue.length = 0;
            });
            this.on('error', (err) => {
                done = true;
                for (const reader of readQueue) {
                    reader.reject(err);
                }
                readQueue.length = 0;
            });
            return {
                next: async () => {
                    if (!pushQueue.length) {
                        if (done) {
                            return { value: undefined, done: true };
                        }
                        return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk) => (chunk ? { value: chunk, done: false } : { value: undefined, done: true }));
                    }
                    const chunk = pushQueue.shift();
                    return { value: chunk, done: false };
                },
                return: async () => {
                    this.abort();
                    return { value: undefined, done: true };
                },
            };
        }
        toReadableStream() {
            const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
            return stream.toReadableStream();
        }
    }
    return BetaMessageStream;
})();

/** Dated `tools[]` entry `type` → the family stamped on member blocks. */
const TOOLSET_TYPE_TO_FAMILY = {
    browser_toolset_20260801: 'browser',
    computer_toolset_20260801: 'computer',
};
function toolsetFamily(toolset) {
    return TOOLSET_TYPE_TO_FAMILY[toolset.type];
}
/** Whether a `tools` entry is a toolset the runner can execute locally. */
function isRunnableToolset(t) {
    // `in` alone would accept inherited keys such as `toString`
    return 'run' in t && t.type != null && Object.prototype.hasOwnProperty.call(TOOLSET_TYPE_TO_FAMILY, t.type);
}

/**
 * Thrown when your code uses a toolset's API incorrectly. Catch it to catch all three kinds below.
 *
 * The only exception the tool runner propagates from a member call: anything else a member throws becomes an
 * `is_error` result the model can react to, and the loop continues.
 */
class ToolsetUsageError extends AnthropicError {
    constructor(message, options) {
        super(message);
        this.name = 'ToolsetUsageError';
        if (options && 'cause' in options)
            this.cause = options.cause;
    }
}
/** Misuse of the SDK's own API detected at call time (a `browserState` that threw, a misrouted `tool_use`). */
class ToolsetContractError extends ToolsetUsageError {
    constructor(message, options) {
        super(message, options);
        this.name = 'ToolsetContractError';
    }
}

/**
 * What the runner answers for a toolset member it did not run because an earlier member of the same toolset failed
 * in the same assistant turn: the model planned those actions as a sequence, and a later one rarely makes sense once
 * an earlier one did not happen. The browser toolset's text; `notExecutedText` gives each family its own.
 */
const NOT_EXECUTED = 'Not executed: an earlier action in this turn failed.';
const NOT_EXECUTED_BY_FAMILY = {
    browser: NOT_EXECUTED,
    computer: 'Not executed: an earlier computer action in this turn failed.',
};
/** The not-executed text for `family` (a `tool_use.toolset_name`), or the browser's for a family the SDK doesn't know. */
function notExecutedText(family) {
    return Object.prototype.hasOwnProperty.call(NOT_EXECUTED_BY_FAMILY, family) ?
        NOT_EXECUTED_BY_FAMILY[family]
        : NOT_EXECUTED;
}
/**
 * The `tool_result` answering a member `tool_use`. `toolset_name` is required on a member result (the API rejects a
 * mismatch), so it is echoed on error paths too.
 */
function toolsetResultBlock(toolUse, content, isError = false) {
    if (isError && (content === '' || (Array.isArray(content) && content.length === 0))) {
        // Deliberate: an empty ToolError (`throw new ToolError('')`, or one whose non-text blocks were dropped) would be
        // an is_error result with empty content, which the API rejects with a 400, ending the whole run over a refusal
        // the model could have recovered from. The model still learns the call failed, and the developer loses nothing
        // they wrote.
        content = 'The tool call failed with an empty error message.';
    }
    return {
        type: 'tool_result',
        tool_use_id: toolUse.id,
        toolset_name: toolUse.toolset_name ?? null,
        content,
        ...(isError ? { is_error: true } : {}),
    };
}
/**
 * What never becomes a tool result: a `ToolsetUsageError` propagates as it is, and once the call's own `AbortSignal`
 * has aborted the cancellation propagates as `APIUserAbortError`, whatever was thrown after it. An error named
 * `AbortError` that a driver throws while that signal has not aborted (a page-aborted request, a driver's own timeout)
 * is the driver's failure, not a cancellation.
 */
function throwIfPropagates(error, ctx) {
    if (error instanceof ToolsetUsageError)
        throw error;
    throwIfAborted(ctx.signal);
}
/** Once `signal` has aborted, throws the `APIUserAbortError` an aborted request throws, so one `catch` covers both. */
function throwIfAborted(signal) {
    if (signal?.aborted)
        throw new APIUserAbortError();
}
/**
 * Runs one member `tool_use` against `toolset` and builds its `tool_result`. Throws if `toolUse`
 * is not a member call of this family: a block without `toolset_name` is a plain tool (possibly a
 * custom tool sharing a member name) and must never be routed here.
 */
async function runToolsetMember(toolset, toolUse, options = {}) {
    const family = toolsetFamily(toolset);
    if (toolUse.toolset_name !== family) {
        // a caller's routing mistake, like every other misuse of the toolset's API
        throw new ToolsetContractError(`tool_use ${JSON.stringify(toolUse.id)} (toolset_name=${JSON.stringify(toolUse.toolset_name ?? null)}, name=${JSON.stringify(toolUse.name)}) is not a member call of the ${JSON.stringify(family)} toolset`);
    }
    const ctx = { ...options, toolUse, toolUseBlock: toolUse };
    try {
        return toolsetResultBlock(toolUse, await toolset.run(ctx, toolUse));
    }
    catch (e) {
        // `classify`, as an is_error result: a converted exception is cut to the field limit here
        throwIfPropagates(e, ctx);
        return toolsetResultBlock(toolUse, errorTextContent(e instanceof ToolError ? e.content : errorText(e)), true);
    }
}

let APIKeys$1 = class APIKeys extends APIResource {
    /**
     * Get API Key
     *
     * @example
     * ```ts
     * const betaAPIKey =
     *   await client.beta.organization.apiKeys.retrieve(
     *     'api_key_id',
     *   );
     * ```
     */
    retrieve(apiKeyID, options) {
        return this._client.get(path `/v1/organizations/api_keys/${apiKeyID}?beta=true`, options);
    }
    /**
     * Update API Key
     *
     * @example
     * ```ts
     * const betaAPIKey =
     *   await client.beta.organization.apiKeys.update(
     *     'api_key_id',
     *   );
     * ```
     */
    update(apiKeyID, body, options) {
        return this._client.post(path `/v1/organizations/api_keys/${apiKeyID}?beta=true`, { body, ...options });
    }
    /**
     * List API Keys
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAPIKey of client.beta.organization.apiKeys.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/api_keys?beta=true', (Page), {
            query,
            ...options,
        });
    }
};

class Artifacts extends APIResource {
    /**
     * Get artifact-creation activity for a given day, broken out by MIME type.
     *
     * Returns the full (`artifact_type`, `is_shared`) cube for the organization;
     * `next_page` is null except for grouped queries, which paginate. The cube can be
     * broken out per product, per member, or per RBAC group via `group_by[]`, and
     * scoped via `filter[]`. Requires an API key with the `read:analytics` scope.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAnalyticsArtifactActivity of client.beta.organization.analytics.artifacts.list(
     *   { date: '2019-12-27' },
     * )) {
     *   // ...
     * }
     * ```
     */
    list(query, options) {
        return this._client.getAPIList('/v1/organizations/analytics/artifacts?beta=true', (PageCursor), { query, ...options });
    }
}

class Connectors extends APIResource {
    /**
     * Get per-connector usage for a given day, with cursor-based pagination.
     *
     * Returns connector usage metrics for the organization, sorted by connector name.
     * Connector names are normalized from their various sources — for example,
     * "Atlassian MCP server" and "mcp-atlassian" both appear as "atlassian". Use
     * `group_by[]` to break usage out per member, per RBAC group, or per product
     * surface, and `filter[]` to scope results; the parameter descriptions list the
     * supported dimensions. Available to organizations on a Claude Enterprise plan.
     * Requires an API key with the `read:analytics` scope.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAnalyticsConnectorActivity of client.beta.organization.analytics.connectors.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/analytics/connectors?beta=true', (PageCursor), { query, ...options });
    }
}

class CostReport extends APIResource {
    /**
     * Get cost in USD over time across a date range.
     *
     * Returns cost bucketed by minute, hour, or day, optionally broken down by
     * product, model, context window, inference region, speed, cost type, or token
     * type. Available to organizations on a Claude Enterprise plan. Requires an API
     * key with the `read:analytics` scope.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAnalyticsCostReportTimeBucket of client.beta.organization.analytics.costReport.list(
     *   { starting_at: '2019-12-27T18:11:19.117Z' },
     * )) {
     *   // ...
     * }
     * ```
     */
    list(query, options) {
        return this._client.getAPIList('/v1/organizations/analytics/cost_report?beta=true', (PageCursor), { query, ...options });
    }
}

let Plugins$1 = class Plugins extends APIResource {
    /**
     * Get per-plugin install + invocation usage for a given day, with pagination.
     *
     * Returns plugin usage metrics for the organization across Cowork and Claude Code,
     * sorted by plugin name. The `plugin_name` value `third-party` is an aggregate
     * bucket, not a plugin: it collects plugin activity, from either surface, for
     * which the reporting client did not provide a plugin name — so an organization's
     * own plugins can contribute both to their own named rows and to this bucket. Use
     * `group_by[]` to break usage out per member, per RBAC group, or per product
     * surface (Cowork / Claude Code), and `filter[]` to scope results; the parameter
     * descriptions list the supported dimensions. Requires an API key with the
     * `read:analytics` scope. `starting_date` / `ending_date` select range-rollup mode
     * like `/skills`.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAnalyticsPluginActivity of client.beta.organization.analytics.plugins.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/analytics/plugins?beta=true', (PageCursor), { query, ...options });
    }
};

let Skills$2 = class Skills extends APIResource {
    /**
     * Get per-skill usage for a given day, with cursor-based pagination.
     *
     * Returns skill usage metrics for the organization, sorted by skill name. Use
     * `group_by[]` to break usage out per member, per RBAC group, or per product
     * surface, and `filter[]` to scope results; the parameter descriptions list the
     * supported dimensions. Available to organizations on a Claude Enterprise plan.
     * Requires an API key with the `read:analytics` scope.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAnalyticsSkillActivity of client.beta.organization.analytics.skills.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/analytics/skills?beta=true', (PageCursor), { query, ...options });
    }
};

class Summaries extends APIResource {
    /**
     * Get organization-wide activity summaries for a date range.
     *
     * Returns one entry per day from `starting_date` (inclusive) to `ending_date`
     * (exclusive) in `data`, the same `data` / `next_page` envelope as the other
     * analytics list endpoints; the series is currently returned in full, so
     * `next_page` is always null. Data is typically available with a 1-day lag and may
     * be revised by a few percent over the following days: when `ending_date` is
     * omitted it defaults to the most recent available day + 1, so the last entry
     * covers the most recent available day. The series can be scoped to an RBAC group
     * via `filter[]=rbac_group_id:{id}`. Available to organizations on a Claude
     * Enterprise plan. Requires an API key with the `read:analytics` scope.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAnalyticsSingleDayActivitySummary of client.beta.organization.analytics.summaries.list(
     *   { starting_date: '2019-12-27' },
     * )) {
     *   // ...
     * }
     * ```
     */
    list(query, options) {
        return this._client.getAPIList('/v1/organizations/analytics/summaries?beta=true', (PageCursor), { query, ...options });
    }
}

class UsageReport extends APIResource {
    /**
     * Get token usage over time across a date range.
     *
     * Returns token usage bucketed by minute, hour, or day, optionally broken down by
     * product, model, context window, inference region, or speed. Available to
     * organizations on a Claude Enterprise plan. Requires an API key with the
     * `read:analytics` scope.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAnalyticsUsageReportTimeBucket of client.beta.organization.analytics.usageReport.list(
     *   { starting_at: '2019-12-27T18:11:19.117Z' },
     * )) {
     *   // ...
     * }
     * ```
     */
    list(query, options) {
        return this._client.getAPIList('/v1/organizations/analytics/usage_report?beta=true', (PageCursor), { query, ...options });
    }
}

class UserCostReport extends APIResource {
    /**
     * Get per-user cost in USD across a date range.
     *
     * Returns one row per user, ranked by spend. Use this to see which users account
     * for the most cost. Only cost attributable to a seat user is included; for
     * organization-wide totals including direct API-key and automation traffic, use
     * the bucketed `/v1/organizations/analytics/cost_report` endpoint. Available to
     * organizations on a Claude Enterprise plan. Requires an API key with the
     * `read:analytics` scope.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAnalyticsCostUsersItem of client.beta.organization.analytics.userCostReport.list(
     *   { starting_at: '2019-12-27T18:11:19.117Z' },
     * )) {
     *   // ...
     * }
     * ```
     */
    list(query, options) {
        return this._client.getAPIList('/v1/organizations/analytics/user_cost_report?beta=true', (PageCursor), { query, ...options });
    }
}

class UserUsageReport extends APIResource {
    /**
     * Get per-user token usage across a date range.
     *
     * Returns one row per user, ranked by the chosen token metric. Use this to see
     * which users consume the most tokens. Only usage attributable to a seat user is
     * included; for organization-wide totals including direct API-key and automation
     * traffic, use the bucketed `/v1/organizations/analytics/usage_report` endpoint.
     * Available to organizations on a Claude Enterprise plan. Requires an API key with
     * the `read:analytics` scope.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAnalyticsUsageUsersItem of client.beta.organization.analytics.userUsageReport.list(
     *   { starting_at: '2019-12-27T18:11:19.117Z' },
     * )) {
     *   // ...
     * }
     * ```
     */
    list(query, options) {
        return this._client.getAPIList('/v1/organizations/analytics/user_usage_report?beta=true', (PageCursor), { query, ...options });
    }
}

let Users$2 = class Users extends APIResource {
    /**
     * Get per-user activity for a given day, with cursor-based pagination.
     *
     * Returns activity metrics for each user in the organization, sorted by email
     * address. Use `group_by[]` for per-RBAC-group aggregates, or `filter[]` to scope
     * results to specific members, groups, or a chat project. Available to
     * organizations on a Claude Enterprise plan. Requires an API key with the
     * `read:analytics` scope.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAnalyticsUserActivity of client.beta.organization.analytics.users.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/analytics/users?beta=true', (PageCursor), { query, ...options });
    }
};

class Projects extends APIResource {
    /**
     * Get per-project activity for a given day, with cursor-based pagination.
     *
     * Returns activity metrics for each project in the organization, sorted by project
     * ID. Use `group_by[]` to break projects out per member or per RBAC group, and
     * `filter[]` to scope results; the parameter descriptions list the supported
     * dimensions. Available to organizations on a Claude Enterprise plan. Requires an
     * API key with the `read:analytics` scope.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaAnalyticsProjectActivity of client.beta.organization.analytics.apps.chat.projects.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/analytics/apps/chat/projects?beta=true', (PageCursor), { query, ...options });
    }
}

var Chat = /* @__PURE__ */ (() => {
    class Chat extends APIResource {
        constructor() {
            super(...arguments);
            this.projects = new Projects(this._client);
        }
    }
    Chat.Projects = Projects;
    return Chat;
})();

var Apps = /* @__PURE__ */ (() => {
    class Apps extends APIResource {
        constructor() {
            super(...arguments);
            this.chat = new Chat(this._client);
        }
    }
    Apps.Chat = Chat;
    return Apps;
})();

var Analytics = /* @__PURE__ */ (() => {
    class Analytics extends APIResource {
        constructor() {
            super(...arguments);
            this.summaries = new Summaries(this._client);
            this.users = new Users$2(this._client);
            this.apps = new Apps(this._client);
            this.connectors = new Connectors(this._client);
            this.plugins = new Plugins$1(this._client);
            this.skills = new Skills$2(this._client);
            this.artifacts = new Artifacts(this._client);
            this.usageReport = new UsageReport(this._client);
            this.userUsageReport = new UserUsageReport(this._client);
            this.costReport = new CostReport(this._client);
            this.userCostReport = new UserCostReport(this._client);
        }
    }
    Analytics.Summaries = Summaries;
    Analytics.Users = Users$2;
    Analytics.Apps = Apps;
    Analytics.Connectors = Connectors;
    Analytics.Plugins = Plugins$1;
    Analytics.Skills = Skills$2;
    Analytics.Artifacts = Artifacts;
    Analytics.UsageReport = UsageReport;
    Analytics.UserUsageReport = UserUsageReport;
    Analytics.CostReport = CostReport;
    Analytics.UserCostReport = UserCostReport;
    return Analytics;
})();

let ComplianceSettings$1 = class ComplianceSettings extends APIResource {
    /**
     * Retrieve your organization's Compliance Settings.
     *
     * Compliance Settings is a singleton resource: there is exactly one per
     * organization, addressed without an identifier. The `state` field reflects
     * whether the Compliance API is enabled. An organization with a parent
     * organization reads the state inherited from the parent's configuration.
     *
     * @example
     * ```ts
     * const betaComplianceSettings =
     *   await client.beta.organization.complianceSettings.retrieve();
     * ```
     */
    retrieve(options) {
        return this._client.get('/v1/organizations/compliance_settings?beta=true', options);
    }
    /**
     * Update your organization's Compliance Settings.
     *
     * Setting `state` to `enabled` turns on the Compliance API and begins capturing
     * organization activity events. Setting it to `disabled` turns both off. `state`
     * reflects whether the Compliance API is enabled.
     *
     * A request that sets `state` to its current value succeeds and leaves the
     * resource unchanged. A `disabled` request stays in effect until a later `enabled`
     * request or the organization's next provisioning action that enables Access
     * Transparency: enabling Access Transparency also enables the Compliance API,
     * which serves its activity events, so such provisioning (including re-runs)
     * re-enables the Compliance API even after a `disabled` request. Automated
     * provisioning never disables compliance settings.
     *
     * @example
     * ```ts
     * const betaComplianceSettings =
     *   await client.beta.organization.complianceSettings.update({
     *     state: { type: 'enabled' },
     *   });
     * ```
     */
    update(body, options) {
        return this._client.post('/v1/organizations/compliance_settings?beta=true', { body, ...options });
    }
};

let ExternalKeys$1 = class ExternalKeys extends APIResource {
    /**
     * Create an external key config owned by the caller's organization.
     *
     * @example
     * ```ts
     * const betaExternalKey =
     *   await client.beta.organization.externalKeys.create({
     *     provider_config: {
     *       kms_arn:
     *         'arn:aws:kms:us-east-1:111122223333:key/abcd1234-5678-90ab-cdef-000011112222',
     *       type: 'aws',
     *     },
     *   });
     * ```
     */
    create(body, options) {
        return this._client.post('/v1/organizations/external_keys?beta=true', { body, ...options });
    }
    /**
     * Retrieve a single external key config in the caller's organization by ID.
     *
     * @example
     * ```ts
     * const betaExternalKey =
     *   await client.beta.organization.externalKeys.retrieve(
     *     'external_key_id',
     *   );
     * ```
     */
    retrieve(externalKeyID, options) {
        return this._client.get(path `/v1/organizations/external_keys/${externalKeyID}?beta=true`, options);
    }
    /**
     * Partially update an external key config. Omitted fields are left unchanged.
     *
     * `display_name` is always editable. `geo` and `provider_config` cannot be changed
     * once any workspace references this config, because previously encrypted data
     * requires the original key identity to decrypt.
     *
     * @example
     * ```ts
     * const betaExternalKey =
     *   await client.beta.organization.externalKeys.update(
     *     'external_key_id',
     *   );
     * ```
     */
    update(externalKeyID, body, options) {
        return this._client.post(path `/v1/organizations/external_keys/${externalKeyID}?beta=true`, {
            body,
            ...options,
        });
    }
    /**
     * List external key configs in the caller's organization.
     *
     * Results are ordered by creation time (newest first). Use the `next_page` cursor
     * from the response to fetch subsequent pages.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaExternalKey of client.beta.organization.externalKeys.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/external_keys?beta=true', (PageCursor), {
            query,
            ...options,
        });
    }
    /**
     * Delete an external key config.
     *
     * The request is rejected if any workspace still references this config.
     *
     * @example
     * ```ts
     * const externalKey =
     *   await client.beta.organization.externalKeys.delete(
     *     'external_key_id',
     *   );
     * ```
     */
    delete(externalKeyID, options) {
        return this._client.delete(path `/v1/organizations/external_keys/${externalKeyID}?beta=true`, options);
    }
    /**
     * Validate an external key config against the customer's KMS.
     *
     * Anthropic performs an encrypt/decrypt roundtrip against the configured KMS key
     * and waits up to 30 seconds for the result. The response status is `success` if
     * the roundtrip succeeded, or `failure` with an error message if it failed or
     * timed out.
     *
     * @example
     * ```ts
     * const response =
     *   await client.beta.organization.externalKeys.validate(
     *     'external_key_id',
     *   );
     * ```
     */
    validate(externalKeyID, options) {
        return this._client.post(path `/v1/organizations/external_keys/${externalKeyID}/validate?beta=true`, options);
    }
};

let Issuers$1 = class Issuers extends APIResource {
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Register an OIDC issuer that Anthropic will trust for workload identity
     * federation in your organization.
     *
     * The `jwks` field controls how the issuer's signing keys are obtained and takes
     * one of three shapes selected by `type`: `discovery` (resolve keys through OIDC
     * discovery), `explicit_url` (fetch keys from a fixed JWKS URL), or `inline`
     * (provide a static key set). When `jwks.type` is `discovery` and no
     * `discovery_base` is set, the issuer URL must be publicly reachable over HTTPS so
     * Anthropic can fetch the discovery document; for `explicit_url` and `inline`
     * modes the issuer URL is only matched as the JWT's `iss` claim and is not
     * fetched.
     *
     * @example
     * ```ts
     * const betaFederationIssuer =
     *   await client.beta.organization.federation.issuers.create({
     *     issuer_url: 'x',
     *     name: 'x',
     *   });
     * ```
     */
    create(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/organizations/federation_issuers?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Retrieve a federation issuer by its ID (`fdis_...`).
     *
     * @example
     * ```ts
     * const betaFederationIssuer =
     *   await client.beta.organization.federation.issuers.retrieve(
     *     'federation_issuer_id',
     *   );
     * ```
     */
    retrieve(federationIssuerID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.get(path `/v1/organizations/federation_issuers/${federationIssuerID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Partially update a federation issuer.
     *
     * Setting `jwks` replaces the full JWKS shape at once. Archived issuers cannot be
     * updated; this returns 400. Create a new issuer instead.
     *
     * Updating an issuer that backs a rule with a scope outside `workspace:developer`
     * or `workspace:inference` requires a Console session.
     *
     * @example
     * ```ts
     * const betaFederationIssuer =
     *   await client.beta.organization.federation.issuers.update(
     *     'federation_issuer_id',
     *   );
     * ```
     */
    update(federationIssuerID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/organizations/federation_issuers/${federationIssuerID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * List federation issuers in your organization.
     *
     * Archived issuers are excluded unless `include_archived=true`.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaFederationIssuer of client.beta.organization.federation.issuers.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/organizations/federation_issuers?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Archive a federation issuer.
     *
     * Idempotent; re-archiving returns the issuer with its original `archived_at`.
     * Rejected with 400 if any live (non-archived) federation rule still references
     * the issuer; archive those rules first (a rule's issuer cannot be changed), or
     * recreate them against another issuer.
     *
     * @example
     * ```ts
     * const betaFederationIssuer =
     *   await client.beta.organization.federation.issuers.archive(
     *     'federation_issuer_id',
     *   );
     * ```
     */
    archive(federationIssuerID, params = {}, options) {
        const { betas } = params ?? {};
        return this._client.post(path `/v1/organizations/federation_issuers/${federationIssuerID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
};

let Workspaces$5 = class Workspaces extends APIResource {
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * List workspaces where this federation rule is enabled.
     *
     * Returns all workspace enablements in a single response; the `limit` and `page`
     * parameters are accepted but have no effect, and `next_page` is always `null`.
     * Returns explicit per-workspace enablements only; for rules with
     * `applies_to_all_workspaces` or a legacy single `workspace_id`, check those
     * fields on the rule itself.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaFederationRuleWorkspace of client.beta.organization.federation.rules.workspaces.list(
     *   'federation_rule_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(federationRuleID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/organizations/federation_rules/${federationRuleID}/workspaces?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Enable a federation rule for a workspace.
     *
     * Idempotent; re-enabling returns the existing enablement. The rule and workspace
     * must both belong to your organization. Membership of the rule's target service
     * account in this workspace is not checked at enablement: token exchange into this
     * workspace is rejected unless the target is a member (it is implicitly a member
     * of the default workspace). Archived rules are rejected with 400. OAuth callers
     * may only manage rules whose `oauth_scope` is `workspace:developer` or
     * `workspace:inference`; other scopes require a Console session.
     *
     * @example
     * ```ts
     * const betaFederationRuleWorkspace =
     *   await client.beta.organization.federation.rules.workspaces.add(
     *     'federation_rule_id',
     *     { workspace_id: 'workspace_id' },
     *   );
     * ```
     */
    add(federationRuleID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/organizations/federation_rules/${federationRuleID}/workspaces?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Disable a federation rule for a workspace.
     *
     * Idempotent; succeeds even if the enablement was already removed. OAuth callers
     * may only manage rules whose `oauth_scope` is `workspace:developer` or
     * `workspace:inference`; other scopes require a Console session.
     *
     * @example
     * ```ts
     * const workspace =
     *   await client.beta.organization.federation.rules.workspaces.remove(
     *     'workspace_id',
     *     { federation_rule_id: 'federation_rule_id' },
     *   );
     * ```
     */
    remove(workspaceID, params, options) {
        const { federation_rule_id, betas } = params;
        return this._client.delete(path `/v1/organizations/federation_rules/${federation_rule_id}/workspaces/${workspaceID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
};

var Rules$1 = /* @__PURE__ */ (() => {
    class Rules extends APIResource {
        constructor() {
            super(...arguments);
            this.workspaces = new Workspaces$5(this._client);
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Create a federation rule owned by your organization.
         *
         * The referenced issuer and the target service account must already exist in the
         * same organization; invalid references are rejected with a 400 error. The
         * workspace reference is validated. Membership is not checked at rule creation:
         * token exchange resolves a single enabled workspace per call and is rejected
         * unless the target service account is a member of that workspace (it is
         * implicitly a member of the default workspace). Rules on well-known shared
         * issuers (GitHub Actions, GitLab, Buildkite, Terraform Cloud, Google) must
         * constrain tenant identity via an identity-bearing claim, a tenant-pinning
         * subject prefix (such as `repo:YOUR_ORG/...`), or a CEL condition referencing one
         * of those identity claims (e.g. `claims.repository_owner`). OAuth callers may
         * only manage rules whose `oauth_scope` is `workspace:developer` or
         * `workspace:inference`; other scopes require a Console session.
         *
         * @example
         * ```ts
         * const betaFederationRule =
         *   await client.beta.organization.federation.rules.create({
         *     issuer_id: 'issuer_id',
         *     match: {},
         *     name: 'x',
         *     oauth_scope: 'x',
         *     target: {
         *       service_account_id: 'svac_01SDCCSbTxrXDpWc1phhtcfK',
         *       type: 'service_account',
         *     },
         *   });
         * ```
         */
        create(params, options) {
            const { betas, ...body } = params;
            return this._client.post('/v1/organizations/federation_rules?beta=true', {
                body,
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Retrieve a federation rule by its ID (`fdrl_...`).
         *
         * @example
         * ```ts
         * const betaFederationRule =
         *   await client.beta.organization.federation.rules.retrieve(
         *     'federation_rule_id',
         *   );
         * ```
         */
        retrieve(federationRuleID, params = {}, options) {
            const { betas } = params ?? {};
            return this._client.get(path `/v1/organizations/federation_rules/${federationRuleID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Partially update a federation rule.
         *
         * `issuer_id` is immutable. `match` and `target` are replaced as whole objects
         * when set. Referenced service accounts and workspaces must exist in your
         * organization; invalid references are rejected with a 400 error. Archived rules
         * cannot be updated; this returns 400. Create a new rule instead. Rules on
         * well-known shared issuers (GitHub Actions, GitLab, Buildkite, Terraform Cloud,
         * Google) must constrain tenant identity via an identity-bearing claim, a
         * tenant-pinning subject prefix (such as `repo:YOUR_ORG/...`), or a CEL condition
         * referencing one of those identity claims (e.g. `claims.repository_owner`). On
         * these issuers the requirement is re-checked on every update; if an existing
         * rule's stored match does not yet constrain tenant identity, any update (even a
         * rename or description change) must also supply a conforming `match` in the same
         * request. OAuth callers may only manage rules whose `oauth_scope` is
         * `workspace:developer` or `workspace:inference`; other scopes require a Console
         * session.
         *
         * @example
         * ```ts
         * const betaFederationRule =
         *   await client.beta.organization.federation.rules.update(
         *     'federation_rule_id',
         *   );
         * ```
         */
        update(federationRuleID, params, options) {
            const { betas, ...body } = params;
            return this._client.post(path `/v1/organizations/federation_rules/${federationRuleID}?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * List federation rules in your organization.
         *
         * Optionally filter by issuer with `issuer_id`. Archived rules are excluded unless
         * `include_archived=true`.
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaFederationRule of client.beta.organization.federation.rules.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { betas, ...query } = params ?? {};
            return this._client.getAPIList('/v1/organizations/federation_rules?beta=true', (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Archive a federation rule.
         *
         * Token exchange through this rule stops immediately. Idempotent; re-archiving
         * returns the rule with its original `archived_at`. Archiving clears the rule's
         * workspace targeting (`workspace_id` and `workspace_ids` are emptied). Tokens
         * already minted before archive remain valid until they expire. OAuth callers may
         * only manage rules whose `oauth_scope` is `workspace:developer` or
         * `workspace:inference`; other scopes require a Console session.
         *
         * @example
         * ```ts
         * const betaFederationRule =
         *   await client.beta.organization.federation.rules.archive(
         *     'federation_rule_id',
         *   );
         * ```
         */
        archive(federationRuleID, params = {}, options) {
            const { betas } = params ?? {};
            return this._client.post(path `/v1/organizations/federation_rules/${federationRuleID}/archive?beta=true`, {
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
    }
    Rules.Workspaces = Workspaces$5;
    return Rules;
})();

var Federation$1 = /* @__PURE__ */ (() => {
    class Federation extends APIResource {
        constructor() {
            super(...arguments);
            this.issuers = new Issuers$1(this._client);
            this.rules = new Rules$1(this._client);
        }
    }
    Federation.Issuers = Issuers$1;
    Federation.Rules = Rules$1;
    return Federation;
})();

let Invites$1 = class Invites extends APIResource {
    /**
     * Invite a user to join the organization by email.
     *
     * On plans that draw members from a finite pool of purchased seats, the invite
     * automatically consumes a seat from the lowest tier with availability; there is
     * no seat-tier parameter. When no seat is free the request fails with a 400 error
     * rather than purchasing a seat.
     *
     * @example
     * ```ts
     * const betaOrganizationInvite =
     *   await client.beta.organization.invites.create({
     *     email: 'user@emaildomain.com',
     *     role: 'user',
     *   });
     * ```
     */
    create(body, options) {
        return this._client.post('/v1/organizations/invites?beta=true', { body, ...options });
    }
    /**
     * Retrieve an invite by ID.
     *
     * @example
     * ```ts
     * const betaOrganizationInvite =
     *   await client.beta.organization.invites.retrieve(
     *     'invite_id',
     *   );
     * ```
     */
    retrieve(inviteID, options) {
        return this._client.get(path `/v1/organizations/invites/${inviteID}?beta=true`, options);
    }
    /**
     * List the organization's invites.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaOrganizationInvite of client.beta.organization.invites.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/invites?beta=true', (Page), {
            query,
            ...options,
        });
    }
    /**
     * Delete a pending invite.
     *
     * @example
     * ```ts
     * const invite =
     *   await client.beta.organization.invites.delete(
     *     'invite_id',
     *   );
     * ```
     */
    delete(inviteID, options) {
        return this._client.delete(path `/v1/organizations/invites/${inviteID}?beta=true`, options);
    }
};

class PluginMarketplaces extends APIResource {
    /**
     * Retrieve a plugin marketplace by ID.
     *
     * **Accepted credentials:** an Admin API key with the `read:plugins` or
     * `read:org_audit` scope, or a Compliance Access Key with the
     * `read:compliance_org_data` scope.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * const betaPluginMarketplace =
     *   await client.beta.organization.pluginMarketplaces.retrieve(
     *     'marketplace_id',
     *   );
     * ```
     */
    retrieve(marketplaceID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.get(path `/v1/organizations/plugin_marketplaces/${marketplaceID}?beta=true`, {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Set the default installation setting of one of the organization's own plugin
     * marketplaces. Every Plugin in it without a setting of its own gets this default
     * as its organization-wide setting, including Plugins added later.
     *
     * Pass it as `default_installation_preference`. A member's personal marketplace
     * cannot be updated here (403).
     *
     * **Accepted credentials:** an Admin API key with the `write:plugins` scope.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * const betaPluginMarketplace =
     *   await client.beta.organization.pluginMarketplaces.update(
     *     'marketplace_id',
     *     { default_installation_preference: 'available' },
     *   );
     * ```
     */
    update(marketplaceID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/organizations/plugin_marketplaces/${marketplaceID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List the plugin marketplaces Plugins live in, newest first: the organization's
     * own and its members' personal ones.
     *
     * Plugin marketplaces are created, connected to a repository and deleted in
     * claude.ai, not through this API. The organization's library marketplace, the
     * organization-owned `manual` marketplace that uploads go to when no marketplace
     * is named, is created the first time something is put in it and is listed from
     * then on.
     *
     * **Accepted credentials:** an Admin API key with the `read:plugins` or
     * `read:org_audit` scope, or a Compliance Access Key with the
     * `read:compliance_org_data` scope.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaPluginMarketplace of client.beta.organization.pluginMarketplaces.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList('/v1/organizations/plugin_marketplaces?beta=true', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Check whether a plugin marketplace, uploaded as a `.zip` of the marketplace
     * directory, would synchronize into claude.ai, without connecting or storing it.
     *
     * To check a public GitHub repository instead, use Validate Plugin Marketplace
     * Repository.
     *
     * The report says whether `marketplace.json` is well-formed, which plugins a
     * synchronization would skip and why, and which plugins would synchronize only in
     * part, with some files left out. An archive that cannot be read as a marketplace
     * is reported, not refused: the response is a report with `valid: false`. Plugin
     * sources outside the marketplace are fetched anonymously from GitHub, so a
     * private one is reported as not found; a source on any other host is not fetched
     * here, and the report notes that it will be checked when the marketplace actually
     * synchronizes.
     *
     * Nothing is recorded on the Compliance API activity feed.
     *
     * For a worked example, see
     * [Validate marketplace content](/docs/en/manage-claude/plugins-api#validate-marketplace-content)
     * in the Plugins API guide.
     *
     * **Accepted credentials:** an Admin API key with the `read:plugins` or
     * `write:plugins` scope; `read:org_audit` and `read:compliance_org_data` do not
     * grant it.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * const betaPluginMarketplaceValidationReport =
     *   await client.beta.organization.pluginMarketplaces.validateArchive(
     *     { archive: fs.createReadStream('path/to/file') },
     *   );
     * ```
     */
    validateArchive(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/organizations/plugin_marketplaces/validate_archive?beta=true', multipartFormRequestOptions({
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        }, this._client));
    }
    /**
     * Check whether a plugin marketplace held in a public GitHub repository would
     * synchronize into claude.ai, without connecting or storing it.
     *
     * To check a `.zip` of the marketplace directory instead, use Validate Plugin
     * Marketplace Archive.
     *
     * The report says whether `marketplace.json` is well-formed, which plugins a
     * synchronization would skip and why, and which plugins would synchronize only in
     * part, with some files left out. A repository that is missing, private, or has no
     * such branch or commit is reported, not refused: the response is a report with
     * `valid: false`. Plugin sources outside the marketplace are fetched anonymously
     * from GitHub, so a private one is reported as not found; a source on any other
     * host is not fetched here, and the report notes that it will be checked when the
     * marketplace actually synchronizes.
     *
     * Nothing is recorded on the Compliance API activity feed.
     *
     * For a worked example, see
     * [Validate marketplace content](/docs/en/manage-claude/plugins-api#validate-marketplace-content)
     * in the Plugins API guide.
     *
     * **Accepted credentials:** an Admin API key with the `read:plugins` or
     * `write:plugins` scope; `read:org_audit` and `read:compliance_org_data` do not
     * grant it.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * const betaPluginMarketplaceValidationReport =
     *   await client.beta.organization.pluginMarketplaces.validateRepository(
     *     {
     *       repository_url:
     *         'https://github.com/example-org/example-marketplace',
     *     },
     *   );
     * ```
     */
    validateRepository(params, options) {
        const { betas, ...body } = params;
        return this._client.post('/v1/organizations/plugin_marketplaces/validate_repository?beta=true', {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        });
    }
}

let RateLimits$3 = class RateLimits extends APIResource {
    /**
     * List Messages API rate limits for your organization.
     *
     * Each entry corresponds to one rate-limit group (either a model family or an
     * API-surface category such as the Message Batches API or the web search tool) and
     * contains the set of limiter values that apply to it.
     *
     * When `limit` is omitted, every matching entry is returned in a single page; when
     * `limit` truncates the result, follow `next_page` to fetch the remaining entries.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaOrganizationRateLimit of client.beta.organization.rateLimits.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/rate_limits?beta=true', (PageCursor), { query, ...options });
    }
};

let Users$1 = class Users extends APIResource {
    /**
     * Retrieve a member of the organization by user ID.
     *
     * @example
     * ```ts
     * const betaOrganizationUser =
     *   await client.beta.organization.users.retrieve('user_id');
     * ```
     */
    retrieve(userID, options) {
        return this._client.get(path `/v1/organizations/users/${userID}?beta=true`, options);
    }
    /**
     * Update a member's organization role.
     *
     * @example
     * ```ts
     * const betaOrganizationUser =
     *   await client.beta.organization.users.update('user_id', {
     *     role: 'user',
     *   });
     * ```
     */
    update(userID, body, options) {
        return this._client.post(path `/v1/organizations/users/${userID}?beta=true`, { body, ...options });
    }
    /**
     * List the organization's members.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaOrganizationUser of client.beta.organization.users.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/users?beta=true', (Page), {
            query,
            ...options,
        });
    }
    /**
     * Remove a member from the organization.
     *
     * @example
     * ```ts
     * const user = await client.beta.organization.users.remove(
     *   'user_id',
     * );
     * ```
     */
    remove(userID, options) {
        return this._client.delete(path `/v1/organizations/users/${userID}?beta=true`, options);
    }
};

class InstallationSettings extends APIResource {
    /**
     * List an organization-owned Plugin's installation settings, which say which
     * members it is for, most recently created first.
     *
     * The list holds the Plugin's own organization-wide setting (absent while the
     * Plugin inherits its marketplace's default) and each RBAC Group's own setting. A
     * member-owned Plugin has shares instead, so this path returns 404 for one.
     *
     * **Accepted credentials:** an Admin API key with the `read:plugins` or
     * `read:org_audit` scope, or a Compliance Access Key with the
     * `read:compliance_org_data` scope.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaPluginInstallationSetting of client.beta.organization.plugins.installationSettings.list(
     *   'plugin_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(pluginID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/organizations/plugins/${pluginID}/installation_settings?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Remove an organization-owned Plugin's own installation setting for the whole
     * organization or for one RBAC Group.
     *
     * Removing the `organization` target returns the Plugin to its marketplace's
     * default installation setting and leaves the groups' settings in place. Removing
     * a group's setting makes the group's members fall back to the Plugin's
     * organization-wide setting or to the settings of their other groups.
     *
     * A target that holds no setting of its own returns 404 (a Plugin that already
     * inherits its marketplace's default holds no `organization` setting), and so does
     * a member-owned Plugin.
     *
     * A removal counts as one of the Plugin's installation-setting writes: send all of
     * those writes one at a time. If several arrive for the same Plugin at the same
     * time, the server handles them one after another and can answer some of them with
     * `503` and `x-should-retry: true` instead of applying them; wait a second or two
     * and send the removal again. A `404` on the repeat means the setting is already
     * gone.
     *
     * **Accepted credentials:** an Admin API key with the `write:plugins` scope.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * const betaDeletedPluginInstallationSetting =
     *   await client.beta.organization.plugins.installationSettings.remove(
     *     'target',
     *     { plugin_id: 'plugin_id' },
     *   );
     * ```
     */
    remove(target, params, options) {
        const { plugin_id, betas } = params;
        return this._client.delete(path `/v1/organizations/plugins/${plugin_id}/installation_settings/${target}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Set or change an organization-owned Plugin's installation setting for the whole
     * organization or for one RBAC Group.
     *
     * Writing the value a target already holds of its own changes nothing.
     *
     * A member-owned Plugin has shares instead of installation settings, so this path
     * returns 404 for one.
     *
     * Send a Plugin's installation-setting writes one at a time. If several writes for
     * the same Plugin arrive at the same time, the server handles them one after
     * another and can answer some of them with `503` instead of applying them. That
     * `503` carries `x-should-retry: true`, and the write is safe to repeat: wait a
     * second or two, then send it again.
     *
     * **Accepted credentials:** an Admin API key with the `write:plugins` scope.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * const betaPluginInstallationSetting =
     *   await client.beta.organization.plugins.installationSettings.set(
     *     'target',
     *     {
     *       plugin_id: 'plugin_id',
     *       installation_preference: 'required',
     *     },
     *   );
     * ```
     */
    set(target, params, options) {
        const { plugin_id, betas, ...body } = params;
        return this._client.post(path `/v1/organizations/plugins/${plugin_id}/installation_settings/${target}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        });
    }
}

class Shares extends APIResource {
    /**
     * List the shares the owner of a member-owned Plugin has given — to every member
     * of the organization, to an RBAC Group, or to one member — most recently granted
     * first.
     *
     * Shares are read-only in this API: members give and withdraw them in claude.ai,
     * and who gave a share is recorded on the Compliance API activity feed rather than
     * on the share. An organization-owned Plugin has installation settings instead, so
     * this path returns 404 for one.
     *
     * **Accepted credentials:** an Admin API key with the `read:plugins` or
     * `read:org_audit` scope, or a Compliance Access Key with the
     * `read:compliance_org_data` scope.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaPluginShare of client.beta.organization.plugins.shares.list(
     *   'plugin_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(pluginID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/organizations/plugins/${pluginID}/shares?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        });
    }
}

let Versions$2 = class Versions extends APIResource {
    /**
     * Add a version to an organization-owned Plugin by uploading the new version's
     * files; it becomes the version served to members unless the Plugin's served
     * version has been pinned.
     *
     * The upload is the same `multipart/form-data` as creating a Plugin: the version's
     * files (`files`, each part sent as `files[]`) and optional `release_notes`. The
     * uploaded manifest's `name` must equal the Plugin's `name`. Returns the stored
     * version; read the Plugin back to see which version it serves.
     *
     * Only a Plugin in a `manual` marketplace takes uploads; a Plugin synchronized
     * from a repository gets its versions from the repository. When the Plugin is in
     * the organization's library marketplace, a version that adds a skill with the
     * name of an organization skill (a skill an administrator uploaded for the whole
     * organization in claude.ai) is refused with a 409: `error_code`
     * `skill_name_taken`, with that name in `details.skill_name`. A 503 with
     * `error_code` `registration_pending` means the version was stored but is not yet
     * usable; a later version create on the Plugin completes it.
     *
     * For a worked example, see
     * [Create a version](/docs/en/manage-claude/plugins-api#create-a-version) in the
     * Plugins API guide.
     *
     * **Accepted credentials:** an Admin API key with the `write:plugins` scope.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * const betaPluginVersion =
     *   await client.beta.organization.plugins.versions.create(
     *     'plugin_id',
     *     { files: [fs.createReadStream('path/to/file')] },
     *   );
     * ```
     */
    create(pluginID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/organizations/plugins/${pluginID}/versions?beta=true`, multipartFormRequestOptions({
            body,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        }, this._client));
    }
    /**
     * Retrieve one version of a Plugin by its ID, or the Plugin's newest version.
     *
     * **Accepted credentials:** an Admin API key with the `read:plugins` or
     * `read:org_audit` scope, or a Compliance Access Key with the
     * `read:compliance_org_data` scope.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * const betaPluginVersion =
     *   await client.beta.organization.plugins.versions.retrieve(
     *     'version',
     *     { plugin_id: 'plugin_id' },
     *   );
     * ```
     */
    retrieve(version, params, options) {
        const { plugin_id, betas, ...query } = params;
        return this._client.get(path `/v1/organizations/plugins/${plugin_id}/versions/${version}?beta=true`, {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * List a Plugin's versions, newest first.
     *
     * The first item of the first page is the version the Plugin's `latest_version_id`
     * refers to.
     *
     * **Accepted credentials:** an Admin API key with the `read:plugins` or
     * `read:org_audit` scope, or a Compliance Access Key with the
     * `read:compliance_org_data` scope.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaPluginVersion of client.beta.organization.plugins.versions.list(
     *   'plugin_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(pluginID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/organizations/plugins/${pluginID}/versions?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                options?.headers,
            ]),
        });
    }
    /**
     * Download one version's `.zip` archive, exactly as stored. Each download of a
     * Plugin from a member's personal plugin marketplace is recorded on the Compliance
     * API activity feed.
     *
     * The response body is the archive (`Content-Type: application/zip`), sent as an
     * attachment whose filename is derived from the Plugin's name; name saved files
     * from the IDs in the request path, since that filename is not unique.
     *
     * **Accepted credentials:** an Admin API key with the `read:plugins` or
     * `read:org_audit` scope, or a Compliance Access Key with the
     * `read:compliance_org_data` scope.
     *
     * Every read scope above (`read:plugins`, `read:org_audit`, and
     * `read:compliance_org_data`) can download the files of plugins in members'
     * personal marketplaces, including files that claude.ai's admin settings do not
     * show, and a `read:org_audit` or `read:compliance_org_data` key created for all
     * of your parent organization's linked organizations can do this in any
     * organization under it that has access to this API, by passing `organization_id`.
     * Each such download records a `claude_plugin_archive_accessed` event on the
     * Compliance API activity feed, identifying the key, the plugin, the version, and
     * the member. Downloads of organization-owned plugins are not recorded.
     *
     * Every request must include the beta header
     * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
     * exactly as if the endpoint did not exist. The Plugins API is in beta and is
     * available to Claude Enterprise organizations only. It is not available to Claude
     * Platform (Claude Console) organizations, or to organizations with HIPAA
     * readiness enabled.
     *
     * @example
     * ```ts
     * const response =
     *   await client.beta.organization.plugins.versions.download(
     *     'version',
     *     { plugin_id: 'plugin_id' },
     *   );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    download(version, params, options) {
        const { plugin_id, betas, ...query } = params;
        return this._client.get(path `/v1/organizations/plugins/${plugin_id}/versions/${version}/content?beta=true`, {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString(),
                    Accept: 'application/binary',
                },
                options?.headers,
            ]),
            __binaryResponse: true,
        });
    }
};

var Plugins = /* @__PURE__ */ (() => {
    class Plugins extends APIResource {
        constructor() {
            super(...arguments);
            this.versions = new Versions$2(this._client);
            this.installationSettings = new InstallationSettings(this._client);
            this.shares = new Shares(this._client);
        }
        /**
         * Create an organization-owned Plugin and its first version by uploading the
         * version's files.
         *
         * The upload is `multipart/form-data`: the version's files (`files`, each part
         * sent as `files[]`), with an optional `marketplace_id` and `release_notes`. The
         * manifest's `name` becomes the Plugin's `name`, and `display_name`, `description`
         * and `manifest_version` come from the manifest too.
         *
         * `name` may contain lowercase letters (from any alphabet), digits, and hyphens,
         * up to 64 characters. Uppercase letters, spaces, underscores, and other
         * punctuation are rejected.
         *
         * The `name` must be unique within the marketplace: a name already taken returns a
         * 409 with `error_code` `plugin_name_taken` and, when a Plugin holds it, that
         * Plugin's ID in `details.plugin_id`. A Plugin going into the organization's
         * library marketplace is also refused with a 409 when one of its skills has the
         * name of an organization skill (a skill an administrator uploaded for the whole
         * organization in claude.ai): `error_code` `skill_name_taken`, with that name in
         * `details.skill_name`; rename the skill, or remove the organization skill in
         * claude.ai. A 503 with `error_code` `registration_pending` means the Plugin and
         * its version were stored (their IDs are in `details`) but are not yet usable in
         * claude.ai: do not retry the create (the retry would return `plugin_name_taken`);
         * create a version on the stored Plugin instead, which completes it.
         *
         * For a worked example, see
         * [Create a plugin](/docs/en/manage-claude/plugins-api#create-a-plugin) in the
         * Plugins API guide.
         *
         * **Accepted credentials:** an Admin API key with the `write:plugins` scope.
         *
         * Every request must include the beta header
         * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
         * exactly as if the endpoint did not exist. The Plugins API is in beta and is
         * available to Claude Enterprise organizations only. It is not available to Claude
         * Platform (Claude Console) organizations, or to organizations with HIPAA
         * readiness enabled.
         *
         * @example
         * ```ts
         * const betaPlugin =
         *   await client.beta.organization.plugins.create({
         *     files: [fs.createReadStream('path/to/file')],
         *   });
         * ```
         */
        create(params, options) {
            const { betas, ...body } = params;
            return this._client.post('/v1/organizations/plugins?beta=true', multipartFormRequestOptions({
                body,
                ...options,
                headers: buildHeaders([
                    { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                    options?.headers,
                ]),
            }, this._client));
        }
        /**
         * Retrieve a Plugin by ID.
         *
         * **Accepted credentials:** an Admin API key with the `read:plugins` or
         * `read:org_audit` scope, or a Compliance Access Key with the
         * `read:compliance_org_data` scope.
         *
         * Every request must include the beta header
         * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
         * exactly as if the endpoint did not exist. The Plugins API is in beta and is
         * available to Claude Enterprise organizations only. It is not available to Claude
         * Platform (Claude Console) organizations, or to organizations with HIPAA
         * readiness enabled.
         *
         * @example
         * ```ts
         * const betaPlugin =
         *   await client.beta.organization.plugins.retrieve(
         *     'plugin_id',
         *   );
         * ```
         */
        retrieve(pluginID, params = {}, options) {
            const { betas, ...query } = params ?? {};
            return this._client.get(path `/v1/organizations/plugins/${pluginID}?beta=true`, {
                query,
                ...options,
                headers: buildHeaders([
                    { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                    options?.headers,
                ]),
            });
        }
        /**
         * Change which stored version of an organization-owned Plugin is served to
         * members, for example to roll back to an earlier one. This pins the served
         * version: later uploads are stored but no longer change what is served, and
         * pinning cannot currently be undone, here or in claude.ai.
         *
         * Pass the version as `served_version_id`: an earlier one to roll back, a later
         * one to start serving a version that was stored without being served, or the one
         * already served to pin it without changing what is served. No new version is
         * created.
         *
         * When the organization has content scanning enabled, a version whose scan is
         * still running is refused with a 409 (`error_code` `scan_pending`; retry once the
         * scan finishes) and one whose scan failed, errored or reached no verdict with a
         * 400 (`scan_failed`; a `warn` is accepted). When the Plugin is in the
         * organization's library marketplace, a version other than the one served is also
         * refused with a 409 when one of its skills has a name that an organization skill
         * (one an administrator uploaded for the whole organization in claude.ai) has
         * since taken: `error_code` `skill_name_taken`, with that name in
         * `details.skill_name`. A member-owned Plugin cannot be updated here (403).
         *
         * This endpoint does not write installation settings; they are written at
         * `/v1/organizations/plugins/{plugin_id}/installation_settings/{target}`.
         *
         * **Accepted credentials:** an Admin API key with the `write:plugins` scope.
         *
         * Every request must include the beta header
         * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
         * exactly as if the endpoint did not exist. The Plugins API is in beta and is
         * available to Claude Enterprise organizations only. It is not available to Claude
         * Platform (Claude Console) organizations, or to organizations with HIPAA
         * readiness enabled.
         *
         * @example
         * ```ts
         * const betaPlugin =
         *   await client.beta.organization.plugins.update(
         *     'plugin_id',
         *     {
         *       served_version_id:
         *         'pluginver_01KaZmQpRsTuVwXyZ2b4c6d8',
         *     },
         *   );
         * ```
         */
        update(pluginID, params, options) {
            const { betas, ...body } = params;
            return this._client.post(path `/v1/organizations/plugins/${pluginID}?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                    options?.headers,
                ]),
            });
        }
        /**
         * List the Plugins created under the organization, newest first: those in the
         * organization's own plugin marketplaces and those in members' personal plugin
         * marketplaces.
         *
         * Plugins in members' personal marketplaces are listed with the same detail as the
         * organization's own, and their files can be downloaded through the version
         * archive endpoint, which records each such download on the Compliance API
         * activity feed.
         *
         * **Accepted credentials:** an Admin API key with the `read:plugins` or
         * `read:org_audit` scope, or a Compliance Access Key with the
         * `read:compliance_org_data` scope.
         *
         * Every request must include the beta header
         * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
         * exactly as if the endpoint did not exist. The Plugins API is in beta and is
         * available to Claude Enterprise organizations only. It is not available to Claude
         * Platform (Claude Console) organizations, or to organizations with HIPAA
         * readiness enabled.
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaPlugin of client.beta.organization.plugins.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { betas, ...query } = params ?? {};
            return this._client.getAPIList('/v1/organizations/plugins?beta=true', (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                    options?.headers,
                ]),
            });
        }
        /**
         * Permanently delete a Plugin and every version it holds, exactly as when an
         * administrator deletes it in claude.ai. The Plugin may belong to the organization
         * or to a member, including a member who has since left the organization.
         *
         * An organization-owned Plugin's installation settings go with it; a member-owned
         * Plugin's shares are withdrawn and its owner no longer has it.
         *
         * To take an organization-owned Plugin out of use reversibly, set its
         * organization-wide installation setting to `not_available` instead (and remove or
         * change any group settings, which override it for their members). Only a Plugin
         * in a `manual` marketplace can be deleted here; one synchronized from a
         * repository is removed by removing it from the repository (400).
         *
         * **Accepted credentials:** an Admin API key with the `write:plugins` scope.
         *
         * Every request must include the beta header
         * `anthropic-beta: ce-plugins-2026-09-01`. A request without it returns `404`,
         * exactly as if the endpoint did not exist. The Plugins API is in beta and is
         * available to Claude Enterprise organizations only. It is not available to Claude
         * Platform (Claude Console) organizations, or to organizations with HIPAA
         * readiness enabled.
         *
         * @example
         * ```ts
         * const betaDeletedPlugin =
         *   await client.beta.organization.plugins.delete(
         *     'plugin_id',
         *   );
         * ```
         */
        delete(pluginID, params = {}, options) {
            const { betas } = params ?? {};
            return this._client.delete(path `/v1/organizations/plugins/${pluginID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    { 'anthropic-beta': [...(betas ?? []), 'ce-plugins-2026-09-01'].toString() },
                    options?.headers,
                ]),
            });
        }
    }
    Plugins.Versions = Versions$2;
    Plugins.InstallationSettings = InstallationSettings;
    Plugins.Shares = Shares;
    return Plugins;
})();

let Members$2 = class Members extends APIResource {
    /**
     * List members of an RBAC Group.
     *
     * The RBAC Groups API is available to Claude Enterprise organizations only.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaRBACGroupMember of client.beta.organization.rbacGroups.members.list(
     *   'rbac_group_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(rbacGroupID, query = {}, options) {
        return this._client.getAPIList(path `/v1/organizations/rbac_groups/${rbacGroupID}/members?beta=true`, (PageCursor), { query, ...options });
    }
    /**
     * Add a User to an RBAC Group. Membership of groups provisioned by an identity
     * provider (source type `"scim"`) cannot be modified via the API while an
     * organization in the tenant uses SCIM provisioning.
     *
     * The RBAC Groups API is available to Claude Enterprise organizations only.
     *
     * @example
     * ```ts
     * const betaRBACGroupMember =
     *   await client.beta.organization.rbacGroups.members.add(
     *     'rbac_group_id',
     *     { user_id: 'user_01WCz1FkmYMm4gnmykNKUu3Q' },
     *   );
     * ```
     */
    add(rbacGroupID, body, options) {
        return this._client.post(path `/v1/organizations/rbac_groups/${rbacGroupID}/members?beta=true`, {
            body,
            ...options,
        });
    }
    /**
     * Remove a User from an RBAC Group. Membership of groups provisioned by an
     * identity provider (source type `"scim"`) cannot be modified via the API while an
     * organization in the tenant uses SCIM provisioning.
     *
     * The RBAC Groups API is available to Claude Enterprise organizations only.
     *
     * @example
     * ```ts
     * const member =
     *   await client.beta.organization.rbacGroups.members.remove(
     *     'user_id',
     *     { rbac_group_id: 'rbac_group_id' },
     *   );
     * ```
     */
    remove(userID, params, options) {
        const { rbac_group_id } = params;
        return this._client.delete(path `/v1/organizations/rbac_groups/${rbac_group_id}/members/${userID}?beta=true`, options);
    }
};

var RBACGroups = /* @__PURE__ */ (() => {
    class RBACGroups extends APIResource {
        constructor() {
            super(...arguments);
            this.members = new Members$2(this._client);
        }
        /**
         * Create an RBAC Group in the Claude Enterprise tenant. Groups created via the API
         * have source type `"direct"`.
         *
         * The RBAC Groups API is available to Claude Enterprise organizations only.
         *
         * @example
         * ```ts
         * const betaRBACGroup =
         *   await client.beta.organization.rbacGroups.create({
         *     name: 'Engineering',
         *   });
         * ```
         */
        create(body, options) {
            return this._client.post('/v1/organizations/rbac_groups?beta=true', { body, ...options });
        }
        /**
         * Retrieve an RBAC Group by ID.
         *
         * The RBAC Groups API is available to Claude Enterprise organizations only.
         *
         * @example
         * ```ts
         * const betaRBACGroup =
         *   await client.beta.organization.rbacGroups.retrieve(
         *     'rbac_group_id',
         *   );
         * ```
         */
        retrieve(rbacGroupID, options) {
            return this._client.get(path `/v1/organizations/rbac_groups/${rbacGroupID}?beta=true`, options);
        }
        /**
         * Update an RBAC Group's name. Groups provisioned by an identity provider (source
         * type `"scim"`) cannot be modified via the API while an organization in the
         * tenant uses SCIM provisioning.
         *
         * The RBAC Groups API is available to Claude Enterprise organizations only.
         *
         * @example
         * ```ts
         * const betaRBACGroup =
         *   await client.beta.organization.rbacGroups.update(
         *     'rbac_group_id',
         *   );
         * ```
         */
        update(rbacGroupID, body, options) {
            return this._client.post(path `/v1/organizations/rbac_groups/${rbacGroupID}?beta=true`, {
                body,
                ...options,
            });
        }
        /**
         * List RBAC Groups in the Claude Enterprise tenant.
         *
         * The RBAC Groups API is available to Claude Enterprise organizations only.
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaRBACGroup of client.beta.organization.rbacGroups.list()) {
         *   // ...
         * }
         * ```
         */
        list(query = {}, options) {
            return this._client.getAPIList('/v1/organizations/rbac_groups?beta=true', (PageCursor), {
                query,
                ...options,
            });
        }
        /**
         * Delete an RBAC Group. Groups provisioned by an identity provider (source type
         * `"scim"`) cannot be deleted via the API while an organization in the tenant uses
         * SCIM provisioning.
         *
         * The RBAC Groups API is available to Claude Enterprise organizations only.
         *
         * @example
         * ```ts
         * const rbacGroup =
         *   await client.beta.organization.rbacGroups.delete(
         *     'rbac_group_id',
         *   );
         * ```
         */
        delete(rbacGroupID, options) {
            return this._client.delete(path `/v1/organizations/rbac_groups/${rbacGroupID}?beta=true`, options);
        }
    }
    RBACGroups.Members = Members$2;
    return RBACGroups;
})();

class Permissions extends APIResource {
    /**
     * List the permissions an RBAC Role grants.
     *
     * The RBAC Roles API is available to Claude Enterprise organizations only.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaRBACRolePermission of client.beta.organization.rbacRoles.permissions.list(
     *   'rbac_role_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(rbacRoleID, query = {}, options) {
        return this._client.getAPIList(path `/v1/organizations/rbac_roles/${rbacRoleID}/permissions?beta=true`, (PageCursor), { query, ...options });
    }
}

var RBACRoles = /* @__PURE__ */ (() => {
    class RBACRoles extends APIResource {
        constructor() {
            super(...arguments);
            this.permissions = new Permissions(this._client);
        }
        /**
         * Retrieve an RBAC Role by ID.
         *
         * The RBAC Roles API is available to Claude Enterprise organizations only.
         *
         * @example
         * ```ts
         * const betaRBACRole =
         *   await client.beta.organization.rbacRoles.retrieve(
         *     'rbac_role_id',
         *   );
         * ```
         */
        retrieve(rbacRoleID, options) {
            return this._client.get(path `/v1/organizations/rbac_roles/${rbacRoleID}?beta=true`, options);
        }
        /**
         * List RBAC Roles in the organization.
         *
         * The RBAC Roles API is available to Claude Enterprise organizations only.
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaRBACRole of client.beta.organization.rbacRoles.list()) {
         *   // ...
         * }
         * ```
         */
        list(query = {}, options) {
            return this._client.getAPIList('/v1/organizations/rbac_roles?beta=true', (PageCursor), {
                query,
                ...options,
            });
        }
    }
    RBACRoles.Permissions = Permissions;
    return RBACRoles;
})();

let Workspaces$4 = class Workspaces extends APIResource {
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * List the workspaces a service account is a member of.
     *
     * Each entry includes the service account's `workspace_role` in that workspace.
     * Use `limit` and the `next_page` cursor to paginate. When the service account has
     * no explicit default-workspace membership, the implicit (`implicit: true`)
     * membership is returned as the first entry on the first page; with `limit=1` the
     * first page may return up to 2 entries (the implicit entry plus one explicit
     * membership) so a pagination cursor can be derived. Memberships are returned only
     * while the service account is active. Without a `page` cursor, an archived
     * service account returns an empty list. A `page` cursor that does not match an
     * active membership returns a 400 invalid-request error. A cursor stops matching
     * when the membership is removed, the workspace is deleted, or the service account
     * is archived. Restart pagination from the first page to recover.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaServiceAccountWorkspaceMember of client.beta.organization.serviceAccounts.workspaces.list(
     *   'service_account_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(serviceAccountID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/organizations/service_accounts/${serviceAccountID}/workspaces?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Add a service account to a workspace with the given `workspace_role`.
     *
     * Mirror of `POST /workspaces/{workspace_id}/service_accounts`, addressed from the
     * service-account side; both create the same membership. If the service account is
     * already an explicit member of the workspace, its `workspace_role` is replaced
     * with the value supplied here. Archived workspaces return 400. Archived service
     * accounts cannot be added and are rejected.
     *
     * @example
     * ```ts
     * const betaServiceAccountWorkspaceMember =
     *   await client.beta.organization.serviceAccounts.workspaces.add(
     *     'service_account_id',
     *     {
     *       workspace_id: 'workspace_id',
     *       workspace_role: 'workspace_admin',
     *     },
     *   );
     * ```
     */
    add(serviceAccountID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/organizations/service_accounts/${serviceAccountID}/workspaces?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Remove a service account from a workspace.
     *
     * Mirror of
     * `DELETE /workspaces/{workspace_id}/service_accounts/{service_account_id}`,
     * addressed from the service-account side. Removal is idempotent (returns 200 even
     * if the membership was already removed). A DELETE against the implicit
     * default-workspace membership returns 200 but is a no-op and the membership
     * persists; deleting an explicit default-workspace row reverts to the implicit
     * `workspace_user` membership. Archived workspaces return 400.
     *
     * @example
     * ```ts
     * const workspace =
     *   await client.beta.organization.serviceAccounts.workspaces.remove(
     *     'workspace_id',
     *     { service_account_id: 'service_account_id' },
     *   );
     * ```
     */
    remove(workspaceID, params, options) {
        const { service_account_id, betas } = params;
        return this._client.delete(path `/v1/organizations/service_accounts/${service_account_id}/workspaces/${workspaceID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
};

var ServiceAccounts$3 = /* @__PURE__ */ (() => {
    class ServiceAccounts extends APIResource {
        constructor() {
            super(...arguments);
            this.workspaces = new Workspaces$4(this._client);
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Create a service account.
         *
         * A service account is a named workload identity that federation rules target.
         * `organization_role` is `developer` (default) or `admin`; a rule may only be
         * created or retargeted to grant `org:admin` scope when the target's
         * `organization_role` is `admin`. Creating an `admin`-role service account
         * requires an interactive credential (a user OAuth token or a Console session) — a
         * workload may only create `developer`-role service accounts.
         *
         * @example
         * ```ts
         * const betaServiceAccount =
         *   await client.beta.organization.serviceAccounts.create({
         *     name: 'ci-deploy-bot',
         *   });
         * ```
         */
        create(params, options) {
            const { betas, ...body } = params;
            return this._client.post('/v1/organizations/service_accounts?beta=true', {
                body,
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Retrieve a service account by its ID (`svac_...`).
         *
         * @example
         * ```ts
         * const betaServiceAccount =
         *   await client.beta.organization.serviceAccounts.retrieve(
         *     'service_account_id',
         *   );
         * ```
         */
        retrieve(serviceAccountID, params = {}, options) {
            const { betas } = params ?? {};
            return this._client.get(path `/v1/organizations/service_accounts/${serviceAccountID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Update a service account.
         *
         * Only `description` and `organization_role` are mutable; `name` cannot be
         * changed. Archived service accounts cannot be updated; this returns 400. Setting
         * `organization_role` to `admin` (even when unchanged) requires an interactive
         * credential (a user OAuth token or a Console session).
         *
         * @example
         * ```ts
         * const betaServiceAccount =
         *   await client.beta.organization.serviceAccounts.update(
         *     'service_account_id',
         *   );
         * ```
         */
        update(serviceAccountID, params, options) {
            const { betas, ...body } = params;
            return this._client.post(path `/v1/organizations/service_accounts/${serviceAccountID}?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * List service accounts in the caller's organization.
         *
         * Results are ordered by creation time, newest first. Use `limit` and the
         * `next_page` cursor to paginate; set `include_archived=true` to include archived
         * service accounts.
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaServiceAccount of client.beta.organization.serviceAccounts.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { betas, ...query } = params ?? {};
            return this._client.getAPIList('/v1/organizations/service_accounts?beta=true', (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Archive a service account.
         *
         * Idempotent; re-archiving returns the service account with its original
         * `archived_at`. Rejected with 400 if any live (non-archived) federation rule
         * still targets this service account, same as issuer archival; archive those rules
         * first or change their target to another service account.
         *
         * @example
         * ```ts
         * const betaServiceAccount =
         *   await client.beta.organization.serviceAccounts.archive(
         *     'service_account_id',
         *   );
         * ```
         */
        archive(serviceAccountID, params = {}, options) {
            const { betas } = params ?? {};
            return this._client.post(path `/v1/organizations/service_accounts/${serviceAccountID}/archive?beta=true`, {
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
    }
    ServiceAccounts.Workspaces = Workspaces$4;
    return ServiceAccounts;
})();

class Effective extends APIResource {
    /**
     * List each member's effective spend limit and period-to-date spend.
     *
     * Returns one row per (member, period) the member resolves a spend limit for, with
     * the `source` scope the spend limit was inherited from. Paginates by member, so a
     * member's periods never split across pages. Listing Claude Console limits is in
     * an early access preview. To request access, contact your Anthropic account team.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaSpendSummary of client.beta.organization.spendLimits.effective.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/spend_limits/effective?beta=true', (PageCursor), { query, ...options });
    }
}

class IncreaseRequests extends APIResource {
    /**
     * Retrieve a spend limit increase request.
     *
     * While `pending`, the response includes a live `spend_summary` for the requester
     * at the request's period.
     *
     * @example
     * ```ts
     * const betaSpendLimitIncreaseRequest =
     *   await client.beta.organization.spendLimits.increaseRequests.retrieve(
     *     'spend_limit_increase_request_id',
     *   );
     * ```
     */
    retrieve(spendLimitIncreaseRequestID, options) {
        return this._client.get(path `/v1/organizations/spend_limit_increase_requests/${spendLimitIncreaseRequestID}?beta=true`, options);
    }
    /**
     * List spend limit increase requests, most recent first.
     *
     * Pending requests include a live `spend_summary` for the requester. Requests
     * whose requester is no longer a member are excluded.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaSpendLimitIncreaseRequest of client.beta.organization.spendLimits.increaseRequests.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/spend_limit_increase_requests?beta=true', (PageCursor), { query, ...options });
    }
    /**
     * Approve a pending spend limit increase request.
     *
     * Writes a per-user spend limit at `amount` for the requester and transitions the
     * request to `approved`. `period` defaults to the period the member was blocked
     * on. Anthropic emails the requester unless `suppress_notification` is set.
     *
     * @example
     * ```ts
     * const response =
     *   await client.beta.organization.spendLimits.increaseRequests.approve(
     *     'spend_limit_increase_request_id',
     *     { amount: '50000' },
     *   );
     * ```
     */
    approve(spendLimitIncreaseRequestID, body, options) {
        return this._client.post(path `/v1/organizations/spend_limit_increase_requests/${spendLimitIncreaseRequestID}/approve?beta=true`, { body, ...options });
    }
    /**
     * Deny a pending spend limit increase request.
     *
     * Idempotent on `denied`; denying an already-`approved` request returns 400.
     * Anthropic emails the requester unless `suppress_notification` is set.
     *
     * @example
     * ```ts
     * const betaSpendLimitIncreaseRequest =
     *   await client.beta.organization.spendLimits.increaseRequests.deny(
     *     'spend_limit_increase_request_id',
     *   );
     * ```
     */
    deny(spendLimitIncreaseRequestID, body, options) {
        return this._client.post(path `/v1/organizations/spend_limit_increase_requests/${spendLimitIncreaseRequestID}/deny?beta=true`, { body, ...options });
    }
}

var SpendLimits = /* @__PURE__ */ (() => {
    class SpendLimits extends APIResource {
        constructor() {
            super(...arguments);
            this.effective = new Effective(this._client);
            this.increaseRequests = new IncreaseRequests(this._client);
        }
        /**
         * Retrieve a spend limit by ID.
         *
         * @example
         * ```ts
         * const betaSpendLimit =
         *   await client.beta.organization.spendLimits.retrieve(
         *     'spend_limit_id',
         *   );
         * ```
         */
        retrieve(spendLimitID, options) {
            return this._client.get(path `/v1/organizations/spend_limits/${spendLimitID}?beta=true`, options);
        }
        /**
         * List the organization's spend limits.
         *
         * A Claude Console organization's limits come in an order that is stable across
         * pages. A Claude Enterprise organization's are grouped by scope type, in the
         * order `organization`, `seat_tier`, `rbac_group`, `organization_service`, `user`;
         * within a type they come in a fixed order that is not creation order. Listing
         * Claude Console limits is in an early access preview. To request access, contact
         * your Anthropic account team.
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaSpendLimit of client.beta.organization.spendLimits.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { betas, ...query } = params ?? {};
            return this._client.getAPIList('/v1/organizations/spend_limits?beta=true', (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    { 'anthropic-beta': [...(betas ?? []), 'spend-limit-reads-2026-09-26'].toString() },
                    options?.headers,
                ]),
            });
        }
        /**
         * Delete a spend limit.
         *
         * For a Claude Enterprise organization, this deletes a per-user override, and the
         * member falls back to any inherited spend limit at that period. Its seat-tier,
         * group, and organization-level rows cannot be deleted via this endpoint. A Claude
         * Console organization deletes its organization and workspace limits. Deleting
         * them through the API is in an early access preview.
         *
         * @example
         * ```ts
         * const spendLimit =
         *   await client.beta.organization.spendLimits.delete(
         *     'spend_limit_id',
         *   );
         * ```
         */
        delete(spendLimitID, options) {
            return this._client.delete(path `/v1/organizations/spend_limits/${spendLimitID}?beta=true`, options);
        }
        /**
         * Set a spend limit.
         *
         * Upsert keyed on (scope, period): setting a limit that already exists overwrites
         * it in place. A Claude Enterprise organization sets `user` limits. Its seat-tier,
         * group, and organization-level defaults are configured in claude.ai. A Claude
         * Console organization sets `organization` and `workspace` limits, which are
         * monthly and always carry an amount. Setting those limits is in an early access
         * preview. To request access, contact your Anthropic account team.
         *
         * @example
         * ```ts
         * const betaSpendLimit =
         *   await client.beta.organization.spendLimits.set({
         *     amount: '50000',
         *     scope: {
         *       type: 'user',
         *       user_id: 'user_01WCz1FkmYMm4gnmykNKUu3Q',
         *     },
         *   });
         * ```
         */
        set(params, options) {
            const { betas, ...body } = params;
            return this._client.post('/v1/organizations/spend_limits?beta=true', {
                body,
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
    }
    SpendLimits.Effective = Effective;
    SpendLimits.IncreaseRequests = IncreaseRequests;
    return SpendLimits;
})();

let Members$1 = class Members extends APIResource {
    /**
     * Get Workspace Member
     *
     * @example
     * ```ts
     * const betaWorkspaceMember =
     *   await client.beta.organization.workspaces.members.retrieve(
     *     'user_id',
     *     { workspace_id: 'workspace_id' },
     *   );
     * ```
     */
    retrieve(userID, params, options) {
        const { workspace_id } = params;
        return this._client.get(path `/v1/organizations/workspaces/${workspace_id}/members/${userID}?beta=true`, options);
    }
    /**
     * Update Workspace Member
     *
     * @example
     * ```ts
     * const betaWorkspaceMember =
     *   await client.beta.organization.workspaces.members.update(
     *     'user_id',
     *     {
     *       workspace_id: 'workspace_id',
     *       workspace_role: 'workspace_admin',
     *     },
     *   );
     * ```
     */
    update(userID, params, options) {
        const { workspace_id, ...body } = params;
        return this._client.post(path `/v1/organizations/workspaces/${workspace_id}/members/${userID}?beta=true`, {
            body,
            ...options,
        });
    }
    /**
     * List Workspace Members
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaWorkspaceMember of client.beta.organization.workspaces.members.list(
     *   'workspace_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(workspaceID, query = {}, options) {
        return this._client.getAPIList(path `/v1/organizations/workspaces/${workspaceID}/members?beta=true`, (Page), { query, ...options });
    }
    /**
     * Create Workspace Member
     *
     * @example
     * ```ts
     * const betaWorkspaceMember =
     *   await client.beta.organization.workspaces.members.add(
     *     'workspace_id',
     *     {
     *       user_id: 'user_01WCz1FkmYMm4gnmykNKUu3Q',
     *       workspace_role: 'workspace_admin',
     *     },
     *   );
     * ```
     */
    add(workspaceID, body, options) {
        return this._client.post(path `/v1/organizations/workspaces/${workspaceID}/members?beta=true`, {
            body,
            ...options,
        });
    }
    /**
     * Delete Workspace Member
     *
     * @example
     * ```ts
     * const member =
     *   await client.beta.organization.workspaces.members.remove(
     *     'user_id',
     *     { workspace_id: 'workspace_id' },
     *   );
     * ```
     */
    remove(userID, params, options) {
        const { workspace_id } = params;
        return this._client.delete(path `/v1/organizations/workspaces/${workspace_id}/members/${userID}?beta=true`, options);
    }
};

let RateLimits$2 = class RateLimits extends APIResource {
    /**
     * List a workspace's rate limits.
     *
     * By default, returns only the groups and limiter types that have a
     * workspace-level override. With `include_inherited=true`, returns every group
     * with organization-level limits the workspace can see, listing for each the
     * values it inherits from the organization as well as its own overrides. Each
     * value's `source` says which it is.
     *
     * When `limit` is omitted, every matching entry is returned in a single page; when
     * `limit` truncates the result, follow `next_page` to fetch the remaining entries.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaWorkspaceRateLimit of client.beta.organization.workspaces.rateLimits.list(
     *   'workspace_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(workspaceID, query = {}, options) {
        return this._client.getAPIList(path `/v1/organizations/workspaces/${workspaceID}/rate_limits?beta=true`, (PageCursor), { query, ...options });
    }
};

let ServiceAccounts$2 = class ServiceAccounts extends APIResource {
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Retrieve a service account's membership in a workspace.
     *
     * Returns the membership record, including the service account's `workspace_role`
     * in this workspace. Archived workspaces return 400. For the default workspace,
     * returns the implicit (`implicit: true`) membership when no explicit membership
     * exists; an explicitly added membership is returned with its assigned role. An
     * archived service account returns 404.
     *
     * @example
     * ```ts
     * const betaServiceAccountWorkspaceMember =
     *   await client.beta.organization.workspaces.serviceAccounts.retrieve(
     *     'service_account_id',
     *     { workspace_id: 'workspace_id' },
     *   );
     * ```
     */
    retrieve(serviceAccountID, params, options) {
        const { workspace_id, betas } = params;
        return this._client.get(path `/v1/organizations/workspaces/${workspace_id}/service_accounts/${serviceAccountID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Change a service account's role in a workspace.
     *
     * The new `workspace_role` replaces the current one. Only explicit memberships can
     * be updated; to set a role on the implicit default-workspace membership, add the
     * service account explicitly with
     * `POST /workspaces/{workspace_id}/service_accounts`. Archived workspaces
     * return 400. Archived service accounts cannot be updated and are rejected.
     *
     * @example
     * ```ts
     * const betaServiceAccountWorkspaceMember =
     *   await client.beta.organization.workspaces.serviceAccounts.update(
     *     'service_account_id',
     *     {
     *       workspace_id: 'workspace_id',
     *       workspace_role: 'workspace_admin',
     *     },
     *   );
     * ```
     */
    update(serviceAccountID, params, options) {
        const { workspace_id, betas, ...body } = params;
        return this._client.post(path `/v1/organizations/workspaces/${workspace_id}/service_accounts/${serviceAccountID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * List the service accounts that are members of a workspace.
     *
     * Each entry includes the service account's `workspace_role`. Use `limit` and the
     * `next_page` cursor to paginate. Archived workspaces return 400; use
     * `GET /service_accounts/{id}/workspaces` to audit memberships of an archived
     * workspace. The implicit default-workspace membership is not included in this
     * list. Memberships of archived service accounts are omitted from the results.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaServiceAccountWorkspaceMember of client.beta.organization.workspaces.serviceAccounts.list(
     *   'workspace_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(workspaceID, params = {}, options) {
        const { betas, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/organizations/workspaces/${workspaceID}/service_accounts?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Add a service account to a workspace with the given `workspace_role`.
     *
     * The role determines what the service account can do in the workspace and which
     * workspace-scoped permissions it can be granted when authenticating through
     * federation. Every service account is already an implicit `workspace_user` member
     * of the default workspace; adding it explicitly assigns a chosen role. If the
     * service account is already an explicit member of the workspace, its
     * `workspace_role` is replaced with the value supplied here. Archived workspaces
     * return 400. Archived service accounts cannot be added and are rejected.
     *
     * @example
     * ```ts
     * const betaServiceAccountWorkspaceMember =
     *   await client.beta.organization.workspaces.serviceAccounts.add(
     *     'workspace_id',
     *     {
     *       service_account_id: 'service_account_id',
     *       workspace_role: 'workspace_admin',
     *     },
     *   );
     * ```
     */
    add(workspaceID, params, options) {
        const { betas, ...body } = params;
        return this._client.post(path `/v1/organizations/workspaces/${workspaceID}/service_accounts?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Remove a service account from a workspace.
     *
     * Removal is idempotent (returns 200 even if the membership was already removed).
     * A DELETE against the implicit default-workspace membership returns 200 but is a
     * no-op and the membership persists; deleting an explicit default-workspace row
     * reverts to the implicit `workspace_user` membership. Archived workspaces
     * return 400.
     *
     * @example
     * ```ts
     * const serviceAccount =
     *   await client.beta.organization.workspaces.serviceAccounts.remove(
     *     'service_account_id',
     *     { workspace_id: 'workspace_id' },
     *   );
     * ```
     */
    remove(serviceAccountID, params, options) {
        const { workspace_id, betas } = params;
        return this._client.delete(path `/v1/organizations/workspaces/${workspace_id}/service_accounts/${serviceAccountID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                options?.headers,
            ]),
        });
    }
};

var Workspaces$3 = /* @__PURE__ */ (() => {
    class Workspaces extends APIResource {
        constructor() {
            super(...arguments);
            this.rateLimits = new RateLimits$2(this._client);
            this.members = new Members$1(this._client);
            this.serviceAccounts = new ServiceAccounts$2(this._client);
        }
        /**
         * Create Workspace
         *
         * @example
         * ```ts
         * const betaWorkspace =
         *   await client.beta.organization.workspaces.create({
         *     name: 'x',
         *   });
         * ```
         */
        create(params, options) {
            const { betas, ...body } = params;
            return this._client.post('/v1/organizations/workspaces?beta=true', {
                body,
                ...options,
                headers: buildHeaders([
                    { ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined) },
                    options?.headers,
                ]),
            });
        }
        /**
         * Get Workspace
         *
         * @example
         * ```ts
         * const betaWorkspace =
         *   await client.beta.organization.workspaces.retrieve(
         *     'workspace_id',
         *   );
         * ```
         */
        retrieve(workspaceID, options) {
            return this._client.get(path `/v1/organizations/workspaces/${workspaceID}?beta=true`, options);
        }
        /**
         * Update Workspace
         *
         * @example
         * ```ts
         * const betaWorkspace =
         *   await client.beta.organization.workspaces.update(
         *     'workspace_id',
         *   );
         * ```
         */
        update(workspaceID, body, options) {
            return this._client.post(path `/v1/organizations/workspaces/${workspaceID}?beta=true`, {
                body,
                ...options,
            });
        }
        /**
         * List Workspaces
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaWorkspace of client.beta.organization.workspaces.list()) {
         *   // ...
         * }
         * ```
         */
        list(query = {}, options) {
            return this._client.getAPIList('/v1/organizations/workspaces?beta=true', (Page), {
                query,
                ...options,
            });
        }
        /**
         * Archive Workspace
         *
         * @example
         * ```ts
         * const betaWorkspace =
         *   await client.beta.organization.workspaces.archive(
         *     'workspace_id',
         *   );
         * ```
         */
        archive(workspaceID, options) {
            return this._client.post(path `/v1/organizations/workspaces/${workspaceID}/archive?beta=true`, options);
        }
    }
    Workspaces.RateLimits = RateLimits$2;
    Workspaces.Members = Members$1;
    Workspaces.ServiceAccounts = ServiceAccounts$2;
    return Workspaces;
})();

var Organization$1 = /* @__PURE__ */ (() => {
    class Organization extends APIResource {
        constructor() {
            super(...arguments);
            this.apiKeys = new APIKeys$1(this._client);
            this.externalKeys = new ExternalKeys$1(this._client);
            this.federation = new Federation$1(this._client);
            this.invites = new Invites$1(this._client);
            this.serviceAccounts = new ServiceAccounts$3(this._client);
            this.users = new Users$1(this._client);
            this.workspaces = new Workspaces$3(this._client);
            this.rateLimits = new RateLimits$3(this._client);
            this.complianceSettings = new ComplianceSettings$1(this._client);
            this.analytics = new Analytics(this._client);
            this.spendLimits = new SpendLimits(this._client);
            this.rbacGroups = new RBACGroups(this._client);
            this.rbacRoles = new RBACRoles(this._client);
            this.plugins = new Plugins(this._client);
            this.pluginMarketplaces = new PluginMarketplaces(this._client);
        }
        /**
         * Retrieve information about the organization associated with the authenticated
         * API key.
         *
         * @example
         * ```ts
         * const betaOrganization =
         *   await client.beta.organization.retrieve();
         * ```
         */
        retrieve(options) {
            return this._client.get('/v1/organizations/me?beta=true', options);
        }
    }
    Organization.APIKeys = APIKeys$1;
    Organization.ExternalKeys = ExternalKeys$1;
    Organization.Federation = Federation$1;
    Organization.Invites = Invites$1;
    Organization.ServiceAccounts = ServiceAccounts$3;
    Organization.Users = Users$1;
    Organization.Workspaces = Workspaces$3;
    Organization.RateLimits = RateLimits$3;
    Organization.ComplianceSettings = ComplianceSettings$1;
    Organization.Analytics = Analytics;
    Organization.SpendLimits = SpendLimits;
    Organization.RBACGroups = RBACGroups;
    Organization.RBACRoles = RBACRoles;
    Organization.Plugins = Plugins;
    Organization.PluginMarketplaces = PluginMarketplaces;
    return Organization;
})();

var Events$1 = /* @__PURE__ */ (() => {
    class Events extends APIResource {
        /**
         * List Events
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaManagedAgentsSessionEvent of client.beta.sessions.events.list(
         *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
         * )) {
         *   // ...
         * }
         * ```
         */
        list(sessionID, params = {}, options) {
            const { betas, workspace_id, ...query } = params ?? {};
            return this._client.getAPIList(path `/v1/sessions/${sessionID}/events?beta=true`, (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Send Events
         *
         * @example
         * ```ts
         * const betaManagedAgentsSendSessionEvents =
         *   await client.beta.sessions.events.send(
         *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
         *     {
         *       events: [
         *         {
         *           content: [
         *             {
         *               text: 'Where is my order #1234?',
         *               type: 'text',
         *             },
         *           ],
         *           type: 'user.message',
         *         },
         *       ],
         *     },
         *   );
         * ```
         */
        send(sessionID, params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post(path `/v1/sessions/${sessionID}/events?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Stream Events
         *
         * @example
         * ```ts
         * const betaManagedAgentsStreamSessionEvents =
         *   await client.beta.sessions.events.stream(
         *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
         *   );
         * ```
         */
        stream(sessionID, params = {}, options) {
            const { betas, workspace_id, ...query } = params ?? {};
            return this._client.get(path `/v1/sessions/${sessionID}/events/stream?beta=true`, {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
                stream: true,
            });
        }
        /**
         * Attach to a session and dispatch every incoming `agent.tool_use` and
         * `agent.custom_tool_use` event to a local tool registry, sending the matching
         * result back (`user.tool_result` / `user.custom_tool_result`). The
         * sessions-side counterpart to `client.beta.messages.toolRunner`: yields one
         * entry per completed tool call so callers can observe each dispatch (and
         * `break` to abort cleanly).
         *
         * @example
         * ```ts
         * import { betaAgentToolset20260401 } from '@anthropic-ai/sdk/tools/agent-toolset/node';
         *
         * for await (const call of client.beta.sessions.events.toolRunner(work.data.id, {
         *   tools: [...betaAgentToolset20260401({ workdir }), myTool],
         * })) {
         *   console.log(`${call.name} -> ${call.isError ? 'error' : 'ok'}`);
         * }
         * ```
         */
        toolRunner(sessionID, opts) {
            return new SessionToolRunner(sessionID, { ...opts, client: this._client });
        }
    }
    Events.SessionToolRunner = SessionToolRunner;
    return Events;
})();

class Resources extends APIResource {
    /**
     * Get Session Resource
     *
     * @example
     * ```ts
     * const resource =
     *   await client.beta.sessions.resources.retrieve(
     *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
     *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     *   );
     * ```
     */
    retrieve(resourceID, params, options) {
        const { session_id, betas, workspace_id } = params;
        return this._client.get(path `/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Update Session Resource
     *
     * @example
     * ```ts
     * const resource =
     *   await client.beta.sessions.resources.update(
     *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
     *     {
     *       session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *       authorization_token: 'ghp_exampletoken',
     *     },
     *   );
     * ```
     */
    update(resourceID, params, options) {
        const { session_id, betas, workspace_id, ...body } = params;
        return this._client.post(path `/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List Session Resources
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsSessionResource of client.beta.sessions.resources.list(
     *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(sessionID, params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/sessions/${sessionID}/resources?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete Session Resource
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeleteSessionResource =
     *   await client.beta.sessions.resources.delete(
     *     'sesrsc_011CZkZBJq5dWxk9fVLNcPht',
     *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     *   );
     * ```
     */
    delete(resourceID, params, options) {
        const { session_id, betas, workspace_id } = params;
        return this._client.delete(path `/v1/sessions/${session_id}/resources/${resourceID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Add Session Resource
     *
     * @example
     * ```ts
     * const betaManagedAgentsFileResource =
     *   await client.beta.sessions.resources.add(
     *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
     *     {
     *       file_id: 'file_011CNha8iCJcU1wXNR6q4V8w',
     *       type: 'file',
     *     },
     *   );
     * ```
     */
    add(sessionID, params, options) {
        const { betas, workspace_id, ...body } = params;
        return this._client.post(path `/v1/sessions/${sessionID}/resources?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
}

class Events extends APIResource {
    /**
     * List Session Thread Events
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsSessionEvent of client.beta.sessions.threads.events.list(
     *   'sthr_011CZkZVWa6oJjw1rgXZpnBt',
     *   { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     * )) {
     *   // ...
     * }
     * ```
     */
    list(threadID, params, options) {
        const { session_id, betas, workspace_id, ...query } = params;
        return this._client.getAPIList(path `/v1/sessions/${session_id}/threads/${threadID}/events?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Stream Session Thread Events
     *
     * @example
     * ```ts
     * const betaManagedAgentsStreamSessionThreadEvents =
     *   await client.beta.sessions.threads.events.stream(
     *     'sthr_011CZkZVWa6oJjw1rgXZpnBt',
     *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
     *   );
     * ```
     */
    stream(threadID, params, options) {
        const { session_id, betas, workspace_id, ...query } = params;
        return this._client.get(path `/v1/sessions/${session_id}/threads/${threadID}/stream?beta=true`, {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
            stream: true,
        });
    }
}

var Threads = /* @__PURE__ */ (() => {
    class Threads extends APIResource {
        constructor() {
            super(...arguments);
            this.events = new Events(this._client);
        }
        /**
         * Get Session Thread
         *
         * @example
         * ```ts
         * const betaManagedAgentsSessionThread =
         *   await client.beta.sessions.threads.retrieve(
         *     'sthr_011CZkZVWa6oJjw1rgXZpnBt',
         *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
         *   );
         * ```
         */
        retrieve(threadID, params, options) {
            const { session_id, betas, workspace_id } = params;
            return this._client.get(path `/v1/sessions/${session_id}/threads/${threadID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * List Session Threads
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaManagedAgentsSessionThread of client.beta.sessions.threads.list(
         *   'sesn_011CZkZAtmR3yMPDzynEDxu7',
         * )) {
         *   // ...
         * }
         * ```
         */
        list(sessionID, params = {}, options) {
            const { betas, workspace_id, ...query } = params ?? {};
            return this._client.getAPIList(path `/v1/sessions/${sessionID}/threads?beta=true`, (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Archive Session Thread
         *
         * @example
         * ```ts
         * const betaManagedAgentsSessionThread =
         *   await client.beta.sessions.threads.archive(
         *     'sthr_011CZkZVWa6oJjw1rgXZpnBt',
         *     { session_id: 'sesn_011CZkZAtmR3yMPDzynEDxu7' },
         *   );
         * ```
         */
        archive(threadID, params, options) {
            const { session_id, betas, workspace_id } = params;
            return this._client.post(path `/v1/sessions/${session_id}/threads/${threadID}/archive?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
    }
    Threads.Events = Events;
    return Threads;
})();

var Sessions = /* @__PURE__ */ (() => {
    class Sessions extends APIResource {
        constructor() {
            super(...arguments);
            this.events = new Events$1(this._client);
            this.resources = new Resources(this._client);
            this.threads = new Threads(this._client);
        }
        /**
         * Create Session
         *
         * @example
         * ```ts
         * const betaManagedAgentsSession =
         *   await client.beta.sessions.create({
         *     agent: 'agent_011CZkYpogX7uDKUyvBTophP',
         *     environment_id: 'env_011CZkZ9X2dpNyB7HsEFoRfW',
         *     initial_events: [
         *       {
         *         type: 'user.message',
         *         content: [
         *           {
         *             type: 'text',
         *             text: 'Where is my order #1234?',
         *           },
         *         ],
         *       },
         *     ],
         *   });
         * ```
         */
        create(params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post('/v1/sessions?beta=true', {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Get Session
         *
         * @example
         * ```ts
         * const betaManagedAgentsSession =
         *   await client.beta.sessions.retrieve(
         *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
         *   );
         * ```
         */
        retrieve(sessionID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.get(path `/v1/sessions/${sessionID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Update Session
         *
         * @example
         * ```ts
         * const betaManagedAgentsSession =
         *   await client.beta.sessions.update(
         *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
         *   );
         * ```
         */
        update(sessionID, params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post(path `/v1/sessions/${sessionID}?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * List Sessions
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaManagedAgentsSession of client.beta.sessions.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { betas, workspace_id, ...query } = params ?? {};
            return this._client.getAPIList('/v1/sessions?beta=true', (BidirectionalPageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Delete Session
         *
         * @example
         * ```ts
         * const betaManagedAgentsDeletedSession =
         *   await client.beta.sessions.delete(
         *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
         *   );
         * ```
         */
        delete(sessionID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.delete(path `/v1/sessions/${sessionID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Archive Session
         *
         * @example
         * ```ts
         * const betaManagedAgentsSession =
         *   await client.beta.sessions.archive(
         *     'sesn_011CZkZAtmR3yMPDzynEDxu7',
         *   );
         * ```
         */
        archive(sessionID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.post(path `/v1/sessions/${sessionID}/archive?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
    }
    Sessions.Events = Events$1;
    Sessions.Resources = Resources;
    Sessions.Threads = Threads;
    return Sessions;
})();

let Versions$1 = class Versions extends APIResource {
    /**
     * Create Skill Version
     *
     * @example
     * ```ts
     * const betaSkillVersion =
     *   await client.beta.skills.versions.create('skill_id', {
     *     files: [fs.createReadStream('path/to/file')],
     *   });
     * ```
     */
    create(skillID, params, options) {
        const { betas, workspace_id, ...body } = params;
        return this._client.post(path `/v1/skills/${skillID}/versions?beta=true`, multipartFormRequestOptions({
            body,
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        }, this._client, false));
    }
    /**
     * Get Skill Version
     *
     * @example
     * ```ts
     * const betaSkillVersion =
     *   await client.beta.skills.versions.retrieve('version', {
     *     skill_id: 'skill_id',
     *   });
     * ```
     */
    retrieve(version, params, options) {
        const { skill_id, betas, workspace_id } = params;
        return this._client.get(path `/v1/skills/${skill_id}/versions/${version}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List Skill Versions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaSkillVersion of client.beta.skills.versions.list(
     *   'skill_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(skillID, params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/skills/${skillID}/versions?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete Skill Version
     *
     * @example
     * ```ts
     * const betaDeletedSkillVersion =
     *   await client.beta.skills.versions.delete('version', {
     *     skill_id: 'skill_id',
     *   });
     * ```
     */
    delete(version, params, options) {
        const { skill_id, betas, workspace_id } = params;
        return this._client.delete(path `/v1/skills/${skill_id}/versions/${version}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Download a skill version's content as a zip archive.
     *
     * @example
     * ```ts
     * const response = await client.beta.skills.versions.download(
     *   'version',
     *   { skill_id: 'skill_id' },
     * );
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    download(version, params, options) {
        const { skill_id, betas, workspace_id } = params;
        return this._client.get(path `/v1/skills/${skill_id}/versions/${version}/content?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    Accept: 'application/binary',
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
            __binaryResponse: true,
        });
    }
};

var Skills$1 = /* @__PURE__ */ (() => {
    class Skills extends APIResource {
        constructor() {
            super(...arguments);
            this.versions = new Versions$1(this._client);
        }
        /**
         * Create Skill
         *
         * @example
         * ```ts
         * const betaSkill = await client.beta.skills.create({
         *   files: [fs.createReadStream('path/to/file')],
         * });
         * ```
         */
        create(params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post('/v1/skills?beta=true', multipartFormRequestOptions({
                body,
                ...options,
                headers: buildHeaders([
                    {
                        ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            }, this._client, false));
        }
        /**
         * Get Skill
         *
         * @example
         * ```ts
         * const betaSkill = await client.beta.skills.retrieve(
         *   'skill_id',
         * );
         * ```
         */
        retrieve(skillID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.get(path `/v1/skills/${skillID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * List Skills
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaSkill of client.beta.skills.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { betas, workspace_id, ...query } = params ?? {};
            return this._client.getAPIList('/v1/skills?beta=true', (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Delete Skill
         *
         * @example
         * ```ts
         * const betaDeletedSkill = await client.beta.skills.delete(
         *   'skill_id',
         * );
         * ```
         */
        delete(skillID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.delete(path `/v1/skills/${skillID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
    }
    Skills.Versions = Versions$1;
    return Skills;
})();

class Certificates extends APIResource {
    /**
     * The Tunnels API is in research preview. It requires the
     * `anthropic-beta: mcp-tunnels-2026-06-22` header and may change without a
     * deprecation period. It supersedes the Admin API endpoints at
     * `/v1/organizations/tunnels`, which remain available during a migration window.
     *
     * Registers a public CA certificate on a tunnel. Anthropic verifies the gateway's
     * server certificate against this CA when it terminates the inner TLS session. A
     * tunnel holds at most two non-archived certificates.
     *
     * @example
     * ```ts
     * const betaTunnelCertificate =
     *   await client.beta.tunnels.certificates.create(
     *     'tunnel_id',
     *     { ca_certificate_pem: 'ca_certificate_pem' },
     *   );
     * ```
     */
    create(tunnelID, params, options) {
        const { betas, workspace_id, ...body } = params;
        return this._client.post(path `/v1/tunnels/${tunnelID}/certificates?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'mcp-tunnels-2026-06-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * The Tunnels API is in research preview. It requires the
     * `anthropic-beta: mcp-tunnels-2026-06-22` header and may change without a
     * deprecation period. It supersedes the Admin API endpoints at
     * `/v1/organizations/tunnels`, which remain available during a migration window.
     *
     * Fetches a tunnel certificate by ID.
     *
     * @example
     * ```ts
     * const betaTunnelCertificate =
     *   await client.beta.tunnels.certificates.retrieve(
     *     'certificate_id',
     *     { tunnel_id: 'tunnel_id' },
     *   );
     * ```
     */
    retrieve(certificateID, params, options) {
        const { tunnel_id, betas, workspace_id } = params;
        return this._client.get(path `/v1/tunnels/${tunnel_id}/certificates/${certificateID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'mcp-tunnels-2026-06-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * The Tunnels API is in research preview. It requires the
     * `anthropic-beta: mcp-tunnels-2026-06-22` header and may change without a
     * deprecation period. It supersedes the Admin API endpoints at
     * `/v1/organizations/tunnels`, which remain available during a migration window.
     *
     * Lists the certificates registered on a tunnel. Archived certificates are
     * excluded unless include_archived is set.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaTunnelCertificate of client.beta.tunnels.certificates.list(
     *   'tunnel_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(tunnelID, params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/tunnels/${tunnelID}/certificates?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'mcp-tunnels-2026-06-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * The Tunnels API is in research preview. It requires the
     * `anthropic-beta: mcp-tunnels-2026-06-22` header and may change without a
     * deprecation period. It supersedes the Admin API endpoints at
     * `/v1/organizations/tunnels`, which remain available during a migration window.
     *
     * Archives a tunnel certificate, removing it from the set Anthropic trusts for the
     * tunnel. The certificate record is retained. Archiving the last non-archived
     * certificate is permitted; the tunnel rejects MCP traffic until a new certificate
     * is added.
     *
     * @example
     * ```ts
     * const betaTunnelCertificate =
     *   await client.beta.tunnels.certificates.archive(
     *     'certificate_id',
     *     { tunnel_id: 'tunnel_id' },
     *   );
     * ```
     */
    archive(certificateID, params, options) {
        const { tunnel_id, betas, workspace_id } = params;
        return this._client.post(path `/v1/tunnels/${tunnel_id}/certificates/${certificateID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'mcp-tunnels-2026-06-22'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
}

var Tunnels = /* @__PURE__ */ (() => {
    class Tunnels extends APIResource {
        constructor() {
            super(...arguments);
            this.certificates = new Certificates(this._client);
        }
        /**
         * The Tunnels API is in research preview. It requires the
         * `anthropic-beta: mcp-tunnels-2026-06-22` header and may change without a
         * deprecation period. It supersedes the Admin API endpoints at
         * `/v1/organizations/tunnels`, which remain available during a migration window.
         *
         * Creates a tunnel. Creation allocates a fresh hostname and provisions the tunnel;
         * it is not idempotent. The new tunnel rejects MCP traffic until at least one CA
         * certificate is added.
         *
         * @example
         * ```ts
         * const betaTunnel = await client.beta.tunnels.create();
         * ```
         */
        create(params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post('/v1/tunnels?beta=true', {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'mcp-tunnels-2026-06-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * The Tunnels API is in research preview. It requires the
         * `anthropic-beta: mcp-tunnels-2026-06-22` header and may change without a
         * deprecation period. It supersedes the Admin API endpoints at
         * `/v1/organizations/tunnels`, which remain available during a migration window.
         *
         * Fetches a tunnel by ID.
         *
         * @example
         * ```ts
         * const betaTunnel = await client.beta.tunnels.retrieve(
         *   'tunnel_id',
         * );
         * ```
         */
        retrieve(tunnelID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.get(path `/v1/tunnels/${tunnelID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'mcp-tunnels-2026-06-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * The Tunnels API is in research preview. It requires the
         * `anthropic-beta: mcp-tunnels-2026-06-22` header and may change without a
         * deprecation period. It supersedes the Admin API endpoints at
         * `/v1/organizations/tunnels`, which remain available during a migration window.
         *
         * Lists tunnels. Results are ordered by creation time, newest first; archived
         * tunnels are excluded unless include_archived is set.
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaTunnel of client.beta.tunnels.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { betas, workspace_id, ...query } = params ?? {};
            return this._client.getAPIList('/v1/tunnels?beta=true', (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'mcp-tunnels-2026-06-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * The Tunnels API is in research preview. It requires the
         * `anthropic-beta: mcp-tunnels-2026-06-22` header and may change without a
         * deprecation period. It supersedes the Admin API endpoints at
         * `/v1/organizations/tunnels`, which remain available during a migration window.
         *
         * Archives a tunnel. Archival is irreversible: every non-archived certificate on
         * the tunnel is archived in the same operation, the hostname is retired and never
         * re-allocated, and the tunnel token is invalidated. Retrying against an
         * already-archived tunnel returns the existing record unchanged.
         *
         * @example
         * ```ts
         * const betaTunnel = await client.beta.tunnels.archive(
         *   'tunnel_id',
         * );
         * ```
         */
        archive(tunnelID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.post(path `/v1/tunnels/${tunnelID}/archive?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'mcp-tunnels-2026-06-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * The Tunnels API is in research preview. It requires the
         * `anthropic-beta: mcp-tunnels-2026-06-22` header and may change without a
         * deprecation period. It supersedes the Admin API endpoints at
         * `/v1/organizations/tunnels`, which remain available during a migration window.
         *
         * Reveals a tunnel's connector token. The value is fetched live on each call;
         * Anthropic does not store it. Repeated calls return the same value until the
         * token is rotated. Exposed as POST so the token does not appear in intermediary
         * access logs.
         *
         * @example
         * ```ts
         * const betaTunnelToken =
         *   await client.beta.tunnels.revealToken('tunnel_id');
         * ```
         */
        revealToken(tunnelID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.post(path `/v1/tunnels/${tunnelID}/reveal_token?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'mcp-tunnels-2026-06-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * The Tunnels API is in research preview. It requires the
         * `anthropic-beta: mcp-tunnels-2026-06-22` header and may change without a
         * deprecation period. It supersedes the Admin API endpoints at
         * `/v1/organizations/tunnels`, which remain available during a migration window.
         *
         * Rotates a tunnel's connector token. Rotation invalidates the current token for
         * new connections and returns a fresh value; established connections are not
         * severed. A connector restarted after rotation must use the new value.
         *
         * @example
         * ```ts
         * const betaTunnelToken =
         *   await client.beta.tunnels.rotateToken('tunnel_id');
         * ```
         */
        rotateToken(tunnelID, params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post(path `/v1/tunnels/${tunnelID}/rotate_token?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'mcp-tunnels-2026-06-22'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
    }
    Tunnels.Certificates = Certificates;
    return Tunnels;
})();

class Credentials extends APIResource {
    /**
     * Create Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.create(
     *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     *     {
     *       auth: {
     *         token: 'bearer_exampletoken',
     *         mcp_server_url:
     *           'https://example-server.modelcontextprotocol.io/sse',
     *         type: 'static_bearer',
     *       },
     *     },
     *   );
     * ```
     */
    create(vaultID, params, options) {
        const { betas, workspace_id, ...body } = params;
        return this._client.post(path `/v1/vaults/${vaultID}/credentials?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Get Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.retrieve(
     *     'vcrd_011CZkZEMt8gZan2iYPQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */
    retrieve(credentialID, params, options) {
        const { vault_id, betas, workspace_id } = params;
        return this._client.get(path `/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Update Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.update(
     *     'vcrd_011CZkZEMt8gZan2iYPQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */
    update(credentialID, params, options) {
        const { vault_id, betas, workspace_id, ...body } = params;
        return this._client.post(path `/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
            body,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List Credentials
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const betaManagedAgentsCredential of client.beta.vaults.credentials.list(
     *   'vlt_011CZkZDLs7fYzm1hXNPeRjv',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(vaultID, params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/vaults/${vaultID}/credentials?beta=true`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsDeletedCredential =
     *   await client.beta.vaults.credentials.delete(
     *     'vcrd_011CZkZEMt8gZan2iYPQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */
    delete(credentialID, params, options) {
        const { vault_id, betas, workspace_id } = params;
        return this._client.delete(path `/v1/vaults/${vault_id}/credentials/${credentialID}?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Archive Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredential =
     *   await client.beta.vaults.credentials.archive(
     *     'vcrd_011CZkZEMt8gZan2iYPQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */
    archive(credentialID, params, options) {
        const { vault_id, betas, workspace_id } = params;
        return this._client.post(path `/v1/vaults/${vault_id}/credentials/${credentialID}/archive?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * Validate Credential
     *
     * @example
     * ```ts
     * const betaManagedAgentsCredentialValidation =
     *   await client.beta.vaults.credentials.mcpOAuthValidate(
     *     'vcrd_011CZkZEMt8gZan2iYPQfSkw',
     *     { vault_id: 'vlt_011CZkZDLs7fYzm1hXNPeRjv' },
     *   );
     * ```
     */
    mcpOAuthValidate(credentialID, params, options) {
        const { vault_id, betas, workspace_id } = params;
        return this._client.post(path `/v1/vaults/${vault_id}/credentials/${credentialID}/mcp_oauth_validate?beta=true`, {
            ...options,
            headers: buildHeaders([
                {
                    'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
}

var Vaults = /* @__PURE__ */ (() => {
    class Vaults extends APIResource {
        constructor() {
            super(...arguments);
            this.credentials = new Credentials(this._client);
        }
        /**
         * Create Vault
         *
         * @example
         * ```ts
         * const betaManagedAgentsVault =
         *   await client.beta.vaults.create({
         *     display_name: 'Example vault',
         *   });
         * ```
         */
        create(params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post('/v1/vaults?beta=true', {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Get Vault
         *
         * @example
         * ```ts
         * const betaManagedAgentsVault =
         *   await client.beta.vaults.retrieve(
         *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
         *   );
         * ```
         */
        retrieve(vaultID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.get(path `/v1/vaults/${vaultID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Update Vault
         *
         * @example
         * ```ts
         * const betaManagedAgentsVault =
         *   await client.beta.vaults.update(
         *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
         *   );
         * ```
         */
        update(vaultID, params, options) {
            const { betas, workspace_id, ...body } = params;
            return this._client.post(path `/v1/vaults/${vaultID}?beta=true`, {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * List Vaults
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const betaManagedAgentsVault of client.beta.vaults.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { betas, workspace_id, ...query } = params ?? {};
            return this._client.getAPIList('/v1/vaults?beta=true', (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Delete Vault
         *
         * @example
         * ```ts
         * const betaManagedAgentsDeletedVault =
         *   await client.beta.vaults.delete(
         *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
         *   );
         * ```
         */
        delete(vaultID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.delete(path `/v1/vaults/${vaultID}?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        /**
         * Archive Vault
         *
         * @example
         * ```ts
         * const betaManagedAgentsVault =
         *   await client.beta.vaults.archive(
         *     'vlt_011CZkZDLs7fYzm1hXNPeRjv',
         *   );
         * ```
         */
        archive(vaultID, params = {}, options) {
            const { betas, workspace_id } = params ?? {};
            return this._client.post(path `/v1/vaults/${vaultID}/archive?beta=true`, {
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'managed-agents-2026-04-01'].toString(),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
    }
    Vaults.Credentials = Credentials;
    return Vaults;
})();

var _BetaToolRunnerStream_instances, _BetaToolRunnerStream_onToolCall, _BetaToolRunnerStream_emitted, _BetaToolRunnerStream_readers, _BetaToolRunnerStream_toolCalls, _BetaToolRunnerStream_closed, _BetaToolRunnerStream_ready, _BetaToolRunnerStream_fallback, _BetaToolRunnerStream_track, _BetaToolRunnerStream_release, _BetaToolRunnerStream_removeReader;
/**
 * The stream a tool runner yields. It hands each `tool_use` call to `onToolCall` once the model has moved on
 * from it, and the caller's listeners and `for await` loops over the stream have handled the event that shows it.
 */
var BetaToolRunnerStream = /* @__PURE__ */ (() => {
    /**
     * The stream a tool runner yields. It hands each `tool_use` call to `onToolCall` once the model has moved on
     * from it, and the caller's listeners and `for await` loops over the stream have handled the event that shows it.
     */
    class BetaToolRunnerStream extends BetaMessageStream {
        constructor(params, onToolCall) {
            super(params);
            _BetaToolRunnerStream_instances.add(this);
            _BetaToolRunnerStream_onToolCall.set(this, void 0);
            /** The number of stream events emitted so far */
            _BetaToolRunnerStream_emitted.set(this, 0);
            /** The `for await` loops over the stream that are still reading it */
            _BetaToolRunnerStream_readers.set(this, []);
            /** The `tool_use` blocks that have finished streaming, in the model's order */
            _BetaToolRunnerStream_toolCalls.set(this, []);
            /** The last `tool_use` block to close, until the model moves on from it */
            _BetaToolRunnerStream_closed.set(this, void 0);
            /** The calls the model has moved on from, in its order, until every reader has caught up with them */
            _BetaToolRunnerStream_ready.set(this, []);
            /** Whether a refusal has handed the reply to a fallback model */
            _BetaToolRunnerStream_fallback.set(this, false);
            __classPrivateFieldSet(this, _BetaToolRunnerStream_onToolCall, onToolCall);
        }
        /** The `tool_use` blocks that have finished streaming, in the model's order */
        get toolCalls() {
            return __classPrivateFieldGet(this, _BetaToolRunnerStream_toolCalls, "f");
        }
        /** Sends the request as `client.beta.messages.stream()` does. */
        static start(messages, params, options, onToolCall) {
            const stream = new BetaToolRunnerStream({ ...params, stream: true }, onToolCall);
            for (const message of params.messages) {
                stream._addMessageParam(message);
            }
            stream._run(() => stream._createMessage(messages, { ...params, stream: true }, { ...options, headers: { ...options?.headers, [STAINLESS_HELPER_METHOD_HEADER]: 'stream' } }));
            return stream;
        }
        _emit(event, ...args) {
            var _a;
            if (event !== 'streamEvent' || this.ended) {
                super._emit(event, ...args);
                return;
            }
            // Counted first, so that a reader created by a listener of this event starts after it.
            __classPrivateFieldSet(this, _BetaToolRunnerStream_emitted, (_a = __classPrivateFieldGet(this, _BetaToolRunnerStream_emitted, "f"), _a++, _a));
            const [streamEvent, snapshot] = args;
            const block = streamEvent.type === 'content_block_stop' ? snapshot.content[streamEvent.index] : undefined;
            const closed = block?.type === 'tool_use' ? block : undefined;
            if (closed) {
                __classPrivateFieldGet(this, _BetaToolRunnerStream_toolCalls, "f").push(closed);
            }
            super._emit(event, ...args);
            __classPrivateFieldGet(this, _BetaToolRunnerStream_instances, "m", _BetaToolRunnerStream_track).call(this, streamEvent, closed);
            __classPrivateFieldGet(this, _BetaToolRunnerStream_instances, "m", _BetaToolRunnerStream_release).call(this);
        }
        [(_BetaToolRunnerStream_onToolCall = new WeakMap(), _BetaToolRunnerStream_emitted = new WeakMap(), _BetaToolRunnerStream_readers = new WeakMap(), _BetaToolRunnerStream_toolCalls = new WeakMap(), _BetaToolRunnerStream_closed = new WeakMap(), _BetaToolRunnerStream_ready = new WeakMap(), _BetaToolRunnerStream_fallback = new WeakMap(), _BetaToolRunnerStream_instances = new WeakSet(), Symbol.asyncIterator)]() {
            const iterator = super[Symbol.asyncIterator]();
            const reader = { handled: __classPrivateFieldGet(this, _BetaToolRunnerStream_emitted, "f") };
            __classPrivateFieldGet(this, _BetaToolRunnerStream_readers, "f").push(reader);
            let holdsEvent = false;
            return {
                next: async () => {
                    // Asking for the next event is how a `for await` loop says it is done with the one it holds.
                    if (holdsEvent) {
                        holdsEvent = false;
                        reader.handled++;
                        __classPrivateFieldGet(this, _BetaToolRunnerStream_instances, "m", _BetaToolRunnerStream_release).call(this);
                    }
                    try {
                        const result = await iterator.next();
                        holdsEvent = !result.done;
                        if (result.done) {
                            __classPrivateFieldGet(this, _BetaToolRunnerStream_instances, "m", _BetaToolRunnerStream_removeReader).call(this, reader);
                        }
                        return result;
                    }
                    catch (error) {
                        __classPrivateFieldGet(this, _BetaToolRunnerStream_instances, "m", _BetaToolRunnerStream_removeReader).call(this, reader);
                        throw error;
                    }
                },
                return: async () => {
                    // Leaving the loop aborts the stream, which has to come first so that no call starts after it.
                    const result = iterator.return?.();
                    __classPrivateFieldGet(this, _BetaToolRunnerStream_instances, "m", _BetaToolRunnerStream_removeReader).call(this, reader);
                    return (await result) ?? { value: undefined, done: true };
                },
            };
        }
    }
    _BetaToolRunnerStream_track = function _BetaToolRunnerStream_track(event, closed) {
        if (__classPrivateFieldGet(this, _BetaToolRunnerStream_fallback, "f")) {
            return;
        }
        if (event.type === 'content_block_start' && event.content_block.type === 'fallback') {
            // The refusal that led to the fallback may have cut the call before it off.
            __classPrivateFieldSet(this, _BetaToolRunnerStream_fallback, true);
            __classPrivateFieldSet(this, _BetaToolRunnerStream_closed, undefined);
            return;
        }
        // A call's own `content_block_stop` isn't enough, because a reply that is cut off closes its last call too.
        const movedOn = event.type === 'content_block_start' ||
            (event.type === 'message_delta' && event.delta.stop_reason === 'tool_use');
        if (__classPrivateFieldGet(this, _BetaToolRunnerStream_closed, "f") && movedOn) {
            __classPrivateFieldGet(this, _BetaToolRunnerStream_ready, "f").push({ toolUse: __classPrivateFieldGet(this, _BetaToolRunnerStream_closed, "f"), event: __classPrivateFieldGet(this, _BetaToolRunnerStream_emitted, "f") });
            __classPrivateFieldSet(this, _BetaToolRunnerStream_closed, undefined);
        }
        if (closed) {
            __classPrivateFieldSet(this, _BetaToolRunnerStream_closed, closed);
        }
    }, _BetaToolRunnerStream_release = function _BetaToolRunnerStream_release() {
        // Events that were already read still arrive after the stream has failed or been aborted.
        if (this.errored || this.controller.signal.aborted) {
            return;
        }
        const handled = Math.min(__classPrivateFieldGet(this, _BetaToolRunnerStream_emitted, "f"), ...__classPrivateFieldGet(this, _BetaToolRunnerStream_readers, "f").map((reader) => reader.handled));
        while (__classPrivateFieldGet(this, _BetaToolRunnerStream_ready, "f")[0] && __classPrivateFieldGet(this, _BetaToolRunnerStream_ready, "f")[0].event <= handled) {
            __classPrivateFieldGet(this, _BetaToolRunnerStream_onToolCall, "f").call(this, __classPrivateFieldGet(this, _BetaToolRunnerStream_ready, "f").shift().toolUse);
        }
    }, _BetaToolRunnerStream_removeReader = function _BetaToolRunnerStream_removeReader(reader) {
        const index = __classPrivateFieldGet(this, _BetaToolRunnerStream_readers, "f").indexOf(reader);
        if (index >= 0) {
            __classPrivateFieldGet(this, _BetaToolRunnerStream_readers, "f").splice(index, 1);
            __classPrivateFieldGet(this, _BetaToolRunnerStream_instances, "m", _BetaToolRunnerStream_release).call(this);
        }
    };
    return BetaToolRunnerStream;
})();

/**
 * A deferred: a `Promise` together with its `resolve` / `reject` functions.
 * This is `Promise.withResolvers()`, which is not available in all supported
 * runtimes.
 */
function promiseWithResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

var _BetaToolRunner_instances, _BetaToolRunner_consumed, _BetaToolRunner_mutated, _BetaToolRunner_state, _BetaToolRunner_options, _BetaToolRunner_message, _BetaToolRunner_stream, _BetaToolRunner_toolResponse, _BetaToolRunner_completion, _BetaToolRunner_iterationCount, _BetaToolRunner_compaction, _BetaToolRunner_calls, _BetaToolRunner_lastStopReason, _BetaToolRunner_toolOverrides, _BetaToolRunner_pendingToolChanges, _BetaToolRunner_send, _BetaToolRunner_streamThatStartsTools, _BetaToolRunner_startedCallsSettled, _BetaToolRunner_compact, _BetaToolRunner_runnableTools, _BetaToolRunner_availableToolNames, _BetaToolRunner_recordRemovalsFromHistory, _BetaToolRunner_compactAfterFinalTurn, _BetaToolRunner_generateToolResponse, _BetaToolRunner_toolsetFamilies, _BetaToolRunner_flushPendingToolChanges, _BetaToolRunner_pendingToolChangesMessage;
const USE_A_NEW_RUNNER = "a tool runner's toolsets come only from its tools param; change them with setMessagesParams(), or build a new runner";
const REMOVE_WITH_A_NEW_RUNNER = "a tool runner's toolsets come only from its tools param; remove it there with setMessagesParams(), or build a new runner without it";
/**
 * A ToolRunner handles the automatic conversation loop between the assistant and tools.
 *
 * A ToolRunner is an async iterable that yields either BetaMessage or BetaMessageStream objects
 * depending on the streaming configuration. With `runToolsEagerly` it starts each tool call while the
 * reply is still streaming, unless `deferToolCall()` holds the call.
 */
var BetaToolRunner = /* @__PURE__ */ (() => {
    /**
     * A ToolRunner handles the automatic conversation loop between the assistant and tools.
     *
     * A ToolRunner is an async iterable that yields either BetaMessage or BetaMessageStream objects
     * depending on the streaming configuration. With `runToolsEagerly` it starts each tool call while the
     * reply is still streaming, unless `deferToolCall()` holds the call.
     */
    class BetaToolRunner {
        constructor(client, params, options) {
            _BetaToolRunner_instances.add(this);
            this.client = client;
            /** Whether the async iterator has been consumed */
            _BetaToolRunner_consumed.set(this, false);
            /** Whether parameters have been mutated since the last API call */
            _BetaToolRunner_mutated.set(this, false);
            /** Current state containing the request parameters */
            _BetaToolRunner_state.set(this, void 0);
            _BetaToolRunner_options.set(this, void 0);
            /** Promise for the last message received from the assistant */
            _BetaToolRunner_message.set(this, void 0);
            /** The stream of the request in progress, when streaming */
            _BetaToolRunner_stream.set(this, void 0);
            /** Cached tool response to avoid redundant executions */
            _BetaToolRunner_toolResponse.set(this, void 0);
            /** Promise resolvers for waiting on completion */
            _BetaToolRunner_completion.set(this, void 0);
            /** Number of iterations (API requests) made so far */
            _BetaToolRunner_iterationCount.set(this, 0);
            /** A compaction scheduled with `compactBeforeNextTurn()`, in flight until its response has been handled */
            _BetaToolRunner_compaction.set(this, { status: 'idle' });
            /** The tool calls of the current reply that are held or have started, by `tool_use` id. See `runToolsEagerly`. */
            _BetaToolRunner_calls.set(this, void 0);
            /** The last turn's stop reason, or `null` once the history has been replaced since */
            _BetaToolRunner_lastStopReason.set(this, null);
            /**
             * `addTools()` / `removeTools()` never edit `params.tools`, because a changed `tools` misses the prompt
             * cache, so what they change about which tool runs under a name is kept here instead: the runnable tool
             * added under that name, or `null` once the name was removed or taken by a raw definition. A tool call is
             * looked up here first, and in `params.tools` only when its name has no entry.
             */
            _BetaToolRunner_toolOverrides.set(this, new Map());
            /** Changes queued by `addTools()` / `removeTools()`, in call order, for the next request */
            _BetaToolRunner_pendingToolChanges.set(this, []);
            rejectCompactionParam(params);
            rejectCompactionControl(params);
            rejectRunToolsEagerlyWithoutStream(params);
            __classPrivateFieldSet(this, _BetaToolRunner_state, {
                params: {
                    // You can't clone the entire params since there are functions as handlers.
                    // You also don't really need to clone params.messages, but it probably will prevent a foot gun
                    // somewhere.
                    ...params,
                    // Not structuredClone(): it throws on a function, and a runnable tool written by value into a
                    // `tool_addition` block has `run`. A JSON copy is the messages as they are sent, which drops it.
                    messages: JSON.parse(JSON.stringify(withToolDefinitions(params.messages))),
                },
            });
            // Cloning drops symbol-keyed properties, so collect helper marks from the original params here: the
            // create()-side collector won't find them on the cloned messages, nor on a toolset's serialized entry.
            const collected = collectStainlessHelpers(params.tools, params.messages);
            __classPrivateFieldSet(this, _BetaToolRunner_options, {
                ...options,
                headers: buildHeaders([
                    helperHeader('BetaToolRunner'),
                    collected.length ? { [STAINLESS_HELPER_HEADER]: collected.join(', ') } : undefined,
                    options?.headers,
                ]),
            });
            __classPrivateFieldSet(this, _BetaToolRunner_completion, promiseWithResolvers());
        }
        async *[(_BetaToolRunner_consumed = new WeakMap(), _BetaToolRunner_mutated = new WeakMap(), _BetaToolRunner_state = new WeakMap(), _BetaToolRunner_options = new WeakMap(), _BetaToolRunner_message = new WeakMap(), _BetaToolRunner_stream = new WeakMap(), _BetaToolRunner_toolResponse = new WeakMap(), _BetaToolRunner_completion = new WeakMap(), _BetaToolRunner_iterationCount = new WeakMap(), _BetaToolRunner_compaction = new WeakMap(), _BetaToolRunner_calls = new WeakMap(), _BetaToolRunner_lastStopReason = new WeakMap(), _BetaToolRunner_toolOverrides = new WeakMap(), _BetaToolRunner_pendingToolChanges = new WeakMap(), _BetaToolRunner_instances = new WeakSet(), Symbol.asyncIterator)]() {
            var _a;
            if (__classPrivateFieldGet(this, _BetaToolRunner_consumed, "f")) {
                throw new AnthropicError('Cannot iterate over a consumed stream');
            }
            __classPrivateFieldSet(this, _BetaToolRunner_consumed, true);
            __classPrivateFieldSet(this, _BetaToolRunner_mutated, true);
            __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, undefined);
            try {
                while (true) {
                    try {
                        if (__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_iterations &&
                            __classPrivateFieldGet(this, _BetaToolRunner_iterationCount, "f") >= __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.max_iterations) {
                            break;
                        }
                        __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_flushPendingToolChanges).call(this);
                        // The API can't compact a conversation that ends mid-turn, so a paused turn is resumed first.
                        if (__classPrivateFieldGet(this, _BetaToolRunner_compaction, "f").status === 'scheduled' &&
                            determineNextStepFromStopReason(__classPrivateFieldGet(this, _BetaToolRunner_lastStopReason, "f")) !== 'resume') {
                            yield* __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_compact).call(this, __classPrivateFieldGet(this, _BetaToolRunner_compaction, "f").config);
                            continue;
                        }
                        __classPrivateFieldSet(this, _BetaToolRunner_mutated, false, "f");
                        __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, undefined, "f");
                        __classPrivateFieldSet(this, _BetaToolRunner_iterationCount, (_a = __classPrivateFieldGet(this, _BetaToolRunner_iterationCount, "f"), _a++, _a), "f");
                        __classPrivateFieldSet(this, _BetaToolRunner_message, undefined, "f");
                        const { max_iterations, runToolsEagerly, ...params } = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
                        yield* __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_send).call(this, params);
                        if (!__classPrivateFieldGet(this, _BetaToolRunner_mutated, "f")) {
                            const message = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
                            const nextStep = determineNextStepFromStopReason(message.stop_reason);
                            __classPrivateFieldSet(this, _BetaToolRunner_lastStopReason, message.stop_reason, "f");
                            __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.push({
                                role: message.role,
                                content: asContentParam(message.content),
                            });
                            // Container-bound server tools reject a follow-up request that omits the container the
                            // previous turn ran in, so carry its id forward unless the caller pinned one themselves.
                            const { container } = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
                            if (message.container) {
                                if (container == null) {
                                    __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.container = message.container.id;
                                }
                                else if (typeof container === 'object' && container.id == null) {
                                    __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.container = { ...container, id: message.container.id };
                                }
                            }
                            if (nextStep === 'stop') {
                                yield* __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_compactAfterFinalTurn).call(this);
                                break;
                            }
                            if (nextStep === 'resume') {
                                continue;
                            }
                        }
                        else {
                            // The caller has taken over the history, so the last response no longer says how it ends.
                            __classPrivateFieldSet(this, _BetaToolRunner_lastStopReason, null, "f");
                        }
                        const toolMessage = await __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.at(-1));
                        if (toolMessage) {
                            __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.push(toolMessage);
                        }
                        else if (!__classPrivateFieldGet(this, _BetaToolRunner_mutated, "f")) {
                            yield* __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_compactAfterFinalTurn).call(this);
                            break;
                        }
                    }
                    finally {
                        __classPrivateFieldGet(this, _BetaToolRunner_stream, "f")?.abort();
                        __classPrivateFieldSet(this, _BetaToolRunner_stream, undefined, "f");
                    }
                }
                await __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_startedCallsSettled).call(this);
                if (!__classPrivateFieldGet(this, _BetaToolRunner_message, "f")) {
                    throw new AnthropicError('ToolRunner concluded without a message from the server');
                }
                __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").resolve(await __classPrivateFieldGet(this, _BetaToolRunner_message, "f"));
            }
            catch (error) {
                __classPrivateFieldSet(this, _BetaToolRunner_consumed, false);
                // Silence unhandled promise errors
                __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").promise.catch(() => { });
                __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").reject(error);
                __classPrivateFieldSet(this, _BetaToolRunner_completion, promiseWithResolvers());
                throw error;
            }
        }
        setMessagesParams(paramsOrMutator) {
            const params = typeof paramsOrMutator === 'function' ? paramsOrMutator(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params) : paramsOrMutator;
            rejectCompactionParam(params);
            rejectRunToolsEagerlyWithoutStream(params);
            if (__classPrivateFieldGet(this, _BetaToolRunner_compaction, "f").status !== 'idle') {
                rejectCompactionEdit(params);
            }
            if (__classPrivateFieldGet(this, _BetaToolRunner_compaction, "f").status === 'in_flight' && params.messages !== __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages) {
                throw new AnthropicError("Message params can't be changed while the conversation is being compacted, because the compaction " +
                    'response is about to replace them. Change them after this iteration instead.');
            }
            __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params = params;
            __classPrivateFieldSet(this, _BetaToolRunner_mutated, true);
            // Invalidate cached tool response since parameters changed
            __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, undefined);
        }
        setRequestOptions(optionsOrMutator) {
            if (typeof optionsOrMutator === 'function') {
                __classPrivateFieldSet(this, _BetaToolRunner_options, optionsOrMutator(__classPrivateFieldGet(this, _BetaToolRunner_options, "f")));
            }
            else {
                __classPrivateFieldSet(this, _BetaToolRunner_options, { ...__classPrivateFieldGet(this, _BetaToolRunner_options, "f"), ...optionsOrMutator });
            }
        }
        /**
         * Get the tool response for the last message from the assistant.
         * Avoids redundant tool executions by caching results. With `runToolsEagerly`, it reuses the calls of
         * the reply that have started and runs the rest, including the ones `deferToolCall()` is holding, so that no
         * call runs twice.
         *
         * @returns A promise that resolves to a BetaMessageParam containing tool results, or null if no tools need to be executed
         *
         * @example
         * const toolResponse = await runner.generateToolResponse();
         * if (toolResponse) {
         *   console.log('Tool results:', toolResponse.content);
         * }
         */
        async generateToolResponse(signal = __classPrivateFieldGet(this, _BetaToolRunner_options, "f").signal) {
            const message = (await __classPrivateFieldGet(this, _BetaToolRunner_message, "f")) ?? this.params.messages.at(-1);
            if (!message) {
                return null;
            }
            return __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_generateToolResponse).call(this, message, signal);
        }
        /**
         * Hold a tool call of the current reply until you are done with the reply, which is when it runs without
         * streaming: at the end of the loop body, or when you call `generateToolResponse()`.
         *
         * With `runToolsEagerly` the runner otherwise starts each call while the reply streams, as soon as
         * the model has moved on from it: when the next block starts, or the reply stops with `tool_use`. A call
         * never starts before your stream listeners and any `for await` over the stream have handled that event, so
         * you can call this from either once you have seen the call. The other calls of the reply still start early,
         * except the later calls of the same toolset, which a toolset runs in order.
         * It does nothing for a call that has started, outside the loop body, and without `runToolsEagerly`.
         *
         * @param toolUse - The `tool_use` block of the call, or its id
         *
         * @example
         * for await (const stream of runner) {
         *   stream.on('contentBlock', (block) => {
         *     if (block.type === 'tool_use' && block.name === 'delete_file') {
         *       runner.deferToolCall(block);
         *     }
         *   });
         *   await stream.finalMessage();
         *   // No `delete_file` call has started yet.
         * }
         */
        deferToolCall(toolUse) {
            const id = typeof toolUse === 'string' ? toolUse : toolUse.id;
            if (__classPrivateFieldGet(this, _BetaToolRunner_calls, "f") && !__classPrivateFieldGet(this, _BetaToolRunner_calls, "f").has(id)) {
                __classPrivateFieldGet(this, _BetaToolRunner_calls, "f").set(id, { status: 'held' });
            }
        }
        /**
         * The tool calls of the current reply that `deferToolCall()` is holding, in the model's order, as their
         * `tool_use` blocks. A call is in the list once its block has finished streaming, so read the list when you
         * are done with the stream. A call that has started is not in it. It is empty without
         * `runToolsEagerly`.
         *
         * Held calls are listed whatever the reply's `stop_reason`, because `generateToolResponse()` runs them
         * whatever it is. After `max_tokens` the input of the last call can be cut off.
         *
         * @example
         * for await (const stream of runner) {
         *   stream.on('contentBlock', (block) => {
         *     if (block.type === 'tool_use' && block.name === 'delete_file') {
         *       runner.deferToolCall(block);
         *     }
         *   });
         *   await stream.finalMessage();
         *
         *   const held = runner.deferredToolCalls;
         *   if (held.length > 0 && !(await confirm(held))) break;
         * }
         */
        get deferredToolCalls() {
            const stream = __classPrivateFieldGet(this, _BetaToolRunner_stream, "f");
            const calls = __classPrivateFieldGet(this, _BetaToolRunner_calls, "f");
            if (!(stream instanceof BetaToolRunnerStream) || !calls) {
                return [];
            }
            return stream.toolCalls.filter((toolUse) => calls.get(toolUse.id)?.status === 'held');
        }
        /**
         * Wait for the async iterator to complete. This works even if the async iterator hasn't yet started, and
         * will wait for an instance to start and go to completion.
         *
         * @returns A promise that resolves to the final BetaMessage when the iterator completes
         *
         * @example
         * // Start consuming the iterator
         * for await (const message of runner) {
         *   console.log('Message:', message.content);
         * }
         *
         * // Meanwhile, wait for completion from another part of the code
         * const finalMessage = await runner.done();
         * console.log('Final response:', finalMessage.content);
         */
        done() {
            return __classPrivateFieldGet(this, _BetaToolRunner_completion, "f").promise;
        }
        /**
         * Returns a promise indicating that the stream is done. Unlike .done(), this will eagerly read the stream:
         * * If the iterator has not been consumed, consume the entire iterator and return the final message from the
         * assistant.
         * * If the iterator has been consumed, waits for it to complete and returns the final message.
         *
         * @returns A promise that resolves to the final BetaMessage from the conversation
         * @throws {AnthropicError} If no messages were processed during the conversation
         *
         * @example
         * const finalMessage = await runner.runUntilDone();
         * console.log('Final response:', finalMessage.content);
         */
        async runUntilDone() {
            // If not yet consumed, start consuming and wait for completion
            if (!__classPrivateFieldGet(this, _BetaToolRunner_consumed, "f")) {
                for await (const _ of this) {
                    // Iterator naturally populates this.#message
                }
            }
            // If consumed but not completed, wait for completion
            return this.done();
        }
        /**
         * Get the current parameters being used by the ToolRunner.
         *
         * @returns A readonly view of the current ToolRunnerParams
         *
         * @example
         * const currentParams = runner.params;
         * console.log('Current model:', currentParams.model);
         * console.log('Message count:', currentParams.messages.length);
         */
        get params() {
            return __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
        }
        /**
         * Add one or more messages to the conversation history.
         *
         * @param messages - One or more BetaMessageParam objects to add to the conversation
         *
         * @example
         * runner.pushMessages(
         *   { role: 'user', content: 'Also, what about the weather in NYC?' }
         * );
         *
         * @example
         * // Adding multiple messages
         * runner.pushMessages(
         *   { role: 'user', content: 'What about NYC?' },
         *   { role: 'user', content: 'And Boston?' }
         * );
         */
        pushMessages(...messages) {
            this.setMessagesParams((params) => ({
                ...params,
                messages: [...params.messages, ...messages],
            }));
        }
        /**
         * Schedule a compaction of the conversation. Once the current turn has finished, including any tool
         * calls, the runner requests a summary and replaces the message history with the compaction response,
         * which is yielded like any other message. Requires the `compact-2026-09-04` beta.
         *
         * @param compaction - The config to send, as `messages.create()` takes it. Defaults to `{ type: 'summarize' }`
         *
         * @example
         * for await (const message of runner) {
         *   if (message.usage.input_tokens > 100_000) {
         *     runner.compactBeforeNextTurn();
         *   }
         * }
         */
        compactBeforeNextTurn(compaction) {
            if (__classPrivateFieldGet(this, _BetaToolRunner_compaction, "f").status === 'in_flight') {
                return;
            }
            rejectCompactionEdit(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params);
            __classPrivateFieldSet(this, _BetaToolRunner_compaction, { status: 'scheduled', config: compaction ?? { type: 'summarize' } });
        }
        /**
         * Give the model more tools without changing `params.tools`, which would miss the prompt cache.
         *
         * Each tool's whole definition is sent in a `tool_addition` block with the next request, and a
         * runnable tool replaces a runnable tool of the same name straight away, even for a call already in
         * the message being handled. A call that started while the reply streamed keeps the old one. A raw definition
         * is only sent: the runner never runs it, and stops running a tool of the same name. Passing a runnable toolset,
         * or a raw definition of a toolset the runner has, throws `ToolsetContractError` and adds nothing: a runner's
         * toolsets come only from `params.tools`. A tool named like one of its toolsets is left to the API, which rejects
         * it with the next request. Requires the `inline-tools-2026-09-15` beta, which the runner does not add for you.
         *
         * @param tools - Runnable tools (for example from `betaZodTool()`) or raw tool definitions
         *
         * @example
         * runner.addTools(queryDatabaseTool);
         */
        addTools(...tools) {
            const families = __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_toolsetFamilies).call(this);
            for (const tool of tools) {
                if (isRunnableToolset(tool)) {
                    throw new ToolsetContractError(`addTools() can't add the '${quotedName(toolsetFamily(tool))}' toolset: ${USE_A_NEW_RUNNER}`);
                }
                // The API treats a definition of one of the runner's families as replacing that toolset, which would leave the
                // model with a toolset the runner doesn't run.
                const family = definitionFamily(tool);
                if (families.has(family)) {
                    throw new ToolsetContractError(`addTools() can't replace the '${quotedName(family)}' toolset: ${USE_A_NEW_RUNNER}`);
                }
            }
            for (const tool of tools) {
                // A definition without a `name` (an `mcp_toolset`) is nothing the runner runs or stops running.
                if ('name' in tool) {
                    __classPrivateFieldGet(this, _BetaToolRunner_toolOverrides, "f").set(tool.name, 'run' in tool ? tool : null);
                }
                __classPrivateFieldGet(this, _BetaToolRunner_pendingToolChanges, "f").push({ type: 'addition', tool });
            }
        }
        /**
         * Take tools away from the model without changing `params.tools`, which would miss the prompt cache.
         *
         * The tools stop being run straight away: a call to one of them, even one in the message being
         * handled, gets the same "not found" error result as a call to an unknown tool. A call that started while the
         * reply streamed finishes as usual. The model is told in a `tool_removal` block with the next request. Use
         * {@link addTools} to bring a tool back. Passing the name of one of the runner's toolsets throws
         * `ToolsetContractError` and removes nothing. Requires the `inline-tools-2026-09-15` beta, which the runner does
         * not add for you.
         *
         * @param tools - The tools to remove, or their names
         *
         * @example
         * runner.removeTools('query_database');
         */
        removeTools(...tools) {
            const families = __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_toolsetFamilies).call(this);
            for (const tool of tools) {
                // A toolset's name is always its own: the API rejects any other tool of that name.
                const name = typeof tool === 'string' ? tool : tool.name;
                if (families.has(name)) {
                    throw new ToolsetContractError(`removeTools() can't remove the '${quotedName(name)}' toolset: ${REMOVE_WITH_A_NEW_RUNNER}`);
                }
            }
            for (const tool of tools) {
                const name = typeof tool === 'string' ? tool : tool.name;
                __classPrivateFieldGet(this, _BetaToolRunner_toolOverrides, "f").set(name, null);
                __classPrivateFieldGet(this, _BetaToolRunner_pendingToolChanges, "f").push({ type: 'removal', name });
            }
        }
        /**
         * Makes the ToolRunner directly awaitable, equivalent to calling .runUntilDone()
         * This allows using `await runner` instead of `await runner.runUntilDone()`
         */
        then(onfulfilled, onrejected) {
            return this.runUntilDone().then(onfulfilled, onrejected);
        }
    }
    _BetaToolRunner_send = 
    /**
     * Sends one request and yields its message, or its stream when streaming. `#message` and `#stream` are set
     * before the yield, so they are there while the caller handles the item; the loop aborts the stream at the
     * end of the iteration.
     */
    async function* _BetaToolRunner_send(params) {
        await __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_startedCallsSettled).call(this);
        __classPrivateFieldSet(this, _BetaToolRunner_calls, undefined);
        params = {
            ...params,
            ...(params.tools && { tools: params.tools.map(toolDefinition) }),
            messages: withToolDefinitions(params.messages),
        };
        if (params.stream) {
            __classPrivateFieldSet(this, _BetaToolRunner_stream, __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.runToolsEagerly ?
                __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_streamThatStartsTools).call(this, params)
                : this.client.beta.messages.stream({ ...params }, __classPrivateFieldGet(this, _BetaToolRunner_options, "f")));
            __classPrivateFieldSet(this, _BetaToolRunner_message, __classPrivateFieldGet(this, _BetaToolRunner_stream, "f").finalMessage());
            // Make sure that this promise doesn't throw before we get the option to do something about it.
            // Error will be caught when we call await this.#message ultimately
            __classPrivateFieldGet(this, _BetaToolRunner_message, "f").catch(() => { });
            yield __classPrivateFieldGet(this, _BetaToolRunner_stream, "f");
        }
        else {
            __classPrivateFieldSet(this, _BetaToolRunner_message, this.client.beta.messages.create({ ...params, stream: false }, __classPrivateFieldGet(this, _BetaToolRunner_options, "f")));
            yield __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
        }
    }, _BetaToolRunner_streamThatStartsTools = function _BetaToolRunner_streamThatStartsTools(params) {
        const calls = new Map();
        __classPrivateFieldSet(this, _BetaToolRunner_calls, calls);
        // A toolset runs its calls one at a time, in the model's order. So a toolset's call starts here only while the
        // toolset is idle, and once one of its calls waits for the reply or fails, its later calls wait for the reply too.
        const toolsets = new Map();
        return BetaToolRunnerStream.start(this.client.beta.messages, params, __classPrivateFieldGet(this, _BetaToolRunner_options, "f"), (toolUse) => {
            // Held, or started by `generateToolResponse()` before a reader that is behind got to the call.
            const known = calls.has(toolUse.id);
            // A call named after a toolset is a toolset call with malformed actions, which `generateToolResponse()` answers.
            const malformed = !toolUse.toolset_name && __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_toolsetFamilies).call(this).has(toolUse.name);
            const family = malformed ? toolUse.name : toolUse.toolset_name;
            if (family) {
                if (known || malformed || toolsets.has(family)) {
                    toolsets.set(family, 'waiting');
                    return;
                }
                toolsets.set(family, 'running');
                const result = runToolsetCall(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params, family, toolUse, __classPrivateFieldGet(this, _BetaToolRunner_options, "f"));
                calls.set(toolUse.id, { status: 'started', result });
                result.then(({ is_error }) => {
                    if (is_error || toolsets.get(family) === 'waiting')
                        toolsets.set(family, 'waiting');
                    else
                        toolsets.delete(family);
                }, () => toolsets.set(family, 'waiting'));
                return;
            }
            if (known) {
                return;
            }
            // The call looks its tool up now, so a later `addTools()` or `removeTools()` doesn't change it.
            const result = runToolCall(__classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_runnableTools).call(this), __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_availableToolNames).call(this), toolUse, __classPrivateFieldGet(this, _BetaToolRunner_options, "f"));
            // Marks a rejection as handled until the results are collected.
            result.catch(() => { });
            calls.set(toolUse.id, { status: 'started', result });
        });
    }, _BetaToolRunner_startedCallsSettled = 
    /** Waits for the calls of the last streamed reply that have started, whether or not their results were sent. */
    async function _BetaToolRunner_startedCallsSettled() {
        const started = [...(__classPrivateFieldGet(this, _BetaToolRunner_calls, "f")?.values() ?? [])].filter((call) => call.status === 'started');
        await Promise.allSettled(started.map((call) => call.result));
    }, _BetaToolRunner_compact = async function* _BetaToolRunner_compact(compaction) {
        rejectCompactionEdit(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params);
        const { max_iterations, runToolsEagerly, ...requestParams } = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params;
        const params = withoutCompactionIncompatibleParams(requestParams);
        __classPrivateFieldSet(this, _BetaToolRunner_compaction, { status: 'in_flight' });
        __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, undefined);
        const lastMessage = __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
        try {
            yield* __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_send).call(this, { ...params, compaction });
            const message = await __classPrivateFieldGet(this, _BetaToolRunner_message, "f");
            if (message.content.some((block) => block.type === 'compaction' && block.content)) {
                __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_recordRemovalsFromHistory).call(this);
                // The response has to be sent back as it came, first, replacing the messages it summarizes.
                __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages = [{ role: message.role, content: message.content }];
            }
            else {
                loggerFor(this.client).warn('Compaction produced no summary; keeping the conversation as it is.');
                // If the run ends here, `done()` resolves to the last real message rather than this response.
                __classPrivateFieldSet(this, _BetaToolRunner_message, lastMessage, "f");
            }
        }
        finally {
            __classPrivateFieldSet(this, _BetaToolRunner_compaction, { status: 'idle' });
        }
    }, _BetaToolRunner_runnableTools = function _BetaToolRunner_runnableTools() {
        const runnable = new Map();
        for (const tool of __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.tools) {
            if ('run' in tool && 'name' in tool) {
                runnable.set(tool.name, tool);
            }
        }
        for (const [name, tool] of __classPrivateFieldGet(this, _BetaToolRunner_toolOverrides, "f")) {
            if (tool) {
                runnable.set(name, tool);
            }
            else {
                runnable.delete(name);
            }
        }
        return runnable;
    }, _BetaToolRunner_availableToolNames = function _BetaToolRunner_availableToolNames() {
        const available = new Set(__classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_runnableTools).call(this).keys());
        for (const message of [...__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages, __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_pendingToolChangesMessage).call(this)]) {
            if (typeof message.content === 'string') {
                continue;
            }
            for (const block of message.content) {
                if (message.role === 'system') {
                    applyToolChange(block, available);
                }
                else if (message.role === 'assistant' && block.type === 'compaction') {
                    // A compaction block's tool_changes stand in for the system messages of the turns it summarized.
                    for (const change of block.tool_changes ?? []) {
                        applyToolChange(change, available);
                    }
                }
            }
        }
        return available;
    }, _BetaToolRunner_recordRemovalsFromHistory = function _BetaToolRunner_recordRemovalsFromHistory() {
        const available = __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_availableToolNames).call(this);
        for (const name of __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_runnableTools).call(this).keys()) {
            if (!available.has(name)) {
                __classPrivateFieldGet(this, _BetaToolRunner_toolOverrides, "f").set(name, null);
            }
        }
    }, _BetaToolRunner_compactAfterFinalTurn = async function* _BetaToolRunner_compactAfterFinalTurn() {
        if (__classPrivateFieldGet(this, _BetaToolRunner_compaction, "f").status !== 'scheduled') {
            return;
        }
        const lastContent = __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.at(-1)?.content;
        if (Array.isArray(lastContent) && lastContent.some((block) => block.type === 'tool_use')) {
            // A turn that was cut short can end with tool calls that are never run, and the API can't
            // compact a conversation whose last turn has an unanswered tool call.
            loggerFor(this.client).warn('The pending compaction was skipped because the last turn ended with tool calls that were not run. ' +
                'Call `compactBeforeNextTurn()` again if you continue the conversation.');
            __classPrivateFieldSet(this, _BetaToolRunner_compaction, { status: 'idle' });
            return;
        }
        yield* __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_compact).call(this, __classPrivateFieldGet(this, _BetaToolRunner_compaction, "f").config);
    }, _BetaToolRunner_generateToolResponse = async function _BetaToolRunner_generateToolResponse(lastMessage, signal = __classPrivateFieldGet(this, _BetaToolRunner_options, "f").signal) {
        if (__classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f") !== undefined) {
            return __classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f");
        }
        __classPrivateFieldSet(this, _BetaToolRunner_toolResponse, generateToolResponse(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params, __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_runnableTools).call(this), __classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_availableToolNames).call(this), lastMessage, { ...__classPrivateFieldGet(this, _BetaToolRunner_options, "f"), signal }, __classPrivateFieldGet(this, _BetaToolRunner_calls, "f")));
        return __classPrivateFieldGet(this, _BetaToolRunner_toolResponse, "f");
    }, _BetaToolRunner_toolsetFamilies = function _BetaToolRunner_toolsetFamilies() {
        return new Set(__classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.tools.filter(isRunnableToolset).map(toolsetFamily));
    }, _BetaToolRunner_flushPendingToolChanges = function _BetaToolRunner_flushPendingToolChanges() {
        // A paused turn has to go back as the last message, so the changes wait for the request after it.
        if (__classPrivateFieldGet(this, _BetaToolRunner_lastStopReason, "f") === 'pause_turn' || __classPrivateFieldGet(this, _BetaToolRunner_pendingToolChanges, "f").length === 0) {
            return;
        }
        // Not pushMessages(): that marks the params as changed by the caller, and the runner would then
        // leave this turn's assistant message and tool results for the caller to append.
        __classPrivateFieldGet(this, _BetaToolRunner_state, "f").params.messages.push(__classPrivateFieldGet(this, _BetaToolRunner_instances, "m", _BetaToolRunner_pendingToolChangesMessage).call(this));
        __classPrivateFieldSet(this, _BetaToolRunner_pendingToolChanges, []);
    }, _BetaToolRunner_pendingToolChangesMessage = function _BetaToolRunner_pendingToolChangesMessage() {
        const content = [];
        for (const change of __classPrivateFieldGet(this, _BetaToolRunner_pendingToolChanges, "f")) {
            if (change.type === 'removal') {
                content.push({ type: 'tool_removal', tool: { type: 'tool_reference', name: change.name } });
                continue;
            }
            const definition = toolDefinition(change.tool);
            content.push({ type: 'tool_addition', tool: { type: 'tool_definition', definition } });
        }
        return { role: 'system', content };
    };
    return BetaToolRunner;
})();
function rejectCompactionParam(params) {
    if ('compaction' in params && params.compaction != null) {
        throw new AnthropicError('`compaction` cannot be set on a tool runner: every request in the loop would compact again. ' +
            'Call `runner.compactBeforeNextTurn()` when the conversation should be compacted instead.');
    }
}
function rejectCompactionControl(params) {
    // No longer in the params type, so only untyped callers reach this; forwarding it would be an opaque API 400.
    if ('compactionControl' in params && params.compactionControl != null) {
        throw new AnthropicError('`compactionControl` has been removed from the tool runner. Use server-side compaction instead: ' +
            'call `runner.compactBeforeNextTurn()` when the conversation should be compacted.');
    }
}
function rejectRunToolsEagerlyWithoutStream(params) {
    if (params.runToolsEagerly && !params.stream) {
        throw new TypeError("`runToolsEagerly: true` needs `stream: true` in the tool runner's params, because a reply that " +
            "isn't streamed arrives whole.");
    }
}
function rejectCompactionEdit(params) {
    // The compaction request is sent without `context_management`, so the API can't refuse the pair there:
    // it would run and bill the compaction, then refuse the next request.
    if (params.context_management?.edits?.some((edit) => edit.type.startsWith('compact_'))) {
        throw new AnthropicError("`compactBeforeNextTurn()` can't be used while `context_management` has a compaction edit, " +
            "because the API doesn't accept a compaction block together with one. Remove the edit first.");
    }
}
/**
 * A compaction request returns only the compaction block, never a reply, so the API rejects the params that
 * only shape a reply. The runner's later requests keep them.
 */
function withoutCompactionIncompatibleParams(params) {
    const { context_management, stop_sequences, output_format, ...kept } = params;
    const withoutFormat = ({ format, ...outputConfig }) => outputConfig;
    if (kept.tool_choice?.type === 'any' || kept.tool_choice?.type === 'tool') {
        delete kept.tool_choice;
    }
    if (kept.output_config) {
        kept.output_config = withoutFormat(kept.output_config);
    }
    if (Array.isArray(kept.fallbacks)) {
        kept.fallbacks = kept.fallbacks.map((fallback) => fallback.output_config ?
            { ...fallback, output_config: withoutFormat(fallback.output_config) }
            : fallback);
    }
    return kept;
}
function toolDefinition(tool) {
    if (!('run' in tool)) {
        return tool;
    }
    const apiKeys = BETA_CLIENT_TOOL_UNION_KEYS;
    const fields = 'toJSON' in tool && typeof tool.toJSON === 'function' ? tool.toJSON() : tool;
    return {
        ...Object.fromEntries(Object.entries(fields).filter(([key]) => apiKeys.includes(key))),
        ...(wasCreatedByStainlessHelper(tool) && { [SDK_HELPER_SYMBOL]: tool[SDK_HELPER_SYMBOL] }),
    };
}
function withToolDefinitions(messages) {
    return messages.map((message) => {
        if (message.role !== 'system' || typeof message.content === 'string') {
            return message;
        }
        const content = message.content.map((block) => block.type === 'tool_addition' && block.tool.type === 'tool_definition' ?
            { ...block, tool: { ...block.tool, definition: toolDefinition(block.tool.definition) } }
            : block);
        return { ...message, content };
    });
}
async function generateToolResponse(params, runnable, available, lastMessage, requestOptions, calls) {
    // Only process if the last message is from the assistant and has tool use blocks
    if (!lastMessage ||
        lastMessage.role !== 'assistant' ||
        !lastMessage.content ||
        typeof lastMessage.content === 'string') {
        return null;
    }
    const toolUseBlocks = lastMessage.content.filter((content) => content.type === 'tool_use');
    if (toolUseBlocks.length === 0) {
        return null;
    }
    // A toolset's members run one at a time in the order the model wrote them, and once one is answered with is_error
    // the rest of that toolset's members in this turn are not run (notExecutedText). Function tools run alongside them
    // and neither wait on nor stop a toolset's members.
    const sequences = new Map();
    const toolResults = await Promise.all(toolUseBlocks.map(async (toolUse) => {
        // The call may have started while the reply streamed, or in an earlier `generateToolResponse()`.
        const call = calls?.get(toolUse.id);
        const started = call?.status === 'started' ? call.result : undefined;
        // Members dispatch by family, never by name: a custom tool may share the bare `name`.
        if (toolUse.toolset_name) {
            const family = toolUse.toolset_name;
            const sequence = sequences.get(family) ?? { tail: Promise.resolve(), failed: false };
            sequences.set(family, sequence);
            const registered = params.tools.some((t) => isRunnableToolset(t) && toolsetFamily(t) === family);
            const run = started ??
                sequence.tail.then(() => sequence.failed ?
                    toolsetResultBlock(toolUse, notExecutedText(family), true)
                    : runToolsetCall(params, family, toolUse, requestOptions));
            // A rejection (a usage error) propagates through Promise.all and stops the run. It also stops this toolset's
            // later members here, which would otherwise still be dispatched after the run has failed.
            sequence.tail = run.then(({ is_error }) => {
                if (is_error && registered)
                    sequence.failed = true;
            }, () => {
                sequence.failed = true;
            });
            calls?.set(toolUse.id, { status: 'started', result: run });
            return run;
        }
        if (started) {
            return started;
        }
        // A `tool_removal` is only a hint to the model, which may still emit a tool_use for a
        // withdrawn tool — treat those exactly like a tool that was never defined.
        const tool = available.has(toolUse.name) ? runnable.get(toolUse.name) : undefined;
        if (!tool && params.tools.some((t) => isRunnableToolset(t) && toolsetFamily(t) === toolUse.name)) {
            // A call named after a toolset in the run, but with no `toolset_name`, is a toolset call with malformed
            // actions. It fails like one of the toolset's calls, so the toolset's later calls in this turn are not run.
            const sequence = sequences.get(toolUse.name) ?? { tail: Promise.resolve(), failed: false };
            sequences.set(toolUse.name, sequence);
            sequence.tail = sequence.tail.then(() => {
                sequence.failed = true;
            });
            return malformedToolsetCallResult(toolUse);
        }
        const result = runToolCall(runnable, available, toolUse, requestOptions);
        calls?.set(toolUse.id, { status: 'started', result });
        return result;
    }));
    return {
        role: 'user',
        content: toolResults,
    };
}
/** Runs a toolset's call with the toolset of its family in the run. */
async function runToolsetCall(params, family, toolUse, requestOptions) {
    const toolset = params.tools.find((t) => isRunnableToolset(t) && toolsetFamily(t) === family);
    return toolset ?
        runToolsetMember(toolset, toolUse, { signal: requestOptions?.signal })
        : toolsetResultBlock(toolUse, `Error: Toolset '${quotedName(family)}' member '${quotedName(toolUse.name)}' not found`, true);
}
async function runToolCall(runnable, available, toolUse, requestOptions) {
    // A `tool_removal` is only a hint to the model, which may still emit a tool_use for a
    // withdrawn tool — treat those exactly like a tool that was never defined.
    const tool = available.has(toolUse.name) ? runnable.get(toolUse.name) : undefined;
    if (!tool) {
        return toolNotFoundResult(toolUse);
    }
    try {
        let input = toolUse.input;
        if ('parse' in tool && tool.parse) {
            input = tool.parse(input);
        }
        const result = await tool.run(input, {
            toolUse: toolUse,
            toolUseBlock: toolUse,
            signal: requestOptions?.signal,
        });
        return {
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: result,
        };
    }
    catch (error) {
        return {
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: toolErrorContent(error),
            is_error: true,
        };
    }
}
/**
 * Response content is sent back as request content unchanged. The generated request type of the
 * `tool_listing` block is narrower than its response type, so this needs an assertion until the
 * two agree.
 */
function asContentParam(content) {
    return content;
}
/**
 * A definition's family, as the API computes it for a toolset: its type without the date, and without `_toolset`.
 * So a later `browser_toolset_*` version is the browser family, and `computer_20250124` the computer family.
 */
function definitionFamily(tool) {
    return (tool.type ?? 'custom').replace(/_\d{8}$/, '').replace(/_toolset$/, '');
}
function toolNotFoundResult(toolUse) {
    return {
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: `Error: Tool '${toolUse.name}' not found`,
        is_error: true,
    };
}
/** The error for a toolset call with malformed actions. None of its actions run. */
function malformedToolsetCallResult(toolUse) {
    return {
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: `Error: the '${quotedName(toolUse.name)}' toolset could not run this call${malformedActions(toolUse.input)}; nothing in the batch was executed`,
        is_error: true,
    };
}
/** What is wrong with the call's `actions`. It quotes action names but no other part of the input. */
function malformedActions(input) {
    const fields = typeof input === 'object' && input !== null ? input : {};
    if (!('actions' in fields)) {
        const action = 'action' in fields ? fields.action : undefined;
        return typeof action === 'string' ?
            `: the call has no 'actions' list (action: '${quotedName(action)}')`
            : ": the call has no 'actions' list";
    }
    const { actions } = fields;
    if (typeof actions === 'string')
        return ": 'actions' is text, not a list of actions";
    if (!Array.isArray(actions))
        return ": 'actions' is not a list of actions";
    if (actions.length === 0)
        return ": the 'actions' list is empty";
    const names = [];
    for (const [i, entry] of actions.entries()) {
        const action = typeof entry === 'object' && entry !== null && 'action' in entry ? entry.action : undefined;
        if (typeof action !== 'string')
            return `: action ${i} must be an object with a string 'action' field`;
        names.push(`'${quotedName(action)}'`);
    }
    const more = names.length > 10 ? `, and ${names.length - 10} more` : '';
    return `: its actions could not be run as sent (actions: ${names.slice(0, 10).join(', ')}${more})`;
}
function applyToolChange(block, available) {
    switch (block.type) {
        case 'tool_removal':
        case 'tool_addition':
            applyToolReference(block, available);
            break;
    }
}
function applyToolReference(block, available) {
    const name = changedToolName(block.tool);
    if (name === undefined)
        return;
    if (block.type === 'tool_removal') {
        available.delete(name);
    }
    else {
        available.add(name);
    }
}
function changedToolName(tool) {
    switch (tool.type) {
        case 'tool_reference':
            return tool.name;
        case 'tool_definition':
            // Not every `tools[]` entry has a `name` (e.g. `mcp_toolset`); those are never locally runnable.
            return 'name' in tool.definition ? tool.definition.name : undefined;
        default:
            // mcp_tool_reference / mcp_toolset_reference run server-side; unknown types are ignored
            // rather than rejected.
            return undefined;
    }
}
/**
 * Sorts every stop reason into one of three buckets: `run_tools` turns run their client tool
 * calls and continue the loop; `resume` turns are sent back unchanged so the server continues
 * them; `stop` turns end the loop without running any tool calls.
 */
function determineNextStepFromStopReason(stopReason) {
    if (stopReason === null)
        return 'stop';
    switch (stopReason) {
        case 'tool_use':
            return 'run_tools';
        case 'pause_turn':
        // pause_after_compaction hands the turn back before the model answers; sending it back
        // unchanged continues it.
        case 'compaction':
            return 'resume';
        case 'end_turn':
        case 'stop_sequence':
        case 'max_tokens':
        case 'model_context_window_exceeded':
        case 'refusal':
            return 'stop';
        default:
            return 'stop';
    }
}

const DEPRECATED_MODELS = {
    'claude-sonnet-4-5': 'November 30th, 2026',
    'claude-sonnet-4-5-20250929': 'November 30th, 2026',
};
const MODELS_TO_WARN_WITH_THINKING_ENABLED = ['claude-mythos-preview', 'claude-opus-4-6'];
var Messages = /* @__PURE__ */ (() => {
    class Messages extends APIResource {
        constructor() {
            super(...arguments);
            this.batches = new Batches(this._client);
        }
        create(params, options) {
            // Transform deprecated output_format to output_config.format
            const modifiedParams = transformOutputFormat(params);
            const { betas, user_profile_id, workspace_id, ...body } = modifiedParams;
            if (body.model in DEPRECATED_MODELS) {
                console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS[body.model]}\nPlease migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
            }
            if (MODELS_TO_WARN_WITH_THINKING_ENABLED.includes(body.model) &&
                body.thinking &&
                body.thinking.type === 'enabled') {
                console.warn(`Using Claude with ${body.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`);
            }
            let timeout = options?.timeout ?? this._client._options.timeout;
            if (!body.stream && timeout == null) {
                const maxNonstreamingTokens = MODEL_NONSTREAMING_TOKENS[body.model] ?? undefined;
                timeout = this._client.calculateNonstreamingTimeout(body.max_tokens, maxNonstreamingTokens);
            }
            // Collect helper info from tools and messages
            const helperHeader = stainlessHelperHeader(body.tools, body.messages);
            return this._client.post('/v1/messages?beta=true', {
                body,
                timeout: timeout ?? 600000,
                ...options,
                headers: buildHeaders([
                    {
                        ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                        ...(user_profile_id != null ? { 'anthropic-user-profile-id': user_profile_id } : undefined),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    helperHeader,
                    options?.headers,
                ]),
                stream: modifiedParams.stream ?? false,
            });
        }
        /**
         * Send a structured list of input messages with text and/or image content, along with an expected `output_format` and
         * the response will be automatically parsed and available in the `parsed_output` property of the message.
         *
         * @example
         * ```ts
         * const message = await client.beta.messages.parse({
         *   model: 'claude-3-5-sonnet-20241022',
         *   max_tokens: 1024,
         *   messages: [{ role: 'user', content: 'What is 2+2?' }],
         *   output_format: zodOutputFormat(z.object({ answer: z.number() }), 'math'),
         * });
         *
         * console.log(message.parsed_output?.answer); // 4
         * ```
         */
        parse(params, options) {
            options = {
                ...options,
                headers: buildHeaders([
                    { 'anthropic-beta': [...(params.betas ?? []), 'structured-outputs-2025-12-15'].toString() },
                    options?.headers,
                ]),
            };
            return this.create(params, options).then((message) => parseBetaMessage(message, params, { logger: this._client.logger ?? console }));
        }
        /**
         * Create a Message stream
         */
        stream(body, options) {
            return BetaMessageStream.createMessage(this, body, options);
        }
        /**
         * Count the number of tokens in a Message.
         *
         * The Token Count API can be used to count the number of tokens in a Message,
         * including tools, images, and documents, without creating it.
         *
         * Learn more about token counting in our
         * [user guide](https://platform.claude.com/docs/en/build-with-claude/token-counting)
         *
         * @example
         * ```ts
         * const betaMessageTokensCount =
         *   await client.beta.messages.countTokens({
         *     messages: [{ content: 'Hello, world', role: 'user' }],
         *     model: 'claude-opus-5',
         *   });
         * ```
         */
        countTokens(params, options) {
            // Transform deprecated output_format to output_config.format
            const modifiedParams = transformOutputFormat(params);
            const { betas, user_profile_id, workspace_id, ...body } = modifiedParams;
            return this._client.post('/v1/messages/count_tokens?beta=true', {
                body,
                ...options,
                headers: buildHeaders([
                    {
                        'anthropic-beta': [...(betas ?? []), 'token-counting-2024-11-01'].toString(),
                        ...(user_profile_id != null ? { 'anthropic-user-profile-id': user_profile_id } : undefined),
                        ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                    },
                    options?.headers,
                ]),
            });
        }
        toolRunner(body, options) {
            return new BetaToolRunner(this._client, body, options);
        }
    }
    Messages.Batches = Batches;
    Messages.BetaToolRunner = BetaToolRunner;
    Messages.ToolError = ToolError;
    return Messages;
})();
/**
 * Transform deprecated output_format to output_config.format
 * Returns a modified copy of the params without mutating the original
 */
function transformOutputFormat(params) {
    if (!params.output_format) {
        return params;
    }
    if (params.output_config?.format) {
        throw new AnthropicError('Both output_format and output_config.format were provided. ' +
            'Please use only output_config.format (output_format is deprecated).');
    }
    const { output_format, ...rest } = params;
    return {
        ...rest,
        output_config: {
            ...params.output_config,
            format: output_format,
        },
    };
}
const BETA_CLIENT_TOOL_UNION_KEYS = [
    'input_schema',
    'name',
    'allowed_callers',
    'cache_control',
    'defer_loading',
    'description',
    'eager_input_streaming',
    'input_examples',
    'strict',
    'type',
    'configs',
    'display_height_px',
    'display_width_px',
    'display_number',
    'enable_zoom',
    'max_characters',
];

var Beta = /* @__PURE__ */ (() => {
    class Beta extends APIResource {
        constructor() {
            super(...arguments);
            this.models = new Models$1(this._client);
            this.messages = new Messages(this._client);
            this.agents = new Agents(this._client);
            this.environments = new Environments(this._client);
            this.sessions = new Sessions(this._client);
            this.deployments = new Deployments(this._client);
            this.deploymentRuns = new DeploymentRuns(this._client);
            this.vaults = new Vaults(this._client);
            this.memoryStores = new MemoryStores(this._client);
            this.files = new Files$1(this._client);
            this.skills = new Skills$1(this._client);
            this.webhooks = new Webhooks(this._client);
            this.userProfiles = new UserProfiles(this._client);
            this.dreams = new Dreams(this._client);
            this.tunnels = new Tunnels(this._client);
            this.organization = new Organization$1(this._client);
        }
    }
    Beta.Models = Models$1;
    Beta.Messages = Messages;
    Beta.Agents = Agents;
    Beta.Environments = Environments;
    Beta.Sessions = Sessions;
    Beta.Deployments = Deployments;
    Beta.DeploymentRuns = DeploymentRuns;
    Beta.Vaults = Vaults;
    Beta.MemoryStores = MemoryStores;
    Beta.Files = Files$1;
    Beta.Skills = Skills$1;
    Beta.Webhooks = Webhooks;
    Beta.UserProfiles = UserProfiles;
    Beta.Dreams = Dreams;
    Beta.Tunnels = Tunnels;
    Beta.Organization = Organization$1;
    return Beta;
})();

class Completions extends APIResource {
    create(params, options) {
        const { betas, workspace_id, ...body } = params;
        return this._client.post('/v1/complete', {
            body,
            timeout: this._client._options.timeout ?? 600000,
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
            stream: params.stream ?? false,
        });
    }
}

class Files extends APIResource {
    /**
     * List Files
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const fileMetadata of client.files.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { workspace_id, ...query } = params ?? {};
        return this._client.getAPIList('/v1/files', (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete File
     *
     * @example
     * ```ts
     * const deletedFile = await client.files.delete('file_id');
     * ```
     */
    delete(fileID, params = {}, options) {
        const { workspace_id } = params ?? {};
        return this._client.delete(path `/v1/files/${fileID}`, {
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * Download File
     *
     * @example
     * ```ts
     * const response = await client.files.download('file_id');
     *
     * const content = await response.blob();
     * console.log(content);
     * ```
     */
    download(fileID, params = {}, options) {
        const { workspace_id } = params ?? {};
        return this._client.get(path `/v1/files/${fileID}/content`, {
            ...options,
            headers: buildHeaders([
                {
                    Accept: 'application/binary',
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
            __binaryResponse: true,
        });
    }
    /**
     * Get File Metadata
     *
     * @example
     * ```ts
     * const fileMetadata = await client.files.retrieveMetadata(
     *   'file_id',
     * );
     * ```
     */
    retrieveMetadata(fileID, params = {}, options) {
        const { workspace_id } = params ?? {};
        return this._client.get(path `/v1/files/${fileID}`, {
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * Upload File
     *
     * @example
     * ```ts
     * const fileMetadata = await client.files.upload({
     *   file: fs.createReadStream('path/to/file'),
     * });
     * ```
     */
    upload(params, options) {
        const { workspace_id, ...body } = params;
        return this._client.post('/v1/files', multipartFormRequestOptions({
            body,
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                stainlessHelperHeaderFromFile(body.file),
                options?.headers,
            ]),
        }, this._client));
    }
}

class Models extends APIResource {
    /**
     * Get a specific model.
     *
     * The Models API response can be used to determine information about a specific
     * model or resolve a model alias to a model ID.
     *
     * @example
     * ```ts
     * const modelInfo = await client.models.retrieve('model_id');
     * ```
     */
    retrieve(modelID, params = {}, options) {
        const { betas, workspace_id } = params ?? {};
        return this._client.get(path `/v1/models/${modelID}`, {
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
    /**
     * List available models.
     *
     * The Models API response can be used to determine which models are available for
     * use in the API. More recently released models are listed first.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const modelInfo of client.models.list()) {
     *   // ...
     * }
     * ```
     */
    list(params = {}, options) {
        const { betas, workspace_id, ...query } = params ?? {};
        return this._client.getAPIList('/v1/models', (Page), {
            query,
            ...options,
            headers: buildHeaders([
                {
                    ...(betas?.toString() != null ? { 'anthropic-beta': betas?.toString() } : undefined),
                    ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined),
                },
                options?.headers,
            ]),
        });
    }
}

class APIKeys extends APIResource {
    /**
     * Get API Key
     *
     * @example
     * ```ts
     * const apiKey = await client.organization.apiKeys.retrieve(
     *   'api_key_id',
     * );
     * ```
     */
    retrieve(apiKeyID, options) {
        return this._client.get(path `/v1/organizations/api_keys/${apiKeyID}`, options);
    }
    /**
     * Update API Key
     *
     * @example
     * ```ts
     * const apiKey = await client.organization.apiKeys.update(
     *   'api_key_id',
     * );
     * ```
     */
    update(apiKeyID, body, options) {
        return this._client.post(path `/v1/organizations/api_keys/${apiKeyID}`, { body, ...options });
    }
    /**
     * List API Keys
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const apiKey of client.organization.apiKeys.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/api_keys', (Page), { query, ...options });
    }
}

class ComplianceSettings extends APIResource {
    /**
     * Retrieve your organization's Compliance Settings.
     *
     * Compliance Settings is a singleton resource: there is exactly one per
     * organization, addressed without an identifier. The `state` field reflects
     * whether the Compliance API is enabled. An organization with a parent
     * organization reads the state inherited from the parent's configuration.
     *
     * @example
     * ```ts
     * const organizationComplianceSettings =
     *   await client.organization.complianceSettings.retrieve();
     * ```
     */
    retrieve(options) {
        return this._client.get('/v1/organizations/compliance_settings', options);
    }
    /**
     * Update your organization's Compliance Settings.
     *
     * Setting `state` to `enabled` turns on the Compliance API and begins capturing
     * organization activity events. Setting it to `disabled` turns both off. `state`
     * reflects whether the Compliance API is enabled.
     *
     * A request that sets `state` to its current value succeeds and leaves the
     * resource unchanged. A `disabled` request stays in effect until a later `enabled`
     * request or the organization's next provisioning action that enables Access
     * Transparency: enabling Access Transparency also enables the Compliance API,
     * which serves its activity events, so such provisioning (including re-runs)
     * re-enables the Compliance API even after a `disabled` request. Automated
     * provisioning never disables compliance settings.
     *
     * @example
     * ```ts
     * const organizationComplianceSettings =
     *   await client.organization.complianceSettings.update({
     *     state: { type: 'enabled' },
     *   });
     * ```
     */
    update(body, options) {
        return this._client.post('/v1/organizations/compliance_settings', { body, ...options });
    }
}

class ExternalKeys extends APIResource {
    /**
     * Create an external key config owned by the caller's organization.
     *
     * @example
     * ```ts
     * const externalKey =
     *   await client.organization.externalKeys.create({
     *     provider_config: {
     *       kms_arn:
     *         'arn:aws:kms:us-east-1:111122223333:key/abcd1234-5678-90ab-cdef-000011112222',
     *       type: 'aws',
     *     },
     *   });
     * ```
     */
    create(body, options) {
        return this._client.post('/v1/organizations/external_keys', { body, ...options });
    }
    /**
     * Retrieve a single external key config in the caller's organization by ID.
     *
     * @example
     * ```ts
     * const externalKey =
     *   await client.organization.externalKeys.retrieve(
     *     'external_key_id',
     *   );
     * ```
     */
    retrieve(externalKeyID, options) {
        return this._client.get(path `/v1/organizations/external_keys/${externalKeyID}`, options);
    }
    /**
     * Partially update an external key config. Omitted fields are left unchanged.
     *
     * `display_name` is always editable. `geo` and `provider_config` cannot be changed
     * once any workspace references this config, because previously encrypted data
     * requires the original key identity to decrypt.
     *
     * @example
     * ```ts
     * const externalKey =
     *   await client.organization.externalKeys.update(
     *     'external_key_id',
     *   );
     * ```
     */
    update(externalKeyID, body, options) {
        return this._client.post(path `/v1/organizations/external_keys/${externalKeyID}`, { body, ...options });
    }
    /**
     * List external key configs in the caller's organization.
     *
     * Results are ordered by creation time (newest first). Use the `next_page` cursor
     * from the response to fetch subsequent pages.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const externalKey of client.organization.externalKeys.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/external_keys', (PageCursor), {
            query,
            ...options,
        });
    }
    /**
     * Delete an external key config.
     *
     * The request is rejected if any workspace still references this config.
     *
     * @example
     * ```ts
     * const externalKey =
     *   await client.organization.externalKeys.delete(
     *     'external_key_id',
     *   );
     * ```
     */
    delete(externalKeyID, options) {
        return this._client.delete(path `/v1/organizations/external_keys/${externalKeyID}`, options);
    }
    /**
     * Validate an external key config against the customer's KMS.
     *
     * Anthropic performs an encrypt/decrypt roundtrip against the configured KMS key
     * and waits up to 30 seconds for the result. The response status is `success` if
     * the roundtrip succeeded, or `failure` with an error message if it failed or
     * timed out.
     *
     * @example
     * ```ts
     * const response =
     *   await client.organization.externalKeys.validate(
     *     'external_key_id',
     *   );
     * ```
     */
    validate(externalKeyID, options) {
        return this._client.post(path `/v1/organizations/external_keys/${externalKeyID}/validate`, options);
    }
}

class Invites extends APIResource {
    /**
     * Invite a user to join the organization by email.
     *
     * On plans that draw members from a finite pool of purchased seats, the invite
     * automatically consumes a seat from the lowest tier with availability; there is
     * no seat-tier parameter. When no seat is free the request fails with a 400 error
     * rather than purchasing a seat.
     *
     * @example
     * ```ts
     * const organizationInvite =
     *   await client.organization.invites.create({
     *     email: 'user@emaildomain.com',
     *     role: 'user',
     *   });
     * ```
     */
    create(body, options) {
        return this._client.post('/v1/organizations/invites', { body, ...options });
    }
    /**
     * Retrieve an invite by ID.
     *
     * @example
     * ```ts
     * const organizationInvite =
     *   await client.organization.invites.retrieve('invite_id');
     * ```
     */
    retrieve(inviteID, options) {
        return this._client.get(path `/v1/organizations/invites/${inviteID}`, options);
    }
    /**
     * List the organization's invites.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const organizationInvite of client.organization.invites.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/invites', (Page), {
            query,
            ...options,
        });
    }
    /**
     * Delete a pending invite.
     *
     * @example
     * ```ts
     * const invite = await client.organization.invites.delete(
     *   'invite_id',
     * );
     * ```
     */
    delete(inviteID, options) {
        return this._client.delete(path `/v1/organizations/invites/${inviteID}`, options);
    }
}

let RateLimits$1 = class RateLimits extends APIResource {
    /**
     * List Messages API rate limits for your organization.
     *
     * Each entry corresponds to one rate-limit group (either a model family or an
     * API-surface category such as the Message Batches API or the web search tool) and
     * contains the set of limiter values that apply to it.
     *
     * When `limit` is omitted, every matching entry is returned in a single page; when
     * `limit` truncates the result, follow `next_page` to fetch the remaining entries.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const organizationRateLimit of client.organization.rateLimits.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/rate_limits', (PageCursor), {
            query,
            ...options,
        });
    }
};

class Users extends APIResource {
    /**
     * Retrieve a member of the organization by user ID.
     *
     * @example
     * ```ts
     * const organizationUser =
     *   await client.organization.users.retrieve('user_id');
     * ```
     */
    retrieve(userID, options) {
        return this._client.get(path `/v1/organizations/users/${userID}`, options);
    }
    /**
     * Update a member's organization role.
     *
     * @example
     * ```ts
     * const organizationUser =
     *   await client.organization.users.update('user_id', {
     *     role: 'user',
     *   });
     * ```
     */
    update(userID, body, options) {
        return this._client.post(path `/v1/organizations/users/${userID}`, { body, ...options });
    }
    /**
     * List the organization's members.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const organizationUser of client.organization.users.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/users', (Page), { query, ...options });
    }
    /**
     * Remove a member from the organization.
     *
     * @example
     * ```ts
     * const user = await client.organization.users.remove(
     *   'user_id',
     * );
     * ```
     */
    remove(userID, options) {
        return this._client.delete(path `/v1/organizations/users/${userID}`, options);
    }
}

class Issuers extends APIResource {
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Register an OIDC issuer that Anthropic will trust for workload identity
     * federation in your organization.
     *
     * The `jwks` field controls how the issuer's signing keys are obtained and takes
     * one of three shapes selected by `type`: `discovery` (resolve keys through OIDC
     * discovery), `explicit_url` (fetch keys from a fixed JWKS URL), or `inline`
     * (provide a static key set). When `jwks.type` is `discovery` and no
     * `discovery_base` is set, the issuer URL must be publicly reachable over HTTPS so
     * Anthropic can fetch the discovery document; for `explicit_url` and `inline`
     * modes the issuer URL is only matched as the JWT's `iss` claim and is not
     * fetched.
     *
     * @example
     * ```ts
     * const federationIssuer =
     *   await client.organization.federation.issuers.create({
     *     issuer_url: 'x',
     *     name: 'x',
     *   });
     * ```
     */
    create(body, options) {
        return this._client.post('/v1/organizations/federation_issuers', { body, ...options });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Retrieve a federation issuer by its ID (`fdis_...`).
     *
     * @example
     * ```ts
     * const federationIssuer =
     *   await client.organization.federation.issuers.retrieve(
     *     'federation_issuer_id',
     *   );
     * ```
     */
    retrieve(federationIssuerID, options) {
        return this._client.get(path `/v1/organizations/federation_issuers/${federationIssuerID}`, options);
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Partially update a federation issuer.
     *
     * Setting `jwks` replaces the full JWKS shape at once. Archived issuers cannot be
     * updated; this returns 400. Create a new issuer instead.
     *
     * Updating an issuer that backs a rule with a scope outside `workspace:developer`
     * or `workspace:inference` requires a Console session.
     *
     * @example
     * ```ts
     * const federationIssuer =
     *   await client.organization.federation.issuers.update(
     *     'federation_issuer_id',
     *   );
     * ```
     */
    update(federationIssuerID, body, options) {
        return this._client.post(path `/v1/organizations/federation_issuers/${federationIssuerID}`, {
            body,
            ...options,
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * List federation issuers in your organization.
     *
     * Archived issuers are excluded unless `include_archived=true`.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const federationIssuer of client.organization.federation.issuers.list()) {
     *   // ...
     * }
     * ```
     */
    list(query = {}, options) {
        return this._client.getAPIList('/v1/organizations/federation_issuers', (PageCursor), {
            query,
            ...options,
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Archive a federation issuer.
     *
     * Idempotent; re-archiving returns the issuer with its original `archived_at`.
     * Rejected with 400 if any live (non-archived) federation rule still references
     * the issuer; archive those rules first (a rule's issuer cannot be changed), or
     * recreate them against another issuer.
     *
     * @example
     * ```ts
     * const federationIssuer =
     *   await client.organization.federation.issuers.archive(
     *     'federation_issuer_id',
     *   );
     * ```
     */
    archive(federationIssuerID, options) {
        return this._client.post(path `/v1/organizations/federation_issuers/${federationIssuerID}/archive`, options);
    }
}

let Workspaces$2 = class Workspaces extends APIResource {
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * List workspaces where this federation rule is enabled.
     *
     * Returns all workspace enablements in a single response; the `limit` and `page`
     * parameters are accepted but have no effect, and `next_page` is always `null`.
     * Returns explicit per-workspace enablements only; for rules with
     * `applies_to_all_workspaces` or a legacy single `workspace_id`, check those
     * fields on the rule itself.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const federationRuleWorkspace of client.organization.federation.rules.workspaces.list(
     *   'federation_rule_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(federationRuleID, query = {}, options) {
        return this._client.getAPIList(path `/v1/organizations/federation_rules/${federationRuleID}/workspaces`, (PageCursor), { query, ...options });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Enable a federation rule for a workspace.
     *
     * Idempotent; re-enabling returns the existing enablement. The rule and workspace
     * must both belong to your organization. Membership of the rule's target service
     * account in this workspace is not checked at enablement: token exchange into this
     * workspace is rejected unless the target is a member (it is implicitly a member
     * of the default workspace). Archived rules are rejected with 400. OAuth callers
     * may only manage rules whose `oauth_scope` is `workspace:developer` or
     * `workspace:inference`; other scopes require a Console session.
     *
     * @example
     * ```ts
     * const federationRuleWorkspace =
     *   await client.organization.federation.rules.workspaces.add(
     *     'federation_rule_id',
     *     { workspace_id: 'workspace_id' },
     *   );
     * ```
     */
    add(federationRuleID, body, options) {
        return this._client.post(path `/v1/organizations/federation_rules/${federationRuleID}/workspaces`, {
            body,
            ...options,
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Disable a federation rule for a workspace.
     *
     * Idempotent; succeeds even if the enablement was already removed. OAuth callers
     * may only manage rules whose `oauth_scope` is `workspace:developer` or
     * `workspace:inference`; other scopes require a Console session.
     *
     * @example
     * ```ts
     * const workspace =
     *   await client.organization.federation.rules.workspaces.remove(
     *     'workspace_id',
     *     { federation_rule_id: 'federation_rule_id' },
     *   );
     * ```
     */
    remove(workspaceID, params, options) {
        const { federation_rule_id } = params;
        return this._client.delete(path `/v1/organizations/federation_rules/${federation_rule_id}/workspaces/${workspaceID}`, options);
    }
};

var Rules = /* @__PURE__ */ (() => {
    class Rules extends APIResource {
        constructor() {
            super(...arguments);
            this.workspaces = new Workspaces$2(this._client);
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Create a federation rule owned by your organization.
         *
         * The referenced issuer and the target service account must already exist in the
         * same organization; invalid references are rejected with a 400 error. The
         * workspace reference is validated. Membership is not checked at rule creation:
         * token exchange resolves a single enabled workspace per call and is rejected
         * unless the target service account is a member of that workspace (it is
         * implicitly a member of the default workspace). Rules on well-known shared
         * issuers (GitHub Actions, GitLab, Buildkite, Terraform Cloud, Google) must
         * constrain tenant identity via an identity-bearing claim, a tenant-pinning
         * subject prefix (such as `repo:YOUR_ORG/...`), or a CEL condition referencing one
         * of those identity claims (e.g. `claims.repository_owner`). OAuth callers may
         * only manage rules whose `oauth_scope` is `workspace:developer` or
         * `workspace:inference`; other scopes require a Console session.
         *
         * @example
         * ```ts
         * const federationRule =
         *   await client.organization.federation.rules.create({
         *     issuer_id: 'issuer_id',
         *     match: {},
         *     name: 'x',
         *     oauth_scope: 'x',
         *     target: {
         *       service_account_id: 'svac_01SDCCSbTxrXDpWc1phhtcfK',
         *       type: 'service_account',
         *     },
         *   });
         * ```
         */
        create(body, options) {
            return this._client.post('/v1/organizations/federation_rules', { body, ...options });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Retrieve a federation rule by its ID (`fdrl_...`).
         *
         * @example
         * ```ts
         * const federationRule =
         *   await client.organization.federation.rules.retrieve(
         *     'federation_rule_id',
         *   );
         * ```
         */
        retrieve(federationRuleID, options) {
            return this._client.get(path `/v1/organizations/federation_rules/${federationRuleID}`, options);
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Partially update a federation rule.
         *
         * `issuer_id` is immutable. `match` and `target` are replaced as whole objects
         * when set. Referenced service accounts and workspaces must exist in your
         * organization; invalid references are rejected with a 400 error. Archived rules
         * cannot be updated; this returns 400. Create a new rule instead. Rules on
         * well-known shared issuers (GitHub Actions, GitLab, Buildkite, Terraform Cloud,
         * Google) must constrain tenant identity via an identity-bearing claim, a
         * tenant-pinning subject prefix (such as `repo:YOUR_ORG/...`), or a CEL condition
         * referencing one of those identity claims (e.g. `claims.repository_owner`). On
         * these issuers the requirement is re-checked on every update; if an existing
         * rule's stored match does not yet constrain tenant identity, any update (even a
         * rename or description change) must also supply a conforming `match` in the same
         * request. OAuth callers may only manage rules whose `oauth_scope` is
         * `workspace:developer` or `workspace:inference`; other scopes require a Console
         * session.
         *
         * @example
         * ```ts
         * const federationRule =
         *   await client.organization.federation.rules.update(
         *     'federation_rule_id',
         *   );
         * ```
         */
        update(federationRuleID, body, options) {
            return this._client.post(path `/v1/organizations/federation_rules/${federationRuleID}`, {
                body,
                ...options,
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * List federation rules in your organization.
         *
         * Optionally filter by issuer with `issuer_id`. Archived rules are excluded unless
         * `include_archived=true`.
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const federationRule of client.organization.federation.rules.list()) {
         *   // ...
         * }
         * ```
         */
        list(query = {}, options) {
            return this._client.getAPIList('/v1/organizations/federation_rules', (PageCursor), {
                query,
                ...options,
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Archive a federation rule.
         *
         * Token exchange through this rule stops immediately. Idempotent; re-archiving
         * returns the rule with its original `archived_at`. Archiving clears the rule's
         * workspace targeting (`workspace_id` and `workspace_ids` are emptied). Tokens
         * already minted before archive remain valid until they expire. OAuth callers may
         * only manage rules whose `oauth_scope` is `workspace:developer` or
         * `workspace:inference`; other scopes require a Console session.
         *
         * @example
         * ```ts
         * const federationRule =
         *   await client.organization.federation.rules.archive(
         *     'federation_rule_id',
         *   );
         * ```
         */
        archive(federationRuleID, options) {
            return this._client.post(path `/v1/organizations/federation_rules/${federationRuleID}/archive`, options);
        }
    }
    Rules.Workspaces = Workspaces$2;
    return Rules;
})();

var Federation = /* @__PURE__ */ (() => {
    class Federation extends APIResource {
        constructor() {
            super(...arguments);
            this.issuers = new Issuers(this._client);
            this.rules = new Rules(this._client);
        }
    }
    Federation.Issuers = Issuers;
    Federation.Rules = Rules;
    return Federation;
})();

let Workspaces$1 = class Workspaces extends APIResource {
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * List the workspaces a service account is a member of.
     *
     * Each entry includes the service account's `workspace_role` in that workspace.
     * Use `limit` and the `next_page` cursor to paginate. When the service account has
     * no explicit default-workspace membership, the implicit (`implicit: true`)
     * membership is returned as the first entry on the first page; with `limit=1` the
     * first page may return up to 2 entries (the implicit entry plus one explicit
     * membership) so a pagination cursor can be derived. Memberships are returned only
     * while the service account is active. Without a `page` cursor, an archived
     * service account returns an empty list. A `page` cursor that does not match an
     * active membership returns a 400 invalid-request error. A cursor stops matching
     * when the membership is removed, the workspace is deleted, or the service account
     * is archived. Restart pagination from the first page to recover.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const serviceAccountWorkspaceMember of client.organization.serviceAccounts.workspaces.list(
     *   'service_account_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(serviceAccountID, query = {}, options) {
        return this._client.getAPIList(path `/v1/organizations/service_accounts/${serviceAccountID}/workspaces`, (PageCursor), { query, ...options });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Add a service account to a workspace with the given `workspace_role`.
     *
     * Mirror of `POST /workspaces/{workspace_id}/service_accounts`, addressed from the
     * service-account side; both create the same membership. If the service account is
     * already an explicit member of the workspace, its `workspace_role` is replaced
     * with the value supplied here. Archived workspaces return 400. Archived service
     * accounts cannot be added and are rejected.
     *
     * @example
     * ```ts
     * const serviceAccountWorkspaceMember =
     *   await client.organization.serviceAccounts.workspaces.add(
     *     'service_account_id',
     *     {
     *       workspace_id: 'workspace_id',
     *       workspace_role: 'workspace_admin',
     *     },
     *   );
     * ```
     */
    add(serviceAccountID, body, options) {
        return this._client.post(path `/v1/organizations/service_accounts/${serviceAccountID}/workspaces`, {
            body,
            ...options,
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Remove a service account from a workspace.
     *
     * Mirror of
     * `DELETE /workspaces/{workspace_id}/service_accounts/{service_account_id}`,
     * addressed from the service-account side. Removal is idempotent (returns 200 even
     * if the membership was already removed). A DELETE against the implicit
     * default-workspace membership returns 200 but is a no-op and the membership
     * persists; deleting an explicit default-workspace row reverts to the implicit
     * `workspace_user` membership. Archived workspaces return 400.
     *
     * @example
     * ```ts
     * const workspace =
     *   await client.organization.serviceAccounts.workspaces.remove(
     *     'workspace_id',
     *     { service_account_id: 'service_account_id' },
     *   );
     * ```
     */
    remove(workspaceID, params, options) {
        const { service_account_id } = params;
        return this._client.delete(path `/v1/organizations/service_accounts/${service_account_id}/workspaces/${workspaceID}`, options);
    }
};

var ServiceAccounts$1 = /* @__PURE__ */ (() => {
    class ServiceAccounts extends APIResource {
        constructor() {
            super(...arguments);
            this.workspaces = new Workspaces$1(this._client);
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Create a service account.
         *
         * A service account is a named workload identity that federation rules target.
         * `organization_role` is `developer` (default) or `admin`; a rule may only be
         * created or retargeted to grant `org:admin` scope when the target's
         * `organization_role` is `admin`. Creating an `admin`-role service account
         * requires an interactive credential (a user OAuth token or a Console session) — a
         * workload may only create `developer`-role service accounts.
         *
         * @example
         * ```ts
         * const serviceAccount =
         *   await client.organization.serviceAccounts.create({
         *     name: 'ci-deploy-bot',
         *   });
         * ```
         */
        create(body, options) {
            return this._client.post('/v1/organizations/service_accounts', { body, ...options });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Retrieve a service account by its ID (`svac_...`).
         *
         * @example
         * ```ts
         * const serviceAccount =
         *   await client.organization.serviceAccounts.retrieve(
         *     'service_account_id',
         *   );
         * ```
         */
        retrieve(serviceAccountID, options) {
            return this._client.get(path `/v1/organizations/service_accounts/${serviceAccountID}`, options);
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Update a service account.
         *
         * Only `description` and `organization_role` are mutable; `name` cannot be
         * changed. Archived service accounts cannot be updated; this returns 400. Setting
         * `organization_role` to `admin` (even when unchanged) requires an interactive
         * credential (a user OAuth token or a Console session).
         *
         * @example
         * ```ts
         * const serviceAccount =
         *   await client.organization.serviceAccounts.update(
         *     'service_account_id',
         *   );
         * ```
         */
        update(serviceAccountID, body, options) {
            return this._client.post(path `/v1/organizations/service_accounts/${serviceAccountID}`, {
                body,
                ...options,
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * List service accounts in the caller's organization.
         *
         * Results are ordered by creation time, newest first. Use `limit` and the
         * `next_page` cursor to paginate; set `include_archived=true` to include archived
         * service accounts.
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const serviceAccount of client.organization.serviceAccounts.list()) {
         *   // ...
         * }
         * ```
         */
        list(query = {}, options) {
            return this._client.getAPIList('/v1/organizations/service_accounts', (PageCursor), {
                query,
                ...options,
            });
        }
        /**
         * **Requires an OAuth access token with the `org:admin` scope**, from
         * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
         * API keys are not accepted. See
         * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
         *
         * Archive a service account.
         *
         * Idempotent; re-archiving returns the service account with its original
         * `archived_at`. Rejected with 400 if any live (non-archived) federation rule
         * still targets this service account, same as issuer archival; archive those rules
         * first or change their target to another service account.
         *
         * @example
         * ```ts
         * const serviceAccount =
         *   await client.organization.serviceAccounts.archive(
         *     'service_account_id',
         *   );
         * ```
         */
        archive(serviceAccountID, options) {
            return this._client.post(path `/v1/organizations/service_accounts/${serviceAccountID}/archive`, options);
        }
    }
    ServiceAccounts.Workspaces = Workspaces$1;
    return ServiceAccounts;
})();

class Members extends APIResource {
    /**
     * Get Workspace Member
     *
     * @example
     * ```ts
     * const workspaceMember =
     *   await client.organization.workspaces.members.retrieve(
     *     'user_id',
     *     { workspace_id: 'workspace_id' },
     *   );
     * ```
     */
    retrieve(userID, params, options) {
        const { workspace_id } = params;
        return this._client.get(path `/v1/organizations/workspaces/${workspace_id}/members/${userID}`, options);
    }
    /**
     * Update Workspace Member
     *
     * @example
     * ```ts
     * const workspaceMember =
     *   await client.organization.workspaces.members.update(
     *     'user_id',
     *     {
     *       workspace_id: 'workspace_id',
     *       workspace_role: 'workspace_admin',
     *     },
     *   );
     * ```
     */
    update(userID, params, options) {
        const { workspace_id, ...body } = params;
        return this._client.post(path `/v1/organizations/workspaces/${workspace_id}/members/${userID}`, {
            body,
            ...options,
        });
    }
    /**
     * List Workspace Members
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const workspaceMember of client.organization.workspaces.members.list(
     *   'workspace_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(workspaceID, query = {}, options) {
        return this._client.getAPIList(path `/v1/organizations/workspaces/${workspaceID}/members`, (Page), { query, ...options });
    }
    /**
     * Create Workspace Member
     *
     * @example
     * ```ts
     * const workspaceMember =
     *   await client.organization.workspaces.members.add(
     *     'workspace_id',
     *     {
     *       user_id: 'user_01WCz1FkmYMm4gnmykNKUu3Q',
     *       workspace_role: 'workspace_admin',
     *     },
     *   );
     * ```
     */
    add(workspaceID, body, options) {
        return this._client.post(path `/v1/organizations/workspaces/${workspaceID}/members`, { body, ...options });
    }
    /**
     * Delete Workspace Member
     *
     * @example
     * ```ts
     * const member =
     *   await client.organization.workspaces.members.remove(
     *     'user_id',
     *     { workspace_id: 'workspace_id' },
     *   );
     * ```
     */
    remove(userID, params, options) {
        const { workspace_id } = params;
        return this._client.delete(path `/v1/organizations/workspaces/${workspace_id}/members/${userID}`, options);
    }
}

class RateLimits extends APIResource {
    /**
     * List a workspace's rate limits.
     *
     * By default, returns only the groups and limiter types that have a
     * workspace-level override. With `include_inherited=true`, returns every group
     * with organization-level limits the workspace can see, listing for each the
     * values it inherits from the organization as well as its own overrides. Each
     * value's `source` says which it is.
     *
     * When `limit` is omitted, every matching entry is returned in a single page; when
     * `limit` truncates the result, follow `next_page` to fetch the remaining entries.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const workspaceRateLimit of client.organization.workspaces.rateLimits.list(
     *   'workspace_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(workspaceID, query = {}, options) {
        return this._client.getAPIList(path `/v1/organizations/workspaces/${workspaceID}/rate_limits`, (PageCursor), { query, ...options });
    }
}

class ServiceAccounts extends APIResource {
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Retrieve a service account's membership in a workspace.
     *
     * Returns the membership record, including the service account's `workspace_role`
     * in this workspace. Archived workspaces return 400. For the default workspace,
     * returns the implicit (`implicit: true`) membership when no explicit membership
     * exists; an explicitly added membership is returned with its assigned role. An
     * archived service account returns 404.
     *
     * @example
     * ```ts
     * const serviceAccountWorkspaceMember =
     *   await client.organization.workspaces.serviceAccounts.retrieve(
     *     'service_account_id',
     *     { workspace_id: 'workspace_id' },
     *   );
     * ```
     */
    retrieve(serviceAccountID, params, options) {
        const { workspace_id } = params;
        return this._client.get(path `/v1/organizations/workspaces/${workspace_id}/service_accounts/${serviceAccountID}`, options);
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Change a service account's role in a workspace.
     *
     * The new `workspace_role` replaces the current one. Only explicit memberships can
     * be updated; to set a role on the implicit default-workspace membership, add the
     * service account explicitly with
     * `POST /workspaces/{workspace_id}/service_accounts`. Archived workspaces
     * return 400. Archived service accounts cannot be updated and are rejected.
     *
     * @example
     * ```ts
     * const serviceAccountWorkspaceMember =
     *   await client.organization.workspaces.serviceAccounts.update(
     *     'service_account_id',
     *     {
     *       workspace_id: 'workspace_id',
     *       workspace_role: 'workspace_admin',
     *     },
     *   );
     * ```
     */
    update(serviceAccountID, params, options) {
        const { workspace_id, ...body } = params;
        return this._client.post(path `/v1/organizations/workspaces/${workspace_id}/service_accounts/${serviceAccountID}`, { body, ...options });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * List the service accounts that are members of a workspace.
     *
     * Each entry includes the service account's `workspace_role`. Use `limit` and the
     * `next_page` cursor to paginate. Archived workspaces return 400; use
     * `GET /service_accounts/{id}/workspaces` to audit memberships of an archived
     * workspace. The implicit default-workspace membership is not included in this
     * list. Memberships of archived service accounts are omitted from the results.
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const serviceAccountWorkspaceMember of client.organization.workspaces.serviceAccounts.list(
     *   'workspace_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(workspaceID, query = {}, options) {
        return this._client.getAPIList(path `/v1/organizations/workspaces/${workspaceID}/service_accounts`, (PageCursor), { query, ...options });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Add a service account to a workspace with the given `workspace_role`.
     *
     * The role determines what the service account can do in the workspace and which
     * workspace-scoped permissions it can be granted when authenticating through
     * federation. Every service account is already an implicit `workspace_user` member
     * of the default workspace; adding it explicitly assigns a chosen role. If the
     * service account is already an explicit member of the workspace, its
     * `workspace_role` is replaced with the value supplied here. Archived workspaces
     * return 400. Archived service accounts cannot be added and are rejected.
     *
     * @example
     * ```ts
     * const serviceAccountWorkspaceMember =
     *   await client.organization.workspaces.serviceAccounts.add(
     *     'workspace_id',
     *     {
     *       service_account_id: 'service_account_id',
     *       workspace_role: 'workspace_admin',
     *     },
     *   );
     * ```
     */
    add(workspaceID, body, options) {
        return this._client.post(path `/v1/organizations/workspaces/${workspaceID}/service_accounts`, {
            body,
            ...options,
        });
    }
    /**
     * **Requires an OAuth access token with the `org:admin` scope**, from
     * `ant auth login --scope org:admin` or a workload identity federation rule; Admin
     * API keys are not accepted. See
     * [Manage WIF with the Admin API](/docs/en/manage-claude/wif-admin-api).
     *
     * Remove a service account from a workspace.
     *
     * Removal is idempotent (returns 200 even if the membership was already removed).
     * A DELETE against the implicit default-workspace membership returns 200 but is a
     * no-op and the membership persists; deleting an explicit default-workspace row
     * reverts to the implicit `workspace_user` membership. Archived workspaces
     * return 400.
     *
     * @example
     * ```ts
     * const serviceAccount =
     *   await client.organization.workspaces.serviceAccounts.remove(
     *     'service_account_id',
     *     { workspace_id: 'workspace_id' },
     *   );
     * ```
     */
    remove(serviceAccountID, params, options) {
        const { workspace_id } = params;
        return this._client.delete(path `/v1/organizations/workspaces/${workspace_id}/service_accounts/${serviceAccountID}`, options);
    }
}

var Workspaces = /* @__PURE__ */ (() => {
    class Workspaces extends APIResource {
        constructor() {
            super(...arguments);
            this.rateLimits = new RateLimits(this._client);
            this.members = new Members(this._client);
            this.serviceAccounts = new ServiceAccounts(this._client);
        }
        /**
         * Create Workspace
         *
         * @example
         * ```ts
         * const workspace =
         *   await client.organization.workspaces.create({
         *     name: 'x',
         *   });
         * ```
         */
        create(body, options) {
            return this._client.post('/v1/organizations/workspaces', { body, ...options });
        }
        /**
         * Get Workspace
         *
         * @example
         * ```ts
         * const workspace =
         *   await client.organization.workspaces.retrieve(
         *     'workspace_id',
         *   );
         * ```
         */
        retrieve(workspaceID, options) {
            return this._client.get(path `/v1/organizations/workspaces/${workspaceID}`, options);
        }
        /**
         * Update Workspace
         *
         * @example
         * ```ts
         * const workspace =
         *   await client.organization.workspaces.update(
         *     'workspace_id',
         *   );
         * ```
         */
        update(workspaceID, body, options) {
            return this._client.post(path `/v1/organizations/workspaces/${workspaceID}`, { body, ...options });
        }
        /**
         * List Workspaces
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const workspace of client.organization.workspaces.list()) {
         *   // ...
         * }
         * ```
         */
        list(query = {}, options) {
            return this._client.getAPIList('/v1/organizations/workspaces', (Page), { query, ...options });
        }
        /**
         * Archive Workspace
         *
         * @example
         * ```ts
         * const workspace =
         *   await client.organization.workspaces.archive(
         *     'workspace_id',
         *   );
         * ```
         */
        archive(workspaceID, options) {
            return this._client.post(path `/v1/organizations/workspaces/${workspaceID}/archive`, options);
        }
    }
    Workspaces.RateLimits = RateLimits;
    Workspaces.Members = Members;
    Workspaces.ServiceAccounts = ServiceAccounts;
    return Workspaces;
})();

var Organization = /* @__PURE__ */ (() => {
    class Organization extends APIResource {
        constructor() {
            super(...arguments);
            this.apiKeys = new APIKeys(this._client);
            this.externalKeys = new ExternalKeys(this._client);
            this.federation = new Federation(this._client);
            this.invites = new Invites(this._client);
            this.serviceAccounts = new ServiceAccounts$1(this._client);
            this.users = new Users(this._client);
            this.workspaces = new Workspaces(this._client);
            this.rateLimits = new RateLimits$1(this._client);
            this.complianceSettings = new ComplianceSettings(this._client);
        }
        /**
         * Retrieve information about the organization associated with the authenticated
         * API key.
         *
         * @example
         * ```ts
         * const organizationInfo =
         *   await client.organization.retrieve();
         * ```
         */
        retrieve(options) {
            return this._client.get('/v1/organizations/me', options);
        }
    }
    Organization.APIKeys = APIKeys;
    Organization.ExternalKeys = ExternalKeys;
    Organization.Federation = Federation;
    Organization.Invites = Invites;
    Organization.ServiceAccounts = ServiceAccounts$1;
    Organization.Users = Users;
    Organization.Workspaces = Workspaces;
    Organization.RateLimits = RateLimits$1;
    Organization.ComplianceSettings = ComplianceSettings;
    return Organization;
})();

class Versions extends APIResource {
    /**
     * Create Skill Version
     *
     * @example
     * ```ts
     * const skillVersion = await client.skills.versions.create(
     *   'skill_id',
     *   { files: [fs.createReadStream('path/to/file')] },
     * );
     * ```
     */
    create(skillID, params, options) {
        const { workspace_id, ...body } = params;
        return this._client.post(path `/v1/skills/${skillID}/versions`, multipartFormRequestOptions({
            body,
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                options?.headers,
            ]),
        }, this._client, false));
    }
    /**
     * Get Skill Version
     *
     * @example
     * ```ts
     * const skillVersion = await client.skills.versions.retrieve(
     *   'version',
     *   { skill_id: 'skill_id' },
     * );
     * ```
     */
    retrieve(version, params, options) {
        const { skill_id, workspace_id } = params;
        return this._client.get(path `/v1/skills/${skill_id}/versions/${version}`, {
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * List Skill Versions
     *
     * @example
     * ```ts
     * // Automatically fetches more pages as needed.
     * for await (const skillVersion of client.skills.versions.list(
     *   'skill_id',
     * )) {
     *   // ...
     * }
     * ```
     */
    list(skillID, params = {}, options) {
        const { workspace_id, ...query } = params ?? {};
        return this._client.getAPIList(path `/v1/skills/${skillID}/versions`, (PageCursor), {
            query,
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                options?.headers,
            ]),
        });
    }
    /**
     * Delete Skill Version
     *
     * @example
     * ```ts
     * const deletedSkillVersion =
     *   await client.skills.versions.delete('version', {
     *     skill_id: 'skill_id',
     *   });
     * ```
     */
    delete(version, params, options) {
        const { skill_id, workspace_id } = params;
        return this._client.delete(path `/v1/skills/${skill_id}/versions/${version}`, {
            ...options,
            headers: buildHeaders([
                { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                options?.headers,
            ]),
        });
    }
}

var Skills = /* @__PURE__ */ (() => {
    class Skills extends APIResource {
        constructor() {
            super(...arguments);
            this.versions = new Versions(this._client);
        }
        /**
         * Create Skill
         *
         * @example
         * ```ts
         * const skill = await client.skills.create({
         *   files: [fs.createReadStream('path/to/file')],
         * });
         * ```
         */
        create(params, options) {
            const { workspace_id, ...body } = params;
            return this._client.post('/v1/skills', multipartFormRequestOptions({
                body,
                ...options,
                headers: buildHeaders([
                    { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                    options?.headers,
                ]),
            }, this._client, false));
        }
        /**
         * Get Skill
         *
         * @example
         * ```ts
         * const skill = await client.skills.retrieve('skill_id');
         * ```
         */
        retrieve(skillID, params = {}, options) {
            const { workspace_id } = params ?? {};
            return this._client.get(path `/v1/skills/${skillID}`, {
                ...options,
                headers: buildHeaders([
                    { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                    options?.headers,
                ]),
            });
        }
        /**
         * List Skills
         *
         * @example
         * ```ts
         * // Automatically fetches more pages as needed.
         * for await (const skill of client.skills.list()) {
         *   // ...
         * }
         * ```
         */
        list(params = {}, options) {
            const { workspace_id, ...query } = params ?? {};
            return this._client.getAPIList('/v1/skills', (PageCursor), {
                query,
                ...options,
                headers: buildHeaders([
                    { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                    options?.headers,
                ]),
            });
        }
        /**
         * Delete Skill
         *
         * @example
         * ```ts
         * const deletedSkill = await client.skills.delete('skill_id');
         * ```
         */
        delete(skillID, params = {}, options) {
            const { workspace_id } = params ?? {};
            return this._client.delete(path `/v1/skills/${skillID}`, {
                ...options,
                headers: buildHeaders([
                    { ...(workspace_id != null ? { 'anthropic-workspace-id': workspace_id } : undefined) },
                    options?.headers,
                ]),
            });
        }
    }
    Skills.Versions = Versions;
    return Skills;
})();

var _BaseAnthropic_instances, _a, _BaseAnthropic_encoder, _BaseAnthropic_baseURLOverridden;
const HUMAN_PROMPT = "\\n\\nHuman:";
const AI_PROMPT = "\\n\\nAssistant:";
var BaseAnthropic = /* @__PURE__ */ (() => {
  class BaseAnthropic2 {
    /**
     * The active credential provider. Default credential resolution runs once
     * at construction time. If it fails, the error is surfaced on every
     * request and the client must be reconstructed — there is no retry path.
     *
     * Clones returned by {@link withOptions} share the parent's auth state
     * (provider, token cache, pending resolution, and any resolution error)
     * unless the caller passes an explicit `apiKey`, `authToken`,
     * `credentials`, `config`, or `profile` override.
     */
    get credentials() {
      return this._authState.provider;
    }
    /**
     * API Client for interfacing with the Anthropic API.
     *
     * @param {string | null | undefined} [opts.apiKey=process.env['ANTHROPIC_API_KEY'] ?? null]
     * @param {string | null | undefined} [opts.authToken=process.env['ANTHROPIC_AUTH_TOKEN'] ?? null]
     * @param {string | null | undefined} [opts.webhookKey=process.env['ANTHROPIC_WEBHOOK_SIGNING_KEY'] ?? null]
     * @param {string} [opts.baseURL=process.env['ANTHROPIC_BASE_URL'] ?? https://api.anthropic.com] - Override the default base URL for the API.
     * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
     * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
     * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
     * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
     * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
     * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
     * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
     */
    constructor({ baseURL = readEnv("ANTHROPIC_BASE_URL"), apiKey, authToken, webhookKey = readEnv("ANTHROPIC_WEBHOOK_SIGNING_KEY") ?? null, ...opts } = {}) {
      _BaseAnthropic_instances.add(this);
      this._requestAuthFlags = /* @__PURE__ */ new WeakMap();
      _BaseAnthropic_encoder.set(this, void 0);
      if (apiKey === void 0) {
        apiKey = opts.profile != null ? null : readEnv("ANTHROPIC_API_KEY") ?? null;
      }
      if (authToken === void 0) {
        authToken = opts.profile != null ? null : readEnv("ANTHROPIC_AUTH_TOKEN") ?? null;
      }
      if (opts.profile != null && (opts.credentials != null || opts.config != null)) {
        throw new TypeError("Pass at most one of `profile`, `credentials`, or `config`.");
      }
      const options = {
        apiKey,
        authToken,
        webhookKey,
        ...opts,
        baseURL: baseURL || `https://api.anthropic.com`
      };
      if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
        throw new AnthropicError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew Anthropic({ apiKey, dangerouslyAllowBrowser: true });\n");
      }
      this.baseURL = options.baseURL;
      this._baseURLIsExplicit = opts.__baseURLIsExplicit ?? !!baseURL;
      this.timeout = options.timeout ?? _a.DEFAULT_TIMEOUT;
      this.logger = options.logger ?? console;
      this.logLevel = defaultLogLevel;
      this.logLevel = parseLogLevel(options.logLevel, "ClientOptions.logLevel", loggerFor(this)) ?? parseLogLevel(readEnv("ANTHROPIC_LOG"), "process.env['ANTHROPIC_LOG']", loggerFor(this)) ?? defaultLogLevel;
      this.fetchOptions = options.fetchOptions;
      this.maxRetries = validatePositiveInteger("maxRetries", options.maxRetries ?? 2);
      this.fetch = options.fetch ?? getDefaultFetch();
      __classPrivateFieldSet(this, _BaseAnthropic_encoder, FallbackEncoder);
      this.middleware = [...options.middleware ?? []];
      const customHeadersEnv = readEnv("ANTHROPIC_CUSTOM_HEADERS");
      if (customHeadersEnv) {
        const parsed = {};
        for (const line of customHeadersEnv.split("\n")) {
          const colon = line.indexOf(":");
          if (colon >= 0) {
            parsed[line.substring(0, colon).trim()] = line.substring(colon + 1).trim();
          }
        }
        options.defaultHeaders = { ...parsed, ...options.defaultHeaders };
      }
      const inherited = opts.__auth;
      delete options.__auth;
      delete options.__baseURLIsExplicit;
      this._options = options;
      this.apiKey = typeof apiKey === "string" ? apiKey : null;
      this.authToken = authToken;
      this.webhookKey = webhookKey;
      if (inherited) {
        this._authState = inherited;
        if (!this._baseURLIsExplicit && inherited.baseURL) {
          this.baseURL = inherited.baseURL;
        }
      } else {
        this._authState = { provider: null, tokenCache: null, resolution: null, error: null, extraHeaders: {} };
        if (this.apiKey == null && this.authToken == null) {
          const credentials = options.credentials ?? null;
          if (credentials) {
            this._authState.provider = credentials;
            this._authState.tokenCache = this._makeTokenCache(credentials);
          } else if (options.config != null) {
            const result = resolveCredentialsFromConfig(options.config, this._credentialResolverOptions());
            this._authState.provider = result.provider;
            this._authState.tokenCache = this._makeTokenCache(result.provider);
            this._authState.extraHeaders = result.extraHeaders;
            this._applyCredentialBaseURL(result.baseURL);
          } else if (options.profile != null) {
            this._authState.resolution = this._resolveDefaultCredentials(options.profile);
          } else if (this._shouldResolveDefaultCredentials()) {
            this._authState.resolution = this._resolveDefaultCredentials();
          }
        }
      }
    }
    /**
     * Whether to lazily resolve auth from the default credential chain when no
     * explicit auth is configured. Called once from the constructor, so
     * overrides must not depend on subclass instance state. Subclasses that
     * bring their own auth scheme return false so unrelated local credentials
     * are never resolved or allowed to supply a base URL.
     */
    _shouldResolveDefaultCredentials() {
      return true;
    }
    /**
     * Stores a profile/config-supplied base URL on the shared auth state and, if
     * the caller did not pin `baseURL` via constructor option or env, adopts it
     * as this client's outbound API host. Precedence: ctor opt > env > profile >
     * hardcoded default.
     */
    _applyCredentialBaseURL(baseURL) {
      if (!baseURL)
        return;
      const normalized = baseURL.replace(/\/+$/, "");
      this._authState.baseURL = normalized;
      if (!this._baseURLIsExplicit) {
        this.baseURL = normalized;
      }
    }
    /**
     * Options bag passed into the credential chain. `baseURL` here is only the
     * fallback host for the token-exchange POST when the config itself omits
     * `base_url`; the chain returns the config's own `base_url` (if any) on
     * {@link CredentialResult.baseURL}, which {@link _applyCredentialBaseURL}
     * then adopts for outbound API requests. The two are deliberately decoupled
     * so this fallback never round-trips into precedence.
     */
    _credentialResolverOptions() {
      return {
        baseURL: this.baseURL,
        fetch: this._credentialsFetch(),
        userAgent: this.getUserAgent(),
        onCacheWriteError: (err) => {
          loggerFor(this).debug("credential cache write failed (best-effort)", err);
        },
        onSafetyWarning: (msg) => {
          loggerFor(this).warn(msg);
        }
      };
    }
    /**
     * A `Fetch` for first-party credential token-exchange requests (OIDC
     * federation jwt-bearer grants, user-OAuth refresh grants) that routes
     * through this client's middleware chain, so middleware observes token
     * traffic like any other request. Only client-level middleware applies:
     * a minted token is shared across requests, so attributing the exchange
     * to any one request's per-request middleware would be arbitrary. For the
     * same reason, `ctx.options` is undefined for these requests.
     */
    _credentialsFetch() {
      return wrapFetchWithMiddleware(this.fetch, this.middleware, void 0, this);
    }
    _makeTokenCache(provider) {
      return new TokenCache(provider, (err) => {
        loggerFor(this).debug("advisory token refresh failed; serving cached token", err);
      });
    }
    /**
     * Create a new client instance re-using the same options given to the
     * current client with optional overriding.
     */
    withOptions(options) {
      const overridesStructuredAuth = "credentials" in options || "config" in options || "profile" in options;
      const overridesAuth = "apiKey" in options || "authToken" in options || overridesStructuredAuth;
      const internal = {
        ...this._options,
        // Only forward baseURL when the caller (or env) explicitly chose it.
        // For a non-explicit parent, this.baseURL may have been mutated to the
        // profile-resolved host; pinning that as the clone's options.baseURL
        // would make _options on the clone misreport caller intent and would
        // leave the clone stuck on the parent's host across an auth override.
        // The clone instead receives the construction-time value via
        // ...this._options above and re-adopts the profile host through the
        // shared _authState.baseURL + __baseURLIsExplicit=false path.
        ...this._baseURLIsExplicit ? { baseURL: this.baseURL } : {},
        maxRetries: this.maxRetries,
        timeout: this.timeout,
        logger: this.logger,
        logLevel: this.logLevel,
        fetch: this.fetch,
        fetchOptions: this.fetchOptions,
        middleware: this.middleware,
        apiKey: this.apiKey,
        authToken: this.authToken,
        webhookKey: this.webhookKey,
        // credentials: this.credentials is a no-op when __auth is shared (the
        // ctor takes the inherited path and ignores options.credentials); when
        // overridesAuth is true via apiKey/authToken only, it lets the clone
        // build a fresh TokenCache around the parent's provider.
        credentials: this.credentials,
        // When the caller passes a structured-credential override, drop inherited
        // structured-credential options so only `...options` supplies them —
        // otherwise an inherited `credentials`/`config`/`profile` would trip the
        // mutual-exclusion check or precedence over the override.
        ...overridesStructuredAuth ? { credentials: void 0, config: void 0, profile: void 0 } : {},
        ...options,
        // Always set __auth so any stale value from ...this._options is
        // overwritten. undefined means "build fresh auth from these options".
        __auth: overridesAuth ? void 0 : this._authState,
        __baseURLIsExplicit: "baseURL" in options ? true : this._baseURLIsExplicit
      };
      return new this.constructor(internal);
    }
    /**
     * Lazily resolves credentials from config files or environment variables.
     * Called once from the constructor when no explicit auth is provided, or
     * when an explicit `profile` was passed (in which case a missing/unresolved
     * profile is surfaced as an error instead of falling through to "no auth").
     * The returned promise is stored and awaited on the first request.
     */
    async _resolveDefaultCredentials(profile) {
      try {
        const result = await defaultCredentials(this._credentialResolverOptions(), profile);
        if (result) {
          this._authState.provider = result.provider;
          this._authState.tokenCache = this._makeTokenCache(result.provider);
          this._authState.extraHeaders = result.extraHeaders;
          this._applyCredentialBaseURL(result.baseURL);
        } else if (profile != null) {
          throw new AnthropicError(`Profile "${profile}" could not be resolved (no <config_dir>/configs/${profile}.json found).`);
        }
      } catch (err) {
        this._authState.error = err;
      } finally {
        this._authState.resolution = null;
      }
    }
    defaultQuery() {
      return this._options.defaultQuery;
    }
    validateHeaders({ values, nulls }) {
      if (values.get("x-api-key") || values.get("authorization")) {
        return;
      }
      if (this._authState.error) {
        throw this._authState.error;
      }
      if (this._authState.tokenCache || this._authState.resolution) {
        return;
      }
      if (this.apiKey && values.get("x-api-key")) {
        return;
      }
      if (nulls.has("x-api-key")) {
        return;
      }
      if (this.authToken && values.get("authorization")) {
        return;
      }
      if (nulls.has("authorization")) {
        return;
      }
      throw new Error('Could not resolve authentication method. Expected one of apiKey, authToken, credentials, config, or profile to be set. Or for one of the "X-Api-Key" or "Authorization" headers to be explicitly omitted');
    }
    _authFlags(opts) {
      let flags = this._requestAuthFlags.get(opts);
      if (!flags) {
        flags = { usedTokenCache: false, didRefreshFor401: false };
        this._requestAuthFlags.set(opts, flags);
      }
      return flags;
    }
    async authHeaders(opts) {
      if (this._authState.resolution) {
        await this._authState.resolution;
      }
      if (this._authState.error) {
        return void 0;
      }
      if (this._authState.tokenCache && this.apiKey == null) {
        const token = await this._authState.tokenCache.getToken();
        this._authFlags(opts).usedTokenCache = true;
        return buildHeaders([{ Authorization: `Bearer ${token}` }]);
      }
      return buildHeaders([await this.apiKeyAuth(opts), await this.bearerAuth(opts)]);
    }
    async apiKeyAuth(opts) {
      if (this.apiKey == null) {
        return void 0;
      }
      return buildHeaders([{ "X-Api-Key": this.apiKey }]);
    }
    async bearerAuth(opts) {
      if (this.authToken == null) {
        return void 0;
      }
      return buildHeaders([{ Authorization: `Bearer ${this.authToken}` }]);
    }
    stringifyQuery(query) {
      return stringifyQuery(query);
    }
    getUserAgent() {
      return `Anthropic/JS ${VERSION}`;
    }
    makeStatusError(status, error, message, headers) {
      return APIError.generate(status, error, message, headers);
    }
    buildURL(path, query, defaultBaseURL) {
      const baseURL = !__classPrivateFieldGet(this, _BaseAnthropic_instances, "m", _BaseAnthropic_baseURLOverridden).call(this) && defaultBaseURL || this.baseURL;
      const url = isAbsoluteURL(path) ? new URL(path) : new URL(baseURL + (baseURL.endsWith("/") && path.startsWith("/") ? path.slice(1) : path));
      const defaultQuery = this.defaultQuery();
      const pathQuery = Object.fromEntries(url.searchParams);
      if (!isEmptyObj(defaultQuery) || !isEmptyObj(pathQuery)) {
        query = { ...pathQuery, ...defaultQuery, ...query };
      }
      if (typeof query === "object" && query && !Array.isArray(query)) {
        url.search = this.stringifyQuery(query);
      }
      return url.toString();
    }
    _calculateNonstreamingTimeout(maxTokens) {
      const defaultTimeout = 10 * 60;
      const expectedTimeout = 60 * 60 * maxTokens / 128e3;
      if (expectedTimeout > defaultTimeout) {
        throw new AnthropicError("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#streaming-responses for more details");
      }
      return defaultTimeout * 1e3;
    }
    /**
     * Used as a callback for mutating the given `FinalRequestOptions` object.
     */
    async prepareOptions(options) {
    }
    /**
     * Used as a callback for mutating the given `RequestInit` object.
     *
     * This is useful for cases where you want to add certain headers based off of
     * the request properties, e.g. `method` or `url`.
     *
     * Runs after all middleware (including {@link backendMiddleware}),
     * immediately before each underlying fetch call, so it sees exactly what
     * goes over the wire. Middleware may replay a request by calling `next()`
     * more than once, so this hook can run multiple times per attempt:
     * overrides must be idempotent and overwrite headers from a previous
     * invocation rather than append to them.
     */
    async prepareRequest(request, { url, options }) {
      if (this._authState.tokenCache && this.apiKey == null) {
        const headers = request.headers instanceof Headers ? request.headers : new Headers(request.headers);
        for (const [k, v] of Object.entries(this._authState.extraHeaders)) {
          if (!headers.has(k))
            headers.set(k, v);
        }
        const existing = headers.get("anthropic-beta")?.split(",").map((s) => s.trim());
        if (!existing?.includes(OAUTH_API_BETA_HEADER)) {
          headers.set("anthropic-beta", [...existing ?? [], OAUTH_API_BETA_HEADER].join(","));
        }
        request.headers = headers;
      }
    }
    /**
     * Internal {@link Middleware} composed innermost in the chain — inside both
     * client-level and per-request middleware, immediately around the underlying
     * `fetch`. Subclasses for third-party backends override this to adapt the
     * canonical Anthropic-shaped request to the backend's wire shape (URL/body
     * rewriting, request signing) and to normalize the wire response back to the
     * canonical shape (e.g. AWS EventStream to SSE).
     *
     * Running inside the user's middleware means user middleware always observes
     * canonical Anthropic-shaped traffic, and the adaptation re-runs (e.g.
     * re-signs) on every `next()` invocation, covering whatever the middleware
     * mutated.
     *
     * Errors thrown here follow the middleware error policy: they propagate to
     * the caller as-is — no retries, no `APIConnectionError` wrapping — unless
     * retryable (see {@link Middleware}); throw a `RetryableError` to opt into
     * the retry path.
     */
    backendMiddleware() {
      return [];
    }
    get(path, opts) {
      return this.methodRequest("get", path, opts);
    }
    post(path, opts) {
      return this.methodRequest("post", path, opts);
    }
    patch(path, opts) {
      return this.methodRequest("patch", path, opts);
    }
    put(path, opts) {
      return this.methodRequest("put", path, opts);
    }
    delete(path, opts) {
      return this.methodRequest("delete", path, opts);
    }
    methodRequest(method, path, opts) {
      return this.request(Promise.resolve(opts).then((opts2) => {
        return { method, path, ...opts2 };
      }));
    }
    request(options, remainingRetries = null) {
      return new APIPromise(this, this.makeRequest(options, remainingRetries, void 0));
    }
    async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
      const options = await optionsInput;
      let maxRetries = validatePositiveInteger("maxRetries", options.maxRetries ?? this.maxRetries);
      if (this.isStreamBody(options.body)) {
        maxRetries = 0;
      }
      if (retriesRemaining == null) {
        retriesRemaining = maxRetries;
        this._requestAuthFlags.delete(options);
      }
      await this.prepareOptions(options);
      const { req, url, timeout } = await this.buildRequest(options, {
        retryCount: maxRetries - retriesRemaining
      });
      const requestLogID = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0");
      const retryLogStr = retryOfRequestLogID === void 0 ? "" : `, retryOf: ${retryOfRequestLogID}`;
      const startTime = Date.now();
      if (options.signal?.aborted) {
        throw new APIUserAbortError();
      }
      const controller = new AbortController();
      const response = await this.fetchWithTimeout(url, req, timeout, controller, options, {
        requestLogID,
        retryOfRequestLogID
      }).catch(castToError);
      const headersTime = Date.now();
      if (response instanceof globalThis.Error) {
        releaseRequestSignal(controller);
        const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
        if (options.signal?.aborted) {
          throw new APIUserAbortError();
        }
        const isTimeout = isAbortError(response) || /timed? ?out/i.test(String(response) + ("cause" in response ? String(response.cause) : ""));
        const hasMiddleware = this.middleware.length > 0 || !!options.middleware?.length || this.backendMiddleware().length > 0;
        if (hasMiddleware && !isTimeout && !isRetryableError(response)) {
          loggerFor(this).info(`[${requestLogID}] middleware error (not retryable)`);
          debugLogRequestDetails(loggerFor(this), `[${requestLogID}] middleware error (not retryable)`, {
            retryOfRequestLogID,
            url,
            durationMs: headersTime - startTime,
            message: response.message
          });
          throw response;
        }
        if (retriesRemaining) {
          loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${retryMessage}`);
          debugLogRequestDetails(loggerFor(this), `[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${retryMessage})`, {
            retryOfRequestLogID,
            url,
            durationMs: headersTime - startTime,
            message: response.message
          });
          return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
        }
        loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - error; no more retries left`);
        debugLogRequestDetails(loggerFor(this), `[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (error; no more retries left)`, {
          retryOfRequestLogID,
          url,
          durationMs: headersTime - startTime,
          message: response.message
        });
        if (isTimeout) {
          throw new APIConnectionTimeoutError();
        }
        if (hasMiddleware && !isFetchOriginError(response)) {
          throw response;
        }
        throw new APIConnectionError({ cause: response });
      }
      const specialHeaders = [...response.headers.entries()].filter(([name]) => name === "request-id" || name === "anthropic-workspace-id").map(([name, value]) => ", " + name + ": " + JSON.stringify(value)).join("");
      const responseInfo = `[${requestLogID}${retryLogStr}${specialHeaders}] ${req.method} ${url} ${response.ok ? "succeeded" : "failed"} with status ${response.status} in ${headersTime - startTime}ms`;
      if (!response.ok) {
        const shouldRetry = await this.shouldRetry(response, options);
        if (retriesRemaining && shouldRetry) {
          const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
          await CancelReadableStream(response.body);
          releaseRequestSignal(controller);
          loggerFor(this).info(`${responseInfo} - ${retryMessage2}`);
          debugLogRequestDetails(loggerFor(this), `[${requestLogID}] response error (${retryMessage2})`, {
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            durationMs: headersTime - startTime
          });
          return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
        }
        const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
        loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
        const errText = await response.text().catch((err2) => castToError(err2).message);
        const errJSON = safeJSON(errText);
        const errMessage = errJSON ? void 0 : errText;
        debugLogRequestDetails(loggerFor(this), `[${requestLogID}] response error (${retryMessage})`, {
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          message: errMessage,
          durationMs: Date.now() - startTime
        });
        releaseRequestSignal(controller);
        const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
        throw err;
      }
      loggerFor(this).info(responseInfo);
      debugLogRequestDetails(loggerFor(this), `[${requestLogID}] response start`, {
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        headers: response.headers,
        durationMs: headersTime - startTime
      });
      armAbandonmentBackstop(response.body ?? response, controller);
      return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
    }
    getAPIList(path, Page, opts) {
      return this.requestAPIList(Page, opts && "then" in opts ? opts.then((opts2) => ({ method: "get", path, ...opts2 })) : { method: "get", path, ...opts });
    }
    requestAPIList(Page, options) {
      const request = this.makeRequest(options, null, void 0);
      return new PagePromise(this, request, Page);
    }
    async fetchWithTimeout(url, init, ms, controller, requestOptions, logCtx) {
      const { signal, method, ...options } = init || {};
      const abort = this._makeAbort(controller);
      if (signal) {
        signal.addEventListener("abort", abort, { once: true });
        registerRequestSignalCleanup(controller, signal, abort);
      }
      const isReadableBody = globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream || typeof options.body === "object" && options.body !== null && Symbol.asyncIterator in options.body;
      const fetchOptions = {
        signal: controller.signal,
        ...isReadableBody ? { duplex: "half" } : {},
        method: "GET",
        ...options
      };
      if (method) {
        fetchOptions.method = method.toUpperCase();
      }
      const baseFetch = this.fetch;
      const timedFetch = async (innerUrl, innerInit) => {
        const timeout = setTimeout(abort, ms);
        try {
          return await baseFetch.call(void 0, innerUrl, innerInit);
        } finally {
          clearTimeout(timeout);
        }
      };
      const innerFetch = requestOptions === void 0 ? timedFetch : async (innerUrl, innerInit = {}) => {
        const innerUrlStr = typeof innerUrl === "string" ? innerUrl : innerUrl instanceof URL ? innerUrl.href : innerUrl.url;
        innerInit.headers = innerInit.headers instanceof Headers ? innerInit.headers : new Headers(innerInit.headers);
        await this.prepareRequest(innerInit, { url: innerUrlStr, options: requestOptions });
        if (logCtx) {
          debugLogRequestDetails(loggerFor(this), `[${logCtx.requestLogID}] sending request`, {
            retryOfRequestLogID: logCtx.retryOfRequestLogID,
            method: innerInit.method,
            url: innerUrlStr,
            options: requestOptions,
            headers: innerInit.headers
          });
        }
        return timedFetch(innerUrl, innerInit);
      };
      const requestMiddleware = requestOptions?.middleware;
      const backendMiddleware = this.backendMiddleware();
      const allMiddleware = requestMiddleware?.length || backendMiddleware.length ? [...this.middleware, ...requestMiddleware ?? [], ...backendMiddleware] : this.middleware;
      return await wrapFetchWithMiddleware(innerFetch, allMiddleware, requestOptions, this)(url, fetchOptions);
    }
    async shouldRetry(response, options) {
      const flags = this._authFlags(options);
      if (response.status === 401 && this._authState.tokenCache && flags.usedTokenCache && !flags.didRefreshFor401) {
        flags.didRefreshFor401 = true;
        this._authState.tokenCache.invalidate();
        return true;
      }
      const shouldRetryHeader = response.headers.get("x-should-retry");
      if (shouldRetryHeader === "true")
        return true;
      if (shouldRetryHeader === "false")
        return false;
      if (response.status === 408)
        return true;
      if (response.status === 409)
        return true;
      if (response.status === 429)
        return true;
      if (response.status >= 500)
        return true;
      return false;
    }
    async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
      let timeoutMillis;
      const retryAfterMillisHeader = responseHeaders?.get("retry-after-ms");
      if (retryAfterMillisHeader) {
        const timeoutMs = parseFloat(retryAfterMillisHeader);
        if (!Number.isNaN(timeoutMs)) {
          timeoutMillis = timeoutMs;
        }
      }
      const retryAfterHeader = responseHeaders?.get("retry-after");
      if (retryAfterHeader && !timeoutMillis) {
        const timeoutSeconds = parseFloat(retryAfterHeader);
        if (!Number.isNaN(timeoutSeconds)) {
          timeoutMillis = timeoutSeconds * 1e3;
        } else {
          timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
        }
      }
      if (timeoutMillis === void 0 || !(timeoutMillis > 0 && timeoutMillis <= 2 ** 31 - 1)) {
        const maxRetries = options.maxRetries ?? this.maxRetries;
        timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
      }
      await sleep(timeoutMillis, options.signal ?? void 0);
      return this.makeRequest(options, retriesRemaining - 1, requestLogID);
    }
    calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
      const initialRetryDelay = 0.5;
      const maxRetryDelay = 8;
      const numRetries = maxRetries - retriesRemaining;
      const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
      const jitter = 1 - Math.random() * 0.25;
      return sleepSeconds * jitter * 1e3;
    }
    calculateNonstreamingTimeout(maxTokens, maxNonstreamingTokens) {
      const maxTime = 60 * 60 * 1e3;
      const defaultTime = 60 * 10 * 1e3;
      const expectedTime = maxTime * maxTokens / 128e3;
      if (expectedTime > defaultTime || maxNonstreamingTokens != null && maxTokens > maxNonstreamingTokens) {
        throw new AnthropicError("Streaming is required for operations that may take longer than 10 minutes. See https://github.com/anthropics/anthropic-sdk-typescript#long-requests for more details");
      }
      return defaultTime;
    }
    async buildRequest(inputOptions, { retryCount = 0 } = {}) {
      const options = { ...inputOptions };
      const { method, path, query, defaultBaseURL } = options;
      if (this._authState.resolution) {
        await this._authState.resolution;
      }
      if (!this._baseURLIsExplicit && this._authState.baseURL && this.baseURL !== this._authState.baseURL) {
        this.baseURL = this._authState.baseURL;
      }
      const url = this.buildURL(path, query, defaultBaseURL);
      if ("timeout" in options)
        validatePositiveInteger("timeout", options.timeout);
      options.timeout = options.timeout ?? this.timeout;
      const { bodyHeaders, body } = this.buildBody({ options });
      const reqHeaders = await this.buildHeaders({
        options: inputOptions,
        method,
        bodyHeaders,
        retryCount,
        timeout: options.timeout
      });
      const req = {
        method,
        headers: reqHeaders,
        ...options.signal && { signal: options.signal },
        ...globalThis.ReadableStream && body instanceof globalThis.ReadableStream && { duplex: "half" },
        ...body && { body },
        ...this.fetchOptions ?? {},
        ...options.fetchOptions ?? {}
      };
      return { req, url, timeout: options.timeout };
    }
    async buildHeaders({ options, method, bodyHeaders, retryCount, timeout }) {
      const headers = buildHeaders([
        {
          Accept: "application/json",
          "User-Agent": this.getUserAgent(),
          "X-Stainless-Retry-Count": String(retryCount),
          "X-Stainless-Timeout": String(Math.trunc(timeout / 1e3)),
          ...getPlatformHeaders(),
          ...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : void 0,
          "anthropic-version": "2023-06-01"
        },
        await this.authHeaders(options),
        this._options.defaultHeaders,
        bodyHeaders,
        options.headers
      ]);
      this.validateHeaders(headers);
      return headers.values;
    }
    _makeAbort(controller) {
      return () => controller.abort();
    }
    buildBody({ options: { body, headers: rawHeaders } }) {
      if (!body) {
        return { bodyHeaders: void 0, body: void 0 };
      }
      const headers = buildHeaders([rawHeaders]);
      if (
        // Pass raw type verbatim
        ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof DataView || typeof body === "string" && // Preserve legacy string encoding behavior for now
        headers.values.has("content-type") || // `Blob` is superset of `File`
        globalThis.Blob && body instanceof globalThis.Blob || // `FormData` -> `multipart/form-data`
        body instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
        body instanceof URLSearchParams || // Send chunked stream (each chunk has own `length`)
        globalThis.ReadableStream && body instanceof globalThis.ReadableStream
      ) {
        return { bodyHeaders: void 0, body };
      } else if (this.isStreamBody(body)) {
        return { bodyHeaders: void 0, body: ReadableStreamFrom(body) };
      } else if (typeof body === "object" && headers.values.get("content-type") === "application/x-www-form-urlencoded") {
        return {
          bodyHeaders: { "content-type": "application/x-www-form-urlencoded" },
          body: this.stringifyQuery(body)
        };
      } else {
        return __classPrivateFieldGet(this, _BaseAnthropic_encoder, "f").call(this, { body, headers });
      }
    }
    /**
     * Whether `body` is sent as a stream, which can be read only once:
     * a `ReadableStream`, an async iterable or an iterator.
     */
    isStreamBody(body) {
      if (globalThis.ReadableStream && body instanceof globalThis.ReadableStream) {
        return true;
      }
      return typeof body === "object" && body !== null && (Symbol.asyncIterator in body || Symbol.iterator in body && "next" in body && typeof body.next === "function");
    }
  }
  _a = BaseAnthropic2, _BaseAnthropic_encoder = /* @__PURE__ */ new WeakMap(), _BaseAnthropic_instances = /* @__PURE__ */ new WeakSet(), _BaseAnthropic_baseURLOverridden = function _BaseAnthropic_baseURLOverridden2() {
    return this.baseURL !== "https://api.anthropic.com";
  };
  BaseAnthropic2.Anthropic = _a;
  BaseAnthropic2.DEFAULT_TIMEOUT = 6e5;
  BaseAnthropic2.AnthropicError = AnthropicError;
  BaseAnthropic2.APIError = APIError;
  BaseAnthropic2.APIConnectionError = APIConnectionError;
  BaseAnthropic2.APIConnectionTimeoutError = APIConnectionTimeoutError;
  BaseAnthropic2.APIUserAbortError = APIUserAbortError;
  BaseAnthropic2.NotFoundError = NotFoundError;
  BaseAnthropic2.ConflictError = ConflictError;
  BaseAnthropic2.RateLimitError = RateLimitError;
  BaseAnthropic2.BadRequestError = BadRequestError;
  BaseAnthropic2.AuthenticationError = AuthenticationError;
  BaseAnthropic2.InternalServerError = InternalServerError;
  BaseAnthropic2.PermissionDeniedError = PermissionDeniedError;
  BaseAnthropic2.UnprocessableEntityError = UnprocessableEntityError;
  BaseAnthropic2.toFile = toFile;
  BaseAnthropic2.HUMAN_PROMPT = HUMAN_PROMPT;
  BaseAnthropic2.AI_PROMPT = AI_PROMPT;
  return BaseAnthropic2;
})();
var Anthropic = /* @__PURE__ */ (() => {
  class Anthropic2 extends BaseAnthropic {
    constructor() {
      super(...arguments);
      this.completions = new Completions(this);
      this.messages = new Messages$1(this);
      this.models = new Models(this);
      this.files = new Files(this);
      this.skills = new Skills(this);
      this.organization = new Organization(this);
      this.beta = new Beta(this);
    }
  }
  Anthropic2.Completions = Completions;
  Anthropic2.Messages = Messages$1;
  Anthropic2.Models = Models;
  Anthropic2.Files = Files;
  Anthropic2.Skills = Skills;
  Anthropic2.Organization = Organization;
  Anthropic2.Beta = Beta;
  return Anthropic2;
})();

const index = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    AI_PROMPT,
    APIConnectionError,
    APIConnectionTimeoutError,
    APIError,
    APIPromise,
    APIUserAbortError,
    Anthropic,
    AnthropicError,
    AuthenticationError,
    BadRequestError,
    BaseAnthropic,
    ConflictError,
    HUMAN_PROMPT,
    InternalServerError,
    NotFoundError,
    PagePromise,
    PermissionDeniedError,
    RateLimitError,
    RetryableError,
    UnprocessableEntityError,
    default: Anthropic,
    toFile
}, Symbol.toStringTag, { value: 'Module' }));

export { AnthropicError as A, DEFAULT_MEMORY_SYNC_INTERVAL_MS as D, MIN_MEMORY_SYNC_INTERVAL_MS as M, index as i };
//# sourceMappingURL=index2.js.map

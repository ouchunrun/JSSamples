/*!
 * Dynamsoft JavaScript Library
 * @product Dynamsoft Core JS Edition
 * @website https://www.dynamsoft.com
 * @copyright Copyright 2024, Dynamsoft Corporation
 * @author Dynamsoft
 * @version 3.2.10
 * @fileoverview Dynamsoft JavaScript Library for Core
 * More info on Dynamsoft Core JS: https://www.dynamsoft.com/capture-vision/docs/web/programming/javascript/api-reference/core/core-module.html
 */
! function () {
    "use strict";
    const e = e => e && "object" == typeof e && "function" == typeof e.then;
    class t extends Promise {
        constructor(t) {
            let r, n;
            super(((e, t) => {
                r = e, n = t
            })), this._s = "pending", this.resolve = t => {
                this.isPending && (e(t) ? this.task = t : (this._s = "fulfilled", r(t)))
            }, this.reject = e => {
                this.isPending && (this._s = "rejected", n(e))
            }, this.task = t
        }
        get status() {
            return this._s
        }
        get isPending() {
            return "pending" === this._s
        }
        get isFulfilled() {
            return "fulfilled" === this._s
        }
        get isRejected() {
            return "rejected" === this._s
        }
        get task() {
            return this._task
        }
        set task(t) {
            let r;
            this._task = t, e(t) ? r = t : "function" == typeof t && (r = new Promise(t)), r && (async () => {
                try {
                    const e = await r;
                    t === this._task && this.resolve(e)
                } catch (e) {
                    t === this._task && this.reject(e)
                }
            })()
        }
        get isEmpty() {
            return null == this._task
        }
    }
    const r = "undefined" == typeof self,
        n = r ? {} : self;
    let o, i, a, s, c;
    "undefined" != typeof navigator && (o = navigator, i = o.userAgent, a = o.platform, s = o.mediaDevices),
        function () {
            if (!r) {
                const e = {
                        Edge: {
                            search: "Edg",
                            verSearch: "Edg"
                        },
                        OPR: null,
                        Chrome: null,
                        Safari: {
                            str: o.vendor,
                            search: "Apple",
                            verSearch: ["Version", "iPhone OS", "CPU OS"]
                        },
                        Firefox: null,
                        Explorer: {
                            search: "MSIE",
                            verSearch: "MSIE"
                        }
                    },
                    t = {
                        HarmonyOS: null,
                        Android: null,
                        iPhone: null,
                        iPad: null,
                        Windows: {
                            str: a,
                            search: "Win"
                        },
                        Mac: {
                            str: a
                        },
                        Linux: {
                            str: a
                        }
                    };
                let r = "unknownBrowser",
                    n = 0,
                    s = "unknownOS";
                for (let t in e) {
                    const o = e[t] || {};
                    let a = o.str || i,
                        s = o.search || t,
                        c = o.verStr || i,
                        l = o.verSearch || t;
                    if (l instanceof Array || (l = [l]), -1 != a.indexOf(s)) {
                        r = t;
                        for (let e of l) {
                            let t = c.indexOf(e);
                            if (-1 != t) {
                                n = parseFloat(c.substring(t + e.length + 1));
                                break
                            }
                        }
                        break
                    }
                }
                for (let e in t) {
                    const r = t[e] || {};
                    let n = r.str || i,
                        o = r.search || e;
                    if (-1 != n.indexOf(o)) {
                        s = e;
                        break
                    }
                }
                "Linux" == s && -1 != i.indexOf("Windows NT") && (s = "HarmonyOS"), c = {
                    browser: r,
                    version: n,
                    OS: s
                }
            }
            r && (c = {
                browser: "ssr",
                version: 0,
                OS: "ssr"
            })
        }(), "undefined" != typeof WebAssembly && i && (!/Safari/.test(i) || /Chrome/.test(i) || /\(.+\s11_2_([2-6]).*\)/.test(i)), s && s.getUserMedia;
    const l = "Chrome" === c.browser && c.version > 66 || "Safari" === c.browser && c.version > 13 || "OPR" === c.browser && c.version > 43 || "Edge" === c.browser && c.version > 15;
    var d = function () {
        try {
            if ("undefined" != typeof indexedDB) return indexedDB;
            if ("undefined" != typeof webkitIndexedDB) return webkitIndexedDB;
            if ("undefined" != typeof mozIndexedDB) return mozIndexedDB;
            if ("undefined" != typeof OIndexedDB) return OIndexedDB;
            if ("undefined" != typeof msIndexedDB) return msIndexedDB
        } catch (e) {
            return
        }
    }();

    function u(e, t) {
        e = e || [], t = t || {};
        try {
            return new Blob(e, t)
        } catch (o) {
            if ("TypeError" !== o.name) throw o;
            for (var r = new("undefined" != typeof BlobBuilder ? BlobBuilder : "undefined" != typeof MSBlobBuilder ? MSBlobBuilder : "undefined" != typeof MozBlobBuilder ? MozBlobBuilder : WebKitBlobBuilder), n = 0; n < e.length; n += 1) r.append(e[n]);
            return r.getBlob(t.type)
        }
    }

    function f(e, t) {
        t && e.then((function (e) {
            t(null, e)
        }), (function (e) {
            t(e)
        }))
    }

    function m(e, t, r) {
        "function" == typeof t && e.then(t), "function" == typeof r && e.catch(r)
    }

    function h(e) {
        return "string" != typeof e && (console.warn(`${e} used as a key, but it is not a string.`), e = String(e)), e
    }

    function p() {
        if (arguments.length && "function" == typeof arguments[arguments.length - 1]) return arguments[arguments.length - 1]
    }
    const y = "local-forage-detect-blob-support";
    let g;
    const b = {},
        v = Object.prototype.toString,
        w = "readonly",
        _ = "readwrite";

    function S(e) {
        return "boolean" == typeof g ? Promise.resolve(g) : function (e) {
            return new Promise((function (t) {
                var r = e.transaction(y, _),
                    n = u([""]);
                r.objectStore(y).put(n, "key"), r.onabort = function (e) {
                    e.preventDefault(), e.stopPropagation(), t(!1)
                }, r.oncomplete = function () {
                    var e = navigator.userAgent.match(/Chrome\/(\d+)/),
                        r = navigator.userAgent.match(/Edge\//);
                    t(r || !e || parseInt(e[1], 10) >= 43)
                }
            })).catch((function () {
                return !1
            }))
        }(e).then((function (e) {
            return g = e, g
        }))
    }

    function I(e) {
        var t = b[e.name],
            r = {};
        r.promise = new Promise((function (e, t) {
            r.resolve = e, r.reject = t
        })), t.deferredOperations.push(r), t.dbReady ? t.dbReady = t.dbReady.then((function () {
            return r.promise
        })) : t.dbReady = r.promise
    }

    function C(e) {
        var t = b[e.name].deferredOperations.pop();
        if (t) return t.resolve(), t.promise
    }

    function x(e, t) {
        var r = b[e.name].deferredOperations.pop();
        if (r) return r.reject(t), r.promise
    }

    function k(e, t) {
        return new Promise((function (r, n) {
            if (b[e.name] = b[e.name] || {
                    forages: [],
                    db: null,
                    dbReady: null,
                    deferredOperations: []
                }, e.db) {
                if (!t) return r(e.db);
                I(e), e.db.close()
            }
            var o = [e.name];
            t && o.push(e.version);
            var i = d.open.apply(d, o);
            t && (i.onupgradeneeded = function (t) {
                var r = i.result;
                try {
                    r.createObjectStore(e.storeName), t.oldVersion <= 1 && r.createObjectStore(y)
                } catch (r) {
                    if ("ConstraintError" !== r.name) throw r;
                    console.warn('The database "' + e.name + '" has been upgraded from version ' + t.oldVersion + " to version " + t.newVersion + ', but the storage "' + e.storeName + '" already exists.')
                }
            }), i.onerror = function (e) {
                e.preventDefault(), n(i.error)
            }, i.onsuccess = function () {
                var t = i.result;
                t.onversionchange = function (e) {
                    e.target.close()
                }, r(t), C(e)
            }
        }))
    }

    function P(e) {
        return k(e, !1)
    }

    function E(e) {
        return k(e, !0)
    }

    function D(e, t) {
        if (!e.db) return !0;
        var r = !e.db.objectStoreNames.contains(e.storeName),
            n = e.version < e.db.version,
            o = e.version > e.db.version;
        if (n && (e.version !== t && console.warn('The database "' + e.name + "\" can't be downgraded from version " + e.db.version + " to version " + e.version + "."), e.version = e.db.version), o || r) {
            if (r) {
                var i = e.db.version + 1;
                i > e.version && (e.version = i)
            }
            return !0
        }
        return !1
    }

    function T(e) {
        var t = function (e) {
            for (var t = e.length, r = new ArrayBuffer(t), n = new Uint8Array(r), o = 0; o < t; o++) n[o] = e.charCodeAt(o);
            return r
        }(atob(e.data));
        return u([t], {
            type: e.type
        })
    }

    function N(e) {
        var t = this,
            r = t._initReady().then((function () {
                var e = b[t._dbInfo.name];
                if (e && e.dbReady) return e.dbReady
            }));
        return m(r, e, e), r
    }

    function M(e, t, r, n) {
        void 0 === n && (n = 1);
        try {
            var o = e.db.transaction(e.storeName, t);
            r(null, o)
        } catch (o) {
            if (n > 0 && (!e.db || "InvalidStateError" === o.name || "NotFoundError" === o.name)) return Promise.resolve().then((() => {
                if (!e.db || "NotFoundError" === o.name && !e.db.objectStoreNames.contains(e.storeName) && e.version <= e.db.version) return e.db && (e.version = e.db.version + 1), E(e)
            })).then((() => function (e) {
                I(e);
                for (var t = b[e.name], r = t.forages, n = 0; n < r.length; n++) {
                    const e = r[n];
                    e._dbInfo.db && (e._dbInfo.db.close(), e._dbInfo.db = null)
                }
                return e.db = null, P(e).then((t => (e.db = t, D(e) ? E(e) : t))).then((n => {
                    e.db = t.db = n;
                    for (var o = 0; o < r.length; o++) r[o]._dbInfo.db = n
                })).catch((t => {
                    throw x(e, t), t
                }))
            }(e).then((function () {
                M(e, t, r, n - 1)
            })))).catch(r);
            r(o)
        }
    }
    var O = {
        _driver: "asyncStorage",
        _initStorage: function (e) {
            var t = this,
                r = {
                    db: null
                };
            if (e)
                for (var n in e) r[n] = e[n];
            var o = b[r.name];
            o || (o = {
                forages: [],
                db: null,
                dbReady: null,
                deferredOperations: []
            }, b[r.name] = o), o.forages.push(t), t._initReady || (t._initReady = t.ready, t.ready = N);
            var i = [];

            function a() {
                return Promise.resolve()
            }
            for (var s = 0; s < o.forages.length; s++) {
                var c = o.forages[s];
                c !== t && i.push(c._initReady().catch(a))
            }
            var l = o.forages.slice(0);
            return Promise.all(i).then((function () {
                return r.db = o.db, P(r)
            })).then((function (e) {
                return r.db = e, D(r, t._defaultConfig.version) ? E(r) : e
            })).then((function (e) {
                r.db = o.db = e, t._dbInfo = r;
                for (var n = 0; n < l.length; n++) {
                    var i = l[n];
                    i !== t && (i._dbInfo.db = r.db, i._dbInfo.version = r.version)
                }
            }))
        },
        _support: function () {
            try {
                if (!d || !d.open) return !1;
                var e = "undefined" != typeof openDatabase && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform),
                    t = "function" == typeof fetch && -1 !== fetch.toString().indexOf("[native code");
                return (!e || t) && "undefined" != typeof indexedDB && "undefined" != typeof IDBKeyRange
            } catch (e) {
                return !1
            }
        }(),
        getItem: function (e, t) {
            var r = this;
            e = h(e);
            var n = new Promise((function (t, n) {
                r.ready().then((function () {
                    M(r._dbInfo, w, (function (o, i) {
                        if (o) return n(o);
                        try {
                            var a = i.objectStore(r._dbInfo.storeName).get(e);
                            a.onsuccess = function () {
                                var e = a.result;
                                void 0 === e && (e = null),
                                    function (e) {
                                        return e && e.__local_forage_encoded_blob
                                    }(e) && (e = T(e)), t(e)
                            }, a.onerror = function () {
                                n(a.error)
                            }
                        } catch (e) {
                            n(e)
                        }
                    }))
                })).catch(n)
            }));
            return f(n, t), n
        },
        setItem: function (e, t, r) {
            var n = this;
            e = h(e);
            var o = new Promise((function (r, o) {
                var i;
                n.ready().then((function () {
                    return i = n._dbInfo, "[object Blob]" === v.call(t) ? S(i.db).then((function (e) {
                        return e ? t : (r = t, new Promise((function (e, t) {
                            var n = new FileReader;
                            n.onerror = t, n.onloadend = function (t) {
                                var n = btoa(t.target.result || "");
                                e({
                                    __local_forage_encoded_blob: !0,
                                    data: n,
                                    type: r.type
                                })
                            }, n.readAsBinaryString(r)
                        })));
                        var r
                    })) : t
                })).then((function (t) {
                    M(n._dbInfo, _, (function (i, a) {
                        if (i) return o(i);
                        try {
                            var s = a.objectStore(n._dbInfo.storeName);
                            null === t && (t = void 0);
                            var c = s.put(t, e);
                            a.oncomplete = function () {
                                void 0 === t && (t = null), r(t)
                            }, a.onabort = a.onerror = function () {
                                var e = c.error ? c.error : c.transaction.error;
                                o(e)
                            }
                        } catch (e) {
                            o(e)
                        }
                    }))
                })).catch(o)
            }));
            return f(o, r), o
        },
        removeItem: function (e, t) {
            var r = this;
            e = h(e);
            var n = new Promise((function (t, n) {
                r.ready().then((function () {
                    M(r._dbInfo, _, (function (o, i) {
                        if (o) return n(o);
                        try {
                            var a = i.objectStore(r._dbInfo.storeName).delete(e);
                            i.oncomplete = function () {
                                t()
                            }, i.onerror = function () {
                                n(a.error)
                            }, i.onabort = function () {
                                var e = a.error ? a.error : a.transaction.error;
                                n(e)
                            }
                        } catch (e) {
                            n(e)
                        }
                    }))
                })).catch(n)
            }));
            return f(n, t), n
        },
        clear: function (e) {
            var t = this,
                r = new Promise((function (e, r) {
                    t.ready().then((function () {
                        M(t._dbInfo, _, (function (n, o) {
                            if (n) return r(n);
                            try {
                                var i = o.objectStore(t._dbInfo.storeName).clear();
                                o.oncomplete = function () {
                                    e()
                                }, o.onabort = o.onerror = function () {
                                    var e = i.error ? i.error : i.transaction.error;
                                    r(e)
                                }
                            } catch (e) {
                                r(e)
                            }
                        }))
                    })).catch(r)
                }));
            return f(r, e), r
        },
        length: function (e) {
            var t = this,
                r = new Promise((function (e, r) {
                    t.ready().then((function () {
                        M(t._dbInfo, w, (function (n, o) {
                            if (n) return r(n);
                            try {
                                var i = o.objectStore(t._dbInfo.storeName).count();
                                i.onsuccess = function () {
                                    e(i.result)
                                }, i.onerror = function () {
                                    r(i.error)
                                }
                            } catch (e) {
                                r(e)
                            }
                        }))
                    })).catch(r)
                }));
            return f(r, e), r
        },
        keys: function (e) {
            var t = this,
                r = new Promise((function (e, r) {
                    t.ready().then((function () {
                        M(t._dbInfo, w, (function (n, o) {
                            if (n) return r(n);
                            try {
                                var i = o.objectStore(t._dbInfo.storeName).openKeyCursor(),
                                    a = [];
                                i.onsuccess = function () {
                                    var t = i.result;
                                    t ? (a.push(t.key), t.continue()) : e(a)
                                }, i.onerror = function () {
                                    r(i.error)
                                }
                            } catch (e) {
                                r(e)
                            }
                        }))
                    })).catch(r)
                }));
            return f(r, e), r
        },
        dropInstance: function (e, t) {
            t = p.apply(this, arguments);
            var r, n = this.config();
            if ((e = "function" != typeof e && e || {}).name || (e.name = e.name || n.name, e.storeName = e.storeName || n.storeName), e.name) {
                const t = e.name === n.name && this._dbInfo.db ? Promise.resolve(this._dbInfo.db) : P(e).then((t => {
                    const r = b[e.name],
                        n = r.forages;
                    r.db = t;
                    for (var o = 0; o < n.length; o++) n[o]._dbInfo.db = t;
                    return t
                }));
                r = e.storeName ? t.then((t => {
                    if (!t.objectStoreNames.contains(e.storeName)) return;
                    const r = t.version + 1;
                    I(e);
                    const n = b[e.name],
                        o = n.forages;
                    t.close();
                    for (let e = 0; e < o.length; e++) {
                        const t = o[e];
                        t._dbInfo.db = null, t._dbInfo.version = r
                    }
                    const i = new Promise(((t, n) => {
                        const o = d.open(e.name, r);
                        o.onerror = e => {
                            o.result.close(), n(e)
                        }, o.onupgradeneeded = () => {
                            o.result.deleteObjectStore(e.storeName)
                        }, o.onsuccess = () => {
                            const e = o.result;
                            e.close(), t(e)
                        }
                    }));
                    return i.then((e => {
                        n.db = e;
                        for (let t = 0; t < o.length; t++) {
                            const r = o[t];
                            r._dbInfo.db = e, C(r._dbInfo)
                        }
                    })).catch((t => {
                        throw (x(e, t) || Promise.resolve()).catch((() => {})), t
                    }))
                })) : t.then((t => {
                    I(e);
                    const r = b[e.name],
                        n = r.forages;
                    t.close();
                    for (var o = 0; o < n.length; o++) {
                        n[o]._dbInfo.db = null
                    }
                    const i = new Promise(((t, r) => {
                        var n = d.deleteDatabase(e.name);
                        n.onerror = () => {
                            const e = n.result;
                            e && e.close(), r(n.error)
                        }, n.onblocked = () => {
                            console.warn('dropInstance blocked for database "' + e.name + '" until all open connections are closed')
                        }, n.onsuccess = () => {
                            const e = n.result;
                            e && e.close(), t(e)
                        }
                    }));
                    return i.then((e => {
                        r.db = e;
                        for (var t = 0; t < n.length; t++) {
                            C(n[t]._dbInfo)
                        }
                    })).catch((t => {
                        throw (x(e, t) || Promise.resolve()).catch((() => {})), t
                    }))
                }))
            } else r = Promise.reject("Invalid arguments");
            return f(r, t), r
        }
    };
    const R = new Map;

    function j(e, t) {
        let r = e.name + "/";
        return e.storeName !== t.storeName && (r += e.storeName + "/"), r
    }
    var A = {
        _driver: "tempStorageWrapper",
        _initStorage: async function (e) {
            const t = {};
            if (e)
                for (let r in e) t[r] = e[r];
            const r = t.keyPrefix = j(e, this._defaultConfig);
            this._dbInfo = t, R.has(r) || R.set(r, new Map)
        },
        getItem: function (e, t) {
            e = h(e);
            const r = this.ready().then((() => R.get(this._dbInfo.keyPrefix).get(e)));
            return f(r, t), r
        },
        setItem: function (e, t, r) {
            e = h(e);
            const n = this.ready().then((() => (void 0 === t && (t = null), R.get(this._dbInfo.keyPrefix).set(e, t), t)));
            return f(n, r), n
        },
        removeItem: function (e, t) {
            e = h(e);
            const r = this.ready().then((() => {
                R.get(this._dbInfo.keyPrefix).delete(e)
            }));
            return f(r, t), r
        },
        clear: function (e) {
            const t = this.ready().then((() => {
                const e = this._dbInfo.keyPrefix;
                R.has(e) && R.delete(e)
            }));
            return f(t, e), t
        },
        length: function (e) {
            const t = this.ready().then((() => R.get(this._dbInfo.keyPrefix).size));
            return f(t, e), t
        },
        keys: function (e) {
            const t = this.ready().then((() => [...R.get(this._dbInfo.keyPrefix).keys()]));
            return f(t, e), t
        },
        dropInstance: function (e, t) {
            if (t = p.apply(this, arguments), !(e = "function" != typeof e && e || {}).name) {
                const t = this.config();
                e.name = e.name || t.name, e.storeName = e.storeName || t.storeName
            }
            let r;
            return r = e.name ? new Promise((t => {
                e.storeName ? t(j(e, this._defaultConfig)) : t(`${e.name}/`)
            })).then((e => {
                R.delete(e)
            })) : Promise.reject("Invalid arguments"), f(r, t), r
        }
    };
    const U = (e, t) => {
            const r = e.length;
            let n = 0;
            for (; n < r;) {
                if ((o = e[n]) === (i = t) || "number" == typeof o && "number" == typeof i && isNaN(o) && isNaN(i)) return !0;
                n++
            }
            var o, i;
            return !1
        },
        B = Array.isArray || function (e) {
            return "[object Array]" === Object.prototype.toString.call(e)
        },
        W = {},
        F = {},
        L = {
            INDEXEDDB: O,
            TEMPSTORAGE: A
        },
        z = [L.INDEXEDDB._driver, L.TEMPSTORAGE._driver],
        H = ["dropInstance"],
        J = ["clear", "getItem", "keys", "length", "removeItem", "setItem"].concat(H),
        V = {
            description: "",
            driver: z.slice(),
            name: "localforage",
            size: 4980736,
            storeName: "keyvaluepairs",
            version: 1
        };

    function $(e, t) {
        e[t] = function () {
            const r = arguments;
            return e.ready().then((function () {
                return e[t].apply(e, r)
            }))
        }
    }

    function G() {
        for (let e = 1; e < arguments.length; e++) {
            const t = arguments[e];
            if (t)
                for (let e in t) t.hasOwnProperty(e) && (B(t[e]) ? arguments[0][e] = t[e].slice() : arguments[0][e] = t[e])
        }
        return arguments[0]
    }
    class Z {
        constructor(e) {
            for (let e in L)
                if (L.hasOwnProperty(e)) {
                    const t = L[e],
                        r = t._driver;
                    this[e] = r, W[r] || this.defineDriver(t)
                } this._defaultConfig = G({}, V), this._config = G({}, this._defaultConfig, e), this._driverSet = null, this._initDriver = null, this._ready = !1, this._dbInfo = null, this._wrapLibraryMethodsWithReady(), this.setDriver(this._config.driver).catch((() => {}))
        }
        config(e) {
            if ("object" == typeof e) {
                if (this._ready) return new Error("Can't call config() after localforage has been used.");
                for (let t in e) {
                    if ("storeName" === t && (e[t] = e[t].replace(/\W/g, "_")), "version" === t && "number" != typeof e[t]) return new Error("Database version must be a number.");
                    this._config[t] = e[t]
                }
                return !("driver" in e) || !e.driver || this.setDriver(this._config.driver)
            }
            return "string" == typeof e ? this._config[e] : this._config
        }
        defineDriver(e, t, r) {
            const n = new Promise((function (t, r) {
                try {
                    const n = e._driver,
                        o = new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");
                    if (!e._driver) return void r(o);
                    const i = J.concat("_initStorage");
                    for (let t = 0, n = i.length; t < n; t++) {
                        const n = i[t];
                        if ((!U(H, n) || e[n]) && "function" != typeof e[n]) return void r(o)
                    }
                    const a = function () {
                        const t = function (e) {
                            return function () {
                                const t = new Error(`Method ${e} is not implemented by the current driver`),
                                    r = Promise.reject(t);
                                return f(r, arguments[arguments.length - 1]), r
                            }
                        };
                        for (let r = 0, n = H.length; r < n; r++) {
                            const n = H[r];
                            e[n] || (e[n] = t(n))
                        }
                    };
                    a();
                    const s = function (r) {
                        W[n] && console.info(`Redefining LocalForage driver: ${n}`), W[n] = e, F[n] = r, t()
                    };
                    "_support" in e ? e._support && "function" == typeof e._support ? e._support().then(s, r) : s(!!e._support) : s(!0)
                } catch (e) {
                    r(e)
                }
            }));
            return m(n, t, r), n
        }
        driver() {
            return this._driver || null
        }
        getDriver(e, t, r) {
            const n = W[e] ? Promise.resolve(W[e]) : Promise.reject(new Error("Driver not found."));
            return m(n, t, r), n
        }
        ready(e) {
            const t = this,
                r = t._driverSet.then((() => (null === t._ready && (t._ready = t._initDriver()), t._ready)));
            return m(r, e, e), r
        }
        setDriver(e, t, r) {
            const n = this;
            B(e) || (e = [e]);
            const o = this._getSupportedDrivers(e);

            function i() {
                n._config.driver = n.driver()
            }

            function a(e) {
                return n._extend(e), i(), n._ready = n._initStorage(n._config), n._ready
            }
            const s = null !== this._driverSet ? this._driverSet.catch((() => Promise.resolve())) : Promise.resolve();
            return this._driverSet = s.then((() => {
                const e = o[0];
                return n._dbInfo = null, n._ready = null, n.getDriver(e).then((e => {
                    n._driver = e._driver, i(), n._wrapLibraryMethodsWithReady(), n._initDriver = function (e) {
                        return function () {
                            let t = 0;
                            return function r() {
                                for (; t < e.length;) {
                                    let o = e[t];
                                    return t++, n._dbInfo = null, n._ready = null, n.getDriver(o).then(a).catch(r)
                                }
                                i();
                                const o = new Error("No available storage method found.");
                                return n._driverSet = Promise.reject(o), n._driverSet
                            }()
                        }
                    }(o)
                }))
            })).catch((() => {
                i();
                const e = new Error("No available storage method found.");
                return n._driverSet = Promise.reject(e), n._driverSet
            })), m(this._driverSet, t, r), this._driverSet
        }
        supports(e) {
            return !!F[e]
        }
        _extend(e) {
            G(this, e)
        }
        _getSupportedDrivers(e) {
            const t = [];
            for (let r = 0, n = e.length; r < n; r++) {
                const n = e[r];
                this.supports(n) && t.push(n)
            }
            return t
        }
        _wrapLibraryMethodsWithReady() {
            for (let e = 0, t = J.length; e < t; e++) $(this, J[e])
        }
        createInstance(e) {
            return new Z(e)
        }
    }
    var Y = new Z;
    Date.prototype.kUtilFormat = function (e) {
        const t = {
            "M+": this.getUTCMonth() + 1,
            "d+": this.getUTCDate(),
            "H+": this.getUTCHours(),
            "h+": this.getUTCHours() % 12 || 12,
            "m+": this.getUTCMinutes(),
            "s+": this.getUTCSeconds(),
            "q+": Math.floor((this.getUTCMonth() + 3) / 3),
            "S+": this.getUTCMilliseconds()
        };
        /(y+)/.test(e) && (e = e.replace(RegExp.$1, (this.getUTCFullYear() + "").substr(4 - RegExp.$1.length)));
        for (let r in t) new RegExp("(" + r + ")").test(e) && (e = e.replace(RegExp.$1, 1 == RegExp.$1.length ? t[r] : ("000" + t[r]).substr(("000" + t[r]).length - RegExp.$1.length)));
        return e
    };
    let K = e => {
        let r, o, i, a, s, c, d, u, f, m, h, p, y, g, b, v, w, _, S, I, C, x, k, P, E = n.btoa,
            D = n.atob,
            T = e.bd,
            N = e.dm,
            M = ["https://mlts.dynamsoft.com/", "https://slts.dynamsoft.com/"],
            O = !1,
            R = Promise.resolve(),
            j = e.log && ((...t) => {
                try {
                    e.log.apply(null, t)
                } catch (e) {
                    setTimeout((() => {
                        throw e
                    }), 0)
                }
            }) || (() => {}),
            A = T && j || (() => {}),
            U = e => e.join(""),
            B = {
                a: [80, 88, 27, 82, 145, 164, 199, 211],
                b: [187, 87, 89, 128, 150, 44, 190, 213],
                c: [89, 51, 74, 53, 99, 72, 82, 118],
                d: [99, 181, 118, 158, 215, 103, 76, 117],
                e: [99, 51, 86, 105, 100, 71, 120, 108],
                f: [97, 87, 49, 119, 98, 51, 74, 48, 83, 50, 86, 53],
                g: [81, 85, 86, 84, 76, 85, 100, 68, 84, 81, 32, 32],
                h: [90, 87, 53, 106, 99, 110, 108, 119, 100, 65, 32, 32],
                i: [90, 71, 86, 106, 99, 110, 108, 119, 100, 65, 32, 32],
                j: [97, 88, 89, 32],
                k: [29, 83, 122, 137, 5, 180, 157, 114],
                l: [100, 71, 70, 110, 84, 71, 86, 117, 90, 51, 82, 111]
            },
            W = () => n[U(B.c)][U(B.e)][U(B.f)]("raw", new Uint8Array(B.a.concat(B.b, B.d, B.k)), U(B.g), !0, [U(B.h), U(B.i)]),
            F = async e => {
                if (n[U(B.c)] && n[U(B.c)][U(B.e)] && n[U(B.c)][U(B.e)][U(B.f)]) {
                    let t = D(e),
                        r = new Uint8Array(t.length);
                    for (let e = 0; e < t.length; ++e) r[e] = t.charCodeAt(e);
                    let o = r.subarray(0, 12),
                        i = r.subarray(o.length);
                    P || (P = await W());
                    let a = await n[U(B.c)][U(B.e)][U(B.i)]({
                        name: U(B.g),
                        [U(B.j)]: o,
                        [U(B.l)]: 128
                    }, P, i);
                    return String.fromCharCode.apply(null, new Uint8Array(a))
                }
            }, L = e => D(D(e.replace(/\n/g, "+").replace(/\s/g, "=")).substring(1)), z = e => E(String.fromCharCode(97 + 25 * Math.random()) + E(e)).replace(/\+/g, "\n").replace(/=/g, " "), H = () => {
                if (n.crypto) {
                    let e = new Uint8Array(36);
                    n.crypto.getRandomValues(e);
                    let t = "";
                    for (let r = 0; r < 36; ++r) {
                        let n = e[r] % 36;
                        t += n < 10 ? n : String.fromCharCode(n + 87)
                    }
                    return t
                }
                return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (function (e) {
                    var t = 16 * Math.random() | 0;
                    return ("x" == e ? t : 3 & t | 8).toString(16)
                }))
            };
        const J = "Failed to connect to the Dynamsoft License Server: ",
            V = " Check your Internet connection or contact Dynamsoft Support (support@dynamsoft.com) to acquire an offline license.",
            $ = {
                dlsErrorAndCacheExpire: J + "The cached license has expired. Please get connected to the network as soon as possible or contact the site administrator for more information.",
                publicTrialNetworkTimeout: J + "network timed out." + V,
                networkTimeout: J + "network timed out. Check your Internet connection or contact the site administrator for more information.",
                publicTrialFailConnect: J + "network connection error." + V,
                failConnect: J + "network connection error. Check your Internet connection or contact the site administrator for more information.",
                checkLocalTime: "Your system date and time appear to have been changed, causing the license to fail. Please correct the system data and time and try again.",
                idbTimeout: "Failed to open indexedDB: Timeout.",
                dlsOfflineLicenseExpired: "The DLS2 Offline license has expired. Please contact the site administrator for more information."
            };
        let G, Z, K, q, X = async () => {
            if (G) return G;
            G = new t, await (async () => {
                v || (v = Y)
            })(), await Promise.race([(async () => {
                let e = await v.createInstance({
                    name: "dynamjssdkhello"
                });
                await e.setItem("dynamjssdkhello", "available")
            })(), new Promise(((e, t) => {
                setTimeout((() => t(new Error($.idbTimeout))), 5e3)
            }))]), _ = await v.createInstance({
                name: "dynamdlsinfo"
            }), S = E(E("v2") + String.fromCharCode(N.charCodeAt(N.length / 2) + 1) + E(N));
            try {
                let e = await _.getItem(S);
                if (!e) {
                    let t = await v.createInstance({
                        name: "dynamltsinfo"
                    });
                    e = await t.getItem(S), e && await _.setItem(S, e)
                }
                e && ([d, g] = JSON.parse(await L(e)))
            } catch (e) {}
            try {
                null == d && (d = H(), _.setItem(S, await z(JSON.stringify([d, null]))))
            } catch (e) {}
            G.resolve()
        }, Q = async e => {
            if (K = Date.now(), Z) return Z;
            Z = new t;
            try {
                let t = {
                    pd: r,
                    vm: i,
                    v: o,
                    dt: c || "browser",
                    ed: "javascript",
                    cu: d,
                    ad: N,
                    os: u,
                    fn: f
                };
                p && (t.rmk = p), a && (-1 != a.indexOf("-") ? t.hs = a : t.og = a);
                let n = {};
                if (g) {
                    let e = await _.getItem(S);
                    e && ([d, g] = JSON.parse(await L(e))), n["lts-time"] = g
                }
                h && (t.sp = h);
                let l = await Promise.race([(async () => {
                    // let r, o = (new Date).kUtilFormat("yyyy-MM-ddTHH:mm:ss.SSSZ");
                    // g && (_.setItem(S, await z(JSON.stringify([d, o]))), g = o);
                    // let i = "auth/?ext=" + encodeURIComponent(E(JSON.stringify(t)));
                    // y && (i += "&" + encodeURIComponent(y));
                    // let a, c = !1,
                    //     l = !1,
                    //     u = async e => {
                    //         if (e && !e.ok) try {
                    //             let t = await e.text();
                    //             if (t) {
                    //                 let e = JSON.parse(t);
                    //                 e.errorCode && (a = e, e.errorCode > 100 && e.errorCode < 200 && (s = null, c = !0, l = !0))
                    //             }
                    //         } catch (e) {}
                    //     };
                    // try {
                    //     console.log('请求地址:', M[0], i)
                    //     r = await Promise.race([fetch(M[0] + i, {
                    //         headers: n,
                    //         cache: e ? "reload" : "default",
                    //         mode: "cors"
                    //     }), new Promise(((e, t) => setTimeout(t, 1e4)))]), await u(r)
                    // } catch (e) {}
                    // if (!(s || r && r.ok || c)) try {
                    //     r = await Promise.race([fetch(M[1] + i, {
                    //         headers: n,
                    //         mode: "cors"
                    //     }), new Promise(((e, t) => setTimeout(t, 3e4)))]), await u(r)
                    // } catch (e) {}
                    // if (!(s || r && r.ok || c)) try {
                    //     r = await Promise.race([fetch(M[0] + i, {
                    //         headers: n,
                    //         mode: "cors"
                    //     }), new Promise(((e, t) => setTimeout(t, 3e4)))]), await u(r)
                    // } catch (e) {}
                    // a && 151 == a.errorCode && (_.removeItem(S), _.removeItem(I), d = H(), t.cu = d, g = void 0, i = "auth/?ext=" + encodeURIComponent(E(JSON.stringify(t))), r = await Promise.race([fetch(M[0] + i, {
                    //     headers: n,
                    //     mode: "cors"
                    // }), new Promise(((e, t) => setTimeout(t, 3e4)))]), await u(r)), (() => {
                    //     if (!r || !r.ok) {
                    //         let e;
                    //         l && _.setItem(I, ""), a ? 111 == a.errorCode ? e = a.message : (e = a.message.trim(), e.endsWith(".") || (e += "."), e = m ? `An error occurred during authorization: ${e} [Contact Dynamsoft](https://www.dynamsoft.com/company/contact/) for more information.` : `An error occurred during authorization: ${e} Contact the site administrator for more information.`) : e = m ? $.publicTrialFailConnect : $.failConnect;
                    //         let t = Error(e);
                    //         throw a && a.errorCode && (t.ltsErrorCode = a.errorCode), t
                    //     }
                    // })();
                    // let f = await r.text();
                    // try {
                    //     g || (_.setItem(S, await z(JSON.stringify([d, o]))), g = o), _.setItem(I, f)
                    // } catch (e) {}

                    // TODO: 固定返回值，避免向外部服务器发送请求
                    let f = 'U0rijmKiqS4RnG2sgn/aGSnZC9tTPttlTpFLcZF25UAE0vMm91vEoV9Gy6YNepiKVHBOZrUrGDVJfVw4Ji5CU01QY7IY4hQ2nVdM/2y+14Kgbfeepwotc6TRPqBa8bVKYqkgm/CYvnXPz9/psbiInrBjfvS8XQNsxEWCxTKbvRADmAPEulMg+vAp92Py2gQSyNU1E+3/ffNyTNGKtKo1YNZFwYl5Bo6qY2z7BRBFbFbJNpYJPOXWVJj9wqciCP162LvYRiBQERHruZ3xbYjuziwu4bquMU5/ms2SOqtDB4+oKhhLLFyPVBYppt2W4pQfhduygccYvvn5McF69SbbEvwLdTbodBZf0Xj/07K+WKUVrzD+w2P3Pv44kOJDf8LqzeYgAdjdVuOERsuDItibOrgfQgzAhoUOZxYAFDXpF1YvcrDsZgOHb4sSvG/Ef7SaH00R9YPYtvwhMZaKIuRYhHAmqy/HpxcLazoon+vKKY7xZbMp4InpMJEfQlhKQQL689VobYgUWiPIAgYrghb/Es2nheCCY3IPFJEoh6jj9LzPmgJIDS2HAXsm3PmNyNzOS9w0VfsoRYdAnMpwIcp5ftGtHVWH+yMIyyjn9CdUo4RdgpmtT/ql6ll/eNVnfFFFbhOfEXmJ4jxaJsM4aa93c13aQUZyQwFmWfnZjPzi9Y/3KaFS1DRjRpJUcLZYU0uc3Y9Mp3VOowQNqnPUcdu9Wa3P8xNJbyLhUJqJlFpT1tZWPcZf0d8xZtpw531m/2DS6PmXlGPGe02+xecGiJurS+Bcnrs4sdMnVHUQI0EspCKxOXJD+il3kIwTygzXIDjI+ZiH7bf+KuurjfB/79JOt9jnh283EAQXNJoMTtk7QXI+Okxbc1GlTXhx7gZ6/gZgNxjljtRgpHlOtiZQyXhd8acSuLKL2LoYACSvExHWWbvUi0/jzdXjpzYO+r3dAElGeF9pz++lLB7cz0kcIgkxkkkl/m66dsxHvwYZpICIdirAkCLLdeHAhTZFda6aWEVhH3upp3mI7lR6j4idnSfKdn3iy/Zx7D6zBFXPnt/0O+EfFOKwuRuG9gGyhqxhGu1t61ED0O0LpZRZizi+/mV7F30FW4ynXDRtHi4JEEsBIQ7W6wXhFaddBRwLnHW/a3sYf+oWTFh0i1ZywMgbLtsUsSMFes31OloCeWpE2kAzE/FBPQVlwhMPb2Y1VHQ+gf2VwvjG7QqPiyNcAwj00qGKC4vcjlaZlnTRbdWEhoeaNWkQeZnmm66Om0VlqMWm+4R2JdGgg5OEm+gJLMEve4tUd92jI9ETL7prS0MglSETUyGjDcSeeWqUwVXapERodH5xshoXHHCDiLUHjMCvMQ/ax1rHQR6F4Nztrx28Hwj1VPl3urIaOj+hAlpzAbevKghU+OdnLTJqiiTIUir/bqRphf4nraaCAaGHdfvULX7fYsgKbPKg5z+d'
                    console.warn('auth 固定返回值:' , f)
                    return f
                })(), new Promise(((e, t) => {
                    let r;
                    r = m ? $.publicTrialNetworkTimeout : $.networkTimeout, setTimeout((() => t(new Error(r))), s ? 3e3 : 15e3)
                }))]);
                s = l
            } catch (e) {
                T && console.error(e), b = e
            }
            Z.resolve(), Z = null
        }, ee = async () => {
            q || (q = (async () => {
                if (A(d), !s) {
                    if (!O) throw j(b.message), b;
                    return
                }
                let e = {
                    dm: N
                };
                T && (e.bd = !0), e.brtk = !0, e.ls = M[0], a && (-1 != a.indexOf("-") ? e.hs = a : e.og = a), e.cu = d, f && (e.fn = f), r && (e.pd = r), o && (e.v = o), c && (e.dt = c), u && (e.os = u), p && (e.rmk = p), A(s);
                try {
                    let t = JSON.parse(await F(s));
                    t.pv && (e.pv = JSON.stringify(t.pv)), t.ba && (e.ba = t.ba), t.usu && (e.usu = t.usu), t.trial && (e.trial = t.trial), t.its && (e.its = t.its), 1 == e.trial && t.msg ? e.msg = t.msg : b ? e.msg = b.message || b : t.msg && (e.msg = t.msg), e.ar = t.in, e.bafc = !!b
                } catch (e) {}
                A(e);
                try {
                    await C(e)
                } catch (e) {
                    A("error updl")
                }
                await te(), O || (O = !0), q = null
            })()), await q
        }, te = async () => {
            let e = (new Date).kUtilFormat("yyyy-MM-ddTHH:mm:ss.SSSZ"),
                t = await k();
            if (A(t), t && t < e) throw b ? new Error($.dlsErrorAndCacheExpire) : new Error($.checkLocalTime)
        };
        const re = new t;
        let ne = null,
            oe = async (e, t) => (R = R.then((async () => {
                try {
                    let r = await w.keys();
                    if (t || (re.isFulfilled ? e && (r = r.filter((t => t < e))) : e && r.includes(e) ? r = [e] : (r = [], A("Unexpected null key"))), !r.length) return;
                    for (let e = 0; e < r.length / 1e3; ++e) {
                        let t = r.slice(1e3 * e, 1e3 * (e + 1)),
                            n = [];
                        for (let e = 0; e < t.length; ++e) {
                            n.push(await w.getItem(t[e]));
                        }
                        g = (new Date).kUtilFormat("yyyy-MM-ddTHH:mm:ss.SSSZ"); {
                            let e = await _.getItem(S);
                            e && ([d] = JSON.parse(await L(e))), _.setItem(S, await z(JSON.stringify([d, g])))
                        }
                        // TODO: 去除verify/v2请求，避免向外部服务器发送请求
                        // console.warn('发送verify/v2请求:', M[0])
                        for (let e = 0; e < t.length; ++e) {
                            await w.removeItem(t[e])
                        }
                        return

                        try {
                            let e, r, o = M[0] + "verify/v2";
                            g && (o += "?ltstime=" + encodeURIComponent(g));
                            try {
                                e = fetch(o, {
                                    method: "POST",
                                    body: n.join(";"),
                                    keepalive: !0
                                })
                            } finally {
                                !re.isFulfilled && l && re.resolve()
                            }
                            try {
                                r = await e
                            } finally {
                                re.isFulfilled || re.resolve()
                            }
                            if (!r.ok) {
                                throw new Error("verify failed. Status Code: " + r.status);
                            }
                            for (let e = 0; e < t.length; ++e) {
                                await w.removeItem(t[e])
                            }
                        } catch (e) {
                            throw re.isFulfilled || re.resolve(), e
                        }
                    }
                } catch (e) {}
            })), await R);
        return {
            i: async e => {
                r = e.pd, o = e.v, i = o.split(".")[0], e.dt && (c = e.dt), a = e.l || "", u = "string" != typeof e.os ? JSON.stringify(e.os) : e.os, f = e.fn, "string" == typeof f && (f = f.substring(0, 255)), e.ls && e.ls.length && (M = e.ls, 1 == M.length && M.push(M[0])), m = !a || "200001" === a || a.startsWith("200001-"), h = e.sp, p = e.rmk, "string" == typeof p && (p = p.substring(0, 255)), e.cv && (y = "" + e.cv), C = e.updl, x = e.mnet, k = e.mxet, await X(), await (async () => {
                    I = E(String.fromCharCode(a.charCodeAt(0) + 10) + E(r) + E(a) + i + E("" + c)), w = await v.createInstance({
                        name: "dynamdlsuns" + E(E("v2")) + E(String.fromCharCode(a.charCodeAt(0) + 10) + E(r) + E(a) + i + E("" + c))
                    });
                    try {
                        s = await _.getItem(I)
                    } catch (e) {}
                    U = e => D(String.fromCharCode.apply(null, e).replace(/\n/g, "+").replace(/\s/g, "="))
                })(), await Q(), await ee(), (!b || b.ltsErrorCode >= 102 && b.ltsErrorCode <= 120) && oe(null, !0)
            },
            i2: async ({
                updl: e,
                mxet: t,
                strDLC2: r
            }) => {
                C = e, k = t, await X(), U = e => D(String.fromCharCode.apply(null, e).replace(/\n/g, "+").replace(/\s/g, "="));
                let n = {
                    pk: r,
                    dm: N
                };
                T && (n.bd = !0), n.cu = d;
                try {
                    s = r.substring(4);
                    let e = JSON.parse(await F(s));
                    e.pv && (n.pv = JSON.stringify(e.pv)), e.ba && (n.ba = e.ba), n.ar = e.in
                } catch (e) {}
                A(n);
                try {
                    await C(n)
                } catch (e) {
                    A("error updl")
                }
                let o = (new Date).kUtilFormat("yyyy-MM-ddTHH:mm:ss.SSSZ"),
                    i = await k();
                if (i && i < o) throw new Error($.dlsOfflineLicenseExpired)
            },
            c: async () => {
                let e = new Date;
                if (e.getTime() < K + 36e4) return;
                let t = e.kUtilFormat("yyyy-MM-ddTHH:mm:ss.SSSZ"),
                    r = await x(),
                    n = await k();
                if (n && n < t) await Q(!0), await ee();
                else if (r && r < t) {
                    let t = new Date(e.getTime());
                    t.setMinutes(e.getMinutes() - 6);
                    let r = t.kUtilFormat("yyyy-MM-ddTHH:mm:ss.SSSZ");
                    g < r && Q().then((() => ee()))
                }
            },
            s: async (e, t, r, o) => {
                try {
                    let e;
                    e = t.startsWith("{") && t.endsWith("}") ? await (async e => {
                        if (n[U(B.c)] && n[U(B.c)][U(B.e)] && n[U(B.c)][U(B.e)][U(B.f)]) {
                            let t = new Uint8Array(e.length);
                            for (let r = 0; r < e.length; ++r) t[r] = e.charCodeAt(r);
                            let r = n.crypto.getRandomValues(new Uint8Array(12));
                            P || (P = await W());
                            let o = await n[U(B.c)][U(B.e)][U(B.h)]({
                                    name: U(B.g),
                                    [U(B.j)]: r,
                                    [U(B.l)]: 128
                                }, P, t),
                                i = new Uint8Array(o),
                                a = new Uint8Array(r.length + i.length);
                            return a.set(r), a.set(i, r.length), E(String.fromCharCode.apply(null, a))
                        }
                    })(t) : t, e ? (A("bs " + r), await w.setItem(r, e), A("ss " + r)) : A("ept ecpt")
                } catch (e) {}
                o && (A("bd " + r), await oe(r, 2 == o), A("sd " + r)), ne && clearTimeout(ne), ne = setTimeout((async () => {
                    await oe()
                }), 36e4)
            },
            p: re,
            u: async () => (await X(), d),
            ar: () => s,
            pt: () => m,
            ae: () => b
        }
    };
    const q = self,
        X = {};
    let Q;
    q.coreWorkerVersion = "3.2.10", q.versions = X;
    let ee, te, re, ne, oe = !1;
    const ie = {},
        ae = async e => {
            let r = "string" == typeof e ? [e] : e,
                n = [];
            for (let e of r) n.push(ie[e] = ie[e] || new t);
            await Promise.all(n)
        }, se = async (e, r) => {
            let n, o = "string" == typeof e ? [e] : e,
                i = [];
            for (let e of o) {
                let o;
                i.push(o = ie[e] = ie[e] || new t(n = n || r())), o.isEmpty && (o.task = n = n || r())
            }
            await Promise.all(i)
        }, ce = [];
    q.setBufferIntoWasm = (e, t = 0, r = 0, n = 0) => {
        r && (e = n ? e.subarray(r, n) : e.subarray(r));
        let o = ce[t] = ce[t] || {
            ptr: 0,
            size: 0,
            maxSize: 0
        };
        return e.length > o.maxSize && (o.ptr && fe._free(o.ptr), o.ptr = fe._malloc(e.length), o.maxSize = e.length), fe.HEAPU8.set(e, o.ptr), o.size = e.length, o.ptr
    };
    const le = {
            buffer: 0,
            size: 0,
            pos: 0,
            temps: [],
            needed: 0,
            prepare: function () {
                if (le.needed) {
                    for (let e = 0; e < le.temps.length; e++) fe._free(le.temps[e]);
                    le.temps.length = 0, fe._free(le.buffer), le.buffer = 0, le.size += le.needed, le.needed = 0
                }
                le.buffer || (le.size += 128, le.buffer = fe._malloc(le.size), assert(le.buffer)), le.pos = 0
            },
            alloc: function (e, t) {
                assert(le.buffer);
                let r, n = t.BYTES_PER_ELEMENT,
                    o = e.length * n;
                return o = o + 7 & -8, le.pos + o >= le.size ? (assert(o > 0), le.needed += o, r = fe._malloc(o), le.temps.push(r)) : (r = le.buffer + le.pos, le.pos += o), r
            },
            copy: function (e, t, r) {
                switch (r >>>= 0, t.BYTES_PER_ELEMENT) {
                    case 2:
                        r >>>= 1;
                        break;
                    case 4:
                        r >>>= 2;
                        break;
                    case 8:
                        r >>>= 3
                }
                for (let n = 0; n < e.length; n++) t[r + n] = e[n]
            }
        },
        de = q.ep = le.prepare,
        ue = q.es = e => {
            let t = intArrayFromString(e),
                r = le.alloc(t, fe.HEAP8);
            return le.copy(t, fe.HEAP8, r), r
        },
        fe = q.Module = {
            print: e => {
                Q && Se(e)
            },
            printErr: e => {
                Q && Se(e)
            },
            locateFile: (e, t) => {
                if (["std.wasm", "core.wasm"].includes(e)) {
                    return ye[e.split(".")[0]] + e
                }
                return e
            }
        },
        me = async e => {
            await ae("core"), await ae("license"), ee = e.trial, re = e.msg, de(), wasmImports.emscripten_bind_CoreWasm_static_init_1(ue(JSON.stringify(e)))
        }, he = () => {
            let e = fe.getMinExpireTime;
            return e ? e() : null
        }, pe = () => {
            let e = fe.getMaxExpireTime;
            return e ? e() : null
        };
    q.checkAndReauth = async () => {};
    const ye = q.engineResourcePaths = {},
        ge = q.loadCore = async () => {
            const e = "core";
            await se(e, (async () => {
                let t = Q && (Se(e + " loading..."), Date.now()) || 0,
                    r = new Promise((r => {
                        fe.onRuntimeInitialized = () => {
                            Q && Se(e + " initialized, cost " + (Date.now() - t) + " ms"), r(void 0)
                        }
                    })),
                    n = ye.std + "std.js";
                importScripts(n), await r
            }))
        }, be = q.loadSideModule = async (e, {
            js: t,
            wasm: r
        }) => {
            await se(e, (async () => {
                await ae("core");
                let n = Q && (Se(e + " loading..."), Date.now()) || 0;
                if (t instanceof Array)
                    for (let r of t) {
                        let t = ye[e] + r;
                        importScripts(t)
                    } else if (t) {
                        let t = ye[e] + e + ".worker.js";
                        importScripts(t)
                    } if (r instanceof Array)
                    for (let t of r) {
                        let r = ye[e] + t;
                        try {
                            await loadDynamicLibrary(r, {
                                loadAsync: !0,
                                global: !0,
                                nodelete: !0,
                                allowUndefined: !0
                            })
                        } catch (e) {
                            throw e
                        }
                    } else if (r) {
                        let t = ye[e] + e + ".wasm";
                        try {
                            await loadDynamicLibrary(t, {
                                loadAsync: !0,
                                global: !0,
                                nodelete: !0,
                                allowUndefined: !0
                            })
                        } catch (e) {
                            throw e
                        }
                    } wasmImports.emscripten_bind_CoreWasm_PreSetModuleExist && (de(), wasmImports.emscripten_bind_CoreWasm_PreSetModuleExist(ue(e.toUpperCase()))), wasmImports.emscripten_bind_CvrWasm_SetModuleExist && (de(), wasmImports.emscripten_bind_CvrWasm_SetModuleExist(ue(e.toUpperCase())));
                const o = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CoreWasm_GetModuleVersion_0())),
                    i = q[`${e}WorkerVersion`];
                X[e] = {
                    worker: `${i||"No Worker"}`,
                    wasm: o[e.toUpperCase()]
                }, Q && Se(e + " initialized, cost " + (Date.now() - n) + " ms")
            }))
        }, ve = q.mapController = {
            loadWasm: async (e, t) => {
                try {
                    Object.assign(ye, e.engineResourcePaths), e.needLoadCore && (e.bLog && (Q = !0), e.dm && (te = e.dm), e.bd && (oe = !0), await ge());
                    for (let t of e.names) await be(t, e.autoResources[t]);
                    if (e.needLoadCore) {
                        const e = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CoreWasm_GetModuleVersion_0()));
                        X.core = {
                            worker: q.coreWorkerVersion,
                            wasm: e.CORE
                        }
                    }
                    we(t, {
                        versions: X
                    })
                } catch (e) {
                    _e(t, e)
                }
            },
            dynamsoft: async (e, t) => {
                try {
                    let r, n = e.l,
                        o = e.brtk,
                        i = (e.bptk, async () => {
                            ne = ne || K({
                                dm: te,
                                log: Se,
                                bd: oe
                            }), q.scsd = ne.s, e.pd = "", e.v = "0." + e.v, e.updl = me, e.mnet = he, e.mxet = pe, await ne.i(e)
                        }),
                        a = async () => {
                            if (n.startsWith("DLC2")) ne = ne || K({
                                dm: te,
                                log: Se,
                                bd: oe
                            }), await ne.i2({
                                updl: me,
                                mxet: pe,
                                strDLC2: n
                            });
                            else {
                                let e = {
                                    pk: n,
                                    dm: te
                                };
                                oe && (e.bd = !0), await me(e)
                            }
                        };
                    o ? await i() : await a(), we(t, {
                        trial: ee,
                        ltsErrorCode: r,
                        message: re,
                        bSupportDce4Module: wasmImports.emscripten_bind_CoreWasm_static_GetIsSupportDceModule_0(),
                        bSupportIRTModule: wasmImports.emscripten_bind_CoreWasm_static_GetIsSupportIRTModule_0()
                    })
                } catch (e) {
                    _e(t, e)
                }
            },
            setBLog: e => {
                Q = e.value
            },
            setBDebug: e => {
                oe = e.value
            },
            getDeviceUUID: async (e, t) => {
                try {
                    ne = ne || K({
                        dm: te,
                        log: Se,
                        bd: oe
                    });
                    let e = await ne.u();
                    we(t, {
                        uuid: e
                    })
                } catch (e) {
                    _e(t, e)
                }
            },
            getAR: async (e, t) => {
                try {
                    if (ne) {
                        let e = {
                                u: await ne.u(),
                                pt: ne.pt()
                            },
                            r = ne.ar();
                        r && (e.ar = r);
                        let n = ne.ae();
                        n && (e.lem = n.message, e.lec = n.ltsErrorCode), we(t, e)
                    } else we(t, null)
                } catch (e) {
                    _e(t, e)
                }
            },
            getModuleVersion: async (e, t) => {
                try {
                    let e = UTF8ToString(wasmImports.emscripten_bind_CoreWasm_GetModuleVersion_0());
                    we(t, {
                        versions: JSON.parse(e)
                    })
                } catch (e) {
                    _e(t, e)
                }
            },
            cfd: async (e, t) => {
                try {
                    wasmImports.emscripten_bind_CoreWasm_static_CFD_1(e.count), we(t, {})
                } catch (e) {
                    _e(t, e)
                }
            }
        };
    addEventListener("message", (e => {
        const t = e.data ? e.data : e,
            r = t.body,
            n = t.id,
            o = t.instanceID,
            i = ve[t.type];
        if (!i) throw new Error("Unmatched task: " + t.type);
        i(r, n, o)
    }));
    const we = q.handleTaskRes = (e, t) => {
            postMessage({
                type: "task",
                id: e,
                body: Object.assign({
                    success: !0
                }, t)
            })
        },
        _e = q.handleTaskErr = (e, t) => {
            postMessage({
                type: "task",
                id: e,
                body: {
                    success: !1,
                    message: (null == t ? void 0 : t.message) || void 0,
                    stack: oe && (null == t ? void 0 : t.stack) || void 0
                }
            })
        },
        Se = q.log = e => {
            postMessage({
                type: "log",
                message: e
            })
        }
}();
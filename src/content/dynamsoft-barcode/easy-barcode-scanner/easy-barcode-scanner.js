/*!
 * easy-barcode-scanner
 * @version 10.2.1009 (build 2024-09-19T09:03:30.479Z)
 * A wrapper for https://github.com/Dynamsoft/barcode-reader-javascript. Easier to use.
 * The wrapper is under Unlicense, the Dynamsoft SDK it depended is still protected by copyright.
 */
! function (e, t) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t(require("dynamsoft-core"), require("dynamsoft-license"), require("dynamsoft-capture-vision-router"), require("dynamsoft-camera-enhancer"), require("dynamsoft-utility"), require("dynamsoft-barcode-reader")) : "function" == typeof define && define.amd ? define(["dynamsoft-core", "dynamsoft-license", "dynamsoft-capture-vision-router", "dynamsoft-camera-enhancer", "dynamsoft-utility", "dynamsoft-barcode-reader"], t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).EasyBarcodeScanner = t(e.Dynamsoft.Core, e.Dynamsoft.License, e.Dynamsoft.CVR, e.Dynamsoft.DCE, e.Dynamsoft.Utility)
}(this, (function (e, t, n, a, s) {
    "use strict";
    if (Object.assign(e.CoreModule.engineResourcePaths, {
            std: "https://cdn.jsdelivr.net/npm/dynamsoft-capture-vision-std@1.2.10/dist/",
            dip: "https://cdn.jsdelivr.net/npm/dynamsoft-image-processing@2.2.30/dist/",
            core: "https://cdn.jsdelivr.net/npm/dynamsoft-core@3.2.30/dist/",
            license: "https://cdn.jsdelivr.net/npm/dynamsoft-license@3.2.21/dist/",
            cvr: "https://cdn.jsdelivr.net/npm/dynamsoft-capture-vision-router@2.2.30/dist/",
            dbr: "https://cdn.jsdelivr.net/npm/dynamsoft-barcode-reader@10.2.10/dist/",
            dce: "https://cdn.jsdelivr.net/npm/dynamsoft-camera-enhancer@4.0.3/dist/"
        }), null != typeof document) {
        let e = null === document || void 0 === document ? void 0 : document.currentScript;
        if (e) {
            let n = e.getAttribute("data-license");
            n && t.LicenseManager.license != n && (t.LicenseManager.license = n)
        }
    }
    class i {
        constructor() {
            this.templateName = "ReadBarcodes_SpeedFirst", this.isBeepOnUniqueRead = !0
        }
        static get license() {
            return t.LicenseManager.license
        }
        static set license(e) {
            t.LicenseManager.license != e && (t.LicenseManager.license = e)
        }
        get videoFit() {
            return this._view.getVideoFit()
        }
        set videoFit(e) {
            this._view.setVideoFit(e)
        }
        get scanRegionMaskVisible() {
            return this._view.isScanRegionMaskVisible()
        }
        set scanRegionMaskVisible(e) {
            this._view.setScanRegionMaskVisible(e)
        }
        get decodedBarcodeVisible() {
            return this._view._drawingLayerManager.getDrawingLayer(2).isVisible()
        }
        set decodedBarcodeVisible(e) {
            this._view._drawingLayerManager.getDrawingLayer(2).setVisible(e)
        }
        get minImageCaptureInterval() {
            return this._cvRouter._minImageCaptureInterval
        }
        set minImageCaptureInterval(e) {
            this._cvRouter._minImageCaptureInterval = e
        }
        static async createInstance(t) {
            let r = new i;
            try {
                let i = r._cvRouter = await n.CaptureVisionRouter.createInstance(),
                    o = r._view = await a.CameraView.createInstance(t),
                    c = r._cameraEnhancer = await a.CameraEnhancer.createInstance(o);
                i.setInput(c);
                let d = r._filter = new s.MultiFrameResultCrossFilter;
                d.enableResultCrossVerification(e.EnumCapturedResultItemType.CRIT_BARCODE, !0), i.addResultFilter(d), i.addResultReceiver({
                    onCapturedResultReceived: e => {
                        let t = e.barcodeResultItems || [];
                        try {
                            r.onFrameRead && r.onFrameRead(t)
                        } catch (e) {}
                        let n = !1;
                        for (let e of t)
                            if (!e.duplicate) {
                                n = !0;
                                try {
                                    r.onUniqueRead && r.onUniqueRead(e.text, e)
                                } catch (e) {}
                            } n && r.isBeepOnUniqueRead && a.Feedback.beep()
                    }
                })
            } catch (e) {
                throw r.dispose(), e
            }
            return r
        }
        getUIElement() {
            return this._view.getUIElement()
        }
        setScanRegion(e) {
            this._cameraEnhancer.setScanRegion(e)
        }
        getScanRegionMaskStyle() {
            return this._view.getScanRegionMaskStyle()
        }
        setScanRegionMaskStyle(e) {
            this._view.setScanRegionMaskStyle(e)
        }
        getDecodedBarcodeStyle() {
            return a.DrawingStyleManager.getDrawingStyle(3)
        }
        setDecodedBarocdeStyle(e) {
            a.DrawingStyleManager.updateDrawingStyle(3, e)
        }
        getOriginalCanvas() {
            return this._cvRouter._dsImage.toCanvas()
        }
        async open() {
            if (this._cameraEnhancer.isOpen()) this._cameraEnhancer.isPaused() && (await this._cameraEnhancer.resume(), await this._cvRouter.startCapturing(this.templateName));
            else {
                let e = this._view.getUIElement();
                e.parentElement || (Object.assign(e.style, {
                    position: "fixed",
                    left: "0",
                    top: "0",
                    width: "100vw",
                    height: "100vh"
                }), document.body.append(e), this._bAddToBodyWhenOpen = !0), await this._cameraEnhancer.open(), await this._cvRouter.startCapturing(this.templateName)
            }
        }
        close() {
            let e = this._view.getUIElement();
            this._bAddToBodyWhenOpen && (this._bAddToBodyWhenOpen = !1, document.body.removeChild(e)), this._cvRouter.stopCapturing(), this._cameraEnhancer.close()
        }
        pause() {
            this._cvRouter.stopCapturing(), this._cameraEnhancer.pause()
        }
        turnOnTorch() {
            this._cameraEnhancer.turnOnTorch()
        }
        turnOffTorch() {
            this._cameraEnhancer.turnOffTorch()
        }
        convertToPageCoordinates(e) {
            return this._cameraEnhancer.convertToPageCoordinates(e)
        }
        convertToClientCoordinates(e) {
            return this._cameraEnhancer.convertToClientCoordinates(e)
        }
        dispose() {
            var e, t, n;
            null === (e = this._cvRouter) || void 0 === e || e.dispose();
            let a = null === (t = this._view) || void 0 === t ? void 0 : t.getUIElement();
            null === (n = this._cameraEnhancer) || void 0 === n || n.dispose(), this._bAddToBodyWhenOpen && (this._bAddToBodyWhenOpen = !1, a && document.body.removeChild(a))
        }
        static async scan(e = "https://cdn.jsdelivr.net/gh/Dynamsoft/easy-barcode-scanner@10.2.1009/easy-barcode-scanner.ui.html") {
            return await new Promise((async (t, n) => {
                let a = await i.createInstance(e),
                    s = new Promise((e => {
                        a.onFrameRead = t => {
                            ("disabled" !== a._cameraEnhancer.singleFrameMode || t.length) && e(t)
                        }
                    })),
                    r = a.getUIElement().shadowRoot,
                    o = r.querySelector(".easyscanner-close-btn");
                o.addEventListener("click", (() => {
                    a.dispose(), t(null)
                })), r.querySelector(".easyscanner-photo-album-btn").addEventListener("click", (async () => {
                    a.close(), a._cameraEnhancer.singleFrameMode = "image", await a.open()
                }));
                let c = r.querySelector(".easyscanner-camera-and-resolution-btn");
                c.addEventListener("pointerdown", (async () => {
                    "720P" === c.textContent ? (a._cameraEnhancer.setResolution({
                        width: 1920,
                        height: 1080
                    }), c.textContent = "1080P") : (a._cameraEnhancer.setResolution({
                        width: 1280,
                        height: 720
                    }), c.textContent = "720P")
                }));
                let d = !1;
                r.querySelector(".easyscanner-flash-btn").addEventListener("pointerdown", (() => {
                    d = !d, d ? a.turnOnTorch() : a.turnOffTorch()
                })), await a.open();
                let l = await s;
                if (0 === l.length) return void t(null);
                if (1 === l.length) return a.dispose(), void t(l[0].text);
                let u = document.createElement("div");
                u.className = "easyscanner-barcode-result-select-mask", r.append(u);
                let m = new Promise((e => {
                        for (let t of l) {
                            let n = 0,
                                s = 0;
                            for (let e = 0; e < 4; ++e) {
                                let a = t.location.points[e];
                                n += a.x, s += a.y
                            }
                            let i = a.convertToClientCoordinates({
                                    x: n / 4,
                                    y: s / 4
                                }),
                                o = document.createElement("div");
                            o.className = "easyscanner-barcode-result-option", o.style.left = i.x + "px", o.style.top = i.y + "px", o.addEventListener("click", (() => {
                                e(t.text)
                            })), r.append(o)
                        }
                    })),
                    h = document.createElement("div");
                h.className = "easyscanner-barcode-result-select-tip", h.textContent = "Multiple scans found, please select one.", r.append(h), r.append(o), "disabled" === a._cameraEnhancer.singleFrameMode && a.pause();
                let p = await m;
                a.dispose(), t(p)
            }))
        }
    }
    return i
}));
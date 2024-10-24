if (typeof document != undefined) {
    let cs = document?.currentScript;
    if (cs) {
        let license = cs.getAttribute('data-license');
        if (license && LicenseManager.license != license) {
            LicenseManager.license = license;
        }
    }
}

class EasyBarcodeScanner {
    // static initLicense = LicenseManager.initLicense.bind(this) as typeof LicenseManager.initLicense;

    static get license() {
        return LicenseManager.license;
    }
    static set license(value) {
        if (LicenseManager.license != value) {
            LicenseManager.license = value;
        }
    }

    /**
     * Presets: "ReadSingleBarcode", "ReadBarcodes_SpeedFirst"
     */
    templateName = "ReadBarcodes_SpeedFirst";
    isBeepOnUniqueRead = true;

    _cvRouter;
    _view;
    _cameraEnhancer;
    _filter;

    _bAddToBodyWhenOpen;

    get videoFit() {
        return this._view.getVideoFit();
    }
    set videoFit(value) {
        this._view.setVideoFit(value);
    }
    // get singleFrameMode(){ return this._cameraEnhancer.singleFrameMode; }
    // set singleFrameMode(value: "disabled" | "camera" | "image"){ this._cameraEnhancer.singleFrameMode = value; }

    get scanRegionMaskVisible() {
        return this._view.isScanRegionMaskVisible();
    }
    set scanRegionMaskVisible(value) {
        this._view.setScanRegionMaskVisible(value);
    }
    get decodedBarcodeVisible() {
        return this._view._drawingLayerManager.getDrawingLayer(2).isVisible();
    }
    set decodedBarcodeVisible(value) {
        this._view._drawingLayerManager.getDrawingLayer(2).setVisible(value);
    }
    get minImageCaptureInterval() {
        return (this._cvRoute)._minImageCaptureInterval;
    }
    set minImageCaptureInterval(value) {
        (this._cvRouter)._minImageCaptureInterval = value;
    }

    onFrameRead;
    onUniqueRead;


    // static createInstance(): Promise < EasyBarcodeScanner > ;
    // static createInstance(uiPath: string): Promise < EasyBarcodeScanner > ;
    // static createInstance(uiElement: HTMLElement): Promise < EasyBarcodeScanner > ;
    // static createInstance(ui ? : string | HTMLElement): Promise < EasyBarcodeScanner > ;
    static async createInstance(ui) {
        console.warn('创建createInstance， ', ui)
        let scanner = new EasyBarcodeScanner();
        try {
            let cvRouter = scanner._cvRouter = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();

            // let settings = await cvRouter.getSimplifiedSettings('ReadBarcodes_SpeedFirst');
            // settings.capturedResultItemTypes = EnumCapturedResultItemType.CRIT_BARCODE;
            // await cvRouter.updateSettings('ReadBarcodes_SpeedFirst', settings);

            let view = scanner._view = await Dynamsoft.DCE.CameraView.createInstance(ui);
            let cameraEnhancer = scanner._cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(view);
            cvRouter.setInput(cameraEnhancer);

            let filter = scanner._filter = new Dynamsoft.Utility.MultiFrameResultCrossFilter();
            filter.enableResultCrossVerification("barcode", true);
            // filter.enableResultCrossVerification(EnumCapturedResultItemType.CRIT_BARCODE, true);
            //filter.enableResultDeduplication(EnumCapturedResultItemType.CRIT_BARCODE, true);
            cvRouter.addResultFilter(filter);

            cvRouter.addResultReceiver({
                onCapturedResultReceived: (results) => {
                    let items = results.barcodeResultItems || [];

                    try {
                        scanner.onFrameRead && scanner.onFrameRead(items)
                    } catch (_) {}

                    let hasUnique = false;
                    for (let item of items) {
                        if (!(item).duplicate) {
                            hasUnique = true;
                            try {
                                scanner.onUniqueRead && scanner.onUniqueRead(item.text, item)
                            } catch (_) {}
                        }
                    }
                    if (hasUnique && scanner.isBeepOnUniqueRead) {
                        Feedback.beep();
                    }
                }
            });
        } catch (ex) {
            scanner.dispose();
            throw ex;
        }

        return scanner;
    }

    getUIElement() {
        return this._view.getUIElement();
    }

    setScanRegion(region) {
        this._cameraEnhancer.setScanRegion(region);
    }

    getScanRegionMaskStyle() {
        return this._view.getScanRegionMaskStyle();
    }
    setScanRegionMaskStyle(style) {
        this._view.setScanRegionMaskStyle(style);
    }
    getDecodedBarcodeStyle() {
        return DrawingStyleManager.getDrawingStyle(3);
    }
    setDecodedBarocdeStyle(value) {
        DrawingStyleManager.updateDrawingStyle(3, value);
    }

    getOriginalCanvas() {
        return (this._cvRouter)._dsImage.toCanvas();
    }

    async open() {
        if (!this._cameraEnhancer.isOpen()) {
            let ui = this._view.getUIElement();
            if (!ui.parentElement) {
                Object.assign(ui.style, {
                    position: 'fixed',
                    left: '0',
                    top: '0',
                    width: '100vw',
                    height: '100vh',
                });
                document.body.append(ui);
                this._bAddToBodyWhenOpen = true;
            }
            await this._cameraEnhancer.open();
            await this._cvRouter.startCapturing(this.templateName);
        } else if (this._cameraEnhancer.isPaused()) {
            await this._cameraEnhancer.resume();
            await this._cvRouter.startCapturing(this.templateName);
        }
    }
    close() {
        let ui = this._view.getUIElement();
        if (this._bAddToBodyWhenOpen) {
            this._bAddToBodyWhenOpen = false;
            document.body.removeChild(ui);
        }
        this._cvRouter.stopCapturing();
        this._cameraEnhancer.close();
    }
    pause() {
        this._cvRouter.stopCapturing();
        this._cameraEnhancer.pause();
    }

    turnOnTorch() {
        this._cameraEnhancer.turnOnTorch();
    }
    turnOffTorch() {
        this._cameraEnhancer.turnOffTorch();
    }
    //turnAutoTorch(){ this._cameraEnhancer.turnAutoTorch(); }

    convertToPageCoordinates(point) {
        return this._cameraEnhancer.convertToPageCoordinates(point);
    }
    convertToClientCoordinates(point) {
        return this._cameraEnhancer.convertToClientCoordinates(point);
    }

    dispose() {
        this._cvRouter?.dispose();
        let ui = this._view?.getUIElement();
        this._cameraEnhancer?.dispose();
        if (this._bAddToBodyWhenOpen) {
            this._bAddToBodyWhenOpen = false;
            ui && document.body.removeChild(ui);
        }
    }

    // static scan(): Promise < string > ;
    // static scan(uiPath: string): Promise < string > ;
    // static scan(uiElement: HTMLElement): Promise < string > ;
    // static scan(ui ? : string | HTMLElement): Promise < string > ;
    static async scan(ui = './easy-barcode-scanner/easy-barcode-scanner.ui.html') {
        return await new Promise(async (rs, rj) => {

            //========================== init ============================

            let scanner = await EasyBarcodeScanner.createInstance(ui);

            //========================== receive result ============================
            let pVideoScan = new Promise(rs => {
                // let iRound = 0;
                scanner.onFrameRead = barcodeResults => {
                    if ('disabled' !== scanner._cameraEnhancer.singleFrameMode) {
                        rs(barcodeResults);
                    } else if (barcodeResults.length) {
                        //// 1D barcode need 2 frame to comfirm
                        //// so if you need choose between 1D and QR in one frame, you need `iRound`
                        // if(2 == ++iRound){ rs(barcodeResults); }
                        //// we don't use `iRound` for faster result
                        rs(barcodeResults);
                    }
                };
            });

            //========================== ui and event ============================
            let shadowRoot = scanner.getUIElement().shadowRoot;

            let btnClose = shadowRoot.querySelector('.easyscanner-close-btn');
            btnClose.addEventListener('click', () => {
                scanner.dispose();
                console.log('这里是什么?', rs)
                rs(null);
            });

            shadowRoot.querySelector('.easyscanner-photo-album-btn').addEventListener('click', async () => {
                scanner.close();
                scanner._cameraEnhancer.singleFrameMode = 'image';
                await scanner.open();
            });

            let btnResolution = shadowRoot.querySelector('.easyscanner-camera-and-resolution-btn');
            btnResolution.addEventListener('pointerdown', async () => {
                if ('720P' === btnResolution.textContent) {
                    scanner._cameraEnhancer.setResolution({
                        width: 1920,
                        height: 1080
                    });
                    btnResolution.textContent = '1080P';
                } else {
                    scanner._cameraEnhancer.setResolution({
                        width: 1280,
                        height: 720
                    });
                    btnResolution.textContent = '720P';
                }
            });

            let isTorchOn = false; // torch has another style, you can check html part
            shadowRoot.querySelector('.easyscanner-flash-btn').addEventListener('pointerdown', () => {
                isTorchOn = !isTorchOn;
                isTorchOn ? scanner.turnOnTorch() : scanner.turnOffTorch();
            });

            // easyscanner-more-settings-btn not used

            await scanner.open();

            let barcodeResults = await pVideoScan;
            //========================== success get result ============================

            if (0 === barcodeResults.length) {
                rs(null);
                return;
            }

            if (1 === barcodeResults.length) {
                scanner.dispose();
                rs(barcodeResults[0].text);
                return;
            }


            let mask = document.createElement('div');
            mask.className = 'easyscanner-barcode-result-select-mask';
            shadowRoot.append(mask);

            let pChooseResult = new Promise < string > (rs => {
                for (let barcodeResult of barcodeResults) {
                    let xSum = 0,
                        ySum = 0;
                    for (let i = 0; i < 4; ++i) {
                        let p = barcodeResult.location.points[i];
                        xSum += p.x;
                        ySum += p.y;
                    }
                    let center = scanner.convertToClientCoordinates({
                        x: xSum / 4,
                        y: ySum / 4
                    });
                    let option = document.createElement('div');
                    option.className = 'easyscanner-barcode-result-option';
                    option.style.left = center.x + 'px';
                    option.style.top = center.y + 'px';
                    option.addEventListener('click', () => {
                        rs(barcodeResult.text);
                    });
                    shadowRoot.append(option);
                }
            });

            let tip = document.createElement('div');
            tip.className = 'easyscanner-barcode-result-select-tip';
            tip.textContent = 'Multiple scans found, please select one.';
            shadowRoot.append(tip);

            shadowRoot.append(btnClose);

            if ('disabled' === scanner._cameraEnhancer.singleFrameMode) {
                scanner.pause();
            }

            let txtResult = await pChooseResult;

            scanner.dispose();

            rs(txtResult);
        });
    }
}
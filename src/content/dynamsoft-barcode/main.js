let startButton = document.getElementById('start')
startButton.onclick = startScanning

async function startScanning() {
    console.log('start scanning')
    startButton.disabled = true

    Dynamsoft.License.LicenseManager.initLicense("DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9");
    Dynamsoft.Core.CoreModule.loadWasm(["dbr"]);
    let router = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();

    let view = await Dynamsoft.DCE.CameraView.createInstance();
    let cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(view);
    document.querySelector("#cameraViewContainer").append(view.getUIElement());
    router.setInput(cameraEnhancer);

    const resultsContainer = document.querySelector("#results");
    router.addResultReceiver({
        onDecodedBarcodesReceived: (result) => {
            if (result.barcodeResultItems.length > 0) {
                resultsContainer.textContent = '';
                for (let item of result.barcodeResultItems) {
                    resultsContainer.textContent += `${item.formatString}: ${item.text}\n\n`;
                }
            }
        }
    });

    let filter = new Dynamsoft.Utility.MultiFrameResultCrossFilter();
    filter.enableResultCrossVerification("barcode", true);
    filter.enableResultDeduplication("barcode", true);
    await router.addResultFilter(filter);

    await cameraEnhancer.open();
    await router.startCapturing("ReadSingleBarcode");
}

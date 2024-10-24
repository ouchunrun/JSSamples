
let barcodeDecode = {
    // 页面元素
    startButton: null,
    stopButton: null,
    cameraViewContainer: null,
    resultsContainer: null,

    // 扫码相关变量
    dynamsoftLicense: 'DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9',
    route: null,
    view: null,
    cameraEnhancer: null,
    
    init: function (){
        console.log('init dom variables')
        this.startButton = document.getElementById('start')
        this.stopButton = document.getElementById('stop')
        this.cameraViewContainer = document.getElementById('cameraViewContainer')
        this.resultsContainer = document.querySelector("#results")

        this.startButton.addEventListener('click',  this.startScanning.bind(this))
        this.stopButton.addEventListener('click',  this.stopScanning.bind(this))
        this.stopButton.disabled = true
        this.startButton.disabled = false

        // 非必须
        // this.initDynamsoftLicense()
    },

    initDynamsoftLicense: function(){
        console.log('Init dynamsoft license')
        Dynamsoft.License.LicenseManager.initLicense(this.dynamsoftLicense)
        Dynamsoft.Core.CoreModule.loadWasm(["dbr"])
    },

    startScanning: async function (){
        console.log('start scanning')
        this.startButton.disabled = true
        this.stopButton.disabled = false
    
        this.router = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();
        this.view = await Dynamsoft.DCE.CameraView.createInstance();
        this.cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(this.view);
        this.router.setInput(this.cameraEnhancer);
        
        // 添加video显示视频流
        this.cameraViewContainer.append(this.view.getUIElement());
        // 处理扫描结果
        this.router.addResultReceiver({ onDecodedBarcodesReceived: this.handleBarcodeDecodeResult.bind(this) });
    
        let filter = new Dynamsoft.Utility.MultiFrameResultCrossFilter();
        filter.enableResultCrossVerification("barcode", true);
        filter.enableResultDeduplication("barcode", true);
        await this.router.addResultFilter(filter);
    
        await this.cameraEnhancer.open();
        await this.router.startCapturing("ReadSingleBarcode");
    },

    handleBarcodeDecodeResult: function(result){
        if (result.barcodeResultItems?.length > 0) {
            // 先清空
            this.resultsContainer.textContent = '';
            for (let item of result.barcodeResultItems) {
                // 添加扫描结果
                this.resultsContainer.textContent += `${item.formatString}: ${item.text}\n\n`;
                console.log(`${item.formatString}: ${item.text}`)
            }
        }
    },

    stopScanning: function (){
        console.log('stop scanning')
        this.router?.dispose();
        this.cameraEnhancer?.dispose();
    
        // 去除video节点
        let ui =  this.view?.getUIElement();
        if(ui) {
            this.cameraViewContainer?.removeChild(ui)
        }
    
        this.startButton.disabled = false
        this.stopButton.disabled = true
    },
}

window.onload = async function (){
    console.log('window onload, init dynamsoft')
    barcodeDecode.init()
}

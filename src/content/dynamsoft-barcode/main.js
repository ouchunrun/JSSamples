
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
    barcodeCount: 0, // 扫描到的条码数量
    
    /**
     * 初始化页面元素
     */
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

        this.clearAllStorage()

        // 非必须
        // this.initDynamsoftLicense()

        this.startScanning()
    },

    /**
     * 初始化dynamsoft license
     */
    initDynamsoftLicense: function(){
        console.log('Init dynamsoft license')
        Dynamsoft.License.LicenseManager.initLicense(this.dynamsoftLicense)
        Dynamsoft.Core.CoreModule.loadWasm(["dbr"])
    },

    updateCameraViewStyle:  function(){
        if(!this.UIElement) {
            return
        }

        let changeSelectStyle = function(element){
            if(!element){
                return
            }
            
            element.style.width = '300px'
            element.style.height = '40px'
            element.style.backgroundColor = '#dce0e5'
            element.style.fontWeight = 'bold'
        }

        let container = this.UIElement.shadowRoot.querySelector("div > div:nth-child(5)")
        if(container){
            // container.style.left = '5px'
            container.style.left = ''
            container.style.right = '5px'
            container.style.top = '5px'
        }
        let cameraSelect = container.querySelector("select.dce-sel-camera")
        if(cameraSelect) {
            changeSelectStyle(cameraSelect)
        }

        let resolutionSelect = container.querySelector("select.dce-sel-resolution")
        if(resolutionSelect){
            changeSelectStyle(resolutionSelect)
        }
    },

    /**
     * 开始扫描
     */
    startScanning: async function (){
        console.log('start scanning')
        // this.resultsContainer.textContent = '' // 重新开始扫描时，清除之前的扫描内容
        this.startButton.disabled = true
        this.stopButton.disabled = false
    
        this.router = await Dynamsoft.CVR.CaptureVisionRouter.createInstance()
        this.view = await Dynamsoft.DCE.CameraView.createInstance()
        this.cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(this.view)
        this.router.setInput(this.cameraEnhancer)
        
        // 添加video显示视频流
        let UIElement = await this.view.getUIElement()
        this.UIElement = UIElement
        this.updateCameraViewStyle()
        this.cameraViewContainer.append(UIElement)
        // 处理扫描结果
        this.router.addResultReceiver({ onDecodedBarcodesReceived: this.handleBarcodeDecodeResult.bind(this) })
    
        let filter = new Dynamsoft.Utility.MultiFrameResultCrossFilter()
        // filter.enableResultCrossVerification("barcode", true)
        // filter.enableResultDeduplication("barcode", true)
        await this.router.addResultFilter(filter)
        
    
        await this.cameraEnhancer.open()
        await this.router.startCapturing("ReadSingleBarcode")
    },

    /**
     * 处理扫描结果
     */
    handleBarcodeDecodeResult: function(result){
        console.log('result.barcodeResultItems:', result.barcodeResultItems)
        if (result.barcodeResultItems?.length > 0) {
            let preBarcodeList = Array.from(this.resultsContainer.querySelectorAll('.barcode-text')).map(item => item.textContent);
            let fragment = document.createDocumentFragment()
            for (let item of result.barcodeResultItems) {
                // 添加扫描结果
                let barcodeText = item.text
                let barcodeFormat = item.formatString
                let newBarcodeContent = `${barcodeFormat}: ${barcodeText}`
                if(!preBarcodeList.includes(barcodeText)) {
                    console.log(`Get new barcode: ${newBarcodeContent}`)
                    this.barcodeCount++

                    let newChild = document.createElement('div')
                    newChild.classList.add('barcode-list-nav')

                    let barcodeFormatSpan = document.createElement('span')
                    barcodeFormatSpan.classList.add('barcode-format')
                    barcodeFormatSpan.textContent = this.barcodeCount + '. ' + barcodeFormat + ': '
                    newChild.appendChild(barcodeFormatSpan)
                    
                    let newBarcodeContentSpan = document.createElement('span')
                    newBarcodeContentSpan.textContent = barcodeText
                    newBarcodeContentSpan.classList.add('barcode-text')
                    newChild.appendChild(newBarcodeContentSpan)

                    let copyButton = document.createElement('span')
                    copyButton.classList.add('copy-button')
                    copyButton.innerText = 'Copy'
                    // 点击拷贝文本到剪切板
                    copyButton.onclick = async function(){
                        await navigator.clipboard.writeText(barcodeText)
                        copyButton.innerText = 'Copied'
                        copyButton.classList.add('copy-button-Copied')
                        setTimeout(() => {
                            copyButton.innerText = 'Copy'
                            copyButton.classList.remove('copy-button-Copied')
                        }, 2000)
                    }
                    newChild.appendChild(copyButton)
                    
                    fragment.appendChild(newChild)
                }else {
                    // Duplicate barcode
                }
            }

            if(fragment) {
                  this.resultsContainer.appendChild(fragment)
            }
        }
    },

    /**
     * 停止扫描
     */
    stopScanning: function (){
        console.log('stop scanning')
        this.router?.dispose()
        this.cameraEnhancer?.dispose()
    
        // 去除video节点
        let ui =  this.view?.getUIElement()
        if(ui) {
            this.cameraViewContainer?.removeChild(ui)
        }
    
        this.startButton.disabled = false
        this.stopButton.disabled = true
    },

    /**
     * 清除所有存储
     */
    clearAllStorage: function (){
        console.log('clear all storage')
         // 清除 localStorage
        localStorage.clear()
        
        // 清除 sessionStorage
        sessionStorage.clear()
    }
}

window.onload = async function (){
    console.log('window onload, init dynamsoft')
    barcodeDecode.init()
}

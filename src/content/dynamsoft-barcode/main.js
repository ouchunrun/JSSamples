
let barcodeDecode = {
    // 页面元素
    startButton: null,
    stopButton: null,
    captureImageButton: null,
    fileUploadInput: null,
    cameraViewContainer: null,
    resultsContainer: null,
    decodeTip: null,
    decodeText: null,

    // 扫码相关变量
    dynamsoftLicense: 'DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9',
    route: null,
    view: null,
    cameraEnhancer: null,
    barcodeCount: 0, // 扫描到的条码数量
    errorTipInterval: null, // 错误提示的定时器

    EnumCapturedScanType: {
        IMAGE: 1, // 图片
    },
    EnumCapturedResultItemType: {
        CRIT_BARCODE: 2, // 图片
    },
    
    /**
     * 初始化页面元素
     */
    init: function (){
        console.log('init dom variables')
        this.startButton = document.getElementById('start')
        this.stopButton = document.getElementById('stop')
        this.captureImageButton = document.getElementById('captureImage')
        this.fileUploadInput = document.getElementById('fileUpload')
        this.cameraViewContainer = document.getElementById('cameraViewContainer')
        this.resultsContainer = document.querySelector("#results")
        this.decodeTip = document.querySelector('.decode-tip')
        this.decodeText = document.querySelector('.decode-tip-text')

        this.startButton.addEventListener('click',  this.startScanning.bind(this))
        this.stopButton.addEventListener('click',  this.stopScanning.bind(this))
        this.captureImageButton.addEventListener('click',  this.startCaptureImage.bind(this))
        this.fileUploadInput.addEventListener('change',  this.handleFileOnChange.bind(this))
        this.stopButton.disabled = true
        this.startButton.disabled = false

        // worker 解析条码时会校验license，否则返回 “No license found for Dynamsoft Barcode Reader.”错误
        this.initDynamsoftLicense()

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
            element.style.backgroundColor = 'rgb(0 0 0)'
            element.style.fontWeight = 'bold'
            element.style.color = 'aliceblue'
            element.style.padding = '0 5px'
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
     * 图片识别
     */
     startCaptureImage: function(){
        console.log('start capture image')
        this.stopScanning()

        this.fileUploadInput.click()
    },

    /**
     * 处理上传的文件
     */
    handleFileOnChange: async function(e){
        console.log('handle file on change')
        let files = e.target.files
        
        this.router = await Dynamsoft.CVR.CaptureVisionRouter.createInstance()
        for (let file of files) {
            // Decode selected image with 'ReadBarcodes_SpeedFirst' template.
            const result = await this.router.capture(file, 'ReadBarcodes_SpeedFirst')
            if (!result.items.length){
                console.log('No barcode found!')
                continue
            }

            console.log('Get captured results: ', result)
            this.handleBarcodeDecodeResult(result, this.EnumCapturedScanType.IMAGE)

            this.showCapturedImage(file)
        }
    },

    /**
     * 页面显示处理的图片
     */
    showCapturedImage: function(file){
        let _this = this
        let reader = new FileReader()
        reader.onload = function(e){
            let image = new Image()
            image.src = e.target.result
            image.onload = function() {
                console.log('Show captured image in page')
                _this.cameraViewContainer.append(image)
            };
            image.onerror = function() {
                console.error('Error reading file:', this.src)
            }
        }
        reader.readAsDataURL(file) // 开始读取图片
    },

    /**
     * 开始扫描
     */
    startScanning: async function (){
        console.log('start scanning')
        try {
            this.cameraViewContainer.innerHTML = ''
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
            await this.router.addResultFilter(filter)
        
            await this.cameraEnhancer.open()
            await this.router.startCapturing("ReadSingleBarcode")
        }catch (e) {
            this.onErrorCatch(e)
        }
    },

    /**
     * 处理扫描结果
     */
    handleBarcodeDecodeResult: function(result, ScanType){
        if (result.barcodeResultItems?.length > 0) {
            let preBarcodeList = Array.from(this.resultsContainer.querySelectorAll('.barcode-text')).map(item => item.textContent);
            let fragment = document.createDocumentFragment()
            for (let item of result.barcodeResultItems) {
                if (ScanType === this.EnumCapturedScanType.IMAGE && item.type !== this.EnumCapturedResultItemType.CRIT_BARCODE) {
                    console.log('Not a barcode item:', item)
                    continue; // check if captured result item is a barcode
                }

                // 添加扫描结果
                let barcodeText = item.text
                let barcodeFormat = item.formatString
                let newBarcodeContent = `${barcodeFormat}: ${barcodeText}`
                if(!preBarcodeList.includes(barcodeText)) {
                    console.log(`Get new barcode: ${newBarcodeContent}`)
                    this.barcodeCount++

                    let newChild = document.createElement('div')
                    newChild.classList.add('barcode-list-nav')

                    // Copy 按钮
                    let copyButton = document.createElement('span')
                    copyButton.classList.add('copy-button')
                    copyButton.innerText = 'Copy'
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

                    let barcodeChild = document.createElement('div')
                    barcodeChild.classList.add('barcode-content')
                    // 类型： 二维码或条码类型
                    let barcodeFormatSpan = document.createElement('span')
                    barcodeFormatSpan.classList.add('barcode-format')
                    barcodeFormatSpan.textContent = this.barcodeCount + '.' + barcodeFormat + ': '
                    barcodeChild.appendChild(barcodeFormatSpan) 
                    // 条码值
                    let newBarcodeContentSpan = document.createElement('span')
                    newBarcodeContentSpan.textContent = barcodeText
                    newBarcodeContentSpan.classList.add('barcode-text')
                    barcodeChild.appendChild(newBarcodeContentSpan)
                    
                    newChild.appendChild(barcodeChild)
                    fragment.appendChild(newChild)
                }else {
                    // Duplicate barcode
                    // console.log('Duplicate barcode:', newBarcodeContent)
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
        try{
            if(this.router && !this.router.bDestroyed){
                this.router.dispose()
            }

            if(this.cameraEnhancer && !this.cameraEnhancer.disposed){
                this.cameraEnhancer.dispose()
            }

            // 去除video节点
            let ui = this.view?.getUIElement()
            if(ui) {
                this.cameraViewContainer?.removeChild(ui)
            }
        
            this.startButton.disabled = false
            this.stopButton.disabled = true
        }catch (e){
            // console.log('Stop scanning error:', e)
        }
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
        // 清除所有缓存
        this.clearCache()
        // 清除cookies
        this.clearAllCookies()
        // 清除indexedDB
        const knownDatabases = ['dynamdlsinfo', 'dynamdlsunsZGpJPQ==ADBkVzVrWldacGJtVms=', 'dynamjssdkhello', 'dynamltsinfo']
        this.deleteAllDatabases(knownDatabases)
    },

    clearCache: async function (cacheName) {
        const isDeleted = await caches.delete(cacheName);
        if (isDeleted) {
            console.log(`cache ${cacheName} cleared`)
        } else {
            console.log(`cache ${cacheName} not exist or clear failed`)
        }
    },

    clearAllCookies: function () {
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i]
            const eqPos = cookie.indexOf('=')
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
        console.log('All cookies cleared')
    },

    deleteAllDatabases: function (databases) {
        if (databases.length === 0) {
            console.warn('All databases deleted successfully')
            return
        }
    
        const dbName = databases.shift()
        const request = indexedDB.deleteDatabase(dbName)
        let This = this
        request.onsuccess = function(event) {
            console.log(`Database ${dbName} deleted successfully`)
            This.deleteAllDatabases(databases)
        }
    
        request.onerror = function(event) {
            console.error(`An error occurred while deleting database ${dbName}`, event.target.error)
            This.deleteAllDatabases(databases)
        }
    },

    /**
     * 和背景页简历连接，用于插件
     */
    initConnect: function(){
        let extensionNamespace
        if (window.chrome && window.chrome.runtime && window.chrome.runtime.connect) { // chrome
            extensionNamespace = chrome
        } else if (window.browser && window.browser.runtime && window.browser.runtime.connect) { // firefox
            extensionNamespace = browser
        }

        if(extensionNamespace) {
            this.extensionNamespace = extensionNamespace
            console.log('init connect to backgroundJS')
            let popupPort = this.extensionNamespace.runtime.connect({ name: 'popup' })
            if (popupPort) {
                // 监听连接断开事件，避免同时打开多个popup页面
                popupPort.onDisconnect.addListener(function (e) {
                    console.log('Connection is disconnected, close Popup page')
                    window.close()
                })
                this.popupPort = popupPort
            }
        }
   
        window.resizeTo(window.screen.width, window.screen.height)
    },

    /**
     * 和背景页间的消息通信
     */
    popupSendMessage2Background: function(message){
        if (!message) {
            return
        }
    
        message.requestType = 'popupMessage2Background'
        try {
            this.popupPort.postMessage(message)
        } catch (e) {
            console.log('popupSendMessage2Background error :', e)
            this.initConnect()
    
            if (this.popupPort) {
                this.popupPort.postMessage(message)
            }
        }
    },

    /**
     * 异常捕获处理
     */
    onErrorCatch: function(e){
        // console.error('Error catch:', e)
        let errorMsg = e.errorString || e        
        let errorText = ''
        if(e.errorCode) {
            errorText = `Error: [${e.errorCode}] ${errorMsg}`
        }else {
            errorText = `Error: ${errorMsg}`
        }
        
        if(this.errorTipInterval){
            clearTimeout(this.errorTipInterval)
            this.errorTipInterval = null
        }

        if(this.decodeText.innerText !== errorText) {
            console.error('Error catch:', e)
            this.decodeText.innerText = errorText
            this.decodeTip.classList.remove('hide')
        }

        // this.errorTipInterval = setTimeout(() => {
        //     this.decodeTip.classList.add('hide')
        // }, 3000)        
    },
}

window.onload = async function (){
    barcodeDecode.clearAllStorage()
    console.log('window onload, init dynamsoft')
    barcodeDecode.init()
    // 初始化插件处理
    barcodeDecode.initConnect()
}

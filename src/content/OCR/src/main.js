// Tesseract.createWorker

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
    init: async function (){
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

        this.worker = await Tesseract.createWorker("eng", 1, {
          corePath: './dist/tesseract.js-core',
          workerPath: "./dist/tesseract.js/worker.min.js",
        //   logger: function(m){console.log(m);}
        })
        console.warn('create Tesseract worker', this.worker)
        // this.startScanning()
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
        for (let file of files) {
            console.log('process file:', file)
            // 把选择的图片添加到页面上
            this.showCapturedImage(file)

            const imageUrl = URL.createObjectURL(file)
            const result = await this.worker.recognize(imageUrl)
            console.log('Get captured results: ', result)
            this.handleBarcodeDecodeResult(result, this.EnumCapturedScanType.IMAGE)
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

        }catch (e) {
            this.onErrorCatch(e)
        }
    },

    /**
     * 停止扫描
     */
    stopScanning: function (){
        console.log('stop scanning')
        try{
            this.startButton.disabled = false
            this.stopButton.disabled = true
        }catch (e){
            // console.log('Stop scanning error:', e)
        }
    },

    /**
     * 处理扫描结果
     */
    handleBarcodeDecodeResult: function(result, ScanType){
        if(!result || !result.data || !result.data.text){
            this.onErrorCatch('No text found')
            return
        }
        
        console.log('result:', result)
        let resultItems = {}
        for(let i = 0; i< result.data.lines.length; i++){
            let item = result.data.lines[i]
            let targetText = item.text?.split('\n')[0]
            console.log('targetText:', targetText)

            if(targetText.includes('SIN')){
                if(!targetText.startsWith('SIN')){
                    // 去除 SIN 字符前面的部分
                    targetText = targetText.replace(/^[^SIN]+/, '')
                }
                resultItems.SIN = targetText.split(' ')[1]
            } else if(targetText.includes('MAC')){
                if(!targetText.startsWith('MAC')){
                    // 去除 MAC 字符前面的部分
                    targetText = targetText.replace(/^[^MAC]+/, '')
                }
                resultItems.MAC = targetText.split(' ')[1]
            } else if(targetText.includes('P/N')){
                //  p/N 962-00143-50A (W) 中截取版本号，并添加小数点： 5.0A
                const str = targetText.replace(/^[^P/N]+/, '')
                resultItems.PN = str.split(' ')[1]
                resultItems.VERSION = str.split(' ')[1]?.split('-')[2].replace(/(\d)(\d)/, '$1.$2')
            } 
        }
        
        console.log("resultItem is:", resultItems)

        let preBarcodeList = Array.from(this.resultsContainer.querySelectorAll('.barcode-text')).map(item => item.textContent)
        let fragment = document.createDocumentFragment()

        // 添加扫描结果
        if(!preBarcodeList.includes(resultItems.MAC)) {
            this.barcodeCount++

            let newChild = document.createElement('div')
            newChild.classList.add('barcode-list-nav')

            let copyButton
            if(resultItems.SIN){
                let child1 = document.createElement('span')
                child1.classList.add('barcode-content')
                child1.textContent = this.barcodeCount + '.SIN: ' + resultItems.SIN
                copyButton = this.createCopyButton(resultItems.SIN)
                child1.appendChild(copyButton)
                newChild.appendChild(child1)
            }

            if(resultItems.MAC){
                let child2 = document.createElement('span')
                child2.classList.add('barcode-content')
                child2.textContent = this.barcodeCount + '.MAC: ' + resultItems.MAC
                copyButton = this.createCopyButton(resultItems.MAC)
                child2.appendChild(copyButton)
                newChild.appendChild(child2)
            }

            if(resultItems.VERSION){
                let child3 = document.createElement('span')
                child3.classList.add('barcode-content')
                child3.textContent = this.barcodeCount + '.VERSION: ' + resultItems.VERSION
                copyButton = this.createCopyButton(resultItems.VERSION)
                child3.appendChild(copyButton)
                newChild.appendChild(child3)
            }

            fragment.appendChild(newChild)
        }

        if(fragment) {
            this.resultsContainer.appendChild(fragment)
        }
    },

    createCopyButton: function(text){
        let copyButton = document.createElement('span')
        copyButton.classList.add('copy-button')
        copyButton.innerText = 'Copy'
        copyButton.onclick = async function(){
            await navigator.clipboard.writeText(text)
            copyButton.innerText = 'Copied'
            copyButton.classList.add('copy-button-Copied')
            setTimeout(() => {
                copyButton.innerText = 'Copy'
                copyButton.classList.remove('copy-button-Copied')
            }, 2000)
        }
        return copyButton
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
    },
}

window.onload = async function(){
    console.log('window onload, init dynamsoft')
    barcodeDecode.init()
    // const worker = await Tesseract.createWorker('eng')
    // console.log('worker:', worker)
    // const ret = await worker.recognize('eng_bw.png')
    // console.log("识别结果:", ret.data.text)
    // await worker.terminate();
}

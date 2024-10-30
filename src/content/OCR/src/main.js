// Tesseract.createWorker

let imageRecognizer = {
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
    videoRecognizer: true, // 识别视频
    videoScanning: false,

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

        this.deviceSelect = document.getElementById('videoList')
        this.video = document.getElementById('video')
        this.canvas = document.getElementById('canvas')
        this.video.addEventListener('loadeddata',  this.handleVideoLoadeddata.bind(this))

        this.startButton.addEventListener('click',  this.startCamera.bind(this))
        this.stopButton.addEventListener('click',  this.stopScanning.bind(this))
        this.captureImageButton.addEventListener('click',  this.startCaptureImage.bind(this))
        this.fileUploadInput.addEventListener('change',  this.handleFileOnChange.bind(this))
        this.stopButton.disabled = true
        this.startButton.disabled = false

        this.worker = await Tesseract.createWorker("eng", 1, {
          corePath: './dist/tesseract.js-core',
          workerPath: "./dist/tesseract.js/worker.min.js",
          logger: function(m){
            // console.log(m);
        }
        })
        console.warn('create Tesseract worker', this.worker)

        // 要获取当前设备上的摄像头列表
        this.enumDevices(this.startCamera.bind(this))
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
        this.stopScanning()

        let files = e.target.files
        for (let file of files) {
            console.log('process file:', file)
            // 把选择的图片添加到页面上
            this.showUploadImage(file)

            this.recognizeText('IMAGE', file)
        }
    },

    /**
     * 显示上传的文件
     */
    showUploadImage: function(file){
        let _this = this
        let reader = new FileReader()
        reader.onload = function(e){
            let image = new Image()
            image.src = e.target.result
            image.onload = function() {
                console.log('Show upload file image in page')
                _this.cameraViewContainer.append(image)
            };
            image.onerror = function() {
                console.error('Error reading file:', this.src)
            }
        }
        reader.readAsDataURL(file) // 开始读取图片
    },

    /**
     * 页面显示处理的图片
     */
    showCapturedImage: function(imageUrl){
        console.log('Show captured image in page:', imageUrl)
        let _this = this
        let image = new Image()
        image.src = imageUrl
        image.onload = function() {
            console.log('Show captured image in page')
            _this.cameraViewContainer.append(image)
        };
        image.onerror = function() {
            console.error('Error reading file:', this.src)
        }
    },

    /**
     * 开始扫描
     */
    startCamera: async function (){
        console.log('start scanning')
        try {
            // this.cameraViewContainer.innerHTML = ''
            this.startButton.disabled = true
            this.stopButton.disabled = false
            this.videoRecognizer = true

            let constrains = {
                video: {
                    deviceId: this.deviceSelect.value || '',
                    width: {
                        ideal: 1920,
                        max: 1920
                    },
                    height: {
                        ideal: 1080,
                        max: 1080
                    },
                    frameRate: { ideal: 15 }
                },
                audio: false // 不需要音频流
            }
            console.log('get media constrains: \r\n', JSON.stringify(constrains, null, '    '))
            const stream = await navigator.mediaDevices.getUserMedia(constrains)
            this.video.srcObject = stream
            this.videoStream = stream
        }catch (e) {
            this.onErrorCatch(e)
        }
    },

    /**
     * video加载成功后，开始识别文本
     */
    handleVideoLoadeddata: function(){
        console.log(
            "Yay! readyState just increased to  " +
              "HAVE_CURRENT_DATA or greater for first time.",
          );
        console.log(`video.videoWidth ${ this.video.videoWidth}, video.videoHeight ${this.video.videoHeight}`)
        this.recognizeText('VIDEO')
    },

    /**
     * 识别图片
     */
    recognizeText: async function(type, file){
        let imageUrl 
        if(type === 'IMAGE'){
            imageUrl = URL.createObjectURL(file)
            console.log('get IMAGE Url:', imageUrl)
        }else {
            let canvas = this.canvas
            const context = canvas.getContext('2d')
            canvas.width = this.video.videoWidth
            canvas.height = this.video.videoHeight
            context.drawImage(this.video, 0, 0, canvas.width, canvas.height)
             // 将 canvas 图像转换为 Data URL
            imageUrl = canvas.toDataURL('image/png')
            // console.log('get Video IMAGE Url:', imageUrl)

            // 识别的图像显示在页面上
            // this.showCapturedImage(imageUrl)
        }

        const result = await this.worker.recognize(imageUrl)
        if(this.videoRecognizer){
            console.log('video recognizer, start next process.')
            this.recognizeText('VIDEO')
        }

        this.handleRecognizeResult(result, this.EnumCapturedScanType.IMAGE)
    },

    /**
     * 处理扫描结果
     */
    handleRecognizeResult: function(result, ScanType){
        if(!result || !result.data || !result.data.text){
            this.onErrorCatch('No text found')
            return
        }
        
        console.log('result:', result.data.text)
        let resultItems = {}
        for(let i = 0; i< result.data.lines.length; i++){
            let item = result.data.lines[i]
            let targetText = item.text?.split('\n')[0]
            // console.log('targetText:', targetText)

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
        if(Object.keys(resultItems).length > 0){
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
            }else {
                console.log('Nothing to get!')
                this.onErrorCatch('Nothing to get!')
            }
        }else {
            console.log('Nothing to get!')
            this.onErrorCatch('Nothing to get!')
        }
    },

    /**
     * 创建copy按钮
     */
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
     * 停止扫描
    */
    stopScanning: function (){
        console.log('stop scanning')
        try{
            this.startButton.disabled = false
            this.stopButton.disabled = true

            if(this.videoStream){
                this.videoStream.getTracks().forEach(track => track.stop())
                this.video.srcObject = null
            }
            this.videoRecognizer = false
        }catch (e){
            // console.log('Stop scanning error:', e)
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
    },

    getSelectedDeviceId: function(){
        
    },

    /**
     * 添加设备下拉框
     */
    handleDeviceData: function(deviceInfo){
        console.warn("deviceInfo: ", deviceInfo)
        console.warn("deviceInfo: \n", JSON.stringify(deviceInfo, null, '    '))
        deviceInfoDiv.value = JSON.stringify(deviceInfo, null, '    ' );
    
        if (deviceInfo.cameras) {
            for (var i = 0; i < deviceInfo.cameras.length; i++) {
                if (!deviceInfo.cameras[i].label) {
                    deviceInfo.cameras[i].label = 'camera' + i
                }
                videoInputList.push('<option class="cameraOption" value="' + deviceInfo.cameras[i].deviceId + '">' + deviceInfo.cameras[i].label + '</option>')
            }
            document.getElementById('videoList').innerHTML = videoInputList.join('')
        }
    },

    /**
     * 获取已有设备列表
     */
    enumDevices: function(callback){
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.warn("browser don't support enumerateDevices() .");
            return;
        }
    
        navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
            let cameraList = []
            for (let i = 0; i < deviceInfos.length; i++) {
                let deviceInfo = deviceInfos[i]
                if(deviceInfo.deviceId === 'default' || deviceInfo.deviceId === 'communications'){
                    if(localStorage.showDefaultCommunicationsDevice === 'false'){
                        continue
                    }
                }
                if (deviceInfo.kind === 'videoinput') {
                    cameraList.push({
                        label: deviceInfo.label,
                        deviceId: deviceInfo.deviceId,
                        groupId: deviceInfo.groupId,
                        status: 'available',
                        capability: []
                    })
                }
            }
    
            if(cameraList.length > 0){
                let videoInputList = []
                for (let i = 0; i < cameraList.length; i++) {
                    if (!cameraList[i].label) {
                        cameraList[i].label = 'camera' + i
                    }
                    videoInputList.push('<option class="cameraOption" value="' + cameraList[i].deviceId + '">' + cameraList[i].label + '</option>')
                }
                document.getElementById('videoList').innerHTML = videoInputList.join('')
            }

            if(callback){
                callback()
            }
        }).catch(function (err) {
            console.error(err)
            this.onErrorCatch(err)
            if(callback){
                callback()
            }
        })
    },
}

window.onload = async function(){
    console.log('window onload, init dynamsoft')
    imageRecognizer.init()
}

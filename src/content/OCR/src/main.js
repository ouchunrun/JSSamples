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

    devicePatterns: {
        WP: /WP\d{1,3}/,
        GRP: /GRP\d{1,4}[a-zA-Z]{1,3}/,
        GCC: /GCC\d{1,4}/,
        GWN: /GWN\d{1,4}[a-zA-Z]{1,3}/,
        HT: /HT\d{1,4}/,
        GVC: /GVC\d{1,4}/,
        GAC: /GAC\d{1,4}/,
        GSC: /GSC\d{1,4}/,
        GDS: /GDS\d{1,4}/,
        GXP: /GXP\d{1,4}/,
        GHP: /GHP\d{1,4}/,
        GWN: /GWN\d{1,4}/,
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
        this.copyButton = document.getElementById('copy')

        this.deviceSelect = document.getElementById('videoList')
        this.deviceSelect.addEventListener('change',  this.handleDeviceSelectChange.bind(this))
        this.video = document.getElementById('video')
        this.canvas = document.getElementById('canvas')
        this.video.addEventListener('loadeddata',  this.handleVideoLoadeddata.bind(this))
        this.copyButton.addEventListener('click',  this.handleCopyButtonClickEvent.bind(this))

        this.startButton.addEventListener('click',  this.startCamera.bind(this))
        this.stopButton.addEventListener('click',  this.stopScanning.bind(this))
        this.captureImageButton.addEventListener('click',  this.startCaptureImage.bind(this))
        this.fileUploadInput.addEventListener('change',  this.handleFileOnChange.bind(this))
        this.stopButton.disabled = true
        this.startButton.disabled = false

        this.worker = await Tesseract.createWorker("eng", 1, {
            corePath: 'dist/tesseract.js-core',
            workerPath: "dist/tesseract.js/worker.min.js",
            // logger: function(m){
            //     console.log(m);
            // }
        })
        // this.worker = await Tesseract.createWorker("eng")
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

    handleDeviceSelectChange: function(){
        console.log('handle device select change')
        this.stopScanning()
        this.startCamera()
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
        }

        const result = await this.worker.recognize(imageUrl, 'eng') // 使用英文模型进行识别
        if(this.videoRecognizer){
            console.log('video recognizer, start next process.')
            this.recognizeText('VIDEO')
        }

        this.handleRecognizeResult(result, this.EnumCapturedScanType.IMAGE)
    },

    /**
     * 踢出目标文本
     */
    getFormattedScanResult: function (result){
        let resultItems = {}
        if(!result || !result.data || !result.data.text){
            return resultItems
        }

        console.log('result:', result)
        for(let i = 0; i< result.data.lines.length; i++){
            let item = result.data.lines[i]
            let targetText = item.text?.split('\n')[0]
            // console.log('targetText:', targetText)
            // 去除空字符串
            // targetText = targetText.filter(item => item !== '')

            if(targetText.includes('SIN')){
                if(!targetText.startsWith('SIN')){
                    // 去除 SIN 字符前面的部分
                    targetText = targetText.replace(/^[^SIN]+/, '')
                }
                resultItems.SIN = targetText.split(' ').filter(item => item !== '')[1]
            } else if(targetText.includes('MAC')){
                if(!targetText.startsWith('MAC')){
                    // 去除 MAC 字符前面的部分
                    targetText = targetText.replace(/^[^MAC]+/, '')
                }
                resultItems.MAC = targetText.split(' ').filter(item => item !== '')[1]
            } else if(targetText.includes('P/N')){
                //  p/N 962-00143-50A (W) 中截取版本号，并添加小数点： 5.0A
                const str = targetText.replace(/^[^P/N]+/, '')
                let splitResult = str.split(' ').filter(item => item !== '')
                resultItems.PN = splitResult[1]
                resultItems.VERSION = splitResult[1]?.split('-')[2]?.replace(/(\d)(\d)/, '$1.$2')
            } else {
                // get DEVICE_MODE
                let result = this.modelMatched(targetText)
                if(result && result.matchedString){
                    resultItems.DEVICE_MODE = result.matchedString
                }
            }
        }

        return resultItems
    },

    /**
     * 判断模式是否匹配，匹配则返回设备类型
     */
    modelMatched: function(str){
        for (const [model, pattern] of Object.entries(this.devicePatterns)) {
            const match = str.match(pattern);
            if (match) {
                return { model, matchedString: match[0] }
            }
        }
        return '';
    },
    
    /**
     * 正则校验MAC地址是否合法
     */
    checkMacAddress: function(macAddress){
        // 定义正则表达式，匹配12个十六进制字符
        const regex = /^[0-9A-Fa-f]{12}$/
        
        // 使用正则表达式进行匹配
        return regex.test(macAddress)
    },

    /**
     * 处理扫描结果
     */
    handleRecognizeResult: function(result, ScanType){
        if(!result || !result.data || !result.data.text){
            // this.onErrorCatch('No text found')
            return
        }
        
        console.log('result:', result.data.text)
        let resultItems = this.getFormattedScanResult(result)
        console.log("resultItem is:", resultItems)

        if(Object.keys(resultItems).length === 0){
            // this.onErrorCatch('No text found')
            return
        }

        // 校验MAC地址是否合法
        if(resultItems.MAC){
            if(this.checkMacAddress(resultItems.MAC)){
                let MacId = resultItems.MAC
                let existItem = document.getElementById(MacId)
                if(existItem){
                    // 更新设备显示内容， 更新规则为：xxx
                    if(resultItems.VERSION){
                        let deviceVer = existItem.children[0]
                        if(deviceVer){
                            console.log(`Update version as ${resultItems.VERSION}`)
                            deviceVer.innerText = `${resultItems.VERSION}`
                            deviceVer.setAttribute('device_ver', resultItems.VERSION)
                        }
                    }
    
                    if(resultItems.DEVICE_MODE){
                        let deviceMode = existItem.children[1]
                        if(deviceMode){
                            console.log(`Update mode as ${resultItems.DEVICE_MODE}`)
                            deviceMode.innerText = ` ${resultItems.DEVICE_MODE}`
                            deviceMode.setAttribute('device_mode', resultItems.DEVICE_MODE)
                        }
                    }
                } else {
                    this.barcodeCount++
                    let fragment = document.createDocumentFragment()
                    let newChild = document.createElement('div')
                    newChild.classList.add('barcode-list-nav')
                    newChild.innerText = `【Device${this.barcodeCount}】 `
    
                    let contentSpan = document.createElement('span')
                    contentSpan.id = MacId
                    contentSpan.className = 'device-content'
    
                    let verSpan = document.createElement('span')
                    verSpan.className = 'device-ver'
                    contentSpan.appendChild(verSpan)
                    let modeSpan = document.createElement('span')
                    modeSpan.className = 'device-mode'
                    contentSpan.appendChild(modeSpan)
                    let macSpan = document.createElement('span')
                    macSpan.className = 'device-mac'
                    contentSpan.appendChild(macSpan)
    
                    // 显示内容拼接为格式： V1.1A WP836 (MAC：EC74D751CB60) 
                    if(resultItems.VERSION){
                        verSpan.innerText = `V${resultItems.VERSION}`
                        verSpan.setAttribute('device_ver', resultItems.VERSION)
                    }
                    if(resultItems.DEVICE_MODE){
                        modeSpan.innerText = ` ${resultItems.DEVICE_MODE}`
                        modeSpan.setAttribute('device_mode', resultItems.DEVICE_MODE)
                    }
                    macSpan.innerText = `（MAC：${resultItems.MAC}）`
                    macSpan.setAttribute('device_mac', resultItems.MAC)
                    
                    newChild.appendChild(contentSpan)
                    fragment.appendChild(newChild)
                    this.resultsContainer.appendChild(fragment)
    
                    文本拷贝按钮
                    let copyButton = this.createCopyButton(contentSpan)
                    newChild.appendChild(copyButton)
    
                    // 设置newChild hover时，显示拷贝文本按钮
                    newChild.addEventListener('mouseenter', function(){
                        newChild.querySelector('.copy-button').classList.remove('hide')
                    })
                    newChild.addEventListener('mouseleave', function(){
                        newChild.querySelector('.copy-button').classList.add('hide')
                    })
                }
            }else {
                console.warn('Mac address is not valid:', resultItems.MAC)
            }
        }
    },

    /**
     * 创建copy按钮
     */
    createCopyButton: function(targetElement){
        let copyButton = document.createElement('span')
        copyButton.className = 'copy-button hide'
        copyButton.innerText = 'Copy'
        copyButton.onclick = async function(){
            console.log('Copy text:', targetElement.innerText)
            await navigator.clipboard.writeText(targetElement.innerText)
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
     * 点击拷贝全部结果
     */
    handleCopyButtonClickEvent: async function(e){
         // 获取所有 class 为 device-content 的元素
        const elements = document.querySelectorAll('.device-content')
        if(elements.length === 0){
            console.log('No device content found.')
            return
        }
        
        // 提取所有元素的文本内容并用换行符连接
        let textToCopy = Array.from(elements).map(element => element.textContent).join('\n')
        console.log('拷贝文本:', textToCopy)
        await navigator.clipboard.writeText(textToCopy)

        this.copyButton.innerText = 'Copied Success'
        this.copyButton.classList.add('copy-button-Copied')

        setTimeout(() => {
            this.copyButton.innerText = 'Copy All'
            this.copyButton.classList.remove('copy-button-Copied')
        }, 2000)
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
            // console.error('Error catch:', e)
            this.decodeText.innerText = errorText
            this.decodeTip.classList.remove('hide')
        }
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

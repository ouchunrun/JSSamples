
let javascriptBarcodeReader = {
    barcodeCount: 0, // 扫描到的条码数量
    errorTipInterval: null, // 错误提示的定时器

    /**
     * 初始化设置
     */
    init: function(){
        let This = this
        this.startButton = document.getElementById('start')
        this.stopButton = document.getElementById('stop')
        this.captureImageButton = document.getElementById('captureImage')
        this.fileUploadInput = document.getElementById('fileUpload')
        this.cameraViewContainer = document.getElementById('cameraViewContainer')
        this.resultsContainer = document.querySelector("#results")
        this.decodeTip = document.querySelector('.decode-tip')
        this.decodeText = document.querySelector('.decode-tip-text')
        this.video = document.getElementById('video')
        
        this.startButton.addEventListener('click', This.starScanning.bind(this))
        this.stopButton.addEventListener('click', This.stopScanning.bind(this))
        this.captureImageButton.addEventListener('click', function() {
            console.log('image upload button click')
            This.fileUploadInput.click()
            This.captureImageButton.disabled = true
        });
        this.fileUploadInput.addEventListener('change', This.handleInputOnchangeEvent.bind(this), false)

        console.log('init BarcodeReader...')
        BarcodeReader.Init()
        BarcodeReader.SetImageCallback(This.handleBarcodeReaderCallback.bind(this))
        BarcodeReader.SetStreamCallback(This.handleBarcodeReaderCallback.bind(this))
    },

    /**
     * 处理文件上传input的change事件
     */
    handleInputOnchangeEvent: function(evt){
        let This = this
        let file = evt.target.files[0]
        console.log('handle input onchange file:', file)
        let reader = new FileReader()
        reader.onloadend = function () {
            let img = new Image()
            img.src = reader.result
            img.onload = function() {
                console.log('Show captured image in page')
                This.cameraViewContainer.append(img)
            };
            img.onerror = function() {
                console.error('Error reading file:', this.src)
            }
            // console.log('Decode image in BarcodeReader, img:', reader.result)
            console.log('Decode image in BarcodeReader')
            BarcodeReader.DecodeImage(img)

            This.fileUploadInput.value = ''
        }
        reader.readAsDataURL(file)
    },

    /**
     * 开始解码
     */
    starScanning: async function (){
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            this.stream = stream
            this.video.srcObject = stream
            console.log('stream:', stream)
            // TODO: 这里参数需要传递 video Element， 不是stream
            BarcodeReader.DecodeStream(this.video)

            this.startButton.disabled = true
            this.stopButton.disabled = false
            this.captureImageButton.disabled = true
          } catch (error) {
            console.error('Error accessing camera:', error)
            this.onErrorCatch(error)
          }
    },
    
    /**
     * 停止解码
     */
    stopScanning: function(){
        console.log('stop scanning')
        BarcodeReader.StopStreamDecode()
        if(this.stream){
            this.stream.getTracks().forEach(track => {
                console.log('Stop track', track.label)
                track.stop()
            })
        }
        this.stream = null
        this.video.srcObject = null
        this.startButton.disabled = false
        this.stopButton.disabled = true
        this.captureImageButton.disabled = false
    },

    /**
     * 处理解码结果
     */
    handleBarcodeReaderCallback: function (barcodeResultItems) {
        console.warn('get barcode reader result:', barcodeResultItems)
        this.captureImageButton.disabled = false

        if (!barcodeResultItems.length) {
            this.onErrorCatch({ errorString: 'Decode error'})
            return
        }
        
        let preBarcodeList = Array.from(this.resultsContainer.querySelectorAll('.barcode-text')).map(item => item.textContent);
        let fragment = document.createDocumentFragment()
        for (let item of barcodeResultItems){
            // 添加扫描结果
            let barcodeText = item.Value
            let barcodeFormat = item.Format
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
    },

    /**
     * error 处理和相似
     */
    onErrorCatch: function(e){
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

    /**
     * 判断当前是否属于ios移动端，兼容input同时调用手机相册和相机
     */
    compatibleInput: function(){
         //获取浏览器的userAgent,并转化为小写
         let ua = navigator.userAgent.toLowerCase()
        //判断是否是苹果手机，是则是true
        let isIos = (ua.indexOf('iphone') != -1) || (ua.indexOf('ipad') != -1)
        if (isIos) {
            this.fileUploadInput.removeAttr("capture")
        }
    }
}

window.onload = function () {
    javascriptBarcodeReader.init()
}


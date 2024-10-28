

let javascriptBarcodeReader = {
    barcodeCount: 0, // 扫描到的条码数量
    errorTipInterval: null, // 错误提示的定时器

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
        
        this.captureImageButton.addEventListener('click', function() {
            console.log('image upload button click')
            This.fileUploadInput.click()
            This.captureImageButton.disabled = true
        });
        this.fileUploadInput.addEventListener('change', This.handleInputOnchangeEvent.bind(this), false)

        this.startButton.disabled = true
        this.stopButton.disabled = true

        console.log('init BarcodeReader...')
        BarcodeReader.Init()
        BarcodeReader.SetImageCallback(This.handleImageBarcodeReaderCallback.bind(this))
    },

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
            BarcodeReader.DecodeImage(img)
            This.fileUploadInput.value = ''
        }
        reader.readAsDataURL(file)
    },

    handleImageBarcodeReaderCallback: function (barcodeResultItems) {
        console.warn('get barcode reader result:', barcodeResultItems)
        this.captureImageButton.disabled = false

        if (!barcodeResultItems.length) {
            this.onErrorCatch({ errorString: '条形码读取失败'})
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

    stopScanning: function(){
        console.log('stop scanning')
    },

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


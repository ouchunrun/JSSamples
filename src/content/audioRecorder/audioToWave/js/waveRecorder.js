
/**
 * let mediaStreamSource = audioCtx.createMediaStreamSource(destination.stream)
 * @param config
 * @constructor
 */
function Recorder(config, data) {
    if (!Recorder.isRecordingSupported()) {
        console.error('AudioContext or WebAssembly is not supported')
        return
    }

    if (!config) {
        config = {}
    }

    this.config = Object.assign({
        bufferLength: 4096,                 // scriptProcessorNode 用于捕获音频的缓冲区的长度。默认为4096.
        mediaTrackConstraints: true,        // 指定媒体轨道约束的对象。默认为true.
        monitorGain: 0,                     // 设置监控输出的增益。增益是一个介于 0 和 1 之间的加权值。默认为 0
        numberOfChannels: 1,                // 要记录的通道数。 1 = 单声道，2 = 立体声。默认为 1。最多支持 2 个通道。
        recordingGain: 1,                   // 设置录音输入的增益。增益是一个介于 0 和 1 之间的加权值。默认为 1
        reuseWorker: false,
        originalSampleRate: undefined,   // context.sampleRate
        desiredSampleRate: 8000,
        numberOfChannels: 1,
        mimeType: 'audio/wav'
    }, config)
    console.log('Recorder config: ', JSON.stringify(this.config, null, '    '))

    this.recording = false
    this.fileName = null
    this.audioContext = null
    this.recoderOptions = data
    this.stream = null
    this.recordingDuration = data.recordingDuration || 30   // 指定录制时长，默认最大30秒
    this.fadeOutEnabled = data.audioFadeOut
    this.fadeOutBeenSet = false            // 是否设置渐弱 已设置
    this.gainFadeOutTime = this.recordingDuration * 0.15            // 音频渐弱时间
    this.recorderStopHandler = null     // 停止record的回调处理函数
}


Recorder.ERROR_MESSAGE = {
    ERROR_CODE_1001: {
        responseCode: 'INVALID_PARAMETER', // 无效参数
        message: 'Invalid parameter'
    },
    ERROR_CODE_1002: {
        responseCode: 'AUDIOCONTEXT_NOT_SUPPORTED', // AudioContext 接口不支持
        message: 'AudioContext is not supported !'
    },
    ERROR_CODE_1003: {
        responseCode: 'WEBASSEMBLY_NOT_SUPPORTED', // WebAssembly 接口不支持
        message: 'WebAssembly not supported !'
    },
    ERROR_CODE_1004: {
        responseCode: 'FILE_OVERSIZE', // 上传文件超过限制
        message: 'File size requirement does not exceed 9M !'
    },
    ERROR_CODE_1005: {
        responseCode: 'MIN_TIME_NOT_SATISFIED', // 上传文件最短时长不满足要求：不低于3秒
        message: 'File playing time does not reach the required minimum (3 second)'
    },
    ERROR_CODE_1006: {
        responseCode: 'ONLY_AUDIO_SUPPORTED', // 格式错误：只支持上传音频文件
        message: 'Only audio is supported!'
    },
    ERROR_CODE_1007: {
        responseCode: 'BROWSER_CONVERSION_NOT_SUPPORTED', // 当前浏览器不支持音频转换：比如safari
        message: 'Audio conversion is not supported in current browser!'
    },
    ERROR_CODE_1008: {
        responseCode: 'FORMAT_CONVERSION_ERROR', // 音频格式转换失败， .mid和部分 .wma 文件等无法正常转码
        message: 'CONVERSION ERROR: unable to decode audio data!'
    },
    // 其他未知错误
    ERROR_CODE_1009: function (error) {
        return {
            responseCode: 'UNKNOWN_ERROR',
            message: 'CONVERSION ERROR: ' + error || 'unknown error'
        }
    }
}

/**
 * 设置或更新目标录制时长
 * @param duration
 */
Recorder.prototype.setRecordingDuration = function (duration){
    if(!duration){
        return
    }

    this.recordingDuration = duration
    this.gainFadeOutTime = this.recordingDuration * 0.15
    console.log('set recording duration, ' + duration)
}

// Static Methods
Recorder.isRecordingSupported = function () {
    return AudioContext && window.WebAssembly
}

// Instance Methods
Recorder.prototype.clearStream = function () {
    if (this.stream) {
        if (this.stream.getTracks) {
            this.stream.getTracks().forEach(function (track) {
                track.stop()
            })
        } else {
            this.stream.stop()
        }

        delete this.stream
    }

    if (this.audioContext && this.closeAudioContext) {
        this.audioContext.close()
        delete this.audioContext
    }
}

Recorder.prototype.setRecordingGain = function (gain) {
    this.config.recordingGain = gain

    if (this.recordingGainNode && this.audioContext) {
        this.recordingGainNode.gain.setTargetAtTime(gain, this.audioContext.currentTime, 0.01)
    }
}

Recorder.prototype.setMonitorGain = function (gain) {
    this.config.monitorGain = gain

    if (this.monitorGainNode && this.audioContext) {
        this.monitorGainNode.gain.setTargetAtTime(gain, this.audioContext.currentTime, 0.01)
    }
}

/**
 * 声音渐弱处理
 */
Recorder.prototype.setRecordingGainFadeOut = function (timeLeft){
    console.log('set recording gain fade out, time left ' + timeLeft)
    if (this.recordingGainNode && this.audioContext) {
        this.recordingGainNode.gain.setValueAtTime(1, this.audioContext.currentTime)

        // 1.值的逐渐指数变化。更改从为上一个事件指定的时间开始，然后按照指数上升到 value 参数中给定的新值，并在 endTime 参数中给定的时间达到新值。
        // this.recordingGainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + timeLeft)

        // 2.值的逐渐线性变化。更改从为上一个事件指定的时间开始，然后线性增加到 value 参数中给定的新值，并在 endTime 参数中给定的时间达到新值。
        this.recordingGainNode.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + timeLeft)
    }
}


/**
 * 记录onaudioprocess获取到的buffer数据
 * @param inputBuffer
 */
Recorder.prototype.recorderBuffers = function (inputBuffer){
    let buffer = [];
    for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
        buffer.push(inputBuffer.getChannelData(channel))
    }
    this.worker.postMessage({command: 'record', buffer: buffer})
}

Recorder.prototype.initAudioGraph = function (sourceNode){
    let This = this
    // initAudioContext
    this.sourceNode = sourceNode
    if (sourceNode && sourceNode.context){
        this.audioContext = sourceNode.context
    }else {
        console.warn('sourceNode or context not found.')
    }
    this.config.originalSampleRate = this.audioContext.sampleRate

    this.scriptProcessorNode = this.audioContext.createScriptProcessor(
        this.config.bufferLength,
        this.config.numberOfChannels,
        this.config.numberOfChannels
    )
    this.scriptProcessorNode.connect(this.audioContext.destination)
    sourceNode.connect(this.scriptProcessorNode)

    // 此方法音频缓存，这里通过encodeBuffers方法进行缓存
    let audioprocessCount = 0
    let audioprocessDuration = 0
    let audioprocessTotalDuration = 0

    this.scriptProcessorNode.onaudioprocess = function (e) {
        if (!This.recording){
            console.warn('onaudioprocess recording false!!')
            return
        }
        if(!audioprocessDuration){
            audioprocessDuration = e.inputBuffer.duration
            console.log('get onaudioprocess trigger duration: ' + audioprocessDuration)
        }
        audioprocessCount++
        This.recorderBuffers(e.inputBuffer)

        audioprocessTotalDuration = audioprocessCount * audioprocessDuration
        let timeLeft = This.recordingDuration - audioprocessTotalDuration
        if (timeLeft > 0) {
            if(This.recorderStopHandler){
                This.recorderStopHandler({ state: 'running', totalDuration: audioprocessTotalDuration })
            }

            if (This.fadeOutEnabled && !This.fadeOutBeenSet && timeLeft <= This.gainFadeOutTime) {
                console.log('set audio fade out')
                This.setRecordingGainFadeOut(timeLeft)
                This.fadeOutBeenSet = true
            }
        } else {
            console.log('process count: ', audioprocessCount)
            console.log('audio process total duration: ', audioprocessTotalDuration)
            if(This.recorderStopHandler){
                This.recorderStopHandler({ state: 'stop' })
            }
        }
    }

    this.monitorGainNode = this.audioContext.createGain()
    this.setMonitorGain(this.config.monitorGain)
    this.monitorGainNode.connect(this.audioContext.destination)

    this.recordingGainNode = this.audioContext.createGain()
    this.setRecordingGain(this.config.recordingGain)
    this.recordingGainNode.connect(this.scriptProcessorNode)

    this.sourceNode.connect(this.monitorGainNode)
    this.sourceNode.connect(this.recordingGainNode)
}

Recorder.prototype.start = function (sourceNode, recorderStopHandler){
    this.recorderStopHandler = recorderStopHandler
    this.initAudioGraph(sourceNode)

    //this should not be necessary
    this.initWorker()
}

Recorder.prototype.initWorker = function (){
    var _this = this;
    if (!this.worker) {
        this.worker = new window.Worker(this.config.encoderPath)
    }else {
        console.log('worker already exist!')
    }

    this.worker.onmessage = function (e) {
        switch (e.data.command){
            case 'encoderDone':
                // 导出转换的文件
                _this.recoderOptions.doneCallBack(e.data.data)
                break
            default:
                console.warn('worker e.data.command:', e.data.command)
                break
        }
    }

    this.worker.postMessage({
        command: 'init',
        config: this.config
    });
}

Recorder.prototype.record = function (){
    this.recording = true
}

Recorder.prototype.stop = function (){
    this.recording = false

    this.monitorGainNode && this.monitorGainNode.disconnect()
    this.scriptProcessorNode && this.scriptProcessorNode.disconnect()
    this.recordingGainNode && this.recordingGainNode.disconnect()
    this.sourceNode && this.sourceNode.disconnect()
    this.clearStream()

    if(this.worker){
        this.worker.postMessage({ command: 'stopRecorder'})
    }
}

Recorder.prototype.clear = function (){
    this.worker.postMessage({
        command: 'clear'
    });
}

/**
 * 判断浏览器类型和版本信息
 */
Recorder.getBrowserDetails = function () {
    let navigator = window && window.navigator
    let result = {}
    result.browser = null
    result.version = null
    result.chromeVersion = null

    /**
     * 获取浏览器版本
     * @param uastring
     * @param expr
     * @param pos
     * @returns {RegExpMatchArray | Promise<Response | undefined> | boolean | number}
     */
    let getBrowserVersion = function (uastring, expr, pos) {
        var match = uastring.match(expr)
        return match && match.length >= pos && parseInt(match[pos], 10)
    }

    /**
     * 获取浏览器类型
     * @returns {string}
     */
    let getBrowserType = function () {
        let browser

        if (navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
            console.log('Edge')
            browser = 'edge'
        } else if (navigator.userAgent.indexOf('Firefox') > -1) {
            console.log('Firefox')
            browser = 'firefox'
        } else if (navigator.userAgent.indexOf('Opera') > -1 || navigator.userAgent.indexOf('OPR') > -1) {
            console.log('opera')
            browser = 'Opera'
        } else if (navigator.userAgent.indexOf('Chrome') > -1 && navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Edge') === -1 && navigator.userAgent.indexOf('OPR') === -1) {
            console.log('Chrome')
            browser = 'chrome'
        } else if (navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1 && navigator.userAgent.indexOf('Edge') === -1 && navigator.userAgent.indexOf('OPR') === -1) {
            console.log('Safari')
            browser = 'safari'
        } else if (navigator.userAgent.match(/AppleWebKit\/([0-9]+)\./) && navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
            // Safari UA substrings of interest for reference:
            // - webkit version:           AppleWebKit/602.1.25 (also used in Op,Cr)
            // - safari UI version:        Version/9.0.3 (unique to Safari)
            // - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
            console.log('Safari')
            result.browser = 'safari'
        } else if ((navigator.userAgent.indexOf('compatible') > -1 && navigator.userAgent.indexOf('MSIE') > -1) || (navigator.userAgent.indexOf('Trident') > -1 && navigator.userAgent.indexOf('rv:11.0') > -1)) {
            console.log('IE')
            browser = 'ie'
        } else {
            console.log('navigator.userAgent: ', navigator.userAgent)
        }

        return browser
    }

    result.browser = getBrowserType()
    switch (result.browser) {
        case 'chrome':
            result.version = getBrowserVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)
            break
        case 'opera':
            result.version = getBrowserVersion(navigator.userAgent, /O(PR|pera)\/(\d+)\./, 2)
            if (navigator.userAgent.match(/Chrom(e|ium)\/([\d.]+)/)[2]) {
                result.chromeVersion = getBrowserVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)
            }
            break
        case 'firefox':
            result.version = getBrowserVersion(navigator.userAgent, /Firefox\/(\d+)\./, 1)
            break
        case 'edge':
            result.version = getBrowserVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2)
            break
        case 'safari':
            result.version = getBrowserVersion(navigator.userAgent, /AppleWebKit\/(\d+)\./, 1)
            break
        case 'ie':
            if (navigator.userAgent.match(/MSIE (\d+)/)) {
                result.version = getBrowserVersion(navigator.userAgent, /MSIE (\d+).(\d+)/, 1)
            } else if (navigator.userAgent.match(/rv:(\d+)/)) {
                result.version = getBrowserVersion(navigator.userAgent, /rv:(\d+).(\d+)/, 1)
            }
            break
        default:
            break
    }

    console.log('getBrowserDetails', result)
    return result
}

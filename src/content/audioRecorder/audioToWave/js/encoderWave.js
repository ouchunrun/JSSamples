function encoderWave(data){
    let browserDetails = Recorder.getBrowserDetails()
    console.log('browserDetails : ', browserDetails)
    if (browserDetails.browser === 'ie' || browserDetails.browser === 'edge' || browserDetails.browser === 'safari' || (browserDetails.browser === 'chrome' && browserDetails.version < 58) || (browserDetails.browser === 'opera' && browserDetails.chromeVersion < 58) || (browserDetails.browser === 'firefox' && browserDetails.version < 52)) {
        data.errorCallBack(Recorder.ERROR_MESSAGE.ERROR_CODE_1007)
        return
    }

    if (!Recorder.isRecordingSupported()) {
        console.error('AudioContext or WebAssembly is not supported')
        if (data && data.errorCallBack) {
            if (!window.AudioContext) {
                data.errorCallBack(Recorder.ERROR_MESSAGE.ERROR_CODE_1002)
            } else if (!window.WebAssembly) {
                data.errorCallBack(Recorder.ERROR_MESSAGE.ERROR_CODE_1003)
            }
        }
        return
    }

    /**
     * 无效参数判断：判断是否传入必要参数
     */
    if (!data || !data.file || !data.doneCallBack) {
        console.warn(data)
        data.errorCallBack(Recorder.ERROR_MESSAGE.ERROR_CODE_1001)
        return
    }
    let file = data.file
    console.log('current upload file type ' + file.type)

    /**
     * 判断是否为音频
     */
    if (!/audio\/\w+/.test(file.type)) {
        data.errorCallBack(Recorder.ERROR_MESSAGE.ERROR_CODE_1006)
        return
    }

    let recorder
    let MIN_LIMIT = 3 // 文件时长不低于3秒
    // let MXA_LIMIT = 9 * 1024 * 1024 // 文件大小要求不超过9M
    // if (file.size > MXA_LIMIT) {
    //     data.errorCallBack(Recorder.ERROR_MESSAGE.ERROR_CODE_1004)
    //     return
    // }
    let bufferSource
    let mediaStreamSource
    let recordingDuration
    let audioCtx = new AudioContext()
    let fileReader = new FileReader()

    /**
     * 监听结束事件:文件时长不足设定时长时
     */
    function bufferSourceOnEnded () {
        if (recorder.state === 'recording' || recorder.state !== 'inactive') {
            console.log('buffer source onEnded!')
            recorder.stop()
            bufferSource && bufferSource.stop()
            bufferSource = null
            data.progressCallback({ state: 'done', percent: 1 })
        }
    }

    /**
     * 录制时间到达设置时长时，停止录制
     */
    function recorderStopHandler (res) {
        try {
            let currentTime = res.totalDuration
            if (res.state === 'stop') {
                console.log('recorder.stop')
                data.progressCallback({ state: 'done', percent: 1 })
                recorder.stop()
                bufferSource && bufferSource.stop()
                bufferSource = null
            } else {
                data.progressCallback({ state: 'recording', percent: currentTime / recordingDuration })
            }
        } catch (e) {
            data.errorCallBack(Recorder.ERROR_MESSAGE.ERROR_CODE_1009(e))
        }
    }

    /**
     * 创建 mediaStreamSource
     * 通过AudioContext.createMediaStreamDestination 生成文件流
     * @param decodedData
     */
    function createSourceNode(decodedData){
        // 创建一个新的AudioBufferSourceNode接口, 该接口可以通过AudioBuffer 对象来播放音频数据
        let bufferSource = audioCtx.createBufferSource()
        bufferSource.buffer = decodedData
        bufferSource.onended = bufferSourceOnEnded

        // 创建一个媒体流的节点
        let destination = audioCtx.createMediaStreamDestination()
        recordingDuration = Math.min(data.duration, decodedData.duration) // 文件总时长小于指定的录制时长时，以文件时长为主
        // 更新录制时长
        recorder.setRecordingDuration(recordingDuration)
        bufferSource.connect(destination)
        bufferSource.start()

        // 创建一个新的MediaStreamAudioSourceNode 对象，将声音输入这个对像
        mediaStreamSource = audioCtx.createMediaStreamSource(destination.stream)
        // 创建audioContext，开始处理声音数据
        recorder.start(mediaStreamSource, recorderStopHandler)
    }

    try {
        fileReader.onload = function () {
            audioCtx.decodeAudioData(this.result).then(function (decodedData) {
                let duration = decodedData.duration
                if (duration < MIN_LIMIT) {
                    data.errorCallBack(Recorder.ERROR_MESSAGE.ERROR_CODE_1005)
                    return
                }

                console.log('upload file duration: ' + decodedData.duration + '(s)')
                createSourceNode(decodedData)
            }, function (error) {
                console.warn('Error catch: ', error)
            })
        }
        fileReader.readAsArrayBuffer(file)
        recorder = createRecorder(data)
    }catch (e){
        data.errorCallBack(Recorder.ERROR_MESSAGE.ERROR_CODE_1009(e))
    }
}


function createRecorder(data){
    let mediaRecorder
    let options = {
        encoderPath: data.encoderWorkerPath,
        desiredSampleRate: data.desiredSampleRate
    }
    mediaRecorder = new Recorder(options, data)
    //start the recording process
    mediaRecorder.record()  // 设置recording为true
    return mediaRecorder
}


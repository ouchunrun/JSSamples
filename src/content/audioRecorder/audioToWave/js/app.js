//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

let gumStream; 						//stream from getUserMedia()
let waveRecorder; 							//Recorder.js object

// shim for AudioContext when it's not avb.
let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext //audio context to help us record
let recordButton = document.getElementById("recordButton");
let stopButton = document.getElementById("stopButton");

// 期望的采样率选择
let sampleRateSelect = document.getElementById('recRate')
let desiredSampleRate = sampleRateSelect.options[sampleRateSelect.selectedIndex].value
console.log("默认采样率:", desiredSampleRate);
sampleRateSelect.onchange = function (){
    desiredSampleRate = sampleRateSelect.options[sampleRateSelect.selectedIndex].value
    console.log("修改后采样率:", desiredSampleRate);
}

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

let uploadFile = document.getElementById('uploadFile')
let clickToUpload = document.getElementById('clickToUpload')
clickToUpload.onclick = function (){
    console.log('Trigger the real file upload button')
    uploadFile.click()
}

/**
 * 文件上传处理
 */
uploadFile.onchange = function () {
    $("#recordButton").removeClass("stop");
    $("#stopButton").addClass("recoding");
    $(".errorTips").removeClass("errorShow");
    $(".refresh").removeClass("refreshShow");

    let file = this.files[0]
    let fileReader = new FileReader()
    let audioCtx = new AudioContext()
    fileReader.onload = function () {
        audioCtx.decodeAudioData(this.result).then(function (decodedData) {
            console.log('upload file duration: ' + decodedData.duration + '(s)')

            // 创建一个新的AudioBufferSourceNode接口, 该接口可以通过AudioBuffer 对象来播放音频数据
            let bufferSource = audioCtx.createBufferSource()
            bufferSource.buffer = decodedData
            bufferSource.onended = function (){
                if (waveRecorder.state === 'recording' || waveRecorder.state !== 'inactive') {
                    console.log('buffer source onEnded!')
                    waveRecorder.stop()
                    bufferSource && bufferSource.stop()
                    bufferSource = null

                    //create the wav blob and pass it on to createDownloadLink
                    console.log('创建下载链接')
                    waveRecorder.exportWAV(createDownloadLink, "audio/wav", Number(desiredSampleRate));
                }
            }

            // 创建一个媒体流的节点
            let destination = audioCtx.createMediaStreamDestination()
            // recordingDuration = Math.min(data.duration, decodedData.duration) // 文件总时长小于指定的录制时长时，以文件时长为主
            // 更新录制时长
            // recorder.setRecordingDuration(recordingDuration)
            bufferSource.connect(destination)
            bufferSource.start()

            // 创建一个新的MediaStreamAudioSourceNode 对象，将声音输入这个对像
            let mediaStreamSource = audioCtx.createMediaStreamSource(destination.stream)
            waveRecorder = new Recorder(mediaStreamSource, {
                originalSampleRate: mediaStreamSource.context.sampleRate,
                desiredSampleRate: Number(desiredSampleRate),
                numChannels: 1,
                mimeType: 'audio/wav'
            })
            //start the recording process
            waveRecorder.record()  // 设置recording为true
            console.log("Recording started", waveRecorder);
        }, function (error) {
            console.warn('Error catch: ', error)
        })
    }
    fileReader.readAsArrayBuffer(file)
}

/**
 * 实时取流录制
 */
function startRecording() {
    console.log("recordButton clicked");
    let constraints = {audio: true, video: false}

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");
        $("#recordButton").removeClass("stop");
        $("#stopButton").addClass("recoding");
        $(".errorTips").removeClass("errorShow");
        $(".refresh").removeClass("refreshShow");

        audioContext = new AudioContext();
        /*  assign to gumStream for later use  */
        gumStream = stream;
        /* use the stream */
        let mediaStreamSource = audioContext.createMediaStreamSource(stream);
        //  Create the Recorder object and configure to record mono sound (1 channel)
        //  Recording 2 channels  will double the file size
        waveRecorder = new Recorder(mediaStreamSource, {
            originalSampleRate: mediaStreamSource.context.sampleRate,
            desiredSampleRate: Number(desiredSampleRate),
            numChannels: 1,
            mimeType: 'audio/wav'
        })
        console.warn('wave Recorder:', waveRecorder)
        //start the recording process

        waveRecorder.record()  // 设置recording为true

        console.log('wave Recorder.record:', waveRecorder.record)
        console.log("Recording started", waveRecorder);
    }).catch(function (err) {
        //enable the record button if getUserMedia() fails
        $("#recordButton").addClass("stop");
        $("#stopButton").removeClass("recoding");
    });
}

function stopRecording() {
    console.log("stopButton clicked");

    $("#recordButton").addClass("stop");
    $("#stopButton").removeClass("recoding");

    //tell the recorder to stop the recording
    waveRecorder.stop();   // 设置recording为false

    if(gumStream){
        //stop microphone access
        gumStream.getAudioTracks()[0].stop();
    }

    //create the wav blob and pass it on to createDownloadLink
    console.log('创建下载链接')
    waveRecorder.exportWAV(createDownloadLink);
}


/**
 * 创建下载链接
 * @param blob
 */
function createDownloadLink(blob) {
    console.log('createDownloadLink:', blob)
    let downLoadLink = document.createElement('a')
    let url = URL.createObjectURL(blob);
    let player = document.getElementById('player')
    player.src = url;
    // 生成下载链接
    downLoadLink.href = url;
    downLoadLink.download = new Date().toLocaleString() + '.wav'
    downLoadLink.innerHTML = '<br>' + '[' + new Date().toLocaleString() + '] ' + '.wav'
}

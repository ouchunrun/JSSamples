
// shim for AudioContext when it's not avb.
let AudioContext = window.AudioContext || window.webkitAudioContext;

let audioFadeOut = document.getElementById('audioFadeOut')
let recordingDurationInput = document.querySelector('div.duration > input[type=range]')
/**
 * duration
 * @param e
 */
recordingDurationInput.onchange = function (e){
    let durationShow = document.getElementsByClassName('durationShow')[0]
    durationShow.textContent = parseInt(e.target.value)
}

// 期望的采样率选择
let sampleRateSelect = document.getElementById('recRate')
let desiredSampleRate = sampleRateSelect.options[sampleRateSelect.selectedIndex].value
console.log("默认采样率:", desiredSampleRate);
sampleRateSelect.onchange = function (){
    desiredSampleRate = sampleRateSelect.options[sampleRateSelect.selectedIndex].value
    console.log("修改后采样率:", desiredSampleRate);
}

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
    let duration = recordingDurationInput.value
    let uploadFile = this.files[0]
    encoderWave({
        file: uploadFile,
        duration: duration,   // 文件录制时长
        audioFadeOut: audioFadeOut.checked,
        // monitorGain: 0,
        // recordingGain: 1,
        // numberOfChannels: 1,
        // encoderSampleRate: 8000,
        desiredSampleRate: 8000,
        encoderWorkerPath: './js/waveEncoderWorker.js',

        progressCallback: function (data){
            if(data.state === 'recording'){
            }else if(data.state === 'done'){
                console.log('recorder complete!')
            }
        },

        doneCallBack: function (blob){
            console.warn('doneCallBack:', blob)
            createDownloadLink(blob)
        },

        errorCallBack: function (data){
            console.error('errorCallBack:', data)
        },
    })
}

/**
 * 创建下载链接
 * @param blob
 */
function createDownloadLink(blob) {
    console.warn('创建下载链接')
    let downLoadLink = document.createElement('a')
    let url = URL.createObjectURL(blob);
    let player = document.getElementById('player')
    player.src = url;
    // 生成下载链接
    downLoadLink.href = url;
    downLoadLink.download = new Date().toLocaleString() + '.wav'
    downLoadLink.innerHTML = '<br>' + '[' + new Date().toLocaleString() + '] ' + '.wav'
}

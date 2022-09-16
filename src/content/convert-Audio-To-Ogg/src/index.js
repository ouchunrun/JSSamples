
let player = document.querySelector('#player');
let recorderLists = document.querySelector('#recorderLists');
let uploadFile = document.getElementById('uploadFile')
const recordingDurationInput = document.querySelector('div#recordingDuration input');
let progressShow = document.getElementById('progress')
let clickToUpload = document.getElementById('clickToUpload')
clickToUpload.onclick = function (){
    console.log('Trigger the real file upload button')
    uploadFile.click()
}

recordingDurationInput.onchange = function (e){
    const span = e.target.parentElement.querySelector('span');
    span.textContent = parseInt(e.target.value);
}

/**
 * Upload local audio file
 * @type {HTMLElement}
 */
uploadFile.onchange = function () {
    console.log('file reade onload...')
    logPrint('file reade onload...')
    logPrint('Recorder started')

    // 清除生成的页面记录
    player.src = null
    progressShow.innerHTML = ''

    let duration = recordingDurationInput.value || 30
    logPrint('Recorder duration has been set to ' + duration)
    encoderOgg({
        file: this.files[0],
        duration: duration,   // 文件录制时长
        monitorGain: 0,
        recordingGain: 1,
        numberOfChannels: 1,
        encoderSampleRate: 16000,
        encoderWorkerPath: './to-ogg-worker/encoderWorker.js',

        /**
         * 进度处理
         * @param data
         */
        progressCallback: function (data){
            if(data.state === 'recording'){
                progressShow.innerHTML = Math.round(data.percent * 100);
            }else if(data.state === 'done'){
                progressShow.innerHTML = '100';
                console.log('recorder complete!')
                logPrint('Recorder complete!')
            }
        },
        /**
         * 转换完成后的处理
         * @param file
         * @param blob
         */
        doneCallBack:function (file, blob){
            let dataBlob = new Blob([blob], {type: 'audio/ogg'});
            let downLoadLink = document.createElement('a')
            let url = URL.createObjectURL(dataBlob);
            player.src = url;
            // 生成下载链接
            downLoadLink.href = url;
            downLoadLink.download = file.name;
            downLoadLink.innerHTML = '<br>' + '[' + new Date().toLocaleString() + '] '+ file.name
            recorderLists.appendChild(downLoadLink)
            logPrint('download link generated!')
        },
        /**
         * 错误处理
         * @param error
         */
        errorCallBack: function (error){
            console.error(error.message)
            logPrint('【Error】' + error.message)
        }
    })
    uploadFile.value = "";  // clear input
};


/*******************************************************************************
 * Debug helpers
 *    This section is only for debugging purpose, library users don't need them.
 ******************************************************************************/
let lineCount = 0;
let errorLog = document.getElementById('errorLog')
function logPrint(text) {
    lineCount += 1;
    if (lineCount > 100) {
        let str = errorLog.innerHTML;
        errorLog.innerHTML = str.substring(str.indexOf('<br>') + '<br>'.length);
    }
    errorLog.innerHTML += text + '<br>';
}

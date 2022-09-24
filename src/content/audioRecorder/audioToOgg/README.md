## 说明

Demo 源码来源：https://github.com/chris-rudmin/opus-recorder

### 浏览器兼容

| 浏览器类型         | 版本  | 浏览器内核  | 是否支持 | 备注         |
|---------------|-----|--------|------|------------|
| chrome        | 58+ | chrome | 支持   | 版本为测试的最低版本 |
| opera         | 45+ | chrome | 支持   | 版本为测试的最低版本 |
| firefox       | 25+ | chrome | 支持   | 版本为测试的最低版本 |
| Edge          | 104 | chrome | 支持   | 其他版本未测试    |
| 360安全浏览器   | 63  | chrome | 支持   | 其他版本未测试    |
| 搜狗浏览器      | 58  | chrome | 支持   | 其他版本未测试    |
| QQ浏览器       | 70  | chrome | 支持   | 其他版本未测试    |
| IE            | -   | -   -  | -    | 不支持        | 
| Safari        | -   | -   -  | -    | 不支持        | 
| 老的Edge       | -   | -   -  | -    | 不支持        |

### 转换格式与限制

- Sampling rate : 16.0 kHz
- Channel(s) : 1 channel
- Format: Opus
- 输出文件后缀为 .ogg
- 支持选择音频是否淡出
- 转换后的最好不超过`192KB`。超过的话我们的设备会拒绝下载这个文件，这样的话客户就用不了
- 支持的转换格式随浏览器的能力来，不同浏览器还有些差别
  
### 处理逻辑

> 前端实现录音有两种方式，一种是使用MediaRecorder，另一种是使用WebRTC的getUserMedia结合AudioContext。这里我们使用AudioContext处理。

- 1.添加一个file input用于文件上传，当用户选择文件后会触发onchange事件，在onchange回调里面就可以拿到文件的内容进行处理
- 2.使用一个FileReader读取文件，读取为ArrayBuffer即原始的二进制内容
- 3.拿到ArrayBuffer之后，使用AudioContext的decodeAudioData进行解码，生成一个AudioBuffer实例，把它做为AudioBufferSourceNode对象的buffer属性，
```js
// 解码后的audioBuffer包括音频时长，声道数量和采样率。
fileReader.onload = function () {
    let buffer = this.result
    audioCtx.decodeAudioData(buffer).then(function (decodedData) {
        console.log('upload file duration: ' + decodedData.duration + '(s)')
      // 创建一个新的AudioBufferSourceNode接口, 该接口可以通过AudioBuffer 对象来播放音频数据
      bufferSource = audioCtx.createBufferSource()
      bufferSource.buffer = decodedData
      bufferSource.onended = bufferSourceOnEnded

      // 创建一个媒体流的节点
      let destination = audioCtx.createMediaStreamDestination()
      recordingDuration = Math.min(data.duration, decodedData.duration)  // 文件总时长小于指定的录制时长时，以文件时长为主
      // 更新录制时长
      recorder.setRecordingDuration(recordingDuration)
      bufferSource.connect(destination)
      bufferSource.start()

      // 创建一个新的 createMediaStreamSource 对象，将声音输入这个对像
      mediaStreamSource = audioCtx.createMediaStreamSource(destination.stream)
      // 创建audioContext，开始处理声音数据
      recorder.start(mediaStreamSource, recorderStopHandler)
    }, function (error) {
        console.warn('Error catch: ', error)
      
    })
}
```
- 4.在scriptProcessorNode.onaudioprocess中以固定时间间隔返回处理数据。总数据时长达到设置时长时，停止recorder
- 5.录制结束后，页面生成下载链接和audio在线播放链接

### 问题记录

- 1.录制时长不等于指定录制时长问题
  - 原因：通话定时器计算处理时长，start 过后，并不一定会立即进入录音状态，最后的数据时长不一定和定时时间匹配
  - 处理：scriptProcessorNode.onaudioprocess 以固定时间间隔触发，总触发次数不定。需要计算总次数*固定时间才是录制的时长
```
this.scriptProcessorNode.onaudioprocess = (e) => {
  if(!audioprocessDuration){
    audioprocessDuration = e.inputBuffer.duration
    console.log('get onaudioprocess trigger duration: ' + audioprocessDuration)
  }
  audioprocessCount++
  this.encodeBuffers(e.inputBuffer)

  audioprocessTotalDuration = audioprocessCount * audioprocessDuration
  if(audioprocessTotalDuration > This.recordingDuration){
    console.log('process count: ', audioprocessCount)
    console.log('audio process total duration: ', audioprocessTotalDuration)
    if(This.recorderStopHandler){
      This.recorderStopHandler({state: 'stop'})
    }
  }else {
    if(This.recorderStopHandler){
      // 返回当前时长，计算处理进度
      This.recorderStopHandler({state: 'running', totalDuration: audioprocessTotalDuration})
    }
  }
}
```  

### 参考

- [opus-recorder](https://github.com/chris-rudmin/opus-recorder)
- [如何实现前端录音功能](https://zhuanlan.zhihu.com/p/43710364)
- [音乐人必备知识 | 常见的音频格式有哪些？](https://www.bilibili.com/read/cv6126844/)
- [JS纯前端实现audio音频剪裁剪切复制播放与上传](https://www.zhangxinxu.com/wordpress/2020/07/js-audio-clip-copy-upload/)

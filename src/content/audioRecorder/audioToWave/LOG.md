
### 2022-9-21

- 添加[RecorderToText](https://github.com/httggdt/RecorderToText)源代码：录制设备获取的音频流，并生成Wave格式文件
- 解决录制后没有生成可播放文件和下载问题
- 添加文件上传处理
- 调整文件路径
- 从recorder.js中分离recorder(waveRecorder.js) 和 worker(waveEncoderWorker.js)逻辑
- 封装Recorder和WaveWorker类

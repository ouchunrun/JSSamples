# [recorder录音包](https://github.com/httggdt/RecorderToText)
<!-- htt-2020-05-28 -->

##  基于recorder.js完成的录音-wav音频转文字

1.  点击recording按钮,授权开始录音,按钮开始闪烁
2.  再次点击闪烁的按钮,表示停止录音,此时开始调用翻译接口
3.  返回的结果:
    1).status == 0表示正常,将翻译的text显示在文本input中(input可修改)
    2).status!== 0表示异常,将返回的text中是出现的错误,显示在errorTips中,在文本框之下红字提示;并且出现刷新按钮,可以点击使用当前语音再次请求

注意:
  语音只保留最后一次的录音;
  采样率默认8000,可修改(recRate),可在代码中写死;
  本地运行时,接口会跨域(可使用允许跨域的谷歌进行查看);

### 转换条件

> GRP26xx 需求：The tool converts music files into PCMU (G.711A) format of up to 64KB each

- Format : PCM
- Channel(s) : 1 channel  (单声道)
- Sampling rate : 8 000 Hz  (8KHz 采样率)
- Bit depth : 16 bits (位深)
- 编码器：G.711A(u-law)  【未实现】
- 生成文件为 .bin 格式


### bin 文件转换大小限制与音频渐弱处理说明

1.worker 收到buffer数据后保存并立即对数据进行扁平化和下采样处理
2.当处理后的数据剩余最大尺寸的百分之十五时，通知recorder开始设置音频渐弱
3.当处理后的数据大于限制尺寸时，通知recorder停止转换，生成最终文件。超出尺寸限制的文件转换时长小于页面设置时长。
4.若转换的文件未超出尺寸限制，则根据转换时间设置音频渐弱时间。剩余转换时长小于recordingDuration*0.15时，设置渐弱。

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

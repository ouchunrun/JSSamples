


## WebAudio.js 源码 

WebAudio.js 源码 ：https://github.com/jeromeetienne/webaudiox

## Web Audio API


官方文档参考：[Web Audio API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API)

Web Audio API 提供了在Web上控制音频的一个非常有效通用的系统，允许开发者来自选音频源，对音频添加特效，使音频可视化，添加空间效果 （如平移），等等。

在学习web audio api之前，先了解三个概念：

- 音频源，也就是音频输入，可以是直接从设备输入的音频，也可以是远程获取的音频文件。
- 处理节点，分析器和处理器，比如音调节点，音量节点，声音处理节点。
- 输出源，指音频渲染设备，一般情况下是用户设备的扬声器，即context.destination。


一个简单而典型的web audio流程如下：

- 创建音频上下文
- 在音频上下文里创建源 — 例如 <audio>, 振荡器, 流
- 创建效果节点，例如混响、双二阶滤波器、平移、压缩
- 为音频选择一个目的地，例如你的系统扬声器
- 连接源到效果器，对目的地进行效果输出

![](https://mdn.mozillademos.org/files/12241/webaudioAPI_en.svg)

---
### 功能

HTML5 Web Audio API可以让我们无中生有创造声音，而且是各种音调的声音，换句话说，我们通过JavaScript就会创建一个完整的音乐出来，常用的，如白噪音。

当然其功能绝不仅限于这一点，我们还可以：

- 对简单或复杂的声音进行混合；
- 精确控制声音的密度和节奏；
- 内置淡入/淡出，颗粒噪点，音调控制等效果；
- 灵活的处理在音频流的声道，使它们成为拆分和合并；
- 处理从<audio>音频或<video>视频的媒体元素的音频源；
- 使用MediaStream的getUserMedia()方法事实处理现场输入的音频，例如变声；
- 立体音效，可以支持多种3D游戏和沉浸式环境；
- 利用卷积引擎，创建各类线性音效，例如小/大房间、大教堂、音乐厅、洞穴、隧道、走廊、森林、圆形剧场等。尤其适用于创建高质量的房间效果。
- 高效的实时的时域和频分析，配合CSS3或Canvas或webGL可以实现音乐可视化支持；
- 以及其他多种音频波形算法控制，几乎就是把一个音频编辑类软件搬到web上。

作为web开发人员，我们并不需要和那些很高级的HTML5 Web Audio API功能打那么深的交道，所以这里只简单介绍最简单的例子和一些比较常用的方法属性。

参考地址：[利用HTML5 Web Audio API给网页JS交互增加声音](https://www.cnblogs.com/xy2c/p/7501327.html)


---
### 接口

AudioContext：

AudioContext接口代表由音频模块构成的音频处理图，是HTML5 Web Audio最基础也是最常用的API，用于指定一个音频上下文，包含大量的属性和方法，而且这些方法名又多又长，可以查看[Audio​Context文档](https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext)。音频上下文控制其所包含节点的创建和音频处理、解码。使用其它接口前你必需创建一个音频上下文，一切操作都在这个环境里进行。

一般向前兼容一下老的webkit浏览器会做如下处理：
```javascript
 window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
```


audioCtx.createOscillator创造的音调有几个参数：

- type：表明声波的不同类型，有`sine，square，sawtooth，triangle`四种类型；
- frequency：表示声音的频率。



Demo用到的接口/方法简单描述：

- AnalyserNode.getByteTimeDomainData()方法用于获取音频时域数据，
- AnalyserNode.getByteFrequencyData()方法用于获取音频频域数据。

|               方法                |                        描述                  | 
| --------------------------------- | -------------------------------------------- |
|AudioContext接口的createMediaStreamSource()方法| 用于创建一个新的MediaStreamAudioSourceNode 对象, 需要传入一个媒体流对象(MediaStream对象)(可以从 navigator.getUserMedia 获得MediaStream对象实例), 然后来自MediaStream的音频就可以被播放和操作。|
|AudioContext 接口的 createMediaElementSource() 方法| 用于创建一个新的 MediaElementAudioSourceNode 对象,输入某个存在的 HTML <audio> or <video> 元素, 对应的音频即可被播放或者修改.|
|AudioContext的createAnalyser()方法             |  获取音频时间和频率数据，以及实现数据可视化    |
|AnalyserNode接口的getByteFrequencyData()方法   |  将当前频率数据复制到传入的Uint8Array（无符号字节数组）中。    |
|  AnalyserNode.getByteTimeDomainData() |  用于获取音频时域数据 |
|window.requestAnimationFrame()     |   告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行   |


---
### ArrayBuffer的几种来源方式

- 通过本地文件上传（input type="file"）方式获取的音频文件
- 通过XHR异步请求的方式获取音频数据(注意需要返回arraybuffer类型)
- 通过createOscillator方法自己创造一个AudioBuffer
- 使用 navigator.mediaDevices.getUserMedia 通过硬件设备（mic）获取
- 解析二进制数据


---
### 实例

- webAudio播放本地音乐
- webAudio制造噪音并播放
- 通过XMLHttpRequest获取音频流
- 音效和波形设置
- 播放从设备获取的流
- 可视化音乐播放

---
### error

问题：`The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page.`
解决：AudioContext需要用户手动触发，所以只需要将new AudioContext()移动到事件内部（比如onclick事件）就行了。

问题：在webAudio中的声音源只能播放一次，例如上面的createOscillator一旦调用了start，那么就不能调用第二次。
解决：如果需要多次调用，每次都需要重新生一个声音源。


---
### 参考

[Web Audio API文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API)
[web Audio学习与音频播放](http://www.zhuyuntao.cn/2019/04/08/web-audio%E5%AD%A6%E4%B9%A0%E4%B8%8E%E9%9F%B3%E9%A2%91%E6%92%AD%E6%94%BE/)
[Web Audio/MIDI List](http://webaudio.github.io/demo-list/)
[Web Audio API之手把手教你用web api处理声音信号:可视化音乐demo](https://www.cnblogs.com/gabrielchen/p/5078760.html)
[web音频流转发之音频源](https://segmentfault.com/a/1190000011353930)

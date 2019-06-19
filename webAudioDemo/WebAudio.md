听到声音的过程：声源激励、声道共振和口鼻辐射。


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
### AudioContext属性

- AudioContext.destination
    - 返回 AudioDestinationNode 对象，表示当前 AudioContext 中所有节点的最终节点，一般表示音频渲染设备。


---
### AudioContext方法

AudioContext：

AudioContext接口代表由音频模块构成的音频处理图，是HTML5 Web Audio最基础也是最常用的API，用于指定一个音频上下文，包含大量的属性和方法，而且这些方法名又多又长，可以查看[Audio​Context文档](https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext)。音频上下文控制其所包含节点的创建和音频处理、解码。使用其它接口前你必需创建一个音频上下文，一切操作都在这个环境里进行。

一般向前兼容一下老的webkit浏览器会做如下处理：
```javascript
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioCtx = new AudioContext();
```


- audioCtx.createOscillator。
    - 创建一个 OscillatorNode, 它表示一个周期性波形，基本上来说创造了一个音调。
    - type：表明声波的不同类型，有`sine，square，sawtooth，triangle`四种类型；
    - frequency：表示声音的频率。

- AudioContext接口的createMediaStreamSource()方法
    - 用于创建一个新的MediaStreamAudioSourceNode 对象, 需要传入一个媒体流对象(MediaStream对象)(可以从 navigator.getUserMedia 获得MediaStream对象实例), 然后来自MediaStream的音频就可以被播放和操作。

- AudioContext 接口的 createMediaElementSource() 方法
    - 用于创建一个新的 MediaElementAudioSourceNode 对象,输入某个存在的 HTML <audio> or <video> 元素, 对应的音频即可被播放或者修改.
 
- AudioContext.createBufferSource()
    - 创建一个 AudioBufferSourceNode 对象, 他可以通过 AudioBuffer 对象来播放和处理包含在内的音频数据。
    
- AudioContext的createAnalyser()方法           
    - 获取音频时间和频率数据，以及实现数据可视化    
    - AnalyserNode 接口fftSize 属性的值必须是从32到32768范围内的2的非零幂; 其默认值为2048.
    
- AudioContext.createGain()
    - 创建一个 GainNode,它可以控制音频的总音量。
    
- AudioContext.createBiquadFilter()方法，创建滤波器。它支持的滤波器有如下这些：                                         
    - 低通滤波器：lowpass，低于截止频率的频率通过;
    - 高通滤波器：highpass，高于截止频率的频率通过;
    - 带通滤波器：bandpass，给定范围的频率通过；
    - 低架滤波器：lowshelf，低于给定频率的做衰减或促进，高于的频率不做改变
    - 高架滤波器：highshelf，高于给定频率的做衰减或促进，低于的频率不做改变
    - 峰值滤波器：peaking，给定范围内的频率做一个促进或衰减，范围外的不做改变
    - 陷波滤波器：notch，给定范围内的频率做一个衰减，范围外的通过
    - 全通滤波器：allpass，它允许所有频率通过，但改变各种频率之间的相位关系。
    
        
### Analyser 方法

- AnalyserNode.getByteTimeDomainData()方法用于获取音频时域数据

- AnalyserNode.getByteFrequencyData()方法用于获取音频频域数据。
    - 通过getByteFrequencyData方法，可以获取到当前的频域数据。但每次调用getByteFrequencyData只会获取当时的数据，要想连续不断的获取频域数据，就要不断的调用getByteFrequencyData来获取数据，这时肯定不能用setInterval，因为数据量一大，还要不停的绘图，它根本跟不上节奏啊，表现就是频谱图有点卡，感觉像掉帧似得，而requestAnimationFrame是专为js动画所提供的api，效果自然比setInterval好得多。
    
- AnalyserNode接口的getByteFrequencyData()方法  
    - 将当前频率数据复制到传入的Uint8Array（无符号字节数组）中。    
    
- AnalyserNode.getByteTimeDomainData() 
    - 用于获取音频时域数据 
    
- window.requestAnimationFrame()    
    - 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行   



#### 滤波器




---
### ArrayBuffer的几种来源方式

- 通过API自带的 Oscillator （振荡器）来直接产生指定频率的正弦波。
- 从arraybuffer中读取音频的二进制数据，这个是最常用的做法，通过ajax或者filereader API可直接获得音频的arraybuffer，无需额外操作。
- 从媒体标签中获取音频，比如audio标签，这个使用应该也不多，毕竟能用audio标签的地方多半可直接获取音频的arraybuffer。
- 通过webrtc来获取外界实时的音频(navigator.mediaDevices.getUserMedia )，比如电脑上的麦克风。这个又是一个高频使用需求。


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

- https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API
- http://www.zhuyuntao.cn/2019/04/08/web-audio%E5%AD%A6%E4%B9%A0%E4%B8%8E%E9%9F%B3%E9%A2%91%E6%92%AD%E6%94%BE/
- http://webaudio.github.io/demo-list/
- https://www.cnblogs.com/gabrielchen/p/5078760.html
- https://segmentfault.com/a/1190000011353930

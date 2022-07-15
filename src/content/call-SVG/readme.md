## SVG 

### SVG path

- [svg中path命令参数表](https://blog.csdn.net/Carrie_zzz/article/details/82933313)

### 参数

- viewport: 表示SVG可见区域的大小。以下代码定义了一个视区，宽500单位，高300单位；在SVG中，可以带单位，也可以不带单位，默认单位为像素px。
```
<svg width="500" height="300"></svg>
```

- viewbox: 用于在画布上绘制SVG图形的坐标系统。中文翻译为视区，就是在svg上截取一小块，放大到整个svg显示。
  - x:相对于svg左上角的横坐标
  - y:对于svg左上角的纵坐标
  - width:截取的视区的宽度
  - height:截取的视区的高度
```
viewBox="x, y, width, height"  
```
> 更形象的解释就是：SVG 就像是我们的显示器屏幕，viewBox 就是截屏工具选中的那个框框，最终的呈现就是把框框中的截屏内容再次在显示器中全屏显示！

[参考：理解SVG viewport,viewBox,preserveAspectRatio缩放](https://www.zhangxinxu.com/wordpress/2014/08/svg-viewport-viewbox-preserveaspectratio/)
[参考：SVG之ViewBox](https://segmentfault.com/a/1190000009226427)

### SVG CSS 属性

- fill：填充色
- stroke：描边色
- stroke-width：边框宽度
- stroke-dasharray:用于创建虚线，之所以后面跟的是array的，是因为值其实是数组。通过控制 stroke-dashoffset 属性值，我们就控制了这个路径的展示和隐藏。
    - 一个参数时： 其实是表示虚线长度和每段虚线之间的间距
    - 两个参数或者多个参数时：一个表示长度，一个表示间距
- stroke-dashoffset： offset：偏移的意思。
    - 相对于起始点的偏移，正数偏移x值的时候，相当于往左移动了x个长度单位，负数偏移x的时候，相当于往右移动了x个长度单位。

### circle标签

> 代表圆形。

```
<svg  width="200" height="200" viewBox="0 0 200 200">
    <circle id="circle" cx="100" cy="80" r="50"  fill="gray" stroke-width="5" stroke="green" />
</svg>
```

- `cx`：横坐标。单位为像素。坐标都是相对于画布的左上角原点。
- `cy`：纵坐标。单位为像素。坐标都是相对于画布的左上角原点。
- `r`：半径。单位为像素。坐标都是相对于画布的左上角原点。

## 通过CSS控制svg变化

[通过CSS控制svg变化](https://blog.csdn.net/lydxwj/article/details/119191518)

## CSS @keyframes

通过@keyframes 规则，能够创建动画。创建动画的原理是，将一套 CSS 样式逐渐变化为另一套样式。

## web Animations API

- Element.animate() 元素调用后会立即执行。跟css3动画有点类似但是有很多小区别，列如（[参考：Web Animations API (JS动画利器) ](https://www.cnblogs.com/visugar/p/7327171.html)）：
  - 1.css3动画中用的时间单位为s，而wappi中使用的与setTimeout等定时器的单位及写法一致（单位为ms且可省略）
  - 2.waapi中关键帧的值传入的是字符串类型，与css3不一样。
  - 3.waapi中不再有百分数，而是用offset来设置关键帧的位置。
  - 4.css3动画中animation-duration变为duriation，animation-iteration-count则变成iterations，且其无限次的值由字符串'infinite'变成关键字Infinity。
语法：
```
childNodes[0].animate(
    [
        {
            stroke: '#cddc39',
        },
        {
            stroke: color1,
        }
    ], {
        duration: 1000,
        easing: "ease-in-out",
        iterations: Infinity,
    }
)
```

### [方法](https://developer.mozilla.org/zh-CN/docs/Web/API/Animation)

- Animation.finish() 对于**有限次**的动画而言，直接停止动画，且跳到动画结束位置
- Animation.cancel() 将清除此动画造成的所有 KeyframeEffect，并中止其播放。
- Animation.pause() 暂停播放动画。
- Animation.play() 开始或恢复播放动画，或者如果之前完成，则重新开始动画。
- Animation.reverse() 反转播放动画，直到播放到动画开始时停止。 如果动画完成或未播放，它将从头到尾播放。



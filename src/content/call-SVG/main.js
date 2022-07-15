/**
 * JS 生成随机颜色
 * @returns {*}
 */
function randomColor(){
    return "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, "0");
}

let callSvg = document.getElementById('grpLinearCallSVG')
// 添加鼠标进入事件监听
callSvg.onmouseover = function (e){
    e.stopPropagation()
    let childNodes
    if(e.target.nodeName === 'svg'){
        childNodes = e.target.getElementsByTagName('path')
    }else if(e.target.nodeName === 'path'){
        childNodes = e.currentTarget.getElementsByTagName('path')
    }
    if(childNodes.length){
        let color1 = randomColor()
        // childNodes[0].style.stroke = color1
        childNodes[0].animate(
            [
                { color: '#FFF' }, // 0%
                { color: color1 } // 100%
            ], {
                duration: 1000,
                easing: "ease-in-out",
                iterations: Infinity,
            }
        )
        childNodes[1].style.fill = color1
        childNodes[2].style.fill = color1
    }
}

// 添加鼠标离开事件监听
callSvg.onmouseout = function (e){
    e.stopPropagation()
    let childNodes
    if(e.target.nodeName === 'svg'){
        childNodes = e.target.getElementsByTagName('path')
    }else if(e.target.nodeName === 'path'){
        childNodes = e.currentTarget.getElementsByTagName('path')
    }
    if(childNodes.length){
        // childNodes[0].style.stroke = 'rgb(43, 93, 166)'
        childNodes[1].style.fill = ''
        childNodes[2].style.fill = ''
        childNodes[0].getAnimations().forEach(
            function(animation){
                console.log('finish animation.')
                return animation.cancel();
            }
        );
    }
}

let call2Svg = document.getElementById('grpFaceCallSVG')
// 添加鼠标进入事件监听
call2Svg.onmouseover = function (e){
    e.stopPropagation()
    let childNodes
    if(e.target.nodeName === 'svg'){
        childNodes = e.target.getElementsByTagName('path')
    }else if(e.target.nodeName === 'path'){
        childNodes = e.currentTarget.getElementsByTagName('path')
    }
    if(childNodes.length){
        let color1 = randomColor()
        // childNodes[0].style.fill = color1
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
        childNodes[1].style.fill = color1
        childNodes[2].style.fill = color1
    }
}
// 添加鼠标离开事件监听
call2Svg.onmouseout = function (e){
    e.stopPropagation()
    let childNodes
    if(e.target.nodeName === 'svg'){
        childNodes = e.target.getElementsByTagName('path')
    }else if(e.target.nodeName === 'path'){
        childNodes = e.currentTarget.getElementsByTagName('path')
    }
    if(childNodes.length){
        childNodes[0].style.fill = '#cddc39'
        childNodes[1].style.fill = ''
        childNodes[2].style.fill = ''
        childNodes[0].getAnimations().forEach(
            function(animation){
                console.log('finish animation.')
                return animation.cancel();
            }
        );
    }
}
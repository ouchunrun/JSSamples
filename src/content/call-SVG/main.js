/**
 * JS 生成随机颜色
 * @returns {*}
 */
function randomColor(){
    return "#" + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, "0");
}

let callSvg = document.getElementById('call')
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
        childNodes[0].style.stroke = color1
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
        childNodes[0].style.stroke = 'rgb(43, 93, 166)'
        childNodes[1].style.fill = ''
        childNodes[2].style.fill = ''
    }
}

let call2Svg = document.getElementById('call2')
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
        childNodes[0].style.fill = color1
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
    }
}
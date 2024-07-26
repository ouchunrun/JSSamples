console.log('init vConsole')
let vConsole = new VConsole()
let clipboardContent = document.getElementById('clipboardContent')
let errorTip = document.getElementById('errorTip')
let myButton = document.getElementById('myButton')
let getPicButton = document.getElementById('getPicButton')
let clipboardImg = document.getElementById('clipboardImg')
let imgURL = document.getElementById('imgURL')
let clipboardType = document.getElementById('clipboardType')

/**
 * 从剪贴板读取文本
 * @returns {Promise<void>}
 */
async function getClipboardText() {
    try {
        const text = await navigator.clipboard.readText();
        console.log(`从剪贴板读取文本内容: ${text}`);
        setClipboardText(text)
    } catch (e) {
        console.error(`从剪切板获取数据失败: ${e}`);
        setErrorTip(e, '文本')
    }
}

/**
 * 设置剪贴板文本
 * @param text
 */
function setClipboardText (text){
    console.log('设置剪贴板文本:', text)
    let TS = new Date().getTime()
    if(text){
        clipboardContent.value = text + ' | 获取时间： ' +  TS
    }else {
        clipboardContent.value = '无内容 | 获取时间： ' +  TS
    }
}

/**
 * 设置剪切板图片URL
 * @param url
 */
function setClipboardImgUrl(url) {
    if(url){
        console.log('设置图片URL:', url)
        clipboardImg.src = url
        imgURL.innerText = url

        clipboardImg.onload = function() {
            URL.revokeObjectURL(this.src);
        };
    } else {
        console.log('清除图片URL')
        clipboardImg.src = ''
        imgURL.innerText = ''
    }
}

/**
 * 设置错误提示
 * @param error
 * @param type
 */
function setErrorTip (error, type){
    let TS = new Date().getTime()
    errorTip.innerHTML = `获取${type}错误： ${error}， 获取时间：${TS}`
}

function isBase64Image(text) {
    // 使用正则表达式检查字符串是否以 "data:image/" 开头，后面跟着 ";base64,"
    return /^data:image\/[^;]+;base64,/.test(text);
}

/**
 * 获取剪切板文字或图片
 * @returns {Promise<void>}
 */
async function getClipboardContents () {
    try {
        const clipboardItems = await navigator.clipboard.read() // clipboardItems列表
        console.log('获取剪切板文字或图片 clipboardItems:', clipboardItems)
        for (const clipboardItem of clipboardItems) {
            // types: ClipboardItem 中可用的 MIME 类型数组。
            for (const type of clipboardItem.types) {
                console.log('clipboardItem.type item:', clipboardItem.types)
                clipboardType.innerText = type
                console.warn('当前剪切板类型type：', type)
                if (type.startsWith('image/')) { // 图片
                    clipboardItem.getType(type).then(blob => {
                        // 在这里处理图片Blob，例如创建一个img元素并设置src
                        console.log('在这里处理图片Blob:', blob)
                        const url = URL.createObjectURL(blob)
                        console.log('当前剪切板为图片', url)
                        setClipboardImgUrl(url)
                    });
                } else if(type.includes("text/plain")) { // 文本
                    clipboardItem.getType(type).then(blob => {
                        const reader = new FileReader();
                        reader.onload = event => {
                            const text = event.target.result;
                            console.log('当前剪切板为文本', text)
                            if (isBase64Image(text)) {
                                console.warn(' text/plain 类型图片')
                                console.log('The clipboard contains a Base64 encoded image.');
                                // 进一步处理 Base64 图片
                                setClipboardImgUrl(text)
                            } else {
                                console.warn('The clipboard contains plain text.');
                                // 进一步处理普通文本
                                setClipboardText(text)
                            }
                        };
                        reader.readAsDataURL(blob);
                    });
                } else {
                    console.log('其他类型:', type)
                }
            }
        }
    } catch (e) {
        console.error(`粘贴失败: ${e}` )
        setClipboardImgUrl()
        setErrorTip(e, '获取剪切板文字或图片')
    }
}


myButton.addEventListener('click', getClipboardText);
getPicButton.addEventListener('click', getClipboardContents);

window.onload = async function (){
    console.log('window.onload， 读取剪贴板中的文本:')
    console.warn('Is secure? ', window.isSecureContext)
    console.warn('Has read? ', navigator.clipboard.read)
    console.warn('navigator.userAgent:', navigator.userAgent)

    try {
        if(navigator.permissions && navigator.permissions.query){
            const writePermissionStatus = await navigator.permissions.query({ name: 'clipboard-write', allowWithoutGesture: false })
            console.warn('Write granted ? ', writePermissionStatus.state)

            const readPermissionStatus = await navigator.permissions.query({ name: 'clipboard-read', allowWithoutGesture: false })
            console.warn('Read granted ? ', readPermissionStatus.state)
        }else {
            console.error('No permission query API')
        }
    }catch (e) {
        console.error('Permission query error:', e.message)
    }
}

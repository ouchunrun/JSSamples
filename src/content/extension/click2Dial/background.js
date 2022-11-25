
/******************************************Browser Actions*******************************************************/
/**
 * 当browser action 图标被点击的时候触发，当browser action是一个popup的时候，这个事件将不会被触发。
 */
if(chrome.browserAction){  // V2
    chrome.browserAction.onClicked.addListener(function (tab){
        console.log('action onClicked')
    })
}else if(chrome.action){  // V3
    chrome.action.onClicked.addListener(function (tab){
        console.log('action onClicked')
    })
}

/******************************************windows 窗口*******************************************************/
/**
 * 监听窗口创建
 */
chrome.windows.onCreated.addListener(function (){
    console.log('windows onCreated')
})

/**
 * 监听window关闭
 */
chrome.windows.onRemoved.addListener(function (windowId){
    console.log('windows onRemoved, windowId: ', windowId)
})

/******************************************消息监听*******************************************************/
/**
 * 接收content-script的消息
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('runtime onMessage')
});

/**
 * 长连接监听 popup 传递来的消息
 */
chrome.runtime.onConnect.addListener(function (port) {
    console.log('runtime onConnect')
})

/**
 * 插件管理 chrome.management 事件
 * ExtensionInfo
     * ( object )
     * 已安装的扩展或应用的的信息。
     * id ( string )
     * 该扩展的唯一ID。
     * name ( string )
     * 扩展或应用的名字。
     * description ( string )
     * 扩展或应用的描述信息。
     * version ( string )
     * 扩展或应用的版本。
     * mayDisable ( boolean )
     * 该扩展是否允许用户禁用和卸载。
     * enabled ( boolean )
     * 该扩展当前是否被启用或禁用。
     * disabledReason ( optional enumerated string ["unknown", "permissions_increase"] )
     * 当前扩展或应用被禁用的原因。
     * isApp ( boolean )
     * 是否是应用，如果true，则是。
     * appLaunchUrl ( optional string )
     * 应用的启动URL。
     * homepageUrl ( optional string )
     * 扩展或应用的主页。
     * updateUrl ( optional string )
     * 扩展或应用的升级页。
     * offlineEnabled ( boolean )
     * 扩展或应用是否支持离线使用。
     * optionsUrl ( string )
     * 扩展或应用的选项页，如果它们进行选项配置的话。
     * icons ( optional array of IconInfo )
     * 包含所有图标信息。注意这只反映声明在清单文件中的信息，URL指定的实际图像可能比声明的更大或更小，所以您引用这些图像时可能要考虑在图像标签中显式使用width和height属性。有关更多细节，请参见manifest documentation on icons。
     * permissions ( array of string )
     * 根据授权情况返回允许使用的所有API列表。
     * hostPermissions ( array of string )
     * 根据授权情况返回所有允许访问的主机白名单。
 */

/**
 * 当应用或扩展被禁用时触发。
 */
chrome.management.onDisabled.addListener(function (info ){
    console.log('onDisabled')
    chrome.contextMenus.update('grpQuicall',{
        visible: false
    });
})

/**
 * 当应用或扩展被启用时触发。
 */
chrome.management.onEnabled.addListener(function (info ){
    console.log('onEnabled')
})

/**
 * 当应用或扩展被安装时触发。
 */
chrome.management.onInstalled.addListener(function (info ){
    console.log('onInstalled')
})

/**
 * 当应用或扩展被卸载时触发。
 * @param id 被卸载的扩展或应用的id。
 */
chrome.management.onUninstalled.addListener(function (id ){
    console.log('onUninstalled')

    console.log('all contextMenus removed')
    chrome.contextMenus.removeAll()
})

/**
 * 安装、升级、重载时触发
 */
chrome.runtime.onInstalled.addListener(function (details){
    console.log('runtime onInstalled')
    console.log('add grpQuicall contextMenus')
    chrome.contextMenus.create({
        id: 'grpQuicall',
        title: 'Use quicall to quickly call',
        contexts: ['selection'],  // 选中文本时显示右键菜单,
        // visible: false, // 控制菜单是否可见,
        onclick: handleClick2DialNumber
    })
})

/******************************************消息通讯*******************************************************/
/**
 * 处理content内容页发送过来的消息
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request && request.requestType === 'contentMessage2Background'){
        // grpDialingApi.chromeRuntimeOnMessage(request)
        // send response
        sendResponse({cmd: "backgroundMessage2ContentScript", status: "OK"});

        switch (request.cmd){
            case 'contentScriptMenusCheck':
                // 屏幕取词呼叫处理
                console.log('收到内容页发送过来的消息：', request.data)
                if(request.data && request.data.selectionText){
                    // TODO: 先判断是否是号码
                    let phonenumber = request.data.selectionText
                    if(phonenumber){
                        chrome.contextMenus.update('grpQuicall',{
                            title: 'Use quicall to quickly call ' + phonenumber,
                            visible: true
                        });
                    }else {
                        chrome.contextMenus.update('grpQuicall',{
                            visible: false
                        });
                    }
                }
                break
            default:
                break
        }
    }
});

/**
 * 处理屏幕取词呼叫
 * @param info
 * @param tab
 */
function handleClick2DialNumber(info, tab){
    console.log('handleClick2DialNumber info:', info)
    console.log('handleClick2DialNumber tab：', tab)
    let selectionText = info.selectionText
    // 这里处理号码发起呼叫
}

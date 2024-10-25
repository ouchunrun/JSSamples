let barcodeDecodeApi = {
    extensionNamespace: '',
    openedPopupId: 0,
    openPopup: function (url) {
        let customWidth = 456
        let customHeight = 540
        let iTop = 200
        let iLeft = 600
        let param = {
            url: url,
            type: 'popup',
            height: customHeight,
            width: customWidth,
            left: iLeft,
            top: iTop
        }

        let This = this
        let createPopupWindowCallBack = function (win) {
            console.log('create popup window callback, win ', win)
            if (win) {
                This.openedPopupId = win.id
            } else {
                console.log('window maybe open failed!')
            }
        }
        
        if (This.openedPopupId > 0) {
            This.extensionNamespace.windows.get(This.openedPopupId, {}, function (win) {
                if (win) {
                    // 更新窗口
                    console.log('update popup window')
                    This.extensionNamespace.windows.update(win.id, {
                        focused: true
                    }, createPopupWindowCallBack)
                } else {
                    console.log('create popup window')
                    This.extensionNamespace.windows.create(param, createPopupWindowCallBack)
                }
            })
        } else {
            console.log('create popup window')
            This.extensionNamespace.windows.create(param, createPopupWindowCallBack)
        }
    },

    runTimeOnConnect: function (port){
        console.log('runTime Connect port:', port)
        barcodeDecodeApi.popupPort = port

        port.onMessage.addListener(request => {
            if (request && request.requestType === 'popupMessage2Background') {
                console.log('get message:', request)
                switch (request.cmd){
                    case 'popupOnOpen':
                        if (request.screen) {
                            barcodeDecodeApi.screen = request.screen
                        }
                        break
                    default:
                        break
                }
            }
        })

        port.onDisconnect.addListener(function () {
            console.log('onDisconnect, clear popup port and interval')
            barcodeDecodeApi.popupPort = null
        })
    }
}

if (chrome) { // chrome
    barcodeDecodeApi.extensionNamespace = chrome
} else if (browser) { // firefox
    barcodeDecodeApi.extensionNamespace = browser
}

barcodeDecodeApi.extensionNamespace.runtime.onConnect.addListener(function (port) {
    console.log('runtime onConnect')
    barcodeDecodeApi.runTimeOnConnect(port)
})

barcodeDecodeApi.extensionNamespace.action.onClicked.addListener(function (tab) {
    console.log('action onClicked')
    barcodeDecodeApi.openPopup('../dynamsoft-barcode-local.html')
})
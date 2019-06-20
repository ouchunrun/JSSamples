var ws;
var wsAddr = document.getElementById('wsAddr').value;
var messageElem = document.getElementById('message');

function addWebSocket() {
    if(!wsAddr){
        alert("请输入服务器地址！！！");
        return false;
    }else {
        ws = new WebSocketClient();
        ws.connectUrl(wsAddr);
        return ws;
    }
}

function WebSocketClient() {
    WebSocketClient.prototype.isopen = false;
    // 定义保活重连参数
    WebSocketClient.prototype.reconnectAttempt = 0;       // 当前重连次数
    WebSocketClient.prototype.maxReconnectAttempts = 3;   // 最大重连次数
    WebSocketClient.prototype.keepAliveAttempt = 0;       // 当前保活次数
    WebSocketClient.prototype.wsKeepAliveInterval = null;    // 保活定时器

    this.webSocket = null;
    this.connectUrl = function (url) {
        this.webSocket = new WebSocket(url);

        this.webSocket.onopen = function (event) {
            WebSocketClient.prototype.setConnFlag(true);
            WebSocketClient.prototype.wsOnopenCallback(event);
        };

        this.webSocket.onmessage = function (event) {
            WebSocketClient.prototype.wsOnmessageCallback(event);
        };

        this.webSocket.onclose = function (event) {
            WebSocketClient.prototype.wsOncloseCallback(event);
            WebSocketClient.prototype.unInit();
        };

        this.webSocket.onerror = function (event) {
            WebSocketClient.prototype.wsOnerrorCallback(event);
        };
    };

    /** 设置各种回调函数 */

    /***
     * webSocket 连接打开
     */
    if (!WebSocketClient._wsOnopenCallback) {
        WebSocketClient.prototype.wsOnopenCallback = function (evt) {
            writeToScreen("<span style='color:#03A9F4'>连接成功，现在你可以发送信息啦！！！</span>");
            var data = "\r\n\r\n";
            if(!WebSocketClient.prototype.wsKeepAliveInterval){
                console.log("连接成功，设置10s保活定时器！");
                WebSocketClient.prototype.wsKeepAliveInterval = setInterval( function(){ this.sendMessage(data, this);}, 10000 );
            }
        };
        WebSocketClient._wsOnopenCallback = true;
    }

    /***
     * 向服务器发送消息
     */
    if (!WebSocketClient._sendMessage) {
        WebSocketClient.prototype.sendMessage = function (data) {

            if (WebSocketClient.prototype.isWsConnected() && this.webSocket != null) {
                if(data === "\r\n\r\n"){
                    console.warn("this.keepAliveAttempt: ", WebSocketClient.prototype.keepAliveAttempt);
                    switch (WebSocketClient.prototype.keepAliveAttempt) {
                        case 0 :
                            /* 保活次数为0， 即 websokect 连接后第一次发送，5s内没有收到服务器的回复，则以5s频率发送保活包 */
                            WebSocketClient.prototype.wsKeepAliveInterval && clearInterval( WebSocketClient.prototype.wsKeepAliveInterval );
                            WebSocketClient.prototype.wsKeepAliveInterval = setInterval( function(){this.sendMessage(data, this); }, 5000 );
                            this.webSocket.send(data);
                            break;
                        case 1:
                            /* 保活次数为1，2.5s内没有收到服务器回复，则以2.5s 频率发送保活包，同时清除5s定时器和10s定时器 */
                            WebSocketClient.prototype.wsKeepAliveInterval && clearInterval( WebSocketClient.prototype.wsKeepAliveInterval );
                            WebSocketClient.prototype.wsKeepAliveInterval = setInterval( function(){ this.sendMessage(data, this); }, 2500 );
                            this.webSocket.send(data);
                            break;
                        case 2:
                        case 3:
                            /* 保活次数为2~3s，2.5s内没有收到服务器回复，继续以2.5s 频率发送保活包 */
                            this.webSocket.send(data);
                            break;
                        case 4:
                            console.warn("保活失败，重新建立新的连接！");
                            /* webSocket 重发三次不成功即认为失败，断开之前的连接，重新建立新的连接 */
                            WebSocketClient.prototype.wsKeepAliveInterval && clearInterval( WebSocketClient.prototype.wsKeepAliveInterval );
                            WebSocketClient.prototype.wsKeepAliveInterval = null;
                            WebSocketClient.prototype.keepAliveAttempt = 0;
                            // 断开之前的连接
                            WebSocketClient.prototype.isopen = false;
                            this.webSocket.close();
                            // 重连
                            WebSocketClient.prototype.reConnection();

                            break;
                        default:
                            break;
                    }
                    WebSocketClient.prototype.keepAliveAttempt++;
                }else {
                    this.webSocket.send(data);
                }
                return true;
            } else {
                return false;
            }
        }
        WebSocketClient._sendMessage = true;
    }

    /***
     * 收到服务器发送的消息
     */
    if (!WebSocket._wsOnmessageCallback) {
        WebSocketClient.prototype.wsOnmessageCallback = function (evt) {
            var data = "\r\n\r\n";
            if(evt.data === '\r\n'){
                console.warn("收到服务器回复的保活包，恢复10s定时器");
                WebSocketClient.prototype.reconnectAttempt = 0;
                WebSocketClient.prototype.wsKeepAliveInterval && clearInterval(WebSocketClient.prototype.wsKeepAliveInterval);
                WebSocketClient.prototype.wsKeepAliveInterval = setInterval( function(){ this.sendMessage(data, this);}, 10000 );
            }else {
                console.warn("收到其他消息。。。");
                writeToScreen('<span style="color:blue">服务端回应&nbsp;' + formatDate(new Date()) + '</span><br/><span class="bubble">' + evt.data + '</span>');
            }
        };
        WebSocketClient._wsOnmessageCallback = true;
    }

    /***
     * webSocket 连接错误
     */
    if (!WebSocketClient._wsOnerrorCallback) {
        WebSocketClient.prototype.wsOnerrorCallback = function (evt) {
            writeToScreen('<span style="color: red;">发生错误，服务器连接失败！</span> ');
            return;
        };
        WebSocketClient._wsOnerrorCallback = true;
    }

    /***
     * webSocket 连接关闭
     */
    if (typeof WebSocketClient._wsOncloseCallback == "undefined") {
        WebSocketClient.prototype.wsOncloseCallback = function (evt) {
            writeToScreen("<span style='color:red'>websocket连接已断开!!!</span>");
            if(this.webSocket && this.webSocket.close){
                this.webSocket.close();
            }
            WebSocketClient.prototype.isopen = false;
            this.webSocket = null;
        };
        WebSocketClient._wsOncloseCallback = true;
    }

    /***
     * 重连
     */
    if (typeof WebSocketClient._reconnection == "undefined") {
        WebSocketClient.prototype.reConnection = function (data) {
            // ws = new WebSocketClient();
            if(WebSocketClient.prototype.reconnectAttempt < WebSocketClient.prototype.maxReconnectAttempts){
                ws.connectUrl(wsAddr);
                WebSocketClient.prototype.reconnectAttempt++;
                return true;
            }else {
                console.warn("重连失三次未成功，webSocket重连失败！！");
                writeToScreen("<span style='color:red'>重连失三次未成功，webSocket重连失败！！</span>");
                WebSocketClient.prototype.unInit();
                return false;
            }
        }
        WebSocketClient._reconnection = true;
    }

    /***
     * 关闭连接
     */
    if (typeof WebSocketClient._close == "undefined") {
        WebSocketClient.prototype.close = function (data) {
            this.webSocket.close(1000, "Closing");
            WebSocketClient.prototype.isopen = false;
            this.webSocket = null;
            return true;
        }
        WebSocketClient._close = true;
    }

    /***
     * 不初始化
     */
    if (typeof WebSocketClient._uninit == "undefined") {
        WebSocketClient.prototype.unInit = function (data) {
            WebSocketClient.prototype.isopen = false;
            this.webSocket = null;
            return true;
        }
        WebSocketClient._uninit = true;
    }

    /***
     * webSocket 是否已连接
     */
    if (typeof WebSocketClient._isWsConnected == "undefined") {
        WebSocketClient.prototype.isWsConnected = function (data) {
            return WebSocketClient.prototype.isopen;
        }
        WebSocketClient._isWsConnected = true;
    }

    /***
     * 设置是否连接的标志位
     */
    if (typeof WebSocketClient._setConnFlag == "undefined") {
        WebSocketClient.prototype.setConnFlag = function (flag) {
            WebSocketClient.prototype.isopen = flag;
        }
        WebSocketClient._setConnFlag = true;
    }
}


/***
 * 发送消息
 */
function sendMessage(data, target) {
    var message = messageElem.value;
    if(data === "\r\n\r\n"){
        ws.sendMessage(data);
        return;
    }
    if (!message) {
        console.log("请先填写发送信息");
        messageElem.focus();
        return false;
    }
    messageElem.value = " ";
    writeToScreen('<span style="color:green">你发送的信息&nbsp;' + formatDate(new Date()) + '</span><br/>' + message);
    ws.sendMessage(message);
}

/***
 * 键盘按键监听
 */
document.onkeydown = function () {
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        messageElem.focus();
    }

    if (event.which === 13) {
        sendMessage();
    }
}

/***
 * 连接状态显示
 * @param message
 */
function writeToScreen(message) {
    var parent = document.getElementById('output');
    var newChild = document.createElement("div");
    newChild.innerHTML = message;
    parent.appendChild(newChild);
}

/***
 * 当前时间格式化处理
 */
function formatDate(now) {
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    return year + "-" + (month = month < 10 ? ("0" + month) : month) + "-" + (date = date < 10 ? ("0" + date) : date) + " " + (hour = hour < 10 ? ("0" + hour) : hour) + ":" + (minute = minute < 10 ? ("0" + minute) : minute) + ":" + (second = second < 10 ? ("0" + second) : second);
}


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
        // 本地服务器
        // this.webSocket = new WebSocket(url);
        // IPVT 服务器，必须要配置protocols
        this.url = url;
        this.webSocket = new WebSocket(url, "sip");

        this.webSocket.onopen = function (event) {
            this.binaryType = 'arraybuffer';//可将 WebSocket 对象的 binaryType 属性设为“blob”或“arraybuffer”。默认格式为“blob”（您不必在发送时校正 binaryType 参数）。
            console.log("websocket server is running at " + url);

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

    /***
     * webSocket 连接打开
     */
    if (!WebSocketClient._wsOnopenCallback) {
        WebSocketClient.prototype.wsOnopenCallback = function (evt) {
            writeToScreen("<span style='color:#03A9F4'>连接成功，现在你可以发送信息啦！！！</span>");

            if(!WebSocketClient.prototype.wsKeepAliveInterval){
                console.log("连接成功，设置10s保活定时器！");
                var data = "\r\n\r\n";
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
                    // 定义各类型的回调，发送后调用
                    // this.webSocket.send( JSON.stringify({
                    //     "event" : "message",
                    //     "data" : {
                    //         "sdp" : null,
                    //         "message": data
                    //     }
                    // }));

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
        WebSocketClient.prototype.wsOnmessageCallback = function (event) {
            var data = "\r\n\r\n";
            if(event.data === '\r\n'){
                console.warn("收到服务器回复的保活包，恢复10s定时器");
                WebSocketClient.prototype.keepAliveAttempt = 0;
                WebSocketClient.prototype.wsKeepAliveInterval && clearInterval(WebSocketClient.prototype.wsKeepAliveInterval);
                WebSocketClient.prototype.wsKeepAliveInterval = setInterval( function(){ this.sendMessage(data, this);}, 10000 );
            }else {
                console.warn("收到服务器响应：" ,  event.data);
                // 类型判断
                if( typeof event.data === 'string'){   // 接收文本消息
                    console.log("string 类型...");
                }else if(event.data instanceof Blob){   // Blob消息或者ArrayBuffer消息处理
                    console.log("blob 格式");
                }else if(event.data instanceof ArrayBuffer){
                    console.log("arrayBuffer 格式");
                }else {
                    console.log("其他类型");
                }

                writeToScreen('<span style="color:blue">服务端回应&nbsp;' + formatDate(new Date()) + '</span><br/><span class="bubble">' + event.data + '</span>');
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
        WebSocketClient.prototype.close = function (error) {
            console.error("WebSocket error: ", error.toString())

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
            WebSocketClient.prototype.reconnectAttempt = 0;
            WebSocketClient.prototype.keepAliveAttempt = 0;
            clearInterval(WebSocketClient.prototype.wsKeepAliveInterval);
            WebSocketClient.prototype.wsKeepAliveInterval = null;
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

/***
 * 发送 Invite
 */
function sendInvite() {
    console.log("发送 INVITE...");
    var message = "INVITE sip:102003@pro.ipvideotalk.com:5060;transport=wss SIP/2.0\n" +
        "Via: SIP/2.0/WSS df7jal23ls0d.invalid;branch=z9hG4bKk2NqBXKOQPB9A7fFwlQiHABfEMscXXNy;rport\n" +
        "From: \"科技大厦实打实23423\"<sip:10000063761@pro.ipvideotalk.com>;tag=2vizgw8BXgTlGA4lWAze\n" +
        "To: <sip:102003@pro.ipvideotalk.com>;tag=as4ba8d810\n" +
        "Contact: <sips:10000063761@df7jal23ls0d.invalid;rtcweb-breaker=yes;click2call=no;transport=wss>;impi=10000063761;ha1=18f9b811918c853080e2e061bc03d625;+g.oma.sip-im;+sip.ice;language=\"en,fr\"\n" +
        "Call-ID: 0522a5d4-d3f8-248c-5c95-e139c564bcd1\n" +
        "CSeq: 3074 INVITE\n" +
        "Content-Type: application/sdp\n" +
        "Content-Length: 5330\n" +
        "Max-Forwards: 70\n" +
        "User-Agent: Grandstream gsmeeting/webrtc_chrome 77.0.3829.0\n" +
        "Organization: Grandstream\n" +
        "Session-Expires: 14400;refresher=uac\n" +
        "Supported: timer\n" +
        "\n" +
        "v=0\n" +
        "o=- 98182672788048560 5 IN IP4 127.0.0.1\n" +
        "s=Grandstream - chrome\n" +
        "t=0 0\n" +
        "a=msid-semantic: WMS\n" +
        "m=audio 51177 UDP/TLS/RTP/SAVPF 111 9 0 8\n" +
        "c=IN IP4 52.34.67.236\n" +
        "a=rtcp:9 IN IP4 0.0.0.0\n" +
        "a=candidate:3843951586 1 udp 2122260223 192.168.131.4 58875 typ host generation 0 network-id 1\n" +
        "a=candidate:956527311 1 udp 25108223 52.34.67.236 51177 typ relay raddr 115.236.68.170 rport 1481 generation 0 network-id 1\n" +
        "a=ice-ufrag:EoCs\n" +
        "a=ice-pwd:khLy7XbkplzaFTVF6yWF40Og\n" +
        "a=fingerprint:sha-256 A2:ED:FB:12:43:9A:D8:F7:78:CA:B5:F3:C5:FD:54:42:15:FB:5C:14:90:D9:47:D1:94:C5:F1:CF:F4:CD:FA:CC\n" +
        "a=setup:actpass\n" +
        "a=mid:0\n" +
        "a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\n" +
        "a=extmap:2 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\n" +
        "a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid\n" +
        "a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\n" +
        "a=extmap:5 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\n" +
        "a=sendrecv\n" +
        "a=msid:- f4966ad3-8e40-473d-8236-303d2ffd03f6\n" +
        "a=rtcp-mux\n" +
        "a=rtpmap:111 opus/48000/2\n" +
        "a=rtcp-fb:111 transport-cc\n" +
        "a=fmtp:111 minptime=10;useinbandfec=1\n" +
        "a=rtpmap:9 G722/8000\n" +
        "a=rtpmap:0 PCMU/8000\n" +
        "a=rtpmap:8 PCMA/8000\n" +
        "a=ssrc:2823232193 cname:SnfV9Dyrvi6v9eLE\n" +
        "a=ssrc:2823232193 msid:- f4966ad3-8e40-473d-8236-303d2ffd03f6\n" +
        "a=ssrc:2823232193 mslabel:-\n" +
        "a=ssrc:2823232193 label:f4966ad3-8e40-473d-8236-303d2ffd03f6\n" +
        "m=video 46444 UDP/TLS/RTP/SAVPF 96 97 100 101 102 122\n" +
        "c=IN IP4 52.34.67.236\n" +
        "a=rtcp:9 IN IP4 0.0.0.0\n" +
        "a=candidate:3843951586 1 udp 2122260223 192.168.131.4 58876 typ host generation 0 network-id 1\n" +
        "a=candidate:956527311 1 udp 25108223 52.34.67.236 46444 typ relay raddr 115.236.68.170 rport 1603 generation 0 network-id 1\n" +
        "a=ice-ufrag:nswS\n" +
        "a=ice-pwd:gG+/Cq497Js7tVXlaFzY8Akj\n" +
        "a=fingerprint:sha-256 9E:F9:A4:8A:CE:A0:44:E3:2D:75:BD:3E:13:9B:AC:75:13:8C:06:80:B8:B0:77:9C:62:E0:95:0B:E0:F7:24:56\n" +
        "a=setup:actpass\n" +
        "a=mid:1\n" +
        "a=extmap:14 urn:ietf:params:rtp-hdrext:toffset\n" +
        "a=extmap:13 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\n" +
        "a=extmap:12 urn:3gpp:video-orientation\n" +
        "a=extmap:2 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\n" +
        "a=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay\n" +
        "a=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type\n" +
        "a=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing\n" +
        "a=extmap:8 http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07\n" +
        "a=extmap:9 http://www.webrtc.org/experiments/rtp-hdrext/color-space\n" +
        "a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid\n" +
        "a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\n" +
        "a=extmap:5 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\n" +
        "a=recvonly\n" +
        "a=rtcp-mux\n" +
        "a=rtcp-rsize\n" +
        "a=rtpmap:96 VP8/90000\n" +
        "a=fmtp:96 max-fs=8160\n" +
        "a=rtcp-fb:96 goog-remb\n" +
        "a=rtcp-fb:96 transport-cc\n" +
        "a=rtcp-fb:96 ccm fir\n" +
        "a=rtcp-fb:96 nack\n" +
        "a=rtcp-fb:96 nack pli\n" +
        "a=rtpmap:97 rtx/90000\n" +
        "a=fmtp:97 apt=96\n" +
        "a=rtpmap:100 VP9/90000\n" +
        "a=rtcp-fb:100 goog-remb\n" +
        "a=rtcp-fb:100 transport-cc\n" +
        "a=rtcp-fb:100 ccm fir\n" +
        "a=rtcp-fb:100 nack\n" +
        "a=rtcp-fb:100 nack pli\n" +
        "a=fmtp:100 profile-id=2\n" +
        "a=rtpmap:101 rtx/90000\n" +
        "a=fmtp:101 apt=100\n" +
        "a=rtpmap:102 H264/90000\n" +
        "a=rtcp-fb:102 goog-remb\n" +
        "a=rtcp-fb:102 transport-cc\n" +
        "a=rtcp-fb:102 ccm fir\n" +
        "a=rtcp-fb:102 nack\n" +
        "a=rtcp-fb:102 nack pli\n" +
        "a=fmtp:102 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=420028\n" +
        "a=rtpmap:122 rtx/90000\n" +
        "a=fmtp:122 apt=102\n" +
        "a=quality:5\n" +
        "a=content:main\n" +
        "m=video 58877 UDP/TLS/RTP/SAVPF 96 97 100 101 102 122\n" +
        "c=IN IP4 192.168.131.4\n" +
        "a=rtcp:9 IN IP4 0.0.0.0\n" +
        "a=candidate:3843951586 1 udp 2122260223 192.168.131.4 58877 typ host generation 0 network-id 1\n" +
        "a=ice-ufrag:miPY\n" +
        "a=ice-pwd:P6DjluOTLUAeS+F7nwwKDWfa\n" +
        "a=fingerprint:sha-256 5D:31:74:35:BD:61:A0:7E:9B:AA:87:07:07:14:51:A0:E9:97:A2:C2:5B:F5:2A:A9:F9:51:07:1A:33:E1:22:45\n" +
        "a=setup:actpass\n" +
        "a=mid:2\n" +
        "a=extmap:14 urn:ietf:params:rtp-hdrext:toffset\n" +
        "a=extmap:13 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\n" +
        "a=extmap:12 urn:3gpp:video-orientation\n" +
        "a=extmap:2 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\n" +
        "a=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay\n" +
        "a=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type\n" +
        "a=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing\n" +
        "a=extmap:8 http://tools.ietf.org/html/draft-ietf-avtext-framemarking-07\n" +
        "a=extmap:9 http://www.webrtc.org/experiments/rtp-hdrext/color-space\n" +
        "a=extmap:3 urn:ietf:params:rtp-hdrext:sdes:mid\n" +
        "a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id\n" +
        "a=extmap:5 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id\n" +
        "a=recvonly\n" +
        "a=rtcp-mux\n" +
        "a=rtcp-rsize\n" +
        "a=rtpmap:96 VP8/90000\n" +
        "a=fmtp:96 max-fs=8160\n" +
        "a=rtcp-fb:96 goog-remb\n" +
        "a=rtcp-fb:96 transport-cc\n" +
        "a=rtcp-fb:96 ccm fir\n" +
        "a=rtcp-fb:96 nack\n" +
        "a=rtcp-fb:96 nack pli\n" +
        "a=rtpmap:97 rtx/90000\n" +
        "a=fmtp:97 apt=96\n" +
        "a=rtpmap:100 VP9/90000\n" +
        "a=rtcp-fb:100 goog-remb\n" +
        "a=rtcp-fb:100 transport-cc\n" +
        "a=rtcp-fb:100 ccm fir\n" +
        "a=rtcp-fb:100 nack\n" +
        "a=rtcp-fb:100 nack pli\n" +
        "a=fmtp:100 profile-id=2\n" +
        "a=rtpmap:101 rtx/90000\n" +
        "a=fmtp:101 apt=100\n" +
        "a=rtpmap:102 H264/90000\n" +
        "a=rtcp-fb:102 goog-remb\n" +
        "a=rtcp-fb:102 transport-cc\n" +
        "a=rtcp-fb:102 ccm fir\n" +
        "a=rtcp-fb:102 nack\n" +
        "a=rtcp-fb:102 nack pli\n" +
        "a=fmtp:102 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=420028\n" +
        "a=rtpmap:122 rtx/90000\n" +
        "a=fmtp:122 apt=102\n" +
        "a=content:slides";

    ws.sendMessage(message);
}



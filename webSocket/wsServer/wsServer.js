/** 搭建本地服务器 */

// 导入WebSocket模块:
const WebSocket = require('ws');
// 引用Server类并实例化:
const server = new WebSocket.Server({ port: 3000 });


/**  在connection事件中，回调函数会传入一个WebSocket的实例，表示这个WebSocket连接。
 *  对于每个WebSocket连接，我们都要对它绑定某些事件方法来处理不同的事件。
 * 这里，我们通过响应message事件，在收到消息后再返回一个ECHO: xxx的消息给客户端。
 */
server.on('connection', function (ws) {
    console.log("webSocket 已建立连接...");

    // 收到消息
    ws.on('message', function (message) {
        console.log(`[SERVER] Received: ${message}`);

        // if(message == " "){
        //     console.warn("收到的是保活包。。。");
        //     // 给客户端返回消息
        //     ws.send("\r\n", (err) => {
        //         if (err) {
        //             console.log(`[SERVER] error: ${err}`);
        //         }
        //     });
        // }else {
        //     // 给客户端返回消息
        //     ws.send(`ECHO: ${message}`, (err) => {
        //         if (err) {
        //             console.log(`[SERVER] error: ${err}`);
        //         }
        //     });
        // }
    });

    // 连接关闭
    ws.on('close',function () {
        console.log('webSocket 已断开连接...');
    })
})

console.log('websocket server is running at http://localhost:3000');

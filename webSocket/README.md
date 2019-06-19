
## webSocket 流程：

- 创建实例，建立连接 （protocol、url）
    
- 连接成功，发送数据：
    - 保活数据包 (`data == "\r\n\r\n"`)
    - 真实数据 message(INVITE NOTIFIED INFO ...)

- webSocket 重连场景：
    - websocket 保活失败重新建立连接
    - websocket异常断开，重新建立连接
    - 说明：三次重连不成功就表示重连失败
    
- 收到的 webSocket 消息：
    - 保活数据包 (`data == "\r\n"`)
    - 其他数据 (INVITE NOTIFIED INFO ...)
    


## 保活定时器设计




## 重连设计



## 参考

- https://www.html5rocks.com/en/tutorials/websockets/basics/
- https://zhuanlan.zhihu.com/p/23467317
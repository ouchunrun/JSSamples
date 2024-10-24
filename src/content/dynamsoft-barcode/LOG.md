# Change Log

## 2024-10·24

- 1.去除外部服务器请求
  - （1）https://mlts.dynamsoft.com/auth/
    - 固定返回值，避免向外部服务器发送请求，详见 core.worker.js TODO 注释
  - （2）https://mlts.dynamsoft.com/verify/v2?ltstime=2024-10-24T06%3A41%3A00.209Z
    - 去除verify/v2请求，避免向外部服务器发送请求， 详见 core.worker.js TODO 注释

- 2.页面加载完成后，自动清除本地存储数据
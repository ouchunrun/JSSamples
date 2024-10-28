# Change Log

## 2024-10-28

- 1.页面添加error tip 提示
- 2.添加cookies、indexed 缓存处理

## 2024-10·25

- 1.添加 `manifest.json` 插件加载配置

- 2.Github 部署后，扫描未返回结果问题
  - 原因：debug发现，代码中返回了"No license found for Dynamsoft Barcode Reader."错误
  - 扫描实现通过 _captureInWorker 接口，在worker中解析处理
  - 处理：调用initDynamsoftLicense接口，初始化lisense，避免出现"No license found

- 3.添加从图片识别条形码的功能，参考：https://github.com/Dynamsoft/barcode-reader-javascript-samples/tree/main/hello-world/angular

## 2024-10·24

- 1.去除外部服务器请求
  - （1）https://mlts.dynamsoft.com/auth/
    - 固定返回值，避免向外部服务器发送请求，详见 core.worker.js TODO 注释
  - （2）https://mlts.dynamsoft.com/verify/v2?ltstime=2024-10-24T06%3A41%3A00.209Z
    - 去除verify/v2请求，避免向外部服务器发送请求， 详见 core.worker.js TODO 注释

- 2.页面加载完成后，自动清除本地存储数据

- 3.优化調整
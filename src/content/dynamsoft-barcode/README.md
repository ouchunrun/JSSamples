
# 功能

- 1.支持图片识别
- 2.支持通过摄像头扫描
- 3.支持条形码和二维码识别

# 参考

## [Dynamsoft Barcode Reader JavaScript Edition 10.x 版本简介](https://www.dynamsoft.com/barcode-reader/docs/web/programming/javascript/)
  
Online Demo: https://demo.dynamsoft.com/barcode-reader-js/common-oned-twod?source=dbrdemo

1.快速集成：

```js
    <!DOCTYPE html>
    <html>
    <body>
    <script src="https://cdn.jsdelivr.net/npm/dynamsoft-barcode-reader-bundle@10.4.2001/dist/dbr.bundle.js"></script>
    <div id="camera-view-container" style="width: 100%; height: 60vh"></div>
    <textarea id="results" style="width: 100%; min-height: 10vh; font-size: 3vmin; overflow: auto" disabled></textarea>
    <script>
    Dynamsoft.License.LicenseManager.initLicense("DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9");
    Dynamsoft.Core.CoreModule.loadWasm(["dbr"]);
    (async () => {
        let cvRouter = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();

        let cameraView = await Dynamsoft.DCE.CameraView.createInstance();
        let cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(cameraView);
        document.querySelector("#camera-view-container").append(cameraView.getUIElement());
        cvRouter.setInput(cameraEnhancer);

        const resultsContainer = document.querySelector("#results");
        cvRouter.addResultReceiver({ onDecodedBarcodesReceived: (result) => {
        if (result.barcodeResultItems.length > 0) {
            resultsContainer.textContent = '';
            for (let item of result.barcodeResultItems) {
            resultsContainer.textContent += `${item.formatString}: ${item.text}\n\n`;
            }
        }
        }});

        let filter = new Dynamsoft.Utility.MultiFrameResultCrossFilter();
        filter.enableResultCrossVerification('barcode', true);
        filter.enableResultDeduplication('barcode', true);
        await cvRouter.addResultFilter(filter);

        await cameraEnhancer.open();
        await cvRouter.startCapturing("ReadSingleBarcode");
    })();
    </script>
    </body>
    </html>
```

2.[简易条码扫描仪](https://github.com/Dynamsoft/easy-barcode-scanner)

> Easy Barcode Scanner 是 Dynamsoft Barcode Reader SDK 的轻量级、用户友好的包装器。它简化了条形码扫描过程，使其能够以最小的努力更轻松地集成到您的 Web 应用程序中。

- [easy-barcode-scanner Online Demo](https://dynamsoft.github.io/easy-barcode-scanner/index.html)

- 特征：
  - 支持基于视频的条码扫描
  - 轻松处理多个条形码
  - 只需几行代码即可轻松集成

- 开箱即用的扫描

```js
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <button id="btn-scan">scan</button>
  <script src="https://cdn.jsdelivr.net/npm/dynamsoft-barcode-reader-bundle@10.2.1000/dist/dbr.bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/Dynamsoft/easy-barcode-scanner@10.2.1009/dist/easy-barcode-scanner.js"
    data-license=""></script>
  <script>
    document.getElementById('btn-scan').addEventListener('click',async()=>{
      try{
        let txt = await EasyBarcodeScanner.scan();
        alert(txt);
      }catch(ex){
        let errMsg = ex.message || ex;
        console.error(errMsg);
        alert(errMsg);
      }
    });
  </script>
</body>
</html>
```

3.图片识别：

- 参考[Hello World in Angular: Read barcodes from camera and images in an Angular application.](https://github.com/Dynamsoft/barcode-reader-javascript-samples/tree/main/hello-world/angular)

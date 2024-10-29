
# 功能

- 1.支持图片识别
- 2.支持通过摄像头扫描
- 3.支持条形码和二维码识别

# Demo参考 hello-world samples

```js
<h1>Hello World (Decode via Camera)</h1>
    <div id="camera-view-container" style="width: 100%; height: 80vh"></div>
    Results:<br />
    <div id="results" style="width: 100%; height: 10vh; overflow: auto; white-space: pre-wrap"></div>
    <script src="https://cdn.jsdelivr.net/npm/dynamsoft-barcode-reader-bundle@10.4.2001/dist/dbr.bundle.js"></script>
    <script>
      /** LICENSE ALERT - README
       * To use the library, you need to first specify a license key using the API "initLicense()" as shown below.
       */

      Dynamsoft.License.LicenseManager.initLicense(
        "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAwLWRicl9qc19zYW1wbGVzIiwib3JnYW5pemF0aW9uSUQiOiIyMDAwMDAifQ=="
      );

      /**
       * You can visit https://www.dynamsoft.com/customer/license/trialLicense?utm_source=samples&product=dbr&package=js to get your own trial license good for 30 days.
       * Note that if you downloaded this sample from Dynamsoft while logged in, the above license key may already be your own 30-day trial license.
       * For more information, see https://www.dynamsoft.com/barcode-reader/docs/web/programming/javascript/user-guide/index.html?ver=10.4.2001&cVer=true#specify-the-license&utm_source=samples or contact support@dynamsoft.com.
       * LICENSE ALERT - THE END
       */

      // Optional. Used to load wasm resources in advance, reducing latency between video playing and barcode decoding.
      Dynamsoft.Core.CoreModule.loadWasm(["DBR"]);
      // Defined globally for easy debugging.
      let cameraEnhancer, cvRouter;

      (async () => {
        try {
          // Create a `CameraEnhancer` instance for camera control and a `CameraView` instance for UI control.
          const cameraView = await Dynamsoft.DCE.CameraView.createInstance();
          cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(cameraView);
          // Get default UI and append it to DOM.
          document.querySelector("#camera-view-container").append(cameraView.getUIElement());

          // Create a `CaptureVisionRouter` instance and set `CameraEnhancer` instance as its image source.
          cvRouter = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();
          cvRouter.setInput(cameraEnhancer);

          // Define a callback for results.
          cvRouter.addResultReceiver({
            onDecodedBarcodesReceived: (result) => {
              if (!result.barcodeResultItems.length) return;

              const resultsContainer = document.querySelector("#results");
              resultsContainer.textContent = "";
              console.log(result);
              for (let item of result.barcodeResultItems) {
                resultsContainer.textContent += `${item.formatString}: ${item.text}\n\n`;
              }
            },
          });

          // Filter out unchecked and duplicate results.
          const filter = new Dynamsoft.Utility.MultiFrameResultCrossFilter();
          // Filter out unchecked barcodes.
          filter.enableResultCrossVerification("barcode", true);
          // Filter out duplicate barcodes within 3 seconds.
          filter.enableResultDeduplication("barcode", true);
          await cvRouter.addResultFilter(filter);

          // Open camera and start scanning single barcode.
          await cameraEnhancer.open();
          await cvRouter.startCapturing("ReadSingleBarcode");
        } catch (ex) {
          let errMsg = ex.message || ex;
          console.error(errMsg);
          alert(errMsg);
        }
      })();
    </script>
```


## 链接官网

- 1.Official Online Demo:
  - [Github Dynamsoft Barcode Reader samples for the web](https://github.com/Dynamsoft/barcode-reader-javascript-samples)
- 2.Popular Examples -- Hello World
  - [Barcode Reader for Your Website - User Guide](https://www.dynamsoft.com/barcode-reader/docs/web/programming/javascript/user-guide/)
  - [github](https://github.com/Dynamsoft/barcode-reader-javascript-samples/blob/v10.4.20/hello-world/hello-world.html)
  - [online Demo](https://demo.dynamsoft.com/Samples/DBR/JS/hello-world/hello-world.html?ver=10.4.20&utm_source=guide)
  
- 2.简易条码扫描仪
  - [Github link](https://github.com/Dynamsoft/easy-barcode-scanner)
  - [easy-barcode-scanner Online Demo](https://dynamsoft.github.io/easy-barcode-scanner/index.html)


- 3.UNPKG 资源下载
  - [地址](https://unpkg.com/browse/dynamsoft-barcode-reader@10.2.10/)

# 说明

该Demo不可用，因为license无效。官网定期更新Demo中的依赖版本，一个Demo版本无法长期使用，只能短暂试用。
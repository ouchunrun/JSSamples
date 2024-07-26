## 1.需求

拷贝图片后，自动识别图片内容。

## 2.Clipboard API 支持测试

相关接口：`navigator.clipboard`

### 2.1 测试结果

- 1.安卓和ios都需要先点击页面，触发用户手势，才能访问剪切板。
- 2.**且ios 还会提示“粘贴”按钮**，点击“粘贴”后，才会处理剪切板内容
- 3.部分安卓手机，无法获取剪切板数据。如 `华为mate60、小米 `

### 2.2 Issuse

- 1.需要先拷贝好二维码图片，然后再进入配网页面。因为打开配网页面后，再切换到其他页面时，配网页面会自动关闭。
- 2.**图片的拷贝，不是所有APP都支持**。比如微信，没有拷贝图片的选项，钉钉可以。

### 2.3 测试数据


| 机型          | 浏览器         | 测试结果      | 存在问题                                        |
|-------------|-------------|-----------|---------------------------------------------|
| 华为mate60 pro | 自带浏览器       | 无法获取 | 提示没权限。NotAllowError: Read permission denied |
| 小米          | 自带浏览器       | 无法获取 | 提示没有有效数据。DataError: No valid data on clipbard|
| vivo iqoo   | Chrome      | 无法获取 | 拿到的图片数据类型为text/plain，无法正常显示图片               |
| vivo iqoo   | 自带浏览器       | 支持 |                                             |
| iphone se   | safari/chrome | 支持 |                                             |
| iphone 15   | safari/baidu | 支持 |                                             |
| iphone11 11 | safari/chrome | 支持 |                                             |

> 综上：ios 对Clipboard API支持性比安卓好一些。




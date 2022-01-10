# crypto-js [![Build Status](https://travis-ci.org/brix/crypto-js.svg?branch=develop)](https://travis-ci.org/brix/crypto-js)

JavaScript library of crypto standards.


## Node.js (Install)

Requirements:

- Node.js
- npm (Node.js package manager)

```bash
npm install crypto-js
```

### Usage without RequireJS

```html
<script type="text/javascript" src="path-to/bower_components/crypto-js/crypto-js.js"></script>
<script type="text/javascript">
    var encrypted = CryptoJS.AES(...);
    var encrypted = CryptoJS.SHA256(...);
</script>
```

## API

See: https://cryptojs.gitbook.io/docs/

### AES Encryption

#### Plain text encryption

```javascript
var CryptoJS = require("crypto-js");

// Encrypt 加密
var ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123').toString();

// Decrypt 解密
var bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
var originalText = bytes.toString(CryptoJS.enc.Utf8);

console.log(originalText); // 'my message'
```

#### Object encryption

```javascript
var CryptoJS = require("crypto-js");

var data = [{id: 1}, {id: 2}]

// Encrypt
var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'secret key 123').toString();

// Decrypt
var bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

console.log(decryptedData); // [{id: 1}, {id: 2}]
```

## Issue

- 1.[Crypto-JS AES 报错 Malformed UTF-8 data 的解决](https://blog.csdn.net/baidu_38424904/article/details/113144656)

- 2.[解决AES算法CBC模式加密字符串后再解密出现乱码问题](https://www.cnblogs.com/cposture/p/9028892.html)
    - 还未解决

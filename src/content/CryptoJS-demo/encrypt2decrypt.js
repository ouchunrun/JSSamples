/**
 * 正常加密解密示例
 * 参考：http://www.manongjc.com/detail/16-yowpbbplhzqeskq.html
 */
let newUserInfo = {nickname:'hello',email:'abc123@qq.com'};
//加密数据
let encJson = CryptoJS.AES.encrypt(JSON.stringify(newUserInfo), 'aes').toString();
console.warn("encJson:", encJson)
//对加密数据进行base64处理, 原理：就是先将字符串转换为utf8字符数组，再转换为base64数据
let encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
// localStorage.setItem('userInfo', encData);
console.log('encData:', encData)
//将数据先base64还原，再转为utf8数据
let decData = CryptoJS.enc.Base64.parse(encData).toString(CryptoJS.enc.Utf8);
console.log("decData:", decData)
//解密数据
let decJson = CryptoJS.AES.decrypt(decData, 'aes').toString(CryptoJS.enc.Utf8);
console.log('decJson:', decJson)
userInfo = JSON.parse(decJson);

console.log("userInfo:", userInfo);

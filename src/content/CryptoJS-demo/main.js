// 原始数据
let originalTextFromServer = '<?xml version="1.0" encoding="utf-8"?>\n' +
	'<gs_provision>\n' +
	'  <config version="2">\n' +
	'<item name="ldap"><part name="username">cn=admin,dc=pbx,dc=com</part><part name="protocol">LDAP</part><part name="ldapDisplayName">AccountNumber CallerIDName</part><part name="base">dc=pbx,dc=com</part><part name="ldapNameFilter">(CallerIDName=%)</part><part name="password">admin</part><part name="port">389</part><part name="ldapNameAttributes">CallerIDName Email Department FirstName LastName</part><part name="ldapNumberAttributes">AccountNumber MobileNumber HomeNumber Fax</part><part name="ldapNumberFilter">(AccountNumber=%)</part><part name="version">3</part><part name="server">192.168.1.1</part></item>  </config>\n' +
	'</gs_provision>'
console.log("originalTextFromServer:\r\n", originalTextFromServer)
let secretKeyData = "1000AuthID:grandstream:S1ptest@"
console.log('secretKeyData:', secretKeyData)

let md5Key = CryptoJS.MD5(secretKeyData).toString().substr(0, 16)
console.warn('secretKeyData ===>  key:', md5Key)
let decKey = CryptoJS.enc.Utf8.parse(md5Key);

let encDataStr = "EE6mJBOeW/HUOEUt2CN26/7SPsWV9gAJJ4u6ZXQCpKxTP1Y6r57rVZDBP/bts7ESCWKlOmsGN+6ubNJa9j0ntZwcAqeqxK4r44mSN59Iq4ZeTspbQEqIjtoo5MCIASfvAqkv1bGY/Y+Yub4oRQIZ9IWHxSEF6sNzlDgYVLajuhij6ARuOfzhXn3D1YrueiKLLohTv8q9L0swwk60+CWGGV5HprYhYG75muTzZKvx8XJgOgzcIbuB4VtaVZVCkBkUgkN6xtj/LTDF/rlVgYp/Na/4EC6ULfyjZ+3uw9uHiKdYpqrDFP8054CIvTtBooZLPL4+9NmOz4r64h45lbfrlCPc/EA9hmf9iZfCA4RvV31OcWN20VDKP13sYDzltp553eck5m7beQYv+IDl5WS5kQOrnHRNFvmnEclXtatoPHqHmdXNxrCaE6pSGEYYoV0SgrVXXeNHGXbsKRmbNJYo8HtpXdEeE+cpUPULspq4Pu6di+RTySTNaaPHWHzo2x7xnu4LPAOcgFlOG0xN5+qjU49mIGaoyJNDXJXYk8xNH21B4yEsM0YygFIuMwdGR2UiPv3l2ceM3ycnv/LVecM8g/9rYy30oneiXobo8waVYG/pDp/8aSH9lNm3V/xgg5gAb20siRvzqHcHadFxobfDH0Dg4GyACaOq1D6spbpgRFxu1KX26i3gn/JMMam4lDWuErNYcuBTfIoJSEQqrg9XIENw4rT2Ut9irYH1rK0GtY368sdZNtdehTcIhbquHQNlApHanrwIxLAW/ei3H1Nvguc1BqLrnZ7w04DbZI/RsAU+JZxKppb4nUQcUhwu3r/EUk4FezHl2iHQZEKgIwGt5coKML++vtWL8Nlt3SxAc9ClWp3Xkmdu5U7K1poKvoezDkwCOgLMpU/txpvKLa4FLyVoTPVdfqPY5mHmWF7VxT4lyBQBZzqRfAnpAi8ZEUXEnp0mKce/8uCH1KjAuVOdWQ=="
console.log('encDataStr:\r\n', encDataStr)

/***********************************************************************************************************************/

function hexCharCodeToStr(hexCharCodeStr) {
	let trimedStr = hexCharCodeStr.trim();
	let rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
	let len = rawStr.length;
	if (len % 2 !== 0) {
		console.warn("存在非法字符!");
		return "";
	}
	let curCharCode;
	let resultStr = [];
	for (let i = 0; i < len; i = i + 2) {
		curCharCode = parseInt(rawStr.substr(i, 2), 16);
		resultStr.push(String.fromCharCode(curCharCode));
	}
	return resultStr.join("");
}

/**
 * CryptoJS.AES/CBC/NoPadding 解密
 * 存在问题：解密得到的字符串出现乱码情况，通常都是前几十个字节乱码；
 */
function cryptoJSAESCBCDecrypt(){
	console.log('********************************* CBC/NoPadding ***********************************')
	let decData = CryptoJS.AES.decrypt(encDataStr, decKey, {
		iv: decKey,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.NoPadding
	});

	return decData.toString(CryptoJS.enc.Utf8).substr(16)
}

/**
 * CryptoJS.AES/ECB/NoPadding 解密
 * 存在问题：后面乱码
 */
function cryptoJSAESECBDecrypt(){
	console.log('********************************* ECB/NoPadding ***********************************')
	let decrypt = CryptoJS.AES.decrypt(encDataStr, decKey, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.NoPadding
	});
	return hexCharCodeToStr(decrypt.toString().substr(0, 32))
}

/**
 * 调用接口
 */
window.onload = function (){
	/**
	 * 说明：因为CBC和ECB模式下都存在不同区段的乱码，所有拼接两个模式下的部分结果即可获取正确的数据
	 * @type {string|string}
	 */
	let dec1 = cryptoJSAESECBDecrypt()
	let dec2 = cryptoJSAESCBCDecrypt()
	console.warn("originalText:\r\n", dec1+dec2)
}

let cryptoJSInstance = {
	// 未加密的数据
	originalText: '<?xml version="1.0" encoding="utf-8"?>\r\n' +
		'<gs_provision>\r\n' +
		'  <config version="2">\r\n' +
		'<item name="ldap"><part name="username">cn=admin,dc=pbx,dc=com</part><part name="protocol">LDAP</part><part name="ldapDisplayName">AccountNumber CallerIDName</part><part name="base">dc=pbx,dc=com</part><part name="ldapNameFilter">(CallerIDName=%)</part><part name="password">admin</part><part name="port">389</part><part name="ldapNameAttributes">CallerIDName Email Department FirstName LastName</part><part name="ldapNumberAttributes">AccountNumber MobileNumber HomeNumber Fax</part><part name="ldapNumberFilter">(AccountNumber=%)</part><part name="version">3</part><part name="server">192.168.1.1</part></item>  </config>\r\n' +
		'</gs_provision>\r\n',
	// 加密后的数据
	ciphertext: 'EE6mJBOeW/HUOEUt2CN26/7SPsWV9gAJJ4u6ZXQCpKxTP1Y6r57rVZDBP/bts7ESCWKlOmsGN+6ubNJa9j0ntZwcAqeqxK4r44mSN59Iq4ZeTspbQEqIjtoo5MCIASfvAqkv1bGY/Y+Yub4oRQIZ9IWHxSEF6sNzlDgYVLajuhij6ARuOfzhXn3D1YrueiKLLohTv8q9L0swwk60+CWGGV5HprYhYG75muTzZKvx8XJgOgzcIbuB4VtaVZVCkBkUgkN6xtj/LTDF/rlVgYp/Na/4EC6ULfyjZ+3uw9uHiKdYpqrDFP8054CIvTtBooZLPL4+9NmOz4r64h45lbfrlCPc/EA9hmf9iZfCA4RvV31OcWN20VDKP13sYDzltp553eck5m7beQYv+IDl5WS5kQOrnHRNFvmnEclXtatoPHqHmdXNxrCaE6pSGEYYoV0SgrVXXeNHGXbsKRmbNJYo8HtpXdEeE+cpUPULspq4Pu6di+RTySTNaaPHWHzo2x7xnu4LPAOcgFlOG0xN5+qjU49mIGaoyJNDXJXYk8xNH21B4yEsM0YygFIuMwdGR2UiPv3l2ceM3ycnv/LVecM8g/9rYy30oneiXobo8waVYG/pDp/8aSH9lNm3V/xgg5gAb20siRvzqHcHadFxobfDH0Dg4GyACaOq1D6spbpgRFxu1KX26i3gn/JMMam4lDWuErNYcuBTfIoJSEQqrg9XIENw4rT2Ut9irYH1rK0GtY368sdZNtdehTcIhbquHQNlApHanrwIxLAW/ei3H1Nvguc1BqLrnZ7w04DbZI/RsAU+JZxKppb4nUQcUhwu3r/EUk4FezHl2iHQZEKgIwGt5coKML++vtWL8Nlt3SxAc9ClWp3Xkmdu5U7K1poKvoezDkwCOgLMpU/txpvKLa4FLyVoTPVdfqPY5mHmWF7VxT4lyBQBZzqRfAnpAi8ZEUXEnp0mKce/8uCH1KjAuVOdWQ==',
	// 秘钥
	secretKeyData: '1000AuthID:grandstream:S1ptest@',
	/**
	 * 获取Md5处理后的秘钥数据
	 * @param secretKey
	 * @returns {*}
	 */
	getMD5Key: function (secretKey){
		let md5Key = CryptoJS.MD5(secretKey).toString().substr(0, 16)
		let decKey = CryptoJS.enc.Utf8.parse(md5Key);
		console.log('decKey:', decKey)
		return decKey
	},

	/**
	 * CryptoJS.AES/CBC/NoPadding 解密
	 * 存在问题：解密得到的字符串出现乱码情况，通常都是前几十个字节乱码；
	 */
	cryptoJSAESCBCDecrypt: function (encDataStr, decKey){
		console.log('********************************* CBC/NoPadding ***********************************')
		let decData = CryptoJS.AES.decrypt(encDataStr, decKey, {
			iv: decKey,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.NoPadding
		});

		return decData.toString(CryptoJS.enc.Utf8).substr(16)
	},

	/**
	 * CryptoJS.AES/ECB/NoPadding 解密
	 * 存在问题：后面乱码
	 */
	cryptoJSAESECBDecrypt: function (encDataStr, decKey){
		console.log('********************************* ECB/NoPadding ***********************************')
		let decrypt = CryptoJS.AES.decrypt(encDataStr, decKey, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.NoPadding
		});
		return cryptoJSInstance.hexCharCodeToStr(decrypt.toString().substr(0, 32))
	},

	hexCharCodeToStr: function (hexCharCodeStr){
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
	},

	getDefaultDecryptData: function (){
		let decKey = cryptoJSInstance.getMD5Key(cryptoJSInstance.secretKeyData)
		let dec1 = cryptoJSInstance.cryptoJSAESECBDecrypt(cryptoJSInstance.ciphertext, decKey)
		let dec2 = cryptoJSInstance.cryptoJSAESCBCDecrypt(cryptoJSInstance.ciphertext, decKey)
		let decData = dec1+dec2
		// 结尾存在多余的\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00字符
		if(decData.indexOf('\x00')){
			let index = decData.indexOf('\x00')
			decData = decData.slice(0, index)
		}
		console.warn("originalText:\r\n", decData)
		return decData
	},

	/**
	 * 字符串加密后再重新解密
	 * @param cipherValue:  {nickname:'hello',email:'abc123@qq.com'}
	 * @param secretValue:  'aes'
	 */
	getDecryptData: function (cipherValue, secretValue){
		cipherValue = cipherValue || 'CryptoJS encryption and decryption test'
		secretValue = secretValue || 'aes'
		console.log('cipherValue:', cipherValue)
		console.log('secretValue:', secretValue)
		//加密数据
		let encJson = CryptoJS.AES.encrypt(JSON.stringify(cipherValue), secretValue).toString();
		console.log('encJson:', encJson)
		//对加密数据进行base64处理, 原理：就是先将字符串转换为utf8字符数组，再转换为base64数据
		let encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
		console.log('encData:', encData)
		//将数据先base64还原，再转为utf8数据
		let decData = CryptoJS.enc.Base64.parse(encData).toString(CryptoJS.enc.Utf8);
		console.log('decData:', decData)
		//解密数据
		let decJson = CryptoJS.AES.decrypt(decData, 'aes').toString(CryptoJS.enc.Utf8);
		console.warn('CryptoJS.AES.decrypt data:', decJson)

		if(decJson === JSON.stringify(cipherValue)){
			console.warn('解密成功')
		}else {
			console.warn('解密失败？')
		}
	}
}


window.onload = function (){
	let secretKey = document.getElementById('secretKey')
	let cipherText = document.getElementById('cipherText')
	let getDecryptBtn = document.getElementById('getDecrypt')
	let getDefaultDecrypt = document.getElementById('getDefaultDecrypt')
	if(getDecryptBtn){
		getDefaultDecrypt.onclick = function (){
			let decryptData = cryptoJSInstance.getDefaultDecryptData()
			if(decryptData === cryptoJSInstance.originalText){
				console.warn("解密成功")
			}else {
				console.warn("解密失败")
			}
		}

		getDecryptBtn.onclick = function (){
			let cipherValue = cipherText.value
			let secretValue = secretKey.value
			cryptoJSInstance.getDecryptData(cipherValue, secretValue)
		}
	}else {
		console.warn("没有找到DOM节点")
	}
}

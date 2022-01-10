

let secretKeyData = "1000AuthID:grandstream:S1ptest@"
let md5Key = CryptoJS.MD5(secretKeyData).toString().substr(0, 16)

console.log('secretKeyData:', secretKeyData)
console.warn('secretKeyData ===>  key:', md5Key)


let decKey = CryptoJS.enc.Utf8.parse(md5Key);
let encDataStr = "EE6mJBOeW/HUOEUt2CN26/7SPsWV9gAJJ4u6ZXQCpKxTP1Y6r57rVZDBP/bts7ESCWKlOmsGN+6ubNJa9j0ntZwcAqeqxK4r44mSN59Iq4ZeTspbQEqIjtoo5MCIASfvAqkv1bGY/Y+Yub4oRQIZ9IWHxSEF6sNzlDgYVLajuhij6ARuOfzhXn3D1YrueiKLLohTv8q9L0swwk60+CWGGV5HprYhYG75muTzZKvx8XJgOgzcIbuB4VtaVZVCkBkUgkN6xtj/LTDF/rlVgYp/Na/4EC6ULfyjZ+3uw9uHiKdYpqrDFP8054CIvTtBooZLPL4+9NmOz4r64h45lbfrlCPc/EA9hmf9iZfCA4RvV31OcWN20VDKP13sYDzltp553eck5m7beQYv+IDl5WS5kQOrnHRNFvmnEclXtatoPHqHmdXNxrCaE6pSGEYYoV0SgrVXXeNHGXbsKRmbNJYo8HtpXdEeE+cpUPULspq4Pu6di+RTySTNaaPHWHzo2x7xnu4LPAOcgFlOG0xN5+qjU49mIGaoyJNDXJXYk8xNH21B4yEsM0YygFIuMwdGR2UiPv3l2ceM3ycnv/LVecM8g/9rYy30oneiXobo8waVYG/pDp/8aSH9lNm3V/xgg5gAb20siRvzqHcHadFxobfDH0Dg4GyACaOq1D6spbpgRFxu1KX26i3gn/JMMam4lDWuErNYcuBTfIoJSEQqrg9XIENw4rT2Ut9irYH1rK0GtY368sdZNtdehTcIhbquHQNlApHanrwIxLAW/ei3H1Nvguc1BqLrnZ7w04DbZI/RsAU+JZxKppb4nUQcUhwu3r/EUk4FezHl2iHQZEKgIwGt5coKML++vtWL8Nlt3SxAc9ClWp3Xkmdu5U7K1poKvoezDkwCOgLMpU/txpvKLa4FLyVoTPVdfqPY5mHmWF7VxT4lyBQBZzqRfAnpAi8ZEUXEnp0mKce/8uCH1KjAuVOdWQ=="
console.log('encDataStr:\r\n', encDataStr)
let decData = CryptoJS.AES.decrypt(encDataStr, decKey, {
	iv: decKey,
	mode: CryptoJS.mode.CBC,
	padding: CryptoJS.pad.Pkcs7
});

console.warn("decData:", decData)

var originalText = decData.toString(CryptoJS.enc.Utf8);
console.warn("originalText:\r\n", originalText)


let originalTextFromServer = '<?xml version="1.0" encoding="utf-8"?>\n' +
	'<gs_provision>\n' +
	'  <config version="2">\n' +
	'<item name="ldap"><part name="username">cn=admin,dc=pbx,dc=com</part><part name="protocol">LDAP</part><part name="ldapDisplayName">AccountNumber CallerIDName</part><part name="base">dc=pbx,dc=com</part><part name="ldapNameFilter">(CallerIDName=%)</part><part name="password">admin</part><part name="port">389</part><part name="ldapNameAttributes">CallerIDName Email Department FirstName LastName</part><part name="ldapNumberAttributes">AccountNumber MobileNumber HomeNumber Fax</part><part name="ldapNumberFilter">(AccountNumber=%)</part><part name="version">3</part><part name="server">192.168.1.1</part></item>  </config>\n' +
	'</gs_provision>'
console.log("originalTextFromServer:\r\n", originalTextFromServer)






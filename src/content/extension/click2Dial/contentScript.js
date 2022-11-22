/*******************************************************************************************************************/
/***********************************************网页内容识别***********************************************************/
/*******************************************************************************************************************/

let contentIdentification = {
	// 忽略的HTML DOM对象列表
	ignoreHTMLDomList: [
		'AUDIO',
		'VIDEO',
		'CANVAS',
		'SCRIPT'
	],
	phoneCallProtocolList: ['tel://', 'callto://', 'wavecallto://', 'tel:', 'callto:', 'wavecallto:'],
	regex: /([(])?([+]?)[-()]*[ ]?([0-9]{1,4})([)])?[- ()]*([0-9]{1,4})[- ()\/]*([0-9]{1,4})[- ]*([0-9]{0,4})[- ]*([0-9]{0,4})[- ]*([0-9]{0,4})[- ]*([0-9]{0,4})($|\s|[;,()（）；\s])/g,
	regexIP: new RegExp('((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])($|\\s|[;,])', 'g'),
	regexURL: new RegExp('http[s]?:\\/\\/\\S*(\\s|$)', 'g'),
	regexDate: [
		new RegExp('([1-9][0-9])([0-9]{2})-(1[0-2]|0[1-9])(-)?(3[0-1]|[1-2][0-9]|0[0-9])?($|\\)|\\s)', 'g'),
		new RegExp('(3[0-1]|[0-2][0-9]|[1-9])[\\/.-](1[0-2]|0[1-9]|[1-9])[\\/.-](([1-9][0-9])?[0-9]{2})($|\\)|\\s)', 'g'),
		new RegExp('(1[0-2]|0[1-9]|[1-9])[\\/.-](3[0-1]|[0-2][0-9]|[1-9])[\\/.-](([1-9][0-9])?[0-9]{2})($|\\)|\\s)', 'g'),
	],

	/**
	 * 需要忽略的页面
	 * 忽略不处理的页面
	 * @constructor
	 */
	urlToIgnored: function (){
		let ignoredURLArr = [
			'https://bugzilla.grandstream.com',
			'https://192.168.120.245',
			'https://192.168.120.246'
		]
		const locationStr = window.location.toString().toLowerCase()
		let host = window.location.host.toLowerCase()

		for (const item of ignoredURLArr) {
			let url = item.trim().toLowerCase()
			if (url) {
				if (locationStr.indexOf(url) >= 0) {
					console.log(`URL ignored ${locationStr} because it matches ${item}`)
					return true
				}
			}
		}
		return false
	},

	/**
	 * 转义 HTML 标签字符
	 */
	escapeHtmlTagChars: function (nodeValue){
		return nodeValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
	},

	/**
	 * 替换no breaking space字符
	 * @param text
	 * @returns {*}
	 */
	replaceNBSPChar: function (text){
		return text.replace(new RegExp(' ', 'g'), ' ')
	},

	/**
	 * 格式化号码，保存数字部分
	 * @param e
	 * @returns {*}
	 */
	formatNumber: function (e){
		return e.replace(/[^0-9+]/gi, '')
	},

	/**
	 * 鼠标hover时显示的调试内容
	 * @param e
	 * @returns {string}
	 */
	phoneCallTitle: function (e){
		return `Call ${e} via grp quicall`
	},

	/**
	 * 自定义dom节点内容
	 * @param t
	 * @returns {``}
	 */
	phoneCallItem: function (t) {
		return `<grpSpan grphref="${this.formatNumber(t)}" title="${this.phoneCallTitle(t)}">${t}</grpSpan>`
	},

	/**
	 * 处理文本
	 * @param targetNode
	 * @param searchedElementList
	 */
	parseNodeText: function (targetNode, searchedElementList){
		let tagChars = this.escapeHtmlTagChars(targetNode.nodeValue)
		if (tagChars) {
			if (this.regexURL.test(tagChars)) { 	// 忽略URL
				console.log(tagChars + ' skipped: matches URL regex')
				return;
			}
			if (this.regexIP.test(tagChars)) { 	// 忽略IP
				console.log(tagChars + ' skipped: matches IP address regex')
				return;
			}
			for (const item of this.regexDate) {  // 忽略日期
				if (item.test(tagChars)) {
					console.log(tagChars + ' skipped: matches date regex')
					return;
				}
			}

			tagChars = this.replaceNBSPChar(tagChars) // 不处理prompt alert confirm弹框
			if (tagChars.indexOf('prompt(') > 0 || tagChars.indexOf('alert(') > 0 || tagChars.indexOf('confirm(') > 0) {
				console.log(tagChars + ' skipped: contains prompt alert confirm')
				return
			}
			let number = ''
			let actualNumber = ''
			tagChars.replace(this.regex, (replacement) => {
				number = replacement
				actualNumber = this.formatNumber(replacement)
			})
			// console.log('tagChars ', tagChars, ' 转换为数字 ', actualNumber, 'with replacement ', number)
			// TODO: 这里把目标字符串替换为加密字符串
			tagChars = tagChars.replace(number, '<grpphone>' + btoa(unescape(encodeURIComponent(number))) + '</grpphone>')
			searchedElementList.push({element: targetNode, newhtml: tagChars,})
		}
	},

	/**
	 * 查找目标dom节点
	 * @param targetNode
	 * @param searchedElementList
	 * @returns {*[]}
	 */
	searchElements: function (targetNode, searchedElementList){
		targetNode.childNodes.forEach((node) => {
			// nodeType 属性可用来区分不同类型的节点，比如元素,文本和注释。
			const {nodeType} = node

			// 3: Node.TEXT_NODE,Element或者Attr中实际的文字
			// 8: Node.COMMENT_NODE,一个 Comment 节点。
			if (nodeType !== 3 && nodeType !== 8 && this.ignoreHTMLDomList.indexOf(node?.tagName) === -1) {
				// console.log(`searchElements node: ${node}, nodeType: ${nodeType} nodeValue: ${node.nodeValue}, node tagName ${node?.tagName}`)
				this.searchElements(node, searchedElementList)
			}
			if (nodeType === 3) {
				// console.log(`parseNodeText node: ${node}, nodeType: ${nodeType} nodeValue: ${node.nodeValue}, node tagName ${node?.tagName}`)
				this.parseNodeText(node, searchedElementList)
			}
		})
		return searchedElementList
	},

	/**
	 * 获取 nodeType === 1 的节点
	 * @param targetNode
	 */
	parseElementNode: function (targetNode){
		let This = this
		if(this.urlToIgnored()){
			return
		}

		let searchedElementList = []
		this.searchElements(targetNode, searchedElementList)

		console.log('searchedElementList:', searchedElementList)
		const divEle = document.createElement('div')
		let node
		let text = ''
		for (let j = 0; j < searchedElementList.length; j++) {
			const searchedParentNode = searchedElementList[j].element.parentNode
			if ((node !== searchedParentNode && (text && node && (node.innerHTML = text),
			searchedParentNode && (text = searchedParentNode.innerHTML),
				(node = searchedParentNode)),
				searchedElementList[j].element.data)
			) {
				let n = searchedElementList[j].newhtml
				console.log('newhtml：', n)

				n = n.replace(new RegExp('(?:<grptemp>)(.*?)(?:</grptemp>)', 'gm'), (e, t) =>
					decodeURIComponent(escape(atob(t)))
				)

				console.log('replace 1:', n)
				n = n.replace(new RegExp('(?:<grpphone>)(.*?)(?:</grpphone>)', 'gm'), (e, t) => {
					const n = decodeURIComponent(escape(atob(t)))
					return This.replaceNBSPChar(n).replace(This.regex, (e) => This.phoneCallItem(e))
				})
				console.log('replace 2:', n)
				divEle.innerHTML = text

				let outerHTMLWithReplace = text
				divEle.childNodes.forEach((childNode) => {
					if(childNode.nodeType !== 3 && childNode.outerHTML){
						// outerHTML全部替换为*
						outerHTMLWithReplace = outerHTMLWithReplace.replace(childNode.outerHTML, '*'.repeat(childNode.outerHTML.length))
					}
				})

				// 转义 HTML 标签字符
				const escapeData = This.escapeHtmlTagChars(searchedElementList[j].element.data).replace(/\xa0/g, '&nbsp;')
				console.log('outerHTMLWithReplace:', outerHTMLWithReplace)
				console.log('escapeData:', escapeData)

				let fromIndex = outerHTMLWithReplace.length
				let position = outerHTMLWithReplace.lastIndexOf('</grpSpan>', fromIndex) // 先查找'</grpSpan>'结束标签的位置，从该位置再查找，防止在'<grpSpan>'标签里有相同的字符

				let o = position === -1 ? outerHTMLWithReplace.indexOf(escapeData) : outerHTMLWithReplace.indexOf(escapeData, position)
				if (o >= 0) {
					const e = text.substring(0, o)
					let t = text.substring(o + escapeData.length)
					text = e + n + t

					console.log('e:', e)
					console.log('t:', t)
					console.log('text:', text)
				}
			}
		}
	},

	/**
	 * 验证手机号，处理规则：
	 * 1--以1为开头；
	 * 2--第二位可为3,4,5,7,8,中的任意一位；
	 * 3--最后以0-9的9个整数结尾。
	 * @param poneInput
	 * @returns {boolean}
	 */
	isPoneAvailable: function(poneInput) {
		let res = /^[1][3,4,5,7,8][0-9]{9}$/
		return res.test(poneInput)
	},

	/**
	 * 判断是否为电话号码
	 * @param tel
	 * @returns {boolean}
	 */
	isTelAvailable: function (tel){
		let reg = /^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/
		return reg.test(tel)
	},

	/**
	 * 验证邮箱
	 * @param emailInput
	 * @returns {boolean}
	 */
	isEmailAvailable: function (emailInput){
		let reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
		return reg.test(emailInput)
	},

	/**
	 * 处理点击呼叫的号码
	 * @param selectedText
	 */
	handleClick2DialNumber: function (selectedText){
		console.log('handleClick2DialNumber:', selectedText)
	},

	/**
	 * 同时匹配号码和邮箱
	 * @param str
	 */
	regularMatch: function (str){
		const res = /(1[0-9]{2,10})|([0-9]{3,4})?[0-9]{7,8}|[\d\w]+\b@[a-zA-ZA-z0-9]+.[a-z]+/g; //匹配手机号或者固话,邮箱
		str = str.replace(/\s|[(]|[)]|[（]|[）]|[-]*/g, ''); //去除字符串中所有空格、小括号和横杠
		let result = str.match(res); //识别手机号或者固话（在字符串内检索指定的值，或找到一个或多个正则表达式的匹配）
		if(result){
			for (let i = 0; i < result.length; i++) {
				let temp = result[i]
				str = str.replace(result[i], '<a href="tel:' + temp + '"  class="copy phone-num" style=" text-decoration: underline;color: #2878FF;">' + temp + '</a>');
			}
		}
	},

	/**
	 * 匹配电话号码和邮箱
	 * @param element
	 */
	matchTelAndEmail: function (element){
		// 根据正则完全匹配，后续通过话机提供的接口获取匹配规则
		let value = element.innerText
		console.log('matchTelAndEmail value:', value)
		if(this.isPoneAvailable(value) || this.isTelAvailable(value)){
			// 1.匹配手机号或者固话时，将纯文本替换为带自定义标签的节点，文本着色、显示下划线，并在鼠标hover时提示可以呼叫
			element.innerHTML = `<grpSpan grphref="${value}" title="${this.phoneCallTitle(value)}">${value}</grpSpan>`
		}else if(this.isEmailAvailable(value)){
			// 2.匹配邮箱时，根据插件获取到的ucm ldap通讯录查询号码，存在号码则同上处理
		}
	},
}

window.onload = function (){
	let bodyCheck = setInterval(function (){
		if(document.body){
			clearInterval(bodyCheck)
			bodyCheck = null
			contentIdentification.parseElementNode(document.body)
			// onInit()
		}else {
			console.log('document.body 还未获取到')
		}
	}, 1000)

}

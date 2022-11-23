/*******************************************************************************************************************/
/***********************************************网页内容识别***********************************************************/
/*******************************************************************************************************************/

let contentIdentification = {
	// 忽略的HTML DOM对象列表
	ignoreHTMLDomList: [
		'AUDIO',
		'VIDEO',
		'CANVAS',
		'SCRIPT',
		'STYLE',
		'A',
		'SCRIPT',
		'IMG',
		'TEXTAREA',
		'INPUT',
		'SELECT',
		'PRE',
		'CODE',
		'STYLE',
		'CANVAS',
		'SVG',
		'rect',
		'clipPath',
	],
	regexIP: new RegExp('((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])($|\\s|[;,])', 'g'),
	regexURL: new RegExp('http[s]?:\\/\\/\\S*(\\s|$)', 'g'),
	regexDate: [
		new RegExp('([1-9][0-9])([0-9]{2})-(1[0-2]|0[1-9])(-)?(3[0-1]|[1-2][0-9]|0[0-9])?($|\\)|\\s)', 'g'),
		new RegExp('(3[0-1]|[0-2][0-9]|[1-9])[\\/.-](1[0-2]|0[1-9]|[1-9])[\\/.-](([1-9][0-9])?[0-9]{2})($|\\)|\\s)', 'g'),
		new RegExp('(1[0-2]|0[1-9]|[1-9])[\\/.-](3[0-1]|[0-2][0-9]|[1-9])[\\/.-](([1-9][0-9])?[0-9]{2})($|\\)|\\s)', 'g'),
	],

	/**
	 * 匹配手机号，处理规则：
	 * 1--以1为开头；
	 * 2--第二位可为3,4,5,7,8,中的任意一位；
	 * 3--最后以0-9的9个整数结尾。
	 * @param str
	 * @returns {boolean}
	 */
	poneMatch: function(str) {
		let reg = /[1][3,4,5,7,8][0-9]{9}/g
		return str.match(reg)
	},

	/**
	 * 匹配电话号码
	 * @param str
	 * @returns {boolean}
	 */
	telMatch: function (str){
		let reg = /(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?/g
		return str.match(reg)
	},

	/**
	 * 匹配邮箱
	 * @param str
	 * @returns {boolean}
	 */
	emailMatch: function (str){
		let reg = /([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}/g
		return str.match(reg)
	},

	/**
	 * 同时匹配号码和邮箱
	 * @param str
	 */
	phoneAndEmailMatch: function (str){
		const res = /(1[0-9]{2,10})|([0-9]{3,4})?[0-9]{7,8}|[\d\w]+\b@[a-zA-ZA-z0-9]+.[a-z]+/g; //匹配手机号或者固话,邮箱
		str = str.replace(/\s|[(]|[)]|[（]|[）]|[-]*/g, ''); //去除字符串中所有空格、小括号和横杠
		 //识别手机号或者固话（在字符串内检索指定的值，或找到一个或多个正则表达式的匹配）
		return str.match(res)
	},

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
	 * 根据邮箱查找到的电话号码
	 * @param email 邮箱
	 * @param number 号码
	 * @returns {`<grpSpan grphref="${*}" title="${string}">${string}</grpSpan>`}
	 */
	phoneCallItemWithEmail: function (email, number) {
		return `<grpSpan grphref="${this.formatNumber(number)}" title="${this.phoneCallTitle(number)}">${email}</grpSpan>`
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
				// console.log(tagChars + ' skipped: matches URL regex')
				return;
			}
			if (this.regexIP.test(tagChars)) { 	// 忽略IP
				// console.log(tagChars + ' skipped: matches IP address regex')
				return;
			}
			for (const item of this.regexDate) {  // 忽略日期
				if (item.test(tagChars)) {
					// console.log(tagChars + ' skipped: matches date regex')
					return;
				}
			}

			// let matchList = this.phoneAndEmailMatch(tagChars)  // 获取所有能够匹配到的号码和邮箱列表
			let matchList = this.poneMatch(tagChars) || this.telMatch(tagChars)
			if(matchList){
				console.log('匹配到号码:', matchList)
				for (let i = 0; i < matchList.length; i++) {
					let matchStr = matchList[i]
					// 文本加密
					tagChars = tagChars.replace(matchStr, '<grpphone>' + btoa(unescape(encodeURIComponent(matchStr))) + '</grpphone>')
				}
				searchedElementList.push({ element: targetNode, newhtml: tagChars })
			}else {
				matchList = this.emailMatch(tagChars)
				if(matchList){
					console.log('匹配到邮箱:', matchList)
					let numberFind = false
					for (let i = 0; i < matchList.length; i++){
						let matchStr = matchList[i]
						let phoneNumber = '这里要使用邮箱根据ldap查询号码'
						if(phoneNumber){
							numberFind = true
							tagChars = tagChars.replace(
								matchStr,
								'<grpemail>' + btoa(unescape(encodeURIComponent(matchStr))) +'</grpemail><grpCallNumber>' + btoa(unescape(encodeURIComponent(phoneNumber))) + '</grpCallNumber>'
							)
						}
					}
					if(numberFind){
						searchedElementList.push({ element: targetNode, newhtml: tagChars })
					}
				}
			}
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
	pageScan: function (targetNode){
		let This = this
		if(this.urlToIgnored()){
			return
		}

		let searchedElementList = []
		this.searchElements(targetNode, searchedElementList)
		console.log('searchedElementList:', searchedElementList)

		for (let i = 0; i < searchedElementList.length; i++){
			// element 全是text节点，需要通过parentNode获取带DOM标签的内容
			let searchedElement = searchedElementList[i]
			let domNode = searchedElement.element
			let textParentNode = domNode.parentNode

			if(domNode.data){  // 文本存在数据
				let newhtml = searchedElement.newhtml
				// 1.把所有<grpphone></grpphone>包含的内容进行解密
				// 查找到的号码替换为自定义span标签
				newhtml = newhtml.replace(new RegExp('(?:<grpphone>)(.*?)(?:</grpphone>)', 'gm'), function (){
					/**
					 * arguments[0]是匹配到的子字符串
					 * arguments[1]是匹配到的分组项
					 * arguments[2]是匹配到的字符串的索引位置
					 * arguments[3]是源字符串本身
					 */
					const decryptedStr = decodeURIComponent(escape(atob(arguments[1])))
					return This.phoneCallItem(decryptedStr)
				})

				// 查找到的邮箱查询到号码后，替换为自定义标签
				let email
				newhtml = newhtml.replace(new RegExp('(?:<grpemail>)(.*?)(?:</grpemail>)', 'gm'), function (){
					email = decodeURIComponent(escape(atob(arguments[1])))
					return ''
				})
				if(email){
					newhtml = newhtml.replace(new RegExp('(?:<grpCallNumber>)(.*?)(?:</grpCallNumber>)', 'gm'), function (){
						let callNumber = decodeURIComponent(escape(atob(arguments[1])))
						return This.phoneCallItemWithEmail(email, callNumber)
					})
				}

				// 2.获取除目标字符串之外的其他文本信息：
				let outerHTMLWithReplace = textParentNode.innerHTML
				textParentNode.childNodes.forEach((childNode) => {
					if(childNode.nodeType !== 3 && childNode.outerHTML){  // nodeType: 3 为text文本节点
						// outerHTML全部替换为*，outerHTML能够获取到带标签和属性等所有内容
						outerHTMLWithReplace = outerHTMLWithReplace.replace(childNode.outerHTML, '*'.repeat(childNode.outerHTML.length))
					}
				})
				const escapeData = This.escapeHtmlTagChars(domNode.data).replace(/\xa0/g, '&nbsp;')
				let newhtmlStartIndex = outerHTMLWithReplace.indexOf(escapeData)

				// 3.更新Dom节点innerHTML值
				if (newhtmlStartIndex >= 0) {
					let originalPreContent =  textParentNode.innerHTML.substring(0, newhtmlStartIndex)  // 被替换字符串前面的内容
					// newhtml: 被添加了grpSpan标签的内容
					let originalEndContent =  textParentNode.innerHTML.substring(newhtmlStartIndex + escapeData.length) // 被替换字符串后面的内容
					textParentNode.innerHTML = originalPreContent + newhtml + originalEndContent  // 更新节点innerHTML值
				}
			}
		}
	},

	/**
	 * 处理点击呼叫的号码
	 * @param selectedText
	 */
	handleClick2DialNumber: function (selectedText){
		console.log('handleClick2DialNumber:', selectedText)
	},
}

/**
 * 页面dom节点扫描
 */
window.onload = function (){
	let bodyCheck = setInterval(function (){
		if(document.body){
			clearInterval(bodyCheck)
			bodyCheck = null
			contentIdentification.pageScan(document.body)
		}else {
			console.log('document.body 还未获取到')
		}
	}, 1000)

}

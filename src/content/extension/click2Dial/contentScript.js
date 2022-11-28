/*******************************************************************************************************************/
/******************************************* Content-script 和 backgroundJS 间的通信处理*******************************/
/*******************************************************************************************************************/
let grpDialingApi = {}

if(chrome){  // chrome
	grpDialingApi.webExtension = chrome
}else if(browser){  // firefox
	grpDialingApi.webExtension = browser
}

/**
 *  发送消息给背景页
 * @param message 内容
 * @param callback 回调
 */
function sendMessageToBackgroundJS(message, callback){
	if (chrome.runtime && chrome.runtime.sendMessage) {
		if (chrome.app && typeof chrome.app.isInstalled !== "undefined") {
			message.requestType = 'contentMessage2Background'
			chrome.runtime.sendMessage(message, function (response) {
				if (callback) {
					callback(response)
				}
			});
		} else {
			// 当在扩展管理中心刷新或更新了某扩展，然后切换到浏览器某标签页的页面中直接使用该扩展时，扩展可能报错"Extension context invalidated"
		}
	}
}

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
	phoneCallProtocolList: ['tel://', 'callto://'],
	regexIP: new RegExp('((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])($|\\s|[;,])', 'g'),
	regexURL: new RegExp('http[s]?:\\/\\/\\S*(\\s|$)', 'g'),
	regexDate: [
		new RegExp('([1-9][0-9])([0-9]{2})-(1[0-2]|0[1-9])(-)?(3[0-1]|[1-2][0-9]|0[0-9])?($|\\)|\\s)', 'g'),
		new RegExp('(3[0-1]|[0-2][0-9]|[1-9])[\\/.-](1[0-2]|0[1-9]|[1-9])[\\/.-](([1-9][0-9])?[0-9]{2})($|\\)|\\s)', 'g'),
		new RegExp('(1[0-2]|0[1-9]|[1-9])[\\/.-](3[0-1]|[0-2][0-9]|[1-9])[\\/.-](([1-9][0-9])?[0-9]{2})($|\\)|\\s)', 'g'),
	],

	/**
	 * 创建并返回一个新的观察器，它会在触发指定 DOM 事件时，调用指定的回调函数。
	 * MutationObserver 对 DOM 的观察不会立即启动；而必须先调用 observe() 方法来确定，要监听哪一部分的 DOM 以及要响应哪些更改.
	 *
	 * 回调函数，每当被指定的节点或子树以及配置项有Dom变动时会被调用。
	 * 回调函数拥有两个参数：一个是描述所有被触发改动的 MutationRecord 对象数组，另一个是调用该函数的MutationObserver 对象
	 */
	nodeObserver: new MutationObserver((mutationList) => {
		// 当观察到变动时执行的回调函数
		mutationList.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				const { tagName } = node
				if ('A' === tagName) {
					// console.log('Dynamic element "A" will be processed')
					contentIdentification.tryReWriteAnchorTag(node)
				} else if (contentIdentification.ignoreHTMLDomList.indexOf(tagName) >= 0) {
					// console.log('Dynamic element ignored: ' + tagName)
				} else {
					// console.log('Dynamic element parsed: ' + tagName)
					contentIdentification.urlToIgnored()
					setTimeout(() => {
						contentIdentification.pageScan(node)
					}, 1000)
				}
			})
		})
	}),

	/**
	 * 启动节点变化观察器
	 */
	attachObserver: function (){
		const targetNode = document.body
		const observerOptions = {
			attributes: !0, // 观察属性变动
			childList: !0, // 观察目标子节点的变化，是否有添加或者删除
			characterData: !0, // 观察节点或节点中包含的字符数据的更改
			subtree: !0, // 观察后代节点，默认为 false
		}
		this.nodeObserver.observe(targetNode, observerOptions)
	},

	/**
	 * 停止节点变化观察器
	 */
	detachObserver: function (){
		// 停止观察
		this.nodeObserver.disconnect()
	},

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
		return `<grpSpan grpcallnumber="${this.formatNumber(t)}" title="${this.phoneCallTitle(t)}">${t}</grpSpan>`
	},

	/**
	 * 根据邮箱查找到的电话号码
	 * @param email 邮箱
	 * @param number 号码
	 * @returns {``}
	 */
	phoneCallItemWithEmail: function (email, number) {
		return `<grpSpan grpcallnumber="${this.formatNumber(number)}" title="${this.phoneCallTitle(number)}">${email}</grpSpan>`
	},

	/**
	 * 替换目标文本为自定义dom节点
	 * @param searchedElement
	 */
	replaceNodeText: function (searchedElement){
		let This = this
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
	},

	/**
	 * 处理文本
	 * @param targetNode
	 */
	parseNodeText: function (targetNode){
		let searchedElement
		let tagChars = this.escapeHtmlTagChars(targetNode.nodeValue)
		if (tagChars) {
			this.detachObserver()
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
				// console.log('match number:', matchList)
				for (let i = 0; i < matchList.length; i++) {
					let matchStr = matchList[i]
					// 文本加密
					tagChars = tagChars.replace(matchStr, '<grpphone>' + btoa(unescape(encodeURIComponent(matchStr))) + '</grpphone>')
				}
				searchedElement = { element: targetNode, newhtml: tagChars }
			} else {
				// TODO: 这里邮箱正则匹配存在问题!!!!!!!!
				// matchList = this.emailMatch(tagChars)
				// if(matchList){
				// 	// console.log('match email:', matchList)
				// 	let numberFind = false
				// 	for (let i = 0; i < matchList.length; i++){
				// 		let matchStr = matchList[i]
				// 		let phoneNumber = 'number from ldap'
				// 		if(phoneNumber){
				// 			numberFind = true
				// 			tagChars = tagChars.replace(
				// 				matchStr,
				// 				'<grpemail>' + btoa(unescape(encodeURIComponent(matchStr))) +'</grpemail><grpCallNumber>' + btoa(unescape(encodeURIComponent(phoneNumber))) + '</grpCallNumber>'
				// 			)
				// 		}
				// 	}
				// 	if(numberFind){
				// 		searchedElement = { element: targetNode, newhtml: tagChars }
				// 	}
				// }
			}

			if(searchedElement){
				this.replaceNodeText(searchedElement)
			}
			this.attachObserver()
		}
	},

	/**
	 * 查找目标dom.nodeType = 3 的文本节点
	 * Node.ELEMENT_NODE	1	一个 元素 节点，例如 <p> 和 <div>。
	 * Node.ATTRIBUTE_NODE	2	元素 的耦合 属性。
	 * Node.TEXT_NODE	    3	Element 或者 Attr 中实际的 文字
	 * Node.COMMENT_NODE	8	一个 Comment 节点。
	 * @param targetNode
	 * @returns {*[]}
	 */
	searchTextNode: function (targetNode){
		targetNode.childNodes.forEach((node) => {
			// nodeType 属性可用来区分不同类型的节点，比如元素,文本和注释。
			const {nodeType} = node

			// 3: Node.TEXT_NODE,Element或者Attr中实际的文字
			// 8: Node.COMMENT_NODE,一个 Comment 节点。
			if (nodeType !== 3 && nodeType !== 8 && this.ignoreHTMLDomList.indexOf(node?.tagName) === -1) {
				// console.log(`search TextNode node: ${node}, nodeType: ${nodeType} nodeValue: ${node.nodeValue}, node tagName ${node?.tagName}`)
				this.searchTextNode(node)
			}
			if (nodeType === 3) {
				// console.log(`parseNodeText node: ${node}, nodeType: ${nodeType} nodeValue: ${node.nodeValue}, node tagName ${node?.tagName}`)
				this.parseNodeText(node)
			}
		})
	},

	/**
	 * 获取 nodeType === 1 的节点
	 * @param targetNode
	 */
	pageScan: function (targetNode){
		if(!targetNode || this.urlToIgnored()){
			return
		}

		// 1.查找目标dom.nodeType = 3 的文本节点
		this.searchTextNode(targetNode)

		// 2.处理超连接
		if(targetNode.getElementsByTagName){
			const anchorTagList = targetNode.getElementsByTagName('A')
			if (anchorTagList) {
				for (let i = 0; i < anchorTagList.length; i++) {
					try {
						const anchorTag = anchorTagList[i]
						this.tryReWriteAnchorTag(anchorTag)
					} catch (e) {
						// console.log(`tryReWriteAnchorTag: ${e}`)
					}
				}
			}
		}
	},

	/**
	 * 处理带有tel等呼叫表示的超链接标签
	 * @param targetNode
	 * @returns {*}
	 */
	tryReWriteAnchorTag: function (targetNode) {
		let This = this
		const url = decodeURI(targetNode.getAttribute('href'))
		if (url) {
			for (const item of this.phoneCallProtocolList) {
				if (url && url.substr(0, item.length) === item) {
					This.detachObserver()
					const phoneCallProtocol = url.substr(item.length)
					console.log('phoneCallProtocol：', phoneCallProtocol)
					targetNode.setAttribute('title', this.phoneCallTitle(phoneCallProtocol))
					// targetNode.setAttribute('href', 'javascript:void(0)')
					// targetNode.setAttribute('href', this.formatNumber(phoneCallProtocol))
					targetNode.setAttribute('grpcallnumber', this.formatNumber(phoneCallProtocol))
					This.attachObserver()  // 重写完成后再重新设置观察器
					break
				}
			}
		}

		return targetNode
	},

	/**
	 * 处理点击呼叫的号码
	 * @param number
	 */
	handleClick2DialNumber: function (number){
		console.log('handleClick2DialNumber:', number)
		sendMessageToBackgroundJS({
			cmd: 'contentScriptClick2Dial',
			data: {
				number: number,
			}
		})
	},

	/**
	 * 处理页面点击事件
	 * @param e
	 */
	handleClick: function (e){
		if(e && e.target && e.target.getAttribute){
			let callNumber = e.target.getAttribute('grpcallnumber')
			if(callNumber){
				console.log('get target call number: ', callNumber)
				this.handleClick2DialNumber(callNumber)
			}
		}
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
		}
	}, 1000)


	// 捕获元素点击事件
	document.addEventListener('click', function (e){
		contentIdentification.handleClick(e)
	}, { capture: true })

	/***************************************************监听文本选中事件********************************************/
	window.addEventListener('mouseup', function (e){
		if(e.target.nodeName === 'GRPSPAN' || e.target.getAttribute('grpcallnumber')){
			// 已添加自定义grpspan的内容不做处理
			return
		}

		let selection = window.getSelection()
		if(selection.anchorOffset !== selection.extentOffset){
			console.log('selection:', selection.toString())
			sendMessageToBackgroundJS({
				cmd: 'contentScriptMenusCheck',
				data: {
					selectionText: selection.toString(),
				}
			})
		}else {/*不存在选中内容*/}
	})

}

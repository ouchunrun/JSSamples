function beautyDate(date) {
	let yyyy = date.getFullYear();
	let m = date.getMonth() + 1; // getMonth() is zero-based
	let d = date.getDate();
	let h = date.getHours();
	let mi = date.getMinutes();
	let sec = date.getSeconds();
	let msec = date.getMilliseconds();
	
	let mm = m < 10 ? "0" + m : m;
	let dd = d < 10 ? "0" + d : d;
	let hh = h < 10 ? "0" + h : h;
	let min = mi < 10 ? "0" + mi : mi;
	let ss = sec < 10 ? "0" + sec : sec;
	let mss = msec < 10 ? "00" + msec : (msec < 100 ? "0" + msec : msec);
	
	return "".concat(yyyy).concat("-").concat(mm).concat("-").concat(dd).concat("@").concat(hh).concat(":").concat(min).concat(":").concat(ss).concat(".").concat(mss);
}
function getNowFormatDate() {
	var date = new Date();
	var seperator1 = ".";
	var seperator2 = "_";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
		+ " " + date.getHours() + seperator2 + date.getMinutes()
	return currentdate;
}

/**
 * bytes自适应转换到KB,MB,GB
 * @param fileSize
 * @returns {string}
 */
function formatFileSize(fileSize) {
	if (fileSize < 1024) {
		return fileSize + ' B';
	} else if (fileSize < (1024 * 1024)) {
		let temp = fileSize / 1024;
		temp = temp.toFixed(2);
		return temp + ' KB';
	} else if (fileSize < (1024 * 1024 * 1024)) {
		let temp = fileSize / (1024 * 1024);
		temp = temp.toFixed(2);
		return temp + ' MB';
	} else {
		let temp = fileSize / (1024 * 1024 * 1024);
		temp = temp.toFixed(2);
		return temp + ' GB';
	}
}

Array.prototype.quickSort = function () {
	const rec = (arr) => {
		// 递归都是要有尽头的，不然会无限进行下去
		// 直到Maximum call stack size exceeded
		// 而且注意，这里要有小于1，不然也会报错
		if (arr.length <= 1) return arr;
		let left = [];
		let right = [];
		const base = arr[0];
		// 因为基准线是arr[0]，所以从下标是1也就是第二个开始
		for (let i = 1; i < arr.length; i += 1) {
			if (arr[i].TS < base.TS) {
				left.push(arr[i])
			} else {
				right.push(arr[i])
			}
		}
		// 递归左边数组和右边数组，左边加上右边加上基准才是完整数组
		return [...rec(left), base, ...rec(right)];
	}
	const res = rec(this);
	// 遍历res，赋值到this也就是当前数组本身
	res.forEach((item, key) => {
		this[key] = item;
	})
}

function convertTextToParagraphs(logs){
	if(!logs){
		return logs
	}
	
	let tableContent = ''
	let index = 0
	for (let i = 0; i < logs.length; i++) {
		let log = logs[i]
		let namespace = log.moduleName + ':' + log.logLevel + ': '
		let logTime = new Date(parseInt(log.TS));
		logTime = beautyDate(logTime);
		let trContent = '<pre>[' + index + ']' + '[' + logTime + '] ' + namespace + log.content + "</pre>"
		tableContent = tableContent + trContent
		index++
	}
	return tableContent
}

self.onmessage = function(request) {
	console.warn("request:", request)
	let data = request.data
	switch(data.action){
		case 'sort':
			if(data.logs && data.logs.length){
				data.logs.quickSort()
			}
			let result = convertTextToParagraphs( data.logs)
			postMessage({  logs: result });
			break;
		default:
			break;
	}
};
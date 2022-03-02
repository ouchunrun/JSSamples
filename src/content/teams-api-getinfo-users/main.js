let authToken = 'EwCAA8l6BAAUwihrrCrmQ4wuIJX5mbj7rQla6TUAAeZ4tWxwWKgH12kSZb/8JQqwKHvZC/STcNYA7JFKYKrYdNni7omuqBkMk190KiANiI9WaX154WvcceqQFl3Zc0SsWq+PdFpXxomKx4PhBXjb0yz3HpZOxCNp+nBUisN/XbCUaS020gQVkbLrqePaYnu7MfCmsvlX0eDU985f6amUUJzt4xhfzSUZEJHxJEsLkJtGtlvsKAPJQZeAtz1fqtDHj4blrhqyKsS+cmtSZ3baPO3dTgoO8BVxpZ/hrhHsONVXpumkQxOGLJzXhgb6hNQbFhbCBKIbtoYvZPSxROVhJVmXoD4M0xC1kdUYEEjrX6k98GhSx5INsSVYPdS8qHoDZgAACB0QYCGm4vNFUAIalHMLFIwtntuks5KGZ4K/8YFKvSNvwwTQKgxZTqeKUrcA7TtIp6JlnElFc+R+xYI39s7Je6fU3xvF27iKX/ZbIpyKXzt039jiNv8WRF114z59mYylYRzFmA1vHcJxkqf13bpaWlX6TCzfE+PNSBLJES8GxDnz9MASIriDriwFeCKkKRK4li8GCWZBfJXheBFgBye2Hc00I7u25FUMNtECjlfFx3t4/KPsX90USIvxqdDmBMB1snN+0YFFG836epB5Hq2LY1TVfmzLl5o9ab280G0fM+HcSuqLWYeMk/O/DwdGSxdldtU9d/XzqqqupUURy7QEydAef4nLPCqeXKizNQuGW/gDm54IOz9UrXh8Yztam9z5o5apkKzzEHG4O2qOFW399zPY+STY2jgFmDxrAT5JfFV/mtgL3UEGGvM2xDwt/LRgZv2pk6a8MSY8PQK2l3aBcc3pGputAGJ/2zCLxhQUGtJjS0umVjFvUllHnOzNqcsvfKWTTG002dUOCyTL697EVAnFpRMMIcWHwUo3NyUoJRr5E/FjsxRHw3LHkACyM2lc2UGQcmskJHFgKW/6VjaayWmZ8Ub3ByjyG5uDB/aPyup0AsLhbNzuR38yA1RDnem+YWQUeEyMR3xkiVX/NYgWYWs+7Kfw8uo2vljH7zJae51AI+epND5Khy2MPIf+KC41WR9+KthrgJnj2C8ceauRiCaVwEwuiCmuKP+bMh83LQKL1VVT+i2Kn058iyaHUwd74TRQuH+kZPttLLKq2el3U7tCUFKXjyNFrIxfmgI='
let chatId = '19:uni01_dwv6af54ncpexq5pwndzdulfobgxnflcqxwq2bdtmbtjryjtpexq@thread.v2'
let axiosInstance = null
let locationOrigin = 'https://graph.microsoft.com/beta'

window.onload = async function (){
	axiosInstance = axios.create({
		// setRequestHeader 添加的头域
		headers: {
			Accept: 'application/json, text/plain, */*',
			Authorization: `Bearer ${authToken}`,
		}
	});

	console.log('axiosInstance init.')
}

/**
 * 获取个人资料
 */
async function getSelfProfile(){
	console.log('get self profile')
	let url = locationOrigin + `/me`;
	const response = await axiosInstance.get(url);
	console.warn(response)
	if(response.status === 200){
		console.warn('get self profile success')
		console.warn("res: ", JSON.stringify(response.data, null, '    '))
	}else {
		console.error('get self profile failed:', response.statusText)
	}
}

/**
 * 获取登录用户的信息，和/me一样
 * @returns {Promise<void>}
 */
async function getUsers(){
	let url = locationOrigin + `/users`;
	const response = await axiosInstance.get(url);
	console.warn(response)
	if(response.status === 200){
		console.warn('get users success')
		console.warn("res: ", JSON.stringify(response.data.value, null, '    '))
	}else {
		console.error('get users failed:', response.statusText)
	}

}

/**
 * 从已登录用户的默认联系人文件夹中获取联系人集合。
 * 来源：outlook 中的我的联系人列表
 * 获取 已登录 用户的联系人的 displayName 和 emailAddresses 属性。
 * https://docs.microsoft.com/zh-cn/graph/api/user-list-contacts?view=graph-rest-1.0&tabs=http
 */
async function getMyContacts(){
	let url = locationOrigin + `/me/contacts?$select=displayName,emailAddresses`;
	const response = await axiosInstance.get(url);
	console.warn(response)
	if(response.status === 200){
		console.warn('get self contacts success')
		console.warn("res: ", JSON.stringify(response.data.value, null, '    '))
	}else {
		console.error('get self contacts failed:', response.statusText)
	}
}

/**
 * 获取相关人员集合： 根据通信和协作模式及业务关系获取与登录用户 (/me) 相关度最高的人员。
 * https://docs.microsoft.com/zh-cn/graph/api/user-list-people?view=graph-rest-1.0&tabs=http
 * @returns {Promise<void>}
 */
async function listPeople(){
	let url = locationOrigin + `/me/people`;
	const response = await axiosInstance.get(url);
	console.warn(response)
	if(response.status === 200){
		console.warn('get list people success')
		console.warn("res: ", JSON.stringify(response.data, null, '    '))
	}else {
		console.error('get self list people failed:', response.statusText)
	}
}

/**
 * list members of a chat
 * @returns {Promise<void>}
 */
async function getChatMembers(){
	let url = locationOrigin + `/chats/{${chatId}}/members`;
	const response = await axiosInstance.get(url);
	console.warn(response)
	if(response.status === 200){
		console.warn('get self chat members success')
		console.warn("res: ", JSON.stringify(response.data, null, '    '))
	}else {
		console.error('get self chat members failed:', response.statusText)
	}
}

let allNotification = []

/**
 * 请求通知权限
 * @returns {Promise<NotificationPermission>}
 */
const requestNotificationPermission = () => {
    if (!window.Notification) {
        console.log('浏览器不支持通知')
        return false
    }else {
        return Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log('Notify allowed')
                return true
            } else if (permission === 'denied') {
                console.log('Notify reject')
                return false
            }
        })
    }
}

/**
 * 清除通知
 */
const clearNotification = () => {
    allNotification.forEach((item) => {
        if (item.close) item.close()
    })
    allNotification = []
}


/**
 * 根据通知tag关闭单个通知
 * @param tag
 */
const closeNotification = (tag) => {
    const closeIndex = allNotification.findIndex((item) => {
        return item.tag === tag
    })
    if (closeIndex >= 0) {
        if (allNotification[closeIndex].close) {
            allNotification[closeIndex].close()
            allNotification.splice(closeIndex, 1)
        }
    }
}

/**
 * 创建通知
 * @param title
 * @param options
 */
const createNotification = (title, options) => {
    if (!window.Notification) {
        console.log('浏览器不支持通知')
        return
    }
    if (Notification.permission === 'granted') {
        const { timeout, onClickCallback, requireInteraction } = options
        options.silent = true
        // if (navigator.userAgent.indexOf('Firefox') != -1 && title.length > 30) {
        //     // 用户使用的是 Firefox 浏览器
        //     title = title.slice(0, 50) + '...'
        // }
        let notification = new Notification(title, options)
        allNotification.push(notification)
        if (!requireInteraction) {
            setTimeout(() => {
                notification.close()
            }, timeout && timeout < 5000 ? timeout : 5000)
        }
        notification.onclick = function (e) {
            if (onClickCallback && typeof onClickCallback === 'function') {
                onClickCallback()
            }
            notification.close()
        }
        notification.onclose = function (e) {
            const { timestamp } = e.currentTarget
            const closeIndex = allNotification.findIndex((item) => {
                return item.timestamp === timestamp
            })
            if (closeIndex >= 0) {
                allNotification.splice(closeIndex, 1)
            }
        }
    }
}

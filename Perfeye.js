import axios from 'axios'

function send(url, data) {
  const { sendBeacon } = navigator
  if (sendBeacon) { // 支持 sendBeacon
    const buffer = new Blob(JSON.stringify(data), {
      type: 'application/json; charset=UTF-8'
    })
    return sendBeacon(url, buffer)
  } else { // 不支持 sendBeacon 时，用 ajax 上报
    return axios.post(url, data)
  }

}

export default class Perfeye {
  constructor({ url }) {
    this.url = url
    this.__PERF_EYE_DATA = []
  }

  start() {
    const performanceInstence = new PerformanceObserver((list, obj) => {
      const entries = list.getEntries()
      for (const entry of entries) {
        const { entryType } = entry
        let item = null
        switch (entryType) {
          case 'paint':
            // 从开始加载到页面首次渲染出内容（如文本、图片等）的时间。
            if (entry.name === 'first-contentful-paint') {
              const FCP_Time = Math.ceil(entry.startTime)
              item = {
                name: 'FCP',
                time: FCP_Time,
                url: window.location.href
              }
            }
            break
          case 'resource':
            // 页面中所有资源（如JavaScript文件、CSS文件、图片、请求等）加载完成所需的时间。
            const { name, initiatorType, duration } = entry
            const time = Math.ceil(duration)
            if (time >= this.recordThrottle) {
              item = {
                name: 'Asset_LT',
                time: Math.ceil(duration),
                url: name,
                assetType: initiatorType
              }
            }
            break
          case 'navigation':
            // 页面加载完成所需的总时间，通常包括DNS解析、TCP连接、首字节时间（Time to First Byte, TTFB）、内容下载等。
            const loadTime = Math.ceil(entry.duration)
            item = {
              name: 'LT',
              time: FCP_Time,
              url: window.location.href
            }
            break
        }
        this.sendAsync(item)
      }
    })

    performanceInstence.observe({
      entryTypes: ['paint', 'resource', 'navigation']
    })

  }

  insertData(item) {
    this.__PERF_EYE_DATA.push(item)
    localStorage.setItem('__PERF_EYE_DATA', JSON.stringify(this.__PERF_EYE_DATA))
    return this.__PERF_EYE_DATA
  }

  clearData() {
    this.__PERF_EYE_DATA = []
    localStorage.removeItem('__PERF_EYE_DATA')
  }

  sendAsync(item) {
    if (!item) return
    const list = this.insertData(item)
    if (list.length >= 10) {
      send(this.url, list).then((res) => {
        this.clearData()
      })
    }
  }

  static sendImmediately(url, data) {
    send(url, data)
  }
}




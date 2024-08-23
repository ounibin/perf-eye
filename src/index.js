import axios from 'axios'

const PERF_EYE_LOCAL_KEY = '__PERF_EYE_DATA'

window.__PERF_EYE_DATA = []

export default class PerfEye {
  constructor({ debug = false, throttle = 10, limit=10, postUrl }) {
    this.debug = debug
    this.throttle = throttle
    this.limit = limit
    this.postUrl = postUrl
  }
  init() {
    const performanceInstence = new PerformanceObserver((list, obj) => {
      const entries = list.getEntries()
      for (const entry of entries) {
        const { entryType } = entry
        let item = null
        switch (entryType) {
          // 从开始加载到页面首次渲染出内容（如文本、图片等）的时间。
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              const FCP_Time = Math.ceil(entry.startTime)
              item = {
                name: 'FCP',
                millisecond: FCP_Time,
                url: window.location.href
              }
            }
            break
          // 页面中所有资源（如JavaScript文件、CSS文件、图片、请求等）加载完成所需的时间。
          case 'resource':
            const { name, initiatorType, duration } = entry
            const time = Math.ceil(duration)
            if (time >= this.throttle) {
              item = {
                name: 'Asset_LT',
                millisecond: Math.ceil(duration),
                url: name,
                assetType: initiatorType
              }
            }
            break

          // 页面加载完成所需的总时间，通常包括DNS解析、TCP连接、首字节时间（Time to First Byte, TTFB）、内容下载等。
          case 'navigation':
            const loadTime = Math.ceil(entry.duration)
            item = {
              name: 'LT',
              millisecond: loadTime,
              url: window.location.href
            }
            break
        }
        this.sendDataAsync(item)
      }
    })

    performanceInstence.observe({
      entryTypes: ['paint', 'resource', 'navigation']
    })
  }

  insertDataToLocal(data) {
    window.__PERF_EYE_DATA.push(data)
    localStorage.setItem(PERF_EYE_LOCAL_KEY, JSON.stringify(window.__PERF_EYE_DATA))
    return window.__PERF_EYE_DATA
  }


  sendDataImmediately(data) {
    const { sendBeacon } = navigator
    if (sendBeacon) {
      // 支持 sendBeacon
      const buffer = new Blob(JSON.stringify(data), {
        type: 'application/json; charset=UTF-8'
      })
      return sendBeacon(this.postUrl, buffer)
    } else {
      // 不支持 sendBeacon 时，用 ajax 上报
      return axios.post(this.postUrl, data)
    }
  }

  sendDataAsync(data) {
    if (!data) return
    const list = this.insertDataToLocal(data)
    if (list.length >= this.limit) {
      this.sendDataImmediately(this.postUrl, list).then((res) => {
        this.clearData()
      })
    }
  }


  // 清除本地数据
  static clearData() {
    window[PERF_EYE_LOCAL_KEY] = []
    localStorage.removeItem(PERF_EYE_LOCAL_KEY)
  }
}
import axios from 'axios'

function sendImmediately(url, data) {
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

export default {
  sendImmediately
}
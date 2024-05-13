// main.js
import { perf, eye } from 'perf-eye'



// request.js
const url = 'https://xxx.com/collec-err'
eye.sendImmediately(url, {
  event: 'e_name',
  time: Date.now(),
})
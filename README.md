```javascript
import { perf, eye } from 'perf-eye'

// 收集性能数据，上报到指定的 url
perf.start(url)

// 浏览器空闲时发送数据，上报到指定的 url
eye.sendImmediately(url, data)
```
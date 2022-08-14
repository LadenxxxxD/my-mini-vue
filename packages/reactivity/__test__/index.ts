import { reactive, effect } from "../src";

const target = { text: 'abc', ok: true }

const proxy = reactive(target)

// effect(() => {
//   console.log('触发effect - text', proxy.text)
// })

effect(() => {
  console.log('触发effect - noExist', proxy.noExist)
})

// effect(() => {
//   console.log('触发effect - ok', proxy.ok ? proxy.text : 'nope')
// })

console.log('====== 改变数据 ======');

// console.log('开始改变 text');
// proxy.text = 'bbc'

console.log('开始改变 text');
proxy.noExist = 'no'

// console.log('开始改变 ok');
// proxy.ok = false

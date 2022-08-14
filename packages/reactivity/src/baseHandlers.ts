import { ReactiveFlags } from './reactive'
import { track, trigger } from './effect'

export const mutableHandler: ProxyHandler<object> = {
  // 取值时会调用get
  get(target, key, receiver) {
    console.log('触发get', target, key);
    // 将target标记为已经经过响应式代理
    if (key === ReactiveFlags.IS_REACTIVE) return true;

    track(target, key)

    return Reflect.get(target, key, receiver)
  },
  // 赋值时会调用set
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)

    trigger(target, key)

    return result;
  }
}

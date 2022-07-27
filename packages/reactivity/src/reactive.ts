import { isObject } from "../../shared/src";

const reactiveMap = new WeakMap();

const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

/**
 * 将一个数据变成响应式对象
 * @param target 原对象
 * @doc Proxy: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 * @doc Reflect: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect
 */
export function reactive<T extends object>(target: T) {
  if (!isObject(target)) return;

  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  // weakmap 缓存
  const exisitingProxy = reactiveMap.get(target);
  if (exisitingProxy) return exisitingProxy;

  const proxy =  new Proxy(target, {
    // 取值时会调用get
    get(target, key, receiver) {
      if (key === ReactiveFlags.IS_REACTIVE) return true;

      return Reflect.get(target, key, receiver)
    },
    // 赋值时会调用set
    set(target, key, value, receiver) {
      return Reflect.set(target, key, value, receiver)
    }
  })

  reactiveMap.set(target, proxy)

  return proxy
}

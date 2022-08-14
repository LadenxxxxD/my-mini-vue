import { isObject } from "../../shared/src";
import { mutableHandler } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

const reactiveMap = new WeakMap();

export interface Target {
  // [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  // [ReactiveFlags.IS_READONLY]?: boolean
  // [ReactiveFlags.IS_SHALLOW]?: boolean
  // [ReactiveFlags.RAW]?: any
}

/**
 * 将一个数据变成响应式对象
 * @param target 原对象
 * @doc Proxy: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 * @doc Reflect: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect
 */
export function reactive<T extends object>(target: T) {
  if (!isObject(target)) return;
  return createReactiveObject(target);
}

function createReactiveObject(target: Target) {
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  // weakmap 缓存
  const exisitingProxy = reactiveMap.get(target);
  if (exisitingProxy) return exisitingProxy;

  const proxy =  new Proxy(target, mutableHandler)

  // 添加进缓存
  reactiveMap.set(target, proxy)

  return proxy
}

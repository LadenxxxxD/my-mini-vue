export let activeEffect: ReactiveEffect | undefined;

type Dep = Set<ReactiveEffect>
type keyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, keyToDepMap>()

function cleanup(effect: ReactiveEffect) {
  const { deps } = effect
  // const effectDeps = new Set(effect.deps)
  // effectDeps.forEach((deps: Dep) => {
  //   deps.delete(effect)
  // })
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)
  }
  effect.deps.length = 0;
  effect.relationKeys = []
  console.log('清理依赖', deps);
}
 
export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn);
  return _effect.run();
}

class ReactiveEffect<T = any> {
  public active = true;
  public parent?: ReactiveEffect;
  public relationKeys: unknown[] = [];
  deps: Dep[] = [];

  toString = () => {
    return `keys: ${this.relationKeys}\nfn: ${this.fn.toString()}`
  }

  constructor(public fn: () => T) {
    // this.fn = fn
  }

  run() {
    if (!this.active) {
      return this.fn()
    }
    try {
      cleanup(this)
      // 处理嵌套effect
      // 将上一个激活的effect传递给parent，第一次是undefined
      this.parent = activeEffect;
      activeEffect = this
      return this.fn()
    } finally {
      // 执行完毕后跳出到父effect
      activeEffect = this.parent
      // this.parent = undefined
    }
  }

  stop() {
    this.active = false
  }
}

export function track(target: object, key: unknown) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  const shouldTrack = !deps.has(activeEffect);
  if (shouldTrack) {
    activeEffect.relationKeys.push(key);
    // 将当前的副作用函数添加进对象-属性名下的副作用函数集合
    // (属性记录的effect，可以通过对象-属性名查询所有的副作用函数，trigger时就是通过这个获取的)
    deps.add(activeEffect)
    // 让effect记住收集到的依赖
    activeEffect.deps.push(deps)

    console.group('依赖收集')
    console.log('key: ', key)
    console.log('effectFn:', activeEffect.fn.toString());
    console.log('%cdeps:', 'color: yellow');
    deps.forEach(dep => console.log(dep.toString()))
    // console.log('deps:', deps);
    // console.log('deps:', activeEffect.deps);
    // console.log('%cactiveEffect.deps:', 'color: yellow', activeEffect.deps);
    // activeEffect.deps.forEach(dep => console.log('deps', dep.toString()))
    console.groupEnd()
  }
}

export function trigger(target: object, key: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set(effects)
  effectsToRun.forEach(fn => fn.run())
}

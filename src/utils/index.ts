export function isString(obj: any): boolean {
  return typeof obj === 'string'
}

/**
 * 格式化数字千分位
 * @param num 
 */
export function formatDot(num: number): string {
  if (num === undefined) {
    return ''
  }

  const NumStr = num.toFixed(0)
  return NumStr.replace(/(\d{1,3})(\d{3})?(\d{3})?(\d{3})?(\d{3})?(\d{3})?(\d{3})?$/,
    ($1, ...args) => args.map((str, index) => {
      if (index) {
        if (str && index !== args.length - 1) {
          return `,${str}`
        }
        return ''
      }
      return str
    }).join(''))
}

/**
 * 格式化小数为百分比
 * @param num 
 */
export function formatPercent(num: number): string {
  if (num === undefined) {
    return ''
  }
  return `${(num * 100).toFixed(1)}%`
}

// 定时器方案, 函数节流
export function throttle(fn: Function, wait: number) {
  let timer: any = null
  return function _fn({ ...args }) {
    const context = this
    // const args = arguments
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args)
        timer = null
      }, wait)
    }
  }
}

// 函数防抖
export function debounce(fn: Function, wait: number) {
  let timeout: any = null
  return function _fn(...args: any) {
    if (timeout !== null) clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), wait)
  }
}


export default {}
/**
 * 获取dom尺寸
 * @param dom dom
 */
export function getOffset(dom: HTMLElement): {
  left: number,
  top: number,
  width: number,
  height: number
} {

  const rect = dom.getBoundingClientRect()

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  }
}

/**
 * 根据元素id获取元素
 * @param domId 元素id
 */
export function queryDom(domId: string): HTMLElement {
  return document.querySelector(domId)
}

/**
 * 根据标签名字创建元素
 * @param tagName 
 */
export function createDom(tagName: string): HTMLElement {
  return document.createElement(tagName)
}

/**
 * dom元素设置属性
 * @param dom dom元素
 * @param attrs 属性对象，键值对
 */
export function setAttr(dom: HTMLElement, attrs: {[propName: string]: string}): HTMLElement {
  Object.keys(attrs).forEach((key: string) => {
    dom.setAttribute(key, attrs[key])
  })
  return dom
}

export function setStyle(dom: HTMLElement, styles: {[propName: string]: any}): HTMLElement {
  Object.keys(styles).forEach((key: any) => {
    dom.style[key] = styles[key]
  })
  return dom
}

export default {}
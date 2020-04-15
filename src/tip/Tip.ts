import { createDom, setStyle } from '../utils/dom'
import pubsub from '../utils/pubsub'

/**
 * 使用html做tip,简单一些
 */
export default class Tip {
  private _contianerDom: HTMLElement

  private _data: any

  private _x: number

  private _y: number

  private eventNo: number

  private tipContainer: HTMLElement

  // 事件监听token集合，需要的时候需要从事件监听器中间移除掉
  private eventTokens: Array<number> = []

  constructor(contianerDom: HTMLElement, eventNo: number) {
    this._contianerDom = contianerDom
    // this._data = data
    // this._x = x
    // this._y = y
    
    this.eventNo = eventNo

    this.createTip()
    const showTipToken = pubsub.subscribe('showTip' + this.eventNo, () => {})
    const hideTipToken = pubsub.subscribe('hideTip'+ this.eventNo, () => {})
    const locationTipToken = pubsub.subscribe('locationTip' + this.eventNo, (e: {data: any, x: number, y: number}) => {
      this.locationTip(e.data, e.x, e.y)
    })

    this.eventTokens.push(showTipToken)
    this.eventTokens.push(hideTipToken)
    this.eventTokens.push(locationTipToken)
  }

  createTip() {
    const tipContainer: HTMLElement =  createDom('div')
    setStyle(tipContainer, {
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, .3)',
      border: '1px solid #ddd',
      borderRadius: '3px',
      display: 'none',
      padding: '10px'
    })

    tipContainer.innerHTML = 'hello'

    this.tipContainer = tipContainer

    this._contianerDom.appendChild(tipContainer)
  }

  showTip() {
    setStyle(this.tipContainer, {
      display: 'block'
    })
  }

  hideTip() {
    setStyle(this.tipContainer, {
      display: 'none'
    })
  }

  /**
   * 
   * @param data 数据
   * @param eX x值
   * @param eY y值
   */
  locationTip(data: any, eX: number, eY: number) {
    setStyle(this.tipContainer, {
      display: 'block',
      left: eX + 'px',
      top: eY + 'px'
    })

    this.tipContainer.innerHTML = data.x + ':' + data.y 
  }

  
}
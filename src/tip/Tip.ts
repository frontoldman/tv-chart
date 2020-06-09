import { createDom, setStyle, setAttr, getOffset } from '../utils/dom'
import Chart from '../index'
import pubsub from '../utils/pubsub'
import { chartSize } from 'src/types/index'

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

  private chart: Chart = null

  constructor(contianerDom: HTMLElement, eventNo: number, chart: Chart) {
    this._contianerDom = contianerDom
    // this._data = data
    // this._x = x
    // this._y = y
    
    this.eventNo = eventNo

    this.chart = chart

    this.createTip()
    // const showTipToken = pubsub.subscribe('showTip' + this.eventNo, () => {})
    const hideTipToken = pubsub.subscribe('mouseout'+ this.eventNo, () => {
      this.hideTip()
    })
    
    const locationTipToken = pubsub.subscribe('mouseover' + this.eventNo, (e: {data: any, x: number, y: number}) => {
      this.locationTip(e.data, e.x, e.y)
    })

    // this.eventTokens.push(showTipToken)
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

    setAttr(tipContainer, {
      class: 'canvas-tip'
    })

    // tipContainer.innerHTML = 'hello'

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
    const size: chartSize = this.chart.getSize()
    this.tipContainer.innerHTML = data.x + ':' + data.y 
    setStyle(this.tipContainer, {
      display: 'block',
    })

    let offset = getOffset(this.tipContainer)

    let left, top
    if (eX + offset.width + 10 >= size.width) {
      left = eX - offset.width - 10
    } else {
      left = eX + 10
    }

    if (eY + offset.height + 10 >= size.height) {
      top = eY - offset.height - 10
    } else {
      top = eY + 10
    }

    setStyle(this.tipContainer, {
      left: left + 'px',
      top: top + 'px'
    })

  }
}
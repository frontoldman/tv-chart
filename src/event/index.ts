import BaseChart from '../chart/BaseChart'
import { getOffset } from '../utils/dom'
import { debounce } from '../utils/index'
import Main from '../index'
import pubsub from '../utils/pubsub'

export default class Event {
  private canvasDom: HTMLCanvasElement

  private chart: BaseChart

  private main: Main

  private eventNo: number

  /**
   * 
   * @param canvasDom canvas dom元素
   * @param chart 各种图表
   * @param main 主入口实例
   * @param eventNo 
   */
  constructor(canvasDom: HTMLCanvasElement, chart: BaseChart, main: Main, eventNo: number) {
    this.canvasDom = canvasDom

    this.chart = chart

    this.main = main

    this.eventNo = eventNo

    this.initEvent()
  }

  /**
   * 初始化所有事件
   */
  initEvent() {
    this._mouseOverEvent = debounce(this._mouseOverEvent.bind(this), 200)
    this.initMouseOverEvent()
    this.initMouseClickEvent()
  }

  /**
   * 绑定鼠标移动事件
   */
  initMouseOverEvent() {
    this.canvasDom.addEventListener('mousemove', this._mouseOverEvent, false)
  }

  /**
   * 绑定鼠标点击事件
   */
  initMouseClickEvent() {
    this.canvasDom.addEventListener('click', this._mouseClickEvent.bind(this), false)
  }

  /**
   * 鼠标移动事件
   * @param e 
   */
  _mouseOverEvent(e: MouseEvent) {
    const rect = this.getDomClient()
    const { pageX, pageY } = e

    let eX = pageX - rect.left
    let eY = pageY - rect.top

    const { chart } = this

    const index: number = chart.getEventIndex(eX, eY)

    if (index >= 0) {
      const dataIndexVal = this.main.getDataByIndex(index)
      pubsub.publish('locationTip' + this.eventNo, {
        data: dataIndexVal,
        x: eX,
        y: eY
      })
    }
  }

  /**
   * 鼠标点击事件
   * @param e 
   */
  _mouseClickEvent(e: MouseEvent) {
    
  }

  /**
   * 移除事件
   */
  removeEvents() {
    this.canvasDom.removeEventListener('mousemove', this._mouseOverEvent)
    this.canvasDom.removeEventListener('click', this._mouseClickEvent)
  }

  getDomClient() {
    return getOffset(this.canvasDom)
  }
}
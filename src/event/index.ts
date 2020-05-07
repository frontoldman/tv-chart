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

  private mouseOutInter: number

  private isIn: boolean = false

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
    this._mouseMoveEvent = debounce(this._mouseMoveEvent.bind(this), 200)
    this.initMouseOverEvent()
    this.initMouseClickEvent()
    this.initMouseOutEvent()
    this.initMouseIn()
  }

  initMouseIn() {
    this.canvasDom.addEventListener('mouseover', this._mouseOverEvent.bind(this), false)
  }

  /**
   * 绑定鼠标移动事件
   */
  initMouseOverEvent() {
    this.canvasDom.addEventListener('mousemove', this._mouseMoveEvent, false)
  }

  /**
   * 绑定鼠标点击事件
   */
  initMouseClickEvent() {
    this.canvasDom.addEventListener('click', this._mouseClickEvent.bind(this), false)
  }

  /**
   * 绑定鼠标移出事件
   */
  initMouseOutEvent() {
    this.canvasDom.addEventListener('mouseout', this._mouseMoveOutEvent.bind(this), false)
  }

  _mouseOverEvent(e: MouseEvent) {
    this.isIn = true
  }

  /**
   * 鼠标移动事件
   * @param e 
   */
  _mouseMoveEvent(e: MouseEvent) {
    const rect = this.getDomClient()
    const { pageX, pageY } = e

    let eX = pageX - rect.left
    let eY = pageY - rect.top

    const { chart } = this

    console.log(this.isIn)

    // 鼠标已经移出去
    if (!this.isIn) {
      return
    }

    // 鼠标move的时候需要清除mouseOutInter
    const index: number = chart.getEventIndex(eX, eY)

    if (index >= 0) {
      clearTimeout(this.mouseOutInter)
      this.isIn = true
      const dataIndexVal = this.main.getDataByIndex(index)
      pubsub.publish('mouseover' + this.eventNo, {
        data: dataIndexVal,
        x: eX,
        y: eY
      })
    } else {
      this.removeOutOfChart()
    }
  }

  /**
   * 鼠标点击事件
   * @param e 
   */
  _mouseClickEvent(e: MouseEvent) {
    
  }

  /**
   * 鼠标移出事件
   * @param e 
   */
  _mouseMoveOutEvent(e: MouseEvent) {
    this.isIn = false
    this.removeOutOfChart()
  }

  /**
   * 移除事件
   */
  removeEvents() {
    this.canvasDom.removeEventListener('mousemove', this._mouseOverEvent)
    this.canvasDom.removeEventListener('click', this._mouseClickEvent)
    this.canvasDom.removeEventListener('mouseout', this._mouseMoveOutEvent)
  }

  getDomClient() {
    return getOffset(this.canvasDom)
  }

  removeOutOfChart() {
    this.mouseOutInter = setTimeout(() => {
      pubsub.publish('mouseout' + this.eventNo)
    }, 200)
  }
}
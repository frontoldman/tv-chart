import BaseChart from '../chart/BaseChart'
import { getOffset } from '../utils/dom'

export default class Event {
  private canvasDom: HTMLCanvasElement

  private chart: BaseChart

  constructor(canvasDom: HTMLCanvasElement, chart: BaseChart) {
    this.canvasDom = canvasDom

    this.chart = chart

    this.initEvent()
  }

  initEvent() {
    this.initMouseOverEvent()
    this.initMouseClickEvent()
  }

  initMouseOverEvent() {
    this.canvasDom.addEventListener('mousemove', this._mouseOverEvent.bind(this), false)
  }

  initMouseClickEvent() {
    this.canvasDom.addEventListener('click', this._mouseClickEvent.bind(this), false)
  }

  _mouseOverEvent(e: MouseEvent) {
    // console.log(e)
  }

  _mouseClickEvent(e: MouseEvent) {
    const rect = this.getDomClient()
    const { pageX, pageY } = e

    let eX = pageX - rect.left
    let eY = pageY - rect.top

    const { chart } = this

    if (chart.checkEventIn(eX, eY)) {
      console.log(11)
    }
  }

  removeEvents() {
    this.canvasDom.removeEventListener('mousemove', this._mouseOverEvent)
    this.canvasDom.removeEventListener('click', this._mouseClickEvent)
  }

  getDomClient() {
    return getOffset(this.canvasDom)
  }
}
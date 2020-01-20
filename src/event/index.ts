export default class Event {
  private canvasDom: HTMLCanvasElement

  constructor(canvasDom: HTMLCanvasElement) {
    this.canvasDom = canvasDom
    this.initEvent()
  }

  initEvent() {
    this.initMouseOverEvent()
    this.initMouseClickEvent()
  }

  initMouseOverEvent() {
    this.canvasDom.addEventListener('mousemove', this._mouseOverEvent, false)
  }

  initMouseClickEvent() {
    this.canvasDom.addEventListener('click', this._mouseClickEvent, false)
  }

  _mouseOverEvent(e: MouseEvent) {
    console.log(e)
  }

  _mouseClickEvent(e: MouseEvent) {
    console.log(e)
  }

  removeEvents() {
    this.canvasDom.removeEventListener('mousemove', this._mouseOverEvent)
    this.canvasDom.removeEventListener('click', this._mouseClickEvent)
  }
}
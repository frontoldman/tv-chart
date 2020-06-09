export default class BaseChart {
  _scalaX: any = null

  _scalaY: any = null

  elvenElements: Array<any> = []

  constructor() {}

  collectElvenElement(path: any): void {
    this.elvenElements.push(path)
  }

  getElvenElement(): Array<any> {
    return this.elvenElements
  }

  getEventIndex(x: number, y: number): number {
    return -1
  }

  setScalaX(scala: any) {
    this._scalaX = scala
  }

  getScalaX() {
    return this._scalaX
  }

  render() {}
}
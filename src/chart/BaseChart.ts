export default class BaseChart {
  elvenElements: Array<any> = []

  constructor() {}

  collectElvenElement(path: any): void {
    this.elvenElements.push(path)
  }

  getElvenElement(): Array<any> {
    return this.elvenElements
  }

  checkEventIn(x: number, y: number): boolean {
    return false
  }
}
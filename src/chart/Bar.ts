import { COLOR_PLATE_8 } from '../options/color'
import BaseChart from './BaseChart'

interface Point {
  x: number,
  y: number
}

interface baseBarOption {
  context2d: CanvasRenderingContext2D;
  points: Array<Point>;
  height: number;
}

export default class Bar extends BaseChart {
  context2d: CanvasRenderingContext2D

  points: Array<Point>

  height: number

  elvenElements: Array<any> = []

  constructor(option: baseBarOption) {
    super()
    this.points = option.points
    this.context2d = option.context2d
    this.height = option.height
  }

  checkEventIn(x: number, y: number): boolean {
    const length = this.elvenElements.length
    let i, rect

    for(i = 0;i< length;i++) {
      rect = this.elvenElements[i]
      if (x >= rect.x && x <= rect.x + rect.width
        && y >= rect.y && y <= rect.y + rect.height
        ) {
          return true
      }
    }

    return false
  }

  collectElvenElement(path: any): void {
    this.elvenElements.push(path)
  }

  getElvenElement(): Array<any> {
    return this.elvenElements
  }

  render() {
    const { points, height, context2d } = this

    const barWidth = 20

    context2d.fillStyle = COLOR_PLATE_8[0]
    context2d.beginPath()
    points.forEach((point: Point) => {
      let x: number = point.x - barWidth / 2
      let y: number = point.y
      context2d.fillRect(x, y, barWidth, height - point.y)
      this.collectElvenElement({
        x: x,
        y: y,
        width: barWidth,
        height: height - point.y,
        type: 'rect'
      })
    })

    context2d.stroke()
  }
}
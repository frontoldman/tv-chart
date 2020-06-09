import { COLOR_PLATE_8 } from '../options/color'
import BaseChart from './BaseChart'
import Linear from '../scala/Linear'
import pubsub from '../utils/pubsub'

interface Point {
  x: number,
  y: number
}

interface baseBarOption {
  context2d: CanvasRenderingContext2D;
  points: Array<Point>;
  height: number;
  eventNo: number;
  animateFn: () => Array<Point>;
}

export default class Bar extends BaseChart {
  context2d: CanvasRenderingContext2D

  points: Array<Point>

  height: number

  elvenElements: Array<any> = []

  animateFn: () => Array<Point>;

  tipLinearEvent: {data: any, x: number, y: number}
  
  eventNo: number

  eventTokens: Array<number> = []

  constructor(option: baseBarOption) {
    super()
    this.points = option.points
    this.context2d = option.context2d
    this.height = option.height
    this.eventNo = option.eventNo
    this.animateFn = option.animateFn

    this.initEvent()
  }

  private initEvent(): void {
    const locationToken = pubsub.subscribe('mouseover' + this.eventNo, (e: {data: any, x: number, y: number}) => {
      this.tipLinearEvent = e
    })

    const hideToken = pubsub.subscribe('mouseout'+ this.eventNo, () => {
      this.tipLinearEvent = null
    })

    this.eventTokens.push(hideToken)
    this.eventTokens.push(locationToken)
  }


  getEventIndex(x: number, y: number): number {
    const { points } = this
    let step = this.getScalaX().getStep()
    let half = step / 2

    let scalaYRange = this.getScalaY().getRange()
    let scalaXRange = this.getScalaX().getRange()

    if (y >= scalaYRange[1] && y <= scalaYRange[0]) {
      for (let i = 0, l = points.length; i < l; i++) {
        if (x >= scalaXRange[0] 
          && x <= scalaXRange[1]
          && Math.abs(points[i].x - x) <= half) {
          return i
        }
      }
    }

    return -1
  }

  collectElvenElement(path: any): void {
    this.elvenElements.push(path)
  }

  getElvenElement(): Array<any> {
    return this.elvenElements
  }

  setScalaX(scala: Linear): void {
    this._scalaX = scala
  }

  getScalaX(): Linear {
    return this._scalaX
  }

  setScalaY(scala: Linear): void {
    this._scalaY = scala
  }

  getScalaY(): Linear {
    return this._scalaY
  }

  renderLightBar() {
    let { height, context2d } = this
    const { tipLinearEvent } = this
    const barWidth = 20
    const x = this.getScalaX().get(tipLinearEvent.data.x) - barWidth / 2
    const y = this.getScalaY().get(tipLinearEvent.data.y)
    context2d.fillStyle = COLOR_PLATE_8[1]
    context2d.beginPath()
    context2d.fillRect(x, y, barWidth, height - y)
    context2d.stroke()
  }

  renderChart() {
    this.points = this.animateFn()

    let { points, height, context2d } = this

    const barWidth = 20

    context2d.fillStyle = COLOR_PLATE_8[0]
    context2d.beginPath()
    points.forEach((point: Point) => {
      let x: number = point.x - barWidth / 2
      let y: number = point.y
      context2d.fillRect(x, y, barWidth, height - y)
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

  render() {
    this.renderChart()
    if (this.tipLinearEvent) {
      this.renderLightBar()
    }
  }
}
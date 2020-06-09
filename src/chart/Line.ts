import { COLOR_PLATE_8 } from '../options/color'
import BaseChart from './BaseChart'
import Linear from '../scala/Linear'
import pubsub from '../utils/pubsub'
import { jQueryEasing } from '../utils/easing'
import { DURATION } from '../options/config'

interface baseLineOption {
  context2d: CanvasRenderingContext2D;
  points: Array<Point>;
  showArea?: boolean;
  areaY: number,
  eventNo: number,
  animateFn: () => Array<Point>;
}

interface Point {
  x: number,
  y: number
}

export default class Line extends BaseChart {
  context2d: CanvasRenderingContext2D

  points: Array<Point>

  showArea: boolean

  areaY: number

  eventNo: number

  tipLinearEvent: {data: any, x: number, y: number}

  eventTokens: Array<number> = []

  startTime: number

  animateFn: () => Array<Point>

  constructor(option: baseLineOption) {
    super()
    this.context2d = option.context2d
    this.points = option.points
    this.showArea = option.showArea
    this.areaY = option.areaY
    this.eventNo = option.eventNo
    this.animateFn = option.animateFn

    this.startTime = Date.now()

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

  createTipLineAndCircle(e: {data: any, x: number, y: number}) {
    const { data, x, y } = e
    const lineX = this.getScalaX().get(data.x)
    const lineY = this.getScalaY().get(data.y)

    this.renderTipLineAndPoint(lineX, lineY)
  }

  /**
   * 渲染tip对应的点和线
   * @param lineX 横坐标
   * @param lineY 纵坐标
   */
  renderTipLineAndPoint(lineX: number, lineY: number) {
    const { context2d } = this
    const color: string = COLOR_PLATE_8[1]
    context2d.strokeStyle = color

    const scalaY = this.getScalaY()
    const range = scalaY.getRange()
    context2d.beginPath()
    this.context2d.globalAlpha = 1
    context2d.moveTo(lineX, range[0])
    context2d.lineTo(lineX, range[1])
    context2d.stroke()

    context2d.beginPath()
    context2d.arc(lineX, lineY, 5, 0, Math.PI * 2)
    context2d.fillStyle = color;
    context2d.fill()
  }

  private renderChart(): void {
    this.points = this.animateFn()

    let { points, showArea, areaY } = this

    const n: number = points.length

    const color: string = COLOR_PLATE_8[0]

    this.context2d.strokeStyle = color
    this.context2d.beginPath()

    this.context2d.moveTo(points[0].x, points[0].y)
    if (n === 1) {
      this.context2d.lineTo(points[0].x, points[0].y)
    } else if (n === 2) {
      this.context2d.lineTo(points[1].x, points[1].y)
    } else {
      // https://math.stackexchange.com/questions/45218/implementation-of-monotone-cubic-interpolation

      const ds: number[] = [] // 两点之间的距离y / x 比例
      const dxs: number[] = [] // 两点之间的x距离
      const dys: number[] = [] // 两点之间的y距离
      const ms: number[] = []

      let i

      for (i = 0; i < n - 1; i++) {
        dxs[i] = points[i + 1].x - points[i].x
        dys[i] = points[i + 1].y - points[i].y
        ds[i] = dys[i] / dxs[i]
      }

      ms[0] = ds[0]
      ms[n - 1] = ds[n - 2];


      for (i = 1; i < n - 1; i++) {
        if (ds[i] === 0 || ds[i - 1] === 0 || (ds[i - 1] > 0) !== (ds[i] > 0)) {
          ms[i] = 0;
        } else {
          ms[i] = 3 * (dxs[i - 1] + dxs[i]) / (
            (2 * dxs[i] + dxs[i - 1]) / ds[i - 1] +
            (dxs[i] + 2 * dxs[i - 1]) / ds[i]);

          if (!isFinite(ms[i])) {
            ms[i] = 0;
          }
        }
      }

      for (i = 0; i < n - 1; i++) {
        this.context2d.bezierCurveTo(
          // First control point
          points[i].x + dxs[i] / 3,
          points[i].y + ms[i] * dxs[i] / 3,
          // Second control point
          points[i + 1].x - dxs[i] / 3,
          points[i + 1].y - ms[i + 1] * dxs[i] / 3,
          // End point
          points[i + 1].x,
          points[i + 1].y,
        );
      }
    }

    if (showArea && n > 1) {
      const firstPoint = points[0]
      const lastPoint = points[n - 1]
      this.context2d.fillStyle = color
      this.context2d.globalAlpha = 0.2
      this.context2d.lineTo(lastPoint.x, areaY)
      this.context2d.lineTo(firstPoint.x, areaY)
      this.context2d.closePath()
      this.context2d.fill()
    }

    this.context2d.stroke()
  }

  render(): void {
    this.renderChart()
    if (this.tipLinearEvent) {
      this.createTipLineAndCircle(this.tipLinearEvent)
    }
  }
}
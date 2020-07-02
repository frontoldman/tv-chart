import { COLOR_PLATE_8 } from '../options/color'
import BaseChart from './BaseChart'
import Linear from '../scala/Linear'
import pubsub from '../utils/pubsub'

interface Point {
  x: number,
  y: number,
  z?: number
}

interface baseScatterOption {
  context2d: CanvasRenderingContext2D;
  points: Array<Point>;
  height: number;
  eventNo: number;
  type: string;
  animateFn: () => Array<Point>;
}

export default class Scatter extends BaseChart {
  context2d: CanvasRenderingContext2D

  points: Array<Point>

  height: number

  elvenElements: Array<any> = []

  animateFn: () => Array<Point>;

  tipLinearEvent: {data: any, x: number, y: number}
  
  eventNo: number

  type: string

  eventTokens: Array<number> = []

  constructor(option: baseScatterOption) {
    super()
    console.log(option.points)
    this.points = option.points
    console.log(this.points)
    this.context2d = option.context2d
    this.height = option.height
    this.eventNo = option.eventNo
    this.animateFn = option.animateFn
    this.type = option.type

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

    for (let i = 0, l = points.length; i < l; i++) {
      const point: Point = points[i]
      const distanceWithCenter = Math.sqrt(Math.pow((x - point.x), 2) + Math.pow((y - point.y), 2))
      if (distanceWithCenter <= 10) {
        return i
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

  renderLightScatter() {
    let { context2d } = this
    const { tipLinearEvent } = this
    const x = this.getScalaX().get(tipLinearEvent.data.x)
    const y = this.getScalaY().get(tipLinearEvent.data.y)
    context2d.beginPath()
    context2d.arc(x, y, 20, 0, Math.PI * 2)
    context2d.stroke()
    context2d.fill()
  }

  renderChart() {
    this.points = this.animateFn()

    let { points, context2d } = this

    context2d.fillStyle = COLOR_PLATE_8[0]
    context2d.strokeStyle = COLOR_PLATE_8[1]

    // console.log(points)

    points.forEach((point: Point) => {
      let x: number = point.x
      let y: number = point.y
      let radius: number = 10

      // console.log(this.type)

      if (this.type === 'bubble') {
        // console.log(point)
        radius = point.z
      }

      // console.log(radius)
      
      context2d.beginPath()
      context2d.arc(x, y, radius, 0, Math.PI * 2)
      context2d.stroke()
      this.context2d.globalAlpha = 0.2
      context2d.fill()
      this.context2d.globalAlpha = 1
    })
    
  }

  render() {
    this.renderChart()
    if (this.tipLinearEvent) {
      this.renderLightScatter()
    }
  }
}
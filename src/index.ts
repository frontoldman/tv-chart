import { chartOption, chartSize, BaseLinear } from './types/index'
import { getOffset, queryDom, createDom, setStyle, setAttr } from './utils/dom'
import { isString } from './utils/index'
import { max, min } from './utils/data'
import Linear from './scala/Linear'
import BaseChart from './chart/BaseChart'
import Line from './chart/Line'
import Bar from './chart/Bar'
import Pie from './chart/Pie'
import AxisX from './axis/axisX'
import AxisY from './axis/axisY'
import Event from './event/index'

interface Point {
  x: number,
  y: number
}

interface Angle {
  start: number,
  end: number,
}

class Chart {
  private option: chartOption

  private size: chartSize

  private contianerDom: HTMLElement

  private canvasDom: HTMLCanvasElement

  private context2d: CanvasRenderingContext2D

  private _domainY: Array<number> = []

  private _domainX: Array<number> = []

  private linearX: Linear = null

  private linearY: Linear = null

  private maxXTick: number = 6

  private maxYTick: number = 6

  private chart: BaseChart

  constructor(option: chartOption) {
    this.initOption(option)
    this.initContainer()
    this.createCanvas()

    const { type } = option
    if (type === 'line') {
      this.createLinear()
      this.chart = this.renderLine()
      this.renderAxisX()
      this.renderAxisY()
    } else if (type === 'bar') {
      this.createLinear()
      this.chart = this.renderBar()
      this.renderAxisX()
      this.renderAxisY()
    } else if (type === 'pie') {
      this.createPieLinear()
      this.chart = this.renderPie()
    } 

    new Event(this.canvasDom, this.chart)

  }

  // 初始化options
  private initOption(option: chartOption) {
    this.option = option
    return this.option
  }

  // 获取容器尺寸
  private initContainer() {
    const { contianer } = this.option
    let contianerDom: HTMLElement
    if (isString(contianer)) {
      contianerDom = queryDom(<string>contianer)
    } else {
      contianerDom = <HTMLElement>contianer
    }

    if (!contianerDom) {
      throw new Error('请设置正确的contianer')
      return
    }

    this.size = getOffset(contianerDom)
    this.contianerDom = contianerDom

    setStyle(contianerDom, {
      position: 'relative'
    })
  }

  /**
   * 创建canvas
   */
  createCanvas() {
    const { size: { width, height } } = this
    const canvasDom: HTMLCanvasElement = <HTMLCanvasElement>createDom('canvas')
    setStyle(canvasDom, {
      position: 'absolute',
      left: 0,
      right: 0,
      width: width + 'px',
      height: height + 'px',
    })

    setAttr(canvasDom, {
      width: width + 'px',
      height: height + 'px'
    })

    this.canvasDom = canvasDom
    this.contianerDom.appendChild(canvasDom)

    const context2d: CanvasRenderingContext2D = canvasDom.getContext('2d')

    this.context2d = context2d
  }

  /**
   * 创建比例尺
   */
  createLinear() {
    const { data, padding, axis } = this.option
    const { height, width } = this.size

    const maxY: number = max(data, item => item.y)

    const linearY = new Linear()
    linearY.domain([0, maxY]).range([height - padding[2], padding[0]])

    this.linearY = linearY

    let paddingLeft = 0
    let paddingRight = 0
    // 如果坐标轴设置了padding, 图标整体向内
    if (axis && axis.x && axis.x.padding && axis.x.padding.left && axis.x.padding.right) {
      paddingLeft = axis.x.padding.left
      paddingRight = axis.x.padding.right
    }

    const linearX = new Linear()
    linearX.domain([0, data.length - 1]).range([padding[3] + paddingLeft, width - padding[1] - paddingRight])

    this.linearX = linearX

    this._domainY = [0, maxY]
    this._domainX = [0, data.length - 1]
  }

  createPieLinear() {
    const { data } = this.option

    const maxY = data.reduce((total, item1: { y: number }) => {
      return item1.y + total
    }, 0)

    const linearY = new Linear()
    // linearY.domain([0, maxY]).range([-Math.PI * 0.5, Math.PI * 1.5])
    linearY.domain([0, maxY]).range([-0.5 * Math.PI, 1.5 * Math.PI])

    this.linearY = linearY

    this._domainY = [0, maxY]
  }

  renderLine(): Line {
    const { data, showArea } = this.option

    const points: Array<Point> = data.map(({ y }: { y: number }, index: number) => {
      return {
        x: this.linearX.get(index),
        y: this.linearY.get(y)
      }
    })

    const line: Line = new Line({
      context2d: this.context2d,
      points: points,
      showArea: showArea,
      areaY: this.linearY.get(0)
    })

    line.render()

    return line
  }

  renderBar():Bar {
    const { data, padding } = this.option
    const { height } = this.size

    const points: Array<Point> = data.map(({ y }: { y: number }, index: number) => {
      return {
        x: this.linearX.get(index),
        y: this.linearY.get(y)
      }
    })

    const bar = new Bar({
      context2d: this.context2d,
      points: points,
      height: height - padding[2]
    })

    bar.render()

    return bar
  }

  renderPie():Pie {
    const { context2d } = this
    const { padding, data } = this.option
    const { width, height } = this.size
    const rectW = width - padding[1] - padding[3]
    const rectH = height - padding[0] - padding[2]
    const radius = Math.min(rectW, rectH) / 2

    let _radius

    if (typeof this.option.radius === 'object') {
      const { min, max } = this.option.radius
    const maxRadius = max * radius
    const minRadius = min * radius
      _radius = {minRadius, maxRadius}
    } else {
      _radius = radius
    }
    

    const center = {
      x: rectW / 2 + padding[3],
      y: rectH / 2 + padding[0]
    }


    const sumEveryX: Array<number[]> = []
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        sumEveryX.push([0, data[i].y])
      } else {
        sumEveryX.push([sumEveryX[i - 1][1], data[i].y + sumEveryX[i - 1][1]])
      }
    }

    const arcs: Array<Angle> = sumEveryX.map((item: number[]) => {
      return {
        start: this.linearY.get(item[0]),
        end: this.linearY.get(item[1])
      }
    })

    
   
    const pie: Pie = new Pie({
      context2d: this.context2d,
      arcs: arcs,
      radius: _radius,
      center: center
    })

    pie.render()

    return pie

  }

  renderAxisX(): void {
    const { data, padding } = this.option
    const { width, height } = this.size
    const { context2d } = this

    const axisX = new AxisX({
      context2d,
      maxTick: this.maxXTick,
      start: [padding[3], height - padding[2]],
      end: [width - padding[1], height - padding[2]],
      size: data.length,
      data: data.map(item => item.x)
    })

    axisX.useLinear(this.linearX).render()
  }

  renderAxisY(): void {
    const { data, padding } = this.option
    const { width, height } = this.size
    const { context2d } = this

    const axisY = new AxisY({
      context2d,
      maxTick: this.maxYTick,
      start: [padding[3], height - padding[2]],
      end: [padding[3], padding[0]],
      size: data.length,
      data: data.map(item => item.y)
    })

    axisY.useLinear(this.linearY).useDomain(this._domainY).render()
  }

}

const data = []
for (var ii = 0; ii < 10; ii++) {
  data[ii] = {
    x: ii,
    y: Math.random() * 90
  }
}

// console.log(data)

new Chart({
  contianer: '#line',
  // data: [{ x: 1, y: 20 }, { x: 2, y: 30 }, { x: 3, y: 50 }, { x: 4, y: 35 }, { x: 5, y: 35 }],
  padding: [20, 20, 50, 50],
  data,
  type: 'line',
  showArea: true
})


new Chart({
  contianer: '#bar',
  // data: [{ x: 1, y: 20 }, { x: 2, y: 30 }, { x: 3, y: 50 }, { x: 4, y: 35 }, { x: 5, y: 35 }],
  padding: [20, 20, 50, 50],
  data,
  type: 'bar',
  axis: {
    x: {
      padding: {
        left: 50,
        right: 50
      }
    }
  }
})

// new Chart({
//   contianer: '#linearea',
//   // data: [{ x: 1, y: 20 }, { x: 2, y: 30 }, { x: 3, y: 50 }, { x: 4, y: 35 }, { x: 5, y: 35 }],
//   padding: [20, 20, 50, 50],
//   data,
//   type: 'line',
//   showArea: true
// })

new Chart({
  contianer: '#pie',
  // data: [{ x: 1, y: 20 }, { x: 2, y: 30 }, { x: 3, y: 50 }, { x: 4, y: 35 }, { x: 5, y: 35 }],
  padding: [20, 20, 50, 50],
  data,
  type: 'pie',
})

new Chart({
  contianer: '#huan',
  // data: [{ x: 1, y: 20 }, { x: 2, y: 30 }, { x: 3, y: 50 }, { x: 4, y: 35 }, { x: 5, y: 35 }],
  padding: [20, 20, 50, 50],
  data,
  type: 'pie',
  radius: {
    min: 0.6,
    max: 0.8
  }
})
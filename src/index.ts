import { BaseChart, chartOption, chartSize } from './types/index'
import { getOffset, queryDom, createDom, setStyle } from './utils/dom'
import { isString } from './utils/index'

class Chart {
  private option: chartOption

  private size: chartSize

  private contianerDom: HTMLElement

  private canvasDom: HTMLCanvasElement

  private canvas2d: CanvasRenderingContext2D

  constructor(option: chartOption) {
    this.initOption(option)
    this.initContainer()
    this.createCanvas()
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
    const { size } = this
    const canvasDom: HTMLCanvasElement = <HTMLCanvasElement>createDom('canvas')
    setStyle(canvasDom, {
      position: 'absolute',
      left: 0,
      right: 0,
      width: size.width + 'px',
      height: size.height + 'px',
    })

    this.canvasDom = canvasDom
    this.contianerDom.appendChild(canvasDom)

    const canvas2d: CanvasRenderingContext2D = canvasDom.getContext('2d')

    this.canvas2d = canvas2d
  }


}

new Chart({
  contianer: '#line'
})

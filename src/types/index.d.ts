export interface chartOption {
  contianer: string | HTMLElement;
  data: Array<any>;
  padding?: [number, number, number, number],
  type: 'line' | 'bar' | 'pie' | 'huan' | 'scatter' | 'bubble',
  showArea?: boolean,
  axis?: {
    x?: {
      padding?: {
        left?: number,
        right?: number,
      }
    }
  },
  radius?: {
    min: number,
    max: number
  }
}

export interface chartSize {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface  BaseChart {
  option: chartOption

  constructor(option: chartOption): void

  initOption(option: chartOption) :chartOption

  initContainer() :void
}

export interface domainValAry {
  [index: number]: number
}

export interface rangeValAry {
  [index: number]: number
}


export interface BaseLinear {
  domain(domainVal: domainValAry) : BaseLinear

  range(rangeVal: rangeValAry): BaseLinear

}

export interface axisOption {
  context2d: CanvasRenderingContext2D;
  maxTick: number;
  start: [number, number];
  end: [number, number];
  size: number;
  data: Array<any>;
}


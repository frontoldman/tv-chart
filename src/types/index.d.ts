export interface chartOption {
  contianer: string | HTMLElement
}

export interface chartSize {
  left: number;
  top: number;
  width: number;
  height: number;
}

export declare class BaseChart {
  private option: chartOption

  constructor(option: chartOption)

  private initOption(option: chartOption) :chartOption

  private initContainer() :void
}



export interface Connection {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
}

export interface Node {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  name?: string
  icon?: string;
  data?: any;
}

export interface ShapeConfig {
    type: string;
    width?: number;
    height?: number;
    radius?: number;
    color?: string;
    strokeWidth?: number;
    strokeColor?: string;
    textColor?: string;
    boxShadow?: string;
  }

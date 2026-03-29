export interface Shape {
    id: string;
    position?: {
        x: number;
        y: number;
    };
    radius?: number;
    width?: number;
    height?: number;
    borderRadius?: {
        leftTop?: number;
        leftBottom?: number;
        rightTop?: number;
        rightBottom?: number;
    };
    color: string;
    stroke: {
        width: number;
        color: string;
        strokeType: string;
        strokeDasharray: number[];
    };
    text?: string;
    textColor?: string;
    transparency: number;
    icon?: string;
    boxShadow?: string;
}

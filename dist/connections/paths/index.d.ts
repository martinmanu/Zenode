export interface Point {
    x: number;
    y: number;
}
export interface PathParams {
    source: Point;
    target: Point;
    sourcePortId?: string;
    targetPortId?: string;
}
export type PathCalculator = (params: PathParams) => string;
export declare const PathCalculators: Record<string, PathCalculator>;

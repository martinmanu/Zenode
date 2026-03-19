import { Config } from "../model/configurationModel.js";
import { defaultConfig } from "../config/defaultConfig.js";

export function mergeConfig(userConfig: Partial<Config>): Config {
  return {
    canvas: {
      width: userConfig.canvas?.width ?? defaultConfig.canvas.width,
      height: userConfig.canvas?.height ?? defaultConfig.canvas.height,
      backgroundColor: userConfig.canvas?.backgroundColor ?? defaultConfig.canvas.backgroundColor,
      canvasClasses: userConfig.canvas?.canvasClasses ?? defaultConfig.canvas.canvasClasses,
      locked: userConfig.canvas?.locked ?? defaultConfig.canvas.locked,
      grid: {
        gridEnabled: userConfig.canvas?.grid?.gridEnabled ?? defaultConfig.canvas.grid.gridEnabled,
        gridType: userConfig.canvas?.grid?.gridType ?? defaultConfig.canvas.grid.gridType,
        gridSize: userConfig.canvas?.grid?.gridSize ?? defaultConfig.canvas.grid.gridSize,
        gridColor: userConfig.canvas?.grid?.gridColor ?? defaultConfig.canvas.grid.gridColor,
        gridDimension: userConfig.canvas?.grid?.gridDimension ?? defaultConfig.canvas.grid.gridDimension,
        gridTransparency: userConfig.canvas?.grid?.gridTransparency ?? defaultConfig.canvas.grid.gridTransparency,
        gridShape: userConfig.canvas?.grid?.gridShape ?? defaultConfig.canvas.grid.gridShape,
        crossLength: userConfig.canvas?.grid?.crossLength ?? defaultConfig.canvas.grid.crossLength,
        sheetDimension: userConfig.canvas?.grid?.sheetDimension ?? defaultConfig.canvas.grid.sheetDimension
      }
    },
    canvasProperties: userConfig.canvasProperties ?? defaultConfig.canvasProperties,
    shapes: userConfig.shapes ?? defaultConfig.shapes,
    connections: userConfig.connections ?? defaultConfig.connections,
    globalProperties: userConfig.globalProperties ?? defaultConfig.globalProperties,
    dragOptions: userConfig.dragOptions ?? defaultConfig.dragOptions
  };
}
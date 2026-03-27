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
    canvasProperties: {
      zoomEnabled: userConfig.canvasProperties?.zoomEnabled ?? defaultConfig.canvasProperties.zoomEnabled,
      zoomExtent: userConfig.canvasProperties?.zoomExtent ?? defaultConfig.canvasProperties.zoomExtent,
      zoomOnDoubleClick: userConfig.canvasProperties?.zoomOnDoubleClick ?? defaultConfig.canvasProperties.zoomOnDoubleClick,
      zoomScale: userConfig.canvasProperties?.zoomScale ?? defaultConfig.canvasProperties.zoomScale,
      zoomOnScroll: userConfig.canvasProperties?.zoomOnScroll ?? defaultConfig.canvasProperties.zoomOnScroll,
      zoomDuration: userConfig.canvasProperties?.zoomDuration ?? defaultConfig.canvasProperties.zoomDuration,
      panEnabled: userConfig.canvasProperties?.panEnabled ?? defaultConfig.canvasProperties.panEnabled,
      snapToGrid: userConfig.canvasProperties?.snapToGrid ?? defaultConfig.canvasProperties.snapToGrid,
      alignmentLines: {
        enabled: userConfig.canvasProperties?.alignmentLines?.enabled ?? defaultConfig.canvasProperties.alignmentLines.enabled,
        color: userConfig.canvasProperties?.alignmentLines?.color ?? defaultConfig.canvasProperties.alignmentLines.color,
        width: userConfig.canvasProperties?.alignmentLines?.width ?? defaultConfig.canvasProperties.alignmentLines.width,
        dashed: userConfig.canvasProperties?.alignmentLines?.dashed ?? defaultConfig.canvasProperties.alignmentLines.dashed,
        dashArray: userConfig.canvasProperties?.alignmentLines?.dashArray ?? defaultConfig.canvasProperties.alignmentLines.dashArray,
        guideLineMode: userConfig.canvasProperties?.alignmentLines?.guideLineMode ?? defaultConfig.canvasProperties.alignmentLines.guideLineMode
      },
      lassoStyle: {
        enabled:
          userConfig.canvasProperties?.lassoStyle?.enabled
          ?? defaultConfig.canvasProperties.lassoStyle.enabled,
        strokeColor:
          userConfig.canvasProperties?.lassoStyle?.strokeColor
          ?? defaultConfig.canvasProperties.lassoStyle.strokeColor,
        strokeWidth:
          userConfig.canvasProperties?.lassoStyle?.strokeWidth
          ?? defaultConfig.canvasProperties.lassoStyle.strokeWidth,
        dashed:
          userConfig.canvasProperties?.lassoStyle?.dashed
          ?? defaultConfig.canvasProperties.lassoStyle.dashed,
        dashArray:
          userConfig.canvasProperties?.lassoStyle?.dashArray
          ?? defaultConfig.canvasProperties.lassoStyle.dashArray,
        fillColor:
          userConfig.canvasProperties?.lassoStyle?.fillColor
          ?? defaultConfig.canvasProperties.lassoStyle.fillColor,
        fillOpacity:
          userConfig.canvasProperties?.lassoStyle?.fillOpacity
          ?? defaultConfig.canvasProperties.lassoStyle.fillOpacity,
        cursor:
          userConfig.canvasProperties?.lassoStyle?.cursor
          ?? defaultConfig.canvasProperties.lassoStyle.cursor,
        activeCursor:
          userConfig.canvasProperties?.lassoStyle?.activeCursor
          ?? defaultConfig.canvasProperties.lassoStyle.activeCursor,
      },
      keyboardShortcuts: {
        enabled:
          userConfig.canvasProperties?.keyboardShortcuts?.enabled
          ?? defaultConfig.canvasProperties.keyboardShortcuts.enabled,
        deleteSelection:
          userConfig.canvasProperties?.keyboardShortcuts?.deleteSelection
          ?? defaultConfig.canvasProperties.keyboardShortcuts.deleteSelection,
        clearSelection:
          userConfig.canvasProperties?.keyboardShortcuts?.clearSelection
          ?? defaultConfig.canvasProperties.keyboardShortcuts.clearSelection,
        customBindings:
          userConfig.canvasProperties?.keyboardShortcuts?.customBindings
          ?? defaultConfig.canvasProperties.keyboardShortcuts.customBindings,
        callbacks:
          userConfig.canvasProperties?.keyboardShortcuts?.callbacks
          ?? defaultConfig.canvasProperties.keyboardShortcuts.callbacks,
      }
    },
    shapes: userConfig.shapes ?? defaultConfig.shapes,
    connections: userConfig.connections ?? defaultConfig.connections,
    globalProperties: userConfig.globalProperties ?? defaultConfig.globalProperties,
    dragOptions: userConfig.dragOptions ?? defaultConfig.dragOptions
  };
}
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
        alignmentThreshold:
          userConfig.canvasProperties?.alignmentLines?.alignmentThreshold
          ?? defaultConfig.canvasProperties.alignmentLines.alignmentThreshold,
        // Keep these as partial overrides.
        // If user passes {}, drag logic falls back to master alignment style.
        edgeGuides:
          userConfig.canvasProperties?.alignmentLines?.edgeGuides
          ?? defaultConfig.canvasProperties.alignmentLines.edgeGuides,
        centerGuides:
          userConfig.canvasProperties?.alignmentLines?.centerGuides
          ?? defaultConfig.canvasProperties.alignmentLines.centerGuides,
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
      },
      ports: userConfig.canvasProperties?.ports ?? defaultConfig.canvasProperties.ports,
      ghostConnection: {
        enabled: userConfig.canvasProperties?.ghostConnection?.enabled ?? defaultConfig.canvasProperties.ghostConnection.enabled,
        color: userConfig.canvasProperties?.ghostConnection?.color ?? defaultConfig.canvasProperties.ghostConnection.color,
        strokeWidth: userConfig.canvasProperties?.ghostConnection?.strokeWidth ?? defaultConfig.canvasProperties.ghostConnection.strokeWidth,
        dashed: userConfig.canvasProperties?.ghostConnection?.dashed ?? defaultConfig.canvasProperties.ghostConnection.dashed,
        dashArray: userConfig.canvasProperties?.ghostConnection?.dashArray ?? defaultConfig.canvasProperties.ghostConnection.dashArray,
        opacity: userConfig.canvasProperties?.ghostConnection?.opacity ?? defaultConfig.canvasProperties.ghostConnection.opacity,
      },
      ghostPreview: {
        enabled: userConfig.canvasProperties?.ghostPreview?.enabled ?? defaultConfig.canvasProperties.ghostPreview?.enabled ?? true,
        strokeColor: userConfig.canvasProperties?.ghostPreview?.strokeColor ?? defaultConfig.canvasProperties.ghostPreview?.strokeColor ?? 'var(--zenode-accent, #3b82f6)',
        strokeWidth: userConfig.canvasProperties?.ghostPreview?.strokeWidth ?? defaultConfig.canvasProperties.ghostPreview?.strokeWidth ?? 1.5,
        strokeDashArray: userConfig.canvasProperties?.ghostPreview?.strokeDashArray ?? defaultConfig.canvasProperties.ghostPreview?.strokeDashArray ?? [4, 4],
        fillColor: userConfig.canvasProperties?.ghostPreview?.fillColor ?? defaultConfig.canvasProperties.ghostPreview?.fillColor ?? 'transparent',
        opacity: userConfig.canvasProperties?.ghostPreview?.opacity ?? defaultConfig.canvasProperties.ghostPreview?.opacity ?? 0.4,
        filter: userConfig.canvasProperties?.ghostPreview?.filter ?? defaultConfig.canvasProperties.ghostPreview?.filter ?? 'blur(1px)',
      },
      connectionGhostPreview: {
        enabled: userConfig.canvasProperties?.connectionGhostPreview?.enabled ?? defaultConfig.canvasProperties.connectionGhostPreview?.enabled ?? true,
        strokeColor: userConfig.canvasProperties?.connectionGhostPreview?.strokeColor ?? defaultConfig.canvasProperties.connectionGhostPreview?.strokeColor ?? 'var(--zenode-accent, #3b82f6)',
        strokeWidth: userConfig.canvasProperties?.connectionGhostPreview?.strokeWidth ?? defaultConfig.canvasProperties.connectionGhostPreview?.strokeWidth ?? 1.5,
        strokeDashArray: userConfig.canvasProperties?.connectionGhostPreview?.strokeDashArray ?? defaultConfig.canvasProperties.connectionGhostPreview?.strokeDashArray ?? [4, 4],
        fillColor: userConfig.canvasProperties?.connectionGhostPreview?.fillColor ?? defaultConfig.canvasProperties.connectionGhostPreview?.fillColor ?? 'transparent',
        opacity: userConfig.canvasProperties?.connectionGhostPreview?.opacity ?? defaultConfig.canvasProperties.connectionGhostPreview?.opacity ?? 0.4,
        filter: userConfig.canvasProperties?.connectionGhostPreview?.filter ?? defaultConfig.canvasProperties.connectionGhostPreview?.filter ?? 'blur(1px)',
      },
      allowMultipleConnections: userConfig.canvasProperties?.allowMultipleConnections ?? defaultConfig.canvasProperties.allowMultipleConnections,
      visualEffects: {
        highlight: {
          color: userConfig.canvasProperties?.visualEffects?.highlight?.color ?? defaultConfig.canvasProperties.visualEffects?.highlight?.color ?? '#ffdd00',
          duration: userConfig.canvasProperties?.visualEffects?.highlight?.duration ?? defaultConfig.canvasProperties.visualEffects?.highlight?.duration ?? 3000,
          scale: userConfig.canvasProperties?.visualEffects?.highlight?.scale ?? defaultConfig.canvasProperties.visualEffects?.highlight?.scale ?? 1.2,
          intensity: userConfig.canvasProperties?.visualEffects?.highlight?.intensity ?? defaultConfig.canvasProperties.visualEffects?.highlight?.intensity ?? 2.5
        },
        focus: {
          padding: userConfig.canvasProperties?.visualEffects?.focus?.padding ?? defaultConfig.canvasProperties.visualEffects?.focus?.padding ?? 60,
          duration: userConfig.canvasProperties?.visualEffects?.focus?.duration ?? defaultConfig.canvasProperties.visualEffects?.focus?.duration ?? 1000,
          defaultZoom: userConfig.canvasProperties?.visualEffects?.focus?.defaultZoom ?? defaultConfig.canvasProperties.visualEffects?.focus?.defaultZoom ?? 1.2
        }
      },
      contextPad: {
        enabled: userConfig.canvasProperties?.contextPad?.enabled ?? defaultConfig.canvasProperties.contextPad?.enabled ?? true,
        trigger: userConfig.canvasProperties?.contextPad?.trigger ?? defaultConfig.canvasProperties.contextPad?.trigger ?? "select",
        position: userConfig.canvasProperties?.contextPad?.position ?? defaultConfig.canvasProperties.contextPad?.position ?? "top-right",
        offset: {
          x: userConfig.canvasProperties?.contextPad?.offset?.x ?? defaultConfig.canvasProperties.contextPad?.offset?.x ?? 10,
          y: userConfig.canvasProperties?.contextPad?.offset?.y ?? defaultConfig.canvasProperties.contextPad?.offset?.y ?? -10,
        },
        showDefaults: userConfig.canvasProperties?.contextPad?.showDefaults ?? defaultConfig.canvasProperties.contextPad?.showDefaults ?? true,
        suppressDefaults: userConfig.canvasProperties?.contextPad?.suppressDefaults ?? defaultConfig.canvasProperties.contextPad?.suppressDefaults ?? [],
        layout: userConfig.canvasProperties?.contextPad?.layout ?? defaultConfig.canvasProperties.contextPad?.layout ?? "horizontal",
        gridColumns: userConfig.canvasProperties?.contextPad?.gridColumns ?? defaultConfig.canvasProperties.contextPad?.gridColumns ?? 3,
        style: {
          backgroundColor: userConfig.canvasProperties?.contextPad?.style?.backgroundColor ?? defaultConfig.canvasProperties.contextPad?.style?.backgroundColor,
          borderColor: userConfig.canvasProperties?.contextPad?.style?.borderColor ?? defaultConfig.canvasProperties.contextPad?.style?.borderColor,
          borderWidth: userConfig.canvasProperties?.contextPad?.style?.borderWidth ?? defaultConfig.canvasProperties.contextPad?.style?.borderWidth,
          borderRadius: userConfig.canvasProperties?.contextPad?.style?.borderRadius ?? defaultConfig.canvasProperties.contextPad?.style?.borderRadius,
          boxShadow: userConfig.canvasProperties?.contextPad?.style?.boxShadow ?? defaultConfig.canvasProperties.contextPad?.style?.boxShadow,
          backdropBlur: userConfig.canvasProperties?.contextPad?.style?.backdropBlur ?? defaultConfig.canvasProperties.contextPad?.style?.backdropBlur,
          padding: userConfig.canvasProperties?.contextPad?.style?.padding ?? defaultConfig.canvasProperties.contextPad?.style?.padding,
          buttonSize: userConfig.canvasProperties?.contextPad?.style?.buttonSize ?? defaultConfig.canvasProperties.contextPad?.style?.buttonSize,
          buttonWidth: userConfig.canvasProperties?.contextPad?.style?.buttonWidth ?? defaultConfig.canvasProperties.contextPad?.style?.buttonWidth,
          buttonHeight: userConfig.canvasProperties?.contextPad?.style?.buttonHeight ?? defaultConfig.canvasProperties.contextPad?.style?.buttonHeight,
          buttonPadding: userConfig.canvasProperties?.contextPad?.style?.buttonPadding ?? defaultConfig.canvasProperties.contextPad?.style?.buttonPadding,
          buttonMargin: userConfig.canvasProperties?.contextPad?.style?.buttonMargin ?? defaultConfig.canvasProperties.contextPad?.style?.buttonMargin,
          iconColor: userConfig.canvasProperties?.contextPad?.style?.iconColor ?? defaultConfig.canvasProperties.contextPad?.style?.iconColor,
          buttonHoverColor: userConfig.canvasProperties?.contextPad?.style?.buttonHoverColor ?? defaultConfig.canvasProperties.contextPad?.style?.buttonHoverColor,
          buttonActiveColor: userConfig.canvasProperties?.contextPad?.style?.buttonActiveColor ?? defaultConfig.canvasProperties.contextPad?.style?.buttonActiveColor,
        }
      }
    },
    shapes: userConfig.shapes ?? defaultConfig.shapes,
    connections: userConfig.connections ?? defaultConfig.connections,
    globalProperties: userConfig.globalProperties ?? defaultConfig.globalProperties,
    dragOptions: userConfig.dragOptions ?? defaultConfig.dragOptions,
    historyLimit: userConfig.historyLimit ?? defaultConfig.historyLimit ?? 20
  };
}
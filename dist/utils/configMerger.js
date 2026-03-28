import { defaultConfig } from '../config/defaultConfig.js';

function mergeConfig(userConfig) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96, _97, _98, _99, _100, _101, _102, _103;
    return {
        canvas: {
            width: (_b = (_a = userConfig.canvas) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : defaultConfig.canvas.width,
            height: (_d = (_c = userConfig.canvas) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : defaultConfig.canvas.height,
            backgroundColor: (_f = (_e = userConfig.canvas) === null || _e === void 0 ? void 0 : _e.backgroundColor) !== null && _f !== void 0 ? _f : defaultConfig.canvas.backgroundColor,
            canvasClasses: (_h = (_g = userConfig.canvas) === null || _g === void 0 ? void 0 : _g.canvasClasses) !== null && _h !== void 0 ? _h : defaultConfig.canvas.canvasClasses,
            locked: (_k = (_j = userConfig.canvas) === null || _j === void 0 ? void 0 : _j.locked) !== null && _k !== void 0 ? _k : defaultConfig.canvas.locked,
            grid: {
                gridEnabled: (_o = (_m = (_l = userConfig.canvas) === null || _l === void 0 ? void 0 : _l.grid) === null || _m === void 0 ? void 0 : _m.gridEnabled) !== null && _o !== void 0 ? _o : defaultConfig.canvas.grid.gridEnabled,
                gridType: (_r = (_q = (_p = userConfig.canvas) === null || _p === void 0 ? void 0 : _p.grid) === null || _q === void 0 ? void 0 : _q.gridType) !== null && _r !== void 0 ? _r : defaultConfig.canvas.grid.gridType,
                gridSize: (_u = (_t = (_s = userConfig.canvas) === null || _s === void 0 ? void 0 : _s.grid) === null || _t === void 0 ? void 0 : _t.gridSize) !== null && _u !== void 0 ? _u : defaultConfig.canvas.grid.gridSize,
                gridColor: (_x = (_w = (_v = userConfig.canvas) === null || _v === void 0 ? void 0 : _v.grid) === null || _w === void 0 ? void 0 : _w.gridColor) !== null && _x !== void 0 ? _x : defaultConfig.canvas.grid.gridColor,
                gridDimension: (_0 = (_z = (_y = userConfig.canvas) === null || _y === void 0 ? void 0 : _y.grid) === null || _z === void 0 ? void 0 : _z.gridDimension) !== null && _0 !== void 0 ? _0 : defaultConfig.canvas.grid.gridDimension,
                gridTransparency: (_3 = (_2 = (_1 = userConfig.canvas) === null || _1 === void 0 ? void 0 : _1.grid) === null || _2 === void 0 ? void 0 : _2.gridTransparency) !== null && _3 !== void 0 ? _3 : defaultConfig.canvas.grid.gridTransparency,
                gridShape: (_6 = (_5 = (_4 = userConfig.canvas) === null || _4 === void 0 ? void 0 : _4.grid) === null || _5 === void 0 ? void 0 : _5.gridShape) !== null && _6 !== void 0 ? _6 : defaultConfig.canvas.grid.gridShape,
                crossLength: (_9 = (_8 = (_7 = userConfig.canvas) === null || _7 === void 0 ? void 0 : _7.grid) === null || _8 === void 0 ? void 0 : _8.crossLength) !== null && _9 !== void 0 ? _9 : defaultConfig.canvas.grid.crossLength,
                sheetDimension: (_12 = (_11 = (_10 = userConfig.canvas) === null || _10 === void 0 ? void 0 : _10.grid) === null || _11 === void 0 ? void 0 : _11.sheetDimension) !== null && _12 !== void 0 ? _12 : defaultConfig.canvas.grid.sheetDimension
            }
        },
        canvasProperties: {
            zoomEnabled: (_14 = (_13 = userConfig.canvasProperties) === null || _13 === void 0 ? void 0 : _13.zoomEnabled) !== null && _14 !== void 0 ? _14 : defaultConfig.canvasProperties.zoomEnabled,
            zoomExtent: (_16 = (_15 = userConfig.canvasProperties) === null || _15 === void 0 ? void 0 : _15.zoomExtent) !== null && _16 !== void 0 ? _16 : defaultConfig.canvasProperties.zoomExtent,
            zoomOnDoubleClick: (_18 = (_17 = userConfig.canvasProperties) === null || _17 === void 0 ? void 0 : _17.zoomOnDoubleClick) !== null && _18 !== void 0 ? _18 : defaultConfig.canvasProperties.zoomOnDoubleClick,
            zoomScale: (_20 = (_19 = userConfig.canvasProperties) === null || _19 === void 0 ? void 0 : _19.zoomScale) !== null && _20 !== void 0 ? _20 : defaultConfig.canvasProperties.zoomScale,
            zoomOnScroll: (_22 = (_21 = userConfig.canvasProperties) === null || _21 === void 0 ? void 0 : _21.zoomOnScroll) !== null && _22 !== void 0 ? _22 : defaultConfig.canvasProperties.zoomOnScroll,
            zoomDuration: (_24 = (_23 = userConfig.canvasProperties) === null || _23 === void 0 ? void 0 : _23.zoomDuration) !== null && _24 !== void 0 ? _24 : defaultConfig.canvasProperties.zoomDuration,
            panEnabled: (_26 = (_25 = userConfig.canvasProperties) === null || _25 === void 0 ? void 0 : _25.panEnabled) !== null && _26 !== void 0 ? _26 : defaultConfig.canvasProperties.panEnabled,
            snapToGrid: (_28 = (_27 = userConfig.canvasProperties) === null || _27 === void 0 ? void 0 : _27.snapToGrid) !== null && _28 !== void 0 ? _28 : defaultConfig.canvasProperties.snapToGrid,
            alignmentLines: {
                enabled: (_31 = (_30 = (_29 = userConfig.canvasProperties) === null || _29 === void 0 ? void 0 : _29.alignmentLines) === null || _30 === void 0 ? void 0 : _30.enabled) !== null && _31 !== void 0 ? _31 : defaultConfig.canvasProperties.alignmentLines.enabled,
                color: (_34 = (_33 = (_32 = userConfig.canvasProperties) === null || _32 === void 0 ? void 0 : _32.alignmentLines) === null || _33 === void 0 ? void 0 : _33.color) !== null && _34 !== void 0 ? _34 : defaultConfig.canvasProperties.alignmentLines.color,
                width: (_37 = (_36 = (_35 = userConfig.canvasProperties) === null || _35 === void 0 ? void 0 : _35.alignmentLines) === null || _36 === void 0 ? void 0 : _36.width) !== null && _37 !== void 0 ? _37 : defaultConfig.canvasProperties.alignmentLines.width,
                dashed: (_40 = (_39 = (_38 = userConfig.canvasProperties) === null || _38 === void 0 ? void 0 : _38.alignmentLines) === null || _39 === void 0 ? void 0 : _39.dashed) !== null && _40 !== void 0 ? _40 : defaultConfig.canvasProperties.alignmentLines.dashed,
                dashArray: (_43 = (_42 = (_41 = userConfig.canvasProperties) === null || _41 === void 0 ? void 0 : _41.alignmentLines) === null || _42 === void 0 ? void 0 : _42.dashArray) !== null && _43 !== void 0 ? _43 : defaultConfig.canvasProperties.alignmentLines.dashArray,
                alignmentThreshold: (_46 = (_45 = (_44 = userConfig.canvasProperties) === null || _44 === void 0 ? void 0 : _44.alignmentLines) === null || _45 === void 0 ? void 0 : _45.alignmentThreshold) !== null && _46 !== void 0 ? _46 : defaultConfig.canvasProperties.alignmentLines.alignmentThreshold,
                // Keep these as partial overrides.
                // If user passes {}, drag logic falls back to master alignment style.
                edgeGuides: (_49 = (_48 = (_47 = userConfig.canvasProperties) === null || _47 === void 0 ? void 0 : _47.alignmentLines) === null || _48 === void 0 ? void 0 : _48.edgeGuides) !== null && _49 !== void 0 ? _49 : defaultConfig.canvasProperties.alignmentLines.edgeGuides,
                centerGuides: (_52 = (_51 = (_50 = userConfig.canvasProperties) === null || _50 === void 0 ? void 0 : _50.alignmentLines) === null || _51 === void 0 ? void 0 : _51.centerGuides) !== null && _52 !== void 0 ? _52 : defaultConfig.canvasProperties.alignmentLines.centerGuides,
                guideLineMode: (_55 = (_54 = (_53 = userConfig.canvasProperties) === null || _53 === void 0 ? void 0 : _53.alignmentLines) === null || _54 === void 0 ? void 0 : _54.guideLineMode) !== null && _55 !== void 0 ? _55 : defaultConfig.canvasProperties.alignmentLines.guideLineMode
            },
            lassoStyle: {
                enabled: (_58 = (_57 = (_56 = userConfig.canvasProperties) === null || _56 === void 0 ? void 0 : _56.lassoStyle) === null || _57 === void 0 ? void 0 : _57.enabled) !== null && _58 !== void 0 ? _58 : defaultConfig.canvasProperties.lassoStyle.enabled,
                strokeColor: (_61 = (_60 = (_59 = userConfig.canvasProperties) === null || _59 === void 0 ? void 0 : _59.lassoStyle) === null || _60 === void 0 ? void 0 : _60.strokeColor) !== null && _61 !== void 0 ? _61 : defaultConfig.canvasProperties.lassoStyle.strokeColor,
                strokeWidth: (_64 = (_63 = (_62 = userConfig.canvasProperties) === null || _62 === void 0 ? void 0 : _62.lassoStyle) === null || _63 === void 0 ? void 0 : _63.strokeWidth) !== null && _64 !== void 0 ? _64 : defaultConfig.canvasProperties.lassoStyle.strokeWidth,
                dashed: (_67 = (_66 = (_65 = userConfig.canvasProperties) === null || _65 === void 0 ? void 0 : _65.lassoStyle) === null || _66 === void 0 ? void 0 : _66.dashed) !== null && _67 !== void 0 ? _67 : defaultConfig.canvasProperties.lassoStyle.dashed,
                dashArray: (_70 = (_69 = (_68 = userConfig.canvasProperties) === null || _68 === void 0 ? void 0 : _68.lassoStyle) === null || _69 === void 0 ? void 0 : _69.dashArray) !== null && _70 !== void 0 ? _70 : defaultConfig.canvasProperties.lassoStyle.dashArray,
                fillColor: (_73 = (_72 = (_71 = userConfig.canvasProperties) === null || _71 === void 0 ? void 0 : _71.lassoStyle) === null || _72 === void 0 ? void 0 : _72.fillColor) !== null && _73 !== void 0 ? _73 : defaultConfig.canvasProperties.lassoStyle.fillColor,
                fillOpacity: (_76 = (_75 = (_74 = userConfig.canvasProperties) === null || _74 === void 0 ? void 0 : _74.lassoStyle) === null || _75 === void 0 ? void 0 : _75.fillOpacity) !== null && _76 !== void 0 ? _76 : defaultConfig.canvasProperties.lassoStyle.fillOpacity,
                cursor: (_79 = (_78 = (_77 = userConfig.canvasProperties) === null || _77 === void 0 ? void 0 : _77.lassoStyle) === null || _78 === void 0 ? void 0 : _78.cursor) !== null && _79 !== void 0 ? _79 : defaultConfig.canvasProperties.lassoStyle.cursor,
                activeCursor: (_82 = (_81 = (_80 = userConfig.canvasProperties) === null || _80 === void 0 ? void 0 : _80.lassoStyle) === null || _81 === void 0 ? void 0 : _81.activeCursor) !== null && _82 !== void 0 ? _82 : defaultConfig.canvasProperties.lassoStyle.activeCursor,
            },
            keyboardShortcuts: {
                enabled: (_85 = (_84 = (_83 = userConfig.canvasProperties) === null || _83 === void 0 ? void 0 : _83.keyboardShortcuts) === null || _84 === void 0 ? void 0 : _84.enabled) !== null && _85 !== void 0 ? _85 : defaultConfig.canvasProperties.keyboardShortcuts.enabled,
                deleteSelection: (_88 = (_87 = (_86 = userConfig.canvasProperties) === null || _86 === void 0 ? void 0 : _86.keyboardShortcuts) === null || _87 === void 0 ? void 0 : _87.deleteSelection) !== null && _88 !== void 0 ? _88 : defaultConfig.canvasProperties.keyboardShortcuts.deleteSelection,
                clearSelection: (_91 = (_90 = (_89 = userConfig.canvasProperties) === null || _89 === void 0 ? void 0 : _89.keyboardShortcuts) === null || _90 === void 0 ? void 0 : _90.clearSelection) !== null && _91 !== void 0 ? _91 : defaultConfig.canvasProperties.keyboardShortcuts.clearSelection,
                customBindings: (_94 = (_93 = (_92 = userConfig.canvasProperties) === null || _92 === void 0 ? void 0 : _92.keyboardShortcuts) === null || _93 === void 0 ? void 0 : _93.customBindings) !== null && _94 !== void 0 ? _94 : defaultConfig.canvasProperties.keyboardShortcuts.customBindings,
                callbacks: (_97 = (_96 = (_95 = userConfig.canvasProperties) === null || _95 === void 0 ? void 0 : _95.keyboardShortcuts) === null || _96 === void 0 ? void 0 : _96.callbacks) !== null && _97 !== void 0 ? _97 : defaultConfig.canvasProperties.keyboardShortcuts.callbacks,
            },
            ports: (_99 = (_98 = userConfig.canvasProperties) === null || _98 === void 0 ? void 0 : _98.ports) !== null && _99 !== void 0 ? _99 : defaultConfig.canvasProperties.ports
        },
        shapes: (_100 = userConfig.shapes) !== null && _100 !== void 0 ? _100 : defaultConfig.shapes,
        connections: (_101 = userConfig.connections) !== null && _101 !== void 0 ? _101 : defaultConfig.connections,
        globalProperties: (_102 = userConfig.globalProperties) !== null && _102 !== void 0 ? _102 : defaultConfig.globalProperties,
        dragOptions: (_103 = userConfig.dragOptions) !== null && _103 !== void 0 ? _103 : defaultConfig.dragOptions
    };
}

export { mergeConfig };
//# sourceMappingURL=configMerger.js.map

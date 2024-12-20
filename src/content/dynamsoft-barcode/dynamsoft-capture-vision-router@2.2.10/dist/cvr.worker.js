/*!
 * Dynamsoft JavaScript Library
 * @product Dynamsoft Capture Vision Router JS Edition
 * @website http://www.dynamsoft.com
 * @copyright Copyright 2024, Dynamsoft Corporation
 * @author Dynamsoft
 * @version "2.2.10"
 * @fileoverview Dynamsoft JavaScript Library for Capture Vision
 * More info on cvr JS: https://www.dynamsoft.com/capture-vision/docs/web/programming/javascript/api-reference/capture-vision-router/capture-vision-router-module.html
 */
! function () {
    "use strict";
    var e;

    function t(t, s) {
        for (let r of t)
            if (r.result) {
                if ([e.IRUT_BINARY_IMAGE, e.IRUT_COLOUR_IMAGE, e.IRUT_COMPLEMENTED_BARCODE_IMAGE, e.IRUT_ENHANCED_GRAYSCALE_IMAGE, e.IRUT_GRAYSCALE_IMAGE, e.IRUT_SCALED_DOWN_COLOUR_IMAGE, e.IRUT_SCALED_UP_BARCODE_IMAGE, e.IRUT_TEXTURE_REMOVED_BINARY_IMAGE, e.IRUT_TEXTURE_REMOVED_GRAYSCALE_IMAGE, e.IRUT_TEXT_REMOVED_BINARY_IMAGE, e.IRUT_TRANSOFORMED_GRAYSCALE_IMAGE].includes(r.result.unitType)) {
                    let e = r.result.imageData.bytes;
                    e && (e = new Uint8Array(new Uint8Array(s.buffer, e.ptr, e.length)), r.result.imageData.bytes = e)
                } else if ([e.IRUT_DEFORMATION_RESISTED_BARCODE_IMAGE].includes(r.result.unitType)) {
                    let e = r.result.deformationResistedBarcode.imageData.bytes;
                    e && (e = new Uint8Array(new Uint8Array(s.buffer, e.ptr, e.length)), r.result.deformationResistedBarcode.imageData.bytes = e)
                } else if ([e.IRUT_CONTOURS].includes(r.result.unitType)) {
                    let e = r.result.contours,
                        t = r.result.contoursOffset;
                    if (e && t) {
                        e = new Uint8Array(new Uint8Array(s.buffer, e.ptr, e.length)), t = new Uint8Array(new Uint8Array(s.buffer, t.ptr, t.length));
                        const n = new DataView(e.buffer),
                            a = [];
                        for (let t = 0; t < e.length; t += 4) a.push(n.getInt32(t, !0));
                        const _ = new DataView(t.buffer),
                            i = [];
                        for (let e = 0; e < t.length; e += 4) i.push(_.getInt32(e, !0));
                        const o = [];
                        for (let e = 0; e < i.length - 1; e++) {
                            const t = {
                                points: []
                            };
                            for (let s = i[e]; s < i[e + 1]; s += 2) t.points.push({
                                x: a[s - 1],
                                y: a[s]
                            });
                            o.push(t)
                        }
                        r.result.contours = o, delete r.result.contoursOffset
                    }
                } else if ([e.IRUT_LINE_SEGMENTS].includes(r.result.unitType)) {
                    let e = r.result.lineSegments;
                    if (e) {
                        e = new Uint8Array(new Uint8Array(s.buffer, e.ptr, e.length));
                        const t = new DataView(e.buffer),
                            n = [];
                        for (let s = 0; s < e.length; s += 4) n.push(t.getInt32(s, !0));
                        const a = [];
                        for (let e = 0; e < n.length; e += 4) {
                            const t = {
                                startPoint: {
                                    x: n[e],
                                    y: n[e + 1]
                                },
                                endPoint: {
                                    x: n[e + 2],
                                    y: n[e + 3]
                                }
                            };
                            a.push(t)
                        }
                        r.result.lineSegments = a
                    }
                } else if ([e.IRUT_SHORT_LINES].includes(r.result.unitType)) {
                    let e = r.result.shortLines;
                    if (e) {
                        e = new Uint8Array(new Uint8Array(s.buffer, e.ptr, e.length));
                        const t = new DataView(e.buffer),
                            n = [];
                        for (let s = 0; s < e.length; s += 4) n.push(t.getInt32(s, !0));
                        const a = [];
                        for (let e = 0; e < n.length; e += 4) {
                            const t = {
                                startPoint: {
                                    x: n[e],
                                    y: n[e + 1]
                                },
                                endPoint: {
                                    x: n[e + 2],
                                    y: n[e + 3]
                                }
                            };
                            a.push(t)
                        }
                        r.result.shortLines = a
                    }
                } else if ([e.IRUT_CANDIDATE_QUAD_EDGES].includes(r.result.unitType)) {
                    let e = r.result.candidateQuadEdges;
                    if (e) {
                        e = new Uint8Array(new Uint8Array(s.buffer, e.ptr, e.length));
                        const t = new DataView(e.buffer),
                            n = [];
                        for (let s = 0; s < e.length; s += 4) n.push(t.getInt32(s, !0));
                        const a = [];
                        for (let e = 0; e < n.length; e += 22) {
                            const t = {
                                startCorner: {
                                    intersection: {
                                        x: n[e],
                                        y: n[e + 1]
                                    },
                                    line1: {
                                        startPoint: {
                                            x: n[e + 2],
                                            y: n[e + 3]
                                        },
                                        endPoint: {
                                            x: n[e + 4],
                                            y: n[e + 5]
                                        }
                                    },
                                    line2: {
                                        startPoint: {
                                            x: n[e + 6],
                                            y: n[e + 7]
                                        },
                                        endPoint: {
                                            x: n[e + 8],
                                            y: n[e + 9]
                                        }
                                    },
                                    type: n[e + 10]
                                },
                                endCorner: {
                                    intersection: {
                                        x: n[e + 11],
                                        y: n[e + 12]
                                    },
                                    line1: {
                                        startPoint: {
                                            x: n[e + 13],
                                            y: n[e + 14]
                                        },
                                        endPoint: {
                                            x: n[e + 15],
                                            y: n[e + 16]
                                        }
                                    },
                                    line2: {
                                        startPoint: {
                                            x: n[e + 17],
                                            y: n[e + 18]
                                        },
                                        endPoint: {
                                            x: n[e + 19],
                                            y: n[e + 20]
                                        }
                                    },
                                    type: n[e + 21]
                                }
                            };
                            a.push(t)
                        }
                        r.result.candidateQuadEdges = a
                    }
                } else if ([e.IRUT_CORNERS].includes(r.result.unitType)) {
                    let e = r.result.corners;
                    if (e) {
                        e = new Uint8Array(new Uint8Array(s.buffer, e.ptr, e.length));
                        const t = new DataView(e.buffer),
                            n = [];
                        for (let s = 0; s < e.length; s += 4) n.push(t.getInt32(s, !0));
                        const a = [];
                        for (let e = 0; e < n.length; e += 11) {
                            const t = {
                                intersection: {
                                    x: n[e],
                                    y: n[e + 1]
                                },
                                line1: {
                                    startPoint: {
                                        x: n[e + 2],
                                        y: n[e + 3]
                                    },
                                    endPoint: {
                                        x: n[e + 4],
                                        y: n[e + 5]
                                    }
                                },
                                line2: {
                                    startPoint: {
                                        x: n[e + 6],
                                        y: n[e + 7]
                                    },
                                    endPoint: {
                                        x: n[e + 8],
                                        y: n[e + 9]
                                    }
                                },
                                type: n[e + 10]
                            };
                            a.push(t)
                        }
                        r.result.corners = a
                    }
                } else if ([e.IRUT_NORMALIZED_IMAGES].includes(r.result.unitType))
                    for (let e of r.result.normalizedImages) {
                        let t = e.imageData.bytes;
                        t && (t = new Uint8Array(new Uint8Array(s.buffer, t.ptr, t.length)), e.imageData.bytes = t)
                    }
            } else if (r.intermediateResultUnits)
            for (let t of r.intermediateResultUnits)
                if (t.unitType === e.IRUT_NORMALIZED_IMAGES)
                    for (let e of t.normalizedImages) {
                        let t = e.imageData.bytes;
                        t && (t = new Uint8Array(new Uint8Array(s.buffer, t.ptr, t.length)), e.imageData.bytes = t)
                    }
    }! function (e) {
        e[e.IRUT_NULL = 0] = "IRUT_NULL", e[e.IRUT_COLOUR_IMAGE = 1] = "IRUT_COLOUR_IMAGE", e[e.IRUT_SCALED_DOWN_COLOUR_IMAGE = 2] = "IRUT_SCALED_DOWN_COLOUR_IMAGE", e[e.IRUT_GRAYSCALE_IMAGE = 4] = "IRUT_GRAYSCALE_IMAGE", e[e.IRUT_TRANSOFORMED_GRAYSCALE_IMAGE = 8] = "IRUT_TRANSOFORMED_GRAYSCALE_IMAGE", e[e.IRUT_ENHANCED_GRAYSCALE_IMAGE = 16] = "IRUT_ENHANCED_GRAYSCALE_IMAGE", e[e.IRUT_PREDETECTED_REGIONS = 32] = "IRUT_PREDETECTED_REGIONS", e[e.IRUT_BINARY_IMAGE = 64] = "IRUT_BINARY_IMAGE", e[e.IRUT_TEXTURE_DETECTION_RESULT = 128] = "IRUT_TEXTURE_DETECTION_RESULT", e[e.IRUT_TEXTURE_REMOVED_GRAYSCALE_IMAGE = 256] = "IRUT_TEXTURE_REMOVED_GRAYSCALE_IMAGE", e[e.IRUT_TEXTURE_REMOVED_BINARY_IMAGE = 512] = "IRUT_TEXTURE_REMOVED_BINARY_IMAGE", e[e.IRUT_CONTOURS = 1024] = "IRUT_CONTOURS", e[e.IRUT_LINE_SEGMENTS = 2048] = "IRUT_LINE_SEGMENTS", e[e.IRUT_TEXT_ZONES = 4096] = "IRUT_TEXT_ZONES", e[e.IRUT_TEXT_REMOVED_BINARY_IMAGE = 8192] = "IRUT_TEXT_REMOVED_BINARY_IMAGE", e[e.IRUT_CANDIDATE_BARCODE_ZONES = 16384] = "IRUT_CANDIDATE_BARCODE_ZONES", e[e.IRUT_LOCALIZED_BARCODES = 32768] = "IRUT_LOCALIZED_BARCODES", e[e.IRUT_SCALED_UP_BARCODE_IMAGE = 65536] = "IRUT_SCALED_UP_BARCODE_IMAGE", e[e.IRUT_DEFORMATION_RESISTED_BARCODE_IMAGE = 131072] = "IRUT_DEFORMATION_RESISTED_BARCODE_IMAGE", e[e.IRUT_COMPLEMENTED_BARCODE_IMAGE = 262144] = "IRUT_COMPLEMENTED_BARCODE_IMAGE", e[e.IRUT_DECODED_BARCODES = 524288] = "IRUT_DECODED_BARCODES", e[e.IRUT_LONG_LINES = 1048576] = "IRUT_LONG_LINES", e[e.IRUT_CORNERS = 2097152] = "IRUT_CORNERS", e[e.IRUT_CANDIDATE_QUAD_EDGES = 4194304] = "IRUT_CANDIDATE_QUAD_EDGES", e[e.IRUT_DETECTED_QUADS = 8388608] = "IRUT_DETECTED_QUADS", e[e.IRUT_LOCALIZED_TEXT_LINES = 16777216] = "IRUT_LOCALIZED_TEXT_LINES", e[e.IRUT_RECOGNIZED_TEXT_LINES = 33554432] = "IRUT_RECOGNIZED_TEXT_LINES", e[e.IRUT_NORMALIZED_IMAGES = 67108864] = "IRUT_NORMALIZED_IMAGES", e[e.IRUT_SHORT_LINES = 134217728] = "IRUT_SHORT_LINES", e[e.IRUT_ALL = 134217727] = "IRUT_ALL"
    }(e || (e = {}));
    const s = "function" == typeof BigInt;
    async function r(e, t) {
        return await new Promise(((s, r) => {
            let n = new XMLHttpRequest;
            n.open("GET", e, !0), n.responseType = t, n.send(), n.onloadend = async () => {
                s(n.response)
            }, n.onerror = () => {
                r(new Error("Network Error: " + n.statusText))
            }
        }))
    }
    var n;
    ! function (e) {
        e[e.CRIT_ORIGINAL_IMAGE = 1] = "CRIT_ORIGINAL_IMAGE", e[e.CRIT_BARCODE = 2] = "CRIT_BARCODE", e[e.CRIT_TEXT_LINE = 4] = "CRIT_TEXT_LINE", e[e.CRIT_DETECTED_QUAD = 8] = "CRIT_DETECTED_QUAD", e[e.CRIT_NORMALIZED_IMAGE = 16] = "CRIT_NORMALIZED_IMAGE", e[e.CRIT_PARSED_RESULT = 32] = "CRIT_PARSED_RESULT"
    }(n || (n = {}));
    let a, _, i, o = null,
        T = new Set;
    self.cvrWorkerVersion = "2.2.10";
    const l = async (e, t) => {
        ep();
        const s = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_ParseRequiredResources_1(e, es(t.templateName))));
        for (let e = 0; e < s.models.length; e++) await checkAndAutoLoadCaffeModel(s.models[e], engineResourcePaths.dlrData);
        for (let e = 0; e < s.specss.length; e++) await checkAndAutoLoadResourceBuffer(s.specss[e], engineResourcePaths.dcp + "specification/")
    };
    Object.assign(mapController, {
        cvr_createInstance: async (e, t) => {
            try {
                let e = wasmImports.emscripten_bind_CvrWasm_CvrWasm_0();
                if (engineResourcePaths.dbr) {
                    const t = await r(engineResourcePaths.dbr + "DBR-PresetTemplates.json", "text");
                    a = t, ep(), wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(e, es(t))
                }
                if (engineResourcePaths.dlr) {
                    const t = await r(engineResourcePaths.dlr + "DLR-PresetTemplates.json", "text");
                    _ = t, ep(), log(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(e, es(t))))
                }
                if (engineResourcePaths.ddn) {
                    const t = await r(engineResourcePaths.ddn + "DDN-PresetTemplates.json", "text");
                    i = t, ep(), wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(e, es(t))
                }
                wasmImports.emscripten_bind_CvrWasm_InitParameter_0(e), ep();
                const s = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_OutputSettings_1(e, es("*")));
                let n = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CoreWasm_GetModuleVersion_0())).CVR;
                T.add(e), handleTaskRes(t, {
                    instanceID: e,
                    version: n,
                    outputSettings: s
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_initSettings: async (e, t, s) => {
            let r;
            try {
                ep(), r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_InitSettings_1(s, es(e.settings))), handleTaskRes(t, {
                    success: !0,
                    response: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_setCrrRegistry: async (e, t, s) => {
            try {
                T.has(s) && (ep(), wasmImports.emscripten_bind_CvrWasm_SetCrrRegistry_1(s, es(e.receiver))), handleTaskRes(t, {
                    success: !0
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_startCapturing: async (e, t, s) => {
            let r = !1;
            try {
                ep();
                r = 1 === JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_OutputSettings_1(s, es(e.templateName)))).CaptureVisionTemplates[0].OutputOriginalImage, await l(s, e), handleTaskRes(t, {
                    success: !0,
                    bNeedOutputOriginalImage: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_parseRequiredResources: async (e, t, s) => {
            let r;
            try {
                ep(), r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_ParseRequiredResources_1(s, es(e.templateName))), handleTaskRes(t, {
                    success: !0,
                    resources: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_clearVerifyList: (e, t, s) => {
            try {
                wasmImports.emscripten_bind_CvrWasm_ClearVerifyList_0(s), handleTaskRes(t, {
                    success: !0
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_getIntermediateResult: (e, r, n) => {
            let a = {};
            try {
                a = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_GetIntermediateResult_0(n)), ((e, t) => s && ["format", "possibleFormats"].includes(e) && BigInt(t) > Number.MAX_SAFE_INTEGER ? BigInt(t) : t)), a && t(a, HEAP8)
            } catch (e) {
                console.log(e), handleTaskErr(r, e)
            }
            handleTaskRes(r, {
                success: !0,
                result: a
            })
        },
        cvr_setObservedResultUnitTypes: (e, t, s) => {
            try {
                ep(), wasmImports.emscripten_bind_CvrWasm_SetObservedResultUnitTypes_1(s, es(e.types))
            } catch (e) {
                handleTaskErr(t, e)
            }
            handleTaskRes(t, {
                success: !0
            })
        },
        cvr_getObservedResultUnitTypes: (e, t, s) => {
            let r;
            try {
                ep(), r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_GetObservedResultUnitTypes_0(s))
            } catch (e) {
                handleTaskErr(t, e)
            }
            handleTaskRes(t, {
                success: !0,
                result: r
            })
        },
        cvr_isResultUnitTypeObserved: (e, t, s) => {
            let r;
            try {
                ep(), r = wasmImports.emscripten_bind_CvrWasm_IsResultUnitTypeObserved_1(s, es(e.type))
            } catch (e) {
                handleTaskErr(t, e)
            }
            handleTaskRes(t, {
                success: !0,
                result: r
            })
        },
        cvr_capture: async (e, r, a) => {
            let _, i, T;
            await checkAndReauth(), log(`time worker get msg: ${Date.now()}`);
            try {
                let r = Date.now();
                await l(a, e), log("appendResourceTime: " + (Date.now() - r)), o && (wasmImports.emscripten_bind_Destory_CImageData(o), o = null), o = wasmImports.emscripten_bind_Create_CImageData(e.bytes.length, setBufferIntoWasm(e.bytes, 0), e.width, e.height, e.stride, e.format, 0);
                let c = Date.now();
                log(`start worker capture: ${c}`), ep(), i = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_Capture_3(a, o, es(e.templateName), e.dynamsoft));
                 // TODO: WASM 中校验并返回处理结果： wasmImports.emscripten_bind_CvrWasm_Capture_3
                let E = Date.now();
                log("worker time: " + (E - c)), log(`end worker capture: ${E}`), i = JSON.parse(i, ((e, t) => s && "format" === e && BigInt(t) > Number.MAX_SAFE_INTEGER ? BigInt(t) : t));
                let R = Date.now();
                log("capture result parsed: " + (R - E));
                for (let e = 0; e < i.items.length; e++)[n.CRIT_NORMALIZED_IMAGE].includes(i.items[e].type) && (T = i.items[e].imageData.bytes, T = new Uint8Array(new Uint8Array(HEAP8.buffer, T.ptr, T.length)), i.items[e].imageData.bytes = T);
                let I = Date.now();
                log("result new Uint8Array: " + (I - R)), _ = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_GetIntermediateResult_0(a)), ((e, t) => s && ["format", "possibleFormats"].includes(e) && BigInt(t) > Number.MAX_SAFE_INTEGER ? BigInt(t) : t)), _ && t(_, HEAP8), i.intermediateResult = _;
                let m = Date.now();
                log("get intermediate result: " + (m - I)), log("after capture handle time: " + (Date.now() - E))
            } catch (e) {
                return console.log(e), void handleTaskErr(r, e)
            }
            const c = Date.now();
            // console.warn("captureResult", i)
            log(`time worker return msg: ${c}`), postMessage({
                type: "task",
                id: r,
                body: {
                    success: !0,
                    bytes: e.bytes,
                    captureResult: i,
                    workerReturnMsgTime: c
                }
            }, [e.bytes.buffer])
        },
        cvr_outputSettings: async (e, t, s) => {
            let r;
            try {
                ep(), r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_OutputSettings_1(s, es(e.templateName))), handleTaskRes(t, {
                    success: !0,
                    settings: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_getSimplifiedSettings: async (e, t, s) => {
            let r;
            try {
                ep(), r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_GetSimplifiedSettings_1(s, es(e.templateName))), handleTaskRes(t, {
                    success: !0,
                    settings: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_updateSettings: async (e, t, r) => {
            let n, a;
            try {
                let _ = e.settings,
                    i = e.templateName;
                s && "object" == typeof _ && _.hasOwnProperty("barcodeSettings") && (_.barcodeSettings.barcodeFormatIds = _.barcodeSettings.barcodeFormatIds.toString()), ep(), n = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_UpdateSettings_2(r, es(i), es(JSON.stringify(_)))), ep();
                a = 1 === JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_OutputSettings_1(r, es(i)))).CaptureVisionTemplates[0].OutputOriginalImage, handleTaskRes(t, {
                    success: !0,
                    response: n,
                    bNeedOutputOriginalImage: a
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_resetSettings: async (e, t, s) => {
            let r;
            try {
                wasmImports.emscripten_bind_CvrWasm_ResetSettings_0(s), ep(), a && wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(s, es(a)), ep(), _ && wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(s, es(_)), ep(), i && wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(s, es(i)), ep(), r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_InitParameter_0(s)), handleTaskRes(t, {
                    success: !0,
                    response: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_setIrrRegistry: async (e, t, s) => {
            try {
                if (T.has(s)) {
                    ep(), wasmImports.emscripten_bind_CvrWasm_SetIrrRegistry_1(s, es(JSON.stringify(e.receiverObj))), e.observedResultUnitTypes && "-1" !== e.observedResultUnitTypes && (ep(), wasmImports.emscripten_bind_CvrWasm_SetObservedResultUnitTypes_1(s, es(e.observedResultUnitTypes)));
                    for (let t in e.observedTaskMap) e.observedTaskMap[t] ? (ep(), wasmImports.emscripten_bind_CvrWasm_AddObservedTask_1(s, es(t))) : (ep(), wasmImports.emscripten_bind_CvrWasm_RemoveObservedTask_1(s, es(t)))
                }
                handleTaskRes(t, {
                    success: !0
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_enableResultCrossVerification: async (e, t, s) => {
            let r;
            try {
                for (let t in e.verificationEnabled) r = wasmImports.emscripten_bind_CvrWasm_EnableResultCrossVerification_2(s, Number(t), e.verificationEnabled[t]);
                handleTaskRes(t, {
                    success: !0,
                    result: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_enableResultDeduplication: async (e, t, s) => {
            let r;
            try {
                for (let t in e.duplicateFilterEnabled) r = wasmImports.emscripten_bind_CvrWasm_EnableResultDeduplication_2(s, Number(t), e.duplicateFilterEnabled[t]);
                handleTaskRes(t, {
                    success: !0,
                    result: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_setDuplicateForgetTime: async (e, t, s) => {
            let r;
            try {
                for (let t in e.duplicateForgetTime) r = wasmImports.emscripten_bind_CvrWasm_SetDuplicateForgetTime_2(s, Number(t), e.duplicateForgetTime[t]);
                handleTaskRes(t, {
                    success: !0,
                    result: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_getDuplicateForgetTime: async (e, t, s) => {
            let r;
            try {
                r = wasmImports.emscripten_bind_CvrWasm_GetDuplicateForgetTime_1(s, e.type), handleTaskRes(t, {
                    success: !0,
                    time: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_containsTask: async (e, t, s) => {
            try {
                ep();
                const r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_ContainsTask_1(s, es(e.templateName)));
                handleTaskRes(t, {
                    success: !0,
                    tasks: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_dispose: async (e, t, s) => {
            try {
                T.delete(s), wasmImports.emscripten_bind_Destory_CImageData(o), o = null, wasmImports.emscripten_bind_CvrWasm___destroy___0(s), handleTaskRes(t, {
                    success: !0
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        }
    })
}();
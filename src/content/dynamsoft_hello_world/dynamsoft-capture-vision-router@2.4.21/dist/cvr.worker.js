/*!
 * Dynamsoft JavaScript Library
 * @product Dynamsoft Capture Vision Router JS Edition
 * @website http://www.dynamsoft.com
 * @copyright Copyright 2024, Dynamsoft Corporation
 * @author Dynamsoft
 * @version "2.4.21"
 * @fileoverview Dynamsoft JavaScript Library for Capture Vision
 * More info on cvr JS: https://www.dynamsoft.com/capture-vision/docs/web/programming/javascript/api-reference/capture-vision-router/capture-vision-router-module.html
 */
! function() {
    "use strict";
    const e = {
        IRUT_NULL: BigInt(0),
        IRUT_COLOUR_IMAGE: BigInt(1),
        IRUT_SCALED_DOWN_COLOUR_IMAGE: BigInt(2),
        IRUT_GRAYSCALE_IMAGE: BigInt(4),
        IRUT_TRANSOFORMED_GRAYSCALE_IMAGE: BigInt(8),
        IRUT_ENHANCED_GRAYSCALE_IMAGE: BigInt(16),
        IRUT_PREDETECTED_REGIONS: BigInt(32),
        IRUT_BINARY_IMAGE: BigInt(64),
        IRUT_TEXTURE_DETECTION_RESULT: BigInt(128),
        IRUT_TEXTURE_REMOVED_GRAYSCALE_IMAGE: BigInt(256),
        IRUT_TEXTURE_REMOVED_BINARY_IMAGE: BigInt(512),
        IRUT_CONTOURS: BigInt(1024),
        IRUT_LINE_SEGMENTS: BigInt(2048),
        IRUT_TEXT_ZONES: BigInt(4096),
        IRUT_TEXT_REMOVED_BINARY_IMAGE: BigInt(8192),
        IRUT_CANDIDATE_BARCODE_ZONES: BigInt(16384),
        IRUT_LOCALIZED_BARCODES: BigInt(32768),
        IRUT_SCALED_UP_BARCODE_IMAGE: BigInt(65536),
        IRUT_DEFORMATION_RESISTED_BARCODE_IMAGE: BigInt(1 << 17),
        IRUT_COMPLEMENTED_BARCODE_IMAGE: BigInt(1 << 18),
        IRUT_DECODED_BARCODES: BigInt(1 << 19),
        IRUT_LONG_LINES: BigInt(1 << 20),
        IRUT_CORNERS: BigInt(1 << 21),
        IRUT_CANDIDATE_QUAD_EDGES: BigInt(1 << 22),
        IRUT_DETECTED_QUADS: BigInt(1 << 23),
        IRUT_LOCALIZED_TEXT_LINES: BigInt(1 << 24),
        IRUT_RECOGNIZED_TEXT_LINES: BigInt(1 << 25),
        IRUT_NORMALIZED_IMAGES: BigInt(1 << 26),
        IRUT_SHORT_LINES: BigInt(1 << 27),
        IRUT_RAW_TEXT_LINES: BigInt(1 << 28),
        IRUT_ALL: BigInt("0xFFFFFFFFFFFFFFFF")
    };

    function t(t, s) {
        for (let r of t)
            if (r.result) {
                if ([e.IRUT_BINARY_IMAGE, e.IRUT_COLOUR_IMAGE, e.IRUT_COMPLEMENTED_BARCODE_IMAGE, e.IRUT_ENHANCED_GRAYSCALE_IMAGE, e.IRUT_GRAYSCALE_IMAGE, e.IRUT_SCALED_DOWN_COLOUR_IMAGE, e.IRUT_SCALED_UP_BARCODE_IMAGE, e.IRUT_TEXTURE_REMOVED_BINARY_IMAGE, e.IRUT_TEXTURE_REMOVED_GRAYSCALE_IMAGE, e.IRUT_TEXT_REMOVED_BINARY_IMAGE, e.IRUT_TRANSOFORMED_GRAYSCALE_IMAGE].includes(BigInt(r.result.unitType))) {
                    let e = r.result.imageData.bytes;
                    e && (e = new Uint8Array(new Uint8Array(s.buffer, e.ptr, e.length)), r.result.imageData.bytes = e)
                } else if ([e.IRUT_DEFORMATION_RESISTED_BARCODE_IMAGE].includes(BigInt(r.result.unitType))) {
                    let e = r.result.deformationResistedBarcode.imageData.bytes;
                    e && (e = new Uint8Array(new Uint8Array(s.buffer, e.ptr, e.length)), r.result.deformationResistedBarcode.imageData.bytes = e)
                } else if ([e.IRUT_CONTOURS].includes(BigInt(r.result.unitType))) {
                    let e = r.result.contours,
                        t = r.result.contoursOffset;
                    if (e && t) {
                        e = new Uint8Array(new Uint8Array(s.buffer, e.ptr, e.length)), t = new Uint8Array(new Uint8Array(s.buffer, t.ptr, t.length));
                        const n = new DataView(e.buffer),
                            a = [];
                        for (let t = 0; t < e.length; t += 4) a.push(n.getInt32(t, !0));
                        const i = new DataView(t.buffer),
                            _ = [0];
                        for (let e = 0; e < t.length; e += 4) _.push(i.getInt32(e, !0));
                        const c = [];
                        for (let e = 0; e < _.length - 1; e++) {
                            const t = {
                                points: []
                            };
                            for (let s = _[e]; s < _[e + 1] - 1; s += 2) t.points.push({
                                x: a[s],
                                y: a[s + 1]
                            });
                            c.push(t)
                        }
                        r.result.contours = c, delete r.result.contoursOffset
                    }
                } else if ([e.IRUT_LINE_SEGMENTS].includes(BigInt(r.result.unitType))) {
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
                } else if ([e.IRUT_SHORT_LINES].includes(BigInt(r.result.unitType))) {
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
                } else if ([e.IRUT_CANDIDATE_QUAD_EDGES].includes(BigInt(r.result.unitType))) {
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
                } else if ([e.IRUT_CORNERS].includes(BigInt(r.result.unitType))) {
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
                } else if ([e.IRUT_NORMALIZED_IMAGES].includes(BigInt(r.result.unitType)))
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
    }
    async function s(e, t) {
        return await new Promise(((s, r) => {
            let n = new XMLHttpRequest;
            n.open("GET", e, !0), n.responseType = t, n.send(), n.onloadend = async () => {
                n.status < 200 || n.status >= 300 ? r(e + " " + n.status) : s(n.response)
            }, n.onerror = () => {
                r(new Error("Network Error: " + n.statusText))
            }
        }))
    }
    var r;
    ! function(e) {
        e[e.CRIT_ORIGINAL_IMAGE = 1] = "CRIT_ORIGINAL_IMAGE", e[e.CRIT_BARCODE = 2] = "CRIT_BARCODE", e[e.CRIT_TEXT_LINE = 4] = "CRIT_TEXT_LINE", e[e.CRIT_DETECTED_QUAD = 8] = "CRIT_DETECTED_QUAD", e[e.CRIT_NORMALIZED_IMAGE = 16] = "CRIT_NORMALIZED_IMAGE", e[e.CRIT_PARSED_RESULT = 32] = "CRIT_PARSED_RESULT"
    }(r || (r = {}));
    let n, a, i, _ = null,
        c = new Set;
    self.cvrWorkerVersion = "2.4.21";
    const o = async (e, t) => {
        ep();
        const s = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_ParseRequiredResources_1(e, es(t.templateName))));
        for (let e = 0; e < s.models.length; e++) await checkAndAutoLoadCaffeModel(s.models[e], engineResourcePaths.dlrData);
        for (let e = 0; e < s.specss.length; e++) await checkAndAutoLoadResourceBuffer(s.specss[e], engineResourcePaths.dcp + "specification/")
    };
    Object.assign(mapController, {
        cvr_createInstance: async (e, t) => {
            try {
                let e = wasmImports.emscripten_bind_CvrWasm_CvrWasm_0();
                engineResourcePaths.dbr && (n = await s(engineResourcePaths.dbr + "DBR-PresetTemplates.json", "text"), ep(), wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(e, es(n))), engineResourcePaths.dlr && (a = await s(engineResourcePaths.dlr + "DLR-PresetTemplates.json", "text"), ep(), log(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(e, es(a))))), engineResourcePaths.ddn && (i = await s(engineResourcePaths.ddn + "DDN-PresetTemplates.json", "text"), ep(), wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(e, es(i))), wasmImports.emscripten_bind_CvrWasm_InitParameter_0(e), ep();
                const r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_OutputSettings_1(e, es("*")));
                let _ = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CoreWasm_GetModuleVersion_0())).CVR;
                c.add(e), handleTaskRes(t, {
                    instanceID: e,
                    version: _,
                    outputSettings: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_initSettings: async (e, t, s) => {
            let r;
            try {
                const n = e.settings;
                ep(), r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_InitSettings_1(s, es(n))), handleTaskRes(t, {
                    success: !0,
                    response: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_setCrrRegistry: async (e, t, s) => {
            try {
                c.has(s) && (ep(), wasmImports.emscripten_bind_CvrWasm_SetCrrRegistry_1(s, es(e.receiver))), handleTaskRes(t, {
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
                const n = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_OutputSettings_1(s, es(e.templateName))));
                if (n && 0 !== n.errorCode) throw new Error(n.errorString);
                r = 1 === n.CaptureVisionTemplates[0].OutputOriginalImage, await o(s, e), handleTaskRes(t, {
                    success: !0,
                    isOutputOriginalImage: r
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
        cvr_getIntermediateResult: (e, s, r) => {
            let n = {};
            try {
                n = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_GetIntermediateResult_0(r)), ((e, t) => ["format", "possibleFormats", "unitType"].includes(e) && BigInt(t) > Number.MAX_SAFE_INTEGER ? BigInt(t) : t)), n && t(n, HEAP8)
            } catch (e) {
                handleTaskErr(s, e)
            }
            handleTaskRes(s, {
                success: !0,
                result: n
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
        cvr_capture: async (e, s, n) => {
            let a, i, c;
            console.log('checkAndReauth!!!!!!!!!')
            await checkAndReauth(),
            log(`time worker get msg: ${Date.now()}`);
            try {
                let s = Date.now();
                await o(n, e), log("appendResourceTime: " + (Date.now() - s)), _ && (wasmImports.emscripten_bind_Destory_CImageData(_), _ = null), _ = wasmImports.emscripten_bind_Create_CImageData(e.bytes.length, setBufferIntoWasm(e.bytes, 0), e.width, e.height, e.stride, e.format, 0);
                let l = Date.now();
                log(`start worker capture: ${l}`), ep(), i = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_Capture_3(n, _, es(e.templateName), e.isScanner));
                // TODO: WASM 中校验并返回处理结果： wasmImports.emscripten_bind_CvrWasm_Capture_3
                console.warn('WASM 中校验并返回处理结果:', i)
                let m = Date.now();
                log("worker time: " + (m - l)), log(`end worker capture: ${m}`), i = JSON.parse(i, ((e, t) => "format" === e && BigInt(t) > Number.MAX_SAFE_INTEGER ? BigInt(t) : t));
                let p = Date.now();
                log("capture result parsed: " + (p - m));
                for (let e = 0; e < i.items.length; e++)[r.CRIT_NORMALIZED_IMAGE].includes(i.items[e].type) && (c = i.items[e].imageData.bytes, c = new Uint8Array(new Uint8Array(HEAP8.buffer, c.ptr, c.length)), i.items[e].imageData.bytes = c);
                let I = Date.now();
                log("result new Uint8Array: " + (I - p)), a = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_GetIntermediateResult_0(n)), ((e, t) => ["format", "possibleFormats", "unitType"].includes(e) && BigInt(t) > Number.MAX_SAFE_INTEGER ? BigInt(t) : t)), a && t(a, HEAP8), i.intermediateResult = a;
                let T = Date.now();
                log("get intermediate result: " + (T - I)), log("after capture handle time: " + (Date.now() - m))
            } catch (e) {
                return console.log(e), void handleTaskErr(s, e)
            }
            const l = Date.now();
            log(`time worker return msg: ${l}`), postMessage({
                type: "task",
                id: s,
                body: {
                    success: !0,
                    bytes: e.bytes,
                    captureResult: i,
                    workerReturnMsgTime: l
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
        cvr_updateSettings: async (e, t, s) => {
            let r, n = !1;
            try {
                let a = e.settings,
                    i = e.templateName;
                "object" == typeof a && a.hasOwnProperty("barcodeSettings") && (a.barcodeSettings.barcodeFormatIds = a.barcodeSettings.barcodeFormatIds.toString()), ep(), r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_UpdateSettings_2(s, es(i), es(JSON.stringify(a)))), ep();
                const _ = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_OutputSettings_1(s, es(i))));
                _.errorCode || (n = 1 === _.CaptureVisionTemplates[0].OutputOriginalImage), handleTaskRes(t, {
                    success: !0,
                    response: r,
                    isOutputOriginalImage: n
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_resetSettings: async (e, t, s) => {
            let r;
            try {
                wasmImports.emscripten_bind_CvrWasm_ResetSettings_0(s), ep(), n && wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(s, es(n)), ep(), a && wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(s, es(a)), ep(), i && wasmImports.emscripten_bind_CvrWasm_AppendParameterContent_1(s, es(i)), ep(), r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_InitParameter_0(s)), handleTaskRes(t, {
                    success: !0,
                    response: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_getMaxBufferedItems: async (e, t, s) => {
            let r;
            try {
                r = wasmImports.emscripten_bind_CvrWasm_GetMaxBufferedItems_0(s), handleTaskRes(t, {
                    success: !0,
                    count: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_setMaxBufferedItems: async (e, t, s) => {
            let r;
            try {
                r = wasmImports.emscripten_bind_CvrWasm_SetMaxBufferedItems_1(s, e.count), handleTaskRes(t, {
                    success: !0
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_getBufferedCharacterItemSet: async (e, t, s) => {
            let r;
            try {
                r = JSON.parse(UTF8ToString(wasmImports.emscripten_bind_CvrWasm_GetBufferedCharacterItemSet_0(s)));
                for (let e of r.items) {
                    let t = e.image.bytes;
                    t && (t = new Uint8Array(new Uint8Array(HEAP8.buffer, t.ptr, t.length)), e.image.bytes = t)
                }
                for (let e of r.characterClusters) {
                    let t = e.mean.image.bytes;
                    t && (t = new Uint8Array(new Uint8Array(HEAP8.buffer, t.ptr, t.length)), e.mean.image.bytes = t)
                }
                handleTaskRes(t, {
                    success: !0,
                    itemSet: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_setIrrRegistry: async (e, t, s) => {
            try {
                if (c.has(s)) {
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
                c.delete(s), wasmImports.emscripten_bind_Destory_CImageData(_), _ = null, wasmImports.emscripten_bind_CvrWasm___destroy___0(s), handleTaskRes(t, {
                    success: !0
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        },
        cvr_getWasmFilterState: async (e, t, s) => {
            let r;
            try {
                r = UTF8ToString(wasmImports.emscripten_bind_CvrWasm_GetFilterState_0(s)), handleTaskRes(t, {
                    success: !0,
                    response: r
                })
            } catch (e) {
                handleTaskErr(t, e)
            }
        }
    })
}();
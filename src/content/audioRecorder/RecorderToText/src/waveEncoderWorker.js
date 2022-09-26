
let recLength = 0
let recBuffers = []
let sampleRate = undefined
let numChannels = undefined

self.onmessage = function (e) {
    switch (e.data.command) {
        case 'init':
            init(e.data.config);
            break;
        case 'record':
            record(e.data.buffer);
            break;
        case 'exportWAV':
            exportWAV(e.data.type, e.data.rate);
            break;
        case 'getBuffer':
            getBuffer();
            break;
        case 'clear':
            clear();
            break;
    }
}

function init(config) {
    sampleRate = config.sampleRate;
    numChannels = config.numChannels;
    initBuffers();
}

function record(inputBuffer) {
    for (var channel = 0; channel < numChannels; channel++) {
        recBuffers[channel].push(inputBuffer[channel]);
    }
    recLength += inputBuffer[0].length;
}

/**
 * 下采样缓冲区
 * @param buffer
 * @param rate
 * @returns {Float32Array|*}
 */
function downsampleBuffer(buffer, rate) {
    if (rate === sampleRate) {
        return buffer;
    }
    if (rate > sampleRate) {
        throw "downsampling rate show be smaller than original sample rate";
    }
    var sampleRateRatio = sampleRate / rate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        var accum = 0, count = 0;
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }
        result[offsetResult] = accum / count;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }

    return result;
}

/**
 * 导出时的处理
 * @param type
 * @param rate
 */
function exportWAV(type, rate) {
    var buffers = [];
    for (var channel = 0; channel < numChannels; channel++) {
        // TODO: recBuffers: onaudioprocess 触发时返回的recorder buffer数据
        // TODO: recLength: onaudioprocess 触发时返回的recorder buffer数据的length总数
        buffers.push(mergeBuffers(recBuffers[channel], recLength));
    }
    var interleaved = undefined;
    var downsampledBuffer
    if (numChannels === 2) {
        interleaved = interleave(buffers[0], buffers[1]);
        downsampledBuffer = downsampleBuffer(interleaved, rate);
    } else {
        interleaved = buffers[0];
        downsampledBuffer = downsampleBuffer(interleaved, rate);
    }

    console.warn('获取的下采样buffer数据:', downsampledBuffer)
    var dataview = encodeWAV(rate, downsampledBuffer);


    console.warn('dataview:', dataview)
    var audioBlob = new Blob([dataview], {type: type});
    console.warn('audioBlob:', audioBlob)
    self.postMessage({command: 'exportWAV', data: audioBlob});
}

function getBuffer() {
    var buffers = [];
    for (var channel = 0; channel < numChannels; channel++) {
        buffers.push(mergeBuffers(recBuffers[channel], recLength));
    }
    self.postMessage({
        command: 'getBuffer',
        data: buffers
    });
}

function clear() {
    recLength = 0;
    recBuffers = [];
    initBuffers();
}

function initBuffers() {
    for (var channel = 0; channel < numChannels; channel++) {
        recBuffers[channel] = [];
    }
}

function mergeBuffers(recBuffers, recLength) {
    var result = new Float32Array(recLength);
    var offset = 0;
    for (var i = 0; i < recBuffers.length; i++) {
        result.set(recBuffers[i], offset);
        offset += recBuffers[i].length;
    }
    return result;
}

function interleave(inputL, inputR) {
    var length = inputL.length + inputR.length;
    var result = new Float32Array(length);

    var index = 0
        , inputIndex = 0;

    while (index < length) {
        result[index++] = inputL[inputIndex];
        result[index++] = inputR[inputIndex];
        inputIndex++;
    }
    return result;
}

function floatTo16BitPCM(output, offset, input) {
    for (var i = 0; i < input.length; i++,
        offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}

function writeString(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * 编码Wave
 * @param rate
 * @param samples
 * @returns {DataView}
 */
function encodeWAV(rate, samples) {
    var buffer = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buffer);
    sampleRate = rate;
    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);

    return view;
}

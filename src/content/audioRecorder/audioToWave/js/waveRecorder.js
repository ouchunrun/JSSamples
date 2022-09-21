
function Recorder(source, config) {
    var _this = this;
    if (!(this instanceof Recorder)) {
        throw new TypeError("Cannot call a class as a function");
    }

    this.config = Object.assign({
        originalSampleRate: undefined,
        desiredSampleRate: 8000,
        bufferLength: 4096,
        numChannels: 2,
        mimeType: 'audio/wav'
    }, config)

    this.recording = false;
    this.callbacks = {
        getBuffer: [],
        exportWAV: []
    };

    this.context = source.context;
    this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(
        this.context,
        this.config.bufferLength,
        this.config.numChannels,
        this.config.numChannels
    );

    this.node.onaudioprocess = function (e) {
        if (!_this.recording){
            return
        }

        var buffer = [];
        for (var channel = 0; channel < _this.config.numChannels; channel++) {
            buffer.push(e.inputBuffer.getChannelData(channel));
        }
        _this.worker.postMessage({command: 'record', buffer: buffer});
    }

    source.connect(this.node);
    this.node.connect(this.context.destination);
    //this should not be necessary

    this.worker = new Worker('./js/waveEncoderWorker.js')
    this.worker.postMessage({
        command: 'init',
        config: this.config
    });

    this.worker.onmessage = function (e) {
        var cb = _this.callbacks[e.data.command].pop();
        if (typeof cb == 'function') {
            cb(e.data.data);
        }
    }
    ;
}

Recorder.prototype.record = function (){
    this.recording = true
}

Recorder.prototype.stop = function (){
    this.recording = false
}

Recorder.prototype.clear = function (){
    this.worker.postMessage({
        command: 'clear'
    });
}

Recorder.prototype.getBuffer = function (cb){
    console.warn('getBuffer')
    cb = cb || this.config.callback;
    if (!cb)
        throw new Error('Callback not set');

    this.callbacks.getBuffer.push(cb);

    this.worker.postMessage({
        command: 'getBuffer'
    });
}

Recorder.prototype.exportWAV = function (cb){
    cb = cb || this.config.callback;
    if (!cb) {
        throw new Error('Callback not set');
    }

    console.log('add export wav callback')
    this.callbacks.exportWAV.push(cb);

    this.worker.postMessage({
        command: 'exportWAV',
    });
}

Recorder.prototype.forceDownload = function (blob, filename){
    console.warn('forceDownload blob:', blob)
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename || 'output.wav';
    var click = document.createEvent("Event");
    click.initEvent("click", true, true);
    link.dispatchEvent(click);
}

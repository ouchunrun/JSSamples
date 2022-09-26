var _createClass = (function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor)
                    descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps)
                defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
                defineProperties(Constructor, staticProps);
            return Constructor;
        }
            ;
    }
)();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

// var Recorder = exports.Recorder = (function () {
        function Recorder(source, cfg) {
            console.warn('Recorder mediaStreamSource:', source)
            console.warn('cfg:', cfg)
            var _this = this;

            _classCallCheck(this, Recorder);

            this.config = {
                bufferLen: 4096,   // 用于捕获音频的缓冲区的长度。默认为4096.
                numChannels: 2,
                mimeType: 'audio/wav'
            };
            this.recording = false;
            this.callbacks = {
                getBuffer: [],
                exportWAV: []
            };

            Object.assign(this.config, cfg);
            this.context = source.context;
            this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(this.context, this.config.bufferLen, this.config.numChannels, this.config.numChannels);

            this.node.onaudioprocess = function (e) {
                if (!_this.recording)
                    return;

                // chrou: 相同的处理
                var buffer = [];
                for (var channel = 0; channel < _this.config.numChannels; channel++) {
                    buffer.push(e.inputBuffer.getChannelData(channel));
                }
                console.warn('onaudioprocess buffer：', buffer)
                _this.worker.postMessage({command: 'record', buffer: buffer});
            }
            ;

            source.connect(this.node);
            this.node.connect(this.context.destination);
            //this should not be necessary

            this.worker = new Worker('../src/waveEncoderWorker.js')
            this.worker.postMessage({
                command: 'init',
                config: {
                    sampleRate: this.context.sampleRate,
                    numChannels: this.config.numChannels
                }
            });

            this.worker.onmessage = function (e) {
                var cb = _this.callbacks[e.data.command].pop();
                if (typeof cb == 'function') {
                    cb(e.data.data);
                }
            }
            ;
        }

        _createClass(Recorder, [{
            key: 'record',
            value: function record() {
                this.recording = true;
                console.warn('设置 recording 为 true')
            }
        }, {
            key: 'stop',
            value: function stop() {
                this.recording = false;
                console.warn('设置 recording 为 false')
            }
        }, {
            key: 'clear',
            value: function clear() {
                console.warn('clear')
                this.worker.postMessage({
                    command: 'clear'
                });
            }
        }, {
            key: 'getBuffer',
            value: function getBuffer(cb) {
                console.warn('getBuffer')
                cb = cb || this.config.callback;
                if (!cb)
                    throw new Error('Callback not set');

                this.callbacks.getBuffer.push(cb);

                this.worker.postMessage({
                    command: 'getBuffer'
                });
            }
        }, {
            key: 'exportWAV',
            value: function exportWAV(cb, mimeType, rate) {
                console.warn('export WAV：', `mimeType ${mimeType}, rate ${rate}`)
                // value: function exportWAV(cb, mimeType, rate) {
                mimeType = mimeType || this.config.mimeType;
                cb = cb || this.config.callback;
                if (!cb){
                    throw new Error('Callback not set');
                }

                console.log('设置exportWAV回调。。。。')
                this.callbacks.exportWAV.push(cb);

                this.worker.postMessage({
                    command: 'exportWAV',
                    type: mimeType,
                    rate: rate,
                });
            }
        }], [{
            key: 'forceDownload',
            value: function forceDownload(blob, filename) {
                console.warn('forceDownload blob:', blob)
                var url = (window.URL || window.webkitURL).createObjectURL(blob);
                var link = window.document.createElement('a');
                link.href = url;
                link.download = filename || 'output.wav';
                var click = document.createEvent("Event");
                click.initEvent("click", true, true);
                link.dispatchEvent(click);
            }
        }]);

//         return Recorder;
//     }
// )();

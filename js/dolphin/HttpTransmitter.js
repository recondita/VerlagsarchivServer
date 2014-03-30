define(["require", "exports", "../../js/dolphin/Codec"], function(require, exports, __cod__) {
    
    
    
    var cod = __cod__;

    (function (dolphin) {
        var HttpTransmitter = (function () {
            function HttpTransmitter(url, reset) {
                if (typeof reset === "undefined") { reset = true; }
                this.url = url;
                this.http = new XMLHttpRequest();

                //            this.http.withCredentials = true; // not supported in all browsers
                this.codec = new cod.dolphin.Codec();
                if (reset) {
                    this.invalidate();
                }
            }
            HttpTransmitter.prototype.transmit = function (commands, onDone) {
                var _this = this;
                this.http.onerror = function (evt) {
                    alert("could not fetch " + _this.url + ", message: " + evt.message);
                    onDone([]);
                };

                this.http.onloadend = function (evt) {
                    var responseText = _this.http.responseText;
                    var responseCommands = _this.codec.decode(responseText);
                    onDone(responseCommands);
                };

                this.http.open('POST', this.url, true);
                this.http.send(this.codec.encode(commands));
            };

            HttpTransmitter.prototype.signal = function (command) {
                var sig = new XMLHttpRequest();
                sig.open('POST', this.url, true);
                sig.send(this.codec.encode([command]));
            };

            HttpTransmitter.prototype.invalidate = function () {
                this.http.open('POST', this.url + 'invalidate?', false);
                this.http.send();
            };
            return HttpTransmitter;
        })();
        dolphin.HttpTransmitter = HttpTransmitter;
    })(exports.dolphin || (exports.dolphin = {}));
    var dolphin = exports.dolphin;
});
//# sourceMappingURL=HttpTransmitter.js.map

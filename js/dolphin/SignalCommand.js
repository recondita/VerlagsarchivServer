var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../js/dolphin/Command"], function(require, exports, __cmd__) {
    var cmd = __cmd__;
    (function (dolphin) {
        var SignalCommand = (function (_super) {
            __extends(SignalCommand, _super);
            function SignalCommand(name) {
                _super.call(this);
                this.id = name;
                this.className = "org.opendolphin.core.comm.SignalCommand";
            }
            return SignalCommand;
        })(cmd.dolphin.Command);
        dolphin.SignalCommand = SignalCommand;
    })(exports.dolphin || (exports.dolphin = {}));
    var dolphin = exports.dolphin;
});
//# sourceMappingURL=SignalCommand.js.map

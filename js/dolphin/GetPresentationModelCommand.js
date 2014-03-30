var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../js/dolphin/Command"], function(require, exports, __cmd__) {
    var cmd = __cmd__;
    (function (dolphin) {
        var GetPresentationModelCommand = (function (_super) {
            __extends(GetPresentationModelCommand, _super);
            function GetPresentationModelCommand(pmId) {
                _super.call(this);
                this.pmId = pmId;
                this.id = 'GetPresentationModel';
                this.className = "org.opendolphin.core.comm.GetPresentationModelCommand";
            }
            return GetPresentationModelCommand;
        })(cmd.dolphin.Command);
        dolphin.GetPresentationModelCommand = GetPresentationModelCommand;
    })(exports.dolphin || (exports.dolphin = {}));
    var dolphin = exports.dolphin;
});
//# sourceMappingURL=GetPresentationModelCommand.js.map

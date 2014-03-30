var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../../js/dolphin/Command"], function(require, exports, __cmd__) {
    var cmd = __cmd__;
    (function (dolphin) {
        var DataCommand = (function (_super) {
            __extends(DataCommand, _super);
            function DataCommand(data) {
                _super.call(this);
                this.data = data;
                this.id = "Data";
                this.className = "org.opendolphin.core.comm.DataCommand";
            }
            return DataCommand;
        })(cmd.dolphin.Command);
        dolphin.DataCommand = DataCommand;
    })(exports.dolphin || (exports.dolphin = {}));
    var dolphin = exports.dolphin;
});
//# sourceMappingURL=DataCommand.js.map

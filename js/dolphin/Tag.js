define(["require", "exports"], function(require, exports) {
    (function (dolphin) {
        var Tag = (function () {
            function Tag() {
            }
            Tag.value = function () {
                return "VALUE";
            };

            Tag.label = function () {
                return "LABEL";
            };

            Tag.tooltip = function () {
                return "TOOLTIP";
            };

            Tag.mandatory = function () {
                return "MANDATORY";
            };

            Tag.visible = function () {
                return "VISIBLE";
            };

            Tag.enabled = function () {
                return "ENABLED";
            };

            Tag.regex = function () {
                return "REGEX";
            };

            Tag.widgetHint = function () {
                return "WIDGET_HINT";
            };

            Tag.valueType = function () {
                return "VALUE_TYPE";
            };
            return Tag;
        })();
        dolphin.Tag = Tag;
    })(exports.dolphin || (exports.dolphin = {}));
    var dolphin = exports.dolphin;
});
//# sourceMappingURL=Tag.js.map

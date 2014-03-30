define(["require", "exports", "../../js/dolphin/EventBus", "../../js/dolphin/Tag"], function(require, exports, __bus__, __tags__) {
    
    var bus = __bus__;
    var tags = __tags__;

    (function (dolphin) {
        var ClientAttribute = (function () {
            function ClientAttribute(propertyName, qualifier, value, tag) {
                if (typeof tag === "undefined") { tag = tags.dolphin.Tag.value(); }
                this.propertyName = propertyName;
                this.tag = tag;
                this.dirty = false;
                this.id = ClientAttribute.clientAttributeInstanceCount++;
                this.valueChangeBus = new bus.dolphin.EventBus();
                this.qualifierChangeBus = new bus.dolphin.EventBus();
                this.dirtyValueChangeBus = new bus.dolphin.EventBus();
                this.baseValueChangeBus = new bus.dolphin.EventBus();
                this.setValue(value);
                this.setBaseValue(value);
                this.setQualifier(qualifier);
            }
            /** a copy constructor with new id and no presentation model */
            ClientAttribute.prototype.copy = function () {
                var result = new ClientAttribute(this.propertyName, this.getQualifier(), this.getValue(), this.tag);
                result.setBaseValue(this.getBaseValue());
                return result;
            };

            ClientAttribute.prototype.isDirty = function () {
                return this.dirty;
            };

            ClientAttribute.prototype.getBaseValue = function () {
                return this.baseValue;
            };

            ClientAttribute.prototype.setPresentationModel = function (presentationModel) {
                if (this.presentationModel) {
                    alert("You can not set a presentation model for an attribute that is already bound.");
                }
                this.presentationModel = presentationModel;
            };

            ClientAttribute.prototype.getPresentationModel = function () {
                return this.presentationModel;
            };

            ClientAttribute.prototype.getValue = function () {
                return this.value;
            };

            ClientAttribute.prototype.setValue = function (newValue) {
                var verifiedValue = ClientAttribute.checkValue(newValue);
                if (this.value == verifiedValue)
                    return;
                var oldValue = this.value;
                this.value = verifiedValue;
                this.setDirty(this.calculateDirty(this.baseValue, verifiedValue));
                this.valueChangeBus.trigger({ 'oldValue': oldValue, 'newValue': verifiedValue });
            };

            ClientAttribute.prototype.calculateDirty = function (baseValue, value) {
                if (baseValue == null) {
                    return value != null;
                } else {
                    return baseValue != value;
                }
            };

            ClientAttribute.prototype.updateDirty = function () {
                this.setDirty(this.calculateDirty(this.baseValue, this.value));
            };

            ClientAttribute.prototype.setDirty = function (dirty) {
                var oldVal = this.dirty;
                this.dirty = dirty;
                this.dirtyValueChangeBus.trigger({ 'oldValue': oldVal, 'newValue': this.dirty });
                if (this.presentationModel)
                    this.presentationModel.updateDirty();
            };

            ClientAttribute.prototype.setQualifier = function (newQualifier) {
                if (this.qualifier == newQualifier)
                    return;
                var oldQualifier = this.qualifier;
                this.qualifier = newQualifier;
                this.qualifierChangeBus.trigger({ 'oldValue': oldQualifier, 'newValue': newQualifier });
            };

            ClientAttribute.prototype.getQualifier = function () {
                return this.qualifier;
            };

            ClientAttribute.prototype.setBaseValue = function (baseValue) {
                if (this.baseValue == baseValue)
                    return;
                var oldBaseValue = this.baseValue;
                this.baseValue = baseValue;
                this.setDirty(this.calculateDirty(baseValue, this.value));
                this.baseValueChangeBus.trigger({ 'oldValue': oldBaseValue, 'newValue': baseValue });
            };

            ClientAttribute.prototype.rebase = function () {
                this.setBaseValue(this.value);
            };

            ClientAttribute.prototype.reset = function () {
                this.setValue(this.baseValue);
                this.setDirty(false);
            };

            ClientAttribute.checkValue = function (value) {
                if (value == null || value == undefined) {
                    return null;
                }
                var result = value;
                if (result instanceof String || result instanceof Boolean || result instanceof Number) {
                    result = value.valueOf();
                }
                if (result instanceof ClientAttribute) {
                    console.log("An Attribute may not itself contain an attribute as a value. Assuming you forgot to call value.");
                    result = this.checkValue((value).value);
                }
                var ok = false;
                if (this.SUPPORTED_VALUE_TYPES.indexOf(typeof result) > -1 || result instanceof Date) {
                    ok = true;
                }
                if (!ok) {
                    throw new Error("Attribute values of this type are not allowed: " + typeof value);
                }
                return result;
            };

            ClientAttribute.prototype.onValueChange = function (eventHandler) {
                this.valueChangeBus.onEvent(eventHandler);
                eventHandler({ "oldValue": this.value, "newValue": this.value });
            };

            ClientAttribute.prototype.onQualifierChange = function (eventHandler) {
                this.qualifierChangeBus.onEvent(eventHandler);
            };

            ClientAttribute.prototype.onDirty = function (eventHandler) {
                this.dirtyValueChangeBus.onEvent(eventHandler);
            };

            ClientAttribute.prototype.onBaseValueChange = function (eventHandler) {
                this.baseValueChangeBus.onEvent(eventHandler);
            };

            ClientAttribute.prototype.syncWith = function (sourceAttribute) {
                if (sourceAttribute) {
                    this.setQualifier(sourceAttribute.getQualifier());
                    this.setBaseValue(sourceAttribute.getBaseValue());
                    this.setValue(sourceAttribute.value);
                    // syncing propertyName and tag is not needed since they must be identical anyway
                }
            };
            ClientAttribute.SUPPORTED_VALUE_TYPES = ["string", "number", "boolean"];
            ClientAttribute.clientAttributeInstanceCount = 0;
            return ClientAttribute;
        })();
        dolphin.ClientAttribute = ClientAttribute;
    })(exports.dolphin || (exports.dolphin = {}));
    var dolphin = exports.dolphin;
});
//# sourceMappingURL=ClientAttribute.js.map

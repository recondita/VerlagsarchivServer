define(["require", "exports", "../../js/dolphin/EventBus", "../../js/dolphin/Tag"], function(require, exports, __bus__, __tags__) {
    
    var bus = __bus__;
    var tags = __tags__;

    (function (dolphin) {
        var presentationModelInstanceCount = 0;

        var ClientPresentationModel = (function () {
            function ClientPresentationModel(id, presentationModelType) {
                this.id = id;
                this.presentationModelType = presentationModelType;
                this.attributes = [];
                this.clientSideOnly = false;
                this.dirty = false;
                if (typeof id !== 'undefined' && id != null) {
                    this.id = id;
                } else {
                    this.id = (presentationModelInstanceCount++).toString();
                }
                this.invalidBus = new bus.dolphin.EventBus();
                this.dirtyValueChangeBus = new bus.dolphin.EventBus();
            }
            /** a copy constructor for anything but IDs. Per default, copies are client side only, no automatic update applies. */
            ClientPresentationModel.prototype.copy = function () {
                var result = new ClientPresentationModel(null, this.presentationModelType);
                result.clientSideOnly = true;
                this.getAttributes().forEach(function (attribute) {
                    var attributeCopy = attribute.copy();
                    result.addAttribute(attributeCopy);
                });
                return result;
            };

            //add array of attributes
            ClientPresentationModel.prototype.addAttributes = function (attributes) {
                var _this = this;
                if (!attributes || attributes.length < 1)
                    return;
                attributes.forEach(function (attr) {
                    _this.addAttribute(attr);
                });
            };
            ClientPresentationModel.prototype.addAttribute = function (attribute) {
                var _this = this;
                if (!attribute || (this.attributes.indexOf(attribute) > -1)) {
                    return;
                }
                if (this.findAttributeByPropertyNameAndTag(attribute.propertyName, attribute.tag)) {
                    throw new Error("There already is an attribute with property name: " + attribute.propertyName + " and tag: " + attribute.tag + " in presentation model with id: " + this.id);
                }
                if (attribute.getQualifier() && this.findAttributeByQualifier(attribute.getQualifier())) {
                    throw new Error("There already is an attribute with qualifier: " + attribute.getQualifier() + " in presentation model with id: " + this.id);
                }
                attribute.setPresentationModel(this);
                this.attributes.push(attribute);
                if (attribute.tag == tags.dolphin.Tag.value()) {
                    this.updateDirty();
                }
                attribute.onValueChange(function (evt) {
                    _this.invalidBus.trigger({ source: _this });
                });
            };

            ClientPresentationModel.prototype.updateDirty = function () {
                for (var i = 0; i < this.attributes.length; i++) {
                    if (this.attributes[i].isDirty()) {
                        this.setDirty(true);
                        return;
                    }
                }
                ;
                this.setDirty(false);
            };

            ClientPresentationModel.prototype.updateAttributeDirtyness = function () {
                for (var i = 0; i < this.attributes.length; i++) {
                    this.attributes[i].updateDirty();
                }
            };
            ClientPresentationModel.prototype.isDirty = function () {
                return this.dirty;
            };

            ClientPresentationModel.prototype.setDirty = function (dirty) {
                var oldVal = this.dirty;
                this.dirty = dirty;
                this.dirtyValueChangeBus.trigger({ 'oldValue': oldVal, 'newValue': this.dirty });
            };

            ClientPresentationModel.prototype.reset = function () {
                this.attributes.forEach(function (attribute) {
                    attribute.reset();
                });
            };

            ClientPresentationModel.prototype.rebase = function () {
                this.attributes.forEach(function (attribute) {
                    attribute.rebase();
                });
            };

            ClientPresentationModel.prototype.onDirty = function (eventHandler) {
                this.dirtyValueChangeBus.onEvent(eventHandler);
            };
            ClientPresentationModel.prototype.onInvalidated = function (handleInvalidate) {
                this.invalidBus.onEvent(handleInvalidate);
            };

            /** returns a copy of the internal state */
            ClientPresentationModel.prototype.getAttributes = function () {
                return this.attributes.slice(0);
            };
            ClientPresentationModel.prototype.getAt = function (propertyName, tag) {
                if (typeof tag === "undefined") { tag = tags.dolphin.Tag.value(); }
                return this.findAttributeByPropertyNameAndTag(propertyName, tag);
            };

            ClientPresentationModel.prototype.findAttributeByPropertyName = function (propertyName) {
                return this.findAttributeByPropertyNameAndTag(propertyName, tags.dolphin.Tag.value());
            };

            ClientPresentationModel.prototype.findAllAttributesByPropertyName = function (propertyName) {
                var result = [];
                if (!propertyName)
                    return null;
                this.attributes.forEach(function (attribute) {
                    if (attribute.propertyName == propertyName) {
                        result.push(attribute);
                    }
                });
                return result;
            };

            ClientPresentationModel.prototype.findAttributeByPropertyNameAndTag = function (propertyName, tag) {
                if (!propertyName || !tag)
                    return null;
                for (var i = 0; i < this.attributes.length; i++) {
                    if ((this.attributes[i].propertyName == propertyName) && (this.attributes[i].tag == tag)) {
                        return this.attributes[i];
                    }
                }
                return null;
            };
            ClientPresentationModel.prototype.findAttributeByQualifier = function (qualifier) {
                if (!qualifier)
                    return null;
                for (var i = 0; i < this.attributes.length; i++) {
                    if (this.attributes[i].getQualifier() == qualifier) {
                        return this.attributes[i];
                    }
                }
                ;
                return null;
            };

            ClientPresentationModel.prototype.findAttributeById = function (id) {
                if (!id)
                    return null;
                for (var i = 0; i < this.attributes.length; i++) {
                    if (this.attributes[i].id == id) {
                        return this.attributes[i];
                    }
                }
                ;
                return null;
            };

            ClientPresentationModel.prototype.syncWith = function (sourcePresentationModel) {
                this.attributes.forEach(function (targetAttribute) {
                    var sourceAttribute = sourcePresentationModel.getAt(targetAttribute.propertyName, targetAttribute.tag);
                    if (sourceAttribute) {
                        targetAttribute.syncWith(sourceAttribute);
                    }
                });
            };
            return ClientPresentationModel;
        })();
        dolphin.ClientPresentationModel = ClientPresentationModel;
    })(exports.dolphin || (exports.dolphin = {}));
    var dolphin = exports.dolphin;
});
//# sourceMappingURL=ClientPresentationModel.js.map

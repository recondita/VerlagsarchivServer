define(["require", "exports", "../../js/dolphin/CreatePresentationModelCommand", "../../js/dolphin/ValueChangedCommand", "../../js/dolphin/ChangeAttributeMetadataCommand", "../../js/dolphin/Attribute", "../../js/dolphin/Map", "../../js/dolphin/DeletedAllPresentationModelsOfTypeNotification", "../../js/dolphin/EventBus", "../../js/dolphin/DeletedPresentationModelNotification", "../../js/dolphin/BaseValueChangedCommand"], function(require, exports, __createPMCmd__, __valueChangedCmd__, __changeAttMD__, __attr__, __map__, __dpmoftn__, __bus__, __dpmn__, __bvcc__) {
    
    
    
    var createPMCmd = __createPMCmd__;
    
    var valueChangedCmd = __valueChangedCmd__;
    var changeAttMD = __changeAttMD__;
    var attr = __attr__;
    var map = __map__;
    var dpmoftn = __dpmoftn__;
    var bus = __bus__;
    
    var dpmn = __dpmn__;
    var bvcc = __bvcc__;

    (function (dolphin) {
        (function (Type) {
            Type[Type["ADDED"] = 'ADDED'] = "ADDED";
            Type[Type["REMOVED"] = 'REMOVED'] = "REMOVED";
        })(dolphin.Type || (dolphin.Type = {}));
        var Type = dolphin.Type;

        var ClientModelStore = (function () {
            function ClientModelStore(clientDolphin) {
                this.clientDolphin = clientDolphin;
                this.presentationModels = new map.dolphin.Map();
                this.presentationModelsPerType = new map.dolphin.Map();
                this.attributesPerId = new map.dolphin.Map();
                this.attributesPerQualifier = new map.dolphin.Map();
                this.modelStoreChangeBus = new bus.dolphin.EventBus();
            }
            ClientModelStore.prototype.getClientDolphin = function () {
                return this.clientDolphin;
            };

            ClientModelStore.prototype.registerModel = function (model) {
                var _this = this;
                if (model.clientSideOnly) {
                    return;
                }
                var connector = this.clientDolphin.getClientConnector();
                var createPMCommand = new createPMCmd.dolphin.CreatePresentationModelCommand(model);
                connector.send(createPMCommand, null);
                model.getAttributes().forEach(function (attribute) {
                    _this.registerAttribute(attribute);
                });
            };

            ClientModelStore.prototype.registerAttribute = function (attribute) {
                var _this = this;
                this.addAttributeById(attribute);
                if (attribute.getQualifier()) {
                    this.addAttributeByQualifier(attribute);
                }

                // whenever an attribute changes its value, the server needs to be notified
                // and all other attributes with the same qualifier are given the same value
                attribute.onValueChange(function (evt) {
                    var valueChangeCommand = new valueChangedCmd.dolphin.ValueChangedCommand(attribute.id, evt.oldValue, evt.newValue);
                    _this.clientDolphin.getClientConnector().send(valueChangeCommand, null);

                    if (attribute.getQualifier()) {
                        var attrs = _this.findAttributesByFilter(function (attr) {
                            return attr !== attribute && attr.getQualifier() == attribute.getQualifier();
                        });
                        attrs.forEach(function (attr) {
                            attr.setValue(attribute.getValue());
                        });
                    }
                });

                // all attributes with the same qualifier should have the same base value
                attribute.onBaseValueChange(function (evt) {
                    var baseValueChangeCommand = new bvcc.dolphin.BaseValueChangedCommand(attribute.id);
                    _this.clientDolphin.getClientConnector().send(baseValueChangeCommand, null);
                    if (attribute.getQualifier()) {
                        var attrs = _this.findAttributesByFilter(function (attr) {
                            return attr !== attribute && attr.getQualifier() == attribute.getQualifier();
                        });
                        attrs.forEach(function (attr) {
                            attr.setBaseValue(attribute.getBaseValue());
                        });
                    }
                });

                attribute.onQualifierChange(function (evt) {
                    var changeAttrMetadataCmd = new changeAttMD.dolphin.ChangeAttributeMetadataCommand(attribute.id, attr.dolphin.Attribute.QUALIFIER_PROPERTY, evt.newValue);
                    _this.clientDolphin.getClientConnector().send(changeAttrMetadataCmd, null);
                });
            };
            ClientModelStore.prototype.add = function (model) {
                if (!model) {
                    return false;
                }
                if (this.presentationModels.containsKey(model.id)) {
                    console.log("There already is a PM with id " + model.id);
                }
                var added = false;
                if (!this.presentationModels.containsValue(model)) {
                    this.presentationModels.put(model.id, model);
                    this.addPresentationModelByType(model);
                    this.registerModel(model);

                    this.modelStoreChangeBus.trigger({ 'eventType': Type.ADDED, 'clientPresentationModel': model });
                    added = true;
                }
                return added;
            };

            ClientModelStore.prototype.remove = function (model) {
                var _this = this;
                if (!model) {
                    return false;
                }
                var removed = false;
                if (this.presentationModels.containsValue(model)) {
                    this.removePresentationModelByType(model);
                    this.presentationModels.remove(model.id);
                    model.getAttributes().forEach(function (attribute) {
                        _this.removeAttributeById(attribute);
                        if (attribute.getQualifier()) {
                            _this.removeAttributeByQualifier(attribute);
                        }
                    });

                    this.modelStoreChangeBus.trigger({ 'eventType': Type.REMOVED, 'clientPresentationModel': model });
                    removed = true;
                }
                return removed;
            };

            ClientModelStore.prototype.findAttributesByFilter = function (filter) {
                var matches = [];
                this.presentationModels.forEach(function (key, model) {
                    model.getAttributes().forEach(function (attr) {
                        if (filter(attr)) {
                            matches.push(attr);
                        }
                    });
                });
                return matches;
            };

            ClientModelStore.prototype.addPresentationModelByType = function (model) {
                if (!model) {
                    return;
                }
                var type = model.presentationModelType;
                if (!type) {
                    return;
                }
                var presentationModels = this.presentationModelsPerType.get(type);
                if (!presentationModels) {
                    presentationModels = [];
                    this.presentationModelsPerType.put(type, presentationModels);
                }
                if (!(presentationModels.indexOf(model) > -1)) {
                    presentationModels.push(model);
                }
            };

            ClientModelStore.prototype.removePresentationModelByType = function (model) {
                if (!model || !(model.presentationModelType)) {
                    return;
                }

                var presentationModels = this.presentationModelsPerType.get(model.presentationModelType);
                if (!presentationModels) {
                    return;
                }
                if (presentationModels.length > -1) {
                    presentationModels.splice(presentationModels.indexOf(model), 1);
                }
                if (presentationModels.length === 0) {
                    this.presentationModelsPerType.remove(model.presentationModelType);
                }
            };

            ClientModelStore.prototype.listPresentationModelIds = function () {
                return this.presentationModels.keySet().slice(0);
            };

            ClientModelStore.prototype.listPresentationModels = function () {
                return this.presentationModels.values();
            };

            ClientModelStore.prototype.findPresentationModelById = function (id) {
                return this.presentationModels.get(id);
            };

            ClientModelStore.prototype.findAllPresentationModelByType = function (type) {
                if (!type || !this.presentationModelsPerType.containsKey(type)) {
                    return [];
                }
                return this.presentationModelsPerType.get(type).slice(0);
            };

            ClientModelStore.prototype.deleteAllPresentationModelOfType = function (presentationModelType) {
                var _this = this;
                var presentationModels = this.findAllPresentationModelByType(presentationModelType);
                presentationModels.forEach(function (pm) {
                    _this.deletePresentationModel(pm, false);
                });
                this.clientDolphin.getClientConnector().send(new dpmoftn.dolphin.DeletedAllPresentationModelsOfTypeNotification(presentationModelType), undefined);
            };

            ClientModelStore.prototype.deletePresentationModel = function (model, notify) {
                if (!model) {
                    return;
                }
                if (this.containsPresentationModel(model.id)) {
                    this.remove(model);
                    if (!notify || model.clientSideOnly) {
                        return;
                    }
                    this.clientDolphin.getClientConnector().send(new dpmn.dolphin.DeletedPresentationModelNotification(model.id), null);
                }
            };

            ClientModelStore.prototype.containsPresentationModel = function (id) {
                return this.presentationModels.containsKey(id);
            };

            ClientModelStore.prototype.addAttributeById = function (attribute) {
                if (!attribute || this.attributesPerId.containsKey(attribute.id)) {
                    return;
                }
                this.attributesPerId.put(attribute.id, attribute);
            };

            ClientModelStore.prototype.removeAttributeById = function (attribute) {
                if (!attribute || !this.attributesPerId.containsKey(attribute.id)) {
                    return;
                }
                this.attributesPerId.remove(attribute.id);
            };

            ClientModelStore.prototype.findAttributeById = function (id) {
                return this.attributesPerId.get(id);
            };

            ClientModelStore.prototype.addAttributeByQualifier = function (attribute) {
                if (!attribute || !attribute.getQualifier()) {
                    return;
                }
                var attributes = this.attributesPerQualifier.get(attribute.getQualifier());
                if (!attributes) {
                    attributes = [];
                    this.attributesPerQualifier.put(attribute.getQualifier(), attributes);
                }
                if (!(attributes.indexOf(attribute) > -1)) {
                    attributes.push(attribute);
                }
            };

            ClientModelStore.prototype.removeAttributeByQualifier = function (attribute) {
                if (!attribute || !attribute.getQualifier()) {
                    return;
                }
                var attributes = this.attributesPerQualifier.get(attribute.getQualifier());
                if (!attributes) {
                    return;
                }
                if (attributes.length > -1) {
                    attributes.splice(attributes.indexOf(attribute), 1);
                }
                if (attributes.length === 0) {
                    this.attributesPerQualifier.remove(attribute.getQualifier());
                }
            };

            ClientModelStore.prototype.findAllAttributeByQualifier = function (qualifier) {
                if (!qualifier || !this.attributesPerQualifier.containsKey(qualifier)) {
                    return [];
                }
                return this.attributesPerQualifier.get(qualifier).slice(0);
            };

            ClientModelStore.prototype.onModelStoreChange = function (eventHandler) {
                this.modelStoreChangeBus.onEvent(eventHandler);
            };
            return ClientModelStore;
        })();
        dolphin.ClientModelStore = ClientModelStore;
    })(exports.dolphin || (exports.dolphin = {}));
    var dolphin = exports.dolphin;
});
//# sourceMappingURL=ClientModelStore.js.map

define(["require", "exports", "../../js/dolphin/NamedCommand", "../../js/dolphin/SignalCommand", "../../js/dolphin/EmptyNotification", "../../js/dolphin/ClientPresentationModel", "../../js/dolphin/ClientAttribute", "../../js/dolphin/AttributeCreatedNotification"], function(require, exports, __namedCmd__, __signlCmd__, __emptyNot__, __pm__, __ca__, __acn__) {
    var namedCmd = __namedCmd__;
    var signlCmd = __signlCmd__;
    var emptyNot = __emptyNot__;
    var pm = __pm__;
    
    
    var ca = __ca__;
    var acn = __acn__;

    (function (dolphin) {
        var ClientDolphin = (function () {
            function ClientDolphin() {
            }
            ClientDolphin.prototype.setClientConnector = function (clientConnector) {
                this.clientConnector = clientConnector;
            };

            ClientDolphin.prototype.getClientConnector = function () {
                return this.clientConnector;
            };

            ClientDolphin.prototype.send = function (commandName, onFinished) {
                this.clientConnector.send(new namedCmd.dolphin.NamedCommand(commandName), onFinished);
            };

            ClientDolphin.prototype.sendEmpty = function (onFinished) {
                this.clientConnector.send(new emptyNot.dolphin.EmptyNotification(), onFinished);
            };

            // factory method for attributes
            ClientDolphin.prototype.attribute = function (propertyName, qualifier, value, tag) {
                return new ca.dolphin.ClientAttribute(propertyName, qualifier, value, tag);
            };

            // factory method for presentation models
            ClientDolphin.prototype.presentationModel = function (id, type) {
                var attributes = [];
                for (var _i = 0; _i < (arguments.length - 2); _i++) {
                    attributes[_i] = arguments[_i + 2];
                }
                var model = new pm.dolphin.ClientPresentationModel(id, type);
                if (attributes && attributes.length > 0) {
                    attributes.forEach(function (attribute) {
                        model.addAttribute(attribute);
                    });
                }
                this.getClientModelStore().add(model);
                return model;
            };

            ClientDolphin.prototype.setClientModelStore = function (clientModelStore) {
                this.clientModelStore = clientModelStore;
            };

            ClientDolphin.prototype.getClientModelStore = function () {
                return this.clientModelStore;
            };

            ClientDolphin.prototype.listPresentationModelIds = function () {
                return this.getClientModelStore().listPresentationModelIds();
            };

            ClientDolphin.prototype.listPresentationModels = function () {
                return this.getClientModelStore().listPresentationModels();
            };

            ClientDolphin.prototype.findAllPresentationModelByType = function (presentationModelType) {
                return this.getClientModelStore().findAllPresentationModelByType(presentationModelType);
            };

            ClientDolphin.prototype.getAt = function (id) {
                return this.findPresentationModelById(id);
            };

            ClientDolphin.prototype.findPresentationModelById = function (id) {
                return this.getClientModelStore().findPresentationModelById(id);
            };
            ClientDolphin.prototype.deletePresentationModel = function (modelToDelete) {
                this.getClientModelStore().deletePresentationModel(modelToDelete, true);
            };

            ClientDolphin.prototype.deleteAllPresentationModelOfType = function (presentationModelType) {
                this.getClientModelStore().deleteAllPresentationModelOfType(presentationModelType);
            };
            ClientDolphin.prototype.updateQualifier = function (presentationModel) {
                var _this = this;
                presentationModel.getAttributes().forEach(function (sourceAttribute) {
                    if (!sourceAttribute.getQualifier())
                        return;
                    var attributes = _this.getClientModelStore().findAllAttributeByQualifier(sourceAttribute.getQualifier());
                    attributes.forEach(function (targetAttribute) {
                        if (targetAttribute.tag != sourceAttribute.tag)
                            return;
                        targetAttribute.setValue(sourceAttribute.getValue());
                    });
                });
            };

            ClientDolphin.prototype.tag = function (presentationModel, propertyName, value, tag) {
                var clientAttribute = new ca.dolphin.ClientAttribute(propertyName, null, value, tag);
                this.addAttributeToModel(presentationModel, clientAttribute);
                return clientAttribute;
            };

            ClientDolphin.prototype.addAttributeToModel = function (presentationModel, clientAttribute) {
                presentationModel.addAttribute(clientAttribute);
                this.getClientModelStore().registerAttribute(clientAttribute);
                if (!presentationModel.clientSideOnly) {
                    this.clientConnector.send(new acn.dolphin.AttributeCreatedNotification(presentationModel.id, clientAttribute.id, clientAttribute.propertyName, clientAttribute.getValue(), clientAttribute.getQualifier(), clientAttribute.tag), null);
                }
            };

            ////// push support ///////
            ClientDolphin.prototype.startPushListening = function (pushActionName, releaseActionName) {
                this.clientConnector.setPushListener(new namedCmd.dolphin.NamedCommand(pushActionName));
                this.clientConnector.setReleaseCommand(new signlCmd.dolphin.SignalCommand(releaseActionName));
                this.clientConnector.setPushEnabled(true);
                this.clientConnector.listen();
            };
            ClientDolphin.prototype.stopPushListening = function () {
                this.clientConnector.setPushEnabled(false);
            };
            return ClientDolphin;
        })();
        dolphin.ClientDolphin = ClientDolphin;
    })(exports.dolphin || (exports.dolphin = {}));
    var dolphin = exports.dolphin;
});
//# sourceMappingURL=ClientDolphin.js.map

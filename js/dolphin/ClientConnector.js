define(["require", "exports", "../../js/dolphin/ClientPresentationModel", "../../js/dolphin/CommandBatcher", "../../js/dolphin/Codec", "../../js/dolphin/ClientAttribute", "../../js/dolphin/Tag"], function(require, exports, __cpm__, __cb__, __cod__, __ca__, __tags__) {
    var cpm = __cpm__;
    
    var cb = __cb__;
    var cod = __cod__;
    
    
    
    var ca = __ca__;
    
    
    
    
    
    
    
    
    
    
    
    
    
    var tags = __tags__;

    (function (dolphin) {
        var ClientConnector = (function () {
            function ClientConnector(transmitter, clientDolphin, slackMS) {
                if (typeof slackMS === "undefined") { slackMS = 0; }
                this.commandQueue = [];
                this.currentlySending = false;
                this.commandBatcher = new cb.dolphin.BlindCommandBatcher(true);
                this.pushEnabled = false;
                this.waiting = false;
                this.transmitter = transmitter;
                this.clientDolphin = clientDolphin;
                this.slackMS = slackMS;
                this.codec = new cod.dolphin.Codec();
            }
            ClientConnector.prototype.setCommandBatcher = function (newBatcher) {
                this.commandBatcher = newBatcher;
            };
            ClientConnector.prototype.setPushEnabled = function (enabled) {
                this.pushEnabled = enabled;
            };
            ClientConnector.prototype.setPushListener = function (newListener) {
                this.pushListener = newListener;
            };
            ClientConnector.prototype.setReleaseCommand = function (newCommand) {
                this.releaseCommand = newCommand;
            };

            ClientConnector.prototype.send = function (command, onFinished) {
                this.commandQueue.push({ command: command, handler: onFinished });
                if (this.currentlySending) {
                    if (command != this.pushListener)
                        this.release();
                    return;
                }
                this.doSendNext();
            };

            ClientConnector.prototype.doSendNext = function () {
                var _this = this;
                if (this.commandQueue.length < 1) {
                    this.currentlySending = false;
                    return;
                }
                this.currentlySending = true;

                var cmdsAndHandlers = this.commandBatcher.batch(this.commandQueue);
                var callback = cmdsAndHandlers[cmdsAndHandlers.length - 1].handler;
                var commands = cmdsAndHandlers.map(function (cah) {
                    return cah.command;
                });
                this.transmitter.transmit(commands, function (response) {
                    //console.log("server response: [" + response.map(it => it.id).join(", ") + "] ");
                    var touchedPMs = [];
                    response.forEach(function (command) {
                        var touched = _this.handle(command);
                        if (touched)
                            touchedPMs.push(touched);
                    });

                    if (callback) {
                        callback.onFinished(touchedPMs);
                        // todo dk: handling of data from datacommand
                    }

                    // recursive call: fetch the next in line but allow a bit of slack such that
                    // document events can fire, rendering is done and commands can batch up
                    setTimeout(function () {
                        return _this.doSendNext();
                    }, _this.slackMS);
                });
            };

            ClientConnector.prototype.handle = function (command) {
                if (command.id == "Data") {
                    return this.handleDataCommand(command);
                } else if (command.id == "DeletePresentationModel") {
                    return this.handleDeletePresentationModelCommand(command);
                } else if (command.id == "DeleteAllPresentationModelsOfType") {
                    return this.handleDeleteAllPresentationModelOfTypeCommand(command);
                } else if (command.id == "CreatePresentationModel") {
                    return this.handleCreatePresentationModelCommand(command);
                } else if (command.id == "ValueChanged") {
                    return this.handleValueChangedCommand(command);
                } else if (command.id == "BaseValueChanged") {
                    return this.handleBaseValueChangedCommand(command);
                } else if (command.id == "SwitchPresentationModel") {
                    return this.handleSwitchPresentationModelCommand(command);
                } else if (command.id == "InitializeAttribute") {
                    return this.handleInitializeAttributeCommand(command);
                } else if (command.id == "SavedPresentationModel") {
                    return this.handleSavedPresentationModelNotification(command);
                } else if (command.id == "PresentationModelReseted") {
                    return this.handlePresentationModelResetedCommand(command);
                } else if (command.id == "AttributeMetadataChanged") {
                    return this.handleAttributeMetadataChangedCommand(command);
                } else if (command.id == "CallNamedAction") {
                    return this.handleCallNamedActionCommand(command);
                } else {
                    console.log("Cannot handle, unknown command " + command);
                }

                return null;
            };
            ClientConnector.prototype.handleDataCommand = function (serverCommand) {
                return serverCommand.data;
            };
            ClientConnector.prototype.handleDeletePresentationModelCommand = function (serverCommand) {
                var model = this.clientDolphin.findPresentationModelById(serverCommand.pmId);
                if (!model)
                    return null;
                this.clientDolphin.getClientModelStore().deletePresentationModel(model, true);
                return model;
            };
            ClientConnector.prototype.handleDeleteAllPresentationModelOfTypeCommand = function (serverCommand) {
                this.clientDolphin.deleteAllPresentationModelOfType(serverCommand.pmType);
                return null;
            };
            ClientConnector.prototype.handleCreatePresentationModelCommand = function (serverCommand) {
                var _this = this;
                if (this.clientDolphin.getClientModelStore().containsPresentationModel(serverCommand.pmId)) {
                    throw new Error("There already is a presentation model with id " + serverCommand.pmId + "  known to the client.");
                }
                var attributes = [];
                serverCommand.attributes.forEach(function (attr) {
                    var clientAttribute = _this.clientDolphin.attribute(attr.propertyName, attr.qualifier, attr.value, attr.tag ? attr.tag : tags.dolphin.Tag.value());
                    clientAttribute.setBaseValue(attr.baseValue);
                    attributes.push(clientAttribute);
                });
                var clientPm = new cpm.dolphin.ClientPresentationModel(serverCommand.pmId, serverCommand.pmType);
                clientPm.addAttributes(attributes);
                if (serverCommand.clientSideOnly) {
                    clientPm.clientSideOnly = true;
                }
                this.clientDolphin.getClientModelStore().add(clientPm);
                this.clientDolphin.updateQualifier(clientPm);
                clientPm.updateAttributeDirtyness();
                clientPm.updateDirty();
                return clientPm;
            };
            ClientConnector.prototype.handleValueChangedCommand = function (serverCommand) {
                var clientAttribute = this.clientDolphin.getClientModelStore().findAttributeById(serverCommand.attributeId);
                if (!clientAttribute) {
                    console.log("attribute with id " + serverCommand.attributeId + " not found, cannot update old value " + serverCommand.oldValue + " to new value " + serverCommand.newValue);
                    return null;
                }
                clientAttribute.setValue(serverCommand.newValue);
                return null;
            };
            ClientConnector.prototype.handleBaseValueChangedCommand = function (serverCommand) {
                var clientAttribute = this.clientDolphin.getClientModelStore().findAttributeById(serverCommand.attributeId);
                if (!clientAttribute) {
                    console.log("attribute with id " + serverCommand.attributeId + " not found, cannot set base value.");
                    return null;
                }
                clientAttribute.rebase();
                return null;
            };
            ClientConnector.prototype.handleSwitchPresentationModelCommand = function (serverCommand) {
                var switchPm = this.clientDolphin.getClientModelStore().findPresentationModelById(serverCommand.pmId);
                if (!switchPm) {
                    console.log("switch model with id " + serverCommand.pmId + " not found, cannot switch.");
                    return null;
                }
                var sourcePm = this.clientDolphin.getClientModelStore().findPresentationModelById(serverCommand.sourcePmId);
                if (!sourcePm) {
                    console.log("source model with id " + serverCommand.sourcePmId + " not found, cannot switch.");
                    return null;
                }
                switchPm.syncWith(sourcePm);
                return switchPm;
            };
            ClientConnector.prototype.handleInitializeAttributeCommand = function (serverCommand) {
                var attribute = new ca.dolphin.ClientAttribute(serverCommand.propertyName, serverCommand.qualifier, serverCommand.newValue, serverCommand.tag);
                if (serverCommand.qualifier) {
                    var attributesCopy = this.clientDolphin.getClientModelStore().findAllAttributeByQualifier(serverCommand.qualifier);
                    if (attributesCopy) {
                        if (!serverCommand.newValue) {
                            var attr = attributesCopy.shift();
                            if (attr) {
                                attribute.setValue(attr.getValue());
                            }
                        } else {
                            attributesCopy.forEach(function (attr) {
                                attr.setValue(attribute.getValue());
                            });
                        }
                    }
                }
                var presentationModel;
                if (serverCommand.pmId) {
                    presentationModel = this.clientDolphin.getClientModelStore().findPresentationModelById(serverCommand.pmId);
                }
                if (!presentationModel) {
                    presentationModel = new cpm.dolphin.ClientPresentationModel(serverCommand.pmId, serverCommand.pmType);
                    this.clientDolphin.getClientModelStore().add(presentationModel);
                }
                this.clientDolphin.addAttributeToModel(presentationModel, attribute);
                this.clientDolphin.updateQualifier(presentationModel);
                return presentationModel;
            };
            ClientConnector.prototype.handleSavedPresentationModelNotification = function (serverCommand) {
                if (!serverCommand.pmId)
                    return null;
                var model = this.clientDolphin.getClientModelStore().findPresentationModelById(serverCommand.pmId);
                if (!model) {
                    console.log("model with id " + serverCommand.pmId + " not found, cannot rebase.");
                    return null;
                }
                model.rebase();
                return model;
            };
            ClientConnector.prototype.handlePresentationModelResetedCommand = function (serverCommand) {
                if (!serverCommand.pmId)
                    return null;
                var model = this.clientDolphin.getClientModelStore().findPresentationModelById(serverCommand.pmId);
                if (!model) {
                    console.log("model with id " + serverCommand.pmId + " not found, cannot reset.");
                    return null;
                }
                model.reset();
                return model;
            };
            ClientConnector.prototype.handleAttributeMetadataChangedCommand = function (serverCommand) {
                var clientAttribute = this.clientDolphin.getClientModelStore().findAttributeById(serverCommand.attributeId);
                if (!clientAttribute)
                    return null;
                clientAttribute[serverCommand.metadataName] = serverCommand.value;
                return null;
            };
            ClientConnector.prototype.handleCallNamedActionCommand = function (serverCommand) {
                this.clientDolphin.send(serverCommand.actionName, null);
                return null;
            };

            ///////////// push support ///////////////
            ClientConnector.prototype.listen = function () {
                if (!this.pushEnabled)
                    return;
                if (this.waiting)
                    return;

                // todo: how to issue a warning if no pushListener is set?
                this.waiting = true;
                var me = this;
                this.send(this.pushListener, {
                    onFinished: function (models) {
                        me.waiting = false;
                        me.listen();
                    },
                    onFinishedData: null
                });
            };

            ClientConnector.prototype.release = function () {
                if (!this.waiting)
                    return;
                this.waiting = false;

                // todo: how to issue a warning if no releaseCommand is set?
                this.transmitter.signal(this.releaseCommand);
            };
            return ClientConnector;
        })();
        dolphin.ClientConnector = ClientConnector;
    })(exports.dolphin || (exports.dolphin = {}));
    var dolphin = exports.dolphin;
});
//# sourceMappingURL=ClientConnector.js.map

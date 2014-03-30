define(["require", "exports", "../../js/dolphin/ValueChangedCommand"], function(require, exports, __vcc__) {
    
    
    var vcc = __vcc__;
    
    

    (function (dolphin) {
        /** A Batcher that does no batching but merely takes the first element of the queue as the single item in the batch */
        var NoCommandBatcher = (function () {
            function NoCommandBatcher() {
            }
            NoCommandBatcher.prototype.batch = function (queue) {
                return [queue.shift()];
            };
            return NoCommandBatcher;
        })();
        dolphin.NoCommandBatcher = NoCommandBatcher;

        /** A batcher that batches the blinds (commands with no callback) and optionally also folds value changes */
        var BlindCommandBatcher = (function () {
            /** folding: whether we should try folding ValueChangedCommands */
            function BlindCommandBatcher(folding) {
                if (typeof folding === "undefined") { folding = true; }
                this.folding = folding;
            }
            BlindCommandBatcher.prototype.batch = function (queue) {
                var result = [];
                this.processNext(queue, result);
                return result;
            };

            // recursive impl method to side-effect both queue and batch
            BlindCommandBatcher.prototype.processNext = function (queue, batch) {
                if (queue.length < 1)
                    return;
                var candidate = queue.shift();

                if (this.folding && candidate.command instanceof vcc.dolphin.ValueChangedCommand && (!candidate.handler)) {
                    var found = null;
                    var canCmd = candidate.command;
                    for (var i = 0; i < batch.length && found == null; i++) {
                        if (batch[i].command instanceof vcc.dolphin.ValueChangedCommand) {
                            var batchCmd = batch[i].command;
                            if (canCmd.attributeId == batchCmd.attributeId && batchCmd.newValue == canCmd.oldValue) {
                                found = batchCmd;
                            }
                        }
                    }
                    if (found) {
                        found.newValue = canCmd.newValue;
                    } else {
                        batch.push(candidate);
                    }
                } else {
                    batch.push(candidate);
                }
                if (!candidate.handler && !(candidate.command['className'] == "org.opendolphin.core.comm.NamedCommand") && !(candidate.command['className'] == "org.opendolphin.core.comm.EmptyNotification")) {
                    this.processNext(queue, batch);
                }
            };
            return BlindCommandBatcher;
        })();
        dolphin.BlindCommandBatcher = BlindCommandBatcher;
    })(exports.dolphin || (exports.dolphin = {}));
    var dolphin = exports.dolphin;
});
//# sourceMappingURL=CommandBatcher.js.map

import cmd = require("../../js/dolphin/Command");
export module dolphin {

    export class DeletedPresentationModelNotification extends cmd.dolphin.Command {

        className:string;

        constructor(public pmId:string) {
            super();
            this.id = 'DeletedPresentationModel';
            this.className = "org.opendolphin.core.comm.DeletedPresentationModelNotification";
        }
    }
}
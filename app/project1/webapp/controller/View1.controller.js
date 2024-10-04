sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/plugins/UploadSetwithTable"
],
function (Controller,UploadSetwithTable) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            this.getView().bindElement({ path: `/RequestDetails(ID=1b495cef-d9bd-4277-b054-cf52e05d87fa)` });
  
        },
        onPluginActivated: function(oEvent) {
			this.oUploadPluginInstance = oEvent.getParameter("oPlugin");
		},
        getIconSrc: function(mediaType){
            return UploadSetwithTable.getIconForFileType(mediaType, "");
        },
        onSelectionChange: function(oEvent) {
			const oTable = oEvent.getSource();
			const aSelectedItems = oTable?.getSelectedContexts();
			const oDownloadBtn = this.byId("downloadSelectedButton");
			const oEditUrlBtn = this.byId("editUrlButton");
			const oRenameBtn = this.byId("renameButton");
			const oRemoveDocumentBtn = this.byId("removeDocumentButton");

			if (aSelectedItems.length > 0) {
				oDownloadBtn.setEnabled(true);
			} else {
				oDownloadBtn.setEnabled(false);
			}
			if (aSelectedItems.length === 1){
				oEditUrlBtn.setEnabled(true);
				oRenameBtn.setEnabled(true);
				oRemoveDocumentBtn.setEnabled(true);
			} else {
				oRenameBtn.setEnabled(false);
				oEditUrlBtn.setEnabled(false);
				oRemoveDocumentBtn.setEnabled(false);
			}
		},
        onDownloadFiles: function(oEvent) {
			const oContexts = this.byId("table-uploadSet").getSelectedContexts();
			if (oContexts && oContexts.length) {
				oContexts.forEach((oContext) => this.oUploadPluginInstance.download(oContext, true));
			}
		},
        openPreview: function(oEvent) {
			const oSource = oEvent.getSource();
			const oBindingContext = oSource.getBindingContext();
			if (oBindingContext && this.oUploadPluginInstance) {
				this.oUploadPluginInstance.openFilePreview(oBindingContext);
			}
		},
    });
});

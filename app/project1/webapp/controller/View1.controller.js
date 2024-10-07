sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/plugins/UploadSetwithTable",
	"sap/ui/core/Item"
],
	function (Controller, UploadSetwithTable, Item) {
		"use strict";

		return Controller.extend("project1.controller.View1", {
			onInit: function () {
				this.getView().bindElement({ path: `/RequestDetails(ID=e79df67e-e754-44ed-b66d-8134f63ffd35)` });
			},
			uploadFile: async function (uploadInfo) {
				const uploadSetItem = uploadInfo.oItem,
					uploadSetTable = uploadInfo.oSource,
					itemBinding = this.getView().byId("table-uploadSet").getBinding("items"),
					data = {
						filename: uploadSetItem.getFileName()
					};
				let createdItem = itemBinding.create(data, true);
				await createdItem.created();
				// let canonicalPath = createdItem.getCanonicalPath();
				const ID = createdItem.getProperty("ID");
				const uploadPath = `odata/v4/asset-disposal-task-ui/AttachmentUpload(${ID})/content`;
				this.setHeaderFields(uploadSetTable);
				uploadSetItem.setUploadUrl(uploadPath);
				return await new Promise((resolve, reject)=>{
					resolve(uploadSetItem);
				});
			},
			addHeader: function (fileUploader, name, value) {

				const header = new Item({
					key: name,
					text: value
				});
				fileUploader.addHeaderField(header);
			},
			setHeaderFields: function (fileUploader) {
				fileUploader.removeAllHeaderFields();
				const token = fileUploader.getModel().getHttpHeaders()?.["X-CSRF-Token"];

				if (token) {
					this.addHeader(fileUploader, "x-csrf-token", token);
				}

				this.addHeader(fileUploader, "Accept", "application/json");
			},
			onPluginActivated: function (oEvent) {
				this.oUploadPluginInstance = oEvent.getParameter("oPlugin");
			},
			getIconSrc: function (mediaType) {
				return UploadSetwithTable.getIconForFileType(mediaType, "");
			}
		});
	});

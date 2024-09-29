sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/GroupHeaderListItem"
],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, GroupHeaderListItem) {
    "use strict";

    return Controller.extend("assetdisposaltaskui.controller.GenericTaskUI", {
      onInit: function () {
        if (!this.getOwnerComponent().loadedConext) {
          let requestId = "d3340187-0be9-4f32-ab21-02b667326500"
          this.getView().bindElement({ path: `/RequestDetails(ID=${requestId},IsActiveEntity=true)` });
          return;
        }
        this.getOwnerComponent().loadedConext.then(function () {
          let context = this.getOwnerComponent().getContext();
          let requestId = context.requestId;
          this.getView().bindElement({ path: `/RequestDetails(ID=${requestId},IsActiveEntity=true)` });

          // const bookBinding = this.getView().getModel().bindContext(`/Header(ID=${objectId},IsActiveEntity=true)`, null, {
          //   $expand: { "assetDetails": { $select: ["*"], $expand: { "OS": { $select: ["*"] }, "manufacturer": { $select: ["*"] } } } }
          // });
          // bookBinding.requestObject().then(function (data) {
          //   let ControlData = this.getView().getModel("controlsModel").getData();

          //   ControlData.objectId.value = data.objectId;
          //   ControlData.date.value = data.date;
          //   ControlData.reqType_id.value = data.reqType_id;

          //   for (let i in ControlData.assetDetails) {
          //     ControlData.assetDetails[i].value = data.assetDetails[i];
          //   }
          //   // ControlData.assetDetails.assetCategory_id.value = data.assetDetails.assetCategory_id;
          //   // ControlData.assetDetails.manufacturer_id.value = data.assetDetails.manufacturer_id;
          //   // ControlData.assetDetails.OS_id.value = data.assetDetails.OS_id;
          //   // ControlData.assetDetails.ram.value = data.assetDetails.ram;
          //   // ControlData.assetDetails.productprice.value = data.assetDetails.productprice;
          //   // ControlData.assetDetails.mfgPartNum.value = data.assetDetails.mfgPartNum;

          //   this.getView().getModel("controlsModel").setData(ControlData);
          // }.bind(this));

        }.bind(this));

      },
      addAuditTrailDymmy: function(){
        this.getOwnerComponent().updateAuditTrial();
      },
      approve: function(){
        this.getOwnerComponent().approvalConfirmation("Approve", function(){this.getOwnerComponent().completeTask(false, "approve")}.bind(this));
      },
      reject: function(){
        this.getOwnerComponent().approvalConfirmation("Reject", function(){this.getOwnerComponent().completeTask(false, "reject")}.bind(this));
      },
      getTaskType: function(oContext){
        return oContext.getProperty('taskType');
      },
      getGroupHeader: function(oGroup){
        return new GroupHeaderListItem({
          title : oGroup.key
        });
      }
    });
  });

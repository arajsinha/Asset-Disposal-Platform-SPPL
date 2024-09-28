sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "assetdisposaltaskui/model/models",
  ],
  function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend(
      "assetdisposaltaskui.Component",
      {
        metadata: {
          manifest: "json",
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: async function () {
          // call the base component's init function
          UIComponent.prototype.init.apply(this, arguments);

          // enable routing
          this.getRouter().initialize();

          // set the device model
          this.setModel(models.createDeviceModel(), "device");
          if (!this.getComponentData()?.startupParameters?.taskModel) {
            return;
          }

          await this.setTaskModels();
          const rejectOutcomeId = "reject";
          this.getInboxAPI().addAction(
            {
              action: rejectOutcomeId,
              label: "Reject",
              type: "reject",
            },
            function () {
              this.completeTask(false, rejectOutcomeId);
            },
            this
          );
          const approveOutcomeId = "approve";
          this.getInboxAPI().addAction(
            {
              action: approveOutcomeId,
              label: "Approve",
              type: "accept",
            },
            function () {
              this.completeTask(true, approveOutcomeId);
            },
            this
          );
        },

        setTaskModels: async function () {
          // set the task model
          var startupParameters = this.getComponentData().startupParameters;
          this.setModel(startupParameters.taskModel, "task");

          // set the task context model
          var taskContextModel = new sap.ui.model.json.JSONModel(
            this._getTaskInstancesBaseURL() + "/context"
          );
          this.setModel(taskContextModel, "context");

          // parse Date objects and set in own model
          this.loadedConext = taskContextModel.loadData(this._getTaskInstancesBaseURL() + "/context");

          // set the task context model
          var taskContext = new sap.ui.model.json.JSONModel(
            this._getTaskInstancesBaseURL()
          );
          this.setModel(taskContext, "taskContext");
          taskContext.loadData(this._getTaskInstancesBaseURL());

        },

        _getTaskInstancesBaseURL: function () {
          return (
            this._getWorkflowRuntimeBaseURL() +
            "/task-instances/" +
            this.getTaskInstanceID()
          );
        },

        _getWorkflowRuntimeBaseURL: function () {
          var ui5CloudService = this.getManifestEntry("/sap.cloud/service").replaceAll(".", "")
          var ui5ApplicationName = this.getManifestEntry("/sap.app/id").replaceAll(".", "");
          var appPath = `${ui5CloudService}.${ui5ApplicationName}`;
          return `/${appPath}/api/public/workflow/rest/v1`
        },

        _getPath: function () {
          return "";
          var ui5CloudService = this.getManifestEntry("/sap.cloud/service").replaceAll(".", "")
          var ui5ApplicationName = this.getManifestEntry("/sap.app/id").replaceAll(".", "");
          var appPath = `${ui5CloudService}.${ui5ApplicationName}`;
          return `/${appPath}/`
        },

        getTaskInstanceID: function () {
          return this.getModel("task").getData().InstanceID;
        },

        getInboxAPI: function () {
          var startupParameters = this.getComponentData().startupParameters;
          return startupParameters.inboxAPI;
        },

        completeTask: function (approvalStatus, outcomeId) {
          this.getModel("context").setProperty("/approved", approvalStatus);
          let promise = this.updateAuditTrial();
          this._patchTaskInstance(outcomeId);
        },

        _patchTaskInstance: function (outcomeId) {
          const context = this.getModel("context").getData();
          var data = {
            status: "COMPLETED",
            context: { ...context, comment: context.comment || '' },
            decision: outcomeId
          };

          jQuery.ajax({
            url: `${this._getTaskInstancesBaseURL()}`,
            method: "PATCH",
            contentType: "application/json",
            async: true,
            data: JSON.stringify(data),
            headers: {
              "X-CSRF-Token": this._fetchToken(),
            },
          }).done(() => {
            this._refreshTaskList();
          })
        },

        _fetchToken: function () {
          var fetchedToken;

          jQuery.ajax({
            url: this._getWorkflowRuntimeBaseURL() + "/xsrf-token",
            method: "GET",
            async: false,
            headers: {
              "X-CSRF-Token": "Fetch",
            },
            success(result, xhr, data) {
              fetchedToken = data.getResponseHeader("X-CSRF-Token");
            },
          });
          return fetchedToken;
        },

        _refreshTaskList: function () {
          this.getInboxAPI().updateTask("NA", this.getTaskInstanceID());
        },

        updateAuditTrial: function () {
          let context = this.getContext();
          let requestId = context.requestId;

          const path = this._getPath();
          return new Promise(function (resolve, reject) {
            $.ajax({
              url: `${path}/odata/v4/asset-disposal-task-ui/RequestDetails(ID=${requestId})/AssetDisposalTaskUI.addAuditTrial`,
              // url: `/odata/v4/asset-disposal-task-ui/RequestDetails(ID=${requestId})/AssetDisposalTaskUI.addAuditTrial`,
              type: 'POST',
              headers: {
                "X-CSRF-Token": this._fetchTokenAssetSrv()
              },
              data: JSON.stringify({
                "requestId": requestId,
                "taskID": context.taskData.InstanceID,
                "taskName": context.taskData.TaskDefinitionName,
                "taskTitle": context.taskData.TaskTitle,
                "workflowId": context.taskContext.workflowId
              }),
              contentType: 'application/json',
              success: function (response) {
                console.log('Update successful:', response);
                resolve();
              }.bind(this),
              error: function (xhr, status, error) {
                console.error('Update failed:', error);
              }.bind(this)
            });
          }.bind(this));
        },

        getContext: function () {
          let context = {};
          let taskContext = {};
          if (this.getModel("context")) {
            let taskData = this.getModel("task").getData();
            context = this.getModel("context").getData();
            taskContext = this.getModel("taskContext").getData();
            context.taskData = taskData;
            context.taskContext = taskContext;
          } else {
            context.requestId = "d3340187-0be9-4f32-ab21-02b667326500";//testing purpose
            context.taskData = {};
            context.taskData.InstanceID = "1";
            context.taskData.TaskDefinitionName = "2";
            context.taskData.TaskTitle = "3";
            context.taskContext = {};
            context.taskContext.workflowId = "4";

          }
          return context;
        },

        _fetchTokenAssetSrv: function () {
          var fetchedToken;
          const path = this._getPath();

          jQuery.ajax({
            url: `${path}/odata/v4/asset-disposal-task-ui/`,
            method: "GET",
            async: false,
            headers: {
              "X-CSRF-Token": "Fetch",
            },
            success(result, xhr, data) {
              fetchedToken = data.getResponseHeader("X-CSRF-Token");
            },
          });
          return fetchedToken;
        },
      }
    );
  }
);

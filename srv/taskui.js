const cds = require('@sap/cds');
const { error } = require('@sap/cds/lib');

module.exports = class AssetDisposalTaskUI extends cds.ApplicationService {

    async init() {
        console.log("Service JS Triggered")
        const { RequestDetails, AssetDetails, AuditTrail  } = this.entities;
        const logger = cds.log('srv');

        let obj = []
        let workflowID = null

        // const DB = await cds.connect.to('DB');

        this.on("addAuditTrial", "RequestDetails", async (req) => {
            // console.log(req.data)
            // console.log(req.user);
            // return;
            await INSERT.into(AuditTrail).entries(
                {
                    workflows_ID: req.data.workflowId,
                    requestDetails_ID: req.data.requestId,
                    taskID: req.data.taskID,
                    taskDescription: req.data.taskName,
                    taskType: req.data.taskType,
                    subject: req.data.taskTitle,
                    timestamp: new Date,
                    approver: req.user.attr.email,
                    comment: req.data.comment,
                    approverName: `${req.user.attr.givenName} ${req.user.attr.familyName}`,
                    status: req.data.status,
                    hasVoid: req.data.hasVoid
                }
            )
        })

        this.on(
            "PUT",
            "AttachmentUpload",
            async (req) => {
                const attachmentsSrv = await cds.connect.to("attachments");
                await attachmentsSrv.updateContentHandlerNonDraft(req, "AssetDisposalTaskUI.RequestDetails.attachments");
                console.log("Upload Triggered");
             }
          );

        this.on("void", "RequestDetails", async (req) => {
            console.log(req.user);
        })

        return super.init()
    }
}
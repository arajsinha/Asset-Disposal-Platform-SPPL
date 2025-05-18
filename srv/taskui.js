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
            let data = await SELECT.from(RequestDetails).where({'ID': req.data.requestId})
            const objectID = data[0].objectId
            await INSERT.into(AuditTrail).entries(
                {
                    workflows_ID: req.data.workflowId,
                    requestDetails_ID: req.data.requestId,
                    taskID: req.data.taskID,
                    taskDescription: req.data.taskName,
                    taskType: req.data.taskType,
                    subject: req.data.taskTitle,
                    timestamp: new Date,
                    objectId: objectID,
                    approver: req.user.attr.email,
                    comment: req.data.comment,
                    approverName: `${req.user.attr.givenName} ${req.user.attr.familyName}`,
                    status: req.data.status,
                    hasVoid: req.data.hasVoid
                }
            )

            if(req.data.status === "Void"){
                await UPDATE.entity(RequestDetails).set({ 'RequestStatus_id': "VOD" }).where({ 'ID': req.data.requestId });
            }
            if(req.data.status === "Rejected"){
                await UPDATE.entity(RequestDetails).set({ 'RequestStatus_id': "REJ" }).where({ 'ID': req.data.requestId });
            }
        })

        this.on('witness', async (req) => {
            const identity = await cds.connect.to("identity")
            let groups
            if (req.data?.groupName) {
                groups = await identity.send({
                    method: 'GET', path: `/Groups?filter=displayName eq "${req.data.groupName}"`, headers: { Accept: 'application/scim+json' }
                });
            } else {
                groups = await identity.send({
                    method: 'GET', path: '/Groups?filter=displayName eq "SPPL_WITNESS"', headers: { Accept: 'application/scim+json' }
                });
            }
            const membersConditionString = groups.Resources[0].members
                .map(member => `id eq "${member.value}"`)
                .join(' or ');
            let getUserDetails = await identity.send({
                method: 'GET', path: `/Users?filter=${membersConditionString}`, headers: { Accept: 'application/scim+json' }
            });
            console.log(getUserDetails);
            const usersInfo = getUserDetails.Resources.map(user => {
                const email = user.emails.find(email => email.primary)?.value || 'No primary email';
                const familyName = user.name.familyName || 'No family name';
                const givenName = user.name.givenName || 'No given name';

                return {
                    email,
                    familyName,
                    givenName
                };
            });

            return (usersInfo);
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
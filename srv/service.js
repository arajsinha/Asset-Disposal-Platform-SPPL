const cds = require('@sap/cds');
const { error } = require('@sap/cds/lib');

module.exports = class AssetDisposal extends cds.ApplicationService {

    async init() {
        console.log("Service JS Triggered")
        const { RequestDetails, RequestStatus, AssetDetails, AuditTrail, Workflows, YY1_FIXED_ASSETS_CC } = cds.entities;
        const logger = cds.log('srv');

        let obj = []
        let workflowID = null

        const fixa = await cds.connect.to('YY1_FIXED_ASSET');

        this.on('READ', 'YY1_FIXED_ASSETS_CC', async req => {
            let ans = fixa.run(req.query);
            console.log(ans)
            return ans;
        });

        this.on('sideEffectTriggerAction', "AssetDetails.drafts", async (req) => {
            console.log("Hit it")
            // 100001
            let assetData = await SELECT.from(YY1_FIXED_ASSETS_CC).where({'FixedAssetExternalID':'100001-0'});
            console.log(assetData)
        })

        this.before("CREATE", "RequestDetails", async (req) => {
            try {
                let count = await SELECT.one.from(RequestDetails).columns('count(ID) as val');
                console.log(count);
                const counter = count.val + 1
                req.data.objectId = counter.toString();
                req.data.RequestStatus_id = "inp";
            }
            catch (error) {
                console.error("Error:", error);
            }
        });

        this.before("NEW", "RequestDetails.drafts", async (req) => {
            console.log(req.data)
            req.data.assetDetails ??= {};
            req.data.objectId = '0000' + '$';
            req.data.RequestStatus_id = "new";
            req.data.date = new Date().toISOString().split('T')[0];
        });

        this.after("READ", "RequestDetails", async (req, next) => {
            console.log(req)
            const approval = await cds.connect.to("spa-process-automation")
            try {
                let objectData = await SELECT.from(Workflows).where({ 'requestDetails_ID': req[0].ID });
                // Loop through each objectData to get workflowID and make API calls
                for (const workflow of objectData) {
                    if (workflow.workflowID) {
                        try {
                            // Call the external API with the current workflowID
                            let res = await approval.send({
                                method: 'GET',
                                path: '/workflow/rest/v1/workflow-instances/' + workflow.workflowID + '/execution-logs'
                            });

                            // Log the response from the API call
                            console.log(`Workflow ID: ${workflow.workflowID}, Execution Logs:`, res);
                            for (const task of res) {
                                // Check if the task already exists in the AuditTrail
                                const existingTask = await SELECT.one.from(AuditTrail).where({ taskID: task.id });
                                if (!existingTask && task.type != 'WORKFLOW_STARTED' && task.type != 'EXCLUSIVE_GATEWAY_REACHED') {
                                    let recipientsString = task.recipientUsers.join(', ');
                                    let recipientsGroupString = task.recipientGroups.join(', ');
                                    if (task.recipientGroups.length == 0) recipientsGroupString = ''
                                    await INSERT.into(AuditTrail).entries({
                                        taskID: task.id,
                                        type: task.type,
                                        timestamp: task.timestamp,
                                        subject: task.subject,
                                        recipientUsers: recipientsString,
                                        recipientGroups: recipientsGroupString,
                                        workflows_ID: workflow.workflowID,
                                        requestDetails_ID: req[0].ID,
                                    });
                                }
                            }
                            // let data = await SELECT.from(AuditTrail);
                        } catch (apiError) {
                            console.log(`Error fetching execution logs for workflowID ${workflow.workflowID}:`, apiError);
                        }
                    }
                }
                // if (objectData[0].workflowID) {
                //     let res = await approval.send({
                //         method: 'GET', path: '/workflow/rest/v1/workflow-instances/' + objectData[0].workflowID + '/execution-logs'
                //     })
                //     console.log(res)
                // }
                // console.log(cancel)
                // workflowID = res.id
                // await UPDATE.entity(RequestDetails).set({'workflowID': res.id}).where({ 'objectID': req.objectID });

            } catch (error) {
                console.log(error)
            }
        })

        this.after("CREATE", "RequestDetails", async (req) => {
            obj = []
            obj.push(req)
            let workflowContext = {}
            workflowContext.date = obj[0].date;
            workflowContext.requestorname = obj[0].requestorName;
            workflowContext.departmentname = obj[0].departmentName;
            workflowContext.totalpurchasecost = obj[0].totalPurchaseCost;
            workflowContext.objectid = obj[0].objectId;
            workflowContext.requeststatus = obj[0].RequestStatus_id;
            workflowContext.assetdetails = obj[0].assetDetails.map(item => ({
                assetClass: item.assetClass,
                assetDesc: item.assetDesc !== null ? item.assetDesc : '',
                assetNumber: item.assetNumber,
                assetPurchaseCost: item.assetPurchaseCost,
                assetPurchaseDate: item.assetPurchaseDate,
                companyCode: item.companyCode,
                costCenter: item.costCenter,
                disposalMethod: item.disposalMethod,
                netBookValue: item.netBookValue,
                reasonWriteOff: item.reasonWriteOff,
                scrapValue: item.scrapValue,
                subNumber: item.subNumber,
            }));

            // Calculate totalPurchaseCost based on the sum of all assetPurchaseCosts
            workflowContext.totalpurchasecost = workflowContext.assetdetails.reduce((total, asset) => {
                return total + asset.assetPurchaseCost;
            }, 0);
            req.totalPurchaseCost = workflowContext.assetdetails.reduce((total, asset) => {
                return total + asset.assetPurchaseCost;
            }, 0);

            await UPDATE.entity(RequestDetails).set({ 'totalPurchaseCost': req.totalPurchaseCost }).where({ 'ID': req.ID });

            const approval = await cds.connect.to("spa-process-automation")
            try {
                let res = await approval.send({
                    method: 'POST', path: '/workflow/rest/v1/workflow-instances', data:
                    {
                        "definitionId": "eu10.sap-process-automation-tfe.singaporepoolsassets.assetDisposalApproval",
                        "context": workflowContext
                    }
                })
                // console.log(cancel)
                // workflowID = res.id
                // await UPDATE.entity(Workflows).set({ 'ID': res.id }).where({ 'RequestDetailsID': req.ID });
                // await UPDATE.entity(Workflows).set({ 'RequestDetailsID': res.id }).where({ 'ID': req.ID });
                // Insert a new Workflow entry linked to the given RequestID
                await INSERT.into(Workflows).entries({
                    workflowID: res.id,  // The new workflowID to be added
                    requestDetails_ID: req.ID  // Link it to the corresponding RequestDetails
                });
                let data = await SELECT.from(Workflows).where({ 'requestDetails_ID': req.ID });
                console.log(res)
            } catch (error) {
                console.log(error)
            }
        });

        this.after("UPDATE", "RequestDetails", async (req) => {
            // console.log(workflowID)
            let workflows = await SELECT.from(Workflows).where({ 'requestDetails_ID': req.ID });
            obj = []
            obj.push(req)
            let workflowLength = (workflows.length - 1)
            const approval = await cds.connect.to("spa-process-automation")
            try {
                let cancel = await approval.send({
                    method: 'PATCH', path: '/workflow/rest/v1/workflow-instances/' + workflows[workflowLength].workflowID, data: {
                        "definitionId": "eu10.sap-process-automation-tfe.singaporepoolsassets.assetDisposalApproval",
                        "status": "CANCELED"
                    }
                })
            }
            catch {
                console.log(error)
            }

            let workflowContext = {}
            workflowContext.date = obj[0].date;
            workflowContext.requestorname = obj[0].requestorName;
            workflowContext.departmentname = obj[0].departmentName;
            workflowContext.totalpurchasecost = obj[0].totalPurchaseCost;
            workflowContext.objectid = obj[0].objectId;
            workflowContext.requeststatus = obj[0].RequestStatus_id;
            workflowContext.assetdetails = obj[0].assetDetails.map(item => ({
                assetClass: item.assetClass,
                assetDesc: item.assetDesc !== null ? item.assetDesc : '',
                assetNumber: item.assetNumber,
                assetPurchaseCost: item.assetPurchaseCost,
                assetPurchaseDate: item.assetPurchaseDate,
                companyCode: item.companyCode,
                costCenter: item.costCenter,
                disposalMethod: item.disposalMethod,
                netBookValue: item.netBookValue,
                reasonWriteOff: item.reasonWriteOff,
                scrapValue: item.scrapValue,
                subNumber: item.subNumber,
            }));

            // Calculate totalPurchaseCost based on the sum of all assetPurchaseCosts
            workflowContext.totalpurchasecost = workflowContext.assetdetails.reduce((total, asset) => {
                return total + asset.assetPurchaseCost;
            }, 0);

            await UPDATE.entity(RequestDetails).set({ 'totalPurchaseCost': req.totalPurchaseCost }).where({ 'ID': req.ID });


            try {
                let res = await approval.send({
                    method: 'POST', path: '/workflow/rest/v1/workflow-instances', data:
                    {
                        "definitionId": "eu10.sap-process-automation-tfe.singaporepoolsassets.assetDisposalApproval",
                        "context": workflowContext
                    }
                })
                // console.log(cancel)
                // console.log(res)
                await INSERT.into(Workflows).entries({
                    workflowID: res.id,  // The new workflowID to be added
                    requestDetails_ID: req.ID  // Link it to the corresponding RequestDetails
                });
                let data = await SELECT.from(Workflows).where({ 'requestDetails_ID': req.ID });
            } catch (error) {
                console.log(error)
            }

        });

        this.on("withdraw", "RequestDetails", async (req) => {
            console.log(obj)

        })

        return super.init()
    }
}
const cds = require('@sap/cds');
const { error } = require('@sap/cds/lib');

module.exports = class AssetDisposal extends cds.ApplicationService {

    async init() {
        console.log("Service JS Triggered")
        const { RequestDetails, RequestStatus, AssetDetails, AuditTrail, Workflows, YY1_FIXED_ASSETS_CC, Departments, Users, ASSET_RETIRE } = this.entities;
        const logger = cds.log('srv');

        let obj = []
        let workflowID = null

        const fixa = await cds.connect.to('YY1_FIXED_ASSET');

        this.on('READ', 'YY1_FIXED_ASSETS_CC', async req => {
            let ans = await fixa.run(req.query);
            console.log(ans)
            return ans;
        });

        this.on('READ', 'AssetDisposal.Departments', async (req) => {
            console.log('Depts');

            try {

                let data = await SELECT.from(Departments)
                    .columns(r => {
                        r`.*`,
                            r.users`.*`
                    })
                    .where(`users.email = 'aryan.raj.sinha@sap.com'`);

                // Log the data
                console.log(data);
                return data;
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        });

        this.on('READ', 'DepartmentAssets', async (req) => {
            let departmentId;
            if (req.query.SELECT.where?.[0].ref?.[0] === "department") {
                departmentId = req.query.SELECT.where?.[2].val;
            }
            let data = await SELECT.from(Departments)
                .columns(r => {
                    r`.*`,
                        r.costCenters(cc => { cc`.*` })
                }).where({ ID: departmentId })
            const costCentersArray = data[0].costCenters.map(center => center.costCenter);

            // let assetDataCount = await fixa.run(
            //     SELECT.from(YY1_FIXED_ASSETS_CC)
            //     .columns(`count(*) as totalrows`)
            //         .where({
            //             'CostCenter': { in: costCentersArray },
            //             'ValidityEndDate': '9999-12-31' // Additional AND condition
            //         })
            // );
            let assetData = await fixa.run(
                SELECT.from(YY1_FIXED_ASSETS_CC)
                    .where({
                        'CostCenter': { in: costCentersArray },
                        'ValidityEndDate': '9999-12-31' // Additional AND condition
                    })
                // .limit(req.query.SELECT.limit.offset.val, req.query.SELECT.limit.rows.val)
            );
            const finalAssetData = assetData.map((center) => { return { assetNumber: center.FixedAssetExternalID, costCenter: center.CostCenter } });
            // console.log(req.query);
            return finalAssetData;
        });

        this.on('void', "RequestDetails", async (req) => {
            let workflows = await SELECT.one.from(RequestDetails).where({ 'ID': req.params[0].ID });
            console.log(workflows)
            const approval = await cds.connect.to("spa-process-automation-tokenexchange")
            try {
                let task = await approval.send({
                    method: 'GET', path: '/workflow/res/v1/task-instances/'
                })
                let cancel = await approval.send({
                    method: 'PATCH', path: '/workflow/rest/v1/workflow-instances/' + workflows.currentWorkflowID, data: {
                        "definitionId": "eu10.sap-process-automation-tfe.singaporepoolsassets.assetDisposalApproval",
                        "status": "COMPLETED",
                        "decision": "void",
                        "approver": req.user.id
                    }
                })
            }
            catch {
                console.log(error)
            }
        })

        this.on('sideEffectTriggerAction', "AssetDetails.drafts", async (req) => {
            console.log("Hit it")
            // 100001
            let ans = await SELECT.one.from(AssetDetails.drafts).where({ 'ID': req.params[1].ID })
            console.log(ans)
            const nbv = await cds.connect.to("ASSET_BALANCE")
            let now = new Date().toISOString().split('.')[0];
            let formattedDate = `datetime'${now.replace('Z', '')}'`;
            console.log(formattedDate)
            let NBVvalues = {
                AssetAccountingKeyFigureSet: "ABS_DEF",
                FiscalYear: "2024",
                FiscalPeriod: "12",
                KeyDate: formattedDate,
                MasterFixedAsset: 'nice',
                AssetDepreciationArea: '01',
                CurrencyRole: '10',
                Ledger: '0L',
                CompanyCode: '2000',
            }
            let res = await nbv.send({
                method: 'GET', path: `YY1_Asset_Balance_Cube(P_AssetAccountingKeyFigureSet='${NBVvalues.AssetAccountingKeyFigureSet}',P_FiscalYear='${NBVvalues.FiscalYear}',P_FiscalPeriod='${NBVvalues.FiscalPeriod}',P_KeyDate=datetime'2025-12-30T00:00:00')/Results?$format=json&$filter=MasterFixedAsset eq '${ans.assetNumber.split("-")[0]}' and AssetDepreciationArea eq '${NBVvalues.AssetDepreciationArea}' and CurrencyRole eq '${NBVvalues.CurrencyRole}' and Ledger eq '${NBVvalues.Ledger}' and CompanyCode eq '${NBVvalues.CompanyCode}' and (AssetAccountingSortedKeyFigure eq '000001-0010700111' or AssetAccountingSortedKeyFigure eq '000014-0010790401')&$select=AssetAccountingSortedKeyFigure,AmountInDisplayCurrency,AcquisitionValueDate`
            })
            let timestamp = parseInt(res[0].AcquisitionValueDate.match(/\d+/)[0]);

            // Convert the timestamp to a JavaScript Date object
            let dateObject = new Date(timestamp);
            let assetData = await fixa.run(SELECT.one.from(YY1_FIXED_ASSETS_CC).where({ 'FixedAssetExternalID': ans.assetNumber }));
            await UPDATE.entity(AssetDetails.drafts).set({
                'subNumber': assetData.FixedAsset, 'assetClass': assetData.AssetClass, 'costCenter': assetData.CostCenter, 'netBookValue': res[1].AmountInDisplayCurrency,
                'assetPurchaseDate': dateObject,
                'companyCode': assetData.CompanyCode, 'assetDesc': assetData.FixedAssetDescription, 'assetPurchaseCost': res[0].AmountInDisplayCurrency
            }).where({ 'ID': req.params[1].ID });
            //pass all key fields, it is a bug for getting duplicate entries
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
            console.log(req.data);
            req.data.assetDetails ??= {};
            req.data.objectId = '0000' + '$';
            req.data.RequestStatus_id = "new";
            req.data.date = new Date().toISOString().split('T')[0];
            req.data.requestorName = (req.user.attr.givenName) + " " + (req.user.attr.familyName);
            console.log((req.user.attr.givenName) + " " + (req.user.attr.familyName));
            // await UPDATE.entity(RequestDetails).set({ 'requestorName': (req.user.attr.givenName) + (req.user.attr.familyName) }).where({ 'ID': req.ID });
            // req.user.id
        });

        // this.after("READ", "RequestDetails", async (req, next) => {
        //     console.log(req)
        //     const approval = await cds.connect.to("spa-process-automation")
        //     try {
        //         let objectData = await SELECT.from(Workflows).where({ 'requestDetails_ID': req[0].ID });
        //         // Loop through each objectData to get workflowID and make API calls
        //         for (const workflow of objectData) {
        //             if (workflow.workflowID) {
        //                 try {
        //                     // Call the external API with the current workflowID
        //                     let res = await approval.send({
        //                         method: 'GET',
        //                         path: '/workflow/rest/v1/workflow-instances/' + workflow.workflowID + '/execution-logs'
        //                     });

        //                     // Log the response from the API call
        //                     console.log(`Workflow ID: ${workflow.workflowID}, Execution Logs:`, res);
        //                     for (const task of res) {
        //                         // Check if the task already exists in the AuditTrail
        //                         const existingTask = await SELECT.one.from(AuditTrail).where({ taskID: task.id });
        //                         if (!existingTask && task.type != 'WORKFLOW_STARTED' && task.type != 'EXCLUSIVE_GATEWAY_REACHED') {
        //                             let recipientsString = task.recipientUsers.join(', ');
        //                             let recipientsGroupString = task.recipientGroups.join(', ');
        //                             if (task.recipientGroups.length == 0) recipientsGroupString = ''

        //                             // #### -> We should remove this code right? ####
        //                             await INSERT.into(AuditTrail).entries({
        //                                 taskID: task.id,
        //                                 type: task.type,
        //                                 timestamp: task.timestamp,
        //                                 subject: task.subject,
        //                                 // recipientUsers: recipientsString,
        //                                 // recipientGroups: recipientsGroupString,
        //                                 workflows_ID: workflow.workflowID,
        //                                 requestDetails_ID: req[0].ID,
        //                             });
        //                         }
        //                     }
        //                     // let data = await SELECT.from(AuditTrail);
        //                 } catch (apiError) {
        //                     console.log(`Error fetching execution logs for workflowID ${workflow.workflowID}:`, apiError);
        //                 }
        //             }
        //         }
        //         // if (objectData[0].workflowID) {
        //         //     let res = await approval.send({
        //         //         method: 'GET', path: '/workflow/rest/v1/workflow-instances/' + objectData[0].workflowID + '/execution-logs'
        //         //     })
        //         //     console.log(res)
        //         // }
        //         // console.log(cancel)
        //         // workflowID = res.id
        //         // await UPDATE.entity(RequestDetails).set({'workflowID': res.id}).where({ 'objectID': req.objectID });

        //     } catch (error) {
        //         console.log(error)
        //     }
        // })

        this.after("CREATE", "RequestDetails", async (req) => {
            let data = await SELECT.from(RequestDetails)
                .columns(r => {
                    r`.*`,
                        r.assetDetails(ami => { ami`.*` })
                })
                .where({ ID: req.ID });

            // Calculate totalPurchaseCost without a function
            let result = data[0].assetDetails.reduce(
                (acc, asset) => {
                    const purchaseCost = parseFloat(asset.assetPurchaseCost || 0);

                    // Accumulate the total purchase cost
                    acc.total += purchaseCost;

                    // Track the max purchase cost
                    if (purchaseCost > acc.max) {
                        acc.max = purchaseCost;
                    }

                    return acc;
                },
                { total: 0, max: 0 } // Initial values for total and max
            );

            // Assign the calculated values
            req.totalPurchaseCost = result.total.toFixed(3);
            req.maxPurchaseCost = result.max.toFixed(3);
            await UPDATE.entity(RequestDetails).set({ 'totalPurchaseCost': req.totalPurchaseCost }).where({ 'ID': req.ID })
            let workflowContext = {}
            workflowContext.objectid = req.ID;
            let deptName = await SELECT.from(Departments).where({ 'ID': req.department_ID });
            workflowContext.departmentname = deptName[0].name;
            workflowContext.maxpurchasecost = Math.floor(req.maxPurchaseCost);

            // Calculate totalPurchaseCost based on the sum of all assetPurchaseCosts
            // workflowContext.totalpurchasecost = workflowContext.assetdetails.reduce((total, asset) => {
            //     return total + asset.assetPurchaseCost;
            // }, 0);
            // req.totalPurchaseCost = workflowContext.assetdetails.reduce((total, asset) => {
            //     return total + asset.assetPurchaseCost;
            // }, 0);

            await UPDATE.entity(RequestDetails).set({ 'totalPurchaseCost': req.totalPurchaseCost }).where({ 'ID': req.ID });

            const approval = await cds.connect.to("spa-process-automation-tokenexchange")
            try {
                let res = await approval.send({
                    method: 'POST', path: '/workflow/rest/v1/workflow-instances', data:
                    {
                        "definitionId": "eu10.sap-process-automation-tfe.singaporepoolsassets.assetDisposalApproval",
                        "context": workflowContext
                    }
                })
                console.log(res)
                // console.log(cancel)
                // workflowID = res.id
                // await UPDATE.entity(Workflows).set({ 'ID': res.id }).where({ 'RequestDetailsID': req.ID });
                // await UPDATE.entity(Workflows).set({ 'RequestDetailsID': res.id }).where({ 'ID': req.ID });
                // Insert a new Workflow entry linked to the given RequestID
                await UPDATE.entity(RequestDetails).set({ currentWorkflowID: res.id })
                await INSERT.into(Workflows).entries({
                    workflowID: res.id,  // The new workflowID to be added
                    requestDetails_ID: req.ID  // Link it to the corresponding RequestDetails
                });
                let nice = await SELECT.from(Workflows).where({ 'requestDetails_ID': req.ID });
                console.log(nice)
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
            const approval = await cds.connect.to("spa-process-automation-tokenexchange")
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
            workflowContext.objectid = req.ID;

            // Calculate totalPurchaseCost based on the sum of all assetPurchaseCosts
            // workflowContext.totalpurchasecost = workflowContext.assetdetails.reduce((total, asset) => {
            //     return total + asset.assetPurchaseCost;
            // }, 0);

            // await UPDATE.entity(RequestDetails).set({ 'totalPurchaseCost': req.totalPurchaseCost }).where({ 'ID': req.ID });


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
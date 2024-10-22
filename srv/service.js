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
        const retire = await cds.connect.to('ASSET_RETIRE');
        const taskUI = await cds.connect.to('AssetDisposalTaskUI');

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
                return data;
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        });

        this.on('READ', 'DepartmentAssets', async (req) => {
            let department_name;
            if (req.query.SELECT.where?.[0].ref?.[0] === "department") {
                department_name = req.query.SELECT.where?.[2].val;
            }
            let data = await SELECT.from(Departments)
                .columns(r => {
                    r`.*`,
                        r.costCenters(cc => { cc`.*` })
                }).where({ name: department_name })
            const costCentersArray = data[0].costCenters.map(center => center.costCenter);
            if (costCentersArray.length > 0) {
                let assetData = await fixa.run(
                    SELECT.from(YY1_FIXED_ASSETS_CC)
                        .where({
                            'CostCenter': { in: costCentersArray },
                            'ValidityEndDate': '9999-12-31' // Additional AND condition
                        })
                    // .limit(req.query.SELECT.limit.offset.val, req.query.SELECT.limit.rows.val)
                );
                const finalAssetData = assetData.map((center) => { return { assetNumber: center.FixedAssetExternalID, costCenter: center.CostCenter, assetDesc: center.FixedAssetDescription } });
                return finalAssetData;
            } else {
                return [];
            }
        });

        this.on('void', "RequestDetails", async (req) => {
            let workflows = await SELECT.one.from(RequestDetails).where({ 'ID': req.params[0].ID });
            const approval = await cds.connect.to("spa-process-automation-tokenexchange")
            try {
                let tasks = await approval.send({
                    method: 'GET', path: `/workflow/rest/v1/task-instances?workflowInstanceId=${workflows.currentWorkflowID}`
                });
                for (const task of tasks) {
                    if (task.status !== 'COMPLETED') {
                        await approval.send({
                            method: 'PATCH',
                            path: '/workflow/rest/v1/task-instances/' + task.id,
                            data: {
                                "status": "COMPLETED",
                                "decision": "void",
                                "approver": req.user.id
                            }
                        });
                        await taskUI.send('addAuditTrial', "AssetDisposalTaskUI.RequestDetails", {
                            requestId: req.params[0].ID,
                            taskID: task.id,
                            taskName: task.subject,
                            taskType: "Complete Workflow",
                            taskTitle: task.subject,
                            comment: req.data.text,
                            status: "Void",
                            workflowId: workflows.currentWorkflowID,
                            hasVoid: false
                        });
                    }
                }

                // Update the request status to Void
                await UPDATE.entity(RequestDetails).set({ 'RequestStatus_id': "VOD" }).where({ 'ID': req.params[0].ID });

            }
            catch {
                console.log(error)
            }
        })

        this.on('retire', "RequestDetails", async (req) => {
            let assetDetails = await SELECT.one.from(RequestDetails).columns(r => {
                r`.*`,
                    r.assetDetails(cc => { cc`.*` }),
                    r.AuditTrail(cc => { cc`.*` })
            }).where({ 'ID': req.params[0].ID });
            let witnessedByDate
            for (const auditDetails of assetDetails.AuditTrail) {
                if (auditDetails.taskType == 'Witnessed By' && auditDetails.status == 'Approved') {
                    witnessedByDate = auditDetails.timestamp
                }
                if (auditDetails.taskType == 'Process' && auditDetails.status == 'Rejected') {
                    witnessedByDate = new Date()
                }
            }
            const postingDay = new Date(witnessedByDate);
            const formattedDate = postingDay.toISOString().split('T')[0];
            // const postingDay = new Date();
            // const formattedDate = postingDay.toISOString().split('T')[0];
            let retireData = {
                ReferenceDocumentItem: "1",
                CompanyCode: "2000",
                FixedAssetRetirementType: "1"
            }
            for (const asset of assetDetails.assetDetails) {
                if (asset.isRetired == false) {
                    if (asset.disposalMethod == 'Disposal') {
                        retireData.BusinessTransactionType = "RA20"
                        retireData.FxdAstRetirementRevenueType = "1"
                        retireData.AstRevenueAmountInTransCrcy = Number(asset.scrapValue)
                        retireData.FxdAstRtrmtRevnTransCrcy = "SGD"
                        retireData.FxdAstRtrmtRevnCurrencyRole = "10"
                    } else {
                        retireData.BusinessTransactionType = "RA21"
                    }
                    retireData.MasterFixedAsset = asset.assetNumber.split("-")[0]
                    retireData.FixedAsset = asset.assetNumber.split("-")[1]
                    retireData.DocumentDate = formattedDate
                    retireData.PostingDate = formattedDate
                    retireData.AssetValueDate = formattedDate
                    try {
                        let res = await retire.send({
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json",
                            },
                            path: `/FixedAssetRetirement/SAP__self.Post`,
                            data: retireData
                        })
                        console.log(res)
                        await UPDATE.entity(AssetDetails).set(
                            {
                                "isRetired": true
                            }).where({ 'ID': assetDetails.assetDetails[0].ID });
                    } catch (error) {
                        console.log(error)
                        await UPDATE.entity(AssetDetails).set(
                            {
                                "isRetired": false
                            }).where({ 'ID': assetDetails.assetDetails[0].ID });
                        await UPDATE.entity(RequestDetails).set(
                            {
                                "RequestStatus_id": "APR"
                            }).where({ 'ID': req.params[0].ID });
                    }
                }
            }
        })

        this.on('withdraw', "RequestDetails", async (req) => {
            const approval = await cds.connect.to("spa-process-automation-tokenexchange")
            let workflows = await SELECT.one.from(RequestDetails).where({ 'ID': req.params[0].ID });
            let tasks = await approval.send({
                method: 'GET', path: `/workflow/rest/v1/task-instances?workflowInstanceId=${workflows.currentWorkflowID}`
            });
            for (const task of tasks) {
                await taskUI.send('addAuditTrial', "AssetDisposalTaskUI.RequestDetails", {
                    requestId: req.params[0].ID,
                    taskID: task.id,
                    taskName: task.subject,
                    taskType: "Withdraw",
                    taskTitle: task.subject,
                    comment: req.data.text,
                    status: "Withdrawn",
                    workflowId: workflows.currentWorkflowID,
                    hasVoid: false
                });
            }
            await approval.send({
                method: 'PATCH', path: '/workflow/rest/v1/workflow-instances/' + workflows.currentWorkflowID, data: {
                    "definitionId": "eu10.sap-process-automation-tfe.singaporepoolsassets.assetDisposalApproval",
                    "status": "CANCELED"
                }
            })
            // Update the request status to withdrawn
            await UPDATE.entity(RequestDetails).set({ 'RequestStatus_id': "WTD" }).where({ 'ID': req.params[0].ID });
        })

        this.after("READ", "RequestDetails.drafts", async (results, req) => {
            for (const result of results) {
                result.canVoid = false; //default values
                result.canEdit = false; //default values
                result.canWithdraw = false; //default values
                result.canRetire = false; //default values
            }
        });

        this.after("READ", "RequestDetails", async (results, req) => {
            try {
                if (req?.data?.ID) {
                    for (const result of results) {
                        result.canEdit = false; //default values
                        result.canVoid = false; //default values
                        result.canWithdraw = false; //default values
                        result.canRetire = false; //default values
                        let reqDetail = await SELECT.one.from(RequestDetails).columns(r => {
                            r`.*`,
                                r.RequestStatus(cc => { cc`.*` })
                        }).where({ 'ID': result.ID });
                        let auditTrail = await SELECT.from(AuditTrail).where({ 'requestDetails_ID': result.ID, 'workflows_ID': reqDetail.currentWorkflowID });

                        const approval = await cds.connect.to("spa-process-automation-tokenexchange")
                        let workflows = await approval.send({
                            method: 'GET', path: '/workflow/rest/v1/workflow-instances/' + reqDetail.currentWorkflowID
                        })

                        if (auditTrail.length == 1) result.canWithdraw = true

                        if (reqDetail.RequestStatus_id === 'REJ' || reqDetail.RequestStatus_id === 'WTD') {
                            result.canEdit = true;
                        }
                        if (workflows.status === 'COMPLETED') {
                            for (const data of auditTrail) {
                                if (req.user.id === data.approver && data.status != 'Void' && data.hasVoid) {
                                    result.canRetire = true;
                                }
                            }
                        }
                        if (reqDetail.RequestStatus_id === 'APR' && workflows.status === 'COMPLETED') {
                            for (const data of auditTrail) {
                                if (req.user.id === data.approver && data.status != 'Void' && data.hasVoid) {
                                    result.canRetire = false;
                                }
                            }
                        }
                        if (reqDetail.RequestStatus_id === 'INP') {
                            for (const data of auditTrail) {
                                if (req.user.id === data.approver && data.status != 'Void' && data.hasVoid) {
                                    result.canVoid = true;
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.log(error)
            }

        })

        // this.on('sideEffectDisposalAction', "AssetDetails.drafts", async (req) => {
        //     let ans = await SELECT.one.from(AssetDetails.drafts).where({ 'ID': req.params[1].ID })
        //     console.log(ans.disposalMethod)
        // })

        // this.after("READ", "AssetDetails.drafts", async (results, req) => {
        //     for (const result of results) {
        //         result.salvageMandatory = '3'; //default values
        //         if (result.disposalMethod == 'Disposal') {
        //             result.salvageMandatory = '7'
        //         }
        //     }
        // });

        this.on('sideEffectTriggerAction', "AssetDetails.drafts", async (req) => {
            let ans = await SELECT.one.from(AssetDetails.drafts).where({ 'ID': req.params[1].ID })
            const nbv = await cds.connect.to("ASSET_BALANCE")
            let now = new Date().toISOString().split('.')[0];
            let formattedDate = `datetime'${now.replace('Z', '')}'`;
            let NBVvalues = {
                AssetAccountingKeyFigureSet: "ABS_DEF",
                FiscalYear: "2024",
                FiscalPeriod: "12",
                KeyDate: formattedDate,
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
                req.data.RequestStatus_id = "INP";
            }
            catch (error) {
                console.error("Error:", error);
            }
        });


        this.before("NEW", "RequestDetails.drafts", async (req) => {
            console.log(req.data);
            req.data.assetDetails ??= {};
            req.data.objectId = '0000' + '$';
            req.data.RequestStatus_id = "NEW";
            req.data.date = new Date().toISOString().split('T')[0];
            req.data.requestorName = (req.user.attr.givenName) + " " + (req.user.attr.familyName);
            console.log((req.user.attr.givenName) + " " + (req.user.attr.familyName));
            // await UPDATE.entity(RequestDetails).set({ 'requestorName': (req.user.attr.givenName) + (req.user.attr.familyName) }).where({ 'ID': req.ID });
            // req.user.id
        });

        this.after(["CREATE", "UPDATE"], "RequestDetails", async (req) => {
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

            let workflowContext = {}
            workflowContext.objectid = req.ID;
            let deptName = await SELECT.from(Departments).where({ 'name': data[0].department_name });
            workflowContext.departmentname = deptName[0].name;
            workflowContext.maxpurchasecost = Math.floor(req.maxPurchaseCost);

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
                await UPDATE.entity(RequestDetails).set(
                    {
                        'totalPurchaseCost': req.totalPurchaseCost,
                        "currentWorkflowID": res.id,
                        "RequestStatus_id": "INP"
                    }).where({ 'ID': req.ID });
                let data = await SELECT.from(RequestDetails)
                    .columns(r => {
                        r`.*`
                    })
                    .where({ ID: req.ID });
                await taskUI.send('addAuditTrial', "AssetDisposalTaskUI.RequestDetails", {
                    requestId: req.ID,
                    taskID: "workflowcreationtask",
                    taskName: "Asset Disposal Request Created",
                    taskType: "Asset Disposal Workflow Created By",
                    taskTitle: "Asset Disposal Request Created",
                    comment: "Asset Disposal Request Created",
                    status: "Gone for Processing",
                    workflowId: data[0].currentWorkflowID,
                    hasVoid: false
                });

                await INSERT.into(Workflows).entries({
                    workflowID: res.id,  // The new workflowID to be added
                    requestDetails_ID: req.ID  // Link it to the corresponding RequestDetails
                });
            } catch (error) {
                console.log(error)
            }
        });

        return super.init()
    }
}
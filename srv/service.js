const cds = require('@sap/cds');
const { error } = require('@sap/cds/lib');
const SequenceHelper = require("./lib/SequenceHelper");

module.exports = class AssetDisposal extends cds.ApplicationService {

    async init() {
        console.log("Service JS Triggered")
        const { RequestDetails, AssetDetails, AuditTrail, Workflows, YY1_FIXED_ASSETS_CC, Departments, AttachmentUpload } = this.entities;

        const fixa = await cds.connect.to('YY1_FIXED_ASSET');
        const retire = await cds.connect.to('ASSET_RETIRE');
        const taskUI = await cds.connect.to('AssetDisposalTaskUI');
        const db = await cds.connect.to('db');

        this.on('READ', 'YY1_FIXED_ASSETS_CC', async req => {
            let ans = await fixa.run(req.query);
            console.log(ans)
            return ans;
        });

        this.on('READ', 'AssetDisposal.Departments', async (req) => {
            try {
                let data = await SELECT.from(Departments)
                    .columns(r => {
                        r`.*`,
                            r.users`.*`
                    })
                    .where(`users.email = '${req.user.id}'`);
                return data;
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        });

        this.on('READ', 'DepartmentAssets', async (req) => {
            try {
                let departmentName, assetNoSearchStr, whereCondition;

                // Extract department name from query
                if (req.query.SELECT.where?.[0].ref?.[0] === "department") {
                    departmentName = req.query.SELECT.where?.[2].val;
                }

                // Extract asset number search string and sanitize
                if (req.query.SELECT.search) {
                    assetNoSearchStr = req.query.SELECT.search[0].val;
                    assetNoSearchStr = assetNoSearchStr.toString().replace(/"/g, "'");
                }

                // Fetch department data with cost centers
                const departmentData = await SELECT.from(Departments)
                    .columns(r => {
                        r`.*`,
                            r.costCenters(cc => {
                                cc`.*`;
                            });
                    })
                    .where({ name: departmentName });

                const costCentersArray = departmentData[0].costCenters.map(center => center.costCenter) || [];

                if (costCentersArray.length > 0) {
                    // Build where condition
                    whereCondition = {
                        'CostCenter': { in: costCentersArray },
                        'ValidityEndDate': '9999-12-31'
                    };

                    let costCentersFilter = `(${costCentersArray.map(center => "CostCenter = '" + center + "'").join(' or ')})`
                    let validityDateFilter = `ValidityEndDate = '9999-12-31'`
                    // let assetNumberFilter = `substringof(MasterFixedAsset,${assetNoSearchStr})`

                    if (assetNoSearchStr != undefined) {

                        // Check if it's already wrapped in single quotes
                        if (!assetNoSearchStr.startsWith("'") || !assetNoSearchStr.endsWith("'")) {
                            assetNoSearchStr = `'${assetNoSearchStr}'`;
                        }

                        let assetNumberFilter = `substringof(MasterFixedAsset, ${assetNoSearchStr})`;
                        whereCondition = cds.parse.expr(`${costCentersFilter} and ${validityDateFilter} and ${assetNumberFilter}`);
                    }
                    else
                        whereCondition = cds.parse.expr(`${costCentersFilter} and ${validityDateFilter}`)
                    console.log(whereCondition)
                    // Fetch asset data
                    const assetData = await fixa.run(
                        SELECT.from(YY1_FIXED_ASSETS_CC)
                            .limit(
                                req.query.SELECT.limit.rows.val,
                                req.query.SELECT.limit.offset.val
                            )
                            .where(whereCondition)
                            .orderBy`MasterFixedAsset`
                    );

                    // Transform and return asset data
                    console.log("Asset Data-----------------")
                    console.log(assetData)
                    return assetData.map(center => ({
                        assetNumber: center.MasterFixedAsset + '-' + center.FixedAsset,
                        costCenter: center.CostCenter,
                        assetDesc: center.FixedAssetDescription
                    }));
                } else {
                    return [];
                }
            } catch (error) {
                console.error('Error in DepartmentAssets READ handler:', error.message, error);
                throw new Error('Failed to fetch department assets. Please try again later.');
            }
        });


        this.on('void', 'RequestDetails', async (req) => {
            try {
                // Fetch workflow details
                const workflow = await SELECT.one.from(RequestDetails).where({ ID: req.params[0].ID });
                const approval = await cds.connect.to('spa-process-automation-tokenexchange');

                // Fetch tasks associated with the workflow
                const tasks = await approval.send({
                    method: 'GET',
                    path: `/workflow/rest/v1/task-instances?workflowInstanceId=${workflow.currentWorkflowID}`
                });

                for (const task of tasks) {
                    if (task.status !== 'COMPLETED') {
                        // Mark the task as completed
                        await approval.send({
                            method: 'PATCH',
                            path: `/workflow/rest/v1/task-instances/${task.id}`,
                            data: {
                                "status": "COMPLETED",
                                "decision": "void",
                                "approver": req.user.id
                            }
                        });

                        // Fetch object ID for the request
                        let objectId = await SELECT.from(RequestDetails).where({ 'ID': req.params[0].ID })

                        // Add an audit trail entry
                        await taskUI.send('addAuditTrial', 'AssetDisposalTaskUI.RequestDetails', {
                            requestId: req.params[0].ID,
                            objectId: objectId[0].objectId,
                            taskID: task.id,
                            taskName: task.subject,
                            taskType: 'Complete Workflow',
                            taskTitle: task.subject,
                            comment: req.data.text,
                            status: 'Void',
                            workflowId: workflow.currentWorkflowID,
                            hasVoid: false
                        });
                    }
                }

                // Update the request status to Void
                await UPDATE.entity(RequestDetails)
                    .set({ 'RequestStatus_id': "VOD" })
                    .where({ 'ID': req.params[0].ID });

            } catch (error) {
                console.error('Error handling void operation:', error);
            }
        });

        this.on('getGroups', "RequestDetails", async (req) => {

            console.log("----------------------Get Groups=------------------")
            console.log(req.data.text)
            let userGroup = req.data.text
            const identity = await cds.connect.to("identity")
            let groups
            groups = await identity.send({
                method: 'GET', path: `/Groups?filter=displayName eq "${userGroup}"`, headers: { Accept: 'application/scim+json' }
            });
            // // }
            const membersConditionString = groups.Resources[0].members
                .map(member => `id eq "${member.value}"`)
                .join(' or ');
            let getUserDetails = await identity.send({
                method: 'GET', path: `/Users?filter=${membersConditionString}`, headers: { Accept: 'application/scim+json' }
            });
            console.log(getUserDetails);
            const emails = getUserDetails.Resources.map(user => {
                const email = user.emails.find(email => email.primary)?.value || 'No primary email';
                return email;

            });

            return emails.join(', ');
        })

        this.on('retire', "RequestDetails", async (req) => {
            //Attach the request URL in the S4 acquired asset pre-retirement
            const url = "https://my301971-api.s4hana.ondemand.com/sap/opu/odata/sap/API_CV_ATTACHMENT_SRV/CreateUrlAsAttachment";
            const params = {
                LinkedSAPObjectKey: "2000000000" + 6135450 + "000",
                Url: "https://sppl-test.launchpad.cfapps.ap11.hana.ondemand.com/site?siteId=39a3e458-aac5-4d79-804d-f20b01b9d403%23assetdisposal-request?sap-ui-app-id-hint=saas_approuter_assetdisposalrequest%26/",
                UrlDescription: "For Build Work Zone",
                MIMEType: "text/url",
                BusinessObjectTypeName: "BUS1022"
            };

            // Create query string
            const queryString = new URLSearchParams(params).toString();

            // Make the API call
            fetch(`${url}?${queryString}`, {
                method: "POST", // Adjust method if needed (default is GET)
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic " + btoa("your_username:your_password"), // Replace with actual credentials or token
                    "Accept": "application/json"
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Response Data:", data);
                })
                .catch(error => {
                    console.error("Error occurred:", error);
                });

            //Final Retirement of Asset in S4
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
            for (const asset of assetDetails.assetDetails) {
                let retireData = {
                    ReferenceDocumentItem: "1",
                    CompanyCode: asset.companyCode,
                    FixedAssetRetirementType: "1"
                }
                if (!asset.isRetired) {
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
                        }).where({ 'ID': asset.ID });
                }
            }

            await UPDATE.entity(RequestDetails).set(
                {
                    "RequestStatus_id": "APR"
                }).where({ 'ID': req.params[0].ID });
        })

        this.on('withdraw', "RequestDetails", async (req) => {
            const approval = await cds.connect.to("spa-process-automation-tokenexchange")
            let workflows = await SELECT.one.from(RequestDetails).where({ 'ID': req.params[0].ID });
            let tasks = await approval.send({
                method: 'GET', path: `/workflow/rest/v1/task-instances?workflowInstanceId=${workflows.currentWorkflowID}`
            });
            for (const task of tasks) {
                let objectId = await SELECT.from(RequestDetails).where({ 'ID': req.params[0].ID })
                await taskUI.send('addAuditTrial', "AssetDisposalTaskUI.RequestDetails", {
                    requestId: req.params[0].ID,
                    objectId: objectId[0].objectId,
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
                    "definitionId": "ap11.sppl-test.assetdisposalworkflowsingaporepools1.assetDisposalApproval",
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
                                const identity = await cds.connect.to("identity")
                                let groups
                                groups = await identity.send({
                                    method: 'GET', path: `/Groups?filter=displayName eq "SPPL_FAO"`, headers: { Accept: 'application/scim+json' }
                                });
                                // // }
                                const membersConditionString = groups.Resources[0].members
                                    .map(member => `id eq "${member.value}"`)
                                    .join(' or ');
                                let getUserDetails = await identity.send({
                                    method: 'GET', path: `/Users?filter=${membersConditionString}`, headers: { Accept: 'application/scim+json' }
                                });
                                console.log(getUserDetails);
                                const emails = getUserDetails.Resources.map(user => {
                                    const email = user.emails.find(email => email.primary)?.value || 'No primary email';
                                    return email;

                                });
                                console.log("---------------------emails-----------------------")
                                console.log(emails)
                                if (emails.includes(req.user.id) && data.status !== 'Void' && data.hasVoid) {
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


        this.after("READ", "AssetDetails.drafts", async (results, req) => {
            for (const result of results) {
                result.salvageMandatory = 7; //default values

                if (result.disposalMethod === undefined || result.disposalMethod === 'Write Off') {
                    let data = await SELECT.from(AssetDetails.drafts).where({ 'ID': result.ID })
                    if (data[0].disposalMethod === 'Write Off') {
                        await UPDATE.entity(AssetDetails.drafts).set(
                            {
                                'scrapValue': 0.00,
                            }).where({ 'ID': result.ID });
                        result.scrapValue = '';
                        result.salvageMandatory = 1;
                    }
                }
            }
        });

        this.on('sideEffectTriggerAction', "AssetDetails.drafts", async (req) => {
            let ans = await SELECT.one.from(AssetDetails.drafts).where({ 'ID': req.params[1].ID })
            // let assetDetails = await SELECT.one.from(AssetDetails.drafts).columns(r => {
            //     r`.*`,
            //         r.assetDetails(cc => { cc`.*` })
            // }).where({ 'ID': req.params[0].ID });
            const nbv = await cds.connect.to("ASSET_BALANCE")
            let now = new Date().toISOString().split('.')[0];
            let today = new Date();
            let year = today.getFullYear();
            let month = today.getMonth() + 1; // getMonth() returns 0-based index

            // Determine fiscal year
            let fiscalYear = month > 3 ? year : year - 1;

            // Determine fiscal period
            let fiscalPeriod = month >= 4 ? month - 3 : month + 9;

            // console.log({ fiscalYear, fiscalPeriod });

            let formattedDate = `datetime'${now.replace('Z', '')}'`;
            let assetData = await fixa.run(SELECT.one.from(YY1_FIXED_ASSETS_CC).where({ 'FixedAssetExternalID': ans.assetNumber }));
            let NBVvalues = {
                AssetAccountingKeyFigureSet: "ABS_DEF",
                FiscalYear: fiscalYear,
                FiscalPeriod: fiscalPeriod,
                KeyDate: formattedDate,
                AssetDepreciationArea: '01',
                CurrencyRole: '10',
                Ledger: '0L',
                CompanyCode: assetData.CompanyCode,
            }
            let res = await nbv.send({
                method: 'GET', path: `YY1_Asset_Balance_Cube(P_AssetAccountingKeyFigureSet='${NBVvalues.AssetAccountingKeyFigureSet}',P_FiscalYear='${NBVvalues.FiscalYear}',P_FiscalPeriod='${NBVvalues.FiscalPeriod}',P_KeyDate=datetime'2025-12-30T00:00:00')/Results?$format=json&$filter=MasterFixedAsset eq '${ans.assetNumber.split("-")[0]}' and AssetDepreciationArea eq '${NBVvalues.AssetDepreciationArea}' and CurrencyRole eq '${NBVvalues.CurrencyRole}' and Ledger eq '${NBVvalues.Ledger}' and CompanyCode eq '${NBVvalues.CompanyCode}' and (AssetAccountingSortedKeyFigure eq '000001-0010700111' or AssetAccountingSortedKeyFigure eq '000014-0010790401')&$select=AssetAccountingSortedKeyFigure,AmountInDisplayCurrency,AcquisitionValueDate`
            })
            let timestamp = parseInt(res[0].AcquisitionValueDate.match(/\d+/)[0]);

            // Convert the timestamp to a JavaScript Date object
            let dateObject = new Date(timestamp);

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

                const objectIdSeqNo = new SequenceHelper({
                    db: db,
                    sequence: "OBJECTID",
                    table: "spassets.RequestDetails",
                    field: "OBJECTID"
                });

                let objectId = await objectIdSeqNo.getNextNumber();
                req.data.objectId = "FA-DISPOSAL-" + objectId;

                req.data.RequestStatus_id = "INP";
            }
            catch (error) {
                console.error("Error:", error);
            }
        });


        this.before("NEW", "RequestDetails.drafts", async (req) => {
            console.log(req.data);
            req.data.assetDetails ??= {};
            req.data.objectId = 'FA-DISPOSAL-' + '$';
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
            req.totalPurchaseCost = result.total.toFixed(2);
            req.maxPurchaseCost = result.max.toFixed(2);

            let workflowContext = {}
            let requestId = await SELECT.from(RequestDetails).where({ 'ID': req.ID })
            workflowContext.maxpurchasecost = Math.floor(req.maxPurchaseCost);
            workflowContext.objectid = req.ID;
            let deptName = await SELECT.from(Departments).where({ 'name': data[0].department_name });
            workflowContext.departmentname = deptName[0].name;
            workflowContext.requestid = requestId[0].objectId;

            const approval = await cds.connect.to("spa-process-automation-tokenexchange")
            try {
                let res = await approval.send({
                    method: 'POST', path: '/workflow/rest/v1/workflow-instances', data:
                    {
                        "definitionId": "ap11.sppl-test.assetdisposalworkflowsingaporepoolsmaincopy.assetDisposalApproval",
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
                let objectId = await SELECT.from(RequestDetails).where({ 'ID': req.ID })
                await taskUI.send('addAuditTrial', "AssetDisposalTaskUI.RequestDetails", {
                    requestId: req.ID,
                    objectId: objectId[0].objectId,
                    taskID: "workflowcreationtask",
                    taskName: "Asset Disposal Request Created",
                    taskType: "Asset Disposal Workflow Created By",
                    taskTitle: "Asset Disposal Request Created",
                    comment: "Asset Disposal Request Created",
                    status: "In Process",
                    workflowId: data[0].currentWorkflowID,
                    hasVoid: false
                });

                await INSERT.into(Workflows).entries({
                    workflowID: res.id,  // The new workflowID to be added
                    requestDetails_ID: req.ID  // Link it to the corresponding RequestDetails
                });
                let auditTrail = await SELECT.from(AuditTrail).where({ 'requestDetails_ID': req.ID });
                await UPDATE.entity(RequestDetails).set(
                    {
                        'date': auditTrail[0].timestamp
                    }).where({ 'ID': req.ID });
            } catch (error) {
                console.log(error)
            }
        });

        return super.init()
    }
}

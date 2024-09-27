const cds = require('@sap/cds');
const { error } = require('@sap/cds/lib');

module.exports = class AssetDisposalTaskUI extends cds.ApplicationService {

    async init() {
        console.log("Service JS Triggered")
        const { RequestDetails, RequestStatus, AssetDetails, AuditTrail, Workflows } = cds.entities;
        const logger = cds.log('srv');

        let obj = []
        let workflowID = null

        // const DB = await cds.connect.to('DB');

        this.on("withdraw", "RequestDetails", async (req) => {
            console.log(obj)

        })

        return super.init()
    }
}
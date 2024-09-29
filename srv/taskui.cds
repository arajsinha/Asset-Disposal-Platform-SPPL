using spassets from '../db/schema';

type auditTrailType : {
  taskID     : String(100);
  taskName   : String(100);
  taskType   : String(100);
  taskTitle  : String(100);
  workflowId : String(100);
  comment    : String(200);
};

service AssetDisposalTaskUI {
  @readonly
  entity RequestDetails as projection on spassets.RequestDetails
    actions {
      action void();
      action addAuditTrial(requestId : RequestDetails:ID @mandatory,
                           taskID : auditTrailType:taskID @mandatory,
                           taskName : auditTrailType:taskName @mandatory,
                           taskType : auditTrailType:taskType @mandatory,
                           taskTitle : auditTrailType:taskID @mandatory,
                           workflowId : auditTrailType:taskID @mandatory,
                           comment  : auditTrailType:comment );
    }

  @readonly
  entity AssetDetails   as projection on spassets.AssetDetails;

  @readonly
  entity AuditTrail     as projection on spassets.AuditTrail;
}

using spassets from '../db/schema';
using deptassets from '../db/department_maintenance';

type auditTrailType : {
  taskID     : String(100);
  objectId  : String(24);
  taskName   : String(100);
  taskType   : String(100);
  taskTitle  : String(100);
  workflowId : String(100);
  comment    : String(200);
  status     : String(20);
  hasVoid    : Boolean;
};

service AssetDisposalTaskUI {

  type userDetails : {
    email      : String;
    familyName : String;
    givenName  : String;
  }

  function witness( groupName : String) returns array of userDetails;

  entity RequestDetails   as projection on spassets.RequestDetails
    actions {
      action void();
      action addAuditTrial(requestId : RequestDetails:ID @mandatory,
                           taskID : auditTrailType:taskID,
                           objectId: auditTrailType:objectId,
                           taskName : auditTrailType:taskName @mandatory,
                           taskType : auditTrailType:taskType @mandatory,
                           taskTitle : auditTrailType:taskID @mandatory,
                           workflowId : auditTrailType:taskID @mandatory,
                           comment : auditTrailType:comment,
                           status : auditTrailType:status @mandatory,
                           hasVoid : auditTrailType:hasVoid);
    }

  @readonly
  entity AssetDetails     as projection on spassets.AssetDetails;

  @readonly
  entity AuditTrail       as projection on spassets.AuditTrail;

  entity AttachmentUpload as projection on spassets.AttachmentUpload;

  @readonly
  entity Departments      as projection on deptassets.Departments;
}

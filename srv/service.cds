using spassets from '../db/schema';

service AssetDisposal {
  @odata.draft.enabled
  entity RequestDetails as projection on spassets.RequestDetails
    actions {
      action withdraw();
    }

  entity AssetDetails   as projection on spassets.AssetDetails;

  entity AuditTrail     as projection on spassets.AuditTrail
    actions {
      action RefreshAuditTrail();
    }

  entity Workflows      as projection on spassets.Workflows;
}

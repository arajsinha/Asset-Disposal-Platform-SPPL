using spassets from '../db/schema';

service AssetDisposalTaskUI {
  @readonly
  entity RequestDetails as projection on spassets.RequestDetails
    actions {
      action void();
      action addAuditTrial();
    }

  @readonly
  entity AssetDetails   as projection on spassets.AssetDetails;

  @readonly
  entity AuditTrail     as projection on spassets.AuditTrail;
}

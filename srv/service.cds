using spassets from '../db/schema';
using deptassets from '../db/department_maintenance';

service DepartmentMaintenance {
  entity Users           as projection on deptassets.Users;

  @odata.draft.enabled
  entity Departments     as projection on deptassets.Departments;
  entity CostCenters     as projection on deptassets.CostCenters;
}

service AssetDisposal {
  @odata.draft.enabled
  entity RequestDetails as projection on spassets.RequestDetails
    actions {
      action withdraw();
    }

  entity AssetDetails   as projection on spassets.AssetDetails;
  entity AuditTrail     as projection on spassets.AuditTrail;
  entity Workflows      as projection on spassets.Workflows;
}

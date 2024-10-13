using spassets from '../db/schema';
using deptassets from '../db/department_maintenance';

// namespace sap.fe.core;


service DepartmentMaintenance {
  entity Users       as projection on deptassets.Users;

  @odata.draft.enabled
  entity Departments as projection on deptassets.Departments;

  entity CostCenters as projection on deptassets.CostCenters;
}

service AssetDisposal {
  @odata.draft.enabled
  entity RequestDetails      as projection on spassets.RequestDetails
    actions {
      @(
        cds.odata.bindingparameter.name: 'in',
        Common.SideEffects             : {TargetProperties: ['in/RequestStatus_id']}
      )
      action withdraw();
      @(
        cds.odata.bindingparameter.name: 'in',
        Common.SideEffects             : {TargetProperties: ['in/RequestStatus_id']}
      )
      action void();
    }

  // @odata.draft.enabled
  entity AssetDetails        as projection on spassets.AssetDetails
    actions {
      action sideEffectTriggerAction();
    };

  annotate AssetDetails with @(Common: {SideEffects #triggerActionProperty: {
    SourceProperties: [assetNumber],
    TargetProperties: [
      'assetDesc',
      'subNumber',
      'assetClass',
      'costCenter',
      'assetPurchaseDate',
      'assetPurchaseCost',
      'companyCode',
      'assetPurchaseCost',
      'netBookValue'
    ],
    TriggerAction   : 'AssetDisposal.sideEffectTriggerAction'
  }});

  entity DisposalMethod      as projection on spassets.DisposalMethod;

  @readonly
  entity AuditTrail          as projection on spassets.AuditTrail;

  @readonly
  entity Workflows           as projection on spassets.Workflows;

  @readonly
  entity YY1_FIXED_ASSETS_CC as projection on spassets.YY1_FIXED_ASSETS_CC;

  @readonly
  entity Departments         as projection on deptassets.Departments;

  @readonly
  entity CostCenters         as projection on deptassets.CostCenters;

  @readonly
  entity DepartmentAssets    as projection on spassets.DepartmentAssets;
}

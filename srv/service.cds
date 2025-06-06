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

  type inVoid     : {
    comment : String;
  };

  type inWithdraw : {
    comment : String;
  };

  type inUserInfo {
    groups: String;
  }

  type UserInfo {
    email : String;
  }

  @odata.draft.enabled
  entity RequestDetails      as projection on spassets.RequestDetails


    actions {

      @(
        restrict                       : [{to: 'Asset_Request_Write'}],
        cds.odata.bindingparameter.name: 'in',
        Common.SideEffects             : {TargetProperties: [
          'in/RequestStatus_id',
          'in/canWithdraw',
          'in/canEdit'
        ]}
      )
      action withdraw(text : inWithdraw:comment);

      @(
        restrict                       : [{to: 'Asset_Request_Write'}],
        cds.odata.bindingparameter.name: 'in',
        Common.SideEffects             : {TargetProperties: [
          'in/RequestStatus_id',
          'in/canVoid',
          'in/canEdit'
        ]}
      )
      action void(text : inVoid:comment);
      @(restrict: [{to: 'Asset_Request_Write'}])
      action retire();
      @(restrict: [{to: 'Asset_Request_Write'}])
      action getGroups(text : inUserInfo:groups) returns array of UserInfo;
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

  annotate AssetDetails with @(Common: {SideEffects: {
    SourceProperties: [disposalMethod],
    TargetProperties: [
      'salvageMandatory',
      'scrapValue'
    ]
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

  annotate RequestDetails with @(restrict: [
    {
      grant: 'WRITE',
      to   : 'Asset_Request_Write'
    },
    {
      grant: 'READ',
      to   : 'authenticated-user'
    }
  ]);
}

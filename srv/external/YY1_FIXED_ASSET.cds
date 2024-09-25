/* checksum : eca080e06172ea588569d76b09fc1655 */
@cds.external : true
@m.IsDefaultEntityContainer : 'true'
@sap.message.scope.supported : 'true'
@sap.supported.formats : 'atom json xlsx'
service YY1_FIXED_ASSET {};

@cds.external : true
@cds.persistence.skip : true
@sap.creatable : 'false'
@sap.updatable : 'false'
@sap.deletable : 'false'
@sap.content.version : '1'
@sap.label : 'FIXED_ASSETS_CC'
entity YY1_FIXED_ASSET.YY1_FIXED_ASSETS_CC {
  @sap.display.format : 'UpperCase'
  @sap.required.in.filter : 'false'
  @sap.label : 'Company Code'
  key CompanyCode : String(4) not null;
  @sap.display.format : 'UpperCase'
  @sap.required.in.filter : 'false'
  @sap.label : 'Asset'
  @sap.quickinfo : 'Main Asset Number'
  key MasterFixedAsset : String(12) not null;
  @sap.display.format : 'UpperCase'
  @sap.required.in.filter : 'false'
  @sap.text : 'FixedAssetDescription'
  @sap.label : 'Subnumber'
  @sap.quickinfo : 'Asset Subnumber'
  key FixedAsset : String(4) not null;
  @sap.required.in.filter : 'false'
  @sap.label : 'Description'
  @sap.quickinfo : 'Asset Description'
  FixedAssetDescription : String(50);
  @sap.display.format : 'Date'
  @sap.required.in.filter : 'false'
  @sap.label : 'Valid To'
  @sap.quickinfo : 'Date Validity Ends'
  ValidityEndDate : Date;
  @sap.display.format : 'UpperCase'
  @sap.required.in.filter : 'false'
  @sap.label : 'Cost Center'
  CostCenter : String(10);
  @sap.display.format : 'UpperCase'
  @sap.required.in.filter : 'false'
  @sap.label : 'Asset Class'
  AssetClass : String(8);
  @sap.display.format : 'UpperCase'
  @sap.required.in.filter : 'false'
  @sap.label : 'Asset Number'
  FixedAssetExternalID : String(17);
  @sap.display.format : 'UpperCase'
  @sap.required.in.filter : 'false'
  @sap.label : 'Serial Number'
  AssetSerialNumber : String(18);
  @sap.display.format : 'Date'
  @sap.required.in.filter : 'false'
  @sap.label : 'First Acquisition on'
  @sap.quickinfo : 'Asset Value Date of the First Posting'
  AcquisitionValueDate : Date;
  @sap.required.in.filter : 'false'
  @sap.unit : 'Currency'
  @sap.label : 'Original Value'
  @sap.quickinfo : 'Original Acquisition Value'
  OriglAcqnAmtInCoCodeCrcy : Decimal(24, 3);
  @sap.display.format : 'UpperCase'
  @sap.required.in.filter : 'false'
  @sap.label : 'Currency'
  @sap.quickinfo : 'Currency Key'
  @sap.semantics : 'currency-code'
  Currency : String(5);
};


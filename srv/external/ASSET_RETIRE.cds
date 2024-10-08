/* checksum : dfa24ffcbc25691b6df845ce6cf191f0 */
@cds.external : true
type ASSET_RETIRE.D_FxdAstPostRetirementLedgerP {
  @Common.FieldControl : #Mandatory
  @Common.IsUpperCase : true
  @Common.Label : 'Ledger'
  @Common.Heading : 'Ld'
  @Common.QuickInfo : 'Ledger in General Ledger Accounting'
  Ledger : String(2) not null;
  @Common.Label : 'Depreciation area'
  @Common.Heading : 'Ar.'
  @Common.QuickInfo : 'Real depreciation area'
  _Valuation : many ASSET_RETIRE.D_FxdAstPostRetirementValnP not null;
};

@cds.external : true
type ASSET_RETIRE.D_FxdAstPostRetirementValnP {
  @Common.FieldControl : #Mandatory
  @Common.Label : 'Depreciation area'
  @Common.Heading : 'Ar.'
  @Common.QuickInfo : 'Real depreciation area'
  AssetDepreciationArea : String(2) not null;
};

@cds.external : true
type ASSET_RETIRE.SAP__Message {
  code : LargeString not null;
  message : LargeString not null;
  target : LargeString;
  additionalTargets : many LargeString not null;
  transition : Boolean not null;
  @odata.Type : 'Edm.Byte'
  numericSeverity : Integer not null;
  longtextUrl : LargeString;
};

@cds.external : true
@CodeList.CurrencyCodes : {
  Url: '../../../../default/iwbep/common/0001/$metadata',
  CollectionPath: 'Currencies'
}
@CodeList.UnitsOfMeasure : {
  Url: '../../../../default/iwbep/common/0001/$metadata',
  CollectionPath: 'UnitsOfMeasure'
}
@Aggregation.ApplySupported : {
  Transformations: [ 'aggregate', 'groupby', 'filter' ],
  Rollup: #None
}
@Common.ApplyMultiUnitBehaviorForSortingAndFiltering : true
@Capabilities.FilterFunctions : [
  'eq',
  'ne',
  'gt',
  'ge',
  'lt',
  'le',
  'and',
  'or',
  'contains',
  'startswith',
  'endswith',
  'any',
  'all'
]
@Capabilities.SupportedFormats : [ 'application/json', 'application/pdf' ]
@PDF.Features : {
  DocumentDescriptionReference: '../../../../default/iwbep/common/0001/$metadata',
  DocumentDescriptionCollection: 'MyDocumentDescriptions',
  ArchiveFormat: true,
  Border: true,
  CoverPage: true,
  FitToPage: true,
  FontName: true,
  FontSize: true,
  Margin: true,
  Padding: true,
  Signature: true,
  HeaderFooter: true,
  ResultSizeDefault: 20000,
  ResultSizeMaximum: 20000,
  IANATimezoneFormat: true,
  Treeview: true
}
@Capabilities.KeyAsSegmentSupported : true
@Capabilities.AsynchronousRequestsSupported : true
service ASSET_RETIRE {};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Fixed Asset Retirement Posting'
@Common.Messages : SAP__Messages
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.InsertRestrictions.Insertable : false
@Capabilities.DeleteRestrictions.Deletable : false
@Capabilities.UpdateRestrictions.Updatable : false
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_FixedAssetPostingLedger', '_FixedAssetPostingValuation' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
@Capabilities.FilterRestrictions.FilterExpressionRestrictions : [
  {
    Property: AstRevenueAmountInTransCrcy,
    AllowedExpressions: 'MultiValue'
  },
  {
    Property: AstRtrmtAmtInTransCrcy,
    AllowedExpressions: 'MultiValue'
  },
  {
    Property: FxdAstRtrmtQuantityInBaseUnit,
    AllowedExpressions: 'MultiValue'
  },
  {
    Property: BaseUnitSAPCode,
    AllowedExpressions: 'MultiValue'
  },
  {
    Property: BaseUnitISOCode,
    AllowedExpressions: 'MultiValue'
  }
]
entity ASSET_RETIRE.FixedAssetRetirement {
  @Core.Computed : true
  @Common.Label : 'Posting UUID'
  @Common.Heading : 'Fixed Asset Posting UUID'
  @Common.QuickInfo : 'Fixed Asset Posting: UUID'
  key FixedAssetPostingUUID : UUID not null;
  @Core.Immutable : true
  @Common.IsDigitSequence : true
  @Common.Label : 'Ref. Doc. Line Item'
  @Common.Heading : 'Ref.It'
  @Common.QuickInfo : 'Reference Document Line Item'
  key ReferenceDocumentItem : String(6) not null;
  @Common.FieldControl : #Mandatory
  @Common.IsUpperCase : true
  @Common.Label : 'Company Code'
  @Common.Heading : 'CoCd'
  CompanyCode : String(4) not null;
  @Common.FieldControl : #Mandatory
  @Common.IsUpperCase : true
  @Common.Label : 'Asset'
  @Common.QuickInfo : 'Main Asset Number'
  MasterFixedAsset : String(12) not null;
  @Common.FieldControl : #Mandatory
  @Common.IsUpperCase : true
  @Common.Label : 'Subnumber'
  @Common.Heading : 'SNo.'
  @Common.QuickInfo : 'Asset Subnumber'
  FixedAsset : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Asset Class'
  @Common.Heading : 'Class'
  AssetClass : String(8) not null;
  @Common.FieldControl : #Mandatory
  @Common.Label : 'Document Date'
  @Common.Heading : 'Doc. Date'
  @Common.QuickInfo : 'Document Date in Document'
  DocumentDate : Date;
  @Common.FieldControl : #Mandatory
  @Common.Label : 'Posting Date'
  @Common.Heading : 'Pstng Date'
  @Common.QuickInfo : 'Posting Date in the Document'
  PostingDate : Date;
  @Common.Label : 'Asset Value Date'
  @Common.Heading : 'AssetValDate'
  AssetValueDate : Date;
  @Common.FieldControl : #Mandatory
  @Common.IsUpperCase : true
  @Common.Label : 'Bus. Trans. Type'
  @Common.Heading : 'BusTranTyp'
  @Common.QuickInfo : 'Business Transaction Type'
  BusinessTransactionType : String(4) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Reference'
  @Common.QuickInfo : 'Reference Document Number'
  DocumentReferenceID : String(16) not null;
  @Common.Label : 'Document Header Text'
  AccountingDocumentHeaderText : String(25) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Determination of Revenue'
  @Common.Heading : 'Determination of Retirement Revenue'
  @Common.QuickInfo : 'Determination Type for Retirement Revenue'
  FxdAstRetirementRevenueType : String(1) not null;
  @Measures.ISOCurrency : FxdAstRtrmtRevnTransCrcy
  @Common.Label : 'Revenue Amount'
  @Common.QuickInfo : 'Revenue Amount for Retirement'
  AstRevenueAmountInTransCrcy : Decimal(23, variable) not null;
  @Common.IsCurrency : true
  @Common.IsUpperCase : true
  @Common.Label : 'Currency'
  @Common.Heading : 'Crcy'
  @Common.QuickInfo : 'Currency Key'
  FxdAstRtrmtRevnTransCrcy : String(3) not null;
  @Common.Label : 'Currency Type of Revenue'
  @Common.QuickInfo : 'Currency Type for Retirement Revenue Amount'
  FxdAstRtrmtRevnCurrencyRole : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Depreciation Area for Determining NBV'
  FxdAstRevnDetnDeprArea : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Retirement Type'
  FixedAssetRetirementType : String(1) not null;
  @Measures.ISOCurrency : FxdAstRetirementTransCrcy
  @Common.Label : 'Retirement Amount'
  @Common.QuickInfo : 'Retirement Amount Posted'
  AstRtrmtAmtInTransCrcy : Decimal(23, variable) not null;
  @Common.IsCurrency : true
  @Common.IsUpperCase : true
  @Common.Label : 'Currency'
  @Common.Heading : 'Crcy'
  @Common.QuickInfo : 'Currency Key'
  FxdAstRetirementTransCrcy : String(3) not null;
  @Common.Label : 'Retirement Percentage'
  @Common.QuickInfo : 'Asset Retirement: Percentage Rate'
  FxdAstRetirementRatioInPercent : Decimal(5, 2) not null;
  @Measures.Unit : BaseUnitSAPCode
  @Measures.UNECEUnit : BaseUnitISOCode
  @Common.Label : 'Quantity'
  FxdAstRtrmtQuantityInBaseUnit : Decimal(13, 3) not null;
  @Common.IsUnit : true
  @Common.Label : 'Base Unit of Measure'
  @Common.Heading : 'BUn'
  BaseUnitSAPCode : String(3) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'ISO Code'
  @Common.Heading : 'ISO'
  @Common.QuickInfo : 'ISO Code for Unit of Measurement'
  BaseUnitISOCode : String(3) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'UI Control of Transaction Amounts (Current/Previous)'
  FixedAssetYearOfAcqnCode : String(1) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Document Type'
  @Common.Heading : 'Doc. Type'
  AccountingDocumentType : String(2) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Company ID'
  @Common.Heading : 'Co.ID'
  TradingPartner : String(6) not null;
  @Common.Label : 'Assignment'
  @Common.QuickInfo : 'Assignment Number'
  AssignmentReference : String(18) not null;
  @Common.Label : 'Text'
  @Common.QuickInfo : 'Item Text'
  DocumentItemText : String(50) not null;
  SAP__Messages : many ASSET_RETIRE.SAP__Message not null;
  @cds.ambiguous : 'missing on condition?'
  _FixedAssetPostingLedger : Association to many ASSET_RETIRE.FixedAssetRetirementLedger {  };
  @cds.ambiguous : 'missing on condition?'
  _FixedAssetPostingValuation : Association to many ASSET_RETIRE.FixedAssetRtrmtValuation {  };
} actions {
  action Post(
    _it : many $self not null,
    @Common.FieldControl : #Mandatory
    @Common.IsUpperCase : true
    @Common.Label : 'Ref. Doc. Line Item'
    @Common.Heading : 'Ref.It'
    @Common.QuickInfo : 'Reference Document Line Item'
    ReferenceDocumentItem : String(6) not null,
    @Common.FieldControl : #Mandatory
    @Common.IsUpperCase : true
    @Common.Label : 'Bus. Trans. Type'
    @Common.Heading : 'BusTranTyp'
    @Common.QuickInfo : 'Business Transaction Type'
    BusinessTransactionType : String(4) not null,
    @Common.IsUpperCase : true
    @Common.Label : 'Company Code'
    @Common.Heading : 'CoCd'
    CompanyCode : String(4) not null default null,
    @Common.IsUpperCase : true
    @Common.Label : 'Asset'
    @Common.QuickInfo : 'Main Asset Number'
    MasterFixedAsset : String(12) not null default null,
    @Common.IsUpperCase : true
    @Common.Label : 'Subnumber'
    @Common.Heading : 'SNo.'
    @Common.QuickInfo : 'Asset Subnumber'
    FixedAsset : String(4) not null default null,
    @Common.Label : 'Document Date'
    @Common.Heading : 'Doc. Date'
    @Common.QuickInfo : 'Document Date in Document'
    DocumentDate : Date default null,
    @Common.Label : 'Posting Date'
    @Common.Heading : 'Pstng Date'
    @Common.QuickInfo : 'Posting Date in the Document'
    PostingDate : Date default null,
    @Common.Label : 'Asset Value Date'
    @Common.Heading : 'AssetValDate'
    AssetValueDate : Date default null,
    @Common.Label : 'Determination of Revenue'
    @Common.Heading : 'Determination of Retirement Revenue'
    @Common.QuickInfo : 'Determination Type for Retirement Revenue'
    FxdAstRetirementRevenueType : String(1) not null default null,
    @Measures.ISOCurrency : FxdAstRtrmtRevnTransCrcy
    @Common.Label : 'Revenue Amount'
    @Common.QuickInfo : 'Revenue Amount for Retirement'
    AstRevenueAmountInTransCrcy : Decimal(23, variable) not null default null,
    @Common.IsCurrency : true
    @Common.IsUpperCase : true
    @Common.Label : 'Currency'
    @Common.Heading : 'Crcy'
    @Common.QuickInfo : 'Currency Key'
    FxdAstRtrmtRevnTransCrcy : String(3) not null default null,
    @Common.Label : 'Currency Type of Revenue'
    @Common.QuickInfo : 'Currency Type for Retirement Revenue Amount'
    FxdAstRtrmtRevnCurrencyRole : String(2) not null default null,
    @Common.IsUpperCase : true
    @Common.Label : 'Depreciation Area for Determining NBV'
    FxdAstRevnDetnDeprArea : String(2) not null default null,
    @Common.IsUpperCase : true
    @Common.Label : 'Retirement Type'
    FixedAssetRetirementType : String(1) not null default null,
    @Measures.ISOCurrency : FxdAstRetirementTransCrcy
    @Common.Label : 'Retirement Amount'
    @Common.QuickInfo : 'Retirement Amount Posted'
    AstRtrmtAmtInTransCrcy : Decimal(23, variable) not null default null,
    @Common.IsCurrency : true
    @Common.IsUpperCase : true
    @Common.Label : 'Currency'
    @Common.Heading : 'Crcy'
    @Common.QuickInfo : 'Currency Key'
    FxdAstRetirementTransCrcy : String(3) not null default null,
    @Common.Label : 'Retirement Percentage'
    @Common.QuickInfo : 'Asset Retirement: Percentage Rate'
    FxdAstRetirementRatioInPercent : Decimal(5, 2) not null default null,
    @Common.IsUpperCase : true
    @Common.Label : 'UI Control of Transaction Amounts (Current/Previous)'
    FixedAssetYearOfAcqnCode : String(1) not null default null,
    @Common.IsUpperCase : true
    @Common.Label : 'Reference'
    @Common.QuickInfo : 'Reference Document Number'
    DocumentReferenceID : String(16) not null default null,
    @Common.Label : 'Document Header Text'
    AccountingDocumentHeaderText : String(25) not null default null,
    @Measures.Unit : BaseUnitSAPCode
    @Common.Label : 'Quantity'
    FxdAstRtrmtQuantityInBaseUnit : Decimal(13, 3) not null default null,
    @Common.IsUnit : true
    @Common.Label : 'Base Unit of Measure'
    @Common.Heading : 'BUn'
    BaseUnitSAPCode : String(3) not null default null,
    @Common.IsUpperCase : true
    @Common.Label : 'ISO Code'
    @Common.Heading : 'ISO'
    @Common.QuickInfo : 'ISO Code for Unit of Measurement'
    BaseUnitISOCode : String(3) not null default null,
    @Common.IsUpperCase : true
    @Common.Label : 'Document Type'
    @Common.Heading : 'Doc. Type'
    AccountingDocumentType : String(2) not null default null,
    @Common.IsUpperCase : true
    @Common.Label : 'Company ID'
    @Common.Heading : 'Co.ID'
    TradingPartner : String(6) not null default null,
    @Common.Label : 'Assignment'
    @Common.QuickInfo : 'Assignment Number'
    AssignmentReference : String(18) not null default null,
    @Common.Label : 'Text'
    @Common.QuickInfo : 'Item Text'
    DocumentItemText : String(50) not null default null,
    _Ledger : many ASSET_RETIRE.D_FxdAstPostRetirementLedgerP not null
  ) returns ASSET_RETIRE.FixedAssetRetirement not null;
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Ledger for Fixed Asset Rtrmt Posting'
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.InsertRestrictions.Insertable : false
@Capabilities.DeleteRestrictions.Deletable : false
@Capabilities.UpdateRestrictions.Updatable : false
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_FixedAssetPosting', '_FixedAssetPostingValuation' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
entity ASSET_RETIRE.FixedAssetRetirementLedger {
  @Common.Label : 'Posting UUID'
  @Common.Heading : 'Fixed Asset Posting UUID'
  @Common.QuickInfo : 'Fixed Asset Posting: UUID'
  key FixedAssetPostingUUID : UUID not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Ref. Doc. Line Item'
  @Common.Heading : 'Ref.It'
  @Common.QuickInfo : 'Reference Document Line Item'
  key ReferenceDocumentItem : String(6) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Ledger'
  @Common.Heading : 'Ld'
  @Common.QuickInfo : 'Ledger in General Ledger Accounting'
  key Ledger : String(2) not null;
  @cds.ambiguous : 'missing on condition?'
  _FixedAssetPosting : Association to one ASSET_RETIRE.FixedAssetRetirement on _FixedAssetPosting.ReferenceDocumentItem = ReferenceDocumentItem;
  @cds.ambiguous : 'missing on condition?'
  _FixedAssetPostingValuation : Association to many ASSET_RETIRE.FixedAssetRtrmtValuation {  };
};

@cds.external : true
@cds.persistence.skip : true
@Common.Label : 'Valuation for Fixed Asset Rtrmt Posting'
@Capabilities.SearchRestrictions.Searchable : false
@Capabilities.InsertRestrictions.Insertable : false
@Capabilities.DeleteRestrictions.Deletable : false
@Capabilities.UpdateRestrictions.Updatable : false
@Capabilities.UpdateRestrictions.NonUpdatableNavigationProperties : [ '_FixedAssetPosting', '_FixedAssetPostingLedger' ]
@Capabilities.UpdateRestrictions.QueryOptions.SelectSupported : true
entity ASSET_RETIRE.FixedAssetRtrmtValuation {
  @Common.Label : 'Posting UUID'
  @Common.Heading : 'Fixed Asset Posting UUID'
  @Common.QuickInfo : 'Fixed Asset Posting: UUID'
  key FixedAssetPostingUUID : UUID not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Ref. Doc. Line Item'
  @Common.Heading : 'Ref.It'
  @Common.QuickInfo : 'Reference Document Line Item'
  key ReferenceDocumentItem : String(6) not null;
  @Common.IsUpperCase : true
  @Common.Label : 'Ledger'
  @Common.Heading : 'Ld'
  @Common.QuickInfo : 'Ledger in General Ledger Accounting'
  key Ledger : String(2) not null;
  @Common.IsDigitSequence : true
  @Common.Label : 'Depreciation area'
  @Common.Heading : 'Ar.'
  @Common.QuickInfo : 'Real depreciation area'
  key AssetDepreciationArea : String(2) not null;
  @cds.ambiguous : 'missing on condition?'
  _FixedAssetPosting : Association to one ASSET_RETIRE.FixedAssetRetirement on _FixedAssetPosting.ReferenceDocumentItem = ReferenceDocumentItem;
  @cds.ambiguous : 'missing on condition?'
  _FixedAssetPostingLedger : Association to one ASSET_RETIRE.FixedAssetRetirementLedger {  };
};


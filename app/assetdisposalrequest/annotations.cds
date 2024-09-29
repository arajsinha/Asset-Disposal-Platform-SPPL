using AssetDisposal as service from '../../srv/service';


annotate service.RequestDetails with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : date,
        },
        {
            $Type : 'UI.DataField',
            Value : objectId,
        },
        {
            $Type : 'UI.DataField',
            Value : requestorName,
        },
        {
            $Type : 'UI.DataField',
            Value : totalPurchaseCost,
        },
        {
            $Type : 'UI.DataField',
            Value : RequestStatus_id,
        },
    ],
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'AssetDisposal.withdraw',
            Determining : true,
        },
    ],
);
annotate service.RequestDetails with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : requestorName,
            },
            {
                $Type : 'UI.DataField',
                Value : departmentName,
            },
            {
                $Type : 'UI.DataField',
                Value : totalPurchaseCost,
            },
            {
                $Type : 'UI.DataField',
                Value : RequestStatus_id,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Assets',
            ID : 'Assets',
            Target : 'assetDetails/@UI.LineItem#Assets',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Audit Trail',
            ID : 'AuditTrail',
            Target : 'AuditTrail/@UI.SelectionPresentationVariant#AuditTrail',
        },
    ]
);
annotate service.RequestDetails with @(
    UI.FieldGroup #Assets : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : assetDetails.assetNumber,
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.assetClass,
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.assetDesc,
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.assetPurchaseCost,
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.assetPurchaseDate,
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.netBookValue,
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.companyCode,
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.reasonWriteOff,
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.scrapValue,
            },],
    }
);
annotate service.AssetDetails with @(
    UI.LineItem #Assets : [
        {
            $Type : 'UI.DataField',
            Value : assetNumber,
        },
        {
            $Type : 'UI.DataField',
            Value : requestDetails.assetDetails.assetDesc,
        },
        {
            $Type : 'UI.DataField',
            Value : subNumber,
        },{
            $Type : 'UI.DataField',
            Value : assetClass,
        },
        {
            $Type : 'UI.DataField',
            Value : costCenter,
        },{
            $Type : 'UI.DataField',
            Value : assetPurchaseDate,
        },{
            $Type : 'UI.DataField',
            Value : assetPurchaseCost,
        },{
            $Type : 'UI.DataField',
            Value : companyCode,
        },
        {
            $Type : 'UI.DataField',
            Value : netBookValue,
        },{
            $Type : 'UI.DataField',
            Value : disposalMethod,
        },{
            $Type : 'UI.DataField',
            Value : scrapValue,
        },
        {
            $Type : 'UI.DataField',
            Value : reasonWriteOff,
        },]
);
annotate service.RequestDetails with @(
    UI.HeaderInfo : {
        TypeName : 'Asset Disposal Request',
        TypeNamePlural : '',
        Title : {
            $Type : 'UI.DataField',
            Value : objectId,
        },
    }
);
annotate service.AssetDetails with {
    assetNumber @(
        Common.FieldControl : #Mandatory,
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'YY1_FIXED_ASSETS_CC',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : assetNumber,
                    ValueListProperty : 'FixedAssetExternalID',
                },
            ],
            Label : 'Asset Number',
        },
        Common.ValueListWithFixedValues : false,
    )
};
annotate service.AssetDetails with {
    reasonWriteOff @Common.FieldControl : #Mandatory
};
annotate service.AssetDetails with @(
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Enter Info',
            ID : 'EnterInfo',
            Target : '@UI.FieldGroup#EnterInfo',
        },
    ],
    UI.FieldGroup #EnterInfo : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : assetNumber,
            },{
                $Type : 'UI.DataField',
                Value : assetDesc,
            },{
                $Type : 'UI.DataField',
                Value : assetClass,
            },{
                $Type : 'UI.DataField',
                Value : assetPurchaseCost,
            },{
                $Type : 'UI.DataField',
                Value : assetPurchaseDate,
            },{
                $Type : 'UI.DataField',
                Value : companyCode,
            },],
    }
);
annotate service.Workflows with @(
    UI.LineItem #AuditTrail : [
        {
            $Type : 'UI.DataField',
            Value : auditTrail.subject,
        },
        {
            $Type : 'UI.DataField',
            Value : auditTrail.timestamp,
        }
    ],
    UI.LineItem #AuditTrail1 : [
        {
            $Type : 'UI.DataField',
            Value : auditTrail.subject,
        },
        {
            $Type : 'UI.DataField',
            Value : auditTrail.timestamp,
        }
    ],
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Audit',
            ID : 'Audit',
            Target : 'auditTrail/@UI.LineItem#Audit',
        },
    ],
);

annotate service.AuditTrail with @(
    UI.LineItem #Audit : [
        {
            $Type : 'UI.DataField',
            Value : subject,
            @Common.FieldControl : #ReadOnly
        },
        {
            $Type : 'UI.DataField',
            Value : timestamp,
            @Common.FieldControl : #ReadOnly
        }
    ],
    UI.LineItem #AuditTrail : [
        {
            $Type : 'UI.DataField',
            Value : taskType,
            Label : 'taskType',
        },
        {
            $Type : 'UI.DataField',
            Value : approver,
        },
        {
            $Type : 'UI.DataField',
            Value : approverName,
            Label : 'approverName',
        },
        {
            $Type : 'UI.DataField',
            Value : timestamp,
            @Common.FieldControl : #ReadOnly
        },
        {
            $Type : 'UI.DataField',
            Value : comment,
            Label : 'comment',
        },
    ],
    UI.SelectionPresentationVariant #AuditTrail : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : {
            $Type : 'UI.PresentationVariantType',
            Visualizations : [
                '@UI.LineItem#AuditTrail',
            ],
            SortOrder : [
                {
                    $Type : 'Common.SortOrderType',
                    Property : timestamp,
                    Descending : true,
                },
            ],
        },
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
            ],
        },
    },
);

annotate service.AuditTrail with @(
     UI.CreateHidden: true
);

annotate service.AuditTrail with @(
     UI.DeleteHidden: true
);

annotate service.AuditTrail with {
    approver @Common.FieldControl : #ReadOnly
};

annotate service.YY1_FIXED_ASSETS_CC with {
    FixedAssetExternalID @Common.Text : {
        $value : FixedAssetDescription,
        ![@UI.TextArrangement] : #TextLast,
    }
};

annotate service.AssetDetails with {
    subNumber @Common.FieldControl : #ReadOnly
};

annotate service.AssetDetails with {
    assetClass @Common.FieldControl : #ReadOnly
};

annotate service.AssetDetails with {
    costCenter @Common.FieldControl : #ReadOnly
};

annotate service.AssetDetails with {
    assetPurchaseDate @Common.FieldControl : #ReadOnly
};

annotate service.AssetDetails with {
    assetPurchaseCost @Common.FieldControl : #ReadOnly
};

annotate service.AssetDetails with {
    companyCode @Common.FieldControl : #ReadOnly
};

annotate service.AssetDetails with {
    netBookValue @Common.FieldControl : #ReadOnly
};

annotate service.RequestDetails with {
    departmentName @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Departments',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : departmentName,
                    ValueListProperty : 'name',
                },
            ],
            Label : 'Department Name',
        },
        Common.ValueListWithFixedValues : false
)};

annotate service.RequestDetails with {
    RequestStatus @Common.FieldControl : #ReadOnly
};

annotate service.RequestDetails with {
    totalPurchaseCost @Common.FieldControl : #ReadOnly
};


using AssetDisposal as service from '../../srv/service';


annotate service.RequestDetails with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Request Date',
            Value : date,
        },
        {
            $Type : 'UI.DataField',
            Value : objectId,
            Label : 'Request ID',
        },
        {
            $Type : 'UI.DataField',
            Value : requestorName,
            Label : 'Requestor Name',
        },
        {
            $Type : 'UI.DataField',
            Value : totalPurchaseCost,
            Label : 'Total Purchase Cost',
        },
        {
            $Type : 'UI.DataField',
            Value : RequestStatus_id,
            Label : 'Request Status',
        },
    ],
    UI.Identification : [
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'AssetDisposal.withdraw',
            Label : 'Withdraw Request',
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
                Value : RequestStatus.id,
                Label : 'ID',
            },
            {
                $Type : 'UI.DataField',
                Value : requestorName,
                Label : 'Requestor Name',
            },
            {
                $Type : 'UI.DataField',
                Value : departmentName,
                Label : 'Department Name',
            },
            {
                $Type : 'UI.DataField',
                Value : totalPurchaseCost,
                Label : 'Total Purchase Cost',
            },
            {
                $Type : 'UI.DataField',
                Label : 'Request Status',
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
            Target : 'AuditTrail/@UI.LineItem#AuditTrail',
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
                Label : 'Asset Number',
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.assetClass,
                Label : 'Asset Class',
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.assetDesc,
                Label : 'Asset Description',
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.assetPurchaseCost,
                Label : 'Asset Purchase Cost',
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.assetPurchaseDate,
                Label : 'Asset Purchase Date',
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.netBookValue,
                Label : 'Net Book Value',
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.companyCode,
                Label : 'Company Code',
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.reasonWriteOff,
                Label : 'Write Off Reason',
            },{
                $Type : 'UI.DataField',
                Value : assetDetails.scrapValue,
                Label : 'Scrap Value',
            },],
    }
);
annotate service.AssetDetails with @(
    UI.LineItem #Assets : [
        {
            $Type : 'UI.DataField',
            Value : assetNumber,
            Label : 'Asset Number',
        },
        {
            $Type : 'UI.DataField',
            Value : requestDetails.assetDetails.assetDesc,
            Label : 'Asset Description',
        },
        {
            $Type : 'UI.DataField',
            Value : subNumber,
            Label : 'Sub No.',
        },{
            $Type : 'UI.DataField',
            Value : assetClass,
            Label : 'Asset Class',
        },
        {
            $Type : 'UI.DataField',
            Value : costCenter,
            Label : 'Cost Center',
        },{
            $Type : 'UI.DataField',
            Value : assetPurchaseDate,
            Label : 'Purchase Date',
        },{
            $Type : 'UI.DataField',
            Value : assetPurchaseCost,
            Label : 'Purchase Cost',
        },{
            $Type : 'UI.DataField',
            Value : companyCode,
            Label : 'Company Code',
        },
        {
            $Type : 'UI.DataField',
            Value : netBookValue,
            Label : 'Net Book Value',
        },{
            $Type : 'UI.DataField',
            Value : disposalMethod,
            Label : 'Disposal Method',
        },{
            $Type : 'UI.DataField',
            Value : scrapValue,
            Label : 'Salvage Value',
        },
        {
            $Type : 'UI.DataField',
            Value : reasonWriteOff,
            Label : 'Reason for Write Off',
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
                Label : 'assetNumber',
            },{
                $Type : 'UI.DataField',
                Value : assetDesc,
                Label : 'assetDesc',
            },{
                $Type : 'UI.DataField',
                Value : assetClass,
                Label : 'assetClass',
            },{
                $Type : 'UI.DataField',
                Value : assetPurchaseCost,
                Label : 'assetPurchaseCost',
            },{
                $Type : 'UI.DataField',
                Value : assetPurchaseDate,
                Label : 'assetPurchaseDate',
            },{
                $Type : 'UI.DataField',
                Value : companyCode,
                Label : 'companyCode',
            },],
    }
);
annotate service.Workflows with @(
    UI.LineItem #AuditTrail : [
        {
            $Type : 'UI.DataField',
            Value : auditTrail.subject,
            Label : 'subject',
        },
        {
            $Type : 'UI.DataField',
            Value : auditTrail.timestamp,
            Label : 'timestamp',
        }
    ],
    UI.LineItem #AuditTrail1 : [
        {
            $Type : 'UI.DataField',
            Value : auditTrail.subject,
            Label : 'subject',
        },
        {
            $Type : 'UI.DataField',
            Value : auditTrail.timestamp,
            Label : 'timestamp',
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
            Label : 'subject',
            @Common.FieldControl : #ReadOnly
        },
        {
            $Type : 'UI.DataField',
            Value : timestamp,
            Label : 'timestamp',
            @Common.FieldControl : #ReadOnly
        }
    ],
    UI.LineItem #AuditTrail : [
        {
            $Type : 'UI.DataField',
            Value : subject,
            Label : 'Subject',
            @Common.FieldControl : #ReadOnly
        },
        {
            $Type : 'UI.DataField',
            Value : timestamp,
            Label : 'Time Stamp',
            @Common.FieldControl : #ReadOnly
        },
        {
            $Type : 'UI.DataField',
            Value : recipientUsers,
            Label : 'Workflow Recipient Users',
        },
        {
            $Type : 'UI.DataField',
            Value : recipientGroups,
            Label : 'Workflow Recipient Groups',
        },
    ],
);

annotate service.AuditTrail with @(
     UI.CreateHidden: true
);

annotate service.AuditTrail with @(
     UI.DeleteHidden: true
);

annotate service.AuditTrail with {
    recipientGroups @Common.FieldControl : #ReadOnly
};

annotate service.AuditTrail with {
    recipientUsers @Common.FieldControl : #ReadOnly
};

annotate service.YY1_FIXED_ASSETS_CC with {
    FixedAssetExternalID @Common.Text : {
        $value : FixedAssetDescription,
        ![@UI.TextArrangement] : #TextLast,
    }
};

annotate service.AssetDetails with {
    assetDesc @Common.FieldControl : #ReadOnly
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


using AssetDisposal as service from '../../srv/service';

annotate service.RequestDetails actions {
    void @Common.IsActionCritical;
}

annotate service.inVoid : comment with @Common.Label: 'Comment Reason For Voiding';
annotate service.inWithdraw : comment with @Common.Label: 'Comment Reason For Withdrawing';

annotate service.RequestDetails with @(
    UI.DeleteHidden                       : true,
    UI.UpdateHidden                       : {$edmJson: {$Ne: [
        {$Path: 'canEdit'},
        true
    ]}},
    UI.LineItem                           : [
        {
            $Type: 'UI.DataField',
            Value: date,
        },
        {
            $Type: 'UI.DataField',
            Value: objectId,
        },
        {
            $Type: 'UI.DataField',
            Value: requestorName,
        },
        {
            $Type: 'UI.DataField',
            Value: totalPurchaseCost,
        },
        {
            $Type: 'UI.DataField',
            Value: RequestStatus_id,
        }
    ],
    UI.Identification                     : [
        {
            $Type        : 'UI.DataFieldForAction',
            Action       : 'AssetDisposal.withdraw',
            Determining  : true,
            Label        : 'Withdraw Request',
            ![@UI.Hidden]: {$edmJson: {$Ne: [
                {$Path: 'canWithdraw'},
                true
            ]}}
        },
        {
            $Type        : 'UI.DataFieldForAction',
            Action       : 'AssetDisposal.void',
            Determining  : true,
            Label        : 'Void',
            ![@UI.Hidden]: {$edmJson: {$Ne: [
                {$Path: 'canVoid'},
                true
            ]}}
        }
    ],
    UI.SelectionPresentationVariant #table: {
        $Type              : 'UI.SelectionPresentationVariantType',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem', ],
            SortOrder     : [{
                $Type     : 'Common.SortOrderType',
                Property  : createdAt,
                Descending: true,
            }, ],
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [],
        },
    },
);

annotate service.RequestDetails with @(
    UI.FieldGroup #GeneratedGroup1: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: requestorName,
            },
            {
                $Type: 'UI.DataField',
                Value: department_name,
            },
            {
                $Type: 'UI.DataField',
                Value: totalPurchaseCost,
            },
            {
                $Type: 'UI.DataField',
                Value: RequestStatus_id,
            },
        ],
    },
    UI.Facets                     : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneratedGroup1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Assets',
            ID    : 'Assets',
            Target: 'assetDetails/@UI.LineItem#Assets',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Audit Trail',
            ID    : 'AuditTrail',
            Target: 'AuditTrail/@UI.SelectionPresentationVariant#AuditTrail',
        },
    ]
);

annotate service.RequestDetails with @(UI.FieldGroup #Assets: {
    $Type: 'UI.FieldGroupType',
    Data : [
        {
            $Type: 'UI.DataField',
            Value: assetDetails.assetNumber,
        },
        {
            $Type: 'UI.DataField',
            Value: assetDetails.assetClass,
        },
        {
            $Type: 'UI.DataField',
            Value: assetDetails.assetDesc,
        },
        {
            $Type: 'UI.DataField',
            Value: assetDetails.assetPurchaseCost,
        },
        {
            $Type: 'UI.DataField',
            Value: assetDetails.assetPurchaseDate,
        },
        {
            $Type: 'UI.DataField',
            Value: assetDetails.netBookValue,
        },
        {
            $Type: 'UI.DataField',
            Value: assetDetails.companyCode,
        },
        {
            $Type: 'UI.DataField',
            Value: assetDetails.reasonWriteOff,
        },
        {
            $Type: 'UI.DataField',
            Value: assetDetails.scrapValue,
        },
    ],
});

annotate service.AssetDetails with @(UI.LineItem #Assets: [
    {
        $Type: 'UI.DataField',
        Value: assetNumber,
    },
    {
        $Type: 'UI.DataField',
        Value: requestDetails.assetDetails.assetDesc,
    },
    {
        $Type: 'UI.DataField',
        Value: assetClass,
    },
    {
        $Type: 'UI.DataField',
        Value: costCenter,
    },
    {
        $Type: 'UI.DataField',
        Value: assetPurchaseDate,
    },
    {
        $Type: 'UI.DataField',
        Value: assetPurchaseCost,
    },
    {
        $Type: 'UI.DataField',
        Value: companyCode,
    },
    {
        $Type: 'UI.DataField',
        Value: netBookValue,
    },
    {
        $Type: 'UI.DataField',
        Value: disposalMethod,
    },
    {
        $Type               : 'UI.DataField',
        Value               : scrapValue,
        @Common.FieldControl : salvageMandatory,
    },
    {
        $Type: 'UI.DataField',
        Value: reasonWriteOff,
    },
]);

annotate service.RequestDetails with @(UI.HeaderInfo: {
    TypeName      : 'Asset Disposal Request',
    TypeNamePlural: '',
    Title         : {
        $Type: 'UI.DataField',
        Value: objectId,
    },
});

annotate service.AssetDetails with {
    reasonWriteOff @Common.FieldControl: #Mandatory
};

annotate service.AssetDetails with @(
    UI.Facets               : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Enter Info',
        ID    : 'EnterInfo',
        Target: '@UI.FieldGroup#EnterInfo',
    }, ],
    UI.FieldGroup #EnterInfo: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: assetNumber,
            },
            {
                $Type: 'UI.DataField',
                Value: assetDesc,
            },
            {
                $Type: 'UI.DataField',
                Value: assetClass,
            },
            {
                $Type: 'UI.DataField',
                Value: assetPurchaseCost,
            },
            {
                $Type: 'UI.DataField',
                Value: assetPurchaseDate,
            },
            {
                $Type: 'UI.DataField',
                Value: companyCode,
            },
        ],
    }
);

annotate service.Workflows with @(
    UI.LineItem #AuditTrail : [
        {
            $Type: 'UI.DataField',
            Value: auditTrail.subject,
        },
        {
            $Type: 'UI.DataField',
            Value: auditTrail.timestamp,
        }
    ],
    UI.LineItem #AuditTrail1: [
        {
            $Type: 'UI.DataField',
            Value: auditTrail.subject,
        },
        {
            $Type: 'UI.DataField',
            Value: auditTrail.timestamp,
        }
    ],
    UI.Facets               : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Audit',
        ID    : 'Audit',
        Target: 'auditTrail/@UI.LineItem#Audit',
    }, ],
);

annotate service.AuditTrail with @(
    UI.LineItem #Audit                         : [
        {
            $Type               : 'UI.DataField',
            Value               : subject,
            @Common.FieldControl: #ReadOnly
        },
        {
            $Type               : 'UI.DataField',
            Value               : timestamp,
            @Common.FieldControl: #ReadOnly
        }
    ],
    UI.LineItem #AuditTrail                    : [
        {
            $Type: 'UI.DataField',
            Value: taskType,
            Label: 'Task Type',
        },
        {
            $Type: 'UI.DataField',
            Value: approver,
        },
        {
            $Type: 'UI.DataField',
            Value: approverName,
            Label: 'Approver Name',
        },
        {
            $Type: 'UI.DataField',
            Value: comment,
            Label: 'Comment',
        },
        {
            $Type               : 'UI.DataField',
            Value               : timestamp,
            @Common.FieldControl: #ReadOnly
        },
        {
            $Type: 'UI.DataField',
            Value: status,
        },
        {
            $Type : 'UI.DataField',
            Value : requestDetails.objectId,
        },
    ],
    UI.SelectionPresentationVariant #AuditTrail: {
        $Type              : 'UI.SelectionPresentationVariantType',
        PresentationVariant: {
            $Type         : 'UI.PresentationVariantType',
            Visualizations: ['@UI.LineItem#AuditTrail', ],
            SortOrder     : [{
                $Type     : 'Common.SortOrderType',
                Property  : timestamp,
                Descending: true,
            }, ],
        },
        SelectionVariant   : {
            $Type        : 'UI.SelectionVariantType',
            SelectOptions: [],
        },
    },
);

annotate service.AuditTrail with @(UI.CreateHidden: true);
annotate service.AuditTrail with @(UI.DeleteHidden: true);

annotate service.AuditTrail with {
    approver @Common.FieldControl: #ReadOnly
};

annotate service.AssetDetails with {
    subNumber @Common.FieldControl: #ReadOnly
};

annotate service.AssetDetails with {
    assetClass @Common.FieldControl: #ReadOnly
};

annotate service.AssetDetails with {
    costCenter @Common.FieldControl: #ReadOnly
};

annotate service.AssetDetails with {
    assetPurchaseDate @Common.FieldControl: #ReadOnly
};

annotate service.AssetDetails with {
    assetPurchaseCost @Common.FieldControl: #ReadOnly
};

annotate service.AssetDetails with {
    companyCode @Common.FieldControl: #ReadOnly
};

annotate service.AssetDetails with {
    netBookValue @Common.FieldControl: #ReadOnly
};

annotate service.RequestDetails with {
    totalPurchaseCost @Common.FieldControl: #ReadOnly
};


annotate service.RequestDetails with {
    RequestStatus @(
        Common.Text        : {
            $value                : RequestStatus.name,
            ![@UI.TextArrangement]: #TextOnly
        },
        Common.FieldControl: #ReadOnly
    )
};

annotate service.AssetDetails with {
    assetDesc @Common.FieldControl: #ReadOnly
};

annotate service.RequestDetails with {
    requestorName @Common.FieldControl: #ReadOnly
};

// annotate service.AssetDetails with {
//     scrapValue @Common.FieldControl:
// };

annotate service.AssetDetails with {
    disposalMethod @(
        Common.FieldControl            : #Mandatory,
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'DisposalMethod',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: disposalMethod,
                ValueListProperty: 'method',
            }, ],
            Label         : 'Disposal Method',
        },
        Common.ValueListWithFixedValues: true,
    )
};

annotate service.DepartmentAssets with @Capabilities : { FilterRestrictions : {
    $Type : 'Capabilities.FilterRestrictionsType',
    NonFilterableProperties: [department, assetDesc, costCenter, assetNumber]
}, };


annotate service.AssetDetails with {
    assetNumber @(
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'DepartmentAssets',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: assetNumber,
                    ValueListProperty: 'assetNumber',
                },
                {
                    $Type            : 'Common.ValueListParameterIn',
                    ValueListProperty: 'department',
                    LocalDataProperty: requestDetails.department_name,
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'assetDesc',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'costCenter',
                },
            ],
            Label         : 'Asset number from Department Cost Centers',
        },
        Common.ValueListWithFixedValues: false,
        Common.FieldControl : #Mandatory,
    )
};

annotate service.RequestDetails with {
    department_name @(
        Common.Text                    : {
            $value                : department.descr,
            ![@UI.TextArrangement]: #TextFirst
        },
        Common.ValueList               : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Departments',
            Parameters    : [{
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: department_name,
                ValueListProperty: 'name',
            }, ],
        },
        Common.ValueListWithFixedValues: true,
        Common.FieldControl            : #Mandatory,
    )
};

annotate service.Departments with {
    ID @Common.Text: {
        $value                : name,
        ![@UI.TextArrangement]: #TextOnly,
    }
};
annotate service.Departments with {
    name @Common.Text : {
        $value : descr,
        ![@UI.TextArrangement] : #TextFirst,
    }
};


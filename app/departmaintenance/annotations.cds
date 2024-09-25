using DepartmentMaintenance as service from '../../srv/service';
annotate service.Departments with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'name',
                Value : name,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Users',
            ID : 'Table',
            Target : 'users/@UI.LineItem#Table',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Cost Center',
            ID : 'CostCenter',
            Target : 'costCenters/@UI.LineItem#CostCenter',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'name',
            Value : name,
        },
    ],
);

annotate service.Users with @(
    UI.LineItem #Table : [
        {
            $Type : 'UI.DataField',
            Value : department_ID,
            Label : 'department_ID',
        },
        {
            $Type : 'UI.DataField',
            Value : email,
            Label : 'email',
        },
        {
            $Type : 'UI.DataField',
            Value : ID,
            Label : 'ID',
        },
    ]
);

annotate service.CostCenters with @(
    UI.LineItem #CostCenter : [
        {
            $Type : 'UI.DataField',
            Value : department.costCenters.costCenter,
            Label : 'costCenter',
        },
    ]
);


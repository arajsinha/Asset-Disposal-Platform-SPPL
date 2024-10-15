using DepartmentMaintenance as service from '../../srv/service';
annotate service.Departments with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : name,
            },
            {
                $Type : 'UI.DataField',
                Value : descr,
            }
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
            ID : 'Users',
            Target : 'users/@UI.LineItem#Users',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Cost Centers',
            ID : 'CostCenters',
            Target : 'costCenters/@UI.LineItem#CostCenters',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : name,
        },        {
            $Type : 'UI.DataField',
            Value : descr,
        },
    ],
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : descr,
        },
        TypeName : '',
        TypeNamePlural : '',
    },
);

annotate service.Users with @(
    UI.LineItem #Table : [
        {
            $Type : 'UI.DataField',
            Value : department_ID,
        },
        {
            $Type : 'UI.DataField',
            Value : email,
        },
    ],
    UI.LineItem #Users : [
        {
            $Type : 'UI.DataField',
            Value : email,
        },
    ],
);

annotate service.CostCenters with @(
    UI.LineItem #CostCenter : [
        {
            $Type : 'UI.DataField',
            Value : department.costCenters.costCenter,
        },
    ],
    UI.LineItem #CostCenters : [
        {
            $Type : 'UI.DataField',
            Value : costCenter,
        },
    ],
);


using DepartmentMaintenance as service from '../../srv/service';
annotate service.Departments with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Department Name',
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
            Label : 'name',
            Value : name,
        },
    ],
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : name,
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
            Label : 'Department ID',
        },
        {
            $Type : 'UI.DataField',
            Value : email,
            Label : 'Email ID',
        },
    ],
    UI.LineItem #Users : [
        {
            $Type : 'UI.DataField',
            Value : email,
            Label : 'email',
        },
    ],
);

annotate service.CostCenters with @(
    UI.LineItem #CostCenter : [
        {
            $Type : 'UI.DataField',
            Value : department.costCenters.costCenter,
            Label : 'Cost Center',
        },
    ],
    UI.LineItem #CostCenters : [
        {
            $Type : 'UI.DataField',
            Value : costCenter,
            Label : 'costCenter',
        },
    ],
);


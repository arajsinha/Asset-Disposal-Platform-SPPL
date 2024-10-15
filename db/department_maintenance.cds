namespace deptassets;
using { cuid, managed } from '@sap/cds/common';

entity Departments : cuid, managed {
    name         : String(20) @Common.Label: 'Department Name';
    descr        : String(50) @Common.Label: 'Description';
    users        : Composition of many Users on users.department = $self;
    costCenters  : Composition of many CostCenters on costCenters.department = $self;
}

entity Users : cuid, managed {
    email        : String(100) @Common.Label: 'Email ID'; 
    department   : Association to Departments;
}

entity CostCenters : cuid, managed {
    costCenter   : String(20) @Common.Label: 'Cost Center';
    department   : Association to Departments; // One Department per CostCenter
}

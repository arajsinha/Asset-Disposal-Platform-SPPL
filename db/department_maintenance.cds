namespace deptassets;
using { cuid, managed } from '@sap/cds/common';

entity Departments : cuid, managed {
    name         : String(100);
    users        : Association to many Users on users.department = $self;
    costCenters  : Association to many CostCenters on costCenters.department = $self;
}

entity Users : cuid, managed {
    email        : String(100);
    department   : Association to Departments;
}

entity CostCenters : cuid, managed {
    costCenter   : String(100);
    department   : Association to Departments; // One Department per CostCenter
}

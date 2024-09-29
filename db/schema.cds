namespace spassets;

using {Attachments} from '@cap-js/sdm';
using {
    sap.common.CodeList,
    cuid,
    managed
} from '@sap/cds/common';
using {YY1_FIXED_ASSET as fixedasset} from '../srv/external/YY1_FIXED_ASSET';

entity YY1_FIXED_ASSETS_CC as projection on fixedasset.YY1_FIXED_ASSETS_CC;

entity RequestDetails : cuid, managed {
    date              : Date @title: 'Date';
    requestorName     : String(100) @title: 'Requestor Name';
    departmentName    : String(100) @title: 'Department Name';
    totalPurchaseCost : String(100) @title: 'Total Purchase Cost';
    assetDetails      : Composition of many AssetDetails
                            on assetDetails.requestDetails = $self;
    objectId          : String(14) @title: 'Request ID';
    RequestStatus     : Association to one RequestStatus @title: 'Request Status';
    AuditTrail        : Association to many AuditTrail
                            on AuditTrail.requestDetails = $self;
    workflows         : Composition of many Workflows
                            on workflows.requestDetails = $self; // One RequestDetails can have many Workflows
    attachments       : Composition of many Attachments;
}

entity Workflows : cuid, managed {
    workflowID     : String;
    requestDetails : Association to RequestDetails; // Connects to RequestDetails entity
    auditTrail     : Composition of many AuditTrail
                         on auditTrail.workflows = $self; // One Workflows can have many AuditTrails
}

entity RequestStatus : CodeList {
    key id : String(3);
}

entity AssetDetails : cuid, managed {
    assetNumber       : String(19) @title: 'Asset Number';
    subNumber         : String(6) @title: 'Sub No.'; 
    costCenter        : String(12) @title: 'Cost Center';
    assetClass        : String(10) @title: 'Asset Class';
    assetDesc         : String(10) @title: 'Asset Description';
    assetPurchaseDate : Date @title: 'Purchase Date';
    assetPurchaseCost : Decimal(24, 3) @title: 'Purchase Cost';
    netBookValue      : Decimal(24, 3) @title: 'Net Book Value';
    companyCode       : String(6) @title: 'Company Code';
    reasonWriteOff    : String(100) @title: 'Reason For Write Off';
    disposalMethod    : String(100) @title: 'Disposal Method';
    scrapValue        : Decimal(24, 3) @title: 'Salvage Value';
    requestDetails    : Association to one RequestDetails;
    Currency          : String(5) @title: 'Currency';
}

entity AuditTrail : cuid, managed {
    taskID          : String(100) @title: 'Task ID';
    taskDescription : String(100) @title: 'Task Description'; // From workflow
    taskType        : String(100) @title: 'Task Type'; // Task Type configured by the end user: Verified by, Approved by ..,
    timestamp       : Timestamp @title: 'Timestamp';
    subject         : String(200) @title: 'Subject'; // From workflow
    approver        : String(100) @title: 'Approver Email';
    approverName    : String(100) @title: 'Approver Name';
    comment         : String(200) @title: 'Comment';
    workflows       : Association to Workflows; // Connects to RequestDetails entity
    requestDetails  : Association to RequestDetails; // Connects to RequestDetails entity
}

//status {}

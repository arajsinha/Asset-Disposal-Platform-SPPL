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
    date              : Date;
    requestorName     : String(100);
    departmentName    : String(100);
    totalPurchaseCost : String(100);
    assetDetails      : Composition of many AssetDetails
                            on assetDetails.requestDetails = $self;
    objectId          : String(14);
    RequestStatus     : Association to one RequestStatus;
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
    subNumber         : String(6); 
    costCenter        : String(12);
    assetClass        : String(10);
    assetDesc         : String(10);
    assetPurchaseDate : Date;
    assetPurchaseCost : Decimal(24, 3);
    netBookValue      : Decimal(24, 3);
    companyCode       : String(6);
    reasonWriteOff    : String(100);
    disposalMethod    : String(100);
    scrapValue        : Decimal(24, 3);
    requestDetails    : Association to one RequestDetails;
    Currency          : String(5);
}

entity AuditTrail : cuid, managed {
    taskID          : String(100);
    taskDescription : String(100); // From workflow
    taskType        : String(100); // Task Type configured by the end user: Verified by, Approved by ..,
    timestamp       : Timestamp;
    subject         : String(200); // From workflow
    approver        : String(100);
    approverName    : String(100);
    comment         : String(200);
    workflows       : Association to Workflows; // Connects to RequestDetails entity
    requestDetails  : Association to RequestDetails; // Connects to RequestDetails entity
}

//status {}

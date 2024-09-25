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
    requestorName     : String;
    departmentName    : String(100);
    totalPurchaseCost : Integer;
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
    assetNumber       : String;
    subNumber         : String;
    costCenter        : String;
    assetClass        : String;
    assetDesc         : String;
    assetPurchaseDate : Date;
    assetPurchaseCost : Integer;
    netBookValue      : Integer;
    companyCode       : String;
    reasonWriteOff    : String;
    disposalMethod    : String;
    scrapValue        : Integer;
    requestDetails    : Association to one RequestDetails;
}

entity AuditTrail : cuid, managed {
    taskID          : String;
    taskDescription : String;
    timestamp       : Timestamp;
    subject         : String;
    recipientUsers  : String;
    recipientGroups : String;
    workflows       : Association to Workflows; // Connects to RequestDetails entity
    requestDetails  : Association to RequestDetails; // Connects to RequestDetails entity
}

//status {}

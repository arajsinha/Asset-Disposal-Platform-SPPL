namespace spassets;

// using {Attachments} from '@cap-js/sdm';
using {Attachments} from '../attachments';
using {
    sap.common.CodeList,
    cuid,
    managed
} from '@sap/cds/common';
using {YY1_FIXED_ASSET as fixedasset} from '../srv/external/YY1_FIXED_ASSET';
using {deptassets} from './department_maintenance';

entity YY1_FIXED_ASSETS_CC as projection on fixedasset.YY1_FIXED_ASSETS_CC;

entity RequestDetails : cuid, managed {
    date              : Date                                      @title: 'Date';
    requestorName     : String(100)                               @title: 'Requestor Name';
    department        : Association to one deptassets.Departments on department.name = department_name;
    department_name     : String(20)  @title: 'Department';
    totalPurchaseCost : String(100)                               @title: 'Total Purchase Cost';
    currentWorkflowID : String(36);
    assetDetails      : Composition of many AssetDetails
                            on assetDetails.requestDetails = $self;
    objectId          : String(14)                                @title: 'Request ID';
    RequestStatus     : Association to one RequestStatus          @title: 'Request Status';
    AuditTrail        : Association to many AuditTrail
                            on AuditTrail.requestDetails = $self;
    workflows         : Composition of many Workflows
                            on workflows.requestDetails = $self; // One RequestDetails can have many Workflows
    attachments       : Composition of many Attachments;
    virtual canVoid   : Boolean;
    virtual canEdit   : Boolean;
    virtual canWithdraw   : Boolean;
    virtual canRetire   : Boolean;
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

entity DisposalMethod {
    key ID     : String(3);
        method : String(25);
}

entity AssetDetails : cuid, managed {
    assetNumber       : String(19)     @title: 'Asset Number';
    subNumber         : String(6)      @title: 'Sub No.';
    costCenter        : String(12)     @title: 'Cost Center';
    assetClass        : String(10)     @title: 'Asset Class';
    assetDesc         : String(50)     @title: 'Asset Description';
    assetPurchaseDate : Date           @title: 'Purchase Date';
    assetPurchaseCost : Decimal(24, 3) @title: 'Purchase Cost';
    netBookValue      : Decimal(24, 3) @title: 'Net Book Value';
    companyCode       : String(6)      @title: 'Company Code';
    reasonWriteOff    : String(100)    @title: 'Reason For Write Off';
    disposalMethod    : String(100)    @title: 'Proposed Method of Disposal';
    scrapValue        : Decimal(24, 3) @title: 'Salvage Value';
    requestDetails    : Association to one RequestDetails;
    Currency          : String(5)      @title: 'Currency';
    virtual salvageMandatory: String(1);
}

entity AuditTrail : cuid, managed {
    taskID          : String(100) @title: 'Task ID';
    taskDescription : String(100) @title: 'Task Description'; // From workflow
    taskType        : String(100) @title: 'Task Type'; // Task Type configured by the end user: Verified by, Approved by ..,
    timestamp       : Timestamp   @title: 'Timestamp';
    subject         : String(200) @title: 'Subject'; // From workflow
    approver        : String(100) @title: 'Approver Email';
    approverName    : String(100) @title: 'Approver Name';
    comment         : String(200) @title: 'Comment';
    status          : String(20)  @title: 'Status';
    workflows       : Association to Workflows; // Connects to RequestDetails entity
    requestDetails  : Association to RequestDetails; // Connects to RequestDetails entity
    hasVoid         : Boolean;
}

// Department Assets
@cds.persistence.skip
entity DepartmentAssets {
    key department  : String(20)       @title: 'Department ID';
    key assetNumber : String(19) @title: 'Asset Number';
        costCenter  : String(12) @title: 'Cost Center';
}

@cds.persistence.skip
entity AttachmentUpload : cuid {
    content   : LargeBinary  @Core.MediaType: mediaType  @Core.ContentDisposition.Filename: fileName  @Core.ContentDisposition.Type: 'inline';
    mediaType : String       @Core.IsMediaType;
    fileName  : String;
}

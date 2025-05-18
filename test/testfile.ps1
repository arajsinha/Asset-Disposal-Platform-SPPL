costCentersFilterInString   = `(${costCentersArray.map(center=>"CostCenter = '"+center+"'").join(' or ')})`
validityDateFilterInString  = `ValidityEndDate = '9999-12-31T00:00:00'`
assetNumberFilterInString   = `substringof(MasterFixedAsset,'61379')`
x = cds.parse.expr(`${costCentersFilterInString} and ${validityDateFilterInString} and ${assetNumberFilterInString}`)


https://my301971-api.s4hana.ondemand.com//sap/opu/odata/sap/YY1_FIXED_ASSETS_CC_CDS/YY1_FIXED_ASSETS_CC?$select=CompanyCode,MasterFixedAsset,FixedAsset,FixedAssetDescription,ValidityEndDate,CostCenter,AssetClass,FixedAssetExternalID,AssetSerialNumber,AcquisitionValueDate,OriglAcqnAmtInCoCodeCrcy,Currency&
$filter=(CostCenter%20eq%20'200910T999'%20or%20CostCenter%20eq%20'2009161602'%20or%20CostCenter%20eq%20'200930T999'%20or%20CostCenter%20eq%20'2009161604')%20and%20ValidityEndDate%20eq%20datetime'9999-12-31T00%3A00%3A00'%20and%20MasterFixedAsset%20like%20'%22613792%22'"

(CostCenter eq '200910T999' or CostCenter eq '2009161602' or CostCenter eq '200930T999' or CostCenter eq '2009161604')

CostCenter in ('200910T999','2009161602','200930T999','2009161604') and ValidityEndDate eq datetime'9999-12-31T00:00:00' and substringof(MasterFixedAsset,'61379')


(CostCenter eq '200910T999' or CostCenter eq '2009161602' or CostCenter eq '200930T999' or CostCenter eq '2009161604') and ValidityEndDate eq datetime'9999-12-31T00:00:00'
(CostCenter eq '200910T999' or CostCenter eq '2009161602' or CostCenter eq '200930T999' or CostCenter eq '2009161604') and ValidityEndDate eq datetime'9999-12-31T00:00:00' 
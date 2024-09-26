sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'assetdisposalrequest',
            componentId: 'RequestDetailsObjectPage',
            contextPath: '/RequestDetails'
        },
        CustomPageDefinitions
    );
});
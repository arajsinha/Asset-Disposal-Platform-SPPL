sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'assetdisposalrequest/test/integration/FirstJourney',
		'assetdisposalrequest/test/integration/pages/RequestDetailsList',
		'assetdisposalrequest/test/integration/pages/RequestDetailsObjectPage'
    ],
    function(JourneyRunner, opaJourney, RequestDetailsList, RequestDetailsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('assetdisposalrequest') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheRequestDetailsList: RequestDetailsList,
					onTheRequestDetailsObjectPage: RequestDetailsObjectPage
                }
            },
            opaJourney.run
        );
    }
);
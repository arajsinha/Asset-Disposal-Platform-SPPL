sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ns/assetdisposal/test/integration/FirstJourney',
		'ns/assetdisposal/test/integration/pages/RequestDetailsList',
		'ns/assetdisposal/test/integration/pages/RequestDetailsObjectPage'
    ],
    function(JourneyRunner, opaJourney, RequestDetailsList, RequestDetailsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ns/assetdisposal') + '/index.html'
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
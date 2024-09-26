sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'assetusermap/test/integration/FirstJourney',
		'assetusermap/test/integration/pages/DepartmentsList',
		'assetusermap/test/integration/pages/DepartmentsObjectPage'
    ],
    function(JourneyRunner, opaJourney, DepartmentsList, DepartmentsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('assetusermap') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheDepartmentsList: DepartmentsList,
					onTheDepartmentsObjectPage: DepartmentsObjectPage
                }
            },
            opaJourney.run
        );
    }
);
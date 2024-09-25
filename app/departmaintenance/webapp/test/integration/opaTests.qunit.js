sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'departmaintenance/test/integration/FirstJourney',
		'departmaintenance/test/integration/pages/DepartmentsList',
		'departmaintenance/test/integration/pages/DepartmentsObjectPage',
		'departmaintenance/test/integration/pages/UsersObjectPage'
    ],
    function(JourneyRunner, opaJourney, DepartmentsList, DepartmentsObjectPage, UsersObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('departmaintenance') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheDepartmentsList: DepartmentsList,
					onTheDepartmentsObjectPage: DepartmentsObjectPage,
					onTheUsersObjectPage: UsersObjectPage
                }
            },
            opaJourney.run
        );
    }
);
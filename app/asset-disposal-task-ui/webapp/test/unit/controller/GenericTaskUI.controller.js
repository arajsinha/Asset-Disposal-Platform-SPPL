/*global QUnit*/

sap.ui.define([
	"asset-disposal-task-ui/controller/GenericTaskUI.controller"
], function (Controller) {
	"use strict";

	QUnit.module("GenericTaskUI Controller");

	QUnit.test("I should test the GenericTaskUI controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});

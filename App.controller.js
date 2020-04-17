 sap.ui.define([
	"fiori/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"fiori/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("fiori.controller.App", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("DistricWiseScreen").attachPatternMatched(this._onObjectMatched, this);			
		},

		_onObjectMatched: function (oEvent) {}
	});

});
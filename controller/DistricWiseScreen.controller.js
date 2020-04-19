var that;
sap.ui.define([
	"fiori/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"fiori/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("fiori.controller.DistricWiseScreen", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fiori.view.district
		 */
		onInit: function () {
			this.getRouter().getRoute("DistricWiseScreen").attachPatternMatched(this._onObjectMatched, this);

			// var oTab = this.byId("districtTab");
			// this.oTab = oTab;
			// var oModel = new sap.ui.model.json.JSONModel();
			// this.oModel = oModel;
			// var url = "https://api.covid19india.org/state_district_wise.json";
			// var oUrl = oModel.loadData(url);
			// that = this;
			// oModel.attachRequestCompleted(function (oUrl) {
			// 	var Data = [];
			// 	debugger;
			// 	Data = that.oModel.oData;
			// 	var district = sap.ui.getCore().getModel("stateData").oData;
			// 	var districtDat = [];
			// 	districtDat = Data[sap.ui.getCore().getModel("stateData").oData].districtData;
			// 	that.oModel.setData({
			// 		"districtModel": districtDat
			// 	});
			// 	that.oTab.setModel(oModel);
			// });

		},

		_onObjectMatched: function () {
			var oTab = this.byId("districtTab");
			this.oTab = oTab;
			var oModel = new sap.ui.model.json.JSONModel();
			this.oModel = oModel;
			var url = "https://api.covid19india.org/v2/state_district_wise.json";
			var oUrl = oModel.loadData(url);
			that = this;
			oModel.attachRequestCompleted(function (oUrl) {
				debugger;
				var Data = [];
				Data = that.oModel.oData;
				var district = sap.ui.getCore().getModel("stateData").oData.state;
				var districtDat = [];
				for (var i = 0; i < Data.length; i++) {
					if (district == Data[i].state) {
						districtDat = Data[i];
					}
				}
				
				districtDat.districtData.sort(function (a, b) {
					return b.confirmed - a.confirmed;
				});				
				
				that.oModel.setData({
					"districtModel": districtDat
				});
				
				
				that.districtDat = districtDat;
				that.oTab.setModel(oModel);
				debugger;
				that.barChart();
			});

			that.byId("numconfirmed").setValue(sap.ui.getCore().getModel("stateData").oData.cCases);
			that.byId("numRecovered").setValue(sap.ui.getCore().getModel("stateData").oData.recovered);
			that.byId("numDeaths").setValue(sap.ui.getCore().getModel("stateData").oData.death);
			that.byId("numActive").setValue(sap.ui.getCore().getModel("stateData").oData.aCases);

		},

		handleBack: function () {
			this.getRouter().navTo("SubDetailScreen");
		},

		onFilterDistrict: function (oEvents) {
			// add filter for search
			var aFilters = [new sap.ui.model.Filter("district", sap.ui.model.FilterOperator.NE, 'total')];
			var sQuery = oEvents.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new sap.ui.model.Filter("district", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			// update list binding
			var oTable = this.byId("districtTab");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(new sap.ui.model.Filter({
				filters: aFilters,
				and: true
			}), "Application");

		},

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		barChart: function () {
			//      1.Get the id of the VizFrame		
			var oVizFrame = this.getView().byId("idBarChart");

			//      2.Create a JSON Model and set the data
			var oModelPie = new sap.ui.model.json.JSONModel();

			oModelPie.setData({
				"barModel": that.districtDat.districtData
			});

			//      3. Create Viz dataset to feed to the data to the graph
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'District',
					value: "{district}"
				}],

				measures: [{
					name: 'Total Cases',
					value: '{confirmed}'
				}],

				data: {
					path: "/barModel"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oModelPie);

			//      4.Set Viz properties
			oVizFrame.setVizProperties({
				title: {
					text: "Total Cases"
				},
				plotArea: {
					colorPalette: d3.scale.category20().range(),
					drawingEffect: "glossy"
				},

				toolTip: {
					visible: true
				}

				// dataLabel: {
				// 	visible: true,
				// 	type: "value",
				// 	hideWhenOverlap: false,
				// }

			});

			var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "size",
					'type': "Measure",
					'values': ["Total Cases"]
				}),

				feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "color",
					'type': "Dimension",
					'values': ["District"]
				});
			oVizFrame.removeAllFeeds();
			oVizFrame.addFeed(feedSize);
			oVizFrame.addFeed(feedColor);
		},
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fiori.view.district
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fiori.view.district
		 */
		// onAfterRendering: function() {
		// $('document').ready(function () {
		// 	this.byId("searchDistrict").focus();
		// });
		// }
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fiori.view.district
		 */
		//	onExit: function() {
		//
		//	}

	});

});

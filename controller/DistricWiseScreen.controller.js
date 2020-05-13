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
			// Start of add on 13.05.2020	
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment("fiori.Fragment.Dialog", this);
			}
			// End of add on 13.05.2020			
			this.getRouter().getRoute("DistricWiseScreen").attachPatternMatched(this._onObjectMatched, this);
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
				that.barChart();
			});
			that.byId("numConfirmed").setValue(sap.ui.getCore().getModel("stateData").oData.cCases);
			that.byId("numRecovered").setValue(sap.ui.getCore().getModel("stateData").oData.recovered);
			that.byId("numDeaths").setValue(sap.ui.getCore().getModel("stateData").oData.death);
			that.byId("numActive").setValue(sap.ui.getCore().getModel("stateData").oData.aCases);
			// Start of add on 13.05.2020
			that.byId("numTodayCases").setValue(sap.ui.getCore().getModel("stateData").oData.deltaconfirmed);
			that.byId("numTodayRec").setValue(sap.ui.getCore().getModel("stateData").oData.deltarecovered);
			that.byId("numTodayDea").setValue(sap.ui.getCore().getModel("stateData").oData.deltadeaths);
			// End of add on 13.05.2020	
		},
		// Start of add on 13.05.2020		
		todayCount: function (oEvent) {
			this.path = oEvent.getSource().getBindingContext().getPath();
			this.ind = this.path.split('/')[3];
			this.ind = parseInt(this.ind);
			this.list = sap.ui.getCore().byId("todayCount");
			this.delta = that.districtDat.districtData[this.ind];
			// this.listModel = new sap.ui.model.json.JSONModel();
			// this.listModel.setData({
			// 	"todaysData": this.delta
			// });
			// this.list.setModel(this.listModel);
			sap.ui.getCore().byId("fragCases").setValue(this.delta.delta.confirmed);
			sap.ui.getCore().byId("fragDea").setValue(this.delta.delta.deceased);
			sap.ui.getCore().byId("fragRec").setValue(this.delta.delta.recovered);
			this.oDialog.open();
		},

		fragClose: function () {
			this.oDialog.close();
		},
		// End of add on 13.05.2020
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

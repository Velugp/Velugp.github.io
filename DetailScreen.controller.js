var that;
/*global location*/
sap.ui.define([
	"fiori/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"fiori/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (
	BaseController,
	JSONModel,
	History,
	formatter,
	Filter,
	FilterOperator
) {
	"use strict";

	return BaseController.extend("fiori.controller.DetailScreen", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("DetailScreen").attachPatternMatched(this._onObjectMatched, this);
		},

		handleNext: function () {
			this.getRouter().navTo("SubDetailScreen");
		},

		handleBack: function () {
			this.getRouter().navTo("MainScreen");
		},

		_onObjectMatched: function (oEvent) {
			var dsCountry = sap.ui.getCore().getModel("modelData2").getData().modelData2;
			this.dsCountry = dsCountry;
			////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var dsCountry = sap.ui.getCore().getModel("modelData2").getData().modelData2;
			var oModelBar = new sap.ui.model.json.JSONModel();
			var oUrl = oModelBar.loadData("https://pomber.github.io/covid19/timeseries.json");
			that = this;
			oModelBar.attachRequestCompleted(function (oUrl) {
				// console.log("addressModel: " + oModel.getData());
				var dataBar = [];

				if ((dsCountry == "UK") || (dsCountry == "USA")) {

					if (dsCountry == "UK") {
						var dsCountryNew = "United Kingdom";
					} else {
						dsCountryNew = "US"
					}
				} else {
					dsCountryNew = dsCountry;
				}
				var dataCountry = [];
				dataBar = oModelBar.oData;
				dataCountry = dataBar[dsCountryNew];

				oModelBar.setData({
					"barModel": dataCountry
				});
				sap.ui.getCore().setModel(oModelBar, "barModel");
				that.dataCountry = dataCountry;
				that.barChart();
			});
			////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			
			var Data = [];
			Data = sap.ui.getCore().getModel("addressModel").getData().addressModel;
			Data = Data.filter(function (returnableObjects) {
				return returnableObjects.country === dsCountry;
			});

			this.byId("inpdsCountry").setValue(Data[0].country);
			this.byId("inpdsCases").setValue(Data[0].cases);
			this.byId("inpdstodayCases").setValue(Data[0].todayCases);
			this.byId("inpdsactive").setValue(Data[0].active);
			this.byId("inpdsrecovered").setValue(Data[0].recovered);
			this.byId("inpdscritical").setValue(Data[0].critical);
			this.byId("inpdsdeaths").setValue(Data[0].deaths);
			this.byId("inpdstodayDeaths").setValue(Data[0].todayDeaths);
		},
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		barChart: function () {
				var oVizFrame = this.getView().byId("idBarChart");
				var oVizFrame2 = this.getView().byId("idBarChart2");

				//      2.Create a JSON Model and set the data
				var oModelBar  = new sap.ui.model.json.JSONModel();
				var oModelBar2 = new sap.ui.model.json.JSONModel();
				
				oModelBar.setData({
					"barModel": that.dataCountry
				});

				oModelBar2.setData({
					"barModel2": that.dataCountry
				});
				//      3. Create Viz dataset to feed to the data to the graph
				var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					dimensions: [{
						name: 'Date',
						value: "{date}"
					}],

					measures: [{
						name: 'Confirmed Cases',
						value: '{confirmed}'

					}],

					data: {
						path: "/barModel"
					}
				});
				
//3.B
	var oDataset2 = new sap.viz.ui5.data.FlattenedDataset({
					dimensions: [{
						name: 'Date',
						value: "{date}"
					}],

					measures: [{
						name: 'Total Deaths so far',
						value: '{deaths}'

					}],

					data: {
						path: "/barModel2"
					}
				});
				oVizFrame.setDataset(oDataset);
				oVizFrame.setModel(oModelBar);
				
				oVizFrame2.setDataset(oDataset2);
				oVizFrame2.setModel(oModelBar2);

				//      4.Set Viz properties
				oVizFrame.setVizProperties({
					title: {
						text: "Confirmed Cases"
					},
					plotArea: {
						colorPalette: d3.scale.category20c().range(),
						drawingEffect: "glossy"
					}
				});
				
	//      4B.Set Viz properties
				oVizFrame2.setVizProperties({
					title: {
						text: "Deaths Reported"
					},
					plotArea: {
						colorPalette: d3.scale.category20c().range(),
						drawingEffect: "glossy"
					}
				});				

				var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "categoryAxis",
						'type': "Dimension",
						'values': ["Date"],
						'maxSizeRatio': 0.5
					}),
					feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "valueAxis",
						'type': "Measure",
						'values': ["Confirmed Cases"]
					});
					
///
			var feedSize2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "categoryAxis",
						'type': "Dimension",
						'values': ["Date"],
						'maxSizeRatio': 0.5
					}),
					feedColor2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
						'uid': "valueAxis",
						'type': "Measure",
						'values': ["Total Deaths so far"]
					});
					
					
				oVizFrame.destroyFeeds();	
				oVizFrame.addFeed(feedSize);
				oVizFrame.addFeed(feedColor);
				
				oVizFrame2.destroyFeeds();	
				oVizFrame2.addFeed(feedSize2);
				oVizFrame2.addFeed(feedColor2);				
			}
			/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	});

});
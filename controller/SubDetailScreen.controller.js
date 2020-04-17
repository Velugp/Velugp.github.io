var that;
sap.ui.define([
	"fiori/controller/BaseController",
	"fiori/model/formatter",
	"sap/ui/model/json/JSONModel"
], function (BaseController, formatter, JSONModel) {
	"use strict";

	return BaseController.extend("fiori.controller.SubDetailScreen", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("SubDetailScreen").attachPatternMatched(this._onObjectMatched, this);
			var oTab = this.byId("subDetailsTab");
			this.oTab = oTab;
			var oModel = new sap.ui.model.json.JSONModel();
			var jModel = new sap.ui.model.json.JSONModel();
			this.oModel = oModel;
			var url = "https://api.covid19india.org/data.json";
			var oUrl = oModel.loadData(url);
			that = this;
			oModel.attachRequestCompleted(function (oUrl) {
				var Data = [];
				var data_state = [];
				var data_total = [];
				Data = oModel.oData;
				var searchStr = "Total";
				for (var i = 0; i < Data["statewise"].length; i++) {
					if (searchStr == Data["statewise"][i].state) {
						data_total = Data["statewise"][i];
						jModel.setData({
							"subDetailsModelTotal": data_total
						});
						sap.ui.getCore().setModel(jModel, "subDetailsModelTotal");
						delete Data["statewise"][i];
						break;
					}
				}
				that.byId("numconfirmed").setValue(that.formatter.groupNumber(data_total.confirmed));
				that.byId("numRecovered").setValue(that.formatter.groupNumber(data_total.recovered));
				that.byId("numDeaths").setValue(that.formatter.groupNumber(data_total.deaths));
				that.byId("numActive").setValue(that.formatter.groupNumber(data_total.active));
				data_state = Data["statewise"];
				// Sorter function				
				data_state.sort(function (a, b) {
					return b.confirmed - a.confirmed;
				});
				that.oModel.setData({
					"subDetailsModel": data_state
				});
				that.data_state = data_state;
				that.oTab.setModel(oModel);
				that.pieChart();
			});
		},

		onAfterRendering: function () {
			$('document').ready(function () {
				that.byId("searchState").focus();
			});
		},

		_onObjectMatched: function (oEvent) {

		},

		onFilterState: function (oEvents) {
			// add filter for search
			var aFilters = [new sap.ui.model.Filter("state", sap.ui.model.FilterOperator.NE, 'total')];
			var sQuery = oEvents.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new sap.ui.model.Filter("state", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			// update list binding
			var oTable = this.byId("subDetailsTab");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(new sap.ui.model.Filter({
				filters: aFilters,
				and: true
			}), "Application");

		},

		handleBack: function () {
			this.getRouter().navTo("MainScreen");
		},

		tabPress: function (oEvent) {
			var stateTotal = {};
			stateTotal.state = oEvent.getSource().getCells()[0].getText();
			stateTotal.cCases = oEvent.getSource().getCells()[1].getNumber();
			stateTotal.aCases = oEvent.getSource().getCells()[2].getNumber();
			stateTotal.death = oEvent.getSource().getCells()[3].getNumber();
			stateTotal.recovered = oEvent.getSource().getCells()[4].getNumber();
			var oJsonModel = new sap.ui.model.json.JSONModel();
			oJsonModel.setData(stateTotal);
			sap.ui.getCore().setModel(oJsonModel, "stateData");
			this.getRouter().navTo("DistricWiseScreen");
		},

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		pieChart: function () {
			//      1.Get the id of the VizFrame		
			var oVizFrame = this.getView().byId("idPieChart");

			//      2.Create a JSON Model and set the data
			var oModelPie = new sap.ui.model.json.JSONModel();

			oModelPie.setData({
				"pieModel": that.data_state
			});

			//      3. Create Viz dataset to feed to the data to the graph
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'State',
					value: "{state}"
				}],

				measures: [{
					name: 'Confirmed Cases',
					value: '{confirmed}'
				}],

				data: {
					path: "/pieModel"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oModelPie);

			//      4.Set Viz properties
			oVizFrame.setVizProperties({
				title: {
					text: "Confirmed Cases"
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
					'values': ["Confirmed Cases"]
				}),

				feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "color",
					'type': "Dimension",
					'values': ["State"]
				});
			oVizFrame.removeAllFeeds();
			oVizFrame.addFeed(feedSize);
			oVizFrame.addFeed(feedColor);
		},
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	});

});
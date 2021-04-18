var that;
sap.ui.define([
	"fiori/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"fiori/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, MessageBox) {
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
			var cCases = sap.ui.getCore().getModel("stateData").oData.cCases;
			cCases = cCases.replace(/[^\d\.\-]/g, "");
			cCases = parseFloat(cCases);
			that.byId("numConfirmed").setValue(that.formatter.convertShort(cCases));
			var recovered = sap.ui.getCore().getModel("stateData").oData.recovered;
			recovered = recovered.replace(/[^\d\.\-]/g, "");
			recovered = parseFloat(recovered);
			that.byId("numRecovered").setValue(that.formatter.convertShort(recovered));
			var death = sap.ui.getCore().getModel("stateData").oData.death;
			death = death.replace(/[^\d\.\-]/g, "");
			death = parseFloat(death);
			that.byId("numDeaths").setValue(that.formatter.convertShort(death));
			var aCases = sap.ui.getCore().getModel("stateData").oData.aCases;
			aCases = aCases.replace(/[^\d\.\-]/g, "");
			aCases = parseFloat(aCases);
			that.byId("numActive").setValue(that.formatter.convertShort(aCases));
			// that.byId("numConfirmed").setValue(sap.ui.getCore().getModel("stateData").oData.cCases);
			// that.byId("numRecovered").setValue(sap.ui.getCore().getModel("stateData").oData.recovered);
			// that.byId("numDeaths").setValue(sap.ui.getCore().getModel("stateData").oData.death);
			// that.byId("numActive").setValue(sap.ui.getCore().getModel("stateData").oData.aCases);
			// Start of add on 13.05.2020
			that.byId("numTodayCases").setValue(this.formatter.groupNumber(sap.ui.getCore().getModel("stateData").oData.deltaconfirmed));
			that.byId("numTodayRec").setValue(this.formatter.groupNumber(sap.ui.getCore().getModel("stateData").oData.deltarecovered));
			that.byId("numTodayDea").setValue(this.formatter.groupNumber(sap.ui.getCore().getModel("stateData").oData.deltadeaths));
			// End of add on 13.05.2020	
		// Set Visibility of the Chart and Table
			that.byId("tableDist").setVisible(true);
			that.byId("chartDist").setVisible(true);
			that.byId("tableDist").setEnabled(false);
			that.byId("chartDist").setEnabled(true);
			that.byId("flexDist").setVisible(false);
			that.byId("simpleFormDist").setVisible(true);
		},
		// Start of add on 13.05.2020		
		todayCount: function (oEvent) {
			this.path = oEvent.getSource().getBindingContext().getPath();
			this.ind = this.path.split('/')[3];
			this.ind = parseInt(this.ind);
			this.list = sap.ui.getCore().byId("todayCount");
			this.delta = that.districtDat.districtData[this.ind];
			sap.ui.getCore().byId("fragCases").setValue(this.formatter.groupNumber(this.delta.delta.confirmed));
			sap.ui.getCore().byId("fragDea").setValue(this.formatter.groupNumber(this.delta.delta.deceased));
			sap.ui.getCore().byId("fragRec").setValue(this.formatter.groupNumber(this.delta.delta.recovered));
			if (this.delta.delta.confirmed == "0" && this.delta.delta.deceased == "0" && this.delta.delta.recovered == "0") {
				MessageBox.show("NO UPDATE FOR NOW", {
					icon: "WARNING",
					title: "NO UPDATE"
				});
				return;
			} else {
				this.titleDist = this.delta.district.concat("'s Today Count");
				sap.ui.getCore().byId("fragDist").setTitle(this.titleDist);
				this.oDialog.open();
			}
		},

		// Toggle Chart vs Table
		chartVisibleDist: function () {
			this.byId("flexDist").setVisible(true);
			this.byId("simpleFormDist").setVisible(false);
			this.byId("chartDist").setEnabled(false);
			this.byId("tableDist").setEnabled(true);
		},

		tableVisibleDist: function () {
			this.byId("flexDist").setVisible(false);
			this.byId("simpleFormDist").setVisible(true);
			this.byId("chartDist").setEnabled(false);
			this.byId("chartDist").setEnabled(true);
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
			
			var oPopOver = this.getView().byId("idPopOverPieChartDist");
			oPopOver.connect(oVizFrame.getVizUid());			

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
					// colorPalette: d3.scale.category20().range(),
					// drawingEffect: "glossy"
				},

				toolTip: {
					visible: true
				},

				dataLabel: {
					visible: true,
				}

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
		

	});

});

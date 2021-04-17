var that;
sap.ui.define([
	"fiori/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"fiori/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("fiori.controller.MainScreen", {

		formatter: formatter,

		onInit: function () {
			// Set Visibility of the Chart and Table
			this.byId("tableGlobe").setVisible(true);
			this.byId("chartGlobe").setVisible(true);
			this.byId("tableGlobe").setEnabled(false);
			this.byId("chartGlobe").setEnabled(true);
			this.byId("flexF2").setVisible(false);
			this.byId("analyticalMapGlobe").setVisible(false);

			var oTab = this.byId("mainTab");
			this.oTab = oTab;

			var oModel = new sap.ui.model.json.JSONModel();
			var url = "https://coronavirus-19-api.herokuapp.com/countries";
			var oUrl = oModel.loadData(url);
			var oGlobalBusyDialog = new sap.m.BusyDialog();
			this.oGlobalBusyDialog = oGlobalBusyDialog;
			oGlobalBusyDialog.open();
			that = this;
			oModel.attachRequestCompleted(function (oUrl) {
				var Data = [];
				Data = oModel.oData;

				// Data = Data.filter(function (returnableObjects) {
				// 	return returnableObjects.country !== "World";
				// });

				var searchStr = "North America";
				var europe = "Europe";
				var asia = "Asia";
				var south = "South America";
				var africa = "Africa";
				var total = "Total:";
				var world = "World";
				var oce = "Oceania";
				var blank = " ";
				for (var i = 0; i < Data.length; i++) {
					if (searchStr == Data[i].country || europe == Data[i].country || asia == Data[i].country ||
						south == Data[i].country || africa == Data[i].country || total == Data[i].country ||
						world == Data[i].country || oce == Data[i].country || blank == Data[i].country) {

						if (world == Data[i].country) {
							var dataWorld = [];
							dataWorld = Data[i];
							var cases = dataWorld.cases;
							// cases = that.formatter.groupNumber(cases);
							debugger;
							cases = that.formatter.convertShort(cases);
							that.byId("numCases").setValue(cases);
							that.byId("numRecovered").setValue(that.formatter.convertShort(dataWorld.recovered));
							that.byId("numDeaths").setValue(that.formatter.convertShort(dataWorld.deaths));
							that.byId("numActive").setValue(that.formatter.convertShort(dataWorld.active));
							var jsonWorld = new sap.ui.model.json.JSONModel();
							jsonWorld.setData({
								"totalModel": dataWorld
							});
							sap.ui.getCore().setModel(jsonWorld, "totalModel");
							delete Data[i];
						} else {
							delete Data[i];
						}
					}
				}
				///////////////////////////////////////////////////////////////////////////////////
				// Sorter function
				Data.sort(function (a, b) {
					return b.cases - a.cases;
				});
				//////////////////////////////////////////////////////////////////////////////////
				oModel.setData({
					"addressModel": Data
				});
				that.oTab.setModel(oModel);
				sap.ui.getCore().setModel(oModel, "addressModel");
				that.byId("numAffected").setValue(that.formatter.groupNumber(oTab.getBinding("items").iLength));
				that.Data = Data;
				that.pieChart();
				that.googleMaps();
				that.oGlobalBusyDialog.close();
				that.byId("btnIndia").focus();
			});

			// set explored app's demo model on this sample
			this.oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			var oView = this.getView();
			oView.setModel(this.oModel);
			this.oSF = oView.byId("searchCountry");
		},
		
		// Toggle Chart vs Table
		chartVisibleGlobe: function () {
			this.byId("flexF2").setVisible(true);
			this.byId("analyticalMapGlobe").setVisible(true);
			this.byId("simpleFormGlobe").setVisible(false);
			this.byId("chartGlobe").setEnabled(false);
			this.byId("tableGlobe").setEnabled(true);
		},

		tableVisibleGlobe: function () {
			this.byId("flexF2").setVisible(false);
			this.byId("analyticalMapGlobe").setVisible(false);
			this.byId("simpleFormGlobe").setVisible(true);
			this.byId("tableGlobe").setEnabled(false);
			this.byId("chartGlobe").setEnabled(true);
		},

		onAfterRendering: function () {
			$('document').ready(function () {
				that.byId("searchCountry").focus();
			});
		},

		onFilterCountry: function (oEvent) {
			// add filter for search
			var aFilters = [new sap.ui.model.Filter("country", sap.ui.model.FilterOperator.NE, 'World')];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new sap.ui.model.Filter("country", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			// update list binding
			var oTable = this.byId("mainTab");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(new sap.ui.model.Filter({
				filters: aFilters,
				and: true
			}), "Application");
		},

		// Below lines of code commented as Search was not working in mobile

		// onFilterCountry: function (oEvent) {
		// 	var aFilter = [];
		// 	// get the string which was searched by the user
		// 	var sQuery = oEvent.getParameter("query");
		// 	// create new filter object using the searched string
		// 	var oFilter = new sap.ui.model.Filter("country", FilterOperator.EQ, sQuery);
		// 	// push the newly created filter object in the blank filter array created above.
		// 	aFilter.push(oFilter);
		// 	// get the binding of items aggregation of the List
		// 	var oBinding = this.getView().byId("mainTab").getBinding("items");
		// 	// apply filter on the obtained binding
		// 	if (!oFilter.oValue1 == " ") {
		// 		oBinding.filter(aFilter);
		// 	} else {
		// 		oBinding.filter([]);
		// 	}
		// },

		// onSuggest: function (event) {
		// 	if (!this.byId("searchCountry").getValue() == " ") {
		// 		var sValue = event.getParameter("suggestValue"),
		// 			aFilters = [];
		// 		if (sValue) {
		// 			aFilters = [
		// 				new Filter([
		// 					new Filter("country", function (sText) {
		// 						return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
		// 					})
		// 				], false)
		// 			];
		// 		}
		// 		this.oSF.getBinding("suggestionItems").filter(aFilters);
		// 		this.oSF.suggest();
		// 	}
		// },

		tabPress: function (oEvents) {
			var json = new sap.ui.model.json.JSONModel();
			var mainCountry = oEvents.getSource().getCells()[0].getText();
			json.setData({
				'modelData2': mainCountry
			});
			sap.ui.getCore().setModel(json, "modelData2");
			this.getRouter().navTo("DetailScreen");
		},
		handleNext: function () {
			this.getRouter().navTo("DetailScreen");
		},

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		pieChart: function () {

			// var pieData = that.Data;
			//      1.Get the id of the VizFrame		
			var oVizFrame = this.getView().byId("idpiechart");

			var oPopOver = this.getView().byId("idPopOverPieChart");
			oPopOver.connect(oVizFrame.getVizUid());

			//      2.Create a JSON Model and set the data
			var oModelPie = new sap.ui.model.json.JSONModel();

			oModelPie.setData({
				"pieModel": that.Data
			});

			//      3. Create Viz dataset to feed to the data to the graph
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Country',
					value: "{country}"
				}],

				measures: [{
					name: 'Total Cases',
					value: '{cases}'
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
					text: "Covid cases distribution across globe"
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
					showTotal: true
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
					'values': ["Country"]
				});
			oVizFrame.addFeed(feedSize);
			oVizFrame.addFeed(feedColor);
		},
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////	

		onPress: function () {
			this.getRouter().navTo("SubDetailScreen");
		},

		onClick: function (oEvents) {
			var json = new sap.ui.model.json.JSONModel();
			var mainCountry = oEvents.getParameter("data")[0].data.Country;
			json.setData({
				'modelData2': mainCountry
			});
			sap.ui.getCore().setModel(json, "modelData2");
			this.getRouter().navTo("DetailScreen");
		},

		googleMaps: function () {
			///////////////////////////////////////////////////////////////

			// var red = 1;
			// var green = 255;
			var aMapData = [];
			var loop = that.byId("numAffected").getValue();
			// var fact = 255 / loop;
			for (var i = 0; i < loop; i++) {
				var item = [];
				var count = that.Data[i].country;

				if (count == "Madagascar") {
					var code = 'MG';
				}

				if (count == "India") {
					var code = 'IN';
				}
				if (count == "Germany") {
					var code = 'DE';
				}
				if (count == "USA") {
					var code = 'US';
				}

				if (count == "Spain") {
					var code = 'ES';
				}

				if (count == "Italy") {
					var code = 'IT';
				}
				if (count == "France") {
					var code = 'FR';
				}

				if (count == "UK") {
					var code = 'GB';
				}
				if (count == "China") {
					var code = 'CN';
				}
				if (count == "Iran") {
					var code = 'IR';
				}

				if (count == "Turkey") {
					var code = 'TR';
				}
				if (count == "Belgium") {
					var code = 'BE';
				}
				if (count == "Canada") {
					var code = 'CA';
				}
				if (count == "Portugal") {
					var code = 'PT';
				}
				if (count == "Netherlands") {
					var code = 'NL';
				}
				if (count == "Switzerland") {
					var code = 'CH';
				}
				if (count == "Brazil") {
					var code = 'BR';
				}
				if (count == "Austria") {
					var code = 'AT';
				}
				if (count == "Ireland") {
					var code = 'IE';
				}
				if (count == "Israel") {
					var code = 'IL';
				}
				if (count == "S. Korea") {
					var code = 'KR';
				}

				if (count == "Peru") {
					var code = 'PE';

				}

				if (count == "Sweden") {
					var code = 'SE';
				}

				if (count == "Chile") {
					var code = 'CL';
				}

				if (count == "Japan") {
					var code = 'JP';
				}

				if (count == "Ecuador") {
					var code = 'EC';

				}

				if (count == "Poland") {
					var code = 'PL';
				}

				if (count == "Romania") {
					var code = 'RO';
				}

				if (count == "Norway") {
					var code = 'NO';
				}

				if (count == "Denmark") {
					var code = 'DK';

				}
				//////////////////////////////////////////////////////////////////////////////////////////////////////////
				if (count == "Australia") {
					var code = 'AU';
				}

				if (count == "Pakistan") {
					var code = 'PK';

				}

				if (count == "Czechia") {
					var code = 'CZ';
				}

				if (count == "Saudi Arabia") {
					var code = 'SA';
				}

				if (count == "Mexico") {
					var code = 'MX';

				}

				if (count == "Philippines") {
					var code = 'PH';

				}

				if (count == "UAE") {
					var code = 'AE';

				}

				if (count == "Indonesia") {
					var code = 'ID';

				}

				if (count == "Malaysia") {
					var code = 'MY';

				}

				if (count == "Serbia") {
					var code = 'RS';

				}

				if (count == "Ukraine") {
					var code = 'UA';

				}

				if (count == "Panama") {
					var code = 'PA';

				}

				if (count == "Belarus") {
					var code = 'BY';

				}

				if (count == "Qatar") {
					var code = 'QA';

				}

				if (count == "Singapore") {
					var code = 'SG';
				}

				if (count == "Dominican Republic") {
					var code = 'DO';

				}

				if (count == "Luxembourg") {
					var code = 'LU';

				}

				if (count == "Finland") {
					var code = 'FI';

				}

				if (count == "Colombia") {
					var code = 'CO';

				}

				if (count == "Thailand") {
					var code = 'TH';

				}

				if (count == "Argentina") {
					var code = 'AR';

				}

				if (count == "South Africa") {
					var code = 'ZA';

				}

				if (count == "Egypt") {
					var code = 'EG';

				}

				if (count == "Greece") {
					var code = 'GR';

				}

				if (count == "Algeria") {
					var code = 'DZ';

				}

				if (count == "Moldova") {
					var code = 'MD';

				}

				if (count == "Morocco") {
					var code = 'MA';

				}

				if (count == "Croatia") {
					var code = 'HR';

				}

				if (count == "Iceland") {
					var code = 'IS';

				}

				// if (count == "Bahrain") {
				// 	var code = 'BH';

				// }

				if (count == "Myanmar") {
					var code = 'MM';

				}

				if (count == "Hungary") {
					var code = 'HU';
				}

				if (count == "Iraq") {
					var code = 'IQ';
				}

				if (count == "Kuwait") {
					var code = 'KW';
				}

				if (count == "New Zealand") {
					var code = 'NZ';
				}

				if (count == "Estonia") {
					var code = 'EE';
				}

				if (count == "Uzbekistan") {
					var code = 'UZ';
				}

				if (count == "Kazakhstan") {
					var code = 'KZ';
				}

				if (count == "Azerbaijan") {
					var code = 'AZ';
				}

				if (count == "Slovenia") {
					var code = 'SI';
				}

				if (count == "Bangladesh") {
					var code = 'BD';
				}

				if (count == "Armenia") {
					var code = 'AM';
				}

				if (count == "Bosnia and Herzegovina") {
					var code = 'BA';
				}

				if (count == "Lithuania") {
					var code = 'LT';
				}

				if (count == "Hong Kong") {
					var code = 'HK';
				}

				if (count == "North Macedonia") {
					var code = 'MK';
				}

				if (count == "Oman") {
					var code = 'OM';
				}

				if (count == "Slovakia") {
					var code = 'SK';
				}

				if (count == "Cameroon") {
					var code = 'CM';
				}

				if (count == "Cuba") {
					var code = 'CU';
				}

				if (count == "Afghanistan") {
					var code = 'AF';
				}

				if (count == "Tunisia") {
					var code = 'TN';
				}

				if (count == "Bulgaria") {
					var code = 'BG';
				}

				if (count == "Cyprus") {
					var code = 'CY';
				}

				if (count == "Sri Lanka") {
					var code = 'LK';
				}

				if (count == "Andorra") {
					var code = 'AD';
				}

				if (count == "Latvia") {
					var code = 'LV';
				}

				if (count == "Lebanon") {
					var code = 'LB';
				}

				if (count == "Ivory Coast") {
					var code = 'CI';
				}

				if (count == "Ghana") {
					var code = 'GH';
				}

				if (count == "Costa Rica") {
					var code = 'CR';
				}

				if (count == "Russia") {
					var code = 'RU';
				}

				if (count == "Mongolia") {
					var code = 'MN';
				}

				if (count == "Congo") {
					var code = 'CD';
				}

				if (count == "Nepal") {
					var code = 'NP';
				}

				if (count == "Bhutan") {
					var code = 'BT';
				}
				if (count == "Yemen") {
					var code = 'YE';
				}
				if (count == "Greenland") {
					var code = 'GL';
				}

				if (count == "Burkina Faso") {
					var code = 'BF';
				}

				if (count == "Albania") {
					var code = 'AL';

				}

				if (count == "Uruguay") {
					var code = 'UY';
				}

				if (count == "Kyrgyzstan") {
					var code = 'KG';
				}

				if (count == "Bolivia") {
					var code = 'BO';

				}

				if (count == "Djibouti") {
					var code = 'DJ';

				}

				if (count == "Honduras") {
					var code = 'HN';

				}

				if (count == "Nigeria") {
					var code = 'NG';

				}

				if (count == "Guinea") {
					var code = 'GN';

				}

				if (count == "Jordan") {
					var code = 'JO';

				}

				if (count == "Malta") {
					var code = 'MT';

				}

				if (count == "Taiwan") {
					var code = 'TW';

				}

				if (count == "Angola") {
					var code = 'AO';
				}

				if (count == "Namibia") {
					var code = 'NA';

				}

				if (count == "Suriname") {
					var code = 'SR';
				}

				if (count == "Vietnam") {
					var code = 'VN';
				}

				if (count == "Paraguay") {
					var code = 'PY';

				}

				if (count == "Libya") {
					var code = 'LY';
				}

				if (count == "Sudan") {
					var code = 'SD';

				}

				if (count == "South Sudan") {
					var code = 'SS';

				}

				if (count == "Ethiopia") {
					var code = 'ET';
				}

				if (count == "Somalia") {
					var code = 'SO';
				}

				if (count == "Niger") {
					var code = 'NE';

				}

				if (count == "Chad") {
					var code = 'TD';

				}

				if (count == "Uganda") {
					var code = 'UG';

				}

				if (count == "Mali") {
					var code = 'ML';

				}

				if (count == "Kenya") {
					var code = 'KE';
				}

				if (count == "Mauritania") {
					var code = 'MR';

				}

				if (count == "Mozambique") {
					var code = 'MZ';

				}

				if (count == "Syria") {
					var code = 'SY';
				}

				if (count == "Papua New Guinea") {
					var code = 'PG';
				}

				if (count == "Zambia") {
					var code = 'ZM';
				}

				if (count == "Zimbabwe") {
					var code = 'ZW';

				}

				if (count == "Botswana") {
					var code = 'BW';
				}

				if (count == "Tanzania") {
					var code = 'TZ';
				}

				if (count == "Cambodia") {
					var code = 'KH';
				}

				if (count == "Venezuela") {
					var code = 'VE';
				}

				if (count == "Western Sahara") {
					var code = 'EH';
				}

				if (count == "Malawi") {
					var code = 'MW';
				}

				if (count == "Gabon") {
					var code = 'GA';
				}

				if (count == "French Guiana") {
					var code = 'GF';

				}
				if (count == "Nicaragua") {
					var code = 'NI';
				}

				if (count == "Eritrea") {
					var code = 'ER';
				}

				if (count == "Benin") {
					var code = 'BJ';

				}

				if (count == "Senegal") {
					var code = 'SN';

				}

				if (count == "Liberia") {
					var code = 'LR';
				}

				if (count == "Togo") {
					var code = 'TG';
				}

				if (count == "Burundi") {
					var code = 'BI';
				}
				if (count == "Georgia") {
					var code = 'GE';
				}
				////////////////////////////////////////////////////////////////////////////////////////
				// var newGreen = green - fact * (i + 5);
				// var newRed = red + fact * (i + 10);
				// var colour = 'rgb(' + parseInt(newGreen) + "," + parseInt(newRed) + ",0" + ')';

				if (code !== "") {
					item = that.Data[i];
					if (that.Data[i].cases > 10000) {
						if (that.Data[i].cases > 100000) {
							item.colour = "rgb(255,0,0)";
						}
						if (that.Data[i].cases > 50000 && that.Data[i].cases < 100000) {
							item.colour = "rgb(128,0,0)";
						}
						if (that.Data[i].cases < 50000) {
							item.colour = "rgb(255,255,0)";
						}
					} else {
						item.colour = "rgb(0,255,0)";
					}

					item.code = code;
					aMapData.push(item);
				}
				code = "";
				item = "";
			}
			// Analytic Map: create model, set the data and set the model
			var oModelAnalMap = new sap.ui.model.json.JSONModel();
			oModelAnalMap.setSizeLimit(250);
			oModelAnalMap.setData({
				"mapData": aMapData
			});
			var oVBI = this.getView().byId("worldMap");
			oVBI.setModel(oModelAnalMap);
			sap.ui.getCore().setModel(aMapData, "regionRead");
			// Chart: create model, set the data and set the model
			// this.oChartModel = new sap.ui.model.json.JSONModel();
			// this.oChartModel.setData(that.Data);
			// this.oChart = this.getView().byId("ChartAnalytic");
			// this.oChart.setModel(this.oChartModel);
		},

		onRegionClick: function (e) {
			debugger;
			var getData = [];
			var regio = e.getParameters().code;
			getData = sap.ui.getCore().getModel("regionRead");

			for (var i = 0; i < getData.length; i++) {
				if (regio == getData[i].code) {
					var countryDetails = getData[i];
					sap.m.MessageToast.show("Total COVID19 Cases in " + countryDetails.country + " is : " + that.formatter.groupNumber(countryDetails
						.cases));
					break;
				}

			}
			var aCodes = [];
			aCodes.push(e.getParameters().code);
			var oCorr = 0.5; //A factor
			this.byId("worldMap").zoomToRegions(aCodes, oCorr);
			// sap.m.MessageToast.show("Total Cases in the Country " + e.getParameter("cases"));
		},

		onReturn: function () {
			this.byId("btnIndia").focus();
		},

		onTablePress: function () {
			this.byId("btnIndia").focus();
		},

		onPiePress: function () {
			this.byId("backToTable").focus();
		},

		onMapPress: function () {
			this.byId("backToTable").focus();
		}
	});
});

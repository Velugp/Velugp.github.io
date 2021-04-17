sap.ui.define([], function () {
	"use strict";

	return {
		groupNumber: function (sNumber) {
			var oNumFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
				groupingEnabled: true
			});
			return oNumFormat.format(sNumber);
		},

		convertShort: function (sValue) {
			var loc = "en-US";
			var oLocale = new sap.ui.core.Locale(loc);
			var oFormatOptions = {
				style: "short",
				decimals: 1,
				shortDecimals: 3
			};
			var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions,oLocale);
			return oFloatFormat.format(sValue);
		}

	};

});

sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/Device",
		"fiori/model/models"
	], function (UIComponent, Device, models) {
		"use strict";

		return UIComponent.extend("fiori.Component", {

			metadata : {
				manifest: "json"
			},

		
			init : function () {
			
				UIComponent.prototype.init.apply(this, arguments);
				this.setModel(models.createDeviceModel(), "device");
				this.getRouter().initialize();
			},

			destroy : function () {
				UIComponent.prototype.destroy.apply(this, arguments);
			},

			getContentDensityClass : function() {
				if (this._sContentDensityClass === undefined) {
					if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
						this._sContentDensityClass = "";
					} else if (!Device.support.touch) { 
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						this._sContentDensityClass = "sapUiSizeCozy";
					}
				}
				return this._sContentDensityClass;
			}

		});

	}
);
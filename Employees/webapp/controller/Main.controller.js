sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    return Controller.extend("cazz.Employees.controller.Main", {
        onInit: function () {
        },
        onCreateEmployee: function (oEvent) {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteCreateEmployee", { });
        }
    });
});
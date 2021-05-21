sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    return Controller.extend("cazz.Employees.controller.Main", {
        onInit: function () {
        },

        onCreateEmployee: function () {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteCreateEmployee", { });
        },

        onListEmployee: function () {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteListEmployee", { });
        },

        onSignOrder: function () {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteSignOrder", { });
        },
    });
});
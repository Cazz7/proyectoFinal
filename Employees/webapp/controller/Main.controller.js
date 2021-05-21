sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    return Controller.extend("cazz.Employees.controller.Main", {
        onInit: function () {
        },

        onCreateEmployee: function () {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteCreateEmployee", {});
        },

        onListEmployee: function () {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteListEmployee", {});
        },

        onSignOrder: function () {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteSignOrder", {});
        },

        onAfterRendering: function () {
            // Error en el framework: Al agregar la dirección URL de "Firmar
            //pedidos", el componente GenericTile debería navegar directamente a dicha URL,
            // pero no funciona en la versión 1.78. Por tanto, una solución encontrada es
            //eliminando la propiedad id del componente por jquery
            var genericTileFirmarPedido = this.byId("firmarPedidoTile");
            //Id del dom
            var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
            //Se vacía el id
            jQuery("#" + idGenericTileFirmarPedido)[0].id = "";
        }
    });
});
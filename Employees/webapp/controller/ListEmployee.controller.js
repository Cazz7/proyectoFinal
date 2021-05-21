// @ts-nocheck
sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/base/Log",
    "sap/m/UploadCollectionParameter",
    "sap/ui/core/Core",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/TextArea",
    "sap/m/Input",
    "sap/m/DatePicker"
], function (MessageToast, MessageBox, Controller, Device, Log, UploadCollectionParameter, Core, HorizontalLayout,
    VerticalLayout, Dialog, DialogType, Button, ButtonType, Label, Text, TextArea, Input, DatePicker) {
    "use strict";

    return Controller.extend("cazz.Employees.controller.ListEmployee", {

        onInit: function () {
            this.getSplitAppObj().setHomeIcon({
                'phone': 'phone-icon.png',
                'tablet': 'tablet-icon.png',
                'icon': 'desktop.ico'
            });

            Device.orientation.attachHandler(this.onOrientationChange, this);
        },

        onExit: function () {
            Device.orientation.detachHandler(this.onOrientationChange, this);
        },

        onItemPressEmployee: function (oEvent) {
            //Navigate to detail
            this.getSplitAppObj().to(this.createId("detailEmployee"));
            let context = oEvent.getParameter("listItem").getBindingContext("employeeModel");
            //Selected item
            this._employeeId = context.getProperty("EmployeeId");
            let detailPage = this.byId("detailEmployee");
            //binding detail Page with Employee
            detailPage.bindElement("employeeModel>/Users(EmployeeId='" + this._employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')");

        },

        getSplitAppObj: function () {
            let result = this.byId("splitAppEmployee");
            if (!result) {
                Log.info("SplitApp object can't be found");
            }
            return result;
        },

        onPressBack: function (oEvent) {
            // Back to menu
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMain", {}, true)
        },

        onDeleteEmployee: function (oEvent) {
            let contextObject = oEvent.getSource().getBindingContext("employeeModel").getObject();
            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            //Confirmation from user before saving
            MessageBox.confirm(oResourceBundle.getText("confirmDeleteEmployee"), {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        this.getView().getModel("employeeModel")
                            .remove("/Users(EmployeeId='" + this._employeeId +
                                "',SapId='" + this.getOwnerComponent().SapId +
                                "')", {
                                success: function () {
                                    //Navigate to detail
                                    this.getSplitAppObj().to(this.createId("detailUnselected"));
                                    MessageToast.show(oResourceBundle.getText("employeeDeleteSuccess"));
                                }.bind(this),
                                error: function (e) {
                                    MessageToast.show(oResourceBundle.getText("employeeDeleteError"));
                                }.bind(this)
                            });
                    }
                }.bind(this)
            });
        },

        onPromoteEmployee: function () {
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if (!this.oPromoteDialog) {
                this.oPromoteDialog = new Dialog({
                    type: DialogType.Message,
                    title: oResourceBundle.getText("textNewPromotion"),
                    content: [
                        new VerticalLayout({
                            width: "300px",
                            content: [
                                new Label({
                                    text: oResourceBundle.getText("textWage"),
                                    labelFor: "wage"
                                }),
                                new Input("wage", {
                                    width: "100%",
                                    type: "Number"
                                }),
                                new Label({
                                    text: oResourceBundle.getText("textDate"),
                                    labelFor: "date"
                                }),
                                new DatePicker("date", {
                                    width: "100%",
                                }),
                                new Label({
                                    text: oResourceBundle.getText("labelEmployeeComments"),
                                    labelFor: "comment"
                                }),
                                new TextArea("comment", {
                                    width: "100%",
                                }),

                            ]
                        })
                    ],
                    buttons: [
                        new Button({
                            type: ButtonType.Emphasized,
                            text: oResourceBundle.getText("textAccept"),
                            press: function () {
                                let sWage = Core.byId("wage").getValue();
                                let sDate = Core.byId("date").getDateValue();
                                let sComments = Core.byId("comment").getValue();
                                if (sWage !== "" && sDate !== null && sComments !== "") {
                                    let JSONBody = {
                                        Ammount: sWage,
                                        CreationDate: sDate,
                                        Comments: sComments,
                                        SapId: this.getOwnerComponent().SapId,
                                        EmployeeId: this._employeeId,
                                        Waers: "EUR"
                                    };

                                    this.getView().getModel("employeeModel").create("/Salaries", JSONBody, {
                                        success: function () {
                                            this.getView().setBusy(false);
                                            sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("textPromotionOK"));
                                            this.oPromoteDialog.close();
                                        }.bind(this),
                                        error: function () {
                                            this.getView().setBusy(false);
                                            this.oPromoteDialog.close();
                                            sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("textPromotionError"));
                                        }.bind(this)
                                    });
                                } else {
                                    MessageToast.show(oResourceBundle.getText("textMandatoryFields"));
                                }

                            }.bind(this)
                        }),
                        new Button({
                            text: oResourceBundle.getText("textCancel"),
                            press: function () {
                                this.oPromoteDialog.close();
                            }.bind(this)
                        })]
                });
            }

            this.oPromoteDialog.open();
        },

        // File handlers
        onFileDeleted: function (oEvent) {
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            let uploadCollection = oEvent.getSource();
            let sPath = oEvent.getParameter("item").getBindingContext("employeeModel").getPath();
            this.getView().getModel("employeeModel").remove(sPath, {
                success: function () {
                    MessageBox.information(oResourceBundle.getText("successDelete"));
                    uploadCollection.getBinding("items").refresh();
                }.bind(this),
                error: function () {
                    MessageBox.error(oResourceBundle.getText("errorDelete"));
                }
            });
        },

        onFileChanged: function (oEvent) {
            let oUploadCollection = oEvent.getSource();

            //Header Token CSRF - Cross-site request forgery
            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("employeeModel").getSecurityToken()
            });
            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        },

        onBeforeUploadStart: function (oEvent) {

            let oEmployeeHeaderSlug = new UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this._employeeId + ";" + oEvent.getParameter("fileName")
            });
            oEvent.getParameters().addHeaderParameter(oEmployeeHeaderSlug);
        },

        onUploadComplete: function (oEvent) {
            // Refresh model
            oEvent.getSource().getBinding("items").refresh();
        },

    });
});
// @ts-nocheck
sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/UploadCollectionParameter"
], function (Controller, JSONModel, MessageToast, MessageBox, UploadCollectionParameter) {
    "use strict";

    return Controller.extend("cazz.Employees.controller.CreateEmployee", {
        onBeforeShow: function () {
            //Clear all previous steps
            if (this._wizard) {
                var firstStep = this._wizard.getSteps()[0];
                this._wizard.discardProgress(firstStep);
                this._wizard.goToStep(firstStep);
                firstStep.setValidated(false);
                if (this.model) {

                }
            }
        },

        onInit: function () {
            const myRoute = this.getOwnerComponent().getRouter().getRoute("RouteCreateEmployee");
            myRoute.attachPatternMatched(this._onMyRoutePatternMatched, this);
        },

        _onMyRoutePatternMatched: function (event) {
            this._wizard = this.byId("createEmployeeWizard");
            this._oNavContainer = this.byId("wizardNavContainer");
            this._oWizardContentPage = this.byId("wizardContentPage");

            this.model = new JSONModel();
            this.model.setData({});
            this.getView().setModel(this.model);
            //Back to top
            var firstStep = this._wizard.getSteps()[0];
            this._wizard.discardProgress(firstStep);
            firstStep.setValidated(false);
            this._wizard.goToStep(firstStep);

        },

        onPressTypeEmployee: function (event) {

            switch (event.getSource().data("myData")) {
                case "0":
                    this._wizard.validateStep(this.byId("employeeTypeStep"));
                    this.model.setProperty("/Type", "0");
                    this.mandatoryInfoValidation();
                    break;
                case "1":
                    this._wizard.validateStep(this.byId("employeeTypeStep"));
                    this.model.setProperty("/Type", "1");
                    this.mandatoryInfoValidation();
                    break;
                case "2":
                    this._wizard.validateStep(this.byId("employeeTypeStep"));
                    this.model.setProperty("/Type", "2");
                    this.mandatoryInfoValidation();
                    break;
                default:
                    break;
            }
            // next step must be active
            if (this._wizard.getCurrentStep() === this.byId("employeeTypeStep").getId()) {
                this._wizard.nextStep();
            } else {
                this._wizard.goToStep(this.byId("employeeInfoStep"));
            }

        },

        mandatoryInfoValidation: function () {

            let employeeName = this.byId("employeeName").getValue();
            let employeeLastname = this.byId("employeeLastname").getValue();
            let employeeEntryDate = this.byId("employeeCreationDate").getValue();
            //Validate Name
            let isNameValid = this._validateName(employeeName);
            let isLastnameValid = this._validateLastname(employeeLastname);

            //Validate DNI
            let employeeDNI = this.byId("employeeDNI").getValue();
            let isDNIValid = this._validateDNI(employeeDNI);

            //Validate Date
            let isDateValid = this._validateDate(employeeEntryDate);

            if (isNameValid && isLastnameValid && isDateValid) {
                this._wizard.validateStep(this.byId("employeeInfoStep"));
                return true;
            } else {
                this._wizard.invalidateStep(this.byId("employeeInfoStep"));
                return false;
            }
        },

        optionalStepActivation: function () {
            let amount = this.byId("employeeWageSlider").getValue();
            this.model.setProperty("/Amount", amount);
        },

        //Review
        wizardCompletedHandler: function () {

            // Se verifica que los datos obligatorios sean válidos
            if (this.mandatoryInfoValidation()) {
                //Review Page
                this._oNavContainer.to(this.byId("wizardReviewPage"));

                //Archivos subidos
                let uploadCollection = this.byId("uploadCollection");
                let attachments = uploadCollection.getItems();
                let employeeNumberOfAttachments = uploadCollection.getItems().length;
                this.model.setProperty("/employeeNumberOfAttachments", employeeNumberOfAttachments);
                var arrayAttach = [];
                if (employeeNumberOfAttachments > 0) {
                    for (var i in attachments) {
                        arrayAttach.push({
                            FileName: attachments[i].getFileName()
                        });
                    }
                }
                this.model.setProperty("/employeeAttachments", arrayAttach);
            } else {
                this._wizard.goToStep(this.byId("employeeInfoStep"));
            }
        },

        backToWizardContent: function () {
            this._oNavContainer.backToPage(this._oWizardContentPage.getId());
        },

        editStepOne: function () {
            this._handleNavigationToStep(0);
        },

        editStepTwo: function () {
            this._handleNavigationToStep(1);
        },

        editStepThree: function () {
            this._handleNavigationToStep(2);
        },

        _handleNavigationToStep: function (iStepNumber) {
            var fnAfterNavigate = function () {
                this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
                this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
            }.bind(this);

            this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
            this.backToWizardContent();
        },

        _handleMessageBoxOpen: function (sMessage, sMessageBoxType, sActionType) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        if (sActionType === "cancel") {
                            //Back to menu
                            this._oNavContainer.back();
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            oRouter.navTo("RouteMain", {}, true);
                        } else {
                            //Create employee
                            this._saveEmployee();
                        }
                    }
                }.bind(this)
            });
        },

        _saveEmployee: function (sPath) {
            let dataModel = this.getView().getModel().getData();
            this.getView().setBusy(true);
            let JSONBody = {
                Type: dataModel.Type,
                SapId: this.getOwnerComponent().SapId,
                FirstName: dataModel.FirstName,
                LastName: dataModel.LastName,
                Dni: dataModel.Dni,
                CreationDate: dataModel.CreationDate,
                Comments: dataModel.Comments,
                UserToSalary: [{
                    Ammount: parseFloat(dataModel.Amount).toString(),
                    Comments: dataModel.Comments,
                    Waers: "EUR",
                }]
            };

            this.getView().getModel("employeeModel").create("/Users", JSONBody, {
                success: function (data) {
                    this.getView().setBusy(false);
                    this._employeeId = data.EmployeeId;
                    sap.m.MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("empleadoCreado") + ": " + this._employeeId, {
                        onClose: function () {
                            //Back to menu

                            this._oNavContainer.back();
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            oRouter.navTo("RouteMain", {}, true);
                        }.bind(this)
                    });
                    //Se llama a la función "upload" del uploadCollection
                    this._uploadDocument();
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                }.bind(this)
            });

        },

        _setEmptyValue: function (sPath) {
            this.model.setProperty(sPath, "");
        },

        _validateName: function (sName) {
            if (sName.length < 2) {
                this.model.setProperty("/stateEmployeeName", "Error");
                this.model.setProperty("/employeeNameValid", false);
                return false;
            } else {
                this.model.setProperty("/stateEmployeeName", "None");
                this.model.setProperty("/employeeNameValid", true);
                return true;
            }


        },

        _validateDate: function (sDate) {

            if (sDate === "") {
                this.model.setProperty("/stateEmployeeEntryDate", "Error");
                this.model.setProperty("/employeeEntryDateValid", false);
                return false;
            } else {
                this.model.setProperty("/stateEmployeeEntryDate", "None");
                this.model.setProperty("/employeeEntryDateValid", true);
                return true;
            };

        },

        _validateLastname: function (sLastname) {
            if (sLastname.length < 2) {
                this.model.setProperty("/stateEmployeeLastname", "Error");
                this.model.setProperty("/employeeLastnameValid", false);
                return false;
            } else {
                this.model.setProperty("/stateEmployeeLastname", "None");
                this.model.setProperty("/employeeLastnameValid", true);
                return true;
            }
        },

        _validateDNI: function (sDNI) {
            let number;
            let letter;
            let letterList;
            let regularExp = /^\d{8}[a-zA-Z]$/;
            //Se comprueba que el formato es válido
            if (regularExp.test(sDNI) === true) {
                //Número
                number = sDNI.substr(0, sDNI.length - 1);
                //Letra
                letter = sDNI.substr(sDNI.length - 1, 1);
                number = number % 23;
                letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                letterList = letterList.substring(number, number + 1);
                if (letterList !== letter.toUpperCase()) {
                    this.model.setProperty("/stateEmployeeDNI", "Error");
                    this.model.setProperty("/employeeDNIValid", false);
                    return false;
                } else {
                    this.model.setProperty("/stateEmployeeDNI", "None");
                    this.model.setProperty("/employeeDNIValid", true);
                    return true;
                }
            } else {
                this.model.setProperty("/stateEmployeeDNI", "Error");
                this.model.setProperty("/employeeDNIValid", false);
                return false;
            }
        },

        handleWizardCancel: function () {
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            this._handleMessageBoxOpen(oResourceBundle.getText("textCancel"), "warning", "cancel");
        },

        handleWizardSubmit: function () {
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            this._handleMessageBoxOpen(oResourceBundle.getText("textSubmit"), "confirm", "save");
        },

        discardProgress: function () {
            this._wizard.discardProgress(this.byId("employeeTypeStep"));

            var clearContent = function (content) {
                for (var i = 0; i < content.length; i++) {
                    if (content[i].setValue) {
                        content[i].setValue("");
                    }

                    if (content[i].getContent) {
                        clearContent(content[i].getContent());
                    }
                }
            };

            this.model.setProperty("/stateEmployeeName", "Error");
            this.model.setProperty("/employeeNameValid", false);
            this.model.setProperty("/stateEmployeeLastname", "Error");
            this.model.setProperty("/employeeLastnameValid", false);
            this.model.setProperty("/stateEmployeeEntryDate", "Error");
            this.model.setProperty("/employeeEntryDateValid", false);
            this.model.setProperty("/stateEmployeeDNI", "Error");
            this.model.setProperty("/employeeDNIValid", false);
            clearContent(this._wizard.getSteps());
        },
        // File handlers
        onFileChange: function (oEvent) {
            let oUploadCollection = oEvent.getSource();

            //Header Token CSRF - Cross-site request forgery
            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("employeeModel").getSecurityToken()
            });
            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        },

        onBeforeUploadStarts: function (oEvent) {

            var oEmployeeHeaderSlug = new UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this._employeeId + ";" + oEvent.getParameter("fileName")
            });
            oEvent.getParameters().addHeaderParameter(oEmployeeHeaderSlug);
        },

        _uploadDocument: function () {
            let oUploadCollection = this.byId("uploadCollection");
            oUploadCollection.upload();
        }

    });
});

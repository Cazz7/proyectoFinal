sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("cazz.Employees.controller.CreateEmployee", {
        onInit: function () {
            this._wizard = this.byId("CreateProductWizard");
            this._oNavContainer = this.byId("wizardNavContainer");
            this._oWizardContentPage = this.byId("wizardContentPage");

            this.model = new JSONModel();
            this.model.setData({
                employeeNameState: "None",
                employeeSurnameState: "None"
            });
            this.getView().setModel(this.model);
            this.model.setProperty("/productType", "Mobile");
            this.model.setProperty("/availabilityType", "In Store");
            this.model.setProperty("/navApiEnabled", true);
            this.model.setProperty("/productVAT", false);
            this.model.setProperty("/measurement", "");
            this._setEmptyValue("/productManufacturer");
            this._setEmptyValue("/productDescription");
            this._setEmptyValue("/size");
            this._setEmptyValue("/productPrice");
            this._setEmptyValue("/manufacturingDate");
            this._setEmptyValue("/discountGroup");

        },
        onPressTypeEmployee: function (event) {
            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            switch (event.getSource().data("myData")) {
                case "interno":
                    this._wizard.validateStep(this.byId("employeeTypeStep"));
                    this.model.setProperty("/employeeType", "interno");
                    this.additionalInfoValidation();
                    break;
                case "autonomo":
                    this._wizard.validateStep(this.byId("employeeTypeStep"));
                    this.model.setProperty("/employeeType", "autonomo");
                    this.additionalInfoValidation();
                    break;
                case "gerente":
                    this._wizard.validateStep(this.byId("employeeTypeStep"));
                    this.model.setProperty("/employeeType", "gerente");
                    this.additionalInfoValidation();
                    break;
                default:
                    break;
            }
        },
        setProductType: function (evt) {
            var productType = evt.getSource().getTitle();
            this.model.setProperty("/productType", productType);
            this.byId("ProductStepChosenType").setText("Chosen product type: " + productType);
            this._wizard.validateStep(this.byId("employeeTypeStep"));
        },

        setProductTypeFromSegmented: function (evt) {
            var productType = evt.getParameters().item.getText();
            this.model.setProperty("/productType", productType);
            this._wizard.validateStep(this.byId("employeeTypeStep"));
        },

        additionalInfoValidation: function () {
            
            let employeeName = this.byId("employeeName").getValue();
            let employeeSurname = this.byId("employeeSurname").getValue();
            let employeeEntryDate = this.byId("employeeEntryDate").getValue();
            //Validate Name
            let isNameValid = this._validateName(employeeName);
            let isSurnameValid = this._validateSurname(employeeSurname);

            //Validate DNI
            let employeeDNI = this.byId("employeeDNI").getValue();
            let isDNIValid = this._validateDNI(employeeDNI);

            //Validate Date
            let isDateValid = this._validateDate(employeeEntryDate);

            if (isNameValid && isSurnameValid && isDateValid) {
                this._wizard.validateStep(this.byId("ProductInfoStep"));
            } else {
                this._wizard.invalidateStep(this.byId("ProductInfoStep"));
            }

            // Delete
            var name = this.byId("ProductName").getValue();
            var weight = parseInt(this.byId("ProductWeight").getValue());

            if (isNaN(weight)) {
                this.model.setProperty("/productWeightState", "Error");
            } else {
                this.model.setProperty("/productWeightState", "None");
            }

            if (name.length < 6) {
                this.model.setProperty("/productNameState", "Error");
            } else {
                this.model.setProperty("/productNameState", "None");
            }

            if (name.length < 6 || isNaN(weight)) {
                this._wizard.invalidateStep(this.byId("ProductInfoStep"));
            } else {
                this._wizard.validateStep(this.byId("ProductInfoStep"));
            }
            //Delete
        },

        optionalStepActivation: function () {
            MessageToast.show(
                'This event is fired on activate of Step3.'
            );
        },

        optionalStepCompletion: function () {
            MessageToast.show(
                'This event is fired on complete of Step3. You can use it to gather the information, and lock the input data.'
            );
        },

        pricingActivate: function () {
            this.model.setProperty("/navApiEnabled", true);
        },

        pricingComplete: function () {
            this.model.setProperty("/navApiEnabled", false);
        },

        scrollFrom4to2: function () {
            this._wizard.goToStep(this.byId("ProductInfoStep"));
        },

        goFrom4to3: function () {
            if (this._wizard.getProgressStep() === this.byId("PricingStep")) {
                this._wizard.previousStep();
            }
        },

        goFrom4to5: function () {
            if (this._wizard.getProgressStep() === this.byId("PricingStep")) {
                this._wizard.nextStep();
            }
        },

        wizardCompletedHandler: function () {
            this._oNavContainer.to(this.byId("wizardReviewPage"));
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

        editStepFour: function () {
            this._handleNavigationToStep(3);
        },

        _handleNavigationToStep: function (iStepNumber) {
            var fnAfterNavigate = function () {
                this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
                this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
            }.bind(this);

            this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
            this.backToWizardContent();
        },

        _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
            MessageBox[sMessageBoxType](sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        this._handleNavigationToStep(0);
                        this._wizard.discardProgress(this._wizard.getSteps()[0]);
                    }
                }.bind(this)
            });
        },

        _setEmptyValue: function (sPath) {
            this.model.setProperty(sPath, "");
        },

        _validateName: function (sName) {
            if (sName.length < 2) {
                this.model.setProperty("/stateEmployeeName", "Error");
                return false;
            } else {
                this.model.setProperty("/stateEmployeeName", "None");
                return true;
            }


        },

        _validateDate: function (sDate) {

            if (sDate === "") {
                this.model.setProperty("/stateEmployeeEntryDate", "Error");
                return false;
            } else {
                this.model.setProperty("/stateEmployeeEntryDate", "None");
                return true;
            };

        },

        _validateSurname: function (sSurname) {
            if (sSurname.length < 2) {
                this.model.setProperty("/stateEmployeeSurname", "Error");
                return false;
            } else {
                this.model.setProperty("/stateEmployeeSurname", "None");
                return true;
            }
        },

        _validateDNI: function (sDNI) {
            let number;
            let letter;
            let letterList;
            let regularExp = /^\d{8}[a-zA-Z]$/;
            // Si es CIF no se hace valdación
            if (this.model.getProperty("/employeeType") !== "autonomo") {
                //Se comprueba que el formato es válido
                if (regularExp.test(sDNI) === true) {
                    //Número
                    number = sDNI.substring(0, sDNI.length - 1);
                    //Letra
                    letter = sDNI.substring(sDNI.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    if (letterList !== letterList.toUpperCase()) {
                        this.model.setProperty("/stateEmployeeDNI", "Error");
                        return false;
                    } else {
                        this.model.setProperty("/stateEmployeeDNI", "None");
                        return true;
                    }
                } else {
                    this.model.setProperty("/stateEmployeeDNI", "Error");
                    return false;
                }
            }else{
                if (sDNI.length < 1) {
                    this.model.setProperty("/stateEmployeeDNI", "Error");
                    return false;
                }else{
                    this.model.setProperty("/stateEmployeeDNI", "None");
                    return true;
                }
            }
        },

        handleWizardCancel: function () {
            this._handleMessageBoxOpen("Are you sure you want to cancel your report?", "warning");
        },

        handleWizardSubmit: function () {
            this._handleMessageBoxOpen("Are you sure you want to submit your report?", "confirm");
        },

        productWeighStateFormatter: function (val) {
            return isNaN(val) ? "Error" : "None";
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

            this.model.setProperty("/productWeightState", "Error");
            this.model.setProperty("/productNameState", "Error");
            clearContent(this._wizard.getSteps());
        }
    });
});

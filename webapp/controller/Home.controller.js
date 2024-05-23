sap.ui.define([
	"com/infocus/bankFioriApp/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageBox",
	"sap/viz/ui5/api/env/Format",
	"com/infocus/bankFioriApp/libs/html2pdf.bundle"
], function(BaseController, Filter, FilterOperator, JSONModel, MessageBox, Format, html2pdf_bundle) {
	"use strict";

	return BaseController.extend("com.infocus.bankFioriApp.controller.Home", {

		/*************** on Load Functions *****************/
		onInit: function() {

			this.oRouter = this.getOwnerComponent().getRouter();

			// call the input parameters data
			/*this.getLedgerParametersData();*/
			this.getcompanyCodeParametersData();

			// Update the global data model
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/prfitCentrGrp", "PRS");
				oGlobalDataModel.setProperty("/listFlag", "X");
				oGlobalDataModel.setProperty("/togglePanelVisibility", "X");
				oGlobalDataModel.setProperty("/pdfTableName", "Detailed List");
			}

			/*this._validateInputFields();*/
			this._columnVisible();

		},
		_validateInputFields: function() {
			/*var inputLedger = this.byId("inputLedger");*/
			var inputCompanyCode = this.byId("inputCompanyCode");
			var datePickerFrom = this.byId("fromDate");
			var datePickerTo = this.byId("toDate");

			var isValid = true;
			var message = '';

			if (!inputCompanyCode.getValue()) {
				inputCompanyCode.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'Company Code, ';
			} else {
				inputCompanyCode.setValueState(sap.ui.core.ValueState.None);
			}

			if (!datePickerFrom.getValue()) {
				datePickerFrom.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'From Date, ';
			} else {
				datePickerFrom.setValueState(sap.ui.core.ValueState.None);
			}

			if (!datePickerTo.getValue()) {
				datePickerTo.setValueState(sap.ui.core.ValueState.Error);
				isValid = false;
				message += 'To Date, ';
			} else {
				datePickerTo.setValueState(sap.ui.core.ValueState.None);
			}

			if (!isValid) {
				// Remove the last comma and space from the message
				message = message.slice(0, -2);
				sap.m.MessageBox.show("Please fill up the following fields: " + message);
				return false;
			}

			// Set global data properties
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/cmpnyCode", inputCompanyCode.getValue());
				oGlobalDataModel.setProperty("/fromDate", this.formatDate(new Date(datePickerFrom.getValue())));
				oGlobalDataModel.setProperty("/toDate", this.formatDate(new Date(datePickerTo.getValue())));
			}

			return true;
		},
		formatDate: function(oDate) {
			var iYear = oDate.getFullYear();
			var iMonth = oDate.getMonth() + 1;
			var iDay = oDate.getDate();

			// Pad month and day with leading zeros if necessary
			var sMonth = iMonth < 10 ? '0' + iMonth : iMonth.toString();
			var sDay = iDay < 10 ? '0' + iDay : iDay.toString();

			// Concatenate year, month, and day into 'YYYYMMDD' format
			return iYear.toString() + sMonth + sDay;
		},
		onLiveChange: function(oEvent) {
			var oInput = oEvent.getSource();
			var sInputId = oInput.getId();
			var sInputValue = oInput.getValue();
			var sProperty;

			// update based on the input field ID
			if (sInputId.endsWith("--inputCompanyCode")) {
				sProperty = "/cmpnyCode";
			} else if (sInputId.endsWith("--fromDate")) {
				sProperty = "/fromDate";
			} else if (sInputId.endsWith("--toDate")) {
				sProperty = "/toDate";
			}

			// Update the global data model property
			if (sProperty) {
				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty(sProperty, sInputValue);
				}
			}
		},
		_columnVisible: function() {
			var oColumnVisible = this.getOwnerComponent().getModel("columnVisible");

			var data = {};
			data.glAcct = true;
			data.glAcctLongText = true;
			data.graphColumnVisible = false;
			/*for (var i = 1; i <= 16; i++) {
				var key = "l" + (i < 10 ? '0' + i : i) + "VFlag";
				data[key] = false;
			}*/

			oColumnVisible.setData(data);
		},

		/*************** get parameters data *****************/
		getcompanyCodeParametersData: function() {
			var that = this;
			var parameterModel = this.getOwnerComponent().getModel("parameterModel");
			var pUrl = "/ZCOMPANYSet";

			sap.ui.core.BusyIndicator.show();
			parameterModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var ocompanyCodeDataModel = that.getOwnerComponent().getModel("companyCodeData");
					ocompanyCodeDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});

		},
		getLedgerParametersData: function() {
			var that = this;
			var parameterModel = this.getOwnerComponent().getModel("parameterModel");
			var pUrl = "/ZLEDGERSet";

			sap.ui.core.BusyIndicator.show();
			parameterModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var oledgerDataModel = that.getOwnerComponent().getModel("ledgerData");
					oledgerDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);

				}
			});

		},

		/*************** set the inputId & create the fragment *****************/

		handleValueCompanyCode: function(oEvent) {
			this._companyCodeInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogComapanyCode) {
				this.oOpenDialogComapanyCode = sap.ui.xmlfragment("com.infocus.bankFioriApp.view.dialogComponent.DialogComapanyCode", this);
				this.getView().addDependent(this.oOpenDialogComapanyCode);
			}
			this.oOpenDialogComapanyCode.open();
		},
		handleValueLedger: function(oEvent) {
			this._ledgerInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogLedger) {
				this.oOpenDialogLedger = sap.ui.xmlfragment("com.infocus.bankFioriApp.view.dialogComponent.DialogLedger", this);
				this.getView().addDependent(this.oOpenDialogLedger);
			}
			this.oOpenDialogLedger.open();
		},

		/*************** search value within fragment *****************/

		_handleValueCompanyCodeSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Companycode",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueLedgerSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Rldnr",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		/*************** set the each property to globalData & reflect data in input field  *****************/

		_handleValueCompanyCodeClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._companyCodeInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/cmpnyCode", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleValueLedgerClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._ledgerInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/ledgrNo", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		/*************** radio Button & drop down selection  *****************/

		onRadioButtonSelectReports: function(oEvent) {
			var radioButtonSelectReport = oEvent.getSource();
			var selectedButtonReport = radioButtonSelectReport.getSelectedButton().getText();

			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/prfitCentrGrp", selectedButtonReport);
			}
		},
		onRadioButtonSelectList: function(oEvent) {
			var radioButtonList = oEvent.getSource();
			var selectedButtonListText = radioButtonList.getSelectedButton().getText();

			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/listFlag", selectedButtonListText === "Detailed List" ? 'X' : '');
				oGlobalDataModel.setProperty("/pdfTableName", selectedButtonListText);
			}

		},
		_toggleSwitches: function (isEnabled) {
            var splitViewSwitch = this.byId("splitViewSwitch");
            var tabularDataSwitch = this.byId("tabularDataSwitch");
            var chartDataSwitch = this.byId("chartDataSwitch");

            splitViewSwitch.setEnabled(isEnabled);
            tabularDataSwitch.setEnabled(isEnabled);
            chartDataSwitch.setEnabled(isEnabled);
        },
		onSelectChartType: function(oEvent) {
			// Get the selected radio button
			var selectedIndex = oEvent.getParameter("selectedIndex");
			var oVizFrame = this.byId("oVizFrame");
			var chartType;

			switch (selectedIndex) {
				case 0:
					chartType = "column";
					break;
				case 1:
					chartType = "line";
					break;
				default:
					chartType = "column";
			}

			// Update the vizType of the VizFrame
			oVizFrame.setVizType(chartType);
		},
		onTabularToChartChanged: function(oEvent) {
			var oSwitch = oEvent.getSource();
			var sId = oSwitch.getId();
			var aSwitches = [
				this.byId("splitViewSwitch"),
				this.byId("tabularDataSwitch"),
				this.byId("chartDataSwitch")
			]; // Array of all switches

			// SplitterLayoutData elements
			var oSplitterLayoutData1 = this.byId("splitterLayoutData1");
			var oSplitterLayoutData2 = this.byId("splitterLayoutData2");

			// which switch was toggled and get the corresponding text
			var sText;
			if (sId === this.byId("splitViewSwitch").getId()) {
				sText = "Split View";
			} else if (sId === this.byId("tabularDataSwitch").getId()) {
				sText = "Tabular Data";
			} else if (sId === this.byId("chartDataSwitch").getId()) {
				sText = "Chart Data";
			} else {
				sText = "";
			}

			// If a valid switch was toggled
			if (sText) {
				// Turn off other switches and update SplitterLayoutData sizes
				aSwitches.forEach(function(s) {
					if (s.getId() !== sId) {
						s.setState(false);
					}
				});

				// Perform actions based on the text value of the toggled switch
				switch (sText) {
					case "Split View":
						oSplitterLayoutData1.setSize("50%");
						oSplitterLayoutData2.setSize("50%");
						break;
					case "Tabular Data":
						oSplitterLayoutData1.setSize("100%");
						oSplitterLayoutData2.setSize("0%");
						break;
					case "Chart Data":
						oSplitterLayoutData1.setSize("0%");
						oSplitterLayoutData2.setSize("100%");
						break;
					default:
						break;
				}
			}
		},

		/*************** Table column visible on based on flag  *****************/

		_assignVisiblity: function(oData, then) {
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oColumnVisibleData = then.getOwnerComponent().getModel("columnVisible").getData();

			oColumnVisibleData.glAcct = oData[0].Hkont === "" ? false : true;
			oColumnVisibleData.glAcctLongText = oData[0].GlText === "" ? false : true;
			oColumnVisibleData.graphColumnVisible = oData[0].DET_FLAG === "X" ? false : true;
			oGlobalData.togglePanelVisibility = oData[0].DET_FLAG === "X" ? "X" : "";

			// SplitterLayoutData elements
			var oSplitterLayoutData1 = this.byId("splitterLayoutData1");
			var oSplitterLayoutData2 = this.byId("splitterLayoutData2");

			/*for (var i = 1; i <= 16; i++) {
				var flagKey = "L" + (i < 10 ? '0' + i : i) + "_FLAG";
				var columnKey = "l" + (i < 10 ? '0' + i : i) + "VFlag";
				oColumnVisibleData[columnKey] = oData[0][flagKey] === 'X' ? true : false;
			}*/

			// set the state
			this._toggleSwitches(true);
			this.byId("downloadPdfBtn").setEnabled(true);
			this.loadDefaultGraph();
			this.byId("panelForm").setExpanded(false);
			this.byId("splitViewSwitch").setState(true);
			this.byId("tabularDataSwitch").setState(false);
			this.byId("chartDataSwitch").setState(false);
			
			
			// Update SplitterLayoutData sizes for split view
			oSplitterLayoutData1.setSize("50%");
			oSplitterLayoutData2.setSize("50%");

			then.getOwnerComponent().getModel("columnVisible").setData(oColumnVisibleData);
			then.getOwnerComponent().getModel("globalData").setData(oGlobalData);
		},

		/*************** get the table data from oData service  *****************/

		getListData: function() {
			// Validate input fields
			if (!this._validateInputFields()) {
				return;
			}

			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();

			/*var ledgrNo = new Filter('Rldnr', FilterOperator.EQ, oGlobalData.ledgrNo);*/
			var cmpnyCode = new Filter('Bukrs', FilterOperator.EQ, '1100');
			var prfitCentrGrp = new Filter('PrctrGr', FilterOperator.EQ, oGlobalData.prfitCentrGrp);
			var fromDate = new Filter('FmDate', FilterOperator.EQ, oGlobalData.fromDate);
			var toDate = new Filter('ToDate', FilterOperator.EQ, oGlobalData.toDate);
			var listFlag = new Filter('DET_FLAG', FilterOperator.EQ, oGlobalData.listFlag);

			sap.ui.core.BusyIndicator.show();

			/*var bURL = "/ZFI_BANKBAL_SRV/ZFI_BANKSet?$filter=Bukrs eq '1100' and PrctrGr eq 'FTRS' and FmDate eq '20230401' and ToDate eq '20240515' and DET_FLAG eq 'X'";*/

			var bURL = "/ZFI_BANK_GRSet";

			oModel.read(bURL, {
				urlParameters: {
					"sap-client": "400"
				},
				filters: [cmpnyCode, prfitCentrGrp, fromDate, toDate, listFlag],
				success: function(response) {
					var oData = response.results;
					console.log(oData);

					// Format decimal properties to 2 digits after the decimal point
					oData.forEach(function(item) {
						that._formatDecimalProperties(item, that);
					});

					var oListDataModel = that.getOwnerComponent().getModel("listData");
					oListDataModel.setData(oData);

					// check in oData value is available or not 
					if (typeof oData !== 'undefined' && oData.length === 0) {

						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.information('There are no data available!');
						that._columnVisible();
					} else {
						that._assignVisiblity(oData, that);

						sap.ui.core.BusyIndicator.hide();
					}

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});

		},
		_formatDecimalProperties: function(obj, then) {
			for (var key in obj) {

				if (key === 'Hkont') {
					continue;
				} else if (typeof obj[key] === "object") {
					continue;
				} else if (!isNaN(parseFloat(obj[key])) && isFinite(obj[key])) {
					obj[key] = parseFloat(obj[key]).toFixed(2);
				}
			}

		},
		clearListData: function() {
			var that = this;

			sap.m.MessageBox.confirm(
				"Are you sure you want to clear all data?", {
					onClose: function(oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							// Clear input fields
							/*that.byId("inputLedger").setValue("0L");*/
							that.byId("inputCompanyCode").setValue("1100");
							that.byId("fromDate").setValue("");
							that.byId("toDate").setValue("");

							// Deselect radio buttons
							that.byId("PRS").setSelected(true);
							that.byId("FTRS").setSelected(false);
							that.byId("CORP").setSelected(false);
							that.byId("companytotal").setSelected(false);
							that.byId("detailedlist").setSelected(true);
							that.byId("summarylist").setSelected(false);

							// Clear list data
							var oListDataModel = that.getOwnerComponent().getModel("listData");
							oListDataModel.setData({});

							// clear the chart data 
							var oChartDataModel = that.getOwnerComponent().getModel("chartData");
							oChartDataModel.setData({});

							// Update global data model properties
							var oGlobalDataModel = that.getOwnerComponent().getModel("globalData");
							if (oGlobalDataModel) {
								oGlobalDataModel.setProperty("/listFlag", "X");
								oGlobalDataModel.setProperty("/togglePanelVisibility", "X");
							}
							// disbaled the switches
							that._toggleSwitches(false);
							
							// change the state of switches 
							that.byId("splitViewSwitch").setState(false);
							that.byId("tabularDataSwitch").setState(false);
							that.byId("chartDataSwitch").setState(false);

							// SplitterLayoutData elements
							var oSplitterLayoutData1 = that.byId("splitterLayoutData1");
							var oSplitterLayoutData2 = that.byId("splitterLayoutData2");
							oSplitterLayoutData1.setSize("100%");
							oSplitterLayoutData2.setSize("0%");

							that._columnVisible();
							that.byId("downloadPdfBtn").setEnabled(false);
						}
					}
				}
			);
		},

		/*************** chart function & plotting the chart data  *****************/

		loadDefaultGraph: function() {
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oListData = this.getOwnerComponent().getModel("listData").getData();
			var defaultFilterChartData = oListData[0]; // Assuming default data is at index 0
			var extractChartData = this.extractData(defaultFilterChartData);

			// Set default chart data
			this.getOwnerComponent().getModel("chartData").setData(extractChartData);

			// Set default panel visibility
			oGlobalData.togglePanelVisibility = defaultFilterChartData.DET_FLAG === "X" ? "X" : "";
			this.getOwnerComponent().getModel("globalData").setData(oGlobalData);

			// highlight the default table 
			/*var oTable = this.byId("dynamicTable");
			var aItems = oTable.getItems();*/
			this._highlightRow(0);
		},
		onChartButtonPress: function(oEvent) {
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oListData = this.getOwnerComponent().getModel("listData").getData();
			var oChartDataModel = this.getOwnerComponent().getModel("chartData");

			var oButton = oEvent.getSource();
			var oRow = oButton.getParent();
			var oTable = this.byId("dynamicTable");
			var iIndex = oTable.indexOfItem(oRow);
			// Highlight the clicked row
			this._highlightRow(iIndex);

			var filterChartData = oListData[iIndex];
			var extractChartData = this.extractData(filterChartData);
			oChartDataModel.setData(extractChartData);

			// set the globaldata
			oGlobalData.togglePanelVisibility = oListData[0].DET_FLAG === "X" ? "X" : "";
			this.getOwnerComponent().getModel("globalData").setData(oGlobalData);

			// SplitterLayoutData elements
			var oSplitterLayoutData1 = this.byId("splitterLayoutData1");
			var oSplitterLayoutData2 = this.byId("splitterLayoutData2");

			// set the split view switch state to true
			this.byId("splitViewSwitch").setState(true);
			this.byId("tabularDataSwitch").setState(false);
			this.byId("chartDataSwitch").setState(false);

			// Update SplitterLayoutData sizes for split view
			oSplitterLayoutData1.setSize("50%");
			oSplitterLayoutData2.setSize("50%");

		},
		extractData: function(obj) {
			var result = [];
			var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

			// Combine incoming and outgoing balances for each month
			for (var i = 0; i < 12; i++) {
				var month = months[i];
				var incomingKey = "I" + (i + 1 < 10 ? '0' + (i + 1) : i + 1);
				var outgoingKey = "U" + (i + 1 < 10 ? '0' + (i + 1) : i + 1);
				var incomingValue = parseFloat(obj[incomingKey]);
				var outgoingValue = parseFloat(obj[outgoingKey]);

				result.push({
					Month: month,
					IncomingBalance: incomingValue,
					OutgoingBalance: outgoingValue
				});
			}

			var oVizFrame = this.byId("oVizFrame");
			oVizFrame.setVizProperties({
				title: {
					visible: true,
					text: obj.GlText
				},
				legend: {
					title: {
						visible: true,
						text: 'Months'
					}
				},
				plotArea: {
					dataLabel: {
						visible: true,
						showTotal: true
					},
					colorPalette: ['#5B9BD5', '#FF7F0E'] // Blue for IncomingBalance, Orange for OutgoingBalance
				}
			});

			return result;
		},
		_highlightRow: function(iIndex) {
			var oTable = this.byId("dynamicTable");
			oTable.getItems().forEach(function(item, index) {
				if (index === iIndex) {
					item.addStyleClass("highlightedRow");
				} else {
					item.removeStyleClass("highlightedRow");
				}
			});
		},
		_removeHighlight: function() {
			var oTable = this.byId("dynamicTable");
			oTable.getItems().forEach(function(item) {
				item.removeStyleClass("highlightedRow");
			});
		},

		/*************** download pdf function  *****************/

		onDownloadPDF: function() {
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			var pdfTableName = oGlobalDataModel.oData.pdfTableName;
			var oTable = this.byId("dynamicTable");
			var oTableHtml = oTable.getDomRef().outerHTML;

			// Create a temporary DOM element to manipulate the table HTML
			var tempDiv = document.createElement('div');
			tempDiv.innerHTML = oTableHtml;

			// Remove the "Chart" column from the table header and body
			var chartColumnIndex = -1;
			var table = tempDiv.querySelector('table');
			var headers = table.querySelectorAll('th, td');

			headers.forEach((header, index) => {
				if (header.innerText === "Chart") {
					chartColumnIndex = index;
				}
			});

			if (chartColumnIndex !== -1) {
				// Remove the header cell
				table.querySelector('thead tr').deleteCell(chartColumnIndex);

				// Remove the corresponding cells in the body rows
				var rows = table.querySelectorAll('tbody tr');
				rows.forEach(row => {
					row.deleteCell(chartColumnIndex);
				});
			}

			var updatedTableHtml = tempDiv.innerHTML;

			// Show the global BusyIndicator
			sap.ui.core.BusyIndicator.show(0);

			var opt = {
				margin: [0.5, 0.5, 0.5, 0.5], // Adjust margins as needed
				filename: 'Bank Balance' + ' ' + pdfTableName + '.pdf',
				image: {
					type: 'jpeg',
					quality: 0.98
				},
				html2canvas: {
					scale: 2, // Keep scale at 1 to capture full width
					scrollX: 0, // Capture entire width including horizontal scroll
					scrollY: 0,
					useCORS: true,
					logging: true
				},
				jsPDF: {
					unit: 'in',
					format: 'a4',
					orientation: 'landscape'
				},
				pagebreak: {
					mode: ['avoid-all', 'css', 'legacy']
				} // Ensure proper page breaks
			};

			// Use html2pdf.js to generate the PDF
			html2pdf()
				.from(updatedTableHtml)
				.set(opt)
				.toPdf()
				.get('pdf')
				.then((pdf) => {
					var totalPages = pdf.internal.getNumberOfPages();
					for (var i = 1; i <= totalPages; i++) {
						pdf.setPage(i);
						pdf.setFontSize(11);
						pdf.setTextColor(100);
						pdf.text(
							'Page ' + i + ' of ' + totalPages,
							pdf.internal.pageSize.getWidth() / 2,
							pdf.internal.pageSize.getHeight() - 10
						);
					}
				})
				.save()
				.finally(() => {
					// Hide the global BusyIndicator
					sap.ui.core.BusyIndicator.hide();
				});
		}

	});
});
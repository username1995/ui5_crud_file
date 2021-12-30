sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/PDFViewer",	
    'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
    "sap/ui/model/json/JSONModel",
    'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/Token',
    "sap/ui/core/Item",
	"sap/m/upload/Uploader",
    "sap/m/MessageBox"


], function (Controller,
	MessageToast,
	Fragment,
	ResourceModel,
	Filter,
	FilterOperator,
	PDFViewer,
	library,
	Spreadsheet, 
    JSONModel,ColumnListItem, Label, Token, Item, Uploader,MessageBox 
     ) {
    "use strict";
    var EdmType = library.EdmType;
    var address;
    
    return Controller.extend("project001employee.controller.BookList", {


      onSearch2: function (event) {
        var oItem = event.getParameter("suggestionItem");
        if (oItem) {
            MessageToast.show("Search for: " + oItem.getText());
        } else {
            MessageToast.show("Search is fired!");
        }
    },

    onSuggest2: function (event) {
        var sValue = event.getParameter("suggestValue"),
            aFilters = [];
        if (sValue) {
            aFilters = [
                new Filter([
                    new Filter("ProductId", function (sText) {
                        return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                    }),
                    new Filter("Name", function (sDes) {
                        return (sDes || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
                    })
                ], false)
            ];
        }

        this.oSF.getBinding("suggestionItems").filter(aFilters);
        this.oSF.suggest();
    },
    onValueHelpRequest: function() {
       // var aCols = this.oColModel.getData().cols;
       this.getView().setModel(this.getOwnerComponent().getModel("ZNames2Entity"));
       var oView = this.getView();

       if (!this._pValueHelpDialog){
        this._pValueHelpDialog = Fragment.load({
            id: oView.getId(),
            name: "project001employee.view.NameSearchHelp",
            controller: this
        }).then(function (oValueHelpDialog){
            oView.addDependent(oValueHelpDialog);
            return oValueHelpDialog;
        });
    }
    this._pValueHelpDialog.then(function(oValueHelpDialog){
        this._configValueHelpDialog();
        oValueHelpDialog.open();
    }.bind(this));
    },
    onUploadSelectedButton: function () {
        var oUploadSet = this.byId("UploadSet");

        oUploadSet.getItems().forEach(function (oItem) {
            if (oItem.getListItem().getSelected()) {
                oUploadSet.uploadItem(oItem);
            }
        });
    },
    onDownloadSelectedButton: function () {
        var oUploadSet = this.byId("UploadSet");

        oUploadSet.getItems().forEach(function (oItem) {
            if (oItem.getListItem().getSelected()) {
                oItem.download(true);
            }
        });
    },
    _configValueHelpDialog: function () {
        var sInputValue = this.byId("authorInput").getValue(),
            oModel = this.getView().getModel("ZNames2Entity"),
            aProducts = oModel.getProperty("/Name");

      /* aProducts.forEach(function (oProduct) {
            oProduct.selected = (oProduct.Name === sInputValue);
        });*/
        oModel.setProperty("/ZNames2Entity", aProducts);
    },

    onValueHelpDialogClose: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("selectedItem"),
            oInput = this.byId("authorInput");

        if (!oSelectedItem) {
            oInput.resetProperty("value");
            return;
        }

        oInput.setValue(oSelectedItem.getTitle());
    },


    onValueHelpOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        this._oInput.setSelectedKey(aTokens[0].getKey());
        this._oValueHelpDialog.close();
    },

    onValueHelpCancelPress: function () {
        this._oValueHelpDialog.close();
    },

    onValueHelpAfterClose: function () {
        this._oValueHelpDialog.destroy();
    },
        onInit : function () {
            
            var i18nModel = new ResourceModel({
                bundleName: "org.ubb.books.i18n.i18n"
            });

         
   
            this.getView().setModel(i18nModel, "i18n");
       
            this.getView().setModel(this.getOwnerComponent().getModel("dupa"));

            address = this.getOwnerComponent().getModel("dupa") +"/PDFSET"
           

          
       //     this.getView().setModel(this.getOwnerComponent().getModel("tableData"));//do mocka

 
        },

        loadAttachments:function(){
            var sPath= "/sap/opu/odata/sap/ZEMPLOYEES_SRV/PDFSET";
            var oAttachmentUpl= this.byId("UploadSet");

            oAttachmentUpl.getList().setMode("MultiSelect");
            this.getView().setModel(this.getOwnerComponent().getModel("file"));
            this.getView().getModel("file").read("/PDFSET('')/$value",{
              success:function(oData){
                  var oAttachmentsModel= new JSONModel(oData);
                  oAttachmentUpl.setModel(oAttachmentsModel).bindAggregation("items", "/results", new sap.m.upload.UploadSetItem({
                      fileName: "{FileName}", mediaType: "{MimeType}", visibleEdit:false, visibleRemove:false,
                      url:  this.getOwnerComponent().getModel("dupa")+"/PDFSET('')/$value"
                  }));
                  if(oAttachmentUpl.getItems().length>0){
                      that.byId('checkbox').setVisible(true);
                  }
              },
              error:function(oError){that.parseErrorMsg()}
          });
      },

      onSelectAllAttachments: function(oEvent) {
        var aUploadedItems = this.byId("UploadSet").getItems(),
          bSelected = oEvent.getSource().getSelected();
        if (bSelected) { //if CheckBox is selected
          aUploadedItems.forEach(oItem => oItem.getListItem().setSelected(true));
          this.byId('download').setEnabled(true);
        } else {
          aUploadedItems.forEach(oItem => oItem.getListItem().setSelected(false));
          this.byId('remove').setEnabled(false);
          this.byId('download').setEnabled(false);
        }
      },
      onSelectionChangeAttachment: function() {
        if (this.byId("UploadSet").getList().getSelectedItems().length > 0) { //if user selects 1 or more uploaded item
          this.byId("remove").setEnabled(true);
          this.byId("download").setEnabled(true);
        } else {
          this.byId("remove").setEnabled(false);
          this.byId("download").setEnabled(false);
        }
      },
      onRemove: function(oEvent) {
        var oAttachmentUpl = this.byId("UploadSet");
        oAttachmentUpl.setBusy(true);
        oAttachmentUpl.getItems().forEach(oItem => {
          if (oItem.getListItem().getSelected()) {
            var sPath = oItem.getProperty("url").split("SRV")[1]; //eg /Z9NRS_REQ_ATTACHSet
            this.getView().getModel().remove(sPath, {
              success: function() {
                oAttachmentUpl.removeItem(oItem); //remove from displayed list
              },
              error: function(oError) {
                that.parseErrorMsg();
              }
            });
          }
        });
        oEvent.getSource().setEnabled(false);
        this.byId("download").setEnabled(false);
    
        if (oAttachmentUpl.getItems().length > 0) {
          this.byId('checkbox').setVisible(true);
        } else {
          this.byId('checkbox').setVisible(false);
        }
        oAttachmentUpl.setBusy(false);
      },
      onDownload: function(oEvent) {
        var oAttachmentUpl = this.byId("UploadSet");
        oAttachmentUpl.setBusy(true);
        oAttachmentUpl.getItems().forEach(oItem => {
          if (oItem.getListItem().getSelected()) {
            oItem.download(true);
            oItem.getListItem().setSelected(false);
          }
        });
        oAttachmentUpl.setBusy(false);
        oEvent.getSource().setEnabled(false);
      },
      onStartUpload: function(oEvent) {
        var oAttachmentUpl = this.byId("UploadSet");
      //  oAttachmentUpl.setUploadUrl();

   //   var oModel = oEvent.getSource().getModel("file");
   //   var oDialogData = oModel.getData();
   //   oDialogData = oAttachmentUpl.getData();
      console.log("Ponizej");
      console.log(oAttachmentUpl);
     // console.log(oModel);
   //   console.log(oDialogData);
      
  /*    var obj = JSON.stringify(oDialogData, function (key, value) {
      if (key == "Id") {
          return value;
      } else {
          return value;
      }
      });

      var obj2 = JSON.parse(obj, function (key, value) {
      if (key == "Id") {
          return parseInt(value)  ;
      } else {
          return value;
      }
      });
      //console.log(obj2);



      this.getView().getModel("file").create("/PDFSET", obj2, {
        //https://answers.sap.com/questions/13388355/failed-to-read-property.html
       //METHOD: "POST",
        success: function () {
            var sMsg = oBundle.getText("Dzialaj");
            MessageToast.show(sMsg);
        },
        error: function () {
            var sMsg = oBundle.getText("Nie dziala");
            MessageToast.show(sMsg);
        }
    });


*/

        var aIncompleteItems = oAttachmentUpl.getIncompleteItems();
        this.iIncompleteItems = aIncompleteItems.length; //used to turn off busy indicator upon completion of all pending uploads
        if (this.iIncompleteItems !== 0) {
          oAttachmentUpl.setBusy(true);
          this.i = 0; //used to turn off busy indicator when all uploads complete
          for (var i = 0; i < this.iIncompleteItems; i++) {
            var sFileName = aIncompleteItems[i].getProperty("fileName");
            var oXCSRFToken = new sap.ui.core.Item({
              key: "X-CSRF-Token",
              text: this.getOwnerComponent().getModel("file").getSecurityToken()
            });
            var oSlug = new sap.ui.core.Item({
              key: "SLUG",
              text: this.sRequestId + "/" + sFileName
            });
            var oCT= new sap.ui.core.Item({
                key: "Content-Type",
                text: "application/pdf"
              });
            oAttachmentUpl.addHeaderField(oXCSRFToken).addHeaderField(oSlug).addHeaderField(oCT).uploadItem(aIncompleteItems[i]);
           //zrobiv w kodzie to powyzsze, za duzo rzeczy jest tam zaszyte
           
           
           
            oAttachmentUpl.removeAllHeaderFields(); //at least slug header field must be reset after each upload
          }
        }
      },
      onUploadCompleted: function() {
        this.i += 1;
        if (this.i === this.iIncompleteItems) { //turn off busy indicator when all attachments have completed uploading
          this.byId('UploadSet').setBusy(false);
        }
      },
      parseErrorMsg: function(oError) { //parses oData error messages dependent on different return values
        var oMessage, sType;
        if (oError.response) { //for update
          sType = typeof oError.response;
          if (sType === "string" || sType === "object") oMessage = JSON.parse(oError.response.body).error.message.value;
          else return MessageBox.error("Unhandled server error:\n\n" + oError.response + "\n\nReport this issue to Admin for a future fix.");
        } else if (oError.responseText) { //for create
          sType = typeof oError.responseText;
          if (sType === "string" || sType === "object") oMessage = JSON.parse(oError.responseText).error.message.value;
          else return MessageBox.error("Unhandled server error:\n\n" + oError.responseText + "\n\nReport this issue to Admin for a future fix.");
        } else if (!oError) return MessageToast.show("Error message is undefined");
        MessageBox.error(oMessage);
      },




        onSearch: function(oEvent) 
        {

            this.getView().setModel(this.getOwnerComponent().getModel("ZNames2Entity"));

        var sInputValue = oEvent.getSource().getValue();
        
       this.inputId = oEvent.getSource().getId();
        var path;var oTableStdListTemplate;
        var oFilterTableNo;
        this.oDialog = sap.ui.xmlfragment("project001employee.view.NameSearchHelp", this);
      
        var book = {
            "Name": ""   
        };
        var oView = this.getView();

    /*   var oUploadSet = this.byId("UploadSet");
        oUploadSet.getList().setMode(ListMode.MultiSelect);
        // Modifny "add file" button
        oUploadSet.getDefaultFileUploader().setButtonOnly(false);
        oUploadSet.getDefaultFileUploader().setTooltip("");
        oUploadSet.getDefaultFileUploader().setIconOnly(true);
        oUploadSet.getDefaultFileUploader().setIcon("sap-icon://attachment");*/

      
        // create dialog lazily
        if (!this.byId("idBookSearchHelpFragment")) {
            // load asynchronous XML fragment
            Fragment.load({
                id: oView.getId(),
                name: "project001employee.view.NameSearchHelp",
                controller: this
            }).then(function (oDialog) {
                // connect dialog to the root view of this component (models, lifecycle)
                oView.addDependent(oDialog);
               
                //var oModel = new sap.ui.model.json.JSONModel();

            alert(oDialog);
            //  oDialog.setModel(jsonModel);
            //  alert(oDialog);
            //    oDialog.getModel().setData(book);
                oDialog.open();
            });
        } else {
          //  oDialog.getModel().setData(book);
            this.byId("idBookSearchHelpFragment").open();
        }


        path = "/ZNames2Entity";
        oTableStdListTemplate = new sap.m.StandardListItem({title: "{name}",description: "{name}"});// //create a filter for the binding
        oFilterTableNo = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sInputValue);
        this.oDialog.unbindAggregation("items");
        
        this.oDialog.bindAggregation("items", {
            path: path,
            template: oTableStdListTemplate,
            filters: [oFilterTableNo]}
        );// }// open value help dialog filtered by the input value
             this.oDialog.open(sInputValue);
        },

        handleTableValueHelpConfirm: function(oEvent) 
        {
        var s = oEvent.getParameter("selectedItem");
        var oView = this.getView();
        oView.addDependent(oDialog);
        if (s) {
        //     var oItem, oCtx, sDayId;
        //     oItem = oEvent.getSource();
        //     oCtx = oItem.getBindingContext();
        //     alert(oCtx);
        //      console.log(oItem);
        //       console.log(oItem.getBindingContext().getPath());
        //      console.log(sap.ui.getCore().getModel().getProperty(oCtx.getPath()));
        //    var oPressedItem = sap.ui.getCore().getModel().getProperty(oCtx.getPath());

        var oModel = oEvent.getSource().getModel();
        var oContext = oEvent.getSource().getBindingContext("list");
           // alert(oContext);
           alert(oDialog);


            this.byId(this.inputId).setValue(s.getBindingContext().getObject().Name);
            this.readRefresh(oEvent);

        }
            this.oDialog.destroy();
        },
        onAddFile() {

         /*   var book = {
                "Id": 0,
                "Name": "",
                "Age": ""       
            };*/
         
            var sUrl = this.getView().getModel("dupa").sUrl+"/PDFSET";

            var oView = this.getView();
            if (this.byId("idFileAddFragment"))  {
                this.byId("idFileAddFragment").close()
            };
            var that = this;
            var oView = this.getView();
            if (!this.byId("idFileAddFragment")) {
                         // load asynchronous XML fragment
                         Fragment.load({
                             id: oView.getId(),
                             name: "project001employee.view.AddFile",
                             controller: this
                         }).then(function (oDialog) {
                             // connect dialog to the root view of this component (models, lifecycle)
                           oView.addDependent(oDialog);
                         //var oFileUploader2 = that.byId("UploadSet");
                         var oFileUploader2 = Fragment.byId(oView.getId(),"UploadSet");
                         
                       //  console.log(sUrl);
                        // console.log(oFileUploader2);

                        //  oFileUploader2.setUploadUrl();
                         //  oFileUploader2.setUploadUrl(address);

                           oDialog.open();
                           
                           //var oFileUploader = sap.ui.getCore().byId("UploadSet");

               
                         });
                     } 
             else {
       
                this.byId("idFileAddFragment").open();
                var oFileUploader = sap.ui.getCore().byId("UploadSet");
                var oFileUploader2 = this.byId("UploadSet");
             
            //    oFileUploader.setUploadUrl(address);
             //   oFileUploader2.setUploadUrl(address);
    
        }
        },

        createColumnConfig: function() {
			var aCols = [];

			aCols.push({
				label: 'Full name',
				property: ['Lastname', 'Firstname'],
				type: EdmType.String,
				template: '{0}, {1}'
			});

			aCols.push({
				label: 'ID',
				type: EdmType.Number,
				property: 'Id',
				scale: 0
			});

			aCols.push({
				property: 'Name',
				type: EdmType.String
			});

			aCols.push({
				property: 'Age',
				type: EdmType.String
			});

			
			return aCols;
		},





		onExport: function() {
			var aCols, oRowBinding, oSettings, oSheet, oTable;
            // var rshit = new shittyThing();
            
            // console.log(rshit.shit);
			if (!this._oTable) {
				this._oTable = this.byId('idBooksTable');
			}

			oTable = this._oTable;
			oRowBinding = oTable.getBinding('items');
			aCols = this.createColumnConfig();

			oSettings = {
				workbook: {
					columns: aCols,
					hierarchyLevel: 'Level'
				},
				dataSource: oRowBinding,
				fileName: '123456.xlsx',
				worker: false // We need to disable worker because we are using a MockServer as OData Service
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				oSheet.destroy();
			});
		},
        showPDF:  function (oEvent){
            var opdfViewer = new PDFViewer();
			this.getView().addDependent(opdfViewer);
			var sServiceURL = this.getView().getModel().sServiceUrl;
            console.log(sServiceURL);
            var sServiceURL2 = this.getView().getModel();
            console.log(sServiceURL2);
			var sSource = sServiceURL + "/PDFSET('')/$value";

			opdfViewer.setSource(sSource);
			opdfViewer.setTitle( "My PDF");
			opdfViewer.open();	
			
		},
        onDelete() {
            const selectedRows = this.byId("idBooksTable").getSelectedContexts();
            if (selectedRows.length === 0) {
                MessageToast.show("No book was selected!");
            } else {
                const selectedRow = selectedRows[0];
                const isbnPath = selectedRow.getPath();
                this.getView().getModel().remove(isbnPath, {
                    success: () => {
                        var oBundle = this.getView().getModel("i18n").getResourceBundle();
                        var sMsg = oBundle.getText("bookDeleted");
                        MessageToast.show(sMsg);
                    },
                    error: () => {
                        var oBundle = this.getView().getModel("i18n").getResourceBundle();
                        var sMsg = oBundle.getText("bookNotDeleted");
                        MessageToast.show(sMsg);
                    }
                },);
            }
        },
        onAdd() {
            var book = {
                "Id": 0,
                "Name": "",
                "Age": ""       
            };
            var oView = this.getView();

            // create dialog lazily
            if (!this.byId("idBookAddDialog")) {
                // load asynchronous XML fragment
                Fragment.load({
                    id: oView.getId(),
                    name: "project001employee.view.AddDialog",
                    controller: this
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oView.addDependent(oDialog);
                    var oModel = new sap.ui.model.json.JSONModel();
                    oDialog.setModel(oModel);
                    oDialog.getModel().setData(book);
                    oDialog.open();
                });
            } else {
              //  oDialog.getModel().setData(book);
                this.byId("idBookAddDialog").open();
            }
        },
        handleCancel() {
            this.byId("idBookAddDialog").close();
        },
        handleSave(oEvent) {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var oModel = oEvent.getSource().getModel();
            var oDialogData = oModel.getData();

            var obj = JSON.stringify(oDialogData, function (key, value) {
            if (key == "Id") {
                return value;
            } else {
                return value;
            }
            });
            console.log(obj);


            var obj2 = JSON.parse(obj, function (key, value) {
            if (key == "Id") {
                return parseInt(value)  ;
            } else {
                return value;
            }
            });
            console.log(obj2);


            var validForm = true;

       
      /*
         if(oDialogData.Id) {
                validForm = false;
                var sMsg = oBundle.getText("isbnReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Author.length === 0) {
                validForm = false;
                var sMsg = oBundle.getText("authReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Title.length === 0) {
                validForm = false;
                var sMsg = oBundle.getText("titleReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Language.length === 0) {
                validForm = false;
                var sMsg = oBundle.getText("langReq");
                MessageToast.show(sMsg);
            }
            if(!(oDialogData.Language !== 'EN' || oDialogData.Language != 'DE' || oDialogData.Language != 'RU'
            || oDialogData.Language != 'FR' || oDialogData.Language != 'PT' || oDialogData.Language != 'ES')) {
                validForm = false;
                var sMsg = oBundle.getText("invalidLanguage");
                MessageToast.show(sMsg);
            }
            oDialogData.AvailableNumber = parseInt(oDialogData.AvailableNumber);
            oDialogData.TotalNumber = parseInt(oDialogData.TotalNumber);
            if(oDialogData.AvailableNumber > oDialogData.TotalNumber) {
                validForm = false;
                var sMsg = oBundle.getText("noGreater");
                MessageToast.show(sMsg);
            }
            oDialogData.DatePublication = "2015-12-31T00:00:00";
            oDialogData.CreatedOn = "2015-12-31T00:00:00";
            oDialogData.ChangedOn = "2015-12-31T00:00:00";
            */
            //https://answers.sap.com/questions/517795/bad-request-from-sapui5-odata.html

            if(validForm) {

                debugger;
                this.getView().getModel().create("/EMPLOYEESet", obj2, {
                    //https://answers.sap.com/questions/13388355/failed-to-read-property.html
                   //METHOD: "POST",
                    success: function () {
                        var sMsg = oBundle.getText("bookInserted");
                        MessageToast.show(sMsg);
                    },
                    error: function () {
                        var sMsg = oBundle.getText("bookNotInserted");
                        MessageToast.show(sMsg);
                    }
                });
            }
        },
  /*      FILTEREVENT: function(oEvent) {
            var sValue = oEvent.getParameter("Name") //value
            var sColumn = oEvent.getParameter("column").getId();
             oEvent.preventDefault();

},*/
        onUpdate(oEvent) {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            const selectedRows = this.byId("idBooksTable").getSelectedContexts();
            if (selectedRows.length === 0) {
                var sMsg = oBundle.getText("noBook");
                MessageToast.show(sMsg);
            } else {
                var oView = this.getView();
                var oObject = oView.byId("idBooksTable").getSelectedContexts()[0].getObject();
                var book = {
                    "Id": 0,
                    "Name": "",
                    "Age": ""       
                };
                if (!this.byId("idBookUpdateDialog")) {
                    // load asynchronous XML fragment
                    Fragment.load({
                        id: oView.getId(),
                        name: "project001employee.view.UpdateDialog",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        var oModel = new sap.ui.model.json.JSONModel();
                        oDialog.setModel(oModel);
                        oDialog.getModel().setData(book);
                        oDialog.open();
                    });
                } else {
                    var oModel = new sap.ui.model.json.JSONModel();
                //    oDialog.setModel(oModel);
              //      oDialog.getModel().setData(book);
                    this.byId("idBookUpdateDialog").open();
                }
            }
        },
        onFilterBooks : function (oEvent) {

			// build filter array
         /*   var sQuery = oEvent.getParameter("query");
			var oView = this.getView(),
				sValue = oView.byId("searchField").getValue(),
				oFilter = new Filter("Name", FilterOperator.Contains, sValue);

			oView.byId("idBooksTable").getBinding("items").filter(oFilter, FilterOperator.Contains,sQuery);

*/
            var aFilter = [];
            var sQuery = oEvent.getParameter("query");

			var aFilter = [];
		
			if (sQuery) {
				aFilter.push(new Filter("Name", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("idBooksTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},
		onProductValueHelp: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			
			// Create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"project001employee.view.NameSearchHelp",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}
			
			// Open the dialog
			this._valueHelpDialog.open();
		},
		
		onValueHelpSearch : function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"name",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		onValueHelpClose : function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(oSelectedItem.getTitle());
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
        handleLiveChange : function(oEvent){
            // build filter array
            
                        var aFilter = [];
                        var sQuery = oEvent.getParameter("query");
            
                        if (sQuery) {
                            aFilter.push(new Filter("Name", FilterOperator.EQ, sQuery));
                        }
            
                        // filter binding
                        var oList = this.getView().byId("tableId");
                        var oBinding = oList.getBinding("items");
                        oBinding.filter(aFilter);
            
                  },
        handleCancelUpdate() {
            this.byId("idBookUpdateDialog").close();
        },
        handleUpdate(oEvent) {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var oModel = oEvent.getSource().getModel();
            var oDialogData = oModel.getData();
            var validForm = true;
          /*  if(oDialogData.ISBN.length === 0) {
                validForm = false;
                var sMsg = oBundle.getText("isbnReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Author.length === 0) {
                validForm = false;
                var sMsg = oBundle.getText("authorReq");
                MessageToast.show(sMsg);
            }
            if(oDialogData.Title.length === 0) {
                validForm = false;
                MessageToast.show("Title is required!");
            }
            if(oDialogData.Title.language === 0) {
                validForm = false;
                var sMsg = oBundle.getText("langReq");
                MessageToast.show(sMsg);
            }
            if(!(oDialogData.Language !== 'EN' || oDialogData.Language != 'DE' || oDialogData.Language != 'RU'
                || oDialogData.Language != 'FR' || oDialogData.Language != 'PT' || oDialogData.Language != 'ES')) {
                validForm = false;
                var sMsg = oBundle.getText("invalidLanguage");
                MessageToast.show(sMsg);
            }
            oDialogData.AvailableNumber = parseInt(oDialogData.AvailableNumber);
            oDialogData.TotalNumber = parseInt(oDialogData.TotalNumber);
            if(oDialogData.AvailableNumber > oDialogData.TotalNumber) {
                validForm = false;
                var sMsg = oBundle.getText("noGreater");
                MessageToast.show(sMsg);
            }
            oDialogData.DatePublication = "2015-12-31T00:00:00";
            oDialogData.CreatedOn = "2015-12-31T00:00:00";
            oDialogData.ChangedOn = "2015-12-31T00:00:00";
            */
            if(validForm) {
                var oView = this.getView();
                var sPath = oView.byId("idBooksTable").getSelectedContexts()[0].getPath();
                this.getView().getModel().update(sPath, oDialogData, {
                    success: function () {
                        var sMsg = oBundle.getText("bookUpdated");
                        MessageToast.show(sMsg);
                    },
                    error: function () {
                        var sMsg = oBundle.getText("bookNotUpdated");
                        MessageToast.show(sMsg);
                    }
                });
                this.handleCancelUpdate();
            }
            
        }
    });
});
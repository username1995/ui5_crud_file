sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/base/util/UriParameters",
	"sap/base/Log"
], function (MockServer, UriParameters, Log) {
	"use strict";

	return {
		//
		//https://www.youtube.com/watch?v=C9cK2Z2JDLg
		init: function() {
			// create
			var oMockServer = new MockServer({
				rootUri: "/"
			});

			// simulate against the metadata and mock data
			oMockServer.simulate("../localService/metadata.xml", {
				sMockdataBaseUrl: "../localService/mockdata",
				bGenerateMissingMockData: true
			});

			// start
			oMockServer.start();

			Log.info("Running the app with mock data");
		}
	};

});
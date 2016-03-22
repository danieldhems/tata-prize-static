'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var TataComp = angular.module('TataComp');

TataComp.service('TataCompService', ['$http', function($http){

	return {

		// User entry submission
		submitEntry: function(entry, callback){

 			$http.post('/api/entry', entry, {
 				headers: {
 					'Content-Type':undefined
 				},
 				// Send JSON and files in one request
 				// Thanks to http://shazwazza.com/post/Uploading-files-and-JSON-data-in-the-same-request-with-Angular-JS
 				transformRequest: function(data){
 					var fd = new FormData();
						
 					fd.append('entry', angular.toJson(entry));

 					fd.append('file1', entry.upload1);
 					fd.append('file2', entry.upload2);
 					fd.append('file3', entry.upload3);

 					return fd;
 				}
 			})
      .then( function(data){
        callback(data);
      })
		},

		// Basic post to any URI
		post: function(uri, data, callback){
			$http.post(uri, data)
				.success(function(data){
					if(typeof callback == "function"){
						callback(data);
					} else {
						console.log(data);
					}
				})
		},

		getUserTweets: function(callback){
			$http.get('/api/tweets')
			.success( function(data){
				callback(data);
			})
		}
	}
}]);

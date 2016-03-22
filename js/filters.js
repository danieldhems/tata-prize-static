'use strict';

/* Filters */

var TataComp = angular.module('TataComp');

TataComp
	.filter('dateFormat', function(){
	  return function(input, format){
	    return moment(input).format(format);
	  }
	})
	.filter('range', function() {
    return function(input, total) {

    	if(typeof total == "object"){

    		var min = total[0],
    				max = total[1];

	      total = parseInt(total);
	      for (var i=max; i>=min; i--) {
	        input.push(i);
	      }
    	} else {

	      total = parseInt(total);
	      for (var i=1; i<=total; i++) {
	        i<10 ? input.push('0'+i) : input.push(i); // Add leading zero for readability if num < 10
	      }
    	}

      return input;
    };
  })
  .filter('leadingZero', function(){
  	return function(number){
  		if(number !== undefined && number !== null && number !== NaN){
  			return number < 10 ? "0"+number : number;
  		}
  	}
  });

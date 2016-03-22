'use strict';

  /***
  *
  *  Initiate Angular app here.
  *
  ***/  

  var TataComp = angular.module('TataComp', ['ngRoute', 'ngSanitize']);

  /***
  *
  *  Configure front-end routes here
  *
  *  These are the paths from the root URL / domain that render the pages in our app
  *  Each route specifies an HTML document to load (for the page we see in the browser),
  *  and an angular controller which handles all functionality and logic.
  *
  *  We only use one controller for this app, and this can be found in the /public/js/controller.js file
  *
  ***/

  TataComp
    .config(function ($routeProvider, $locationProvider) {
      $routeProvider.
        when('/home', {
          templateUrl: 'views/home.html',
          controller: 'TataController'
        }).
        when('/rules', {
          templateUrl: 'views/rules.html',
          controller: 'TataController'
        }).
        when('/faqs', {
          templateUrl: 'views/faq.html',
          controller: 'TataController'
        }).
        // these routes display the static challenge entry pages
        when('/challenge-1', {
          templateUrl: 'views/challenge_1.html',
          controller: 'TataController'
        }).
        when('/challenge-2', {
          templateUrl: 'views/challenge_2.html',
          controller: 'TataController'
        }).
        //*
        //Uncomment this route when you wish to activate the challenge 3 entry page
        when('/challenge-3', {
          templateUrl: 'views/challenge_3.html',
          controller: 'TataController'
        }).
        /*/

        /**
        *   This view will be for the overall competition winner page, if that still goes ahead
        */
        when('/winners', {
          templateUrl: 'views/winners.html',
          controller: 'TataController'
        }).
        otherwise({
          redirectTo: '/home'
        });

      $locationProvider.reloadOnSearch=false;
      $locationProvider.html5Mode(true);
    });

/***
*
*  This handles instant scrolling after page load when a particular section of the homep page is navigated to
*
***/
TataComp.run(function($rootScope, $location, $anchorScroll, $routeParams, $timeout) {
  //when the route is changed scroll to the proper element.
  $rootScope.$on('$viewContentLoaded', function(){
    // Maybe not robust but works
    $timeout( function(){
      $anchorScroll();
    },100);
  });
});


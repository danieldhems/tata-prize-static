'use strict';

/* Controllers */

var TataComp = angular.module('TataComp')

TataComp.controller('TataController', ['$scope', '$location', '$anchorScroll', '$sce', 'TataCompService', function ($scope, $location, $anchorScroll, $sce, TataCompService) {

  var desktopBreakpoint = "1077",
      tabletBreakpoint = "640";

  if(Response.band(0,tabletBreakpoint)){
    $scope.viewportType = "mobile";
  } else if(Response.band(tabletBreakpoint,desktopBreakpoint)) {
    $scope.viewportType = "tablet";
  } else {
    $scope.viewportType = "desktop";
  }

  window.addEventListener('resize', function(){
    if(Response.band(0,tabletBreakpoint)){
      $scope.viewportType = "mobile";
    } else if(Response.band(tabletBreakpoint,desktopBreakpoint)) {
      $scope.viewportType = "tablet";
    } else {
      $scope.viewportType = "desktop";
    }
    
    $scope.$apply();
  });

  $scope.util = {
    getRouteName: function(){
      return $location.path().replace("/","route-");
    },
    scrollTo: function(id) {
        var old = $location.hash();
        $location.hash(id);
        $anchorScroll();
        //reset to old to keep any additional routing logic from kicking in
        $location.hash(old);
    },
    trustSrc: function(src) {
      return $sce.trustAsResourceUrl(src);
    },
    setActiveJudge: function(name){
      // Has a string been passed in
      if(typeof name != "string") return;

      switch(name){
        case "john morrison":
        $scope.activeJudge = "john morrison";
        break;

        case "martin brundle":
        $scope.activeJudge = "martin brundle";
        break;

        case "lewis hamilton":
        $scope.activeJudge = "lewis hamilton";
        break;

        case "julie":
        $scope.activeJudge = "julie";
        break;

        case "paddy lowe":
        $scope.activeJudge = "paddy lowe";
        break;

        default:
        $scope.activeJudge = "lewis hamilton";
      }
    },
    setActivePartner: function(name){
      // Has a string been passed in
      if(typeof name != "string") return;

      switch(name){
        case "fom":
        $scope.activePartner = "fom";
        break;

        case "tata":
        $scope.activePartner = "tata";
        break;

        case "mercedes":
        $scope.activePartner = "mercedes";
        break;

        default:
        $scope.activePartner = "tata";
      }
    }
  }

  // Manage challenge state separately 
  $scope.challengeState = {
    challenge_1: {
      // inProgress
      // announced
      judging: "announce",

      open: false
    },
    challenge_2: {
      // inProgress
      // announced
      judging: "announce",

      open: false
    },
    challenge_3: {
      // inProgress
      // announced
      judging: "announce",

      open: true
    }
  };

  $scope.formState = {
    entryFormIndividual: {
      // false / true
      submitted: false,
      // waiting
      response: null
    },
    entryFormTeam: {
      // false / true
      submitted: false,
      // waiting
      response: null      
    },
    // use this to show / replace the form when interaction is finished
    submissionComplete: false
  };

  $scope.entry = {
    type: undefined,
    individual: {},
    team: {}
  };

  $scope.entry.type;

  $scope.submitEntry = function(form){

    // set submit state for target form
    $scope.formState[form.$name].submitted = true;

    if(form.$invalid){
      // scroll page to first bad field
      //var first_error = document.querySelector(".ng-invalid").name;
      //$scope.utilMethods.scrollTo(first_error);

      return;
    }

    // Set reponse to 'waiting' state to show loading gif
    $scope.challengeState.response = "waiting";

    switch($scope.entry.type){

      case "individual":
        
        // Add full date of birth from dob fields
        $scope.entry.individual.date_of_birth = new Date($scope.entry.individual.dob_year+'-'+$scope.entry.individual.dob_month+'-'+$scope.entry.individual.dob_day);
        
        var entry = $scope.entry.individual;
        entry.type = "individual";
      break;

      case "team":

        // Add full date of birth from dob fields for leader
        $scope.entry.team.leader_date_of_birth = new Date($scope.entry.team.leader_dob_year+'-'+$scope.entry.team.leader_dob_month+'-'+$scope.entry.team.leader_dob_day);

        // do the same for team members

        $scope.entry.team.member_1_date_of_birth = new Date($scope.entry.team.member_1_dob_year+'-'+$scope.entry.team.member_1_dob_month+'-'+$scope.entry.team.member_1_dob_day);
        
        if($scope.entry.team.member_2_dob_year !== undefined && $scope.entry.team.member_2_dob_month !== undefined && $scope.entry.team.member_2_dob_day !== undefined) {
          $scope.entry.team.member_2_date_of_birth = new Date($scope.entry.team.member_2_dob_year+'-'+$scope.entry.team.member_2_dob_month+'-'+$scope.entry.team.member_2_dob_day);
        }
        if($scope.entry.team.member_3_dob_year !== undefined && $scope.entry.team.member_3_dob_month !== undefined && $scope.entry.team.member_3_dob_day !== undefined) {

          $scope.entry.team.member_3_date_of_birth = new Date($scope.entry.team.member_3_dob_year+'-'+$scope.entry.team.member_3_dob_month+'-'+$scope.entry.team.member_3_dob_day);
        }
        
        var entry = $scope.entry.team;      
        entry.type = "team";
      break;
    }

    TataCompService.submitEntry(entry, function(response){

      if(response.status === 200 && response.statusText == "OK"){
        $scope.formState.submissionComplete = true;
      }

    });
  };
  
  $scope.signupData = {};
  $scope.signupStatus = "pending";

  $scope.signupFormSubmitted = false;

  // Handle signups
  $scope.signup = function(form){
    // Register submitted state so relevant logic can execute
    $scope.signupFormSubmitted = true;

    if(form.$invalid) return;

    // Add today's date to sinup data
    $scope.signupData['date_created'] = new Date();

    $scope.awaitingResponse = true;

    TataCompService.post('/api/signup', $scope.signupData, function(response){
      if(response == "success"){
        $scope.signupStatus = "complete";
      } else {
        $scope.signupStatus = "error";
      }
    });
  
  }

  $scope.currentTweet="";

  $scope.util.setActiveJudge("lewis hamilton");
  $scope.util.setActivePartner("tata");
  
}]);

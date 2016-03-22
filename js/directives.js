'use strict';

/* Directives */

var TataComp = angular.module('TataComp');

TataComp
	.directive('fileModel', function(){
    return {
      require: '?ngModel',
      scope: {
        // Bind to value of this element's directive in parent scope I.E. upload1 or upload2 or upload3
        // test stage deploy
        file: '=fileModel'
      },
      link: function(scope, el, attrs, ctrl){


        var allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            maxFileSize = 5242880; //5MB

        function verifyExt(file){
          for(var i=0; i < allowedFileTypes.length; i++){
            if(allowedFileTypes[i] === file.type) return true;
          }
          return false;
        }

        function verifySize(file){
          return file.size <= maxFileSize;
        }

        el.bind('change', function(event){

          var file = event.target.files[0],
              required = attrs.required;

          if(file !== undefined){

            ctrl.$setViewValue(event.target.files[0]);

            // Validate file before updating model
            if( !verifyExt(ctrl.$viewValue) ){
              ctrl.$setValidity('file-type', false);
              scope.$apply();
            } else {
              ctrl.$setValidity('file-type', true);
              scope.$apply();
            }

            if( !verifySize(ctrl.$viewValue) ){
              ctrl.$setValidity('file-size', false);
              scope.$apply();
            } else {
              ctrl.$setValidity('file-size', true);
              scope.$apply();
            }
          }
        });
      }
    }
  })
  .directive('removable', function(){
    return {
      require: '?ngModel',
      link: function(scope, el, attrs, ctrl){
        var button = button || angular.element('<a class="remove-button" href="">Remove file</a>');
        el.after(button);
        button.hide();
        
        el.bind('change', function(){
          if(el.val() !== undefined){
            button.show();
          } else {
            button.hide();
          }
        });
        button.bind('click', function(e){
          e.preventDefault();

          el.val(undefined);
          ctrl.$setViewValue(undefined);
          ctrl.$setValidity('file-type', true);
          ctrl.$setValidity('file-size', true);
          
          scope.$apply();
          button.hide();
        })
      }
    }
  })
  .directive('checkEmailExists', ['$http', function($http){
    return {
      require: '?ngModel',
      link: function(scope, el, attrs, ctrl){
        var entryType = scope.entry.type;
        el.bind('blur', function(event){
          var value = el.val();

          if(ctrl.$dirty && !ctrl.$modelValue !== undefined){
            $http.get('/api/email-exists/' + entryType + '/' +value)
              .then( function(response, error){
                if(response.data.matches > 0){
                  ctrl.$setValidity('email-exists', false);
                } else {
                  ctrl.$setValidity('email-exists', true);
                }
              });
          }
        })
      }
    }
  }])
  .directive('confirmEmail', function(){
    return {
      require: '?ngModel',
      scope: {
        confirmEmail: '='
      },
      link: function(scope, el, attrs, ctrl){
        // Thanks to TheSharpieOne for this code (http://jsfiddle.net/TheSharpieOne/Wnv8u/)
        scope.$watch( function(){
           return (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || ctrl.$modelValue === scope.confirmEmail;
        },
        function(newValue){
          ctrl.$setValidity('match', newValue);
        })
      }
    }
  })
  .directive('tweets', ['TataCompService', '$sanitize', '$interval', function(TataCompService, $sanitize, $interval){
    return {
      replace: 'true',
      scope: {
        currentTweet: '@'
      },
      template: '<div><p class="twitter-handle"><a href="http://www.twitter.com/tata_comm">@tata_comm</a></p><p ng-bind-html="currentTweet"></p></div>',
      link: function(scope, elem, attrs){

        String.prototype.parseURL = function() {
          return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
            return url.link(url);
          });
        };

        String.prototype.parseUsername = function() {
          return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
            var username = u.replace("@","")
            return u.link("http://twitter.com/"+username);
          });
        };

        String.prototype.parseHashtag = function() {
          return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
            var tag = t.replace("#","%23")
            return t.link("https://twitter.com/search?q="+tag);
          });
        };

        function parseTweet(tweet){
          return tweet.parseURL().parseUsername().parseHashtag();
        }

        TataCompService.getUserTweets( function(data){
          scope.currentTweet = parseTweet(data[0].text)

          var i = 1;

          $interval( function(){
            scope.currentTweet = parseTweet(data[i].text);

            // Last object in the array is the cache timestamp, so count limit must be -2
            if(i === data.length-2){
              i=0;
            } else {
              i++;
            }
          },10000);
        });
      }
    }
  }])
  .directive('responsiveMenu', ['$rootScope', function($rootScope){
    return {
      link: function(scope, elem, attrs){
        
        var desktopBreakpoint = "1077",
            tabletBreakpoint = "640";

        scope.navIsOpen = false; // mobile first
        scope.navAction = ""; // has value "open" or "close": value change triggers nav open / close toggle 

        scope.toggleNav = function(){

          if(scope.navIsOpen){
            scope.navAction = "close";
            scope.navIsOpen = false;
          } else {
            scope.navAction = "open";
            scope.navIsOpen = true;
          }
        }

        window.addEventListener('resize', function(){
          // close navigation for tablet and below when entering desktop breakpoint
          // so it doens't stay open when returning to tablet breakpoint
          if(Response.band(desktopBreakpoint)) {
            if(scope.navIsOpen) scope.toggleNav();
          }
        });

        $rootScope.$on('$routeChangeSuccess', function(){
          scope.navAction = "close";
          scope.navIsOpen = false;
        })
      }
    }
  }])
  .directive('sublimePlayer', ['$rootScope', '$timeout', function($rootScope, $timeout){
    return {
      link: function(scope, elem, attrs){

        var video = elem[0];

        /**
         *  Thanks Chris Coyier for the Sublime Video resize snippet
         *  Refactored a little...
         *
         *  http://css-tricks.com/making-sublimevideo-fluid-width/
         */

        // Fluid column video is inside of
        var fluidParent = document.querySelector('.media-container'), //selectors not supported but not needed
        newWidth;

        // Gets called when video needs resizing
        scope.resizeVideo = function(video) {
          if(video === undefined) return;
          $timeout( function(){

            newWidth = fluidParent.offsetWidth;
            video.setSize(newWidth, newWidth/1.77777778);
          },10);
        };

        // Sublime ready to use
        sublime.ready( function(){

          // Initiate video control
          sublime.prepare( video, function(player){

            scope.resizeVideo(player);

            $rootScope.$on('$routeChangeSuccess', function(){
              scope.resizeVideo(player);
            })

            angular.element(window).on('resize', function() {
              if(parseInt(jQuery(".media-container").css("width")) <= 1024) scope.resizeVideo(player);
            });

            angular.element(".video_placeholder").remove();
          })
        })
      }
    }
  }])
  .directive('initSlider', function(){
    return {
      link: function(scope,elem,attrs){
        angular.element(elem).flexslider({
          slideshow: false,
          controlNav: false,
          controlsContainer: ".media-container",
          video: true,
          before: function(){
            // Check sublime player is initiated before calling API
            // otherwise carousel crashes
            if(sublime !== undefined && sublime.player !== undefined){
              var player = player || sublime.player('challenge-film');
              player.pause();
            }
          }
        })
      }
    }
  })
  .directive("augmentCheckbox", function(){
    return {
      require: "^form",
      link: function(scope, elem, attrs, ctrl){

        var label = angular.element(elem);

        var clicked = false;

        // Bind signup method to new Checkbox
        elem[0].addEventListener("change", function(e){
          if(clicked){
            label.removeClass("checked");
            clicked = false;
          } else {
            label.addClass("checked");
            clicked = true;
          }
        });
      }
    }
  })
  .directive('initHover', ['$rootScope', '$location', function($rootScope, $location){
    return {
      link: function(scope,elem,attrs){
        var el = angular.element(elem[0]);

        $rootScope.$on('$routeChangeSuccess', function(){
          if($location.path() == '/home'){
            el.addClass("active");
          }
        })
        
        el.on('mouseout', function(e){
          el.removeClass('active','');
        });
      }
    }
  }])
  .directive('preventPaste', function(){
    return {
      link: function(scope, elem, attrs){
        elem.bind('paste', function(e){
          e.preventDefault();

          attrs.placeholder = "Pasting disabled for this field";
        })
      }
    }
  })
  .directive('invalidOption', function(){
    return {
      require: '?ngModel',
      scope: {
        invalidOption: '='
      },
      link: function(scope, elem, attrs, ctrl){
        elem.bind('change', function(e){
          if(elem.val().toLowerCase() == scope.invalidOption.toLowerCase()){
            ctrl.$setValidity(elem[0].name, false);
          } else {
            ctrl.$setValidity(elem[0].name, true);
          }
        });
      }
    }
  })
  .directive('validWordRange', function(){
    return {
      require: '?ngModel',
      scope: {
        validWordRange: '='
      },
      link: function(scope, elem, attrs, ctrl){
        var regex = /\S+/g,
            minRange = scope.validWordRange[0],
            maxRange = scope.validWordRange[1];
        elem.bind('keyup blur', function(e){
          if(ctrl.$modelValue !== undefined){
            var count = ctrl.$modelValue.match(regex).length;
            ctrl.$setValidity("word-count", count >= minRange && count <= maxRange ? true : false );
          }
        });
      }
    }
  })
  .directive('validate', function(){
    return {
      require: '?ngModel',
      link: function(scope, elem, attrs, ctrl){
        elem.bind('blur', function(e){
          if(ctrl.$invalid){
            elem.addClass('js-show-validation');
          } else { 
            elem.removeClass('js-show-validation');
          }
        });
      }
    }
  })
  .directive('twitterLink', function () {
    return {
      scope: {
        twitterLink: '@'
      },
      link: function(scope, elem, attrs) {
        elem.bind('click', function(e){

          //e.preventDefault();

          var origHref = attrs.href;
          //window.open(scope.twitterLink, '', 'menubar=no,toolbar=no,resizable=no,scrollbars=no');
          //window.open(origHref);
        });
      }
    };
  });

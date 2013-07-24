'use strict';

/* Directives */

angular.module('shaolin.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  });

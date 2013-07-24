'use strict';

/* Directives */

angular.module('shaolin.directives', []).
    directive('appVersion', function (version) {
        return function(scope, elm, attrs) {
          elm.text(version);
        };
    }).
    directive('autocomplete', ['$http', function($http) {
        return function (scope, elm, attrs) {
            console.log(elm);
            $(elm).autocomplete({
                minLength: 1,
                source: function (req, res) {
                    console.log("Trying to find completion info");
                    var url = "/search/doctor/all/" + req.term;
                    $http.get(url).success(function(data) {
                        res(data);
                    });
                },
                focus: function (event, ui) {
                    elm.val(ui.item.label);
                    return false;
                },
                select: function (event, ui) {
                    scope.searchId.selected = ui.item.value;
                    scope.$apply();
                    return false;
                },
                change: function (event, ui) {
                    if (ui.item === null) {
                        scope.searchId.selected = null;
                    }
                }
            }).data(elm)._renderItem = function (ul, item) {
                return $("<li></li>")
                .data("item.autocomplete", item)
                .append("<a>" + item.last_name + "</a>")
                .appendTo(ul);
            };
        }
    }]).
    directive('blur', function () {
        return function (scope, elem, attrs) {
            elem.bind('blur', function () {
                scope.$apply(attrs.blur);
            });
        };
    });

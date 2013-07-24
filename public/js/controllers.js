'use strict';

/* Controllers */

var geocoder = new google.maps.Geocoder ();

angular.module('shaolin.controllers', ["google-maps"]).
    controller('GMapsController', function ($scope, $timeout, $log) {
        google.maps.visualRefresh = true;

        angular.extend($scope, {
            position: {
                coords: {
                    latitude: 48.856,
                    longitude: 2.341
                }
            },
            center: {
                latitude: 48.856,
                longitude: 2.341
            },
            zoom: 12,
            markers: [],
            latitude: null,
            longitude: null,

            showValid: false,
            showInfo: false,
            showError: false,

            resetInfos: function () {
              $scope.showValid = false;
              $scope.showInfo = false;
              $scope.showError = false;
            },

            addMarker: function () {
                $scope.markers.push ({
                    latitude: parseFloat ($scope.latitude),
                    longitude: parseFloat ($scope.longitude),
                    infoWindow: $scope.infoWindow
                })
            },

            moveOnLocation: function (lat, lng, info) {
                    $scope.position.coords.latitude = lat;
                    $scope.position.coords.longitude = lng;

                    $scope.center = {
                        latitude: lat,
                        longitude: lng,
                    };

                    $scope.latitude = lat;
                    $scope.longitude = lng;
                    $scope.infoWindow = info;

                    $scope.addMarker ();
                    $scope.$apply ();
            },

            findMe: function () {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition (function (position) {
                        $scope.moveOnLocation (position.coords.latitude, position.coords.longitude, "Vous êtes à peu près ici !");
                    },
                    function () {
                    });
                }
                else {
                    $scope.resetInfos ();
                    $scope.showError = true;
                    $scope.error = "Impossible de vous localiser. Votre navigateur est-il correctement configuré ?";
                }
            },

            markAddress: function (address, name, firstname) {
                $scope.resetInfos();
                $scope.showInfo = true;
                $scope.info = "Looking for address " + address;

                geocoder.geocode ({address: address, region: 'FR'}, function (results, status) {
                    if (status != google.maps.GeocoderStatus.OK) {
                        $scope.showError = true;
                        $scope.error = "Impossible de trouver l'addresse demandée(" + address + ").<br />Êtes-vous sûr de l'avoir bien orthographiée ?";
                    }
                    else {
                        $scope.resetInfos ();
                        $scope.showValid = true;

                        var res = results[0];
                        console.log (res);
                        $scope.realAddress = res.formatted_address;
                        $scope.latitude = res.geometry.location.jb;
                        $scope.longitude = res.geometry.location.kb;

                        $scope.valid = "Addresse trouvée : " + res.formatted_address + ".";

                        $scope.moveOnLocation ($scope.latitude, $scope.longitude, "<strong>Dr " + firstname + " " + name + "</strong><br />" + "<em>" + $scope.realAddress + "</em>");
                    }
                    $scope.$apply ();
                    console.log ($scope);
                });
            },

            events: {
                click: function (mapModel, eventName, originalEventArgs) {
                    $log.log ("User defined event on map directive with scope", this);
                    $log.log ("User defined event: " + eventName, mapModel, originalEventArgs);
                    $log.log ("Scope : ", $scope);
                    //$scope.addMarker ();
                }
            }
        });
     });

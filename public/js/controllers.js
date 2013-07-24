'use strict';

/* Controllers */

var geocoder = new google.maps.Geocoder ();

angular.module('shaolin.controllers', ["google-maps", "ngResource"]).
    controller('GMapsController', function ($scope, $timeout, $log, $resource) {
        google.maps.visualRefresh = true;
        var DoctorDb = $resource('/api/doctors/:id', {id: '@id'},{
            'get': {method: 'GET', isArray: true, params: {action: 'get'}}
        });

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

            getFormattedInfo: function (firstName, lastName, address) {
                return "<strong>Dr " + firstName + " " + lastName + "</strong><br />" + "<em>" + address + "</em>";
            },

            addMarker: function (lat, lng, info) {
                $scope.markers.push ({
                    latitude: lat,
                    longitude: lng,
                    infoWindow: info
                });
            },

            addMarkerOnCurrent: function () {
              $scope.addMarker (parseFloat ($scope.latitude, $scope.longitude, $scope.infoWindow));
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

                    $scope.addMarkerOnCurrent ();
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

            addDoctor: function (address, lastName, firstName) {
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

                        new DoctorDb({
                            'first_name': firstName,
                            'last_name': lastName,
                            'formatted': res.formatted_address,
                            'coords': {
                                'latitude': res.geometry.location.jb,
                                'longitude': res.geometry.location.kb
                            }
                        }).$save();

                        $scope.moveOnLocation ($scope.latitude, $scope.longitude, $scope.getFormattedInfo (firstName, lastName, address));
                        $scope.addMarkerOnCurrent ();
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
                    //$scope.addMarkerOnCurrent ();
                }
            }
        });

        DoctorDb.get({}, function (doctors){
            for (var i in doctors) {
            var doctor = doctors[i];
            console.log(i, doctor, doctors);
                $scope.addMarker(doctor.coords.latitude, doctor.coords.longitude, $scope.getFormattedInfo (doctor.first_name, doctor.last_name, doctor.formatted));
            }
        });
     });

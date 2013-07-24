'use strict';

/* Controllers */


angular.module('shaolin.controllers', ["google-maps", "ngResource"]).
    controller("MapController", function ($scope, $resource, socket) {
        google.maps.visualRefresh = true;

        socket.on ('doctor:add', function(doctor) {
            $scope.addDoctor (doctor);
        });

        socket.on ('doctor:init', function(doctors) {
            for (var i in doctors) {
                var doctor = doctors[i];

                $scope.addDoctor (doctor);
            }
        });

        angular.extend ($scope, {
            center: {
                latitude: 48.856,
                longitude: 2.341
            },

            zoom: 12,
            markers: [],

            addDoctor: function (doctor) {
                console.log (doctor);
                var info = '<strong>Dr ' + doctor.first_name + ' ' + doctor.last_name + '</strong><br />';
                info += '<em>' + doctor.formatted + '</em><br />';
                info += '<a href="remove-doctor/' + doctor._id + '" class="btn btn-danger btn-mini"><i class="icon-white icon-remove in-gmaps-icon" alt="Supprimer"></i></a>';
                info += '<a href="edit-doctor/' + doctor._id + '" class="btn btn-info btn-mini"><i class="icon-white icon-pencil in-gmaps-icon" alt="Modifier"></i></a>';
                $scope.markers.push ({
                    id: doctor._id,
                    latitude: doctor.coords.latitude,
                    longitude: doctor.coords.longitude,
                    infoWindow: info,
                });
            },

            events: {
            }
        });
    }).

    controller("DoctorAdder", function ($scope, $resource, socket) {
        var geocoder = new google.maps.Geocoder ();
        var DoctorDb = $resource('/api/doctors/:id', {id: '@_id'});

        angular.extend ($scope, {
            firstName: "",
            lastName: "",
            address: "",

            infoStatus: "hidden",
            infoMessages: [],

            submit: function () {
                geocoder.geocode ({address: $scope.address, region: 'FR'}, function (results, status) {
                    if (status != google.maps.GeocoderStatus.OK) {
                        $scope.infoStatus = "error";
                        $scope.infoMessages = ["Impossible de trouver l'adresse demandée(" + $scope.address + ").", "Êtes-vous sûr de l'avoir bien orthographiée ?"];
                    }
                    else {
                        var res = results[0];

                        $scope.infoStatus = "valid";
                        $scope.infoMessages = ["Addresse trouvée : " + res.formatted_address + "."];

                        var doctor = {
                            'first_name': $scope.firstName,
                            'last_name': $scope.lastName,
                            'formatted': res.formatted_address,
                            'coords': {
                                'latitude': res.geometry.location.jb,
                                'longitude': res.geometry.location.kb
                            }
                        };

                        new DoctorDb(doctor).$save(function (res) {
                            if (res) {
                                $scope.infoMessages = ["Médecin ajouté !"];
                                socket.emit('doctor:add', doctor);
                            }
                            else {
                                $scope.infoStatus = "error";
                                $scope.infoMessages = ["Problème lors de l'insertion en base de données. Peut-être que le médecin que vous essayez d'ajouter existe déjà ?"];
                            }
                        });
                    }
                    $scope.$apply();
                });
            }
        });
    }).

    controller('DoctorRemover', function ($scope, $resource, $location) {
        var DoctorDb = $resource('/api/doctors/:id', {id: '@_id'}, {
            'get': {method: 'GET', isArray: true, params: {action: 'get'}}
        });

        angular.extend ($scope, {
            cancel: function () {
                $location.path ('/');
            },

            remove: function (id) {
                DoctorDb.get ({_id: id}, function (doctor) {
                    console.log (doctor);
                });
            }
        });
    }).


    controller('GMapsController', function ($scope, $timeout, $log, $resource) {
        google.maps.visualRefresh = true;
        var geocoder = new google.maps.Geocoder ();

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

            search: null,
            searchId: {selected: null},
            searchDisabled: true,

            validateModel: function () {
                $scope.searchDisabled = ($scope.searchId === null);
            },

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
              $scope.addMarker (parseFloat ($scope.latitude), parseFloat($scope.longitude), $scope.infoWindow);
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
                $scope.addMarker(doctor.coords.latitude, doctor.coords.longitude, $scope.getFormattedInfo (doctor.first_name, doctor.last_name, doctor.formatted));
            }
        });

        $scope.$watch ('searchId', function() {
            $scope.validateModel ();
        })
     });

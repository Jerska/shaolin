'use strict';

/* Controllers */
function statusUpdate (socket, type, messages) {
    socket.emit('status:update', {
        type: type,
        messages: messages
    });
}

var geocoder = new google.maps.Geocoder ();

function geocode (address, socket, callback) {
    geocoder.geocode ({address: address, region: 'FR'}, function (results, status) {
        if (status != google.maps.GeocoderStatus.OK) {
             statusUpdate (socket, 'error', [
                     "Impossible de trouver l'adresse demandée(" + address + ").",
                     "Êtes-vous sûr de l'avoir bien orthographiée ?"
                 ]
             );
        }
        else {
            var good = null;

            dance:
            for (var i = 0; i < results.length; ++i) {
                var addr_comp = results[i].address_components;
                for (var j = 0; j < addr_comp.length; ++j) {
                    if (addr_comp[j].short_name == "IDF") {
                        good = results[i];
                        break dance;
                    }
                }
            }

            if (!good) {
                statusUpdate (socket, 'error', [
                        "Impossible de trouver votre addresse en Île de France (" + address + ").",
                        "Êtes-vous sûr de l'avoir bien orthographiée ?",
                        "Spécifier votre recherche peut faire apparaître des résultats (Code Postal, Ville, ...)."
                    ]
                );
            }
            else {
                statusUpdate (socket, 'valid', ["Addresse trouvée : " + address + "."]);
                callback(good);
            }
        }
    });
}

angular.module('shaolin.controllers', ["google-maps", "ngSanitize"]).
    controller("StatusController", function ($scope, socket) {
        angular.extend ($scope, {
            infoStatus: "hidden",
            infoMessages: []
        });

        socket.on ('status:update', function(status) {
            $scope.infoStatus = status.type;
            $scope.infoMessages = status.messages;
        });

        socket.on ('status:hide', function () {
            $scope.infoStatus = "hidden";
        })
    }).

    controller("Researcher", function ($scope, $http) {
        angular.extend ($scope, {
            content: '',
            answers: [],
            visible: false,
            doctors: [],
            doShowAll: false,
            showAll: function () {
                $scope.doShowAll = true;
            }
        });

        $scope.$watch ('content', function () {
            if ($scope.content.length > 2) {
                $scope.visible = true;
                $http.get('/search/doctor/all/' + $scope.content).success (function (res) {
                    if (!$scope.doShowAll)
                        $scope.doctors = res.slice(0, 5);
                    else
                        $scope.doctors = res;
                });
                $scope.showAll = false;
            }
        });
    }).

    controller("MapController", function ($scope, socket) {
        google.maps.visualRefresh = true;

        socket.on ('doctor:init', function(doctors) {
            for (var i in doctors) {
                var doctor = doctors[i];

                $scope.addDoctor (doctor);
            }
        });

        socket.on ('doctor:add', function(doctor) {
            $scope.addDoctor (doctor);
        });

        socket.on ('doctor:remove', function(doctor) {
            for (var i in $scope.markers) {
                if ($scope.markers[i].id == doctor.id)
                    $scope.markers.splice (i, 1);
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
                var info = '<strong>Dr ' + doctor.first_name + ' ' + doctor.last_name + '</strong><br />';
                info += '<em>' + doctor.formatted + '</em><br />';
                info += '<a href="/remove-doctor/' + doctor._id + '" class="btn btn-danger btn-mini"><i class="icon-white icon-remove in-gmaps-icon" alt="Supprimer"></i></a>';
                info += '<a href="/edit-doctor/' + doctor._id + '" class="btn btn-info btn-mini"><i class="icon-white icon-pencil in-gmaps-icon" alt="Modifier"></i></a>';
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

        socket.emit ('doctor:init');
    }).

    controller("DoctorAdder", function ($scope, $sanitize, socket) {
        socket.on ('doctor:add:status', function(res) {
            if (!res.error) {
                    statusUpdate (socket, 'valid', ["Médecin ajouté !"]);
            }
            else {
                statusUpdate (socket, 'error', [
                    "Problème lors de l'insertion en base de données.",
                    "Peut-être que le médecin que vous essayez d'ajouter existe déjà ?"]
                );
            }
        });

        angular.extend ($scope, {
            firstName: "",
            lastName: "",
            address: "",

            submit: function () {
                $scope.firstName = $sanitize ($scope.firstName);
                $scope.lastName = $sanitize ($scope.lastName);
                $scope.address = $sanitize ($scope.address);

                if ($scope.firstName == "" || $scope.lastName == "" || $scope.address == "") {
                    statusUpdate (socket, 'error', [
                            "Veuillez remplir tous les champs !"
                        ]
                    );
                }
                else {
                    geocode ($sanitize($scope.address), socket, function (res) {
                        var doctor = {
                            'first_name': $scope.firstName,
                            'last_name': $scope.lastName,
                            'formatted': res.formatted_address,
                            'coords': {
                                'latitude': res.geometry.location.jb,
                                'longitude': res.geometry.location.kb
                            }
                        };
                        socket.emit('doctor:add', doctor);
                    });
                }
            }
        });
    }).

    controller("DoctorUpdater", function ($scope, $sanitize, socket) {
        socket.on ('doctor:update:status', function(res) {
            if (!res.error) {
                statusUpdate (socket, 'valid', ["Information du médecin mises à jour !"]);
                $scope.visible = false;
            }
            else {
                statusUpdate (socket, 'error', [
                    "Problème lors de la mise à jour dans la base de données.",
                    "Peut-être que le médecin que vous essayez de modifier a été supprimé entre-temps ?"]
                );
                $scope.visible = false;
            }
        });

        socket.on ('doctor:update:get', function(doctor) {
            if (doctor) {
                $scope.firstName = doctor.first_name;
                $scope.lastName = doctor.last_name;
                $scope.address = doctor.formatted;
            }
            else {
                statusUpdate (socket, 'error', [
                    "Problème lors de la recherche des informations du médecin dans la base de données.",
                    "Peut-être que le médecin que vous essayez de modifier a été supprimé entre-temps ?"]
                );
                $scope.visible = false;
            }
        });

        angular.extend ($scope, {
            firstName: "",
            lastName: "",
            address: "",

            visible: true,

            init: function (id) {
                $scope.id = id;
                socket.emit ('doctor:update:get', {_id: id});
            },

            submit: function () {
                $scope.id = $sanitize ($scope.id);
                $scope.firstName = $sanitize ($scope.firstName);
                $scope.lastName = $sanitize ($scope.lastName);
                $scope.address = $sanitize ($scope.address);

                if ($scope.firstName == "" || $scope.lastName == "" || $scope.address == "") {
                    statusUpdate (socket, 'error', [
                            "Veuillez remplir tous les champs !"
                        ]
                    );
                }
                else {
                    geocode ($sanitize($scope.address), socket, function (res) {
                        var new_infos = {
                            'id': $scope.id,
                            'first_name': $scope.firstName,
                            'last_name': $scope.lastName,
                            'formatted': res.formatted_address,
                            'coords': {
                                'latitude': res.geometry.location.jb,
                                'longitude': res.geometry.location.kb
                            }
                        };
                        socket.emit('doctor:update', new_infos);
                    });
                }
            }
        });
    }).

    controller('DoctorRemover', function ($scope, socket) {
        socket.on ('doctor:remove:status', function(res) {
            if (!res.error) {
                statusUpdate (socket, 'valid', ["Médecin enlevé !"]);
            }
            else {
                statusUpdate (socket, 'error', ["Impossible de supprimer le médecin !", "Peut-être vient-il de l'être ?"]);
            }
            $scope.visible = false;
        });

        angular.extend ($scope, {
            visible: true,

            cancel: function () {
                $scope.visible = false;
            },

            remove: function (id) {
                socket.emit('doctor:remove', {_id: id});
            }
        });
    });

    /* // Old unique controller. Cannot work anymore because of removal of angularbridge
     controller('GMapsController', function ($scope, $timeout, $log, $resource) {
        google.maps.visualRefresh = true;
        var geocoder = new google.maps.Geocoder ();

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
     });*/

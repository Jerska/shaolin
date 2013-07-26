var db = require('./db');

function init (io) {
    io.sockets.on('connection', function (socket) {
        socket.on ('doctor:init', function () {
            db.Doctor.find({}, function (err, doctors) {
                if (!err)
                    socket.emit ('doctor:init', doctors);
            });
        });

        socket.on ('status:update', function (status) {
            socket.emit ('status:update', status);
        });

        socket.on ('doctor:add', function (doctor) {
            new db.Doctor (doctor).save(function (err, doctor) {
                socket.emit('doctor:add:status', {error: err});
                if (!err)
                    io.sockets.emit ('doctor:add', doctor);
            });
        });

        socket.on ('doctor:update:get', function (res) {
            db.Doctor.findById (res._id, function (err, doctor) {
                socket.emit ('doctor:update:get', doctor);
            });
        });

        socket.on ('doctor:update', function (newDoctor) {
            console.log (newDoctor);
            db.Doctor.findById (newDoctor.id, function (err, doctor) {
                if (err) {
                    socket.emit('doctor:update:status', {error: err});
                }
                else {
                    doctor.first_name = newDoctor.first_name;
                    doctor.last_name = newDoctor.last_name;
                    doctor.formatted = newDoctor.formatted;
                    doctor.coords.latitude = newDoctor.coords.latitude;
                    doctor.coords.longitude = newDoctor.coords.longitude;

                    doctor.save (function (err) {
                        socket.emit('doctor:update:status', {error: err});
                        if (!err)
                            io.sockets.emit ('doctor:update', doctor);
                    });
                }
            });
        });


        socket.on ('doctor:remove', function (res) {
            db.Doctor.findById (res._id, function (err, doctor) {
                if (!err) {
                    doctor.remove(function (err) {
                        socket.emit ('doctor:remove:status', {error: err});
                    });
                }
                else {
                    socket.emit ('doctor:remove:status', {error: true});
                }
            });
            io.sockets.emit ('doctor:remove', {id : res._id});
        });

        socket.on ('include:remove', function (res) {
            socket.emit ('include: remove', res);
        });

        socket.on ('include:update', function (res) {
            socket.emit ('include: update', res);
        });
    });
};

exports.init = init;

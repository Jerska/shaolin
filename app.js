
/**
 * Module dependencies
 */

var express = require('express'),
    routes = require('./routes'),
    search = require('./routes/search'),
    db = require('./db'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    mongodb = require('mongodb'),
    Cursor = mongodb.Cursor;

var app = module.exports = express();

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', express.basicAuth('root', 'root'));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
    app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
    // TODO
};

/**
 * Routes
 */

// serve index
app.get('/', routes.index);

// serve subcategories
app.get('/map', routes.map)
app.get('/add-doctor', routes.addDoctor)
app.get('/edit-doctor/:id', routes.editDoctor)
app.get('/remove-doctor/:id', routes.removeDoctor)

// serve searches
app.get('/search/doctor/adress/:addr', search.searchDoctorByAddress);
app.get('/search/doctor/name/:value', search.searchDoctorByName);
app.get('/search/doctor/all/:value', search.searchDoctorAll);

var angularBridge = new (require('angular-bridge'))(app, {
    urlPrefix: '/api/'
});
angularBridge.addResource('doctors', db.Doctor);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * Start Server
 */

var server = http.createServer(app),
    io = io.listen(server);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
    db.Doctor.find({}, function (err, doctors) {
        if (!err)
            socket.emit ('doctor:init', doctors);
    });
    socket.on ('doctor:add', function (doctor) {
        socket.broadcast.emit ('doctor:add', doctor);
    });
    socket.on ('doctor:remove', function (doctorId) {
        socket.broadcast.emit ('doctor:remove', doctorId);
    });
});


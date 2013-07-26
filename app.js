
/**
 * Module dependencies
 */

var express = require('express'),
    routes = require('./routes'),
    search = require('./routes/search'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    sockets = require('./sockets.js');

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
app.get('/search-doctor', routes.searchDoctor)
app.get('/README', routes.readMe)

// serve partials
app.get('/partials/map', routes.partialMap)
app.get('/partials/add-doctor', routes.partialAddDoctor)
app.get('/partials/edit-doctor/:id', routes.partialEditDoctor)
app.get('/partials/remove-doctor/:id', routes.partialRemoveDoctor)
app.get('/partials/search-doctor', routes.partialSearchDoctor)

// serve searches
app.get('/search/doctor/adress/:addr', search.searchDoctorByAddress);
app.get('/search/doctor/name/:value', search.searchDoctorByName);
app.get('/search/doctor/all/:value', search.searchDoctorAll);

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

sockets.init (io);

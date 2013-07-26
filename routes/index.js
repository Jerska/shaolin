var fs = require ("fs");
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

/*
 * GET doctors related pages
 */

exports.map = function(req, res){
  res.render('map');
};

exports.partialMap = function(req, res){
  res.render('partials/map');
};

exports.addDoctor = function(req, res) {
  res.render('add-doctor');
};

exports.partialAddDoctor = function(req, res) {
  res.render('partials/add-doctor');
};

exports.editDoctor = function (req, res) {
  res.render('edit-doctor', {id: req.params.id});
};

exports.partialEditDoctor = function (req, res) {
  res.render('partials/edit-doctor', {id: req.params.id});
};

exports.removeDoctor = function (req, res) {
  res.render('remove-doctor', {id: req.params.id});
};

exports.partialRemoveDoctor = function (req, res) {
  res.render('partials/remove-doctor', {id: req.params.id});
};

exports.searchDoctor = function(req, res) {
  res.render('search');
};

exports.partialSearchDoctor = function(req, res) {
  res.render('partials/search');
};

exports.readMe = function (req, res) {
    fs.readFile ('README.md', function (err, data) {
        res.writeHead (200, {'Content-Type': 'text/plain'});
        res.write (data);
        res.end ();
    });
  };


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

exports.addDoctor = function(req, res) {
    res.render('add-doctor');
};

exports.editDoctor = function (req, res) {
    res.render('edit-doctor', {id: req.params.id});
};

exports.removeDoctor = function (req, res) {
    res.render('remove-doctor', {id: req.params.id});
};

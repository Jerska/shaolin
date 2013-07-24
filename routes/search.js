var Doctor = require('../db').Doctor;
/*
 * JSON output for the search
 */

function getAlike (parameters, value, callback) {
  if (parameters.length == 0) {
    callback ([]);
    return;
  }

  var filter = {};
  filter[parameters.shift()] = new RegExp (value, 'i');
  console.log (filter);

  Doctor.find(filter, function (err, results) {
      if (err) {
          console.log ("An error happened while searching for a doctor !");
          getAlike (parameters, value, function (newResults) {
              callback(newResults);
          });
      }

      else {
        getAlike(parameters, value, function (newResults) {
            callback(results.concat(newResults));
        });
      }

  });
}

exports.searchDoctorByAddress = function (req, res) {
  getAlike (['formatted'], req.params.addr, function (results) {
      res.send (results);
  });
};

exports.searchDoctorByName = function (req, res) {
  getAlike (['last_name', 'first_name'], req.params.value, function (results) {
      res.send (results);
  });
}

exports.searchDoctorAll = function (req, res) {
  getAlike (['last_name', 'first_name', 'formatted'], req.params.value, function (results) {
      res.send (results);
  });
}

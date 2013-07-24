var mongoose = require ('mongoose'),
    db = mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/shaolin'),
    Schema = mongoose.Schema;

var DoctorSchema = new Schema ({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    formatted: {
        type: String
    },
    coords: {
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        }
    }
});

DoctorSchema.methods.query = function(entities) {
  console.log("Queried:");
  console.log(entities);
};

DoctorSchema.methods.get = function(entity) {
  console.log("Got:")
  console.log(entity);
};

DoctorSchema.methods.put = function(entity) {
  console.log("Put:")
  console.log(entity);
};

DoctorSchema.methods.post = function(entity) {
  console.log("Posted:")
  console.log(entity);
};

DoctorSchema.methods.delete = function(entity) {
  console.log("Deleted:")
  console.log(entity);
};

exports.Doctor = mongoose.model('doctors', DoctorSchema);

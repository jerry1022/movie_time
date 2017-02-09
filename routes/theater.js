var
  TheaterModel = require('../models/theaterModel'),
  theaterModel = new TheaterModel();

var getTheater = function (req, res) {
  var name = req.query.name,
      address = req.query.address;
  console.log(name); 
  theaterModel.getTheater({
      $and: [
       {name: new RegExp(name, 'i')},
       {address: new RegExp(address, 'i')}
      ]
      }, function (json) {
    if (json !== null) {
      res.status(200).json(json);
    } else {
      res.status(200).json([]);
    }
  });
};

module.exports = {
  getTheater: getTheater
};

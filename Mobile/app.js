0
/**
 * Created by SMD on 1/8/2016.
 */
var express = require('express');
var server = require('http');
var path = require("path");
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var app = express();

var publicPath = path.resolve(__dirname, "www");
app.use(bodyParser.json());
app.use(express.static(publicPath));
app.get('/', function (req, res) {
  // console.log(publicPath);
  res.sendFile("./www/index.html", {root: __dirname});
});

var dbURI = 'mongodb://localhost:27017/testdatabase';
mongoose.connect(dbURI);
mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

var userSchema = new mongoose.Schema({
  name: String,
  password: String,
  id: String,
  email: {type: String, unique: true},
  createdOn: {type: Date, default: Date.now},
  comid: [{type: mongoose.Schema.Types.ObjectId, ref: 'company'}],
  Order: [{type: Schema.ObjectId, ref: 'Order'}]

});
var CompanySchema = new mongoose.Schema({
  CompanyName: String,
  password: String,
  email: {type: String, unique: true},
  createdOn: {type: Date, default: Date.now},
  user: [{type: Schema.ObjectId, ref: 'User', default: []}]
});

var OrderSchema = new mongoose.Schema({
  ShopName: String,
  product: String,
  quantity: String,
  Lat:String,
  Long:String,
  createdOn: {type: Date, default: Date.now},
  user: [{type: Schema.ObjectId, ref: 'User', default: []}]

});
mongoose.model('Order', OrderSchema);
var Order = mongoose.model('Order');

mongoose.model('User', userSchema);
var User = mongoose.model('User');

mongoose.model('company', CompanySchema);
var company = mongoose.model('company');

app.post('/account', function (req, res) {
  console.log(req.body.Shop);
  console.log(req.body.Product);
  console.log(req.body.quantity);
  console.log(req.body.Lat);
  console.log(req.body.Long);

  new Order({
    ShopName: req.body.Shop,
    product: req.body.Product,
    quantity: req.body.quantity,
    Lat:req.body.Lat,
    Long:req.body.Long
  })
    .save(function (err, doc) {
      if (err)res.json(err);
      else
        User.findByIdAndUpdate(
          req.body.id,
          {$push: {Order: doc._id}},
          {safe: true, upsert: true, new: true},
          function (err, user) {
            if (err)
              console.log(err);
            else
            //      console.log("------doc------"+user);
              User.find({}, function (err, user) {
                if (!err) {

                  // console.log(company);
                  res.json(user);

                }
              });


          }
        );

    });

});
app.post("/login", function (req, res) {
//  console.log(req.body.email);
  User.findOne({
    email: req.body.email,
    password: req.body.password

  }).exec(function (err, user) {
    if (err) throw err;
    if (!user) {
      console.log("email and password doesnot match");
      // return res.status(404);
      req.setTimeout(1000, function () {
        console.log('timed out');
        req.abort();
      });
    }
    else {
      //console.log("login Successfully with id" + user._id);
      return res.status(200).json(user);
    }
  });


});
app.get('/details', function (req, res) {
  //console.log('I received a GET request');
  company.find({}, function (err, users) {
    if (!err) {
      res.json(users);
    }

  });

});

app.post('/viewproduct', function (req, res) {
  var query = req.body.id;
    User.findById(req.body.id)
      .populate('Order')

      .find({}, function (err, orders) {
        if (!err) {
          console.log("-------------------------------" + orders);
          res.json(orders);
        }
      });
});

app.listen(3000);
console.log("Server Running on port 3000");

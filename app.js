/**
 * Created by SMD on 1/29/2016.
 */
var express = require('express');
var server = require('http');
var path = require("path");
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var app = express();

var staticDIR = path.resolve(__dirname, "./www");
app.use(express.static(staticDIR));
app.use(bodyParser.json());

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
var AdminSchema = new Schema({
    email: {type: String, unique: true},
    password: String,
    id: String
});

var CompanySchema = new Schema({
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
    createdOn: {type: Date, default: Date.now},
    user: [{type: Schema.ObjectId, ref: 'User', default: []}]

});
mongoose.model('Order', OrderSchema);
var Order = mongoose.model('Order');

mongoose.model('User', userSchema);
var User = mongoose.model('User');
mongoose.model('company', CompanySchema);
var company = mongoose.model('company');
mongoose.model('Admin', AdminSchema);
var Admin = mongoose.model('Admin');


app.post('/account', function (req, res) {
    console.log(req.body.email);
    new company({
        CompanyName: req.body.Company,
        email: req.body.email,
        password: req.body.password
    }).save(function (err, doc) {
            if (err)res.json(err);
            else
                res.send("succesfully inserted");
            //console.log(res);
        });

});
app.post("/login", function (req, res) {
    //console.log(req.body.email);
    company.findOne({
        email: req.body.email,
        password: req.body.password

    }).exec(function (err, user) {
        if (err) throw err;
        if (!user) {
            console.log("email and password doesnot match");
            return res.status(404).json(err);
        }
        else {
            console.log("login Successfully with id" + user._id);
            return res.status(200).json(user);
        }
    });


});

app.post("/adminlogin", function (req, res) {
    console.log(req.body.email);
    Admin.findOne({
        email: req.body.email,
        password: req.body.password

    }).exec(function (err, user) {
        if (err) throw err;
        if (!user) {
            console.log("email and password doesnot match");
            return res.status(404);
        }
        else {
            console.log("login Successfully with id" + user._id);
            return res.status(200).json(user);
        }
    });


});


app.get("/", function (req, res, next) {
    var indexViewPath = path.resolve(__dirname, "./www/index.html");
    res.sendFile(indexViewPath);
    next();
});
app.get('/details', function (req, res) {
    //  console.log('I received a GET request');
    company.find({}, function (err, users) {
        if (!err) {
            res.json(users);
        }

    });

});

app.post('/companyuser', function (req,res) {
    //console.log("Company-------------------------------");
    //var query = req.body.id;
    //console.log( req.body.id);
    company.findById(req.body.id)
        .populate('user')
        .find({}, function (err, company) {
            if (!err) {
              //  console.log("-------------------------------" + company);
                res.json(company);

            }
        });
});




app.post('/viewuser', function (req, res) {
    var query = req.body.comid;
    company.findById(req.body.comid)
        .populate('user')

        .find({}, function (err, company) {
            if (!err) {

              //  console.log("-------------------------------" + company);
                res.json(company);


            }
        });
});
app.post('/viewSalesmen', function (req, res) {
    var query = req.body.comid;
    console.log( req.body.id);

    User.findById(req.body.id)
        .populate('Order')

        .find({}, function (err, orders) {
            if (!err) {
                console.log("-------------------------------" + orders);
                res.json(orders);
            }
        });




    //company.findById(req.body.id)
    //
    //    .populate({
    //        path: 'user',
    //        populate: {
    //            path: 'Order'
    //        }
    //    })
    //
    //    .find({}, function (err, company) {
    //        if (!err) {
    //
    //            console.log("-------------------------------" + company);
    //            res.json(company);
    //
    //
    //        }
    //    });
});


app.post('/salesmen', function (req, res) {
   // console.log(req.body.uemail);
    new User({
        name: req.body.uname,
        email: req.body.uemail,
        password: req.body.upassword,
        comid: req.body.comid

    }).save(function (err, doc) {

            if (err) {
                res.json(err);
                //   console.log("-----------err----------"+err);
            } else {
                console.log("-----------doc----------"+doc);
                company.findByIdAndUpdate(
                    req.body.comid,
                    {$push: {user: doc._id}},
                    {safe: true, upsert: true, new: true},
                    function (err, user) {
                        if (err)
                            console.log(err);
                        else
                        //      console.log("------doc------"+user);
                            company.find({}, function (err, company) {
                                if (!err) {

                                    // console.log(company);
                                    res.json(company);

                                }
                            });


                    }
                );
            }
        });


});


app.listen(9000);
console.log("Server Running on port 9000");

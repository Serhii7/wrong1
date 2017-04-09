var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/user');
var path = require('path');
var bodyParser = require('body-parser')

var app = express();

mongoose.connect('mongodb://localhost/myappdatabase', function(error) {
  console.log(error);
  // Check error in initial connection. There is no 2nd param to the callback.
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, './public/')));


app.post('/', function(req, res) {
	var correcion = req.body;
    console.log(req.body); // This your request data
    var userFind = User.findOne({'username':correcion.login,'password':correcion.password},function(err,docs){
    	if (err) throw err;
		if(docs){
			console.log('true');
			res.redirect("/signin.html");
			
		}else{
			console.log('false');
			res.redirect("/userpage.html");
	
		}
       
    });
		
    // res.send("This is auth route");
 
    /*
     * Write your auth logic here
     */

});

app.listen(3000, function() {
    console.log("Server is working on http://localhost:3000/");
});
// var chris = new User({
//   name: 'Chris',
//   username: 'sevilayha',
//   password: 'password' 
// });

// chris.dudify(function(err, name) {
//   if (err) throw err;

//   console.log('Your new name is ' + name);
// });

// call the built-in save method to save to the database
// chris.save(function(err) {
//   if (err) throw err;

//   console.log('User saved successfully!');
// });

// mongoose.shows.find();


// User.find({}, function(err, users) {
//   if (err) throw err;

//   // object of all the users
//   console.log(users);
// });



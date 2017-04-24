var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/user');
var Post = require('./models/posts');
var parseJson = require('parse-json');
var Dialog = require('./models/dialog');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//-------------------

//--------------


var app = express();
app.use(cookieParser());
var http = require('http').Server(app);

var io = require('socket.io')(http);

var jwt  = require('jsonwebtoken');

mongoose.connect('mongodb://localhost/mynewbase', function(error) {
	console.log(error);
});




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, './public/')));
app.get('/',function(req,res){
	
	var token = req.cookies.token;
	console.log(token);
	if(token){
		res.redirect("userpage");
		return;
	}else{
		res.sendFile(__dirname + '/public/input.html');
	}
});

app.get('/chat',function(req, res){
	res.sendFile(__dirname +'/public/chat.html');


});
io.on('connection', function(socket){

	socket.on('init', function(val){

		var DialogFind = Dialog.findOne({"_id":val},function(err,docs){
			if (err) throw err;

			if(docs){

				socket.join(val);
				Dialog.findOne({}, function(err, dialogs) {

					var messages =[];

					if(dialogs.msg.length < 5){
						for(i = 0; i < dialogs.msg.length; i++){
						messages[i] = dialogs.msg[i];}
					} else {
						y=0;
						for(i = (dialogs.msg.length-5); i <= (dialogs.msg.length-1); i++){
						messages[y] = dialogs.msg[i];
						y++;
						}
					}
					console.log(dialogs);
					io.emit("messages", messages);
				});
			}else{
					console.log("no");
					var dialogNew = new Dialog({
						id_user1: 0,
						id_user2: 1,
					});
					dialogNew.save(function(err) {
						if (err) throw err;
					});
				}
		});
			Dialog.find({}, function(err, dialogs) {
				if (err) throw err;
				console.log(dialogs);
			});

	});
	socket.on('delete',function(id){
		Dialog.update({"_id": "58fa1135aa793a2ebcbc3abf"}, {"$pull": { "msg": {"_id":id} } },function(err){
			if(err){console.log(err);}
			else{console.log("+");}
		});
	})
	socket.on('chat message', function(msg){

		Dialog.update({_id:msg.room},{$push:{msg:{text:msg.mess}}},function(err){
			if(err){console.log(err);}
		});
		Dialog.findOne({}, function(err, dialogs) {
			  if (err) throw err;
			  var i = dialogs.msg.length -1;
			io.to(msg.room).emit('chat message',{mess: msg.mess,id:dialogs.msg[i]._id});
			});
	});
});

app.post('/reg', function(req,res){
	var correcion = req.body;
	var userFind = User.findOne({'username':correcion.login,'password':correcion.password},function(err,docs){
    	if (err) throw err;
		if(docs){
			res.send('Login is used');
		}else{
			var usernew = new User({
			  email: correcion.email,
			  username: correcion.login,
			  password: correcion.password 
			});
			usernew.save(function(err) {
		  		if (err) throw err;
			});
		}
    });

})
app.get('/userpage/:id',function(req,res){
	var login = req.url.split("/").pop();
	res.send("page is "+login);
});
app.get('/userpage',function(req,res){
	var token = req.cookies.token;
	if(!token){
		res.sendFile(__dirname +'/public/input.html');
		return;
	}else{
		try{
			var tokenObg = jwt.verify(token,'shhhhh');
		}catch(e){
			console.log(e);
		}
		Post.find({}, function(err, posts) {
			if (err) throw err;
			render (posts);
		});

		function render(posts){
			res.render("dialog.ejs", {tokenObg:tokenObg , posts:posts[0].post});
		}
	}
})

app.post('/', function(req, res) {
	var correcion = req.body;

	User.find({},function(err,users){
		console.log(users);
	})

    console.log(req.body); 
    var userFind = User.findOne({'username':correcion.login,'password':correcion.password},function(err,docs){
    	if (err) throw err;
		if(docs){
			console.log('true');
			var token = jwt.sign({ "q": docs.username, "_id":docs._id}, 'shhhhh');
			console.log(token);

			try{
			var decoded = jwt.verify(token,'shhhhh');
			}catch(e){
				console.log('Error');
			}
				console.log(decoded.q);
				res.cookie("token",token);
				console.log(req.cookies);
    			res.send({redirectTo: "userpage"});
		}else{
			console.log('false');
			res.send("Login or password are not correct");
		}
    });
});

function tokenVerify(token){
	try{
	var decoded = jwt.verify(token,'shhhhh');
	}catch(e){
		decoded = null;
	}
	return decoded;
}

app.post("/addposts", function(req,res){
	var postData = req.body;

	tokenObj = tokenVerify(req.cookies.token);

	Post.findOne({user_id_who:tokenObj._id},function(err,post){
		if(err) throw err;
		if(post){
			Post.update({"_id": post._id}, {"$push": { "post": {
				text: postData.text,
				picture:postData.picture,
				likes:0
			} } },function(err){
					if(err){console.log(err);}
					else{console.log("+");
					}
				});
			}else{
				var postnew = new Post({

					user_id_who:tokenObj._id,
					post:[
						{
							text: postData.text,
							picture:postData.picture,
							likes:0
						}
					]
				});
				postnew.save(function(err) {
			  		if (err) throw err;
				});

			}
		})
	 res.send("done");
});
app.post('/comment',function(req, res){
	var obj = req.body;
	if(req.cookies.token){
		if(obj.option == "add"){
			Post.update({ "post._id":obj.id},{$push:{"post.$.comments":{"textComment":obj.text,"likes":0}}},function(err){
				if(err){console.log(err);}
			});
		}else if(obj.option == "delete"){
			Post.update({ "post._id":obj.idP},{$pull:{"post.$.comments":{"_id":obj.idC}}},function(err){
				if(err){console.log(err);}
			});
		}else if(obj.option =="like"){
			Post.findOne({},function(err, post){
					console.log(post);
				});
			});
		}
	}
	res.send("1");
});
app.get('/posts',function(req,res){

	req.method = "post";
	Post.find({}, function(err, posts) {
		if (err) throw err;
		render(posts);
	});
	function render(posts){
		res.render('postpage.ejs',{a:posts});
	}
});
app.post('/deletePost',function(req, res){
	var id = req.body.id;
	console.log(id);
	tokenObj = tokenVerify(req.cookies.token);
	Post.findOne({user_id_who:tokenObj._id},function(err,post){
		if(err) throw err;

		if(post){
			Post.update({"_id": post._id}, {"$pull": { "post": {"_id":id} } },function(err){
				if(err){console.log(err);}
				res.send("yes delete");
			});
		}else{
			res.send("not delete");
		}
	});

})

http.listen(3000, function() {
    console.log("Server is working on http://localhost:3000/");
});


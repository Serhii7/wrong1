var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/user');
var Post = require('./models/posts');
var parseJson = require('parse-json');
var Comments = require('./models/comment');
var Dialog = require('./models/dialog');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require("multer");

//-------------------

//--------------


var app = express();

var storage = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, './uploads/')
   },
   filename: function (req, file, cb) {
   	var tokenObj = tokenVerify(req.cookies.token);
     cb(null, tokenObj._id + path.extname(file.originalname));
   }
});
var upload = multer({storage:storage});


var storageBg = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, './uploads')
   },
   filename: function (req, file, cb) {
   	var tokenObj = tokenVerify(req.cookies.token);
     cb(null, "bg" + tokenObj._id + path.extname(file.originalname));
   }
});
var uploadBg = multer({storage:storageBg});

var storagePost = multer.diskStorage({
   destination: function (req, file, cb) {
     cb(null, './uploads')
   },
   filename: function (req, file, cb) {
   	var tokenObj = tokenVerify(req.cookies.token);
     cb(null, "post" + tokenObj._id + path.extname(file.originalname));
   }
});
var uploadPost = multer({storage:storagePost});

app.use(cookieParser());
var http = require('http').Server(app);

var io = require('socket.io')(http);

var jwt  = require('jsonwebtoken');

mongoose.connect('mongodb://localhost/mynewbase', function(error) {
	if(error){
	console.log(error);
}
});


app.post("/uploads", upload.single('uploadFile') ,function(req, res){
	var tokenObj = tokenVerify(req.cookies.token);
	// console.log(req.file.filename);
	User.update({_id:tokenObj._id},{$set:{pathAvatar:req.file.path}},function(err){
		if(err) throw err;
	});
	res.send("this");
});
app.post("/uploadsPost", uploadPost.single('uploadFileP') ,function(req, res){

	tokenObj = tokenVerify(req.cookies.token);

		var postnew = new Post({

			user_id_who:tokenObj._id,
			user_id:tokenObj.q,
			text: req.body.text[0],
			likes:0,
			picture:req.file.path,
			date:new Date().toJSON().slice(0,10)
		});
		postnew.save(function(err) {
	  		if (err) throw err;
		});

	res.send(req.text);
});

app.post("/uploads/bg", uploadBg.single('uploadFileBg') ,function(req, res){
	var tokenObj = tokenVerify(req.cookies.token);
	// console.log(req.file.filename);
	User.update({_id:tokenObj._id},{$set:{pathBg:req.file.path}},function(err){
		if(err) throw err;
	});
	res.send("this");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, './public/')));
app.get('/',function(req,res){
	
	var token = req.cookies.token;
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
app.get('/uploads/:id',function(req,res){
	var login = req.url.split("/").pop();
	res.sendFile(__dirname + '/uploads/' + login);
})

io.on('connection', function(socket){

		socket.on('init', function(val){

		var DialogFind = Dialog.findOne({"_id":val},function(err,docs){
			if (err) throw err;

			if(docs){

				socket.join(val);
				Dialog.findOne({"_id":val}, function(err, dialogs) {

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
					// console.log(dialogs + "here");
					io.emit("messages", messages);
				});
			}else{
					// console.log("no");
					var dialogNew = new Dialog({
						id_user1: 0,
						id_user2: 1,
					});
					dialogNew.save(function(err) {
						if (err) throw err;
					});
				}
		});
			// Dialog.find({}, function(err, dialogs) {
			// 	if (err) throw err;
			// 	console.log(dialogs);
			// });

	});
	socket.on('delete',function(id){
		Dialog.update({"_id": "5900cf8c942fc32808ef562f"}, {"$pull": { "msg": {"_id":id} } },function(err){
			if(err){console.log(err);}
			else{console.log("+");}
		});
	})
	socket.on('chat message', function(msg){
		var tokenObj = tokenVerify(msg.token);
		var author = tokenObj._id;
		Dialog.update({_id:msg.room},{$push:{msg:{text:msg.mess, author:author}}},function(err){
			if(err){console.log(err);}
		Dialog.findOne({}, function(err,dialogs) {
			  if (err) throw err;
			  var i = dialogs.msg.length -1;
			  // console.log(dialogs);
				io.to(msg.room).emit('chat message',{mess: msg.mess,id:dialogs.msg[i]._id});
			});
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
		Post.find({user_id_who: tokenObg._id}, function(err, posts) {
			if (err) throw err;
			// console.log(posts);
					userDialog(posts);
				
			}
		);
		function userDialog(posts){

			var dialogsList = [];
			var j = 0;
			User.findOne({_id:tokenObg._id},function(err,userDialogs){
				// console.log(userDialogs.dialogs[0].idDialog + userDialogs.username);
				userDialogs.dialogs.forEach(function(ell){
				Dialog.findOne({_id:ell.idDialog},function(err,wer){
					 if(wer.msg.length > 0){
						dialogsList.push(wer._id);
					 	j++;
							
					}else{
					// console.log("false"+wer._id);
					}
				if(j == userDialogs.dialogs.length){
						// console.log(dialogsList);
						if(posts.length == 0){
							render([],[],dialogsList);
						}
						recomendation(posts, dialogsList);
					}
				});
				});
			});
		};

		function recomendation(posts, dialogsList){
			User.findOne({"_id":tokenObg._id},function(err, docs){
				if(err) throw err;
				var tag = docs.tag;

				User.find({'owntags.owntag':tag}).sort({'follow':-1}).limit(5).exec(function(err, recom){
					// console.log("strat" + us +" kznm");
					comment(posts, dialogsList, recom);
				});
			});
					followers();
		}
		function followers(){
			var follow = [];
			j = 0;
			User.findOne({_id:tokenObg._id}, function(err, docs){
				if(err) throw err;
				docs.follower.forEach(function(ell) {
					User.findOne({_id:ell.idFollower},function(err, user) {
						follow.push({
							username:ell.username,
							pathAvatar:ell.pathAvatar,
							describe:ell.describe
						});
						j++;
						if(j == docs.follower.length){
							// console.log("foolow"+follow+"end" );
						}
					})
				})
			});
		}
		function comment(posts, dialogsList, recom){
			var comments = [];
			var content = [];
			var user;
			var j = 0;
			User.findOne({_id:tokenObg._id},function(err, doc){
				if(err) throw err;
				if(doc){
					user = doc;
					// console.log(doc + "this is a user");
				}
				if(posts.length == 0){
					render(posts ,comments, dialogsList, user);
				} else {
					serchpost();
				}
			})
			function serchpost() {
				posts.forEach(function(ell){
					Comments.find({id_post:ell._id}, function(err,docs){
						content.push({
							_id:ell._id,
							text:ell.text,
							likes:ell.likes,
							user_id:ell.user_id,
							user_id_who:ell.user_id_who,
							comments:docs,
							picture:ell.picture,
							date:ell.date
						});
						j++;
						if(j == posts.length){
							render(content ,comment, dialogsList, user, recom);
						}
					});
				})
			}
		}
		function render(posts,comments, dialogsList, user, recom){
			//User.findOne({_id:tokenObg._id},function(err,docs){

				var follow = [];
				j = 0;
				User.findOne({_id:tokenObg._id}, function(err, docs){
					if(err) throw err;
					docs.follower.forEach(function(ell) {
						User.findOne({_id:ell.idFollower},function(err, userParam) {
							follow.push({
								username:userParam.username,
								pathAvatar:userParam.pathAvatar,
								describe:userParam.describe
							});
							j++;
							if(j == docs.follower.length){
								// console.log("foolow"+follow+"end" );
								res.render("dialog.ejs", {tokenObg:tokenObg , posts:posts,comment:comments, dialogs: dialogsList, path:docs.pathAvatar, pathBg:docs.pathBg, users:user, recom:recom, follow:follow});
							}
						})
					})
				});


				// console.log(docs);
			//});
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
app.get('/userpage/:id',function(req,res){
	var login = req.url.split("/").pop();
	var userId;

	User.findOne({username:login},function(err, user1){
			userId = user1._id;
			console.log(user1._id + "sdfjkh");

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
		Post.find({user_id_who: userId}, function(err, posts) {
			
			if (err) throw err;
					console.log(posts);
				if(posts.length == 0){
					render([],[]);
				}else{
					comment(posts);
				}
			}
		);

		function comment(posts, dialogsList){
			var comments = [];
			var content = [];
			var j = 0;
			if(posts.length == 0){
				render(posts ,comments, dialogsList);
			}

			posts.forEach(function(ell){
				Comments.find({id_post:ell._id}, function(err,docs){
					content.push({
						_id:ell._id,
						text:ell.text,
						likes:ell.likes,
						user_id:ell.user_id,
						user_id_who:ell.user_id_who,
						comments:docs,
						picture:ell.picture,
						date:ell.date
					});
					j++;
					if(j == posts.length){
						// console.log(content[0].comments[0].textComment);
						render(content ,comment, dialogsList);
					}
				});
				})
			
		}
		function render(posts,comments){
			res.render("postpage.ejs", {tokenObg:tokenObg , posts:posts,comment:comments,userId:userId });
	// res.send("sdf");
		}

	}
});

});
app.post("/sendMessege", function(req, res) {

	// User.findOne({},function(err,doc){
	// 	console.log(doc);
	// })
	Dialog.find({},function(err, d){
		console.log(d);
	})
	var idUser1 = req.body.userId;
	var tokenObj = tokenVerify(req.cookies.token);
	var idUser2 = tokenObj._id;
	Dialog.findOne({$or:[{id_user1:idUser1,id_user2:idUser2},{id_user1:idUser2,id_user2:idUser1}]},function(err,result){
		if(result == null){
			var dialogNew = new Dialog({
				id_user1: idUser2,
				id_user2: idUser1,
			});
			dialogNew.save(function(err ,e ) {
				if (err) throw err;
				User.update({_id:idUser1},{$push:{dialogs:{idDialog:e._id}}},function(err){
				});
				User.update({_id:idUser2},{$push:{dialogs:{idDialog:e._id}}},function(err){
				});
			});
		}
	});
	res.send("hi");

});
app.post("/addposts", function(req,res){
	var postData = req.body;

	tokenObj = tokenVerify(req.cookies.token);

		var postnew = new Post({

			user_id_who:tokenObj._id,
			user_id:tokenObj.q,
			text: postData.text,
			picture:postData.picture,
			likes:0,
			date:new Date().toJSON().slice(0,10)
		});
		postnew.save(function(err) {
	  		if (err) throw err;
		});
Post.find({},function(err,docs){
		console.log("stra" + docs+ "finish")
})

	 res.send("done");
});
app.post("/likePost", function(req, res){
	var tokenObj = tokenVerify(req.cookies.token);
	var postData = req.body;
	Post.findOne({'wholiked.idUser':tokenObj._id},function(err,currentPost){
		if(currentPost != null){

		var likes = currentPost.likes -1;

		Post.update({"_id":postData.id},{$set:{likes:likes}},function(err){
			if(err){console.log(err);}
		});
			Post.update({"_id":postData.id},{$pull:{wholiked:{idUser:tokenObj._id}}},function(err){
				if(err) throw err;
		});
		}else{
			Post.findOne({"_id":postData.id},function(err,currentPost){
				var likes = currentPost.likes +1;

				Post.update({"_id":postData.id},{$set:{likes:likes}},function(err){
					if(err){console.log(err);}
				});
				Post.update({"_id":postData.id},{$push:{wholiked:{idUser:tokenObj._id}}},function(err){
					if(err) throw err;
				})
			})
		}
	});
})
app.post('/tags', function(req,res){
	var obj = req.body;
	var tokenObj = tokenVerify(req.cookies.token);
	switch(obj.oparation){
		case "owntags":
		var tag = 
		User.update({"_id":tokenObj._id},{$push:{owntags:{owntag:obj.tag}}},function(err){
			if(err) throw err;
		});
		break;
		case "deleteOwntags":
		var tag = 
		User.update({"_id":tokenObj._id},{$pull:{owntags:{owntag:obj.tag}}},function(err){
			if(err) throw err;
		});
		break;
		case "tag":
		User.update({"_id":tokenObj._id},{$set:{tag:obj.tag}},function(err){
			if(err) throw err;
		});
		break;
	}
	recomendation();
	function recomendation(){
		User.findOne({"_id":tokenObj._id},function(err, docs){
			if(err) throw err;
			var tag = docs.tag;

			User.find({'owntags.owntag':tag}).sort({'follow':1}).limit(5).exec(function(err, us){
				console.log("strat" + us +" kznm");
			});
		});
	}
		// User.findOne({_id:tokenObj._id},function(err, docs){
		// 	console.log(docs);
		// })
});
app.post('/follow',function(req, res){
	var userId = req.body.userId;
	var tokenObj = tokenVerify(req.cookies.token);
	User.findOne({'follow.idUser':userId, _id:tokenObj._id}, function(err, docs){
		if(docs == null){
			User.update({_id:tokenObj._id},{$push:{follow:{idUser:userId}}},function(err){
				if(err) throw err;
				console.log("fine");
				User.findOne({_id:tokenObj._id},function(err, docs){
					console.log(docs);
					following();
				})
			});
			User.update({_id:userId},{$push:{follower:{idFollower:tokenObj._id}}},function(err){
				if(err) throw err;
				console.log("fine");
			});

		} else {
			User.update({_id:tokenObj._id},{$pull:{follow:{idUser:userId}}},function(err){
				if(err) throw err;
				console.log("fine");
				User.findOne({_id:tokenObj._id},function(err, docs){
					console.log(docs);
					following();
				})
			});
			User.update({_id:userId},{$pull:{follower:{idFollower:tokenObj._id}}},function(err){
				if(err) throw err;
				console.log("fine");
			});
		}

	});
	function following(){
		User.findOne({_id:tokenObj},function(err, docs){
			console.log(docs.follow);
		});
		User.findOne({'follow.idUser':userId, _id:tokenObj._id}, function(err, docs){
			if(docs){
				console.log(true);
			}
		});
	}
});
app.post('/searchUser', function(req, res){
	var user = req.body.user;

	User.find(
    { "username": { "$regex": user, "$options": "i" } }, function(err,docs) { 
    	console.log(docs);
    	renderUser(docs);
    } 
);
    function renderUser(docs){
    	res.send(docs);
    }
	
})
app.post('/comment',function(req, res){
	var obj = req.body;
	if(req.cookies.token){
		tokenObj = tokenVerify(req.cookies.token);
		if(obj.option == "add"){

			var commentnew = new Comments({
				id_post:obj.id,
				user_id_comments:tokenObj._id,
				textComment:obj.text,
				likes:0,
				user_id_who_comment:tokenObj.q,
				dataC:new Date().toJSON().slice(0,10)
			});

			commentnew.save(function(err,e) {
			  		if (err) throw err;
			  		console.log(e._id);
					Post.update({ "_id":obj.id},{$push:{"comments":{"commentsId":e._id}}},function(err){
						if(err){console.log(err);}
						Post.findOne({},function(err, post){
							console.log(post.comments);
						});
					});
			});


		}else if(obj.option == "delete"){
			Comments.find({},function(err,p){
				console.log(p);
			Comments.findOneAndRemove({_id: obj.idC}, function(err){
				if(err) throw err;
				
			});
			Post.update({ "_id":obj.idP},{$pull:{"comments":{"commentsId":obj.idC}}},function(err){
				if(err){console.log(err);}
				Post.findOne({},function(err, post){
					console.log(post.comments);
				});
			});
			})
		}else if(obj.option =="like"){
			Comments.findOne({'wholiked.idUser':tokenObj._id},function(err,comment){
				if(comment != null){
				console.log(comment);

				var likes = comment.likes -1;

				Comments.update({"_id":obj.idC},{$set:{likes:likes}},function(err){
					if(err){console.log(err);}
				});
					Comments.update({"_id":obj.idC},{$pull:{wholiked:{idUser:tokenObj._id}}},function(err){
						if(err) throw err;
				});
				}else{
					Comments.findOne({"_id":obj.idC},function(err,comment){
						var likes = comment.likes +1;

						Comments.update({"_id":obj.idC},{$set:{likes:likes}},function(err){
							if(err){console.log(err);}
						});
						Comments.update({"_id":obj.idC},{$push:{wholiked:{idUser:tokenObj._id}}},function(err){
							if(err) throw err;
						})
					})
				}


			});
		}
	}
	Comments.find({},function(err,comment){
		console.log(comment);
		res.send("1");
	});
});
// app.get('/posts',function(req,res){

// 	req.method = "post";
// 	Post.find({}, function(err, posts) {
// 		if (err) throw err;
// 		render(posts);
// 	});
// 	function render(posts){
// 		res.render('postpage.ejs',{a:posts});
// 	}
// });
app.post('/deletePost',function(req, res){
	var id = req.body.id;

	tokenObj = tokenVerify(req.cookies.token);
	Post.remove({_id:id,user_id_who:tokenObj._id},function(err){
		if(err) throw err;
	Comments.remove({id_post:id},function(err){
		if(err) throw err;
		res.send("yes delete");
	});
	})
})
app.post('/loadDialogs',function(req, res){
	var token = req.cookies.token;
	var tokenObj = tokenVerify(token);
	var dialogsList = [];
	var j = 0;
	User.findOne({_id:tokenObj._id},function(err,userDialogs){
		// console.log(userDialogs.dialogs[0].idDialog + userDialogs.username);
		userDialogs.dialogs.forEach(function(ell){
		Dialog.findOne({_id:ell.idDialog},function(err,wer){
			 if(wer.msg.length > 0){
				if(wer.id_user1 ==tokenObj._id){
					User.findOne({_id:wer.id_user2},function(err, result) {
						dialogsList.push({id:wer._id, user:result.username,mess:wer.msg[wer.msg.length-1].text, img:result.pathAvatar});
						j++;
						console.log(j + " " +userDialogs.dialogs.length);
						if(j == userDialogs.dialogs.length){
							res.send(dialogsList);
						}
					})
				}else{
				 	User.findOne({_id:wer.id_user1},function(err, result) {
						dialogsList.push({id:wer._id, user:result.username, mess:wer.msg[wer.msg.length-1].text, img:result.pathAvatar});
						j++;
						console.log(j + " " +userDialogs.dialogs.length);
						if(j == userDialogs.dialogs.length){
							res.send(dialogsList);
						}
					})
				 }
				//dialogsList.push(wer);
					
			}
			
		});

		});
	});
});
app.get('/setting', function(req, res){
	var obj = req.body;
	var token = req.cookies.token;
	var tokenObj = tokenVerify(token);
		if(tokenObj ==null){
			res.send("<h1>403</h1");
		}
	User.findOne({_id:tokenObj},function(err, user){
	res.render("setting.ejs", {user:user});
		
	})
})
app.post('/setting', function(req, res){
	var obj = req.body;
	var token = req.cookies.token;
	var tokenObj = tokenVerify(token);
	for(key in obj){
		User.update({_id:tokenObj._id},{$set:{[key]:obj[key]}},function (err) {
			if(err) throw err;
		});
	}
	 // User.findOne({_id:tokenObj._id},function (err, doc) {
	 // 	console.log(doc);
	 // })
	
});

http.listen(3000, function() {
    console.log("Server is working on http://localhost:3000/");
});


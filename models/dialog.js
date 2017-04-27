var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var dialogSchema = new Schema({
  id_user1:String,
  id_user2:String,
  date:{ type: Date, default: Date.now },
  msg:[
  {
    author:String,
  	name:String,
  	text:String,
  	datem:{ type: Date, default: Date.now }
  }
  ]
});


var Dialog = mongoose.model('Dialog', dialogSchema);

module.exports = Dialog;

// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;


// var commentsSchema = new Schema({
//   text: String,
//   likes:Number,
//   post_id:String
//   id :String,
//   data:{ type: Date, default: Date.now }
// });


// var Comment = mongoose.model('Comment', commentsSchema);

// module.exports = Comment;
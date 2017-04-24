var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
	user_id_who:String,
	user_id:String,
	post:[
		{
			text: String,
			picture:String,
			likes:Number,
			data:{ type: Date, default: Date.now },
			comments:[{
				user_id_comments:String,
				textComment:String,
				likes:Number,
				dataC:{ type: Date, default: Date.now }
			}]
		}
	]
});

var Post = mongoose.model('Post', postSchema);

module.exports = Post;
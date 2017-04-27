var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var userSchema = new Schema({
  email: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  admin: Boolean,
  location: String,
  owntags:[
    {owntag:String}
  ],
  tag:String,
  dialogs:[
    { idDialog:String}
  ],
  follower:[
    { idFollower:String}
  ],
  follow:[
    { idUser:String}
  ],

  meta: {
    age: Number,
    website: String
  },
  created_at: Date,
  updated_at: Date
});


var User = mongoose.model('User', userSchema);

module.exports = User;
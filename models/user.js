const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    email : {
        type: String,
        required : true,
        unique : true // this is not considered as a validator
    }
})

UserSchema.plugin(passportLocalMongoose) // this plugin will add on to our schema a username, password field, totally unique.
//passport-local-mongoose ia one plugin


module.exports = mongoose.model('User', UserSchema)

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }
})

// Use email as the username field for authentication
UserSchema.plugin(passportLocalMongoose, { usernameField: 'email', usernameLowerCase: true });

module.exports = mongoose.model('User', UserSchema)
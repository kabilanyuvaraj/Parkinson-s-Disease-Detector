const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: String,
    email:String,
    password:String
})

const UserModel = mongoose.model("register",UserSchema)
module.exports = UserModel;
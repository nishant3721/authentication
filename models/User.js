const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  avatarImage: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true })

const User = mongoose.model('user', userSchema)
User.createIndexes()
module.exports = User

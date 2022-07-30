const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const connectToMongo = () => {
  mongoose.connect(process.env.DB_URI, () => {
    console.log('Mongo connected successfully')
  })
}

module.exports = connectToMongo

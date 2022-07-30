const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const JWT_SECRET = process.env.JWT_KEY

const fetchUser = (req, res, next) => {
  // Get the user from the JWT token and the add the userId to the req object
  try {
    const token = req.header('token')
    if (!token) {
      throw new Error('No user')
    }
    const data = jwt.verify(token, JWT_SECRET)
    req.user = data.user
    next()
  } catch (error) {
    res.status(401).send({
      error: 'Please login'
    })
  }

}

module.exports = fetchUser

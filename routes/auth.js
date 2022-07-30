const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const fetchUser = require('../middleware/fetchUser')
var jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()


// ROUTE 1 : - Create a user using: POST "/api/auth/createuser"  -> No login required
const JWT_SECRET = process.env.JWT_KEY

router.post(
  '/createuser',
  [
    body('name', 'Invalid Name').isLength({ min: 3 }),
    body('email', 'Invalid Email').isEmail(),
    body('password', 'Invalid Password').isLength({ min: 5 })
  ],
  async (req, res) => {
    let success = false
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // Check whether the same email exists already
    try {
      let user = await User.findOne({ email: req.body.email })
      if (user) {
        return res
          .status(400)
          .json({ error: 'sorry, a user with this email already exists' })
      }

      // Creating a user
      const salt = await bcrypt.genSalt(10)
      const securedPassword = await bcrypt.hash(req.body.password, salt)
      user = await User.create({
        avatarImage: req.body.avatarImage,
        name: req.body.name,
        email: req.body.email,
        password: securedPassword
      })

      const data = {
        user: { id: user.id }
      }
      const authToken = jwt.sign(data, JWT_SECRET)
      success = true
      res.json({ success, authToken })
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Something went wrong')
    }
  }
)

// ROUTE 2 : - Login a user using: POST "/api/auth/login"  -> No login required
router.post(
  '/login',
  [
    body('email', 'Invalid Email').isEmail(),
    body('password', 'Invalid Password').isLength({ min: 5 })
  ],
  async (req, res) => {
    let success = false
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      // Check the user with the email already exists or not
      let user = await User.findOne({ email: req.body.email })
      if (!user) {
        return res
          .status(400)
          .json({ error: 'Please try to login with correct credentials' })
      }
      // verify the password is correct or not
      const passwordCompare = await bcrypt.compare(
        req.body.password,
        user.password
      )
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: 'Please try to login with correct credentials' })
      }

      const data = {
        user: { id: user.id }
      }
      const authToken = jwt.sign(data, JWT_SECRET)
      success = true
      res.json({ success, authToken })
    } catch (error) {
      console.error(error.message)
      res.status(500).send('Something went wrong')
    }
  }
)

// ROUTE 3 : -  Get LoggedIn user details using: POST "/api/auth/getuser" -> login required
router.get('/getuser', fetchUser, async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).select('-password')
    res.json(user)
  } catch (error) {
    console.error(error.message)
    res.status(400).send('Something went wrong')
  }
})

// ROUTE 4 : -  Get LoggedIn user details using: POST "/api/auth/getuser" -> login required
router.post('/updateuser', fetchUser, async (req, res) => {
  try {
    const newUser = {}
    if (req.body.avatarImage) {
      newUser.avatarImage = req.body.avatarImage
    }

    if (req.body.name) {
      newUser.name = req.body.name
    }

    if (req.body.email) {
      newUser.email = req.body.email
    }

    let securedPassword, salt
    salt = await bcrypt.genSalt(10)
    if (req.body.password) {
      securedPassword = await bcrypt.hash(req.body.password, salt)
      newUser.password = req.body.securedPassword
    }
    let user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).send('Not found')
    }
    // Find the note and update the play image
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: newUser },
      { new: true }
    )

    res.json(user)
  } catch (error) {
    console.error(error.message)
    res.status(400).send('Something went wrong')
  }
})

// ROUTE 5 : -  List all the users : GET "/api/lsitusers" -> No login required
router.get('/listusers', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    console.error(error.message)
    res.status(400).send('Something went wrong')
  }
})

module.exports = router

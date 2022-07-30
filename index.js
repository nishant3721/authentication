const express = require('express')
const cors = require('cors')

const connectToMongo = require('./db.js')
connectToMongo()

const app = express()
const port = process.env.PORT || 8080

/* Allowing cross-origin requests. */
app.use(cors())
/* A middleware that parses the body of the request and makes it available on the request object. */
app.use(express.json())
app.use('/api/auth', require('./routes/auth'))
app.get('/', (req, res) => {
    res.json({ version: "V1", status: "healthy" })
})

app.listen(port, () => {
    console.log(
        `wristband playmaker's backend listening at http://localhost:${port}`
    )
})

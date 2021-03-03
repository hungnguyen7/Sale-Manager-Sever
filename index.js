require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL)

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
const apiRoute = require('./routes/api.route')

app.use('/api', apiRoute)
app.listen(process.env.PORT, ()=>console.log(`Server start on port ${process.env.PORT}`))

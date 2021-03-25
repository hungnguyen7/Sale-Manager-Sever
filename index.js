require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true
})

const cors = require('cors')
const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
const apiRoute = require('./routes/api.route')

app.use('/api', apiRoute)
app.listen(process.env.PORT, ()=>console.log(`Server start on port ${process.env.PORT}`))

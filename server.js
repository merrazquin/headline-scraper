const express = require('express'),
    bodyParser = require('body-parser'),
    exphbs = require('express-handlebars'),
    mongoose = require('mongoose'),
    routes = require('./controllers/controller.js'),
    PORT = process.env.PORT || 3000,
    app = express(),
    // If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
    MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines"

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Serve static content for the app from the 'public' directory in the application directory.
app.use(express.static('public'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

// use handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

// use controller for routing
app.use(routes)


let db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))

db.once('open', () => {
    // database connection established, start server
    app.listen(PORT, function () {
        console.log('App now listening at localhost:' + PORT)
    })
})

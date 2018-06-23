require('dotenv').config()

const express = require('express'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    flash = require('connect-flash'),
    cookieSession = require('cookie-session'),
    exphbs = require('express-handlebars'),
    mongoose = require('mongoose'),
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

// auth middleware
app.use(flash())
// cookie session setup
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.SESSION_KEY]
}))
app.use(passport.initialize())
app.use(passport.session())

// use handlebars
app.engine('handlebars', exphbs({
    defaultLayout: 'main', helpers: {
        deleteEnabled: function (commentUser, guestUser, user, options) {
            return (commentUser._id.toString() === guestUser._id.toString() || commentUser._id.toString() === (user ? user._id.toString() : null)) ? options.fn(this) : options.inverse(this)
        },
        plural: function(number, single, plural) {
            return number === 1 ? single : plural
        }
    }
}))
app.set('view engine', 'handlebars')

// use controllers for routing
require('./controllers')(app)

let db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))

db.once('open', () => {
    // database connection established, start server
    app.listen(PORT, function () {
        console.log('App now listening at localhost:' + PORT)
    })
})

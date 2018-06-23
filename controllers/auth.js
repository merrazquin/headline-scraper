const passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    db = require('../models')


// Setup passport
passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser((id, done) => db.User.findById(id, (err, user) => done(err, user)))
passport.use(new FacebookStrategy(
    {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    }, (accessToken, refreshToken, profile, done) => {
        db.User.findOrCreate({ facebookId: profile.id }, { username: profile.displayName }, (err, user) => {
            if (err) return done(err)
            done(null, user)
        })
    }
))

module.exports = function (router) {
    router.get('/auth/facebook', passport.authenticate('facebook'))
    router.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/', failureFlash: true }))

    router.get('/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

}
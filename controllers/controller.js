
const express = require('express'),
    cheerio = require('cheerio'),
    request = require('request'),
    BASE_URL = 'https://xkcd.com',
    db = require('../models'),
    MAX = 100



// find guest object

module.exports = function (router) {
    let totalResults = 0,
        guest
        
    db.User.guest((err, guestObj) => guest = guestObj)

    function findAll(res, user) {
        db.Headline.find({}, null, { sort: '_id' }).populate('comments.user').exec((err, headlines) => {
            if (err) {
                return res.render('error', { error: err })
            }
            res.render('index', { user: user, guestUser: guest, base: BASE_URL, headlines: headlines })
        })
    }

    router.get('/', (req, res) => {
        // pull HTML 
        request(BASE_URL + '/archive/', (err, response, html) => {
            if (err) {
                return res.render('error', { error: err.toString() })
            }

            let $ = cheerio.load(html),
                results = []

            db.Headline.findOne({ URL: $('#middleContainer a')[0].attribs.href }, (err, headline) => {
                if (err) {
                    return res.render('error', { error: err })
                }

                if (!headline) {
                    // new data, perform full scrape
                    totalResults = Math.min(MAX, $('#middleContainer a').length)

                    $('#middleContainer a').each((i, element) => {
                        if (i > MAX) {
                            return
                        }

                        let title = $(element).text(),
                            URL = $(element).attr('href'),
                            imgURL = '',
                            imgCaption = ''

                        db.Headline.findOne({ URL: URL }, (err, article) => {
                            if (article) {
                                // don't create a new one if it already exists
                                totalResults--

                                if (!totalResults) {
                                    return findAll(res, req.user)
                                }
                            } else {
                                // otherwise, pull the image URL, and create a new one
                                request(BASE_URL + URL, (err, response, html) => {
                                    if (err) {
                                        return res.render('error', { error: err.toString() })
                                    }

                                    let $ = cheerio.load(html)

                                    if ($('#comic img').length) {
                                        imgURL = 'https:' + $('#comic img')[0].attribs.src
                                        imgCaption = $('#comic img')[0].attribs.title
                                    }

                                    db.Headline.create({ URL: URL, title: title, imgURL: imgURL, imgCaption: imgCaption }, (error, result) => {
                                        if (error) {
                                            return console.error(error)
                                        }
                                        totalResults--
                                        // if all results have been pushed, we can send them to the client
                                        if (!totalResults) {
                                            findAll(res, req.user)
                                        }
                                    })
                                })
                            }
                        })

                    })
                } else {
                    // no new data, pull existing items from DB
                    findAll(res, req.user)
                }
            })
        })
    })

    router.post('/comment', (req, res) => {
        db.Headline.findById(req.body.articleID, (err, article) => {
            article.addComment(req.body.comment, req.user ? req.user._id : guest._id, (err, newComment) => {
                req.app.render('partials/comment', { _id: newComment._id, commentUser: newComment.user, comment: newComment.comment, guestUser: guest, user: req.user, layout: false }, (err, html) => {
                    res.json({ articleID: req.body.articleID, html: html })
                })
            })
        })
    })

    router.delete('/comment/:id', (req, res) => {
        db.Headline.removeComment(req.params.id, (err, data) => {
            res.json(req.params.id)
        })
    })


}
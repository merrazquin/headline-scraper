const express = require('express'),
    cheerio = require('cheerio'),
    request = require('request'),
    router = express.Router(),
    mongoose = require('mongoose'),
    BASE_URL = 'https://xkcd.com',
    Headline = require('../models/Headline'),
    MAX = 100


router.get('/', (req, res) => {

    // pull HTML 
    request(BASE_URL + '/archive/', (err, response, html) => {
        if (err) {
            return res.render('error', { error: err.toString() })
        }

        let $ = cheerio.load(html),
            results = []

        Headline.findOne({ URL: $('#middleContainer a')[0].attribs.href }, (err, headline) => {
            if (err) {
                return res.render('error', { error: err })
            }

            if (!headline) {
                // new data, perform full scrape
                $('#middleContainer a').each((i, element) => {
                    if (i > MAX) {
                        return
                    }

                    let title = $(element).text(),
                        URL = $(element).attr('href'),
                        imgURL = ''

                    request(BASE_URL + URL, (err, response, html) => {
                        if (err) {
                            return res.render('error', { error: err.toString() })
                        }

                        let $ = cheerio.load(html)

                        if ($('#comic img').length) {
                            imgURL = 'https:' + $('#comic img')[0].attribs.src
                        }

                        Headline.findOneAndUpdate(
                            { URL: URL }, // URL should be unique, so search by that
                            { $set: { title: title, imgURL: imgURL } }, // update the title if necessary
                            { upsert: true, new: true, setDefaultsOnInsert: true }, // upsert - insert or update depending on existence
                            (error, result) => {
                                if (error) {
                                    return console.error(error)
                                }
                            })
                    })

                    results.push({ title: title, URL: URL })
                })
                res.render('index', { base: BASE_URL, headlines: results })
            } else {
                // no new data, pull existing items from DB
                Headline.find({}, null, { sort: '_id' }, (err, headlines) => {
                    if (err) {
                        return res.render('error', { error: err })
                    }

                    res.render('index', { base: BASE_URL, headlines: headlines })
                })
            }
        })
    })
})

router.post('/comment', (req, res) => {
    Headline.findById(req.body.articleID, (err, article) => {
        article.addComment(req.body.comment, (err, newComment) => {
            req.app.render('partials/comment', { _id: newComment._id, comment: newComment.comment, layout: false }, (err, html) => {
                res.json({ articleID: req.body.articleID, html: html })
            })
        })
    })
})

router.delete('/comment/:id', (req, res) => {
    Headline.removeComment(req.params.id, (err, data) => {
        res.json(req.params.id)
    })
})

// Export routes for server.js to use.
module.exports = router

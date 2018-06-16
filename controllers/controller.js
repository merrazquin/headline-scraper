const express = require('express'),
    cheerio = require('cheerio'),
    request = require('request'),
    router = express.Router(),
    mongoose = require('mongoose'),
    BASE_URL = 'https://xkcd.com',
    Headline = mongoose.model('Headline', mongoose.Schema({
        title: String,
        link: String,
        imgURL: String
    }))


router.get('/', (req, res) => {

    // pull HTML 
    request(BASE_URL + '/archive/', (err, response, html) => {
        if (err) {
            return res.render('error', { error: err.toString() })
        }

        let $ = cheerio.load(html),
            results = []

        Headline.findOne({ link: $('#middleContainer a')[0].attribs.href }, (err, headline) => {
            if (err) {
                return res.render('error', { error: err })
            }

            if (!headline) {
                // new data, perform full scrape
                $('#middleContainer a').each((i, element) => {
                    let title = $(element).text(),
                        link = $(element).attr('href')

                    Headline.findOneAndUpdate(
                        { link: link }, // link should be unique, so search by that
                        { $set: { title: title } }, // update the title if necessary
                        { upsert: true, new: true, setDefaultsOnInsert: true }, // upsert - insert or update depending on existence
                        (error, result) => {
                            if (error) {
                                return console.error(error)
                            }
                        })

                    results.push({ title: title, link: link })
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

// Export routes for server.js to use.
module.exports = router

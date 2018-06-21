const
    BASE_URL = 'https://xkcd.com',
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    commentSchema = new Schema({
        comment: {
            type: String,
            trim: true,
            required: 'Comment is required'
        }, 
        userId: {
            type: String,
            trim: true
        }
    }),
    headlineSchema = new Schema({
        title: {
            type: String,
            trim: true,
            required: 'Title is required'
        },

        URL: {
            type: String,
            trim: true,
            require: 'URL is required'
        },

        imgURL: {
            type: String,
            trim: true
        },

        imgCaption: {
            type: String
        },

        comments: {
            type: [commentSchema]
        }
    })

headlineSchema.methods.addComment = function (comment, userId, cb) {
    let commentObj = this.comments.create({ comment: comment, userId: userId })
    this.comments.push(commentObj)

    return this.save((err, result) => {
        cb(err, commentObj)
    })
}

headlineSchema.statics.removeComment = function (commentId, cb) {
    this.findOne({ 'comments._id': commentId }, (err, result) => {
        if(result){
            result.comments.pull(commentId)
            result.save(cb)
        }
        else cb()
    })
}

headlineSchema.methods.fullURL = () => {
    return BASE_URL + this.URL
}

const Headline = mongoose.model('Headline', headlineSchema)

module.exports = Headline
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
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
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
    let commentObj = this.comments.create({ comment: comment, user: userId })
    let newLen = this.comments.push(commentObj)

    return this.save((err, result) => {
        this.populate(`comments.${newLen - 1}.user`, (err, popped) => {
            cb(err, popped.comments[newLen - 1])
        })
    })
}

headlineSchema.statics.removeComment = function (commentId, cb) {
    this.findOne({ 'comments._id': commentId }, (err, result) => {
        if (result) {
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
const
    mongoose = require('mongoose'),
    findOrCreate = require('mongoose-findorcreate'),
    Schema = mongoose.Schema,
    userSchema = new Schema({
        facebookId: {
            type: String,
            trim: true,
            required: 'Facebook Id is required'
        },

        username: {
            type: String,
            trim: true,
            required: 'Username is required'
        }
    })

userSchema.plugin(findOrCreate)
userSchema.statics.guest = function guest(cb) {
    this.findOne({ username: 'Guest', facebookId: 'fbid' }).exec(cb)
}
const User = mongoose.model('User', userSchema)

// create guest user if it doesn't exist
User.findOrCreate({ username: 'Guest', facebookId: 'fbid' })


module.exports = User

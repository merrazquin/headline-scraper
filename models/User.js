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
            required: 'Display name is required'
        }
    })

userSchema.plugin(findOrCreate)
const User = mongoose.model('User', userSchema)

module.exports = User

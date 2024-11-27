const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    postcontent: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    date: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('post', postSchema)
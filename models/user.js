const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://sahil_hirani:FgEZbXEj7k9Xr0Ez@firstcluster.iqc2esz.mongodb.net/Tweet')

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    age: Number,
    profile: {
        type: String,
        default: 'default.png'
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]
})

module.exports = mongoose.model('user', userSchema)
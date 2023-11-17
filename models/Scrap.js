const mongoose = require('mongoose')

const Scrap = mongoose.model('Scrap', {
    from: String,
    message: String, 
    to: String
})

module.exports = Scrap
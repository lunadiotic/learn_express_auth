const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
})

userSchema.statics.findByCredentials = async function (username, password) {
    const user = await this.findOne({ username })
    const isMatch = await bcrypt.compare(password, user.password)
    return isMatch ? user : false
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

module.exports = mongoose.model('User', userSchema)
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const session = require('express-session')
const User = require('./models/user')

mongoose.connect('mongodb://127.0.0.1/auth_demo')
    .then((result) => {
        console.log('connected to mongodb')
    }).catch((err) => {
        console.log(err)
    });

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.urlencoded({
    extended: true
}))
app.use(session({
    secret: 'notasecreet',
    resave: false,
    saveUninitialized: false
}))

const auth = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next()
}

app.get('/', (req, res) => {
    res.send('Homepage')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body
    const user = new User({ username, password })
    await user.save()
    req.session.user_id = user._id
    res.redirect('/')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    const user = await User.findByCredentials(username, password)
    if (user) {
        req.session.user_id = user._id
        res.redirect('/admin')
    } else {
        res.redirect('/login')
    }
})

app.post('/logout', auth, (req, res) => {
    // req.session.user_id = null
    req.session.destroy(() => {
        res.redirect('/login')
    })
})

app.get('/admin', auth, (req, res) => {
    res.render('admin')
})

app.get('/profile/settings', auth, (req, res) => {
    res.send('Profile Settings: ' + req.session.user_id)
})

app.listen(3000, () => {
    console.log('app listening on port http://localhost:3000!')
})
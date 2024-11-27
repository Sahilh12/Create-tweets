const express = require('express')
const app = express()
const path = require('path')
const userModel = require('./models/user')
const postModel = require('./models/post')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

// app.use(express.static(__dirname, 'public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(cookieParser())
app.set('view engine', 'ejs')

const upload = require('./config/multer')

app.get('/login', (req, res) => {
    res.render('login')
})
app.get('/', (req, res) => {
    res.render('create')
})
app.get('/profile/upload', (req, res) => {
    res.render('upload')
})
app.post('/upload', isLoggedin, upload.single('image'), async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email })
    user.profile = req.file.filename
    await user.save()
    console.log(req.file);
    res.redirect('/profile')
})

app.get('/logout', (req, res) => {
    res.cookie('token', '')
    res.redirect('/login')
})

app.post('/register', async (req, res) => {
    let { username, name, email, password, age, profile } = req.body

    let user = await userModel.findOne({ email })
    if (user) {
        return res.send('email already exist...!')
    }

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            const user = await userModel.create({
                username,
                name,
                email,
                password: hash,
                age,
                profile
            })
            let token = jwt.sign({ email, password }, 'this is secret key')
            res.cookie('token', token)
            res.render('login', { user })
        })
    })
})

app.post('/login', async (req, res) => {
    let { username, name, email, password, age, id } = req.body

    let user = await userModel.findOne({ email })
    if (!user) {
        return res.render('error')
    }

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ email, password, id }, 'this is secret key')
            res.cookie('token', token)
            res.redirect('/profile')
        } else {
            res.render('error')
        }
    })
})

app.get('/profile', isLoggedin, async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate('posts')
        // console.log(user);
        res.render('profile', { user })
    } catch (error) {
        console.log('error in profile route');
    }
})

app.post('/post', isLoggedin, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email })
    let { postcontent } = req.body
    if (postcontent === '') return res.redirect('/profile')
    let post = await postModel.create({
        postcontent,
        user: user._id
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect('/profile')
})

app.get('/like/:postid', isLoggedin, async (req, res) => {
    let post = await postModel.findById(req.params.postid)

    post.likes.push(req.user.id)
    await post.save()
    res.redirect('/profile')
})

app.get('/edit/:postid', isLoggedin, async (req, res) => {
    let post = await postModel.findById(req.params.postid)
    res.render('edit', { post })
})
app.post('/update/:postid', isLoggedin, async (req, res) => {
    let post = await postModel.findOneAndUpdate({ _id: req.params.postid }, { postcontent: req.body.content })
    res.redirect('/profile')
})

app.get('/delete/:postId', isLoggedin, async (req, res) => {
    let post = await postModel.findOneAndDelete({ _id: req.params.postId })
    console.log(post);
    res.redirect('/profile')
})
app.get('/cancle', isLoggedin, async (req, res) => {
    res.redirect('/profile')
})

function isLoggedin(req, res, next) {
    if (req.cookies.token === '') res.redirect('/login')
    else {
        let data = jwt.verify(req.cookies.token, 'this is secret key')
        req.user = data;
    }
    next()
}

app.listen(3000, () => { console.log('server connected') })
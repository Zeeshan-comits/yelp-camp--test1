if ( process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

console.log(process.env.SECRET)

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/expresserror')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStratergy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

const usersRoutes = require('./routes/users')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
const MongoDBStore = require("connect-mongo")(session)
const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp'

//dbUrl
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true, // the mongoose package is updated to version 6. So this line is not required anymore..
    useUnifiedTopology: true,
    // useFindAndModify : false
});

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})
const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true })) // this will parse the (request.body)
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public'))) // this will tell express to serve the public directory.
app.use(mongoSanitize({
    replaceWith: '_',
}))

const store = new MongoDBStore({
    url: dbUrl,
    secret: 'thisshouldbeabettersecret!',
    touchAfter: 24 * 60 * 60  // This is Lazy session update, after this much time session will be updated (refer docs - npmjs, connect-mongo )
})

 store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
 })

const sessionConfig = {
    store, // this meanns store : store
    name : 'dynamite',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // the cookies that are set through the session are only accessible over http they are not accessible through JS
        // secure : true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet({ contentSecurityPolicy: false}))

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcl1fhkcw/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize()) // for its meaning, check documentation or check the githut link from course i.e bookmarked.
app.use(passport.session()) // for its meaning, check documentation or check the githut link from course i.e bookmarked.
passport.use(new LocalStratergy(User.authenticate())) // authenticate is a static method which is added automatically.

passport.serializeUser(User.serializeUser()) // 'serialize' here means how do we store data in the session.
passport.deserializeUser(User.deserializeUser()) //'deserialize' means how do we get user out of the session.

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    next()
}

app.use((req, res, next) => {
    console.log(req.query)
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success') // This is a middlware. All routes will have access to it automatically to display the flash message whatever is in the key 'success'.
    res.locals.error = req.flash('error')
    next()
})

app.get('/fakeuser', async (req, res) => {
const user = new User({ email : 'name@gmail.com', username: 'colttt'})
const newUser = await User.register(user, 'chicken') // to register any user, we need to call this 'register()'
res.send(newUser)
})

app.use('/', usersRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/', (req, res) => {
    res.render('home')
})

// app.get('/campgrounds/new', (req, res) => { // this route will not work on calling because the '/new' keyword will be teated as an id of the above route, so we have to place this route above the '/campgrounds/:id' path  route
//     res.render('campgrounds/new')
// })


app.all('*', (req, res, next) => { // app.all is for every single request and '*' is for all the path
    next(new ExpressError('page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Oh No something went wrong'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})

const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password) // the register method will add the register logic behind the scene and also save it in DB.
        req.login(registeredUser, err => { // This 'req.login' is a passport feature which will login the user after registering. This function needs a callback.
            if (err) return next(err)
            req.flash('success', `Welcome to yelp-camp ${username}`)
            res.redirect('/campgrounds')
        })

    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => { // In this code, you can change failureFlash: true (which shows an automatic error message) to failureFlash: "Custom error message" (you can specify your custom error message string between the quotes)
    req.flash('success', 'Welcomeback to campground')
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        req.flash('success', 'Goodbye!!')
        res.redirect('/campgrounds')
    })
}
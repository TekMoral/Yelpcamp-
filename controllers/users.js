const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) {
                console.error("Login Error After Registration:", err);
                return next(err);
            }
            req.flash('success', 'Welcome to CampBliss!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        console.error(" Registration Error:", e);
        req.flash('error', e.message);
        res.redirect('/register');  
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res, next) => {

    if (!req.user) {
        console.error("Login Failed: User Not Found");
        req.flash("error", "Invalid username or password.");
        return res.redirect("/login");
    }

    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout Error:", err);
            return next(err);
        }
        req.flash('success', 'Goodbye! See you soon.');
        res.redirect('/');
    });
};

const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Enforce password policy on server (at least 8 chars and 1 uppercase)
        if (!/^(?=.*[A-Z]).{8,}$/.test(password || '')) {
            return res.status(400).render('users/register', {
                error: { password: 'Password must be at least 8 characters and include at least one uppercase letter.' },
                old: { email }
            });
        }
        const user = new User({ email });
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
        req.flash("error", "Invalid email or password.");
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

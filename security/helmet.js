const helmet = require('helmet');

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com/", // Added jQuery source
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com/", // Added this line for starability CSS

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

module.exports.helmetConfig = app => {
    app.use(helmet());
    app.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],  // Changed from empty array to 'self'
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", "blob:", ...scriptSrcUrls],
                scriptSrcElem: ["'self'", "'unsafe-inline'", "blob:", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", "blob:"],
                childSrc: ["blob:"],
                objectSrc: ["'none'"],
                imgSrc: [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/dfger19r7/", // Replace with your cloud name
                    "https://res.cloudinary.com/",
                    "https://images.unsplash.com/",
                ],
                //fontSrc: ["'self'", "data:", ...fontSrcUrls],
            },
        })
    );
};

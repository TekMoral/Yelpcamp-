const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelpcamp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 400; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      author: "679054329261023be8650cf6",
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies tincidunt, nunc nisl aliquet nunc, eget aliquam nunc nisl eu nunc. Sed euismod, nisl vel ultricies tincidunt, nunc nisl aliquet nunc, eget aliquam nunc nisl eu nunc.",
        price: Math.floor(Math.random() * 20) + 10, // Add a random price between 10-30
        geometry: {
          type: "Point",
          coordinates: [
            cities[random1000].longitude,
            cities[random1000].latitude,
          ]
        },

        images: [
          {
            url: 'https://res.cloudinary.com/dfger19r7/image/upload/v1734929776/samples/landscapes/nature-mountains.jpg',
            filename: 'YelpCamp/dvrq3ptegqnsfnq742jn',
          },
          {
            url: 'https://res.cloudinary.com/dfger19r7/image/upload/v1735279588/YelpCamp/ylhtrj9gkfvko4djcs3k.png',
            filename: 'YelpCamp/ylhtrj9gkfvko4djcs3k',
          },
          {
            url: 'https://res.cloudinary.com/dfger19r7/image/upload/v1735279589/YelpCamp/c9fpigxgdii1yfrnzte7.png',
            filename: 'YelpCamp/c9fpigxgdii1yfrnzte7',
          }
        ]
    })
    await camp.save();
  }
};


seedDB().then(() => {
  mongoose.connection.close();
});

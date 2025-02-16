require('dotenv').config();
const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");


const dbUrl = process.env.DB_URL;

// Make the connection async
const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Database connected for seeding");
  } catch (err) {
    console.log("Seeding connection error:");
    console.log(err);
    process.exit(1);
  }
};

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  try {
    await connectDB(); // Connect first
    await Campground.deleteMany({}); // Then perform operations
    
    for (let i = 0; i < 100; i++) {
      const random1000 = Math.floor(Math.random() * 1000);
      const camp = new Campground({
        author: "679054329261023be8650cf6",
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        price: Math.floor(Math.random() * 20) + 10,
        geometry: {
          type: "Point",
          coordinates: [
            cities[random1000].longitude,
            cities[random1000].latitude,
          ]
        },
        images: [
          {
            url: 'https://res.cloudinary.com/dfger19r7/image/upload/v1738818550/istockphoto-2161607196-612x612_fppoos.webp',
            filename: 'YelpCamp/istockphoto-2161607196-612x612',
          },
          {
            url: 'https://res.cloudinary.com/dfger19r7/image/upload/v1738818551/istockphoto-1652579362-2048x2048_xuqa9a.jpg',
            filename: 'YelpCamp/istockphoto-1652579362-2048x2048',
          },
          {
            url: 'https://res.cloudinary.com/dfger19r7/image/upload/v1738818550/istockphoto-1668284320-612x612_y1oree.webp',
            filename: 'YelpCamp/istockphoto-1668284320-612x612',
          },
        ]
      });
      await camp.save();
    }
    console.log("Database seeded!");
  } catch (err) {
    console.log("Seeding error:");
    console.log(err);
  } finally {
    await mongoose.connection.close();
  }
};

seedDB().then(() => {
  console.log("Seeding complete, connection closed");
});

require('dotenv').config();
const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const seedImages = require("./seedImages");

const dbUrl = process.env.DB_URL;

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

// Function to get 3 random images from the seedImages array
const getRandomImages = () => {
  let images = [...seedImages];
  let results = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * images.length);
    results.push(images[randomIndex]);
    // Remove the selected image to avoid duplicates
    images.splice(randomIndex, 1);
  }
  return results;
};

const seedDB = async () => {
  try {
    await connectDB();
    await Campground.deleteMany({});
    
    for (let i = 0; i < 75; i++) {
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
        images: getRandomImages()
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

const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')// the '.' before the model refers the path of the file 'campground',
//so here we will be unable to access the campground file, because it is in another folder and index.js is in 
// another folder. So we need to give two dots here so it can go one more directory behind here..

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true, // the mongoose package is updated to version 6. So this line is not required anymore..
    useUnifiedTopology: true
});

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}
//above function can also be written as(implicit return with the arrow functon)
//const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '645002a6b87c0a1a09a8c1e3',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            Description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quae ad cum quos quaerat pariatur nulla nesciunt delectus! Omnis delectus voluptatum nemo quo dicta dolores assumenda, doloremque, exercitationem consequuntur, perferendis sunt?',
            price,
            geometry : {
                type : "Point",
                coordinates : [
                    cities[random1000].longitude,
                    cities[random1000].latitude   // in GeoJSON format longitude comesfirst.
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dcl1fhkcw/image/upload/v1683145417/YelpCamp/c6txfaxwocwerlrfgaru.jpg',
                    filename: 'YelpCamp/c6txfaxwocwerlrfgaru',
                },
                {
                    url: 'https://res.cloudinary.com/dcl1fhkcw/image/upload/v1683145417/YelpCamp/hcmz5wyadefqsegpkdux.jpg',
                    filename: 'YelpCamp/hcmz5wyadefqsegpkdux',
                },
            ]
        })
        await camp.save()
    }
}
seedDB().then(() => {
    mongoose.connection.close()
})

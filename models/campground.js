const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {   // this is not saved in the database, this is the feature of virtual property.
    return this.url.replace('/upload', '/upload/w_200')
})

const CampgroundSchema = new Schema({
    title :String,
    images: [ImageSchema],
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    price: Number,
    Description:String,
    location: String,
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

CampgroundSchema.post('findOneAndDelete', async function (doc) { // it is a query middleware
   if(doc) {
    await Review.deleteMany({
        _id: {
            $in: doc.reviews
        }  //When you say _id: { $in: someArray}, mongoose will take each review document and take its id and check if that is in the someArray that is mentioned. If that id is found in that array, that document will be deleted. In our case someArray is the reviews array of our campground which will have id's only.
    })
   }
})

module.exports = mongoose.model('Campground', CampgroundSchema)
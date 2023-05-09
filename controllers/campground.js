const Campground = require('../models/campground')
const { cloudinary } = require("../cloudinary")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken }) // this contains two methods, forward and reverse goecode.

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query : req.body.campground.location,
        limit : 1
    }).send()
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id // the user who will be logged in at the time creating the campground, their id will be stored in the author property of campground, and their name will be displayed below location
    await campground.save()
    console.log(campground)
    req.flash('success', 'Successfully created new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate ({
        path : 'reviews', // this is populating all the reviews from the review array.
        populate : {
            path : 'author' // this will populate the author of the reviews in Review array.
        }
    }).populate('author')
    if (!campground) {
        req.flash('error', 'Cannot find campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    console.log(req.body)
       const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
       const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
       campground.images.push(...imgs)  // we are just taking data from the above array and passing it to push.
       await campground.save()
       if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
           await cloudinary.uploader.destroy(filename) // this will delete y=the images from cloudinary
        }
         await campground.updateOne({ $pull : { images: { filename: { $in: req.body.deleteImages }}}}) // this will delete the file names saveed in the mongodb.
         console.log(campground)
       }
       req.flash('success', "Successfully updated campground")
       res.redirect(`/campgrounds/${campground._id}`)
   }

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', "Successfully deleted campground")
    res.redirect(`/campgrounds`)
}
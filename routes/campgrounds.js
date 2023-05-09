const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const campground = require('../controllers/campground')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')
const multer = require('multer')
const { storage } = require('../cloudinary') // why have'nt we mentioned '/index' here
const upload = multer({ storage })


router.get('/', catchAsync(campground.index))

router.get('/new', isLoggedIn, campground.renderNewForm)

router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campground.createCampground))
// router.post('/', upload.array('image'), (req, res) => {  // upload.single - for uploading single file && upload.array for uploading multiple files and also we have to use 'multiple' attribute in input tag.
//     console.log(req.body, req.files) // if we are using upload.array then it will be save on 'req.files' not 'req.file'
//     res.send('It worked')
// })

router.get('/:id', catchAsync(campground.showCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campground.renderEditForm))

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campground.updateCampground))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campground.deleteCampground))

module.exports = router
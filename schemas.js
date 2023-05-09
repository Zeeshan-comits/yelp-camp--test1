const BaseJoi = require('joi')
const sanitizeHtml = require('sanitize-html')

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages : {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules : {            
        escapeHTML : {    // here we have defined an extension in 'joi.string' called 'escapeHTML' so that we can use in our string properties as a validator which will not accept any html tags or scripts/ special character
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if(clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean
            }
        }
    }
})
const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({ //this is not mongoose validation, this is validation on the server side, So, even if someone tries to send invalid request through postman/hopscotch then these validations from joi will cathch it and throw error.
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        Description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML(),
    }).required()
})

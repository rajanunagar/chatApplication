const Joi = require('joi');

const userSchema = Joi.object({  
      username: Joi.string()
            .max(50)
            .required()
            .min(5)
            .messages({
                  'string.base': 'Username should be a type of string',
                  'string.empty': 'Username cannot be an empty field',
                  'string.email': 'Username must be a valid email address',
                  'string.max': 'Username should have a maximum length of 50',
                  'any.required': 'Username is a required field',
                  'string.min': 'Name should have a minimum length of 5',
            }),

      password: Joi.string()
            .required()
            .messages({
                  'string.base': 'Password should be a type of string',
                  'string.empty': 'Password cannot be an empty field',
                  'any.required': 'Password is a required field',
            })
});

module.exports = userSchema;

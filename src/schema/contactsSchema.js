import Joi from 'joi';

const contactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .min(3)
    .max(20)
    .required(),
  isFavourite: Joi.boolean().required(),
  contactType: Joi.string()
    .valid('home', 'work', 'personal')
    .required(),
});

const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  email: Joi.string().email(),
  phoneNumber: Joi.string().min(3).max(20),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid(
    'home',
    'work',
    'personal',
  ),
}).min(1);

export { contactSchema, updateContactSchema };

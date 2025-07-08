import Joi from 'joi';

export const contactSchema = Joi.object({
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

export const updateContactSchema =
  contactSchema.fork(
    ['name', 'phoneNumber', 'contactType'],
    (field) => field.optional(),
  );

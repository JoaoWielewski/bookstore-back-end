import Joi from 'joi';

const bookSchema = Joi.object({
  name: Joi.string().max(100).required(),
  price: Joi.number().required(),
  imgSrc: Joi.string().max(300).required(),
  description: Joi.string().max(1000).required(),
});

export default bookSchema;

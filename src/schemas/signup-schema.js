import Joi from 'joi';

const signupSchema = Joi.object({
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(6).max(20).required(),
  confirmPassword: Joi.ref('password'),
});

export default signupSchema;

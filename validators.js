const joi = require('joi');

const movieSchema = joi.object({
  title: joi.string().max(255).required(),
  director: joi.string().max(255).required(),
  year: joi.string().max(255).alphanum().required(),
  color: joi.boolean().required(),
  duration: joi.number().integer().required(),
});

const validateMovie = (req, res, next) => {
  const { title, director, year, color, duration } = req.body;

  const { error } = movieSchema.validate(
    { title, director, year, color, duration },
    { abortEarly: false }
  );

  if (error) {
    res.status(422).json({ validationErrors: error.details });
  } else {
    next();
  };
};

const userSchema = joi.object({
  firstname: joi.string().max(255).required(),
  lastname: joi.string().max(255).required(),
  email: joi.string().email().required(),
  city: joi.string().max(255),
  language: joi.string().max(255),
});

const validateUser = (req, res, next) => {
  const { firstname, lastname, email, city, language } = req.body;

  const { error } = userSchema.validate(
    { firstname, lastname, email, city, language },
    { abortEarly: false }
  );

  if (error) {
    res.status(422).json({ validationErrors: error.details });
  } else {
    next();
  }
};

const validateUniqueEmail = (req, res, next) => {
  const { email } = req.body
  database
    .query('select email from users where email = ?', [email])
    .then(([email]) => {
      if (email.length !== 0) {
        console.log(email);
        res.status(422).send('Email must be unique');
      } else {
        next();
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Database error');
    });
};

module.exports = {
  validateUser,
  validateMovie,
  validateUniqueEmail
};

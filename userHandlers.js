const database = require("./database");
const joi = require("joi");

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

const getUsers = (req, res) => {
  database
    .query("select * from users")
    .then(([users]) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};

const getUserById = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("select * from users where id = ?", [id])
    .then(([users]) => {
      if (users[0] != null) {
        res.json(users[0]);
      } else {
        res.status(404).send("Not Found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};

const postUser = (req, res) => {
  const { firstname, lastname, email, city, language } = req.body;

  database
    .query(
      "insert into users (firstname, lastname, email, city, language) values (?, ?, ?, ?, ?)",
      [firstname, lastname, email, city, language]
    )
    .then(([result]) => {
      res.location(`/api/users/${result.insertId}`).sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving the user");
    });
};

const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { firstname, lastname, email, city, language } = req.body;

  database
    .query(
      "update users set firstname = ?, lastname = ?, email = ?, city = ?, language = ?",
      [firstname, lastname, email, city, language]
    )
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.status(404).send("Not Found");
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error editing the user");
    });
};

module.exports = {
  getUsers,
  getUserById,
  postUser,
  updateUser,
  validateUser,
  validateUniqueEmail
};

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/secrets');

const Users = require('../users/users-model');


function validUser(req, res, next) {
  if (!req.body.username || !req.body.password) {
    res.status(400).json({ message: 'username and password required' });
  } else {
    next();
  }
}

async function uniqueUser(req, res, next) {
  const { username } = req.body;
  const userExists = await Users.getBy({ username });

  if (userExists.length) {
    res.status(409).json({ message: 'username taken'})
  } else {
    next();
  }
}

router.post('/register', validUser, uniqueUser, (req, res) => {
  const credentials = req.body;
  const hash = bcrypt.hashSync(credentials.password, 12);
  credentials.password = hash;

  Users.add(credentials)
    .then(user => {
      res.status(201).json(user);
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    })

});

router.post('/login', validUser, (req, res) => {
  const { username, password } = req.body;

  Users.getBy({ username: username })
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({ message: `Welcome, ${username}`, token: token })
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  };
  const options = {
    expiresIn: "1d"
  };
  return jwt.sign(payload, jwtSecret, options)
}

module.exports = router;

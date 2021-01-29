const { jwtSecret } = require('../../config/secrets');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        res.status(401).json({ message: 'token invalid' });
      } else {
        req.decodedJwt = decoded;
        next();
      }
    })
  }
};

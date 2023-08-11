var userSchemas = require('../models/userModel');

const loadUserMiddleware = async (req, res, next) => {
    if (req.session.loggedIn && req.session.userId) {
      try {
        const user = await userSchemas.users.findById(req.session.userId);
        if (user) {
          req.user = user;
        }
        next();
      } catch (err) {
        next(err);
      }
    } else {
      req.user = null;
      next();
    }
};

module.exports = loadUserMiddleware;
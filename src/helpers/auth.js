const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url
  req.flash('error_msg', 'Not Authorized.');
  res.redirect('/users/signin');
};

module.exports = helpers;

const router = require('express').Router();
const passport = require('passport');

// Models
const User = require('../models/User');
const Order = require('../models/order');
const Cart = require('../models/cart');

router.get('/users/profile', (req, res) => {
  Order.find({user: req.user}, function(err, orders){
    if (err) {
      return res.write('error');
    }
    var cart;
    orders.forEach(function(order){
      cart=new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render('users/profile', { orders: orders});
  })
  
});

router.get('/users/signup', (req, res) => {
  res.render('users/signup');
});

router.post('/users/signup', async (req, res) => {
  let errors = [];
  const { name, email, password, confirm_password } = req.body;
  if(password != confirm_password) {
    errors.push({text: 'Passwords do not match.'});
  }
  if(password.length < 4) {
    errors.push({text: 'Passwords must be at least 4 characters.'})
  }
  if(errors.length > 0){
    res.render('users/signup', {errors, name, email, password, confirm_password});
  } else {
    // Look for email coincidence
    const emailUser = await User.findOne({email: email});
    if(emailUser) {
      req.flash('error_msg', 'The Email is already in use.');
      res.redirect('/users/signup');
    } else {
      // Saving a New User
      const newUser = new User({name, email, password});
      newUser.password = await newUser.encryptPassword(password);
      await newUser.save();
      req.flash('success_msg', 'You are registered.');
      res.redirect('/users/signin');
    }
  }
});

router.post('/users/signup', passport.authenticate('local', {
  //successRedirect: '/notes',
  failureRedirect: '/users/signup',
  failureFlash: true
}), function (req, res, next){
  if(req.session.oldUrl){
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  }else{
    res.redirect('/users/profile');
  }
}
);


router.get('/users/signin', (req, res) => {
  res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local', {
  //successRedirect: '/notes',
  failureRedirect: '/users/signin',
  failureFlash: true
}), function (req, res, next){
  if(req.session.oldUrl){
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    res.redirect(oldUrl);
  }else{
    res.redirect('/users/profile');
  }
});


router.get('/users/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out now.');
  res.redirect('/users/signin');
});

module.exports = router;
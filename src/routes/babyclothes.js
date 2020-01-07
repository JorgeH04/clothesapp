const express = require('express');
const router = express.Router();

const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const { randomNumber } = require('../helpers/libs');
const { isAuthenticated } = require('../helpers/auth');

const Baby = require('../models/baby');
const Cart = require('../models/cart');
const Order = require('../models/order');

//backend

router.get('/babyimages/:image_id', async (req, res) => {
    const babyimgs = await Baby.findOne({filename: { $regex: req.params.image_id }});
    res.render('baby/babybackend', {babyimgs});
  });

  router.get('/babyclothes/add', async (req, res) => {
    const babyclothes = await Baby.find();
    res.render('baby/new-baby', { babyclothes });
  
  });


  //Front

  router.get('/babyindex', async (req, res) => {
    const babyclothes = await Baby.find();
    res.render('baby/baby', { babyclothes });
  });


  router.get('/babyRedirect/:image_id', async (req, res) => {
    const babyimgs = await Baby.findOne({filename: { $regex: req.params.image_id }});
    res.render('baby/babyRedirect', {babyimgs});
  });
  


  router.post('/babyimages',  async (req, res) => {
    const imgUrl = randomNumber();
    const imageTempPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const targetPath = path.resolve(`src/public/upload/${imgUrl}${ext}`);

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
        await fs.rename(imageTempPath, targetPath);
        const newClothe = new Baby({
            product: req.body.product,
            price: req.body.price,
            filename: imgUrl + ext
          });
          const imageSaved = await newClothe.save();
          res.redirect('/babyRedirect/' + imgUrl);
        } else {
            await fs.unlink(imageTempPath);
            res.status(500).json({ error: 'Only Images are allowed' });
          
        }
    });
   


// Delete Notes
router.delete('/babyimages/:image_id', async (req, res) => {
    const babyimage = await Baby.findOne({filename: {$regex: req.params.image_id}});
    if (babyimage) {
      await fs.unlink(path.resolve('./src/public/upload/' + babyimage.filename));
      await babyimage.remove();
      res.json(true);
    } else {
      res.json({response: 'Bad Request.'})
    }
  
  });
  

  router.get('/addtocard/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});
  
    Baby.findById(productId, function(err, product){
      if(err){
        return res-redirect('/');
      }
      cart.add(product, product.id);
      req.session.cart = cart;
      console.log(req.session.cart);
      res.redirect('/shopcart');
  
    });
  });
  



  


  

  router.get('/reduce/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
  
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopcart');
  });
  
  router.get('/remove/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
  
    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopcart');
  });
  
  
  router.get('/shopcart', function (req, res, next){
    if(!req.session.cart){
      return res.render('/', {products:null})
    }
    var cart = new Cart(req.session.cart);
    res.render('clothes/shopcart', {products: cart.generateArray(), totalPrice: cart.totalPrice})
  });
  
  
  router.get('/checkout',isAuthenticated, function (req, res, next){
    
    var cart = new Cart(req.session.cart);
    res.render('clothes/checkout', {total: cart.totalPrice})
  });
  
  
  router.post('/checkout', isAuthenticated, async (req, res, next)=>{
    if(!req.session.cart){
      return res.render('/', {products:null})
    }
    const cart = new Cart(req.session.cart);
  
    const order = new Order({
      user: req.user,
      cart: cart,
      color:req.body.color,
      talle: req.body.talle,
      address: req.body.address,
      name: req.body.name
  
    });
    await order.save();
    req.flash('success_msg', 'Note Added Successfully');
    res.redirect('/clothes');
    
  })


  module.exports = router;
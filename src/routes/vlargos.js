const express = require('express');
const router = express.Router();

const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const { randomNumber } = require('../helpers/libs');
const { isAuthenticated } = require('../helpers/auth');

const Vlargos = require('../models/vlargos');
const Cart = require('../models/cart');
const Order = require('../models/order');

//backend

router.get('/vlargosimages/:image_id', async (req, res) => {
    const vlargosimgs = await Vlargos.findOne({filename: { $regex: req.params.image_id }});
    res.render('vlargos/vlargosbackend', {vlargosimgs});
  });

  router.get('/vlargosclothes/add', async (req, res) => {
    const vlargosclothes = await Vlargos.find();
    res.render('vlargos/new-vlargos', { vlargosclothes });
  
  });


  //Front

  router.get('/vlargosindex', async (req, res) => {
    const vlargosclothes = await Vlargos.find();
    res.render('vlargos/vlargos', { vlargosclothes });
  });


  router.get('/vlargosRedirect/:image_id', async (req, res) => {
    const vlargosimgs = await Vlargos.findOne({filename: { $regex: req.params.image_id }});
    res.render('vlargos/vlargosRedirect', {vlargosimgs});
  });
  


  router.post('/vlargosimages',  async (req, res) => {
    const imgUrl = randomNumber();
    const imageTempPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const targetPath = path.resolve(`src/public/upload/${imgUrl}${ext}`);

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
        await fs.rename(imageTempPath, targetPath);
        const newClothe = new Vlargos({
            product: req.body.product,
            color: req.body.color,
            talle: req.body.talle,
            price: req.body.price,
            filename: imgUrl + ext
          });
          const imageSaved = await newClothe.save();
          res.redirect('/vlargosRedirect/' + imgUrl);
        } else {
            await fs.unlink(imageTempPath);
            res.status(500).json({ error: 'Only Images are allowed' });
          
        }
    });
   


// Delete Notes
router.delete('/vlargosimages/:image_id', async (req, res) => {
    const vlargosimage = await Vlargos.findOne({filename: {$regex: req.params.image_id}});
    if (vlargosimage) {
      await fs.unlink(path.resolve('./src/public/upload/' + vlargosimage.filename));
      await vlargosimage.remove();
      res.json(true);
    } else {
      res.json({response: 'Bad Request.'})
    }
  
  });
  

  router.get('/addtocarddd/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});
  
    Vlargos.findById(productId, function(err, product){
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
      address: req.body.address,
      name: req.body.name
  
    });
    await order.save();
    req.flash('success_msg', 'Note Added Successfully');
    res.redirect('/clothes');
    
  })


  module.exports = router;
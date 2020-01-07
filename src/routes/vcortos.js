const express = require('express');
const router = express.Router();

const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const { randomNumber } = require('../helpers/libs');
const { isAuthenticated } = require('../helpers/auth');

const Vcortos = require('../models/image');
const Cart = require('../models/cart');
const Order = require('../models/order');

//Backend

router.get('/vcortosimages/:image_id', async (req, res) => {
    const Vcortosimgs = await Vcortos.findOne({filename: { $regex: req.params.image_id }});
    res.render('vcortosimage', {Vcortosimgs});
  });


  router.get('/vcortosclothes/add', async (req, res) => {
    const remerasclothes = await Vcortos.find();
    res.render('vcortos/new-vcortos', { vcortosclothes });
  
  });



  //Front

  router.get('/vcortosindex', async (req, res) => {
    const vcortosclothes = await Vcortos.find();
    res.render('vcortos/vcortos', { vcortosclothes });
  });


  router.get('/vcortosRedirect/:image_id', async (req, res) => {
    const vcortosimgs = await Vcortos.findOne({filename: { $regex: req.params.image_id }});
    res.render('vcortos/vcortosRedirect', {vcortosimgs});
  });




  

  router.delete('/images/:image_id', async (req, res) => {
    const image = await Img.findOne({filename: {$regex: req.params.image_id}});
    if (image) {
      await fs.unlink(path.resolve('./src/public/upload/' + image.filename));
      await image.remove();
      res.json(true);
    } else {
      res.json({response: 'Bad Request.'})
    }
  
  });
  

  




  router.post('/vcortosimages',  async (req, res) => {
    const imgUrl = randomNumber();
    const imageTempPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const targetPath = path.resolve(`src/public/upload/${imgUrl}${ext}`);

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
        await fs.rename(imageTempPath, targetPath);
        const newClothe = new Vcortos({
            product: req.body.product,
            price: req.body.price,
            filename: imgUrl + ext,
          });
          const imageSaved = await newClothe.save();
          res.redirect('/vcortosimages/' + imgUrl);
        } else {
            await fs.unlink(imageTempPath);
            res.status(500).json({ error: 'Only Images are allowed' });
          
        }
    });
     

 //Cart   

  router.get('/addtocardd/:id', function(req, res, next){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});
  
    Vcortos.findById(productId, function(err, product){
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
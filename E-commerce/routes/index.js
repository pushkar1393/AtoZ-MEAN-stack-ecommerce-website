//Defining routes of all pages
var express = require('express');
var router = express.Router();
var  Cart= require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');



/* GET home page. */
router.get('/', function(req, res, next) {
    var successMsg =  req.flash('success')[0];

  Product.find(function(err,docs) {
   var productChunks = [];
   var chunkSize = 3;
   for(var i=0;i<docs.length;i+=3){
    productChunks.push(docs.slice(i,i+chunkSize));
   }
   res.render('shop/index', { title: 'Shopping Cart' , products : productChunks ,successMsg : successMsg , noMessages : ! successMsg });
  });
});

router.get('/add-to-cart/:id', function(req, res, next){
 var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(productId, function(err, product) {
if(err) {
    return res.redirect('/');
}
cart.add(product, product.id);
        req.session.cart = cart;

        res.redirect('/');
    });
});

router.get('/reduce/:id', function(req,res,next){

    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/cart');

});

router.get('/remove/:id', function(req,res,next){

    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/cart');

});

router.get('/cart', function(req, res, next){
    if(!req.session.cart){
        return res.render('shop/cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});

});

router.get('/product/:id', function(req, res, next){
    var id = req.params.id;

    Product.findById(id, function(err, product) {
        if(err) {
            return res.redirect('/');
        }
        res.render('product/product',{product : product});
    });


});

router.get('/contact', function (req, res, next) {
    res.render('company/contact' );
});

router.get('/locate', function (req, res, next) {
    res.render('company/locate' );
});

router.get('/men', function (req, res, next) {
    res.render('category/men' );
});

router.post('/contact', function (req, res, next) {
    res.render('company/contact' );
});


router.get('/checkout',isLoggedIn, function(req, res, next){
    if(!req.session.cart){
        return res.redirect('/cart');
    }
    var cart = new Cart(req.session.cart);

    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {products: cart.generateArray(),totalPrice: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});


router.post('/checkout' ,isLoggedIn, function(req, res, next){

    if(!req.session.cart){
        return res.redirect('/cart');
    }
    var cart = new Cart(req.session.cart);
    var stripe = require("stripe")(
        "sk_test_Jp8PAxIHf2V9TkU57GDvtbKz"
    );


    stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test Charge"
    }, function(err, charge) {
        // asynchronously called
        if(err){
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
         order.save(function(err,result){
             req.flash('success','Successfully bought the product');
             req.session.cart = null;
             res.redirect('/');
         });

    });
});


module.exports = router;

function isLoggedIn(req, res, next){
    if (!req.isAuthenticated()) {
        req.session.oldUrl = req.url;
        return res.redirect('/user/signin');
    }
    next();
}

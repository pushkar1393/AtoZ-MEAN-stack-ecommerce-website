//Using product schema and defining products and saving them in mongodb
var Product = require('../models/product');
var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping');

var products = [
    new Product({
    imagePath: "images/product1.jpg",
    title: "Nike Gray",
    description: "Nike Gray",
    price: 10
    }),
    new Product({
        imagePath: "images/product2.jpg",
        title: "Nike Black",
        description: "Nike Black",
        price: 11
    }),
    new Product({
        imagePath: "images/product3.jpg",
        title: "Nike Red",
        description: "Nike Red",
        price: 12
    }),
    new Product({
        imagePath: "images/product4.jpg",
        title: "Bleu Chanel",
        description: "Bleu Chanel",
        price: 13
    }),
    new Product({
        imagePath: "images/product5.jpg",
        title: "Benetton",
        description: "Benetton!",
        price: 14
    }),
    new Product({
        imagePath: "images/product6.jpg",
        title: "Ferrari",
        description: "Ferrari",
        price: 14
        })


];
var done =0;
for(var i=0;i<products.length;i++){
    products[i].save(function(err,results){
        done++;
        if(done===products.length){
            exit();
        }
    });
}

function exit(){
    mongoose.disconnect();
}